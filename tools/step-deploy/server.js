const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { PreDeployCheckError, runPreDeployChecks } = require('./preDeployChecks');

const HOST = process.env.SFTP_UI_HOST || '127.0.0.1';
const PORT = Number(process.env.SFTP_UI_PORT || 3987);
const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(__dirname, 'public');

const EXCLUDED_DIRS = new Set([
  '.git',
  'node_modules',
  'tmp',
  '.idea',
  '.circleci',
  '.github'
]);

const HOST_OPTIONS = [
  'stitchfix-dev-sftp.mdm.stibosystems.com',
  'stitchfix-preprod-sftp.mdm.stibosystems.com',
  'stitchfix-prod-sftp.mdm.stibosystems.com'
];

const ALIAS_OPTIONS = [
  { value: '', label: 'None (Use Host)' },
  {
    value: 'stitchfix-dev-sftp.mdm.stibosystems.com',
    label: 'stitchfix-dev-sftp.mdm.stibosystems.com',
    host: 'stitchfix-dev-sftp.mdm.stibosystems.com'
  },
  {
    value: 'stitchfix-preprod-sftp.mdm.stibosystems.com',
    label: 'stitchfix-preprod-sftp.mdm.stibosystems.com',
    host: 'stitchfix-preprod-sftp.mdm.stibosystems.com'
  },
  {
    value: 'stitchfix-prod-sftp.mdm.stibosystems.com',
    label: 'stitchfix-prod-sftp.mdm.stibosystems.com',
    host: 'stitchfix-prod-sftp.mdm.stibosystems.com'
  }
];

const USERNAME_OPTIONS = ['satalam'];
const DEFAULT_REMOTE_PATH = '/upload/hotfolders/brs';
const DEFAULT_DEPLOY_ROUTE = 'sftp';
const REST_ENV_OPTIONS = ['dev', 'preprod'];
const REST_BASE_URLS = {
  dev: 'https://stitchfix-dev.mdm.stibosystems.com/restapiv2/inbound-integration-endpoints/LocalBRImporter/upload-and-invoke',
  preprod: 'https://stitchfix-preprod.mdm.stibosystems.com/restapiv2/inbound-integration-endpoints/LocalBRImporter/upload-and-invoke'
};
const DEFAULT_REST_ENV = 'dev';
const DEFAULT_REST_USERNAME = 'br_test_user';
const DEFAULT_REST_PASSWORD = process.env.STEP_PASSWORD || '';
const DEFAULT_REST_CONTEXT = 'Context1';
const DEFAULT_REST_WORKSPACE = 'Main';

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(text)
  });
  res.end(text);
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html)
  });
  res.end(html);
}

function escapeHtml(input) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function listFilesRecursive(dir, relBase = '') {
  const items = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const item of items) {
    const relPath = relBase ? `${relBase}/${item.name}` : item.name;
    const absPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (EXCLUDED_DIRS.has(item.name)) {
        continue;
      }
      const nested = await listFilesRecursive(absPath, relPath);
      files.push(...nested);
      continue;
    }

    if (!item.isFile()) {
      continue;
    }

    if (relPath.endsWith('.DS_Store')) {
      continue;
    }

    files.push(relPath);
  }

  return files;
}

function isSafeRelativePath(filePath) {
  if (typeof filePath !== 'string' || !filePath.trim()) {
    return false;
  }

  const normalized = path.posix.normalize(filePath.trim());
  if (normalized.startsWith('../') || normalized.includes('/../') || normalized === '..') {
    return false;
  }

  if (path.isAbsolute(normalized)) {
    return false;
  }

  return true;
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT_DIR,
      ...options
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${command} exited with ${code}: ${stderr || stdout}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function fileExists(absPath) {
  try {
    const stat = await fs.promises.stat(absPath);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function createZip(files, zipPath) {
  const args = ['-q', zipPath, ...files];
  await run('zip', args);
}

function buildSftpTarget(config) {
  return `${config.username}@${config.host}`;
}

function buildSftpArgs(config, batchPath) {
  const args = ['-b', batchPath];
  args.push('-P', String(config.port));
  if (config.identityFile) {
    args.push('-i', config.identityFile);
  }

  args.push(buildSftpTarget(config));
  return args;
}

function escapeSftpPath(input) {
  return String(input).replaceAll('"', '\\"');
}

function normalizeRemotePath(input) {
  const trimmed = String(input || '').trim();
  if (!trimmed) {
    return DEFAULT_REMOTE_PATH;
  }
  if (trimmed === '/') {
    return '/';
  }
  return trimmed.replace(/\/+$/, '');
}

function buildRemoteMkdirCommands(remotePath) {
  const normalized = normalizeRemotePath(remotePath);
  if (normalized === '/' || normalized === '.') {
    return [];
  }

  const parts = normalized.split('/').filter(Boolean);
  const isAbsolute = normalized.startsWith('/');
  const commands = [];
  let current = isAbsolute ? '' : '.';

  for (const part of parts) {
    if (isAbsolute) {
      current = `${current}/${part}`;
    } else {
      current = current === '.' ? part : `${current}/${part}`;
    }
    // Prefix with "-" so "already exists" won't abort batch mode.
    commands.push(`-mkdir "${escapeSftpPath(current)}"`);
  }

  return commands;
}

async function uploadZip(zipPath, config) {
  const remotePath = normalizeRemotePath(config.remotePath);
  const remoteFile = `${remotePath}/${path.basename(zipPath)}`;
  const batchLines = [
    ...buildRemoteMkdirCommands(remotePath),
    `put "${escapeSftpPath(zipPath)}" "${escapeSftpPath(remoteFile)}"`
  ];
  const batchContents = `${batchLines.join('\n')}\n`;
  const batchPath = path.join(os.tmpdir(), `sftp-batch-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`);

  await fs.promises.writeFile(batchPath, batchContents, 'utf8');

  try {
    await run('sftp', buildSftpArgs(config, batchPath));
  } finally {
    await fs.promises.unlink(batchPath).catch(() => {});
  }

  return remoteFile;
}

async function uploadFilesDirect(files, config) {
  const remotePath = normalizeRemotePath(config.remotePath);
  const putLines = files.map((file) => {
    const localAbs = path.join(ROOT_DIR, file);
    const remoteFile = `${remotePath}/${path.basename(file)}`;
    return `put "${escapeSftpPath(localAbs)}" "${escapeSftpPath(remoteFile)}"`;
  });
  const batchLines = [...buildRemoteMkdirCommands(remotePath), ...putLines];

  const batchPath = path.join(os.tmpdir(), `sftp-batch-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`);
  await fs.promises.writeFile(batchPath, `${batchLines.join('\n')}\n`, 'utf8');

  try {
    await run('sftp', buildSftpArgs(config, batchPath));
  } finally {
    await fs.promises.unlink(batchPath).catch(() => {});
  }
}

function buildRestUploadUrl(config, fileName) {
  const baseUrl = REST_BASE_URLS[config.restEnvironment];
  const params = new URLSearchParams({
    fileName: fileName || 'unknown',
    context: config.restContext || DEFAULT_REST_CONTEXT,
    workspace: config.restWorkspace || DEFAULT_REST_WORKSPACE
  });
  return `${baseUrl}?${params.toString()}`;
}

async function uploadZipViaRest(zipPath, config) {
  const zipBuffer = await fs.promises.readFile(zipPath);
  const restFileName = config.restFileName || path.basename(zipPath);
  const targetUrl = buildRestUploadUrl(config, restFileName);
  const urlObj = new URL(targetUrl);
  const auth = Buffer.from(`${config.restUsername}:${config.restPassword}`).toString('base64');
  const client = urlObj.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.request({
      method: 'POST',
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: `${urlObj.pathname}${urlObj.search}`,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': zipBuffer.length
      }
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        const statusCode = res.statusCode || 0;
        if (statusCode < 200 || statusCode >= 300) {
          const preview = body.slice(0, 600);
          reject(new Error(`REST upload failed (${statusCode}): ${preview || 'No response body'}`));
          return;
        }
        resolve({ statusCode, body, url: targetUrl });
      });
    });

    req.on('error', reject);
    req.write(zipBuffer);
    req.end();
  });
}

function serveIndex(res) {
  const hostOptionsHtml = HOST_OPTIONS.map((host) => `<option value="${host}">${host}</option>`).join('');
  const aliasOptionsHtml = ALIAS_OPTIONS
    .map((alias) => `<option value="${alias.value}" data-host="${alias.host || ''}">${alias.label}</option>`)
    .join('');
  const usernameOptionsHtml = USERNAME_OPTIONS.map((username) => `<option value="${username}">${username}</option>`).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>STEP Deployer</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <main class="wrap">
    <h1>STEP Deployer</h1>
    <p class="sub">Select files, then upload directly or upload as a zip to STEP hotfolder.</p>

    <section class="card">
      <h2>SFTP Settings</h2>
      <div class="grid">
        <label>Deploy Route
          <select id="deployRoute">
            <option value="sftp">SFTP</option>
            <option value="rest">REST Endpoint</option>
          </select>
        </label>
        <label>SSH Alias
          <select id="alias">${aliasOptionsHtml}</select>
        </label>
        <label>Host
          <select id="host">${hostOptionsHtml}</select>
        </label>
        <label>Port
          <input id="port" type="number" value="22" readonly />
        </label>
        <label>Username
          <select id="username">${usernameOptionsHtml}</select>
        </label>
        <label>Identity File (optional)
          <input id="identityFile" placeholder="~/.ssh/id_rsa" />
        </label>
        <label>Remote Folder
          <input id="remotePath" value="${DEFAULT_REMOTE_PATH}" placeholder="/incoming/step/hotfolder" />
        </label>
        <label>Upload Mode
          <select id="uploadMode">
            <option value="zip">Zip and upload</option>
            <option value="files">Upload selected files directly</option>
          </select>
        </label>
        <label>Zip Name (optional)
          <input id="zipName" placeholder="step-upload.zip" />
        </label>
        <label>REST Environment
          <select id="restEnvironment">
            <option value="dev">dev</option>
            <option value="preprod">preprod</option>
          </select>
        </label>
        <label>REST Username
          <input id="restUsername" value="${DEFAULT_REST_USERNAME}" />
        </label>
        <label>REST Password
          <input id="restPassword" type="password" value="${DEFAULT_REST_PASSWORD}" />
        </label>
        <label>REST Context
          <input id="restContext" value="${DEFAULT_REST_CONTEXT}" />
        </label>
        <label>REST Workspace
          <input id="restWorkspace" value="${DEFAULT_REST_WORKSPACE}" />
        </label>
        <label>REST fileName (optional)
          <input id="restFileName" placeholder="unknown" />
        </label>
      </div>
      <p class="hint">REST route always uploads a zip and invokes LocalBRImporter. Use deploy route selector to switch between SFTP and REST.</p>
    </section>

    <section class="card">
      <h2>File Selection</h2>
      <div class="toolbar">
        <input id="fileNameInput" list="fileSuggestions" placeholder="Type file path to add..." />
        <datalist id="fileSuggestions"></datalist>
        <button id="addFile" type="button">Add File</button>
        <input id="search" placeholder="Filter selected files..." />
        <button id="selectAll" type="button">Select Visible</button>
        <button id="clearAll" type="button">Clear All</button>
        <span id="count">0 selected</span>
      </div>
      <div id="files" class="files"></div>
    </section>

    <section class="card action-row">
      <button id="deploy" type="button">Upload</button>
      <span id="status"></span>
    </section>

    <section class="card">
      <h2>Log</h2>
      <pre id="log"></pre>
    </section>
  </main>
  <script src="/app.js"></script>
</body>
</html>`;
  sendHtml(res, 200, html);
}

async function serveStatic(req, res) {
  const requested = req.url === '/app.js' ? 'app.js' : 'style.css';
  const filePath = path.join(PUBLIC_DIR, requested);

  try {
    const data = await fs.promises.readFile(filePath);
    res.writeHead(200, {
      'Content-Type': requested.endsWith('.js')
        ? 'application/javascript; charset=utf-8'
        : 'text/css; charset=utf-8'
    });
    res.end(data);
  } catch (error) {
    sendText(res, 404, 'Not found');
  }
}

function normalizeConfig(raw) {
  const alias = (raw.alias || '').trim();
  const host = (raw.host || '').trim() || alias;
  return {
    deployRoute: raw.deployRoute === 'rest' ? 'rest' : DEFAULT_DEPLOY_ROUTE,
    alias,
    host,
    port: 22,
    username: (raw.username || '').trim(),
    identityFile: (raw.identityFile || '').trim(),
    remotePath: normalizeRemotePath(raw.remotePath || ''),
    zipName: (raw.zipName || '').trim(),
    uploadMode: raw.uploadMode === 'files' ? 'files' : 'zip',
    restEnvironment: REST_ENV_OPTIONS.includes(raw.restEnvironment) ? raw.restEnvironment : DEFAULT_REST_ENV,
    restUsername: String(raw.restUsername || DEFAULT_REST_USERNAME).trim(),
    restPassword: String(raw.restPassword || DEFAULT_REST_PASSWORD),
    restContext: String(raw.restContext || DEFAULT_REST_CONTEXT).trim(),
    restWorkspace: String(raw.restWorkspace || DEFAULT_REST_WORKSPACE).trim(),
    restFileName: String(raw.restFileName || '').trim()
  };
}

function validateConfig(config, options = {}) {
  if (config.deployRoute === 'rest') {
    if (!REST_ENV_OPTIONS.includes(config.restEnvironment)) {
      return 'Invalid REST environment.';
    }
    if (!config.restUsername || !config.restPassword) {
      return 'REST username and password are required.';
    }
    return null;
  }

  const requireRemotePath = options.requireRemotePath !== false;
  if (requireRemotePath && !config.remotePath) {
    return 'Remote folder is required.';
  }

  if (!USERNAME_OPTIONS.includes(config.username)) {
    return 'Invalid username selected.';
  }

  if (!HOST_OPTIONS.includes(config.host)) {
    return 'Select a valid host.';
  }

  return null;
}

function resolveIdentityFilePath(input) {
  if (!input) {
    return '';
  }

  if (input.startsWith('~/')) {
    return path.join(os.homedir(), input.slice(2));
  }

  return path.resolve(ROOT_DIR, input);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      serveIndex(res);
      return;
    }

    if (req.method === 'GET' && (req.url === '/app.js' || req.url === '/style.css')) {
      await serveStatic(req, res);
      return;
    }

    if (req.method === 'GET' && req.url === '/api/files') {
      const files = (await listFilesRecursive(ROOT_DIR)).sort((a, b) => a.localeCompare(b));
      sendJson(res, 200, { files });
      return;
    }

    if (req.method === 'POST' && req.url === '/api/deploy') {
      const rawBody = await readBody(req);
      const payload = JSON.parse(rawBody || '{}');

      const selected = Array.isArray(payload.files) ? payload.files : [];
      const config = normalizeConfig(payload.config || {});
      const configError = validateConfig(config, { requireRemotePath: true });

      if (configError) {
        sendJson(res, 400, { ok: false, error: configError });
        return;
      }

      const uniqueFiles = Array.from(new Set(selected.map((value) => String(value).trim())));
      if (!uniqueFiles.length) {
        sendJson(res, 400, { ok: false, error: 'Select at least one file.' });
        return;
      }

      for (const file of uniqueFiles) {
        if (!isSafeRelativePath(file)) {
          sendJson(res, 400, { ok: false, error: `Invalid path: ${escapeHtml(file)}` });
          return;
        }

        const absPath = path.join(ROOT_DIR, file);
        if (!absPath.startsWith(ROOT_DIR)) {
          sendJson(res, 400, { ok: false, error: `Invalid path: ${escapeHtml(file)}` });
          return;
        }

        const exists = await fileExists(absPath);
        if (!exists) {
          sendJson(res, 400, { ok: false, error: `File not found: ${escapeHtml(file)}` });
          return;
        }
      }

      if (config.deployRoute === 'sftp') {
        config.identityFile = resolveIdentityFilePath(config.identityFile);
        if (config.identityFile) {
          const keyExists = await fileExists(config.identityFile);
          if (!keyExists) {
            sendJson(res, 400, { ok: false, error: `Identity file not found: ${config.identityFile}` });
            return;
          }
        }
      }

      try {
        await runPreDeployChecks(ROOT_DIR);
      } catch (error) {
        if (error instanceof PreDeployCheckError) {
          sendJson(res, 400, {
            ok: false,
            error: error.message,
            details: error.details
          });
          return;
        }
        throw error;
      }

      if (config.deployRoute === 'rest') {
        const safeZipName = (config.zipName || `step-upload-${Date.now()}.zip`).replace(/[^a-zA-Z0-9._-]/g, '_');
        const zipPath = path.join(os.tmpdir(), safeZipName.endsWith('.zip') ? safeZipName : `${safeZipName}.zip`);
        await createZip(uniqueFiles, zipPath);
        const restResult = await uploadZipViaRest(zipPath, config);
        await fs.promises.unlink(zipPath).catch(() => {});

        sendJson(res, 200, {
          ok: true,
          fileCount: uniqueFiles.length,
          mode: 'rest',
          deployRoute: 'rest',
          uploadedTo: restResult.url,
          statusCode: restResult.statusCode
        });
        return;
      }

      if (config.uploadMode === 'files') {
        await uploadFilesDirect(uniqueFiles, config);
        sendJson(res, 200, {
          ok: true,
          uploadedTo: config.remotePath,
          fileCount: uniqueFiles.length,
          mode: 'files'
        });
        return;
      }

      const safeZipName = (config.zipName || `step-upload-${Date.now()}.zip`).replace(/[^a-zA-Z0-9._-]/g, '_');
      const zipPath = path.join(os.tmpdir(), safeZipName.endsWith('.zip') ? safeZipName : `${safeZipName}.zip`);

      await createZip(uniqueFiles, zipPath);
      const remoteFile = await uploadZip(zipPath, config);
      await fs.promises.unlink(zipPath).catch(() => {});

      sendJson(res, 200, {
        ok: true,
        zip: zipPath,
        uploadedTo: remoteFile,
        fileCount: uniqueFiles.length,
        mode: 'zip'
      });
      return;
    }

    sendText(res, 404, 'Not found');
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`SFTP uploader UI running on http://${HOST}:${PORT}`);
});

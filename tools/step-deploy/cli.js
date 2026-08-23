#!/usr/bin/env node
'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const { PreDeployCheckError, runPreDeployChecksSync } = require('./preDeployChecks');

const ROOT_DIR = process.cwd();

const REST_BASE_URLS = {
  dev: 'https://stitchfix-dev.mdm.stibosystems.com/restapiv2/inbound-integration-endpoints/LocalBRImporter/upload-and-invoke',
  preprod: 'https://stitchfix-preprod.mdm.stibosystems.com/restapiv2/inbound-integration-endpoints/LocalBRImporter/upload-and-invoke'
};

const SFTP_HOSTS = {
  dev: 'stitchfix-dev-sftp.mdm.stibosystems.com',
  preprod: 'stitchfix-preprod-sftp.mdm.stibosystems.com'
};

const DEFAULT_REMOTE_PATH = '/upload/hotfolders/brs';
const DEFAULT_REST_USERNAME = 'br_test_user';
const DEFAULT_REST_CONTEXT = 'Context1';
const DEFAULT_REST_WORKSPACE = 'Main';
const SFTP_USERNAME = 'satalam';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--') && i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
      args[arg.slice(2)] = argv[i + 1];
      i++;
    } else if (arg.startsWith('--')) {
      args[arg.slice(2)] = true;
    }
  }
  return args;
}

function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

function extractBusinessRuleSetupGroups(absPath) {
  const content = fs.readFileSync(absPath, 'utf8');
  const match = content.match(/\/\*===== business rule definition =====\s*([\s\S]*?)\*\//);
  if (!match) return [];

  try {
    const metadata = JSON.parse(match[1].trim());
    return Array.isArray(metadata.setupGroups) ? metadata.setupGroups.filter(Boolean) : [];
  } catch (err) {
    throw new Error(`Failed to parse business rule definition JSON in ${normalizePath(path.relative(ROOT_DIR, absPath))}: ${err.message}`);
  }
}

function extractBusinessRuleExportMetadata(absPath) {
  const content = fs.readFileSync(absPath, 'utf8');
  const match = content.match(/\/\*===== export metadata =====\s*([\s\S]*?)\*\//);
  if (!match) {
    throw new Error(`Missing export metadata block in ${normalizePath(path.relative(ROOT_DIR, absPath))}`);
  }

  try {
    return JSON.parse(match[1].trim());
  } catch (err) {
    throw new Error(`Failed to parse export metadata JSON in ${normalizePath(path.relative(ROOT_DIR, absPath))}: ${err.message}`);
  }
}

function extractXmlRootContextId(absPath) {
  const content = fs.readFileSync(absPath, 'utf8');
  const match = content.match(/<STEP-ProductInformation\b[^>]*\bContextID="([^"]*)"/);
  if (!match) return null;
  return match[1];
}

function validateBusinessRuleSetupGroups(files) {
  const normalizedFiles = new Set(files.map(normalizePath));
  const errors = [];

  files.forEach((file) => {
    const normalizedFile = normalizePath(file);
    if (!normalizedFile.startsWith('step-configs/BusinessRule/') || !normalizedFile.endsWith('.js')) {
      return;
    }

    const absPath = path.join(ROOT_DIR, file);
    const setupGroups = extractBusinessRuleSetupGroups(absPath);

    setupGroups.forEach((groupId) => {
      const setupGroupFile = normalizePath(`step-configs/SetupGroup/SetupGroup_${groupId}.xml`);
      if (!fs.existsSync(path.join(ROOT_DIR, setupGroupFile))) {
        errors.push(
          `Missing SetupGroup file for "${groupId}" used by ${normalizedFile}: ${setupGroupFile}`
        );
        return;
      }
      if (!normalizedFiles.has(setupGroupFile)) {
        errors.push(
          `SetupGroup file not included in deploy for "${groupId}" used by ${normalizedFile}: add ${setupGroupFile} to --files`
        );
      }
    });
  });

  return errors;
}

function validateContextIds(files) {
  const errors = [];

  files.forEach((file) => {
    const normalizedFile = normalizePath(file);
    const absPath = path.join(ROOT_DIR, file);

    if (normalizedFile.startsWith('step-configs/BusinessRule/') && normalizedFile.endsWith('.js')) {
      const metadata = extractBusinessRuleExportMetadata(absPath);
      const contextId = metadata && metadata.contextId;

      if (contextId !== 'Context1') {
        errors.push(
          `Invalid contextId in ${normalizedFile}: expected "Context1", found "${contextId == null ? '' : contextId}"`
        );
      }
      return;
    }

    if (normalizedFile.startsWith('step-configs/') && normalizedFile.endsWith('.xml')) {
      const contextId = extractXmlRootContextId(absPath);
      if (contextId !== null && contextId !== 'Context1') {
        errors.push(
          `Invalid ContextID in ${normalizedFile}: expected "Context1", found "${contextId}"`
        );
      }
    }
  });

  return errors;
}

function createZip(files, zipPath) {
  const quotedFiles = files.map(f => `"${f.replace(/"/g, '\\"')}"`).join(' ');
  execSync(`zip -q "${zipPath}" ${quotedFiles}`, { cwd: ROOT_DIR });
}

function generateDataModelIndex() {
  console.log('Generating docs/data-model-index.md...');
  execSync('npm run generate-data-model-index', { cwd: ROOT_DIR, stdio: 'inherit' });
}

function uploadZipViaRest(zipPath, { env, username, password, context, workspace }) {
  const baseUrl = REST_BASE_URLS[env];
  const zipBuffer = fs.readFileSync(zipPath);
  const params = new URLSearchParams({
    fileName: path.basename(zipPath),
    context: context || DEFAULT_REST_CONTEXT,
    workspace: workspace || DEFAULT_REST_WORKSPACE
  });
  const url = new URL(`${baseUrl}?${params}`);
  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  const client = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.request({
      method: 'POST',
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': zipBuffer.length
      }
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`REST upload failed (${res.statusCode}): ${body.slice(0, 600)}`));
          return;
        }
        resolve({ statusCode: res.statusCode, body, url: url.toString() });
      });
    });
    req.on('error', reject);
    req.write(zipBuffer);
    req.end();
  });
}

function uploadViaSftp(files, { env, identityFile, remotePath }) {
  const host = SFTP_HOSTS[env];
  if (!host) throw new Error(`Unknown SFTP env: ${env}`);

  const remote = (remotePath || DEFAULT_REMOTE_PATH).replace(/\/+$/, '');
  const parts = remote.split('/').filter(Boolean);
  const mkdirLines = parts.map((_, i) => `-mkdir "/${parts.slice(0, i + 1).join('/')}"`);
  const putLines = files.map(f => {
    const abs = path.join(ROOT_DIR, f);
    return `put "${abs}" "${remote}/${path.basename(f)}"`;
  });

  const batchPath = path.join(os.tmpdir(), `sftp-batch-${Date.now()}.txt`);
  fs.writeFileSync(batchPath, [...mkdirLines, ...putLines].join('\n') + '\n', 'utf8');

  const sftpArgs = ['-b', batchPath, '-P', '22'];
  if (identityFile) {
    const resolved = identityFile.startsWith('~/') ? path.join(os.homedir(), identityFile.slice(2)) : identityFile;
    sftpArgs.push('-i', resolved);
  }
  sftpArgs.push(`${SFTP_USERNAME}@${host}`);

  try {
    execSync(['sftp', ...sftpArgs.map(a => `"${a}"`)].join(' '), { cwd: ROOT_DIR, stdio: 'inherit' });
  } finally {
    fs.unlinkSync(batchPath);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const route = args.route || 'rest';
  const env = args.env || 'dev';
  const filesArg = args.files;

  if (!filesArg) {
    console.error('Usage: npm run step-deploy -- --route rest|sftp --env dev|preprod --files "path/to/BR.js"');
    process.exit(1);
  }

  const files = filesArg.split(',').map(f => f.trim()).filter(Boolean);
  if (!files.length) {
    console.error('No files specified.');
    process.exit(1);
  }

  for (const f of files) {
    if (!fs.existsSync(path.join(ROOT_DIR, f))) {
      console.error(`File not found: ${f}`);
      process.exit(1);
    }
  }

  const setupGroupErrors = validateBusinessRuleSetupGroups(files);
  if (setupGroupErrors.length) {
    console.error('SetupGroup precheck failed:');
    setupGroupErrors.forEach((msg) => console.error(`  - ${msg}`));
    process.exit(1);
  }

  const contextIdErrors = validateContextIds(files);
  if (contextIdErrors.length) {
    console.error('ContextID precheck failed:');
    contextIdErrors.forEach((msg) => console.error(`  - ${msg}`));
    process.exit(1);
  }

  generateDataModelIndex();

  console.log('Running pre-deploy test and coverage checks...');
  runPreDeployChecksSync(ROOT_DIR);
  console.log('Pre-deploy test and coverage checks passed.');

  console.log(`Deploying ${files.length} file(s) to ${env} via ${route}...`);
  files.forEach(f => console.log(`  ${f}`));

  if (route === 'rest') {
    const password = process.env.STEP_PASSWORD || '';
    if (!password) {
      console.error('ERROR: STEP_PASSWORD environment variable is not set.');
      process.exit(1);
    }
    if (!REST_BASE_URLS[env]) {
      console.error(`ERROR: REST not supported for env "${env}". Use dev or preprod.`);
      process.exit(1);
    }

    const zipPath = path.join(os.tmpdir(), `step-deploy-${Date.now()}.zip`);
    createZip(files, zipPath);

    try {
      const result = await uploadZipViaRest(zipPath, {
        env,
        username: DEFAULT_REST_USERNAME,
        password,
        context: DEFAULT_REST_CONTEXT,
        workspace: DEFAULT_REST_WORKSPACE
      });
      console.log(`Success (${result.statusCode}): deployed to ${env}`);
    } finally {
      if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    }
  } else if (route === 'sftp') {
    uploadViaSftp(files, { env, identityFile: args['identity-file'], remotePath: args['remote-path'] });
    console.log(`Success: deployed to ${env} via SFTP`);
  } else {
    console.error(`Unknown route: "${route}". Use rest or sftp.`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Deploy failed:', err.message);
  if (err instanceof PreDeployCheckError && err.details) {
    console.error(err.details);
  }
  process.exit(1);
});

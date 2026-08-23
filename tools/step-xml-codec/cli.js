#!/usr/bin/env node
/**
 * tools/step-xml-codec/cli.js
 *
 * Decode / encode gzip+Base64 blobs embedded in STEP XML config files.
 * Any XML element whose text content begins with "H4sI" (gzip magic in Base64)
 * is treated as a decodable blob — no hardcoded tag names needed.
 *
 * Supported file types:
 *   STEPWorkflow_*.xml
 *   GatewayIntegrationEndpoint_*.xml
 *   EventProcessor_*.xml
 *   InBoundIntegrationEndpoint_*.xml
 *   OutBoundIntegrationEndpoint_*.xml
 *   (any other STEP XML file with H4sI blobs)
 *
 * Commands:
 *   list   <file>
 *   decode <file> [--tag <tagName>] [--index <n>] [--out <dir>] [--show-comment]
 *   encode <file> --tag <tagName> --index <n> --from <config-file> [--out-file <path>]
 *
 * Each blob is identified by its tag name and a 0-based index (order of
 * appearance in the file). Use "list" to discover tag names and indices.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ---------------------------------------------------------------------------
// Codec
// ---------------------------------------------------------------------------

function decode(b64) {
  return zlib.gunzipSync(Buffer.from(b64.trim(), 'base64')).toString('utf-8');
}

function encode(text) {
  return zlib.gzipSync(Buffer.from(text, 'utf-8')).toString('base64');
}

// ---------------------------------------------------------------------------
// Parser — finds every <Tag>H4sI...</Tag> in the file
// ---------------------------------------------------------------------------

/**
 * Walk backwards from `pos` in `content` to find the nearest ancestor element
 * that has an ID attribute, returning "TagName#IDValue" or null.
 */
function nearestParentId(content, pos) {
  const snippet = content.slice(0, pos);
  const m = snippet.match(/.*<([\w.:-]+)\s[^>]*\bID="([^"]+)"/s);
  return m ? `${m[1]}#${m[2]}` : null;
}

/**
 * Returns all blobs in the file as:
 * { tag, index, b64, decoded?, comment?, parent, start, end }
 * `start`/`end` are character offsets of the full <Tag>...</Tag> match.
 */
function findBlobs(content, wantDecoded) {
  const blobRe  = /<([\w.:-]+)>\s*(H4sI[A-Za-z0-9+/\r\n]+=*)\s*<\/\1>/g;
  const tagCount = {};
  const blobs   = [];

  let m;
  while ((m = blobRe.exec(content)) !== null) {
    const tag = m[1];
    const b64 = m[2].replace(/\s/g, '');
    const idx = tagCount[tag] = (tagCount[tag] ?? -1) + 1;

    // Look for a <!-- Definition: ... --> comment immediately before this blob
    const before   = content.slice(Math.max(0, m.index - 2000), m.index);
    const commentM = before.match(/<!--\s*Definition:([\s\S]*?)-->\s*$/);
    const comment  = commentM ? commentM[1].trim() : null;

    const parent = nearestParentId(content, m.index);

    const blob = { tag, index: idx, b64, parent, start: m.index, end: m.index + m[0].length, comment };
    if (wantDecoded) {
      try   { blob.decoded = decode(b64); }
      catch (e) { blob.decoded = `[decode error: ${e.message}]`; }
    }
    blobs.push(blob);
  }
  return blobs;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdList(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const blobs   = findBlobs(content, false);

  if (!blobs.length) {
    console.log('No gzip+Base64 blobs found.');
    return;
  }

  const tagW = Math.max(...blobs.map(b => b.tag.length + 3), 10); // +3 for [n]
  console.log(`${'Blob'.padEnd(tagW)}  Parent`);
  console.log(`${'─'.repeat(tagW)}  ${'─'.repeat(55)}`);
  blobs.forEach(b => {
    const label = `${b.tag}[${b.index}]`.padEnd(tagW);
    console.log(`${label}  ${b.parent ?? '(no ID found)'}`);
  });
  console.log(`\nTotal: ${blobs.length} blob(s)`);
}

function cmdDecode(filePath, opts) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const blobs   = findBlobs(content, true);
  const SEP     = '='.repeat(72);
  let   printed = 0;

  for (const b of blobs) {
    if (opts.tag   !== undefined && opts.tag   !== b.tag)   continue;
    if (opts.index !== undefined && opts.index !== b.index) continue;

    console.log(`\n${SEP}`);
    console.log(`<${b.tag}>[${b.index}]  ${b.parent ?? ''}`);
    console.log(SEP);

    if (opts.showComment && b.comment) {
      console.log('--- Definition comment ---');
      console.log(b.comment);
      console.log();
    }

    console.log(b.decoded);

    if (opts.out) {
      fs.mkdirSync(opts.out, { recursive: true });
      const outFile = path.join(opts.out, `${b.tag}_${b.index}.xml`);
      fs.writeFileSync(outFile, b.decoded, 'utf-8');
      console.log(`  → written to ${outFile}`);
    }

    printed++;
  }

  if (printed === 0) {
    const tagInfo   = opts.tag   !== undefined ? ` tag="${opts.tag}"`     : '';
    const idxInfo   = opts.index !== undefined ? ` index=${opts.index}`   : '';
    console.error(`No blobs matched${tagInfo}${idxInfo}.`);
    process.exit(1);
  }

  if (opts.tag === undefined && opts.index === undefined) {
    console.log(`\n[Total: ${printed} blob(s) decoded]`);
  }
}

function cmdEncode(filePath, opts) {
  if (opts.tag   === undefined) { console.error('--tag is required for encode');   process.exit(1); }
  if (opts.index === undefined) { console.error('--index is required for encode'); process.exit(1); }
  if (!opts.from)               { console.error('--from is required for encode');  process.exit(1); }

  const content = fs.readFileSync(filePath, 'utf-8');
  const blobs   = findBlobs(content, false);
  const blob    = blobs.find(b => b.tag === opts.tag && b.index === opts.index);

  if (!blob) {
    console.error(`No blob found: tag="${opts.tag}" index=${opts.index}`);
    console.error('Run "list" to see available blobs.');
    process.exit(1);
  }

  const newText    = fs.readFileSync(opts.from, 'utf-8');
  const newB64     = encode(newText);
  const newElement = `<${blob.tag}>${newB64}</${blob.tag}>`;
  const updated    = content.slice(0, blob.start) + newElement + content.slice(blob.end);

  const outPath = opts.outFile || filePath;
  fs.writeFileSync(outPath, updated, 'utf-8');
  console.log(`Re-encoded <${blob.tag}>[${blob.index}] → ${outPath}`);
}

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------

function parseArgs() {
  const raw     = process.argv.slice(2);
  const command = raw[0];
  const file    = raw[1];
  const opts    = {};

  for (let i = 2; i < raw.length; i++) {
    switch (raw[i]) {
      case '--tag':          opts.tag         = raw[++i];                break;
      case '--index':        opts.index       = parseInt(raw[++i], 10); break;
      case '--out':          opts.out         = raw[++i];                break;
      case '--out-file':     opts.outFile     = raw[++i];                break;
      case '--from':         opts.from        = raw[++i];                break;
      case '--show-comment': opts.showComment = true;                    break;
      default: console.warn(`Unknown flag: ${raw[i]}`);
    }
  }

  return { command, file, opts };
}

function usage() {
  console.log(`
STEP XML Codec — decode/encode gzip+Base64 blobs in STEP XML config files.

Usage:
  node tools/step-xml-codec/cli.js list   <file>
  node tools/step-xml-codec/cli.js decode <file> [--tag <name>] [--index <n>] [--out <dir>] [--show-comment]
  node tools/step-xml-codec/cli.js encode <file> --tag <name> --index <n> --from <file> [--out-file <path>]

Supported files:
  STEPWorkflow_*.xml  GatewayIntegrationEndpoint_*.xml  EventProcessor_*.xml
  InBoundIntegrationEndpoint_*.xml  OutBoundIntegrationEndpoint_*.xml

Examples:
  # List all blobs in a file
  node tools/step-xml-codec/cli.js list "step-configs/STEPWorkflow/STEPWorkflow_ProductAttributionAndApproval.xml"

  # Decode all blobs to stdout
  node tools/step-xml-codec/cli.js decode "step-configs/EventProcessor/EventProcessor_ElasticSearchConfig.xml"

  # Decode a specific blob (tag + index from list output)
  node tools/step-xml-codec/cli.js decode "..." --tag Configuration --index 0

  # Decode all blobs to individual files
  node tools/step-xml-codec/cli.js decode "..." --out /tmp/decoded/

  # Re-encode a modified config back in-place
  node tools/step-xml-codec/cli.js encode "..." --tag Configuration --index 0 --from /tmp/decoded/Configuration_0.xml

  # Re-encode to a new output file
  node tools/step-xml-codec/cli.js encode "..." --tag Configuration --index 0 --from /tmp/decoded/Configuration_0.xml --out-file /tmp/updated.xml
`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const { command, file, opts } = parseArgs();

if (!command || !file) { usage(); process.exit(0); }

switch (command) {
  case 'list':   cmdList(file);          break;
  case 'decode': cmdDecode(file, opts);  break;
  case 'encode': cmdEncode(file, opts);  break;
  default:
    console.error(`Unknown command: ${command}`);
    usage();
    process.exit(1);
}

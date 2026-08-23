#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { XMLParser, XMLValidator } = require('fast-xml-parser');

const ROOT_DIR = process.cwd();
const DEFAULT_TARGET = 'step-configs';

function toRepoRelative(filePath) {
  return path.relative(ROOT_DIR, filePath).split(path.sep).join('/');
}

function isXmlFile(filePath) {
  return filePath.toLowerCase().endsWith('.xml');
}

function walkXmlFiles(startPath, collector) {
  const stat = fs.statSync(startPath);
  if (stat.isFile()) {
    if (isXmlFile(startPath)) {
      collector.push(startPath);
    }
    return;
  }

  const entries = fs.readdirSync(startPath);
  for (const entry of entries) {
    const entryPath = path.join(startPath, entry);
    const entryStat = fs.statSync(entryPath);
    if (entryStat.isDirectory()) {
      walkXmlFiles(entryPath, collector);
    } else if (entryStat.isFile() && isXmlFile(entryPath)) {
      collector.push(entryPath);
    }
  }
}

function resolveTargets(argv) {
  const inputs = argv.length > 0 ? argv : [DEFAULT_TARGET];
  const files = [];

  for (const input of inputs) {
    const resolved = path.resolve(ROOT_DIR, input);
    if (!fs.existsSync(resolved)) {
      continue;
    }
    walkXmlFiles(resolved, files);
  }

  return files.sort();
}

function validateXmlFile(filePath, parser) {
  const xml = fs.readFileSync(filePath, 'utf8');
  const validation = XMLValidator.validate(xml);
  if (validation !== true) {
    const error = validation.err || {};
    return {
      ok: false,
      message: `${toRepoRelative(filePath)}:${error.line || '?'}:${error.col || '?'} ${error.msg || 'Invalid XML'}`
    };
  }

  try {
    parser.parse(xml);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: `${toRepoRelative(filePath)} parse error: ${error.message}`
    };
  }
}

function main() {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    allowBooleanAttributes: true,
    parseTagValue: false,
    parseAttributeValue: false
  });

  const files = resolveTargets(process.argv.slice(2));
  if (!files.length) {
    console.log('No XML files found to validate.');
    return;
  }

  const failures = [];
  for (const filePath of files) {
    const result = validateXmlFile(filePath, parser);
    if (!result.ok) {
      failures.push(result.message);
    }
  }

  if (failures.length) {
    console.error(`XML validation failed: ${failures.length} file(s).`);
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log(`XML validation passed: ${files.length} file(s).`);
}

main();

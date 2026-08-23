#!/usr/bin/env node
/**
 * Generates changelog entries from git log using conventional commit prefixes.
 *
 * Usage:
 *   node tools/generate-changelog.js                          # last 30 days, stdout
 *   node tools/generate-changelog.js --since 2026-03-01       # since date
 *   node tools/generate-changelog.js --since v1.0 --until v2.0  # between refs
 *   node tools/generate-changelog.js --write                  # prepend to CHANGELOG.md
 *   node tools/generate-changelog.js --write --header "2026-04-01"  # with version header
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHANGELOG_PATH = path.join(__dirname, '..', 'CHANGELOG.md');

const PREFIX_MAP = {
  feat: 'Added',
  fix: 'Fixed',
  refactor: 'Changed',
  perf: 'Changed',
  docs: 'Documentation',
  test: 'Testing',
  chore: 'Maintenance',
  sync: 'STEP Sync',
  ci: 'CI/CD',
};

// Order for output sections
const SECTION_ORDER = ['Added', 'Changed', 'Fixed', 'STEP Sync', 'Documentation', 'Testing', 'CI/CD', 'Maintenance', 'Other'];

function parseArgs(argv) {
  var args = {};
  for (var i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--') && i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
      args[argv[i].slice(2)] = argv[i + 1];
      i++;
    } else if (argv[i].startsWith('--')) {
      args[argv[i].slice(2)] = true;
    }
  }
  return args;
}

function getGitLog(since, until) {
  var range = '';
  if (since && until) {
    range = since + '..' + until;
  } else if (since) {
    range = '--since="' + since + '"';
  } else {
    range = '--since="30 days ago"';
  }

  var cmd = 'git log ' + range + ' --pretty=format:"%H|||%s|||%an|||%as" --no-merges';
  try {
    var output = execSync(cmd, { encoding: 'utf8', cwd: path.join(__dirname, '..') });
    return output.trim().split('\n').filter(Boolean);
  } catch (err) {
    return [];
  }
}

function categorizeCommit(subject) {
  // Try conventional commit prefix
  var match = subject.match(/^(\w+)(?:\(.*?\))?[!]?:\s*(.+)/);
  if (match) {
    var prefix = match[1].toLowerCase();
    var message = match[2].trim();
    var section = PREFIX_MAP[prefix] || 'Other';
    return { section: section, message: message };
  }

  // Heuristic fallback
  var lower = subject.toLowerCase();
  if (lower.startsWith('sync:') || lower.includes('sync ')) {
    return { section: 'STEP Sync', message: subject };
  }
  return { section: 'Other', message: subject };
}

function generateChangelog(lines) {
  var sections = {};

  lines.forEach(function (line) {
    var parts = line.split('|||');
    if (parts.length < 4) return;
    var hash = parts[0].slice(0, 8);
    var subject = parts[1];
    var author = parts[2];
    var date = parts[3];

    var cat = categorizeCommit(subject);
    if (!sections[cat.section]) sections[cat.section] = [];
    sections[cat.section].push('- ' + cat.message + ' (`' + hash + '` ' + author + ', ' + date + ')');
  });

  var output = [];
  SECTION_ORDER.forEach(function (section) {
    if (sections[section] && sections[section].length > 0) {
      output.push('### ' + section);
      sections[section].forEach(function (entry) {
        output.push(entry);
      });
      output.push('');
    }
  });

  return output.join('\n');
}

function writeToChangelog(content, header) {
  var heading = header ? '## [' + header + ']' : '## [Unreleased]';
  var dateStr = new Date().toISOString().split('T')[0];
  if (header && header !== 'Unreleased') {
    heading += ' - ' + dateStr;
  }

  var block = heading + '\n\n' + content + '\n';

  if (fs.existsSync(CHANGELOG_PATH)) {
    var existing = fs.readFileSync(CHANGELOG_PATH, 'utf8');
    // Insert after the header/preamble (after the first blank line following the title)
    var insertIdx = existing.indexOf('\n## ');
    if (insertIdx === -1) {
      // No existing sections, append
      fs.writeFileSync(CHANGELOG_PATH, existing.trimEnd() + '\n\n' + block, 'utf8');
    } else {
      // Insert before the first ## section
      var before = existing.slice(0, insertIdx);
      var after = existing.slice(insertIdx);
      fs.writeFileSync(CHANGELOG_PATH, before + '\n' + block + after, 'utf8');
    }
  } else {
    var preamble = [
      '# Changelog',
      '',
      'All notable changes to STEP configurations and tooling in this repository.',
      '',
      'Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)',
      '',
    ].join('\n');
    fs.writeFileSync(CHANGELOG_PATH, preamble + block, 'utf8');
  }
  console.log('Written to ' + CHANGELOG_PATH);
}

// Main
var args = parseArgs(process.argv.slice(2));
var lines = getGitLog(args.since, args.until);

if (lines.length === 0) {
  console.log('No commits found in the specified range.');
  process.exit(0);
}

var content = generateChangelog(lines);

if (args.write) {
  writeToChangelog(content, args.header || 'Unreleased');
} else {
  console.log(content);
}

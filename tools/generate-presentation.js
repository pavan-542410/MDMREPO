#!/usr/bin/env node
/**
 * Generates a Marp-compatible Markdown presentation from a sprint record.
 *
 * Usage:
 *   node tools/generate-presentation.js --current              # latest sprint, stdout
 *   node tools/generate-presentation.js --file <path>          # specific sprint file
 *   node tools/generate-presentation.js --current --write      # write to docs/presentations/
 */

var fs = require('fs');
var path = require('path');
var { execSync } = require('child_process');

var RECORDS_DIR = path.join(__dirname, '..', 'docs', 'ai-playbook', 'records');
var OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'presentations');

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

function findLatestSprint() {
  var files = fs.readdirSync(RECORDS_DIR).filter(function (f) {
    return f.match(/Sprint[_-]/i) && f.endsWith('.md');
  });
  if (files.length === 0) return null;

  // Sort by sprint letter (last alpha char before .md)
  files.sort(function (a, b) {
    var letterA = a.match(/Sprint[_-]?([A-Z])/i);
    var letterB = b.match(/Sprint[_-]?([A-Z])/i);
    var la = letterA ? letterA[1].toUpperCase() : '';
    var lb = letterB ? letterB[1].toUpperCase() : '';
    return lb.localeCompare(la);
  });
  return path.join(RECORDS_DIR, files[0]);
}

function parseSprintRecord(content) {
  var record = {
    title: '',
    dates: '',
    summary: '',
    tasks: [],
    decisions: [],
    carryovers: [],
  };

  // Title
  var titleMatch = content.match(/^#\s+(.+)/m);
  if (titleMatch) record.title = titleMatch[1].trim();

  // Dates
  var datesMatch = content.match(/\*\*Dates\*\*:\s*(.+)/);
  if (datesMatch) record.dates = datesMatch[1].trim();

  // Summary
  var summaryMatch = content.match(/## Summary\s*\n+([\s\S]*?)(?=\n---|\n>|\n## )/);
  if (summaryMatch) record.summary = summaryMatch[1].trim();

  // Tasks — extract each ### N. heading block
  var taskRegex = /### (\d+)\.\s+(.+?)(?:\s*_\((.+?)\)_)?\s*\n([\s\S]*?)(?=\n### \d+\.|\n## |$)/g;
  var match;
  while ((match = taskRegex.exec(content)) !== null) {
    var taskBody = match[4];

    var problemMatch = taskBody.match(/\*\*Problem\*\*:\s*([\s\S]*?)(?=\n\*\*)/);
    var workMatch = taskBody.match(/\*\*Work done[^*]*\*\*:\s*\n?([\s\S]*?)(?=\n\*\*)/);

    var filesSection = taskBody.match(/\*\*Files?\*\*:\s*\n([\s\S]*?)(?=\n\*\*|\n---|\n$)/);
    var fileCount = 0;
    if (filesSection) {
      fileCount = (filesSection[1].match(/^-\s/gm) || []).length;
    }

    record.tasks.push({
      number: parseInt(match[1]),
      title: match[2].trim(),
      timestamp: match[3] || '',
      problem: problemMatch ? problemMatch[1].trim().split('\n')[0] : '',
      work: workMatch ? workMatch[1].trim() : '',
      fileCount: fileCount,
    });
  }

  // Key Decisions
  var decisionsMatch = content.match(/## Key Decisions\s*\n([\s\S]*?)(?=\n## |$)/);
  if (decisionsMatch) {
    record.decisions = decisionsMatch[1].trim().split('\n')
      .filter(function (l) { return l.match(/^[-*]\s/); })
      .map(function (l) { return l.replace(/^[-*]\s+/, '').trim(); });
  }

  // Carry-overs
  var carryMatch = content.match(/## Carry-overs[^\n]*\n([\s\S]*?)(?=\n## |$)/);
  if (carryMatch) {
    record.carryovers = carryMatch[1].trim().split('\n')
      .filter(function (l) { return l.match(/^[-*]\s/); })
      .map(function (l) { return l.replace(/^[-*]\s+/, '').trim(); });
  }

  return record;
}

function getGitMetrics(dates) {
  // Try to parse date range for git stats
  var dateMatch = dates.match(/(\w+ \d+)\s*[–-]\s*(\w+ \d+),?\s*(\d{4})/);
  if (!dateMatch) return null;

  var year = dateMatch[3];
  var since = dateMatch[1] + ', ' + year;
  var until = dateMatch[2] + ', ' + year;

  try {
    var logCmd = 'git log --since="' + since + '" --until="' + until + '" --oneline --no-merges 2>/dev/null | wc -l';
    var commitCount = execSync(logCmd, { encoding: 'utf8', cwd: path.join(__dirname, '..') }).trim();

    var authorsCmd = 'git log --since="' + since + '" --until="' + until + '" --no-merges --format="%an" 2>/dev/null | sort -u';
    var authors = execSync(authorsCmd, { encoding: 'utf8', cwd: path.join(__dirname, '..') }).trim().split('\n').filter(Boolean);

    return {
      commitCount: parseInt(commitCount) || 0,
      contributors: authors,
    };
  } catch (e) {
    return null;
  }
}

function generatePresentation(record) {
  var slides = [];

  // Marp frontmatter
  slides.push([
    '---',
    'marp: true',
    'theme: default',
    'paginate: true',
    'header: "' + record.title + '"',
    'footer: "' + record.dates + '"',
    '---',
  ].join('\n'));

  // Title slide
  slides.push([
    '',
    '# ' + record.title,
    '',
    '**' + record.dates + '**',
    '',
  ].join('\n'));

  // Summary slide
  if (record.summary) {
    slides.push([
      '---',
      '',
      '## Sprint Summary',
      '',
      record.summary,
      '',
    ].join('\n'));
  }

  // Task slides (1 per task, most impactful first — keep original order which is newest first)
  record.tasks.forEach(function (task) {
    var workBullets = task.work.split('\n')
      .filter(function (l) { return l.match(/^[-*]\s/); })
      .slice(0, 4)
      .join('\n');

    slides.push([
      '---',
      '',
      '## ' + task.title,
      '',
      '**Problem**: ' + task.problem,
      '',
      '**Solution**:',
      workBullets || '- ' + task.work.split('\n')[0],
      '',
      task.fileCount > 0 ? '_' + task.fileCount + ' file(s) changed_' : '',
    ].join('\n'));
  });

  // Key Decisions slide
  if (record.decisions.length > 0) {
    slides.push([
      '---',
      '',
      '## Key Decisions',
      '',
      record.decisions.map(function (d) { return '- ' + d; }).join('\n'),
      '',
    ].join('\n'));
  }

  // Carry-overs slide
  if (record.carryovers.length > 0) {
    slides.push([
      '---',
      '',
      '## Carry-overs',
      '',
      record.carryovers.map(function (c) { return '- ' + c; }).join('\n'),
      '',
    ].join('\n'));
  }

  // Metrics slide
  var metrics = getGitMetrics(record.dates);
  if (metrics) {
    slides.push([
      '---',
      '',
      '## Sprint Metrics',
      '',
      '| Metric | Value |',
      '|--------|-------|',
      '| Tasks completed | ' + record.tasks.length + ' |',
      '| Total commits | ' + metrics.commitCount + ' |',
      '| Contributors | ' + metrics.contributors.join(', ') + ' |',
      '',
    ].join('\n'));
  }

  return slides.join('\n');
}

// Main
var args = parseArgs(process.argv.slice(2));

var filePath;
if (args.file) {
  filePath = args.file;
} else if (args.current) {
  filePath = findLatestSprint();
  if (!filePath) {
    console.error('No sprint record files found in ' + RECORDS_DIR);
    process.exit(1);
  }
} else {
  console.error('Usage: node tools/generate-presentation.js --current [--write]');
  console.error('       node tools/generate-presentation.js --file <path> [--write]');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error('File not found: ' + filePath);
  process.exit(1);
}

var content = fs.readFileSync(filePath, 'utf8');
var record = parseSprintRecord(content);
var presentation = generatePresentation(record);

if (args.write) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  var baseName = path.basename(filePath, '.md').replace(/^\s+/, '');
  var outPath = path.join(OUTPUT_DIR, baseName + '-presentation.md');
  fs.writeFileSync(outPath, presentation, 'utf8');
  console.log('Written to ' + outPath + ' (' + record.tasks.length + ' task slides)');
} else {
  console.log(presentation);
}

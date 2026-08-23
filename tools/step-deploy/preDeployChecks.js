'use strict';

const { spawn, spawnSync } = require('child_process');

const TEST_COMMAND = 'npm';
const TEST_ARGS = [
  'run',
  'test:unit-validate',
  '--',
  '--coverage',
  '--runInBand'
];
const COVERAGE_FAILURE_PATTERNS = [
  /Failed to collect coverage from/i,
  /Jest: "global" coverage threshold for .+ not met/i
];

class PreDeployCheckError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'PreDeployCheckError';
    this.details = details || '';
  }
}

function formatDetails(exitCode, signal, stdout, stderr) {
  const chunks = [
    `Command: ${TEST_COMMAND} ${TEST_ARGS.join(' ')}`,
    `Exit code: ${exitCode == null ? 'null' : exitCode}`,
    `Signal: ${signal || 'none'}`
  ];

  if (stdout) {
    chunks.push('--- stdout ---');
    chunks.push(stdout.trimEnd());
  }

  if (stderr) {
    chunks.push('--- stderr ---');
    chunks.push(stderr.trimEnd());
  }

  return chunks.join('\n');
}

function hasCoverageFailureOutput(stdout, stderr) {
  const output = `${stdout || ''}\n${stderr || ''}`;
  return COVERAGE_FAILURE_PATTERNS.some((pattern) => pattern.test(output));
}

function throwIfChecksFailed(exitCode, signal, stdout, stderr, error) {
  if (error) {
    throw new PreDeployCheckError(
      `Pre-deploy test/coverage check failed to start: ${error.message}`,
      formatDetails(exitCode, signal, stdout, stderr)
    );
  }

  if (exitCode !== 0 || hasCoverageFailureOutput(stdout, stderr)) {
    throw new PreDeployCheckError(
      'Pre-deploy test/coverage check failed. Deploy was not executed.',
      formatDetails(exitCode, signal, stdout, stderr)
    );
  }
}

function runPreDeployChecksSync(cwd) {
  const result = spawnSync(TEST_COMMAND, TEST_ARGS, {
    cwd,
    encoding: 'utf8'
  });

  throwIfChecksFailed(
    result.status,
    result.signal,
    result.stdout,
    result.stderr,
    result.error
  );

  return {
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

function runPreDeployChecks(cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(TEST_COMMAND, TEST_ARGS, {
      cwd
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      try {
        throwIfChecksFailed(null, null, stdout, stderr, error);
      } catch (checkError) {
        reject(checkError);
      }
    });

    child.on('close', (code, signal) => {
      try {
        throwIfChecksFailed(code, signal, stdout, stderr, null);
        resolve({ stdout, stderr });
      } catch (checkError) {
        reject(checkError);
      }
    });
  });
}

module.exports = {
  PreDeployCheckError,
  runPreDeployChecks,
  runPreDeployChecksSync
};

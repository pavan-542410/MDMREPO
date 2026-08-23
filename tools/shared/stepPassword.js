const fs = require('fs');
const os = require('os');
const path = require('path');

function stripMatchingQuotes(value) {
  if (!value || value.length < 2) {
    return value;
  }

  const firstChar = value[0];
  const lastChar = value[value.length - 1];
  if ((firstChar === '"' || firstChar === "'") && firstChar === lastChar) {
    return value.slice(1, -1);
  }

  return value;
}

function readStepPasswordFromZshrc() {
  const zshrcPath = path.join(os.homedir(), '.zshrc');

  try {
    const zshrcContents = fs.readFileSync(zshrcPath, 'utf8');
    const lines = zshrcContents.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const match = trimmed.match(/^(?:export\s+)?STEP_PASSWORD=(.*)$/);
      if (!match) {
        continue;
      }

      return stripMatchingQuotes(match[1].trim());
    }
  } catch (error) {
    return '';
  }

  return '';
}

function getStepPassword() {
  if (process.env.STEP_PASSWORD) {
    return process.env.STEP_PASSWORD;
  }

  const zshrcPassword = readStepPasswordFromZshrc();
  if (zshrcPassword) {
    process.env.STEP_PASSWORD = zshrcPassword;
    return zshrcPassword;
  }

  return '';
}

module.exports = {
  getStepPassword
};

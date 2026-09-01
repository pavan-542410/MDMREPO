const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

describe('BusinessRule_returnAttributeLinkDetailsHTML', () => {
  test('uses a single operation0 node parameter and remains parser-valid', () => {
    const source = fs.readFileSync(path.resolve(
      __dirname,
      '../../../../../step-configs/BusinessRule/BusinessRule_returnAttributeLinkDetailsHTML.js'
    ), 'utf8');

    expect(source).toContain('exports.operation0 = function (node)');
    expect(() => parser.parse(source, {
      sourceType: 'module',
    })).not.toThrow();
  });
});

const fs = require('fs');
const {execFileSync} = require('child_process');

const {
    isCoveredBySmokeFile
} = require('../support/utils/businessRuleCoverage');

function resolveExpectedPaths(kind) {
    return JSON.parse(execFileSync(
        'node',
        ['tools/test-structure/resolveBusinessRuleTestPath.js', '--all', '--kind', kind, '--format', 'json'],
        {encoding: 'utf8', maxBuffer: 20 * 1024 * 1024}
    ));
}

function findUncoveredRules(kind) {
    return resolveExpectedPaths(kind).filter((row) => {
        return !fs.existsSync(row.expectedTestAbsolutePath) && !isCoveredBySmokeFile(row.expectedTestAbsolutePath, kind);
    });
}

describe('Business Rule coverage inventory', () => {
    test('every business rule has unit coverage via a direct or grouped smoke test', () => {
        const uncovered = findUncoveredRules('unit');

        expect(uncovered).toEqual([]);
    });

    test('every business rule has integration coverage via a direct or grouped smoke test', () => {
        const uncovered = findUncoveredRules('integration');

        expect(uncovered).toEqual([]);
    });
});

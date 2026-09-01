const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {createRequire} = require('module');

const step = require('../../config/step.js');

const repoRoot = path.resolve(__dirname, '../../../..');

function getAbsolutePath(repoRelativePath) {
    return path.resolve(repoRoot, repoRelativePath);
}

function readBusinessRuleSource(repoRelativePath) {
    return fs.readFileSync(getAbsolutePath(repoRelativePath), 'utf8');
}

function sanitizeBusinessRuleSource(source) {
    return source.replace(/\u200B/g, '');
}

function parseBusinessRuleDefinition(repoRelativePath) {
    const source = readBusinessRuleSource(repoRelativePath);
    const match = source.match(/\/\*===== business rule definition =====\s*([\s\S]*?)\*\//);
    if (!match) {
        throw new Error('Unable to parse business rule definition for ' + repoRelativePath);
    }
    return JSON.parse(match[1].trim());
}

function loadBusinessRuleModule(repoRelativePath) {
    const absolutePath = getAbsolutePath(repoRelativePath);

    try {
        delete require.cache[require.resolve(absolutePath)];
        return require(absolutePath);
    } catch (error) {
        const source = sanitizeBusinessRuleSource(readBusinessRuleSource(repoRelativePath));
        const moduleObject = {exports: {}};
        const sandbox = {
            module: moduleObject,
            exports: moduleObject.exports,
            require: createRequire(absolutePath),
            __dirname: path.dirname(absolutePath),
            __filename: absolutePath,
            console: console,
            Buffer: Buffer,
            process: process,
            ATTRIBUTION_APPROVAL: {},
            WAITINGFORIMAGERY: 'WAITINGFORIMAGERY'
        };

        vm.runInNewContext(source, sandbox, {filename: absolutePath});
        return moduleObject.exports;
    }
}

function hasDeclaredExports(source) {
    return /(?:module\.exports|exports\.)/.test(source);
}

function runUnitSmokeCases(suiteName, rules) {
    describe(suiteName, () => {
        test.each(rules)('%s loads without syntax/runtime bootstrap errors', ({businessRuleId, businessRulePath}) => {
            const source = sanitizeBusinessRuleSource(readBusinessRuleSource(businessRulePath));
            const exportsObject = loadBusinessRuleModule(businessRulePath);

            expect(exportsObject).toBeDefined();

            const exportKeys = Object.keys(exportsObject || {});
            if (hasDeclaredExports(source)) {
                expect(exportKeys.length).toBeGreaterThan(0);
            } else {
                expect(typeof exportsObject).toBe('object');
            }

            const hasUsableExport = exportKeys.length === 0 || exportKeys.some((key) => {
                const value = exportsObject[key];
                return typeof value === 'function' || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null;
            });

            expect(hasUsableExport).toBe(true);
        });
    });
}

function runIntegrationSmokeCases(suiteName, rules) {
    const runner = process.env.STEP_PASSWORD ? describe : describe.skip;

    runner(suiteName, () => {
        test.each(rules)('%s validates through STEP', async ({businessRuleId, businessRulePath}) => {
            const result = JSON.parse((await step.validate(getAbsolutePath(businessRulePath))).toString());

            expect(result).toBeTruthy();
        });
    });
}

function resolveSmokeCoverageFilename(kind) {
    return kind === 'integration'
        ? 'BusinessRule_MissingCoverageSmoke.int.test.js'
        : 'BusinessRule_MissingCoverageSmoke.test.js';
}

function resolveLegacyGlobalSmokeCoveragePath(expectedTestAbsolutePath, kind) {
    const relativePath = path.relative(repoRoot, expectedTestAbsolutePath).replace(/\\/g, '/');
    const match = relativePath.match(/^test\/BusinessRule\/(unit|integration)\/([^/]+)\/[^/]+\/BusinessRule_.+\.(?:int\.)?test\.js$/);
    if (!match) {
        return null;
    }

    const scope = match[1];
    const parentLayer = match[2];
    return path.join(
        repoRoot,
        'test',
        'BusinessRule',
        scope,
        'GlobalBusinessRulesRoot',
        parentLayer,
        resolveSmokeCoverageFilename(kind)
    );
}

function isCoveredBySmokeFile(expectedTestAbsolutePath, kind) {
    const directCoverageFilePath = path.join(
        path.dirname(expectedTestAbsolutePath),
        resolveSmokeCoverageFilename(kind)
    );
    if (fs.existsSync(directCoverageFilePath)) {
        return true;
    }

    const legacyCoverageFilePath = resolveLegacyGlobalSmokeCoveragePath(expectedTestAbsolutePath, kind);
    return legacyCoverageFilePath ? fs.existsSync(legacyCoverageFilePath) : false;
}

module.exports = {
    getAbsolutePath,
    isCoveredBySmokeFile,
    loadBusinessRuleModule,
    parseBusinessRuleDefinition,
    resolveSmokeCoverageFilename,
    runIntegrationSmokeCases,
    runUnitSmokeCases,
    sanitizeBusinessRuleSource
};

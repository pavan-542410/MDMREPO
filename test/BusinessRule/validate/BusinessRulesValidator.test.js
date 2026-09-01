var step = require("../config/step.js");
const fs = require('fs');
const path = require('path');
const root = '../../../step-configs/BusinessRule/';
const brFilesDirectory = path.join(__dirname, root);
const brFiles = fs.readdirSync(brFilesDirectory).filter(file => file.endsWith('.js'));

// This suite validates every BR file against the STEP server (446 tests × network round-trips).
// It is intentionally skipped in normal CI runs to avoid long runtimes and STEP availability
// dependencies.  Run manually when you need to validate BR syntax against a live STEP server:
//   STEP_PASSWORD=<password> npx jest --selectProjects validate --testPathPattern=BusinessRulesValidator
describe.skip('Business rule validator suite (run manually only)', () => {
    test.each(brFiles)('Tests %s', async brFile => {
        var result = null;
        await step.validate(brFilesDirectory + brFile).then((data) => {
            result = JSON.parse(data.toString());
        });
        expect(result).toBeTruthy();
    });
});

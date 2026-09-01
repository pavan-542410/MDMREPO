var step = require("../../../config/step.js");
var parseStepResponse = step.parseResponse;
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_DevCloudinaryConfig");

var stepRunner = process.env.STEP_PASSWORD ? describe : describe.skip;

stepRunner("DevCloudinaryConfig integration", () => {
    test("returns expected Cloudinary configuration from STEP", async () => {
        var result = {};

        await step.test(function () {
            return businessRuleModule.operation0();
        }, ["businessRuleModule", businessRuleModule], []).then(async function (data) {
            result = parseStepResponse(data);
        });

        expect(result.cloudinaryBaseUrl).toBe("https://api.cloudinary.com/v1_1");
        expect(result.cloudName).toBe("stitch-fix");
        expect(result.uploadPreset).toBe("dev-imagery");
        expect(result.uploadOperation).toBe("upload");
    });
});

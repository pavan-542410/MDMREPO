var step = require("../../../config/step.js");
var parseStepResponse = step.parseResponse;
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_DevCloudinaryResponseMapper");

var stepRunner = process.env.STEP_PASSWORD ? describe : describe.skip;

stepRunner("DevCloudinaryResponseMapper integration", () => {
    test("maps a Cloudinary payload to expected STEP fields in STEP runtime", async () => {
        var result = {};

        await step.test(function () {
            var sampleResponse = JSON.stringify({
                asset_id: "asset-123",
                public_id: "dev_assets/sv_12345_front",
                version: 1719955200,
                created_at: "2024-07-03T00:00:00Z",
                original_filename: "sv_12345_front_flat"
            });
            return businessRuleModule.operation0(sampleResponse, "DEV_12345", "DA_12345");
        }, ["businessRuleModule", businessRuleModule], []).then(async function (data) {
            result = parseStepResponse(data);
        });

        if (typeof result === "string") {
            result = JSON.parse(result);
        }

        expect(result.photo_asset_id).toBe("12345");
        expect(result.cloudinary_public_id).toBe("dev_assets/sv_12345_front");
        expect(result.cloudinary_version).toBe("1719955200");
        expect(result.asset_created_at).toBe("2024-07-03 00:00:00");
        expect(result.style_variant_id).toBe("DEV_12345");
        expect(result.action_code).toBe("UPSERT");
    });
});

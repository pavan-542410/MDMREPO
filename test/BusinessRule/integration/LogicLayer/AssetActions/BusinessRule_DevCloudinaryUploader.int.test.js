var step = require("../../../config/step.js");
var parseStepResponse = step.parseResponse;
var uploaderModule = require("../../../../../step-configs/BusinessRule/BusinessRule_DevCloudinaryUploader");
var configModule = require("../../../../../step-configs/BusinessRule/BusinessRule_DevCloudinaryConfig");

var stepRunner = process.env.STEP_PASSWORD ? describe : describe.skip;
var liveCloudinaryRunner = process.env.RUN_LIVE_CLOUDINARY_UPLOAD === "true" ? test : test.skip;

stepRunner("DevCloudinaryUploader integration", () => {
    test("returns empty string when provided a missing file path in STEP runtime", async () => {
        var result = "";

        await step.test(function () {
            var configJson = configModule.operation0();
            return uploaderModule.operation0("/tmp/step-file-does-not-exist-" + new Date().getTime() + ".jpg", configJson);
        }, ["uploaderModule", uploaderModule], ["configModule", configModule]).then(async function (data) {
            result = parseStepResponse(data);
        });

        expect(result).toBe("");
    });

    liveCloudinaryRunner("uploads a temporary file to Cloudinary and returns response JSON", async () => {
        var result = {};

        await step.test(function () {
            var configJson = configModule.operation0();
            var tempFile = java.io.File.createTempFile("dev-cloudinary-uploader-", ".txt");
            var writer = new java.io.FileWriter(tempFile);

            writer.write("dev-cloudinary-upload-" + new Date().getTime());
            writer.close();

            var uploadResult = uploaderModule.operation0(tempFile.getAbsolutePath(), configJson);
            tempFile["delete"]();

            return uploadResult;
        }, ["uploaderModule", uploaderModule], ["configModule", configModule]).then(async function (data) {
            result = parseStepResponse(data);
        });

        expect(result).toBeTruthy();
        expect(result.public_id).toBeTruthy();
        expect(result.asset_id).toBeTruthy();
        expect(result.version).toBeTruthy();
        expect(result.created_at).toMatch(/Z$/);
    });
});

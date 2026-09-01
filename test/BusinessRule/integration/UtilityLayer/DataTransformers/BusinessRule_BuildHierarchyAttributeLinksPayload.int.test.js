var step = require("../../../config/step.js");
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_BuildHierarchyAttributeLinksPayload");

test("BuildHierarchyAttributeLinksPayload should build CSV and exclude configured attributes", async () => {
    var result = {};
    await step.test(function () {
        var summary = {
            rootId: "StitchFixMerchProductHierarchy",
            classCount: 2,
            classes: [
                {
                    classId: "CLASS_1",
                    className: "Class One",
                    groupName: "Group One",
                    divisionName: "Division One",
                    attributes: [
                        {attributeId: "attr_1", attributeName: "Attribute One", attributeHelpText: "Help One", mandatory: true},
                        {attributeId: "ORPHAN_DATA_ERROR_CAPTURE", attributeName: "Exclude Me", attributeHelpText: "Excluded", mandatory: false}
                    ]
                },
                {
                    classId: "CLASS_2",
                    className: "Class Two",
                    groupName: "Group One",
                    divisionName: "Division One",
                    attributes: [
                        {attributeId: "attr_1", attributeName: "Attribute One", attributeHelpText: "Help One", mandatory: false},
                        {attributeId: "attr_2", attributeName: "Attribute Two", attributeHelpText: "Help Two", mandatory: true}
                    ]
                }
            ]
        };
        return businessRuleModule.operation0(null, JSON.stringify(summary), ",", "ORPHAN_DATA_ERROR_CAPTURE", true);
    }, ["businessRuleModule", businessRuleModule], []).then(async (data) => {
        result = JSON.parse(data);
    });

    var payload = JSON.parse(result.result);
    expect(payload.classCount).toBe(2);
    expect(payload.attributeCount).toBe(2);
    expect(payload.csv).toContain("Division");
    expect(payload.csv).toContain("Group");
    expect(payload.csv).toContain("Classification");
    expect(payload.csv).toContain("Help One");
    expect(payload.csv).not.toContain("Exclude Me");
    expect(payload.csv).not.toContain("ORPHAN_DATA_ERROR_CAPTURE");
});

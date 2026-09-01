/*
 * Copyright (c) 2023. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

var step = require("../../../config/step.js");
var businessRuleModule = require("../../../../../step-configs/BusinessRule/BusinessRule_BlueYonderAuthHeader");

test('Test Blue Yonder Auth Header.', async () => {
    var result = "";
    await step.test(function (manager) {
        var resultMap = businessRuleModule.operation0();
        var authorization = resultMap.get("Authorization");
        return authorization;
    }, ["businessRuleModule", businessRuleModule], []).then( async (data) => {
        result = JSON.parse(data);
    });
    expect(result.result).toBe("Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjZiYjBjMDQ5MzcwZThmZjdiZjQ0MDM5NmU2NzNjNmQyMjk3ODYwMjgiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzYWFzLXlhbnRyaWtzLXNmLXByb2QiLCJleHAiOjAsImlhdCI6MTY4Mzc0MTQxMSwiaXNzIjoic2YtcHJvZEBhenVyZS1mcm9udC1kb29yLXByb2QuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJzdWIiOiJzZi1wcm9kQGF6dXJlLWZyb250LWRvb3ItcHJvZC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSJ9.WTWA5VHtLuzprqWd-7ug8SoONgM24G7u8Dyoa7fyJLpjP505kOtjojE9q0OILhpyRck0gqIfUbm3po0i5ijjKHkKIRmwMoyjrfHzLBiFajLa0tSy_lK4awUWot1n-AMYrQJlWbCao_tmIEXlX_aKIOlr2EYpCcTyCSdYHKZMpVCzHfkSQI8sVfE_ntMD2iEawvCkqDyR8feLO1YynTX3rpvIZ3C87_jum7i7pZe-5_bZN9-0LUNYJrMzUmMH9h6FdXH7TO7gL0O5QwsqR_xEXww4rMXIXyvhIZEOr0Zx3ZgqT6sVgFiykAN84Zu2TMs_95UT-GtZaHW6xd2PtbB37A");
});

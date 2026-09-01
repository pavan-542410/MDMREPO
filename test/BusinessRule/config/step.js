/*
 * Copyright (c) 2023. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

var stepConfigFile = './stepConfig.json';
var auth = require('./auth.js');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require("path");

var RETRYABLE_CODES = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'EPIPE'];

/**
 * Sends an HTTP(S) request with retry logic for transient failures.
 * @param {Object} configuration - Request configuration (host, port, path, headers, etc.)
 * @param {string} body - Request body to send
 * @param {number} retriesLeft - Number of retries remaining
 * @returns {Promise<Buffer>} Response body
 */
function sendRequest(configuration, body, retriesLeft) {
    var protocol = (configuration.protocol == 'https:') ? https : http;
    var timeout = configuration.timeout || 30000;

    return new Promise((resolve, reject) => {
        const request = protocol.request(configuration, (response) => {
            var chunks = [];
            response.on('data', (chunk) => {
                chunks.push(chunk);
            });
            response.on('end', () => {
                var result = Buffer.concat(chunks);
                if (response.statusCode === 503 && retriesLeft > 0) {
                    console.log('STEP returned 503, retrying... (' + retriesLeft + ' left)');
                    setTimeout(() => {
                        sendRequest(configuration, body, retriesLeft - 1).then(resolve, reject);
                    }, 2000);
                } else {
                    resolve(result);
                }
            });
        });

        request.on('error', (error) => {
            if (retriesLeft > 0 && RETRYABLE_CODES.indexOf(error.code) !== -1) {
                console.log('Request failed with ' + error.code + ', retrying... (' + retriesLeft + ' left)');
                setTimeout(() => {
                    sendRequest(configuration, body, retriesLeft - 1).then(resolve, reject);
                }, 2000);
            } else {
                reject(error);
            }
        });

        request.setTimeout(timeout, () => {
            request.destroy();
            if (retriesLeft > 0) {
                console.log('Request timed out, retrying... (' + retriesLeft + ' left)');
                setTimeout(() => {
                    sendRequest(configuration, body, retriesLeft - 1).then(resolve, reject);
                }, 2000);
            } else {
                reject(new Error('Request timeout after ' + (timeout / 1000) + ' seconds. Check STEP server connectivity and testability configuration.'));
            }
        });

        request.write(body);
        request.end();
    });
}

/**
 * Tests javascript functions using the REST testability endpoint exposed from STEP.
 * Retries on transient failures (ECONNRESET, ETIMEDOUT, 503).
 */
exports.test = async function (testFunction, businessRules, businessLibraries) {
    var configuration = readTestConfiguration(stepConfigFile);
    var maxRetries = configuration.retries != null ? configuration.retries : 2;

    await authenticate(configuration);

    var businessRulesDefinition = prepareBusinessRulesDefinition(BUSINESS_RULE_TYPE.BUSINESS_RULE, ...businessRules);
    var businessLibrariesDefinition = prepareBusinessRulesDefinition(BUSINESS_RULE_TYPE.BUSINESS_LIBRARY, ...businessLibraries);
    var body = prepareScript(testFunction, businessRulesDefinition, businessLibrariesDefinition);

    return sendRequest(configuration, body, maxRetries);
}

/**
 * Validates a business rule file using the REST validation endpoint exposed from STEP.
 * Retries on transient failures.
 */
exports.validate = async function (businessRuleFile) {
    var configuration = readValidateConfiguration(stepConfigFile);
    var maxRetries = configuration.retries != null ? configuration.retries : 2;

    await authenticate(configuration);

    var body = fs.readFileSync(path.resolve(__dirname, businessRuleFile), 'utf8');

    return sendRequest(configuration, body, maxRetries);
}

/**
 * Adds 'Authorization' header to the request configuration. If 'configuration.auth' is set to 'Basic' a basic auth header will be added.
 * If 'configuration.auth' is set to 'Bearer' and 'token' is present in the configuration file, this token will be set as a bearer token.
 * If 'auth' is set to 'Bearer' and 'token' is not present a token will be acquired from the step '/auth/token' resource using the username
 * and password from the configuration file.
 * @param {*} configuration
 */
async function authenticate(configuration) {
    var username = configuration.username;
    var password = configuration.password;
    if (configuration.auth == 'Basic') {
        configuration.headers = {'Authorization': "Basic " + Buffer.from(username + ":" + password).toString('base64')};
    } else if (configuration.auth == 'Bearer') {
        if (configuration.token) {
            configuration.headers = {'Authorization': "Bearer " + configuration.token};
        } else {
            console.log("Authenticating in STEP");
            var token = await auth.authenticate(username, password);
            if (token == null) {
                throw new Error("Not authenticated: Check STEP credentials and token endpoint reachability.");
            }
            console.log("Authenticated");
            configuration.headers = {'Authorization': "Bearer " + token.accessToken};
        }
    }
}

/**
 * Reads test configuration from a configuration json file.
 * @param {*} configFile configuration file
 */
var STEP_HOSTS = {
    'dev':'auth-usea01.mdm.stibosystems.com',
};

/**
 * Resolves the STEP host to connect to.
 * Priority: STEP_ENV (dev|preprod) > STEP_HOST (custom) > preprod fallback.
 * @param {string} configuredHost - host from stepConfig.json
 * @returns {string} resolved host
 */
function resolveHost(configuredHost) {
    var env = process.env.STEP_ENV;
    if (env && STEP_HOSTS[env]) {
        return STEP_HOSTS[env];
    }
    if (process.env.STEP_HOST) {
        return process.env.STEP_HOST;
    }
    return STEP_HOSTS.preprod || configuredHost;
}

function readTestConfiguration(configFile) {
    var configurationJson = fs.readFileSync(path.resolve(__dirname, configFile), 'utf8');
    var configuration = JSON.parse(configurationJson);
    configuration.host = resolveHost(configuration.host);
    configuration.username = process.env.STEP_USERNAME || configuration.username || '';
    configuration.password = process.env.STEP_PASSWORD || configuration.password || '';
    configuration.method = "POST";
    configuration.path = "/configuration-management/test-javascript?context=" + (configuration.context != null ? configuration.context : "TS");
    return configuration;
}

/**
 * Reads validate configuration from a given configuration json file.
 * @param {*} configFile configuration file
 */
function readValidateConfiguration(configFile) {
    var configurationJson = fs.readFileSync(path.resolve(__dirname, configFile), 'utf8');
    var configuration = JSON.parse(configurationJson);
    configuration.host = resolveHost(configuration.host);
    configuration.username = process.env.STEP_USERNAME || configuration.username || '';
    configuration.password = process.env.STEP_PASSWORD || configuration.password || '';
    configuration.method = "POST";
    configuration.path = "/configuration-management/validate-business-rule?context=" + (configuration.context != null ? configuration.context : "TS");
    return configuration;
}

/**
 * Prepares a script with all operations from  modules (.js files) that were passed as arguments to the test function (in the format of ["name", implementation]).
 * @param {*} businessRuleType type of business rule (BusinessRule or BusinessLibrary)
 * @param {*} businessRuleModules business rule modules in a form of ["name", implementation]
 */
function prepareBusinessRulesDefinition(businessRuleType, ...businessRuleModules) {
    if (businessRuleModules.length % 2 != 0) {
        throw 'IncorrectNumberOfArguments';
    }
    var businessRulesDefinition = "";
    for (var i = 0; i < businessRuleModules.length; i = i + 2) {
        var businessRuleModuleName = businessRuleModules[i];
        var businessRuleObject = businessRuleModules[i + 1];
        if (businessRuleType == BUSINESS_RULE_TYPE.BUSINESS_LIBRARY) {
            businessRulesDefinition += processBusinessLibraryModule(businessRuleModuleName, businessRuleObject);
        } else {
            businessRulesDefinition += processBusinessRuleModule(businessRuleModuleName, businessRuleObject);
        }
    }
    return businessRulesDefinition;
}

/**
 * Processes a single business rule module (a single .js file).
 * @param {*} businessRuleModuleName business rule module name
 * @param {*} businessRuleObject business rule module file
 */
function processBusinessRuleModule(businessRuleModuleName, businessRuleObject) {
    var businessRulesDefinition = "";
    // console.log("* Processing business rule module " + businessRuleModuleName);
    businessRulesDefinition += "var " + businessRuleModuleName + " = new Object();\n\n";
    for (var propertyName in businessRuleObject) {
        // console.log("* Processing " + businessRuleModuleName + "." + propertyName);
        var operation = businessRuleObject[propertyName];
        var operationDefinition = getOperationDefinition(propertyName, operation);
        businessRulesDefinition += businessRuleModuleName + "." + propertyName + " = " + operationDefinition + ";\n\n";
        //businessRulesDefinition += propertyName + " = " + operationDefinition + ";\n\n";
    }
    return businessRulesDefinition;
}

/**
 * Processes a single business library module (a single .js file).
 * @param {*} businessRuleModuleName business rule module name
 * @param {*} businessRuleObject business rule module file
 */
function processBusinessLibraryModule(businessRuleModuleName, businessRuleObject) {
    var businessRulesDefinition = "";
    console.log("* Processing business library module " + businessRuleModuleName);
    businessRulesDefinition += "var " + businessRuleModuleName + " = (function(){\n\n";
    for (var propertyName in businessRuleObject) {
        console.log("* Processing " + businessRuleModuleName + "." + propertyName);
        var operation = businessRuleObject[propertyName];
        var operationDefinition = getOperationDefinition(propertyName, operation);
        businessRulesDefinition += operationDefinition + "\n";
        businessRulesDefinition += "this." + propertyName + " = " + propertyName + ";\n\n";
    }
    businessRulesDefinition += "return this;\n})();\n\n";
    return businessRulesDefinition;
}

/**
 * Gets operation definition that should be added to a flattened script.
 * @param {*} propertyName name of the property (function or var)
 * @param {*} operation body of the operation or the variable
 */
function getOperationDefinition(propertyName, operation) {
    if (!isFunction(operation)) {
        return propertyName + " = \"" + operation + "\";";
    }
    if (!containsOperationName(operation)) {
        return operation.toString().replace("function ", "function " + propertyName);
    } else {
        return operation.toString();
    }
}

/**
 * Checks if the given operation is a function.
 * @param {*} operation operation to check.
 */
function isFunction(operation) {
    return typeof operation === 'function';
}

/**
 * Checks if the given operation contains name.
 * @param {*} operation operation to check.
 */
function containsOperationName(operation) {
    return operation.toString().substring(operation.toString().indexOf("function") + 9, operation.toString().indexOf("(")).trim() != "";
}

/**
 * Prepares a script that will be send to the step server.
 * @param {*} testFunction test function body
 * @param {*} businessRuleString business rules definition
 */
function prepareScript(testFunction, businessRuleString, businessLibraryString) {
    return businessRuleString + "\n" + businessLibraryString + "\nvar test = " + testFunction.toString() + "\n\ntest(manager);"
}

/**
 * Parses STEP testability API responses, handling Buffer conversion,
 * HTML error pages, STEP response wrapping, and double stringification.
 * @param {Buffer|string} data - Raw response from STEP server
 * @returns {Object|string} Parsed result
 */
exports.parseResponse = function (data) {
    var dataStr;

    if (Buffer.isBuffer(data)) {
        dataStr = data.toString();
    } else if (typeof data === 'string') {
        dataStr = data;
    } else {
        throw new Error("Expected JSON response but got: " + data);
    }

    dataStr = dataStr.trim();

    if (dataStr.startsWith('<')) {
        throw new Error("STEP server returned HTML instead of JSON. Check authentication and server connectivity.");
    }

    if (dataStr.startsWith('{') || dataStr.startsWith('"') || dataStr.startsWith('[')) {
        var parsed = JSON.parse(dataStr);

        // Handle STEP testability API format: { resultType, result, executionTime }
        if (parsed && parsed.resultType && parsed.hasOwnProperty('result')) {
            if (typeof parsed.result === 'string' && (parsed.result.startsWith('{') || parsed.result.startsWith('['))) {
                return JSON.parse(parsed.result);
            }
            return parsed.result;
        }

        // Handle double stringification
        if (typeof parsed === 'string' && (parsed.startsWith('{') || parsed.startsWith('['))) {
            return JSON.parse(parsed);
        }
        return parsed;
    }

    throw new Error("Expected JSON response but got: " + dataStr.substring(0, 100));
}

/**
 * Business rule type
 */
const BUSINESS_RULE_TYPE = {
    BUSINESS_RULE: 'BusinessRule',
    BUSINESS_LIBRARY: 'BusinessLibrary'
}

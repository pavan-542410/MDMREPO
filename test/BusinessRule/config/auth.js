/*
 * Copyright (c) 2023. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 * Morbi non lorem porttitor neque feugiat blandit. Ut vitae ipsum eget quam lacinia accumsan.
 * Etiam sed turpis ac ipsum condimentum fringilla. Maecenas magna.
 * Proin dapibus sapien vel ante. Aliquam erat volutpat. Pellentesque sagittis ligula eget metus.
 * Vestibulum commodo. Ut rhoncus gravida arcu.
 */

var configFile = './stepConfig.json';
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require("path");
var STEP_HOSTS = {
    'dev': 'auth-usea01.mdm.stibosystems.com',
};

exports.authenticate = async function authenticate(username, password) {
    try {
        var token = await authenticateAsync(username, password);
        return token;
    } catch (e) {
        console.error(e);
        return null;
    }
}

function authenticateAsync(username, password) {
    return new Promise((resolve, reject) => {
        var configuration = readAuthConfiguration(configFile);
        var protocol = (configuration.protocol == 'https:') ? https : http;
        
        var req = protocol.request(configuration, (res) => {
            let response = "";
            res.on('data', (data) => {
                response += data;
            });
            res.on("end", () => {
                if (res.statusCode == 200) {
                    var token = JSON.parse(response);
                    resolve(token);
                } else {
                    reject("Authentication failed, status code = " + res.statusCode);
                }
            });
            req.on('error', (error) => {
                reject(error);
            });
        });
        
        req.write("{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}");
        req.end();
    });
}

/**
 * Reads authentication configuration from a given configuration json file.
 * @param {*} configFile configuration file
 */
function readAuthConfiguration(configFile) {
    var configurationJson = fs.readFileSync(path.resolve(__dirname, configFile), 'utf8');
    var configuration = JSON.parse(configurationJson);
    var env = process.env.STEP_ENV;
    if (env && STEP_HOSTS[env]) {
        configuration.host = STEP_HOSTS[env];
    } else if (process.env.STEP_HOST) {
        configuration.host = process.env.STEP_HOST;
    } else {
        configuration.host = STEP_HOSTS.preprod || configuration.host;
    }
    configuration.method = "POST";
    configuration.path = "/auth/token";
    return configuration;
}

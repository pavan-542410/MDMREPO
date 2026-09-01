'use strict';

describe('DevCloudinaryUploader', () => {
    let operation0;
    let loggerMock;
    let connectionMock;
    let outputStreamMock;
    let writerMock;
    let urlOpenConnectionMock;
    let fileReadSequence;
    let fileReadIndex;

    function buildLineStream(lines) {
        return { __lines: lines.slice() };
    }

    beforeEach(() => {
        jest.resetModules();

        loggerMock = { warning: jest.fn() };
        global.logger = loggerMock;

        outputStreamMock = {
            write: jest.fn(),
            close: jest.fn()
        };

        writerMock = {
            append: jest.fn(function () { return writerMock; }),
            flush: jest.fn(function () { return writerMock; }),
            close: jest.fn()
        };

        connectionMock = {
            setRequestMethod: jest.fn(),
            setDoOutput: jest.fn(),
            setRequestProperty: jest.fn(),
            getOutputStream: jest.fn(() => outputStreamMock),
            getResponseCode: jest.fn(() => 200),
            getInputStream: jest.fn(() => buildLineStream(['{"status":"ok"}'])),
            getErrorStream: jest.fn(() => buildLineStream(['{"error":"bad request"}']))
        };

        urlOpenConnectionMock = jest.fn(() => connectionMock);
        fileReadSequence = [3, -1];
        fileReadIndex = 0;

        global.java = {
            io: {
                File: jest.fn(function (filePath) {
                    this.filePath = filePath;
                    this.getName = function () {
                        return String(filePath).split('/').pop();
                    };
                }),
                OutputStreamWriter: jest.fn(function (stream, encoding) {
                    return { stream: stream, encoding: encoding };
                }),
                PrintWriter: jest.fn(function () {
                    return writerMock;
                }),
                FileInputStream: jest.fn(function () {
                    this.read = jest.fn(function () {
                        const result = fileReadSequence[fileReadIndex];
                        fileReadIndex += 1;
                        return result;
                    });
                    this.close = jest.fn();
                }),
                InputStreamReader: jest.fn(function (stream) {
                    return { stream: stream };
                }),
                BufferedReader: jest.fn(function (inputStreamReader) {
                    let idx = 0;
                    const lines = (inputStreamReader.stream && inputStreamReader.stream.__lines) || [];
                    return {
                        readLine: jest.fn(function () {
                            return idx < lines.length ? lines[idx++] : null;
                        }),
                        close: jest.fn()
                    };
                })
            },
            net: {
                URL: jest.fn(function (url) {
                    this.url = url;
                    this.openConnection = urlOpenConnectionMock;
                })
            },
            lang: {
                reflect: {
                    Array: {
                        newInstance: jest.fn(() => [])
                    }
                },
                Byte: {
                    TYPE: 'byte'
                }
            }
        };

        ({ operation0 } = require('../../../../../step-configs/BusinessRule/BusinessRule_DevCloudinaryUploader'));
    });

    afterEach(() => {
        delete global.java;
        delete global.logger;
    });

    test('returns Cloudinary response body on HTTP 200', () => {
        const configJson = JSON.stringify({
            cloudinaryBaseUrl: 'https://api.cloudinary.com/v1_1',
            cloudName: 'stitch-fix',
            uploadOperation: 'upload',
            apiKey: 'key-1',
            uploadPreset: 'preset-1'
        });

        const result = operation0('/tmp/dev-upload-image.jpg', configJson);

        expect(result).toBe('{"status":"ok"}');
        expect(connectionMock.setRequestMethod).toHaveBeenCalledWith('POST');
        expect(connectionMock.setDoOutput).toHaveBeenCalledWith(true);
        expect(connectionMock.setRequestProperty).toHaveBeenCalledWith(
            'Content-Type',
            expect.stringContaining('multipart/form-data; boundary=----STEPDevCloudinaryBoundary')
        );
        expect(outputStreamMock.write).toHaveBeenCalledWith(expect.any(Array), 0, 3);
        expect(connectionMock.getInputStream).toHaveBeenCalledTimes(1);
        expect(loggerMock.warning).not.toHaveBeenCalled();

        const appendArgs = writerMock.append.mock.calls.map((call) => call[0]).join('');
        expect(appendArgs).toContain('name="api_key"');
        expect(appendArgs).toContain('key-1');
        expect(appendArgs).toContain('name="upload_preset"');
        expect(appendArgs).toContain('preset-1');
        expect(appendArgs).toContain('name="timestamp"');
    });

    test('returns empty string and logs warning for non-200 response', () => {
        connectionMock.getResponseCode.mockReturnValue(401);
        connectionMock.getErrorStream.mockReturnValue(buildLineStream(['{"error":"unauthorized"}']));
        const configJson = JSON.stringify({
            cloudinaryBaseUrl: 'https://api.cloudinary.com/v1_1',
            cloudName: 'stitch-fix',
            uploadOperation: 'upload',
            apiKey: 'key-2',
            uploadPreset: 'preset-2'
        });

        const result = operation0('/tmp/dev-upload-image.jpg', configJson);

        expect(result).toBe('');
        expect(connectionMock.getErrorStream).toHaveBeenCalledTimes(1);
        expect(loggerMock.warning).toHaveBeenCalledWith(
            'DevCloudinaryUploader: HTTP 401 from Cloudinary: {"error":"unauthorized"}'
        );
    });

    test('returns empty string and logs warning on exception', () => {
        connectionMock.getOutputStream.mockImplementation(() => {
            throw new Error('stream down');
        });
        const configJson = JSON.stringify({
            cloudinaryBaseUrl: 'https://api.cloudinary.com/v1_1',
            cloudName: 'stitch-fix',
            uploadOperation: 'upload',
            apiKey: 'key-3',
            uploadPreset: 'preset-3'
        });

        const result = operation0('/tmp/dev-upload-image.jpg', configJson);

        expect(result).toBe('');
        expect(loggerMock.warning).toHaveBeenCalledWith(
            expect.stringContaining('DevCloudinaryUploader: exception during upload:')
        );
    });
});

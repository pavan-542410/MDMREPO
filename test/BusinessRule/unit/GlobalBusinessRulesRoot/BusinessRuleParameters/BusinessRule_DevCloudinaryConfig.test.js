'use strict';

const br = require('../../../../../step-configs/BusinessRule/BusinessRule_DevCloudinaryConfig');

describe('DevCloudinaryConfig', () => {
    test('returns a valid JSON string', () => {
        const result = br.operation0();
        expect(typeof result).toBe('string');
        expect(() => JSON.parse(result)).not.toThrow();
    });

    test('returns expected configuration keys and values', () => {
        const config = JSON.parse(br.operation0());

        expect(config).toEqual({
            cloudinaryBaseUrl: 'https://api.cloudinary.com/v1_1',
            cloudName: 'stitch-fix',
            apiKey: '758671857551765',
            uploadPreset: 'dev-imagery',
            uploadOperation: 'upload',
            devAssetsRootId: 'CloudinaryDevAssetsRoot'
        });
    });
});

const br = require('../../../../../step-configs/BusinessRule/BusinessRule_SVHasValidImagery');

function createValueHolder(value) {
  return {
    getSimpleValue: jest.fn(() => value),
  };
}

function createAsset(primaryFlag, assetType, embeddedType) {
  return {
    getValue: jest.fn((attrID) => {
      if (attrID === 'is_style_variant_primary_image') {
        return createValueHolder(primaryFlag);
      }
      if (attrID === 'asset_type') {
        return createValueHolder(assetType);
      }
      if (attrID === 'embedded_asset_type') {
        return createValueHolder(embeddedType);
      }
      return createValueHolder('');
    }),
  };
}

function createRefCollection(assets) {
  return {
    isEmpty: jest.fn(() => assets.length === 0),
    iterator: jest.fn(() => {
      let index = 0;
      return {
        hasNext: jest.fn(() => index < assets.length),
        next: jest.fn(() => ({
          getTarget: jest.fn(() => assets[index++]),
        })),
      };
    }),
  };
}

function createNode(assets, workflowEnabled, sampleNotes) {
  return {
    getName: jest.fn(() => 'SV Name'),
    getReferences: jest.fn(() => createRefCollection(assets)),
    isInWorkflow: jest.fn(() => workflowEnabled),
    getValue: jest.fn((attrID) => {
      if (attrID === 'sample_notes') {
        return createValueHolder(sampleNotes);
      }
      return createValueHolder('');
    }),
  };
}

describe('BusinessRule_SVHasValidImagery', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
  });

  afterEach(() => {
    delete global.logger;
  });

  it('returns true when exactly one primary EA exists and at least one flat image is linked', () => {
    const result = br.operation0(
      createNode([
        createAsset('true', 'hero', ''),
        createAsset('false', 'flat', ''),
      ], false, ''),
      { getID: jest.fn(() => 'external_asset_reference') }
    );

    expect(result).toBe(true);
  });

  it('returns a no-images message when there are no linked external assets', () => {
    expect(br.operation0(
      createNode([], false, ''),
      { getID: jest.fn(() => 'external_asset_reference') }
    )).toBe('No images found.');
  });

  it('returns a no-primary message with copy-media guidance when notes mention a source SV', () => {
    const result = br.operation0(
      createNode([
        createAsset('false', 'flat', ''),
      ], true, 'Copied imagery from SV_12345'),
      { getID: jest.fn(() => 'external_asset_reference') }
    );

    expect(result).toContain('No External Asset is set to Primary.');
    expect(result).toContain('Please copy the imagery from 12345 to SV Name');
  });

  it('returns a multi-primary message when more than one EA is marked primary', () => {
    const result = br.operation0(
      createNode([
        createAsset('true', 'hero', ''),
        createAsset('true', 'flat', ''),
      ], false, ''),
      { getID: jest.fn(() => 'external_asset_reference') }
    );

    expect(result).toBe('More than one External Asset is set to Primary');
  });

  it('returns a missing flat image message when a primary exists but no flat image is linked', () => {
    expect(br.operation0(
      createNode([
        createAsset('true', 'hero', 'On Figure'),
      ], false, ''),
      { getID: jest.fn(() => 'external_asset_reference') }
    )).toBe("No External Asset is 'flat'.");
  });
});

const br = require('../../../../../step-configs/BusinessRule/BusinessRule_BuildNodeAssetsSyncPlan');

describe('BusinessRule_BuildNodeAssetsSyncPlan', () => {
  beforeEach(() => {
    global.logger = { info: jest.fn() };
  });

  afterEach(() => {
    delete global.logger;
  });

  it('enables copied unlink cleanup and picks primary by matching SV primary_photo_asset_id', () => {
    const plan = JSON.parse(br.operation0(JSON.stringify({
      sv: {
        id: 'SV_100',
        primary_photo_asset_id: 'PHOTO_2',
      },
      copyMedia: {
        hasCopyMedia: true,
      },
      assets: {
        originalIds: ['EA_1'],
        copiedIds: ['EA_2'],
        primaryFlaggedIds: [],
        all: [
          { id: 'EA_1', photo_asset_id: 'PHOTO_1', asset_type: 'flat' },
          { id: 'EA_2', photo_asset_id: 'PHOTO_2', asset_type: 'hero' },
        ],
      },
    })));

    expect(plan).toEqual({
      svId: 'SV_100',
      ops: {
        unlinkCopied: {
          enabled: true,
          eaTargetIds: ['EA_2'],
        },
        primary: {
          chosenEaId: 'EA_2',
          chosenPhotoAssetId: 'PHOTO_2',
          enforceSinglePrimaryFlag: true,
        },
        workflow: {
          productMaintenance: {
            triggerApproveIfInWorkflow: true,
          },
        },
      },
    });
  });

  it('falls back to asset type priority, preferring original hero assets over copied assets', () => {
    const plan = JSON.parse(br.operation0(JSON.stringify({
      sv: {
        id: 'SV_200',
        primary_photo_asset_id: '',
      },
      copyMedia: {
        hasCopyMedia: false,
      },
      assets: {
        originalIds: ['EA_ORIGINAL_HERO'],
        copiedIds: ['EA_COPIED_FLAT'],
        primaryFlaggedIds: [],
        all: [
          { id: 'EA_COPIED_FLAT', photo_asset_id: 'PHOTO_FLAT', asset_type: 'flat' },
          { id: 'EA_ORIGINAL_HERO', photo_asset_id: 'PHOTO_HERO', asset_type: 'on_figure_hero' },
        ],
      },
    })));

    expect(plan.ops.unlinkCopied.enabled).toBe(false);
    expect(plan.ops.unlinkCopied.eaTargetIds).toEqual([]);
    expect(plan.ops.primary.chosenEaId).toBe('EA_ORIGINAL_HERO');
    expect(plan.ops.primary.chosenPhotoAssetId).toBe('PHOTO_HERO');
  });

  it('keeps the single existing primary flag when exactly one EA is already marked primary', () => {
    const plan = JSON.parse(br.operation0(JSON.stringify({
      sv: {
        id: 'SV_300',
        primary_photo_asset_id: '',
      },
      copyMedia: {
        hasCopyMedia: true,
      },
      assets: {
        originalIds: [],
        copiedIds: ['EA_ONLY'],
        primaryFlaggedIds: ['EA_ONLY'],
        all: [
          { id: 'EA_ONLY', photo_asset_id: 'PHOTO_ONLY', asset_type: 'flat' },
        ],
      },
    })));

    expect(plan.ops.primary.chosenEaId).toBe('EA_ONLY');
    expect(plan.ops.primary.chosenPhotoAssetId).toBe('PHOTO_ONLY');
    expect(plan.ops.unlinkCopied.enabled).toBe(false);
  });

  it('throws and logs when nodeAssetsSummary is not valid JSON', () => {
    expect(() => br.operation0('{bad-json')).toThrow();
    expect(global.logger.info).toHaveBeenCalledWith(expect.stringContaining('BuildNodeAssetsSyncPlan error:'));
  });
});

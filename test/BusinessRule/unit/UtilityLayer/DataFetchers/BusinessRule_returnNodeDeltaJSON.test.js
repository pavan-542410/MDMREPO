const businessRuleModule = require('../../../../../step-configs/BusinessRule/BusinessRule_returnNodeDeltaJSON');

test('returns attribute deltas and grouped replacements for changed refs/links', () => {
  const source = {
    attributes: [
      { attrID: 'color', sValue: 'Red' },
      { attrID: 'size', sValue: 'M' }
    ],
    references: [
      { refTypeID: 'sameType', refTarget: 'A', refMetaData: [{ attrID: 'm1', sValue: '1' }] },
      { refTypeID: 'changedType', refTarget: 'B', refMetaData: [] }
    ],
    links: [
      { linkTypeID: 'sameLinkType', linkTarget: 'C1', linkMetaData: [{ attrID: 'l1', sValue: 'x' }] },
      { linkTypeID: 'changedLinkType', linkTarget: 'C2', linkMetaData: [] }
    ]
  };

  const target = {
    attributes: [
      { attrID: 'color', sValue: 'Blue' },
      { attrID: 'size', sValue: 'M' },
      { attrID: 'obsolete', sValue: 'remove-me' }
    ],
    references: [
      { refTypeID: 'sameType', refTarget: 'A', refMetaData: [{ attrID: 'm1', sValue: '1' }] },
      { refTypeID: 'changedType', refTarget: 'DIFFERENT', refMetaData: [] }
    ],
    links: [
      { linkTypeID: 'sameLinkType', linkTarget: 'C1', linkMetaData: [{ attrID: 'l1', sValue: 'x' }] },
      { linkTypeID: 'changedLinkType', linkTarget: 'DIFFERENT', linkMetaData: [] }
    ]
  };

  const parsed = JSON.parse(
    businessRuleModule.operation0(JSON.stringify(source), JSON.stringify(target))
  );

  expect(parsed.attributes).toEqual(
    expect.arrayContaining([
      { attrID: 'color', sValue: 'Red' },
      { attrID: 'obsolete', sValue: '' }
    ])
  );
  expect(parsed.attributes).toHaveLength(2);

  expect(parsed.references).toEqual([{ refTypeID: 'changedType', refTarget: 'B', refMetaData: [] }]);
  expect(parsed.links).toEqual([{ linkTypeID: 'changedLinkType', linkTarget: 'C2', linkMetaData: [] }]);
});

test('returns empty delta when payloads are equivalent (order-insensitive for refs/links)', () => {
  const source = {
    attributes: [{ attrID: 'color', sValue: 'Red' }],
    references: [
      { refTypeID: 'rType', refTarget: 'B', refMetaData: [] },
      { refTypeID: 'rType', refTarget: 'A', refMetaData: [{ attrID: 'm', sValue: '1' }] }
    ],
    links: [
      { linkTypeID: 'lType', linkTarget: 'Y', linkMetaData: [] },
      { linkTypeID: 'lType', linkTarget: 'X', linkMetaData: [{ attrID: 'k', sValue: 'v' }] }
    ]
  };

  const target = {
    attributes: [{ attrID: 'color', sValue: 'Red' }],
    references: [
      { refTypeID: 'rType', refTarget: 'A', refMetaData: [{ attrID: 'm', sValue: '1' }] },
      { refTypeID: 'rType', refTarget: 'B', refMetaData: [] }
    ],
    links: [
      { linkTypeID: 'lType', linkTarget: 'X', linkMetaData: [{ attrID: 'k', sValue: 'v' }] },
      { linkTypeID: 'lType', linkTarget: 'Y', linkMetaData: [] }
    ]
  };

  const parsed = JSON.parse(
    businessRuleModule.operation0(JSON.stringify(source), JSON.stringify(target))
  );

  expect(parsed).toEqual({ attributes: [], references: [], links: [] });
});

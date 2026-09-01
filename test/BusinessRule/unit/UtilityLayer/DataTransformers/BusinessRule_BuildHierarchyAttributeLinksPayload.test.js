const { operation0 } = require('../../../../../step-configs/BusinessRule/BusinessRule_BuildHierarchyAttributeLinksPayload');

describe('BusinessRule_BuildHierarchyAttributeLinksPayload', () => {
  test('builds a CSV payload with sorted attributes, escaped cells, and excluded attributes removed', () => {
    const hierarchySummary = {
      rootId: 'ROOT_1',
      classes: [
        {
          classId: 'CLS_2',
          className: 'Class,Two',
          groupName: 'Group "B"',
          divisionName: 'Division B',
          attributes: [
            {
              attributeId: 'size',
              attributeName: 'Size',
              attributeHelpText: 'Size help',
              mandatory: false
            },
            {
              attributeId: 'color',
              attributeName: 'Color',
              attributeHelpText: 'Line1\nLine2',
              mandatory: true
            }
          ]
        },
        {
          classId: 'CLS_1',
          className: 'Class One',
          groupName: null,
          divisionName: undefined,
          attributes: [
            {
              attributeId: 'color',
              attributeName: 'Color',
              attributeHelpText: null,
              mandatory: false
            },
            {
              attributeId: 'ORPHAN_DATA_ERROR_CAPTURE',
              attributeName: 'Internal Error',
              attributeHelpText: 'Should be filtered out',
              mandatory: true
            }
          ]
        }
      ]
    };

    const payload = JSON.parse(operation0(
      { info: jest.fn() },
      JSON.stringify(hierarchySummary),
      ';',
      'size',
      false
    ));

    expect(payload).toEqual({
      rootId: 'ROOT_1',
      classCount: 2,
      attributeCount: 1,
      csv: [
        ';;Division;Division B;',
        ';;Group;"Group ""B""";',
        'Attribute ID;Attribute Name;Help Text↓/Classification→;Class,Two;Class One',
        'color;Color;"Line1\nLine2";MANDATORY;OPTIONAL',
        ''
      ].join('\n')
    });
  });

  test('defaults delimiter to comma and rootId to empty string when not provided', () => {
    const payload = JSON.parse(operation0(
      { info: jest.fn() },
      JSON.stringify({
        classes: [
          {
            classId: 'CLS_1',
            className: 'Class One',
            groupName: 'Group One',
            divisionName: 'Division One',
            attributes: []
          }
        ]
      }),
      '',
      '',
      false
    ));

    expect(payload.rootId).toBe('');
    expect(payload.classCount).toBe(1);
    expect(payload.attributeCount).toBe(0);
    expect(payload.csv).toContain('Attribute ID,Attribute Name,Help Text↓/Classification→,Class One\n');
  });

  test('throws explicit errors when input JSON is missing or has no classes', () => {
    expect(() => operation0({ info: jest.fn() }, '', ',', '', false))
      .toThrow('BuildHierarchyAttributeLinksPayload: hierarchySummaryJson is required.');

    expect(() => operation0({ info: jest.fn() }, JSON.stringify({ classes: [] }), ',', '', false))
      .toThrow('BuildHierarchyAttributeLinksPayload: no ProductClassificationNode rows found in hierarchy summary.');
  });
});

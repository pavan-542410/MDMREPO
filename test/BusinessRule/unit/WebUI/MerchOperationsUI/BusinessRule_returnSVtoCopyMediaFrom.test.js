const br = require('../../../../../step-configs/BusinessRule/BusinessRule_returnSVtoCopyMediaFrom');

function makeSiblings(nodes) {
  const list = nodes.slice();
  return {
    sort: (fn) => list.sort(fn),
    iterator: () => {
      let i = 0;
      return {
        hasNext: () => i < list.length,
        next: () => list[i++]
      };
    }
  };
}

function makeSV(id, siblings) {
  return {
    getID: () => id,
    getParent: () => ({
      getChildren: () => makeSiblings(siblings)
    })
  };
}

function makeBoolean(value) {
  return { booleanValue: () => value };
}

describe('returnSVtoCopyMediaFrom', () => {
  test('returns highest-id sibling with imagery and excludes current SV', () => {
    const self = { getID: () => 'SV_100' };
    const sv090 = { getID: () => 'SV_090' };
    const sv200 = { getID: () => 'SV_200' };
    const sv150 = { getID: () => 'SV_150' };
    const sv = makeSV('SV_100', [self, sv090, sv200, sv150]);

    const hasImagery = {
      evaluate: ({ node }) => makeBoolean(node.getID() === 'SV_200' || node.getID() === 'SV_150')
    };

    const result = br.operation0(hasImagery, sv);

    expect(result.getID()).toBe('SV_200');
  });

  test('returns null when no eligible sibling has imagery', () => {
    const self = { getID: () => 'SV_100' };
    const sv090 = { getID: () => 'SV_090' };
    const sv = makeSV('SV_100', [self, sv090]);
    const hasImagery = { evaluate: () => makeBoolean(false) };

    const result = br.operation0(hasImagery, sv);

    expect(result).toBeNull();
  });
});

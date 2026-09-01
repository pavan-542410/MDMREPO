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

describe('returnSVtoCopyMediaFrom (integration)', () => {
  test('iterates siblings in descending ID order and stops at first valid imagery candidate', () => {
    const self = { getID: () => 'SV_500' };
    const sv400 = { getID: () => 'SV_400' };
    const sv700 = { getID: () => 'SV_700' };
    const sv600 = { getID: () => 'SV_600' };
    const sv = {
      getID: () => 'SV_500',
      getParent: () => ({
        getChildren: () => makeSiblings([self, sv400, sv700, sv600])
      })
    };
    const hasImagery = {
      evaluate: jest.fn(({ node }) => ({
        booleanValue: () => node.getID() === 'SV_700'
      }))
    };

    const result = br.operation0(hasImagery, sv);

    expect(result.getID()).toBe('SV_700');
    expect(hasImagery.evaluate).toHaveBeenCalledWith({ node: sv700 });
  });

  test('returns null for single-SV colorway (no sibling candidate)', () => {
    const self = { getID: () => 'SV_500' };
    const sv = {
      getID: () => 'SV_500',
      getParent: () => ({
        getChildren: () => makeSiblings([self])
      })
    };
    const hasImagery = {
      evaluate: jest.fn(() => ({ booleanValue: () => true }))
    };

    const result = br.operation0(hasImagery, sv);

    expect(result).toBeNull();
    expect(hasImagery.evaluate).not.toHaveBeenCalled();
  });
});

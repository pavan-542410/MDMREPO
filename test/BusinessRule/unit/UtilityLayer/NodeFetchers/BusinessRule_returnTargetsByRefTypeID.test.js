'use strict';

const br = require('../../../../../step-configs/BusinessRule/BusinessRule_returnTargetsByRefTypeID');

function makeManager(refType) {
    return {
        getReferenceTypeHome: jest.fn(function () {
            return {
                getReferenceTypeByID: jest.fn(function (id) {
                    if (id === 'CopyMedia') return refType;
                    return null;
                })
            };
        })
    };
}

function makeNodeForReferences(references) {
    const asListMock = jest.fn(function () {
        return {
            toArray: jest.fn(function () {
                return references;
            })
        };
    });

    return {
        queryReferences: jest.fn(function () {
            return {
                asList: asListMock
            };
        }),
        __asListMock: asListMock
    };
}

describe('returnTargetsByRefTypeID', () => {
    test('returns [] when manager is missing', () => {
        expect(br.operation0(null, 'CopyMedia', {})).toEqual([]);
    });

    test('returns [] when node is missing', () => {
        const refType = { getID: jest.fn(function () { return 'CopyMedia'; }) };
        const manager = makeManager(refType);
        expect(br.operation0(manager, 'CopyMedia', null)).toEqual([]);
    });

    test('returns [] when refTypeID is missing', () => {
        const refType = { getID: jest.fn(function () { return 'CopyMedia'; }) };
        const manager = makeManager(refType);
        expect(br.operation0(manager, '', {})).toEqual([]);
    });

    test('returns [] when refTypeID does not resolve', () => {
        const refType = { getID: jest.fn(function () { return 'CopyMedia'; }) };
        const manager = makeManager(refType);
        const node = makeNodeForReferences([]);

        expect(br.operation0(manager, 'UnknownRefType', node)).toEqual([]);
        expect(node.queryReferences).not.toHaveBeenCalled();
    });

    test('returns target nodes from queryReferences references', () => {
        const refType = { getID: jest.fn(function () { return 'CopyMedia'; }) };
        const manager = makeManager(refType);
        const targetA = { getID: jest.fn(function () { return 'SV_A'; }) };
        const targetB = { getID: jest.fn(function () { return 'SV_B'; }) };
        const node = makeNodeForReferences([
            { getTarget: jest.fn(function () { return targetA; }) },
            { getTarget: jest.fn(function () { return targetB; }) }
        ]);

        const result = br.operation0(manager, 'CopyMedia', node);

        expect(result).toEqual([targetA, targetB]);
        expect(node.queryReferences).toHaveBeenCalledWith(refType);
        expect(node.__asListMock).toHaveBeenCalledWith(400);
    });

    test('filters out null targets and malformed references', () => {
        const refType = { getID: jest.fn(function () { return 'CopyMedia'; }) };
        const manager = makeManager(refType);
        const targetA = { getID: jest.fn(function () { return 'SV_A'; }) };
        const node = makeNodeForReferences([
            null,
            {},
            { getTarget: jest.fn(function () { return null; }) },
            { getTarget: jest.fn(function () { return targetA; }) }
        ]);

        const result = br.operation0(manager, 'CopyMedia', node);

        expect(result).toEqual([targetA]);
    });
});

'use strict';

const br = require('../../../../../step-configs/BusinessRule/BusinessRule_returnSourceByRefTypeID');

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

function makeNodeForReferencedBy(references) {
    const asListMock = jest.fn(function () {
        return {
            toArray: jest.fn(function () {
                return references;
            })
        };
    });

    return {
        queryReferencedBy: jest.fn(function () {
            return {
                asList: asListMock
            };
        }),
        __asListMock: asListMock
    };
}

describe('returnSourceByRefTypeID', () => {
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
        const node = makeNodeForReferencedBy([]);

        expect(br.operation0(manager, 'UnknownRefType', node)).toEqual([]);
        expect(node.queryReferencedBy).not.toHaveBeenCalled();
    });

    test('returns source nodes from queryReferencedBy references', () => {
        const refType = { getID: jest.fn(function () { return 'CopyMedia'; }) };
        const manager = makeManager(refType);
        const sourceA = { getID: jest.fn(function () { return 'SV_A'; }) };
        const sourceB = { getID: jest.fn(function () { return 'SV_B'; }) };
        const node = makeNodeForReferencedBy([
            { getSource: jest.fn(function () { return sourceA; }) },
            { getSource: jest.fn(function () { return sourceB; }) }
        ]);

        const result = br.operation0(manager, 'CopyMedia', node);

        expect(result).toEqual([sourceA, sourceB]);
        expect(node.queryReferencedBy).toHaveBeenCalledWith(refType);
        expect(node.__asListMock).toHaveBeenCalledWith(400);
    });

    test('filters out null sources and malformed references', () => {
        const refType = { getID: jest.fn(function () { return 'CopyMedia'; }) };
        const manager = makeManager(refType);
        const sourceA = { getID: jest.fn(function () { return 'SV_A'; }) };
        const node = makeNodeForReferencedBy([
            null,
            {},
            { getSource: jest.fn(function () { return null; }) },
            { getSource: jest.fn(function () { return sourceA; }) }
        ]);

        const result = br.operation0(manager, 'CopyMedia', node);

        expect(result).toEqual([sourceA]);
    });
});

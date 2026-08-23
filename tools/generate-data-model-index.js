#!/usr/bin/env node
/**
 * Generates data model documentation from the step-configs/ directory.
 * Usage:
 *   node tools/generate-data-model-index.js                # print summary to stdout
 *   node tools/generate-data-model-index.js --write        # write docs/data-model-index.md
 *   node tools/generate-data-model-index.js --write --detail  # also generate docs/data-model/*.md
 */

var fs = require('fs');
var path = require('path');

var STEP_CONFIGS = path.join(__dirname, '..', 'step-configs');
var INDEX_PATH = path.join(__dirname, '..', 'docs', 'data-model-index.md');
var DETAIL_DIR = path.join(__dirname, '..', 'docs', 'data-model');

var XMLParser;
try {
  XMLParser = require('fast-xml-parser').XMLParser;
} catch (e) {
  // fast-xml-parser only needed for --detail mode
  XMLParser = null;
}

var PURPOSE_MAP = {
  ActionSet: 'Grouped sets of Business Actions triggered together',
  AssetCrossReferenceType: 'Cross-reference types linking assets to other nodes',
  Attribute: 'Product/entity attribute definitions (fields on nodes)',
  AttributeGroup: 'Logical groupings of attributes for UI and access control',
  BulkUpdateConfiguration: 'Bulk update operation configurations',
  BusinessRule: 'JavaScript business logic executed in STEP Rhino engine',
  CharacterTag: 'Rich text character formatting tags',
  Classification: 'Hierarchical classification nodes (categories, folders)',
  ClassificationCrossReferenceType: 'Cross-reference types between classifications',
  ClassificationProductLinkType: 'Link types between classifications and products',
  Collection: 'Named collections for grouping nodes',
  CollectionGroup: 'Organizational groups for collections',
  DataContainerType: 'Data container type definitions (tables/rows on nodes)',
  DerivedEventTypes: 'Derived event type definitions for event processing',
  Entity: 'Entity node instances (suppliers, partners, locations)',
  EntityCrossReferenceType: 'Cross-reference types for entity nodes',
  EventProcessor: 'Event-driven processing pipelines and rules',
  ExportConfiguration: 'Outbound data export configurations (OIEP)',
  FootnoteTag: 'Rich text footnote formatting tags',
  FootnoteTagGroup: 'Groups of footnote tags',
  GatewayIntegrationEndpoint: 'Gateway/API integration endpoint configs',
  GlobalSettings: 'System-wide global setting definitions',
  HyperlinkTagGroup: 'Groups of hyperlink formatting tags',
  ImageConversionConfiguration: 'Image format conversion settings',
  ImportConfiguration: 'Inbound data import configurations (IIEP)',
  InBoundIntegrationEndpoint: 'Inbound integration endpoint configs (IIEP)',
  Key: 'External key / unique identifier definitions',
  ListOfValue: 'Enumerated value lists (LOVs) for attribute validation',
  ListOfValueGroup: 'Organizational groups for LOVs',
  MatchingAlgorithm: 'Node matching/deduplication algorithm configs',
  Model: 'Data model definitions',
  OutBoundIntegrationEndpoint: 'Outbound integration endpoint configs (OIEP)',
  PortalConfiguration: 'Portal/WebUI configuration settings',
  Product: 'Product hierarchy instances (size schemas, core tables)',
  ProductCrossReferenceType: 'Cross-reference types between products',
  STEPWorkflow: 'Workflow definitions (states, transitions, actions)',
  SetupEntity: 'Setup/configuration entity instances',
  SetupGroup: 'BR organizational containers (maps to 3-tier layers)',
  SpecialCharacterTag: 'Rich text special character tags',
  SpecialCharacterTagGroup: 'Groups of special character tags',
  StatusFlag: 'Status flag definitions for node lifecycle',
  StyleTag: 'Rich text style formatting tags',
  StyleTagGroup: 'Groups of style tags',
  SystemSetup: 'System setup and configuration root',
  TransformationLookupTableConfiguration: 'Data transformation lookup tables',
  UserGroup: 'User group definitions for access control',
  UserType: 'Object type definitions (Product, Colorway, SV, SKU, etc.)',
};

// ─── Summary index (existing behavior) ─────────────────────────────────────

function getEntries() {
  var items = fs.readdirSync(STEP_CONFIGS);
  var results = [];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var fullPath = path.join(STEP_CONFIGS, item);
    var stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      var files = fs.readdirSync(fullPath);
      var sampleIds = files
        .slice(0, 3)
        .map(function (f) {
          return f.replace(/^[A-Za-z]+_/, '').replace(/\.(js|xml)$/, '');
        });
      var ext = files.length > 0 && files[0].endsWith('.js') ? '.js' : '.xml';
      results.push({
        type: item,
        count: files.length,
        pattern: item + '_<ID>' + ext,
        purpose: PURPOSE_MAP[item] || 'STEP configuration',
        samples: sampleIds.join(', '),
      });
    } else if (item.endsWith('.xml')) {
      var name = item.replace('.xml', '');
      results.push({
        type: name,
        count: 1,
        pattern: item,
        purpose: PURPOSE_MAP[name] || 'STEP configuration',
        samples: '(single file)',
      });
    }
  }

  results.sort(function (a, b) { return b.count - a.count; });
  return results;
}

function generateIndex(entries) {
  var lines = [
    '# STEP Data Model Index',
    '',
    '> Auto-generated by `npm run generate-data-model-index`. Do not edit manually.',
    '',
    '| Type | Count | File Pattern | Purpose | Sample IDs |',
    '|------|------:|--------------|---------|------------|',
  ];

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    lines.push(
      '| ' + e.type +
      ' | ' + e.count +
      ' | `' + e.pattern + '`' +
      ' | ' + e.purpose +
      ' | ' + e.samples +
      ' |'
    );
  }

  lines.push('');
  lines.push('**Total types:** ' + entries.length + '  ');
  lines.push('**Total files:** ' + entries.reduce(function (sum, e) { return sum + e.count; }, 0));
  lines.push('');
  lines.push('For detailed catalogs see `docs/data-model/`.');
  lines.push('');
  return lines.join('\n');
}

// ─── Detail mode: parse XML for Attributes, LOVs, UserTypes ────────────────

function createParser() {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: function (name) {
      // Force arrays for elements that can repeat
      return ['Value', 'Attribute', 'ListOfValue', 'AttributeGroupLink', 'UserTypeLink'].indexOf(name) !== -1;
    },
  });
}

function asArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

// ─── Attributes detail ─────────────────────────────────────────────────────

function parseAttributes() {
  var dir = path.join(STEP_CONFIGS, 'Attribute');
  if (!fs.existsSync(dir)) return [];
  var parser = createParser();
  var results = [];

  var files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.xml'); });
  files.forEach(function (file) {
    try {
      var xml = fs.readFileSync(path.join(dir, file), 'utf8');
      var doc = parser.parse(xml);
      var attrList = doc['STEP-ProductInformation'] && doc['STEP-ProductInformation']['AttributeList'];
      if (!attrList) return;

      var attrs = asArray(attrList['Attribute']);
      attrs.forEach(function (attr) {
        var id = attr['@_ID'] || '';
        var name = '';
        var nameNode = attr['Name'];
        if (typeof nameNode === 'string') name = nameNode;
        else if (nameNode && typeof nameNode === 'object') name = nameNode['#text'] || '';

        var lov = '';
        var lovLink = attr['ListOfValueLink'];
        if (lovLink) lov = lovLink['@_ListOfValueID'] || '';

        var datatype = '';
        var purpose = '';
        var metaData = attr['MetaData'];
        if (metaData) {
          var values = asArray(metaData['Value']);
          values.forEach(function (v) {
            var attrId = v['@_AttributeID'] || '';
            var text = v['#text'] || '';
            if (attrId === 'Datatype') datatype = text;
            if (attrId === 'Purpose') purpose = text;
          });
        }

        var groups = asArray(attr['AttributeGroupLink']).map(function (g) {
          return g['@_AttributeGroupID'] || '';
        }).filter(Boolean);

        var userTypes = asArray(attr['UserTypeLink']).map(function (u) {
          return u['@_UserTypeID'] || '';
        }).filter(Boolean);

        results.push({
          id: id,
          name: name,
          datatype: datatype,
          productMode: attr['@_ProductMode'] || '',
          mandatory: attr['@_Mandatory'] || 'false',
          lov: lov,
          purpose: purpose.slice(0, 120),
          groupCount: groups.length,
          userTypeCount: userTypes.length,
        });
      });
    } catch (err) {
      // skip unparseable files
    }
  });

  results.sort(function (a, b) { return a.id.localeCompare(b.id); });
  return results;
}

function generateAttributesDoc(attrs) {
  var lines = [
    '# Attribute Catalog',
    '',
    '> Auto-generated by `npm run generate-data-model-docs`. Do not edit manually.',
    '',
    '**Total attributes:** ' + attrs.length,
    '',
    '| ID | Name | Datatype | ProductMode | LOV | Mandatory | Groups | UserTypes |',
    '|:---|:-----|:---------|:------------|:----|:----------|-------:|----------:|',
  ];

  attrs.forEach(function (a) {
    lines.push(
      '| `' + a.id + '`' +
      ' | ' + a.name +
      ' | ' + a.datatype +
      ' | ' + a.productMode +
      ' | ' + (a.lov ? '`' + a.lov + '`' : '') +
      ' | ' + a.mandatory +
      ' | ' + a.groupCount +
      ' | ' + a.userTypeCount +
      ' |'
    );
  });
  lines.push('');
  return lines.join('\n');
}

// ─── LOV detail ─────────────────────────────────────────────────────────────

function parseLOVs() {
  var dir = path.join(STEP_CONFIGS, 'ListOfValue');
  if (!fs.existsSync(dir)) return [];
  var parser = createParser();
  var results = [];

  var files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.xml'); });
  files.forEach(function (file) {
    try {
      var xml = fs.readFileSync(path.join(dir, file), 'utf8');
      var doc = parser.parse(xml);
      var lovs = doc['STEP-ProductInformation'] && doc['STEP-ProductInformation']['ListsOfValues'];
      if (!lovs) return;

      var lovList = asArray(lovs['ListOfValue']);
      lovList.forEach(function (lov) {
        var id = lov['@_ID'] || '';
        var name = '';
        var nameNode = lov['Name'];
        if (typeof nameNode === 'string') name = nameNode;
        else if (nameNode && typeof nameNode === 'object') name = nameNode['#text'] || '';

        var useValueID = lov['@_UseValueID'] || 'false';
        var parentID = lov['@_ParentID'] || '';
        var values = asArray(lov['Value']);

        results.push({
          id: id,
          name: name,
          parentGroup: parentID,
          useValueID: useValueID,
          valueCount: values.length,
        });
      });
    } catch (err) {
      // skip
    }
  });

  results.sort(function (a, b) { return a.id.localeCompare(b.id); });
  return results;
}

function generateLOVDoc(lovs) {
  var lines = [
    '# List of Values (LOV) Catalog',
    '',
    '> Auto-generated by `npm run generate-data-model-docs`. Do not edit manually.',
    '',
    '**Total LOVs:** ' + lovs.length,
    '',
    '| ID | Name | Parent Group | UseValueID | Values |',
    '|:---|:-----|:-------------|:-----------|-------:|',
  ];

  lovs.forEach(function (l) {
    lines.push(
      '| `' + l.id + '`' +
      ' | ' + l.name +
      ' | ' + l.parentGroup +
      ' | ' + l.useValueID +
      ' | ' + l.valueCount +
      ' |'
    );
  });
  lines.push('');
  return lines.join('\n');
}

// ─── UserType detail ────────────────────────────────────────────────────────

function parseUserTypes() {
  var dir = path.join(STEP_CONFIGS, 'UserType');
  if (!fs.existsSync(dir)) return [];
  var parser = createParser();
  var results = [];

  var files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.xml'); });
  files.forEach(function (file) {
    try {
      var xml = fs.readFileSync(path.join(dir, file), 'utf8');
      var doc = parser.parse(xml);
      var userTypes = doc['STEP-ProductInformation'] && doc['STEP-ProductInformation']['UserTypes'];
      if (!userTypes) return;

      // UserTypes can be nested under UserType directly or under UserType > UserType
      function extractTypes(container) {
        if (!container) return;
        var types = asArray(container['UserType']);
        types.forEach(function (ut) {
          var id = ut['@_ID'] || '';
          var name = '';
          var nameNode = ut['Name'];
          if (typeof nameNode === 'string') name = nameNode;
          else if (nameNode && typeof nameNode === 'object') name = nameNode['#text'] || '';

          results.push({ id: id, name: name });
          // Recurse for nested types
          extractTypes(ut);
        });
      }
      extractTypes(userTypes);
    } catch (err) {
      // skip
    }
  });

  results.sort(function (a, b) { return a.id.localeCompare(b.id); });
  // Deduplicate by ID
  var seen = {};
  results = results.filter(function (r) {
    if (seen[r.id]) return false;
    seen[r.id] = true;
    return true;
  });
  return results;
}

function generateUserTypesDoc(types) {
  var lines = [
    '# Object Types (UserType) Catalog',
    '',
    '> Auto-generated by `npm run generate-data-model-docs`. Do not edit manually.',
    '',
    '**Total object types:** ' + types.length,
    '',
    '| ID | Name |',
    '|:---|:-----|',
  ];

  types.forEach(function (t) {
    lines.push('| `' + t.id + '` | ' + t.name + ' |');
  });
  lines.push('');
  return lines.join('\n');
}

// ─── Main ───────────────────────────────────────────────────────────────────

var doWrite = process.argv.includes('--write');
var doDetail = process.argv.includes('--detail');

var entries = getEntries();
var indexMd = generateIndex(entries);

if (doWrite) {
  fs.writeFileSync(INDEX_PATH, indexMd, 'utf8');
  console.log('Written index: ' + INDEX_PATH + ' (' + entries.length + ' types)');
} else if (!doDetail) {
  console.log(indexMd);
}

if (doDetail) {
  if (!XMLParser) {
    console.error('Error: fast-xml-parser is required for --detail mode. Run: npm install');
    process.exit(1);
  }

  if (!fs.existsSync(DETAIL_DIR)) {
    fs.mkdirSync(DETAIL_DIR, { recursive: true });
  }

  // Attributes
  var attrs = parseAttributes();
  var attrMd = generateAttributesDoc(attrs);
  var attrPath = path.join(DETAIL_DIR, 'attributes.md');
  fs.writeFileSync(attrPath, attrMd, 'utf8');
  console.log('Written: ' + attrPath + ' (' + attrs.length + ' attributes)');

  // LOVs
  var lovs = parseLOVs();
  var lovMd = generateLOVDoc(lovs);
  var lovPath = path.join(DETAIL_DIR, 'lov-summary.md');
  fs.writeFileSync(lovPath, lovMd, 'utf8');
  console.log('Written: ' + lovPath + ' (' + lovs.length + ' LOVs)');

  // UserTypes
  var types = parseUserTypes();
  var typesMd = generateUserTypesDoc(types);
  var typesPath = path.join(DETAIL_DIR, 'user-types.md');
  fs.writeFileSync(typesPath, typesMd, 'utf8');
  console.log('Written: ' + typesPath + ' (' + types.length + ' types)');
}

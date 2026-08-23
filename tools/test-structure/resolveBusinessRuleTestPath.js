#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

process.stdout.on("error", (error) => {
  if (error && error.code === "EPIPE") {
    process.exit(0);
  }

  throw error;
});

const repoRoot = process.cwd();
const businessRuleDir = path.join(repoRoot, "step-configs", "BusinessRule");
const setupGroupDir = path.join(repoRoot, "step-configs", "SetupGroup");

function parseArgs(argv) {
  const args = {
    kind: "unit",
    format: "pretty",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--file") {
      args.file = argv[i + 1];
      i += 1;
    } else if (arg === "--kind") {
      args.kind = argv[i + 1];
      i += 1;
    } else if (arg === "--all") {
      args.all = true;
    } else if (arg === "--format") {
      args.format = argv[i + 1];
      i += 1;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error("Unknown argument: " + arg);
    }
  }

  return args;
}

function usage() {
  return [
    "Usage:",
    "  node tools/test-structure/resolveBusinessRuleTestPath.js --file \"step-configs/BusinessRule/BusinessRule_returnValuesJSON.js\" --kind unit",
    "  node tools/test-structure/resolveBusinessRuleTestPath.js --file \"step-configs/BusinessRule/BusinessRule_MakeSelectedAssetPrimary.js\" --kind integration --format json",
    "  node tools/test-structure/resolveBusinessRuleTestPath.js --all --format json",
    "",
    "Options:",
    "  --file <path>       Resolve one Business Rule file",
    "  --all               Resolve all Business Rule files in the export folder",
    "  --kind <type>       unit or integration (default: unit)",
    "  --format <type>     pretty or json (default: pretty)",
  ].join("\n");
}

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractBusinessRuleDefinition(fileContent, sourcePath) {
  const match = fileContent.match(
    /\/\*===== business rule definition =====\s*([\s\S]*?)\s*\*\//
  );

  if (!match) {
    throw new Error("Business rule definition block not found in " + sourcePath);
  }

  return JSON.parse(match[1]);
}

function findSetupGroupParent(setupGroup) {
  if (!setupGroup) {
    return null;
  }

  const xmlPath = path.join(setupGroupDir, "SetupGroup_" + setupGroup + ".xml");
  if (!fs.existsSync(xmlPath)) {
    return null;
  }

  const xml = readFile(xmlPath);
  const escapedSetupGroup = setupGroup.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    '<SetupGroup\\s+ID="' + escapedSetupGroup + '"[^>]*\\sParentID="([^"]+)"'
  );
  const match = xml.match(pattern);

  if (!match) {
    return null;
  }

  return {
    parentId: match[1],
    xmlPath,
  };
}

function relativeRepoPath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

function buildTestFileName(businessRuleFileName, kind) {
  const baseName = businessRuleFileName.replace(/\.js$/, "");
  if (kind === "integration") {
    return baseName + ".int.test.js";
  }

  return baseName + ".test.js";
}

function resolveBusinessRule(filePath, kind) {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(repoRoot, filePath);
  const sourcePath = relativeRepoPath(absolutePath);
  const definition = extractBusinessRuleDefinition(readFile(absolutePath), sourcePath);
  const setupGroup = Array.isArray(definition.setupGroups) ? definition.setupGroups[0] : null;
  const setupGroupInfo = findSetupGroupParent(setupGroup);
  const parentLayer = setupGroupInfo ? setupGroupInfo.parentId : "Unmapped";
  const testDir = path.join(
    repoRoot,
    "test",
    "BusinessRule",
    kind,
    parentLayer,
    setupGroup || "Unmapped"
  );
  const testPath = path.join(
    testDir,
    buildTestFileName(path.basename(absolutePath), kind)
  );

  return {
    businessRuleId: definition.id || null,
    businessRuleType: definition.type || null,
    businessRulePath: sourcePath,
    setupGroup: setupGroup || null,
    parentLayer,
    setupGroupXmlPath: setupGroupInfo ? relativeRepoPath(setupGroupInfo.xmlPath) : null,
    kind,
    expectedTestPath: relativeRepoPath(testPath),
    expectedTestAbsolutePath: testPath,
  };
}

function listBusinessRuleFiles() {
  return fs
    .readdirSync(businessRuleDir)
    .filter((fileName) => fileName.endsWith(".js"))
    .sort()
    .map((fileName) => path.join(businessRuleDir, fileName));
}

function printPretty(result) {
  const lines = [
    "Business Rule: " + result.businessRulePath,
    "ID: " + (result.businessRuleId || "<unknown>"),
    "Type: " + (result.businessRuleType || "<unknown>"),
    "setupGroup: " + (result.setupGroup || "<missing>"),
    "Parent layer: " + result.parentLayer,
    "SetupGroup XML: " + (result.setupGroupXmlPath || "<missing>"),
    "Test kind: " + result.kind,
    "Expected test path: " + result.expectedTestPath,
    "Expected absolute path: " + result.expectedTestAbsolutePath,
  ];

  process.stdout.write(lines.join("\n") + "\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    process.stdout.write(usage() + "\n");
    return;
  }

  if (args.kind !== "unit" && args.kind !== "integration") {
    throw new Error("--kind must be unit or integration");
  }

  if (!args.file && !args.all) {
    throw new Error("Pass --file or --all\n\n" + usage());
  }

  const results = args.all
    ? listBusinessRuleFiles().map((filePath) => resolveBusinessRule(filePath, args.kind))
    : [resolveBusinessRule(args.file, args.kind)];

  if (args.format === "json") {
    process.stdout.write(JSON.stringify(args.all ? results : results[0], null, 2) + "\n");
    return;
  }

  if (args.format !== "pretty") {
    throw new Error("--format must be pretty or json");
  }

  results.forEach((result, index) => {
    if (index > 0) {
      process.stdout.write("\n");
    }
    printPretty(result);
  });
}

try {
  main();
} catch (error) {
  process.stderr.write(String(error.message || error) + "\n");
  process.exit(1);
}

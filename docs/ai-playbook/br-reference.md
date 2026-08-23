# Business Rule Reference

> On-demand reference — loaded when writing or modifying BRs, debugging metadata issues, or working with binds.

## Metadata Blocks

Every BR file has three metadata blocks that must NOT be modified manually:

```javascript
/*===== export metadata =====
{ "contextId" : "", "workspaceId" : "Main" }
*/
/*===== business rule definition =====
{ "id" : "...", "type" : "...", "setupGroups" : [...], "dependencies" : [...], ... }
*/
/*===== business rule plugin definition =====
{ "pluginId" : "...", "binds" : [...], ... }
*/
// Actual code starts after metadata. Entry point: exports.operationN = function (bind1, bind2, ...) { }
```

### Deployment contextId Requirement
- **All `.js` BR files**: `"contextId" : "Context1"` in export metadata block (mandatory)
- **All `.xml` files**: `ContextID="Context1"` on the root `<STEP-ProductInformation>` element (mandatory)
- Missing `contextId`/`ContextID` causes deployment failure

## Binds (Dependency Injection)

BRs receive STEP objects via binds defined in the plugin definition metadata:

| Contract | Purpose |
|----------|---------|
| `CurrentObjectBindContract` | The node being processed |
| `ManagerBindContract` | STEP manager (access to homes: attribute, reference type, etc.) |
| `BusinessFunctionBindContract` | Callable business functions |
| `BusinessActionBindContract` | Callable business actions |
| `ClassificationProductLinkTypeBindContract` | Link types |
| `ReferenceTypeBindContract` | Reference types |
| `ListOfValuesBindContract` | LOV definitions |
| `AttributeGroupBindContract` | Attribute groups |

## BusinessFunction Bind Pattern

**ALWAYS use this exact pattern** for BusinessFunctionBindContract:

```json
{
  "contract" : "BusinessFunctionBindContract",
  "alias" : "myFn",
  "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
  "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>FunctionID</BusinessFunction>\n</BusinessFunctionReference>\n",
  "description" : null
}
```

- `parameterClass` must be `BusinessFunctionReferenceImpl` (NOT `FrontBusinessFunctionImpl`)
- `value` must be the XML reference string (NOT null, NOT a plain string) — null causes "Content is not allowed in prolog" SAXParseException

### functionParameterBinds — String parameters

```json
{ "contract": "StringBindContract", "alias": "myParam", "parameterClass": "null", "value": null, "description": "..." }
```

- Use `StringBindContract` for string params (NOT `parameterType: "java.lang.String"`)
- Other available contracts: `NodeBindContract`, `BooleanBindContract`, `ListOfStringsBindContract`

## STEP Scripting API — Correct Method Calls

### Rhino var-in-loops bug (CRITICAL)
**NEVER** use `const` or `let` for variables declared inside a loop body in Rhino — Rhino holds the first iteration's value for all subsequent iterations. Use `var` for all loop-body variables. `var` in the for-initializer (`for (var i = 0; ...)`) is fine.

**General rule**: In WebUIContext BRs and any BR that involves loops, prefer `var` over `const`/`let`.

### Calling BusinessFunction binds
- **No params**: `myFn.evaluate({})` — JS empty object is fine
- **With string params**: MUST use `java.util.HashMap`:
  ```javascript
  var params = new java.util.HashMap();
  params.put("aliasName", value);
  myFn.evaluate(params);
  ```
  - WRONG: `myFn.evaluate({"alias": value})` — JS object literal fails with "Missing data for RequiredBind" for StringBindContract params
  - JS object literals only work reliably when params include NodeBindContract objects

### Other common gotchas
- **Delete node binary content**: `node.getContent().delete()` (NOT `node.getAssetContent().delete()`)
- **Change object type**: Must resolve type object first:
  ```javascript
  var newType = node.getManager().getObjectTypeHome().getObjectTypeByID("TypeID");
  node.setObjectType(newType);
  ```
  WRONG: `node.setObjectType("TypeID")` — takes an ObjectType object, not a string ID

## Test Organization

Tests use the canonical STEP hierarchy:
- `test/BusinessRule/unit/<ParentLayer>/<SetupGroup>/` — Unit tests
- `test/BusinessRule/integration/<ParentLayer>/<SetupGroup>/` — Integration tests
- `test/BusinessRule/support/` — Shared test harness, mocks, fixtures, factories, utilities
- `test/BusinessRule/validate/` — Repo-wide validation tests
- `test/BusinessRule/config/` — Existing shared helpers

For placement rules see: `docs/ai-playbook/test-structure.md`

## Required Authoring Conventions for New/Touched BR Code

- Add JSDoc for all newly created functions.
- When modifying an existing function, add or update its JSDoc.
- For WebUIContext and BRs already using the shared logger helper, use `p(ui, severity, message)` for logging.
- Debug traces should follow `p(ui, "INFO", "[DEBUG] ...")` unless the BR has an established approved pattern.

## Required Test Baseline for Code Changes

- Every BR code change must ship with automated tests.
- Include unit and integration tests for changed behavior.
- Integration-test exception is allowed only for pure transformer/helper logic with no STEP reads/writes and no orchestration side effects, and must be explicitly documented in the PR/agent output.
- Include explicit test coverage for null, missing, and empty string inputs for touched fields/transformations.
- Include non-target object-type guard/no-op coverage where applicable.

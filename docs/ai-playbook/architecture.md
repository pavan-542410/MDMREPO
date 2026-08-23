# Architecture Reference

> On-demand reference — loaded when working on BR architecture, layer placement, or library usage.

## Business Rule Types

| Type | Purpose | setupGroups Examples |
|------|---------|---------------------|
| **BusinessAction** | Execute operations (write attributes, create links, workflow transitions) | Actions, BulkUpdateActions, EventQueueContext, ApprovalContext, StyleVariantActions |
| **BusinessCondition** | Return true/false for workflow gating or validation | Conditions, MandatoryAttributionConditions, EventFilterConditions |
| **BusinessFunction** | Return computed values, called by other BRs | BusinessFunctions, DataFetchers, DataTransformers, NodeFetchers, BusinessRuleParameters |
| **BusinessLibrary** | Shared utility code, imported via `dependencies` in metadata | Libraries, UtilityLayer |

## WebUI vs Workbench Guard

Always check `isWebUI()` before calling `ui.navigate()` or `ui.showAlert()` — Workbench/batch runs have a different `ui` implementation.

```javascript
// Guard pattern
ui != null && ui.getClass().getName() === "com.stibo.webui.bindaction.server.bind.WebUiContextImpl"
```

### Logger pattern for WebUIContext BRs
Always use `p(ui, severity, message)` — routes to `ui.showAlert()` in browser, falls back to `logger.*` server-side:

```javascript
function p(ui, severity, message) {
  if (ui.getClass().getName() + "" === "com.stibo.webui.bindaction.server.bind.WebUiContextImpl") {
    ui.showAlert(severity, message);
  } else {
    if (severity === "ERROR") { logger.warning(message); }
    else                      { logger.info(message); }
  }
}
```

Called as: `p(ui, "INFO", "message")`, `p(ui, "WARNING", "message")`, `p(ui, "ERROR", "message")`
Debug convention: `p(ui, "INFO", "[DEBUG] <message>")`

## EventFilterConditions

BRs of type `BusinessCondition`, parent `GlobalBusinessRulesRoot`. Return `true` to pass or a rejection string to drop the event.

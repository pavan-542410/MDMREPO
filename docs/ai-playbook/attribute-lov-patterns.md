# Attribute + LOV Implementation Patterns

Use this guide when creating new attributes and LOVs from repository conventions, without depending on STEP Workbench authoring.

---

## Goal

Create new attribute and LOV XML files by reusing established patterns across:
- `step-configs/Attribute/Attribute_*.xml`
- `step-configs/ListOfValue/ListOfValue_*.xml`

Do not copy one artifact blindly. Derive a generalized structure from multiple similar files.

---

## Attribute Authoring Rules

1. File path and naming:
- `step-configs/Attribute/Attribute_<attribute_id>.xml`
- Attribute IDs use `snake_case`.

2. Root and context:
- Root must be `<STEP-ProductInformation ... ContextID="Context1" WorkspaceID="Main" ...>`.
- Include `<Qualifiers>` with `en-US`.

3. Core attribute fields:
- Set `MultiValued`, `Mandatory`, `Derived`, and `ProductMode` from Jira AC and node scope.
- For non-derived attributes, keep `HierarchicalFiltering="false"` and `ClassificationHierarchicalFiltering="false"` unless AC says otherwise.
- For derived attributes, use `Derived="true"` and `ProductMode="Property"`; add `<ValueTemplate>` with confirmed derive expression.

4. Type and validation:
- Non-LOV attributes must include `<Validation BaseType="...">`.
- Allowed base types: `text`, `integer`, `number`, `isodatetime`, `boolean`.

5. Required metadata:
- Always include `Datatype`.
- Always include `Purpose` (from Jira intent).
- Include `ExternalSystemAttrID` when required by external integrations.

6. Node and group links:
- Add `UserTypeLink` values for active nodes and matching `Deleted*` nodes.
- Add `AttributeGroupLink` entries based on existing conventions for the same business domain.

---

## LOV Authoring Rules

1. File path and naming:
- `step-configs/ListOfValue/ListOfValue_<lov_id>.xml`
- LOV IDs should align with attribute naming where practical (`<attribute_id>_LOV`).

2. Reuse-first policy:
- If an existing LOV already represents the same business meaning, link the attribute to it.
- Only create a new LOV when reuse would introduce semantic mismatch.

3. Value design:
- Define stable value IDs and user-facing display names.
- Keep naming and case consistent with existing domain LOVs.
- Avoid duplicate semantic values across different IDs.

4. Internal/external variants:
- If the domain uses paired LOVs (example: standard + internal), follow the same pattern intentionally.

---

## Attribute-to-LOV Linking Rules

When an attribute is LOV-backed:
- Add `<ListOfValueLink ListOfValueID="<lov_id>"></ListOfValueLink>` in the attribute XML.
- Keep `<Validation>` aligned with string-backed LOV usage patterns in this repo.
- Confirm multi-value behavior by setting `MultiValued="true"` only when the business case needs multiple selections.

---

## Implementation Workflow

1. Discover comparable patterns:
```bash
rg -n "<Attribute ID=|<ListOfValue ID=" step-configs/Attribute step-configs/ListOfValue
```

2. Select 3-5 reference files from the same business area and compare:
- metadata
- node links
- group links
- LOV conventions

3. Draft new XML files from generalized patterns.

4. Validate and deploy:
```bash
npm run validate:xml
npm run step-deploy -- --route rest --env dev --files "<attribute_xml>[,<lov_xml>[,<group_xml>]]"
```

5. After dev validation, promote:
```bash
npm run step-deploy -- --route rest --env preprod --files "<same_file_list>"
```

---

## Acceptance Checklist

- Attribute/LOV IDs are unique and follow naming standards.
- `ContextID="Context1"` is present in new files.
- Attribute links to the correct LOV (or intentionally uses validation without LOV).
- Attribute includes required metadata, node links, and group links.
- XML validation passes before deployment.
- Dev behavior matches Jira acceptance criteria.
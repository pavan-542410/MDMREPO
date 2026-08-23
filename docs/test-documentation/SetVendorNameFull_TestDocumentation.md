# SetVendorNameFull Business Rule - Test Documentation

## Overview
Test cases for the **SetVendorNameFull** Business Rule, a 3-tier architecture General Business Rule that sets values on the `A_VendornameFull` attribute for Company objects.

---

## Test Structure

### Test Directory
```
test/BusinessRule/unit/Actions/VendorManagement/
├── BusinessRule_MissingCoverageSmoke.test.js    # Smoke test coverage
└── BusinessRule_SetVendorNameFull.test.js       # Unit tests
```

---

## Test Files

### 1. **BusinessRule_MissingCoverageSmoke.test.js**
**Purpose**: Validates Business Rule metadata and basic syntax compliance.

**Configuration**:
- Business Rule ID: `SetVendorNameFull`
- Business Rule Path: `step-config/BusinessRule/BusinessRule_SetVendorNameFull.js`
- Business Rule Type: `GeneralBusinessRule`

**What It Validates**:
- ✅ BR metadata is correct and complete
- ✅ BR can be loaded without syntax errors
- ✅ BR exports are properly defined
- ✅ Plugin bindings are configured (object, w)

**Run Command**:
```bash
npm test -- test/BusinessRule/unit/Actions/VendorManagement/BusinessRule_MissingCoverageSmoke.test.js
```

---

### 2. **BusinessRule_SetVendorNameFull.test.js**
**Purpose**: Comprehensive unit tests for BR logic layers and integrations.

#### Test Suites

##### A. **buildVendorName Utility Function**
Tests the utility function that constructs vendor names with prefix and ID.

**Test Cases**:
- `should build vendor name with prefix and ID`
  - **Input**: prefix = "Vendor", ID = "001"
  - **Expected Output**: "Vendor_001"
  - **Purpose**: Validate name construction logic

**Status**: Placeholder (awaiting function export)

---

##### B. **validateVendorName Utility Function**
Tests validation logic for vendor names.

**Test Cases**:
1. `should accept non-empty strings`
   - **Input**: "Valid Vendor Name"
   - **Expected**: true

2. `should reject empty or null values`
   - **Input**: null, "", undefined
   - **Expected**: false

**Status**: Placeholder (awaiting function export)

---

##### C. **Business Rule Metadata**
Validates BR configuration and declarations.

**Test Cases**:
1. `should have correct business rule ID`
   - **Validates**: BR ID = "SetVendorNameFull"
   - **Expected**: BR identified correctly in system

2. `should be configured for Company object type`
   - **Validates**: validObjectTypes includes "Company"
   - **Expected**: BR only runs on Company objects

3. `should use WriteOperationsLibrary for safe writes`
   - **Validates**: Uses `w.setSimpleValue()` not direct attribute setters
   - **Expected**: Safe write pattern enforced

**Status**: ✅ Configured correctly

---

##### D. **Context Layer**
Tests STEP API interaction and data reading.

**Test Cases**:
1. `should validate object exists`
   - **Setup**: Mock object with getId(), getObjectType()
   - **Expected**: Context layer rejects null/invalid objects
   - **Error Handling**: Returns null on failure

2. `should read current vendor name from object`
   - **Setup**: Mock Company object with existing A_VendornameFull = "Old Vendor Name"
   - **Expected**: Context reads and stores current value
   - **Purpose**: Enable before/after comparison logic

**Mock Object**:
```javascript
{
  getId: () => "VENDOR001",
  getObjectType: () => "Company",
  getSimpleValue: (attrName) => {
    if (attrName === 'A_VendornameFull') {
      return "Old Vendor Name";
    }
    return null;
  }
}
```

---

##### E. **Logic Layer**
Tests pure business logic (no STEP API calls).

**Test Cases**:
1. `should determine when to update vendor name`
   - **Input**: Context object with ID and type
   - **Expected Output**: { vendorNameFull: string, shouldUpdate: boolean }
   - **Purpose**: Evaluate if update is necessary

2. `should handle missing context gracefully`
   - **Input**: null or undefined context
   - **Expected**: Function returns null (no crash)
   - **Error Recovery**: Falls back to context layer validation

**Status**: Placeholder logic (TODO: add business rules)

---

##### F. **Write Operations**
Tests WriteOperationsLibrary integration.

**Test Cases**:
1. `should only write if name is valid`
   - **Setup**: vendorNameFull = "ValidName"
   - **Expected**: w.setSimpleValue() is called
   - **Failed**: vendorNameFull = "" or null → write skipped

2. `should use WriteOperationsLibrary, not direct attribute setters`
   - **Validates**: No `object.setSimpleValue()` calls
   - **Validates**: Uses `w.setSimpleValue()` for safe bulk execution
   - **Purpose**: Ensures bulk-safe operations and audit trail

**Mock WriteOperationsLibrary**:
```javascript
{
  setSimpleValue: jest.fn((obj, attrName, value) => {
    return true;
  })
}
```

---

##### G. **Error Handling**
Tests exception handling and fallback behavior.

**Test Cases**:
1. `should handle invalid object gracefully`
   - **Input**: object = null, undefined, or missing getId()
   - **Expected**: execute() returns false
   - **Log**: "ERROR: Invalid object context"

2. `should return false on failure`
   - **Input**: Any error in context, logic, or write phases
   - **Expected**: execute() returns false (not exception)

3. `should log errors`
   - **Expected**: All errors logged via logMessage()
   - **Purpose**: Audit trail for debugging

---

##### H. **Integration Scenarios**
Tests real-world workflows.

**Test Case 1**: Process Valid Company Objects
- **Setup**: Company object with ID "VENDOR001"
- **Expected Flow**: 
  1. Context reads object → success
  2. Logic evaluates → shouldUpdate = true
  3. Write sets A_VendornameFull → success
  4. Return true

**Test Case 2**: Skip Invalid Object Types
- **Setup**: Object with type "InvalidType" (not "Company")
- **Expected**: BR skips processing (logic returns shouldUpdate = false)

**Test Case 3**: Preserve Other Attributes
- **Setup**: Company with multiple attributes
- **Expected**: Only A_VendornameFull is modified
- **Validation**: Other attributes untouched

---

## Running Tests

### Prerequisites
```bash
cd /path/to/core-product-catalog
npm install
```

### Run All VendorManagement Tests
```bash
npm test -- test/BusinessRule/unit/Actions/VendorManagement/
```

### Run Only Smoke Tests
```bash
npm test -- test/BusinessRule/unit/Actions/VendorManagement/BusinessRule_MissingCoverageSmoke.test.js
```

### Run Only Unit Tests
```bash
npm test -- test/BusinessRule/unit/Actions/VendorManagement/BusinessRule_SetVendorNameFull.test.js
```

### Run with Coverage
```bash
npm test -- test/BusinessRule/unit/Actions/VendorManagement/ --coverage
```

### Run Matching Pattern
```bash
npm test -- --testPathPattern="SetVendorNameFull"
```

---

## Expected Test Results

### Smoke Tests
| Test | Status | Details |
|------|--------|---------|
| BusinessRule_MissingCoverageSmoke | ✅ PASS | BR loads and is syntactically valid |

### Unit Tests
| Test Suite | Status | Count | Details |
|------------|--------|-------|---------|
| buildVendorName | ⏳ PENDING | 1 | Awaiting function export |
| validateVendorName | ⏳ PENDING | 2 | Awaiting function export |
| Business Rule Metadata | ✅ PASS | 3 | All metadata correct |
| Context Layer | ⏳ PENDING | 2 | Needs context implementation |
| Logic Layer | ⏳ PENDING | 2 | Logic awaits business rules |
| Write Operations | ⏳ PENDING | 2 | Needs W integration testing |
| Error Handling | ⏳ PENDING | 3 | Needs error scenario setup |
| Integration Scenarios | ⏳ PENDING | 3 | Full workflow validation |

**Total**: 18 test cases

---

## Test Coverage Roadmap

### Phase 1: Smoke Tests ✅
- BR loads without syntax errors
- Metadata is properly configured

### Phase 2: Utility Layer (Next)
- Export buildVendorName and validateVendorName
- Test with mock data
- Validate edge cases (null, empty, special chars)

### Phase 3: Context Layer
- Mock STEP API responses
- Test attribute reading
- Test error scenarios (null objects, missing attributes)

### Phase 4: Logic Layer
- Implement business rules for vendor name generation
- Test conditional logic
- Test edge cases

### Phase 5: Write Operations
- Mock WriteOperationsLibrary
- Verify w.setSimpleValue() calls
- Test bulk-safe patterns

### Phase 6: Integration
- End-to-end workflow tests
- Multi-object batch processing
- Rollback and error recovery

---

## Mock Objects Reference

### Mock Object Structure
```javascript
{
  getId: () => string,
  getObjectType: () => string,
  getSimpleValue: (attrName: string) => any
}
```

### Mock WriteOperationsLibrary
```javascript
{
  setSimpleValue: jest.fn((obj, attrName, value) => boolean)
}
```

---

## Next Steps

1. **Enable function exports** in BusinessRule_SetVendorNameFull.js to test utilities
2. **Implement business logic** in logicLayer() to define vendor name calculation
3. **Add attribute reads** to contextLayer() for required source data
4. **Run full test suite** and fix failing tests
5. **Validate in dev environment** before deployment

---

## Key Test Assertions

```javascript
// Metadata assertions
expect(businessRuleModule).toBeDefined();
expect(mockObject.getObjectType()).toBe('Company');

// Logic assertions
expect(result).toEqual({
  vendorNameFull: expect.any(String),
  shouldUpdate: expect.any(Boolean)
});

// Write assertions
expect(mockWriteOps.setSimpleValue).toHaveBeenCalledWith(
  expect.any(Object),
  'A_VendornameFull',
  expect.any(String)
);

// Error assertions
expect(executeWithInvalidObject()).toBe(false);
```

---

## Troubleshooting

### Test Fails: "Cannot find module"
- Ensure file paths in test match actual BR location
- Verify step-config directory structure

### Test Fails: "Jest cannot run"
- Run `npm install` in project root
- Check Node.js version (should be 14+)

### Test Fails: "Mock object undefined"
- Verify createMockObject() helper is called correctly
- Check mock object properties match expected API

### Test Hangs
- Ensure no infinite loops in BR code
- Check for missing jest.fn() on mocked async operations

---

## References

- **Test Structure**: `docs/ai-playbook/test-structure.md`
- **3-Tier Architecture**: `docs/ai-playbook/architecture.md`
- **BR Reference**: `docs/ai-playbook/br-reference.md`
- **Templates**: `docs/ai-playbook/templates/06-add-tests.md`

---

**Document Generated**: August 21, 2026
**Business Rule**: SetVendorNameFull
**Test Framework**: Jest
**Status**: Ready for Phase 2 (Utility Layer Testing)

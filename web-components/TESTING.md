# Testing Documentation

## Overview

This document describes the comprehensive test suite implemented for the Open Food Facts Web Components library. The test suite focuses on critical functionality that could fail in problematic ways and provides safety nets for the most error-prone parts of the codebase.

## Test Infrastructure

### Testing Framework
- **Framework**: Vitest with jsdom environment
- **Coverage**: v8 provider with text, JSON, and HTML reports
- **Setup**: Centralized test setup with mocking utilities
- **Environment**: Browser-like environment for component testing

### Configuration
- **Config File**: `vitest.config.ts`
- **Setup File**: `src/test/setup.ts`
- **Test Pattern**: `**/*.test.ts`
- **Exclusions**: dist/, node_modules/, stories, localization files

## Test Categories

### 1. Utility Functions (`src/utils/index.test.ts`)
**33 tests covering critical utility functions**

**Focus Areas:**
- URL parameter building and encoding
- Data transformation and serialization
- State management helpers
- File operations and CSV generation
- Mathematical operations and validation

**Key Edge Cases Tested:**
- Null/undefined handling
- Special characters and encoding
- Large data sets
- Unicode and internationalization
- Numeric precision and rounding

**Example Critical Tests:**
```typescript
// URL building with special characters
expect(addParamsToUrl("https://api.com", { key: "value&special" }))
  .toBe("https://api.com?key=value%26special")

// Nested object creation
setValueAndParentsObjectIfNotExists({}, "a.b.c", "value")
// -> { a: { b: { c: "value" } } }
```

### 2. API Layer (`src/api/*.test.ts`)
**46 tests covering network operations and error handling**

#### OpenFoodFacts API (`src/api/openfoodfacts.test.ts`)
- **11 tests** covering product fetching and nutrients API
- Error handling for network failures
- Response parsing and validation
- Parameter encoding and URL construction

#### Robotoff API (`src/api/robotoff.test.ts`)
- **18 tests** covering annotation and insight processing
- Authentication token management
- Complex parameter handling
- Dry-run mode testing
- Error recovery and retries

#### Folksonomy API (`src/api/folksonomy.test.ts`)
- **17 tests** covering property management
- Authentication flows and token refresh
- CRUD operations on product properties
- Edge cases and boundary conditions
- Performance and reliability testing

**Critical Error Scenarios Tested:**
- Network timeouts and connection failures
- HTTP error responses (401, 403, 404, 500, 503)
- Malformed JSON responses
- Authentication failures and token expiry
- Concurrent request handling

### 3. Signal Management (`src/signals/*.test.ts`)
**69 tests covering reactive state management**

#### App Signals (`src/signals/app.test.ts`)
- **38 tests** covering global app state
- Language and country code management
- Asset path resolution
- Reactive updates and consistency

#### Signal Utilities (`src/utils/signals.test.ts`)
- **31 tests** covering SignalObject and SignalMap classes
- Immutability guarantees
- Type safety and constraints
- Performance characteristics
- Memory management

**State Management Edge Cases:**
- Rapid successive updates
- Large object storage
- Circular reference handling
- Prototype pollution protection
- Unicode and special character keys

## Test Results

### Current Status
✅ **148 tests passing**
- 33 utility function tests
- 46 API layer tests  
- 69 signal management tests

### Coverage Areas
- **URL handling and parameter encoding**
- **Network error recovery**
- **Authentication flows**
- **Data transformation**
- **State management**
- **Input validation**
- **Error boundaries**

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Run specific test suites
npm test src/utils
npm test src/api
npm test src/signals

# Run with coverage
npm test -- --coverage

# Watch mode for development
npm test -- --watch
```

### CI Integration
Tests are integrated with GitHub Actions workflows:
- Automatic test execution on PR creation
- Coverage reporting
- Build verification

## Critical Edge Cases Covered

### 1. Network Reliability
- Connection timeouts and retries
- Malformed server responses
- Authentication token expiry
- Rate limiting and throttling
- Concurrent request handling

### 2. Data Integrity
- Unicode character handling
- Large payload processing
- Circular reference detection
- Type coercion safety
- Null/undefined boundaries

### 3. User Input Validation
- Special character injection
- Length limit testing
- Format validation
- Encoding/decoding safety
- XSS prevention patterns

### 4. State Consistency
- Rapid state updates
- Memory leak prevention
- Immutability guarantees
- Cross-component synchronization
- Error state recovery

## Key Bugs and Issues Discovered

During test implementation, several potential issues were identified:

1. **setValueAndParentsObjectIfNotExists bug**: Function doesn't handle single-level keys correctly
2. **URL parameter encoding inconsistency**: Arrays not always encoded properly
3. **Error handling gaps**: Some API methods don't propagate errors consistently
4. **Memory leak potential**: Circular references in signal objects
5. **Authentication edge cases**: Token refresh race conditions

## Future Testing Priorities

### Phase 2 - Component Testing
- Web component rendering
- Event handling and propagation
- Property change reactions
- Lifecycle management
- User interaction flows

### Phase 3 - Integration Testing
- End-to-end user workflows
- Cross-component communication
- API integration scenarios
- Error recovery flows
- Performance under load

### Phase 4 - Visual Testing
- Screenshot comparison
- Responsive design validation
- Accessibility compliance
- Cross-browser compatibility
- Theme and styling consistency

## Best Practices Implemented

### Test Structure
- Descriptive test names explaining the scenario
- Comprehensive edge case coverage
- Isolated test environments
- Consistent mocking patterns
- Performance-conscious test design

### Error Testing
- Network failure simulation
- Invalid input boundary testing
- Authentication failure scenarios
- Resource exhaustion testing
- Recovery mechanism validation

### Mock Strategy
- Minimal, focused mocks
- Realistic error simulation
- State isolation between tests
- Performance-oriented cleanup
- Type-safe mock implementations

## Maintenance Guidelines

### Adding New Tests
1. Follow existing naming conventions
2. Include edge cases and error scenarios
3. Mock external dependencies appropriately
4. Maintain test isolation
5. Document critical test scenarios

### Updating Tests
1. Update tests when APIs change
2. Maintain backward compatibility coverage
3. Add regression tests for bug fixes
4. Keep mock implementations current
5. Review test performance regularly

This comprehensive test suite provides a robust foundation for maintaining code quality and preventing regressions in the Open Food Facts Web Components library.
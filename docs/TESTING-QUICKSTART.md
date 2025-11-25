# Testing Quick Start Guide

**Ready to test the Skill Update System?** Here's the fastest way to validate all functionality.

---

## Option 1: Automated Test Suite (Recommended)

Run all tests automatically in sequence:

```bash
# From project root
cd packages/skill-updater

# Build the package (first time only)
npm install
npm run build

# Run complete test suite
node run-all-tests.js
```

**Duration:** ~30 seconds

**What it tests:**
- ✅ Phase 1: File watcher, config loading, YAML validation
- ✅ Phase 2: Skill parser, duplicate detection, integration
- ✅ Phase 3: Queue, notifications, archiving, workflow

**Expected result:** All 15 tests pass, green checkmarks

---

## Option 2: Individual Test Runs

Run each phase separately:

```bash
# Phase 1: Foundation
node test-watcher.js

# Phase 2: Integration Engine
node test-integration.js

# Phase 3: Workflow Automation
node test-workflow.js
```

**Duration:** ~10 seconds each

---

## Option 3: Comprehensive Manual Testing

Follow the detailed plan:

```bash
# Open the full testing plan
cat ../../docs/TESTING-PLAN.md
```

**Duration:** ~20 minutes

**What it includes:**
- Step-by-step instructions
- Expected outputs for each test
- Validation criteria
- Troubleshooting guide
- End-to-end integration test

---

## Quick Validation Checklist

Before running tests, verify:

- [x] In project root: `C:\Users\strac\dev\MCP-World`
- [x] On feature branch: `git branch` shows `feature/skill-update-system`
- [x] Dependencies installed: `cd packages/skill-updater && npm install`
- [x] Package built: `npm run build`
- [x] `dist/` folder exists with compiled `.js` files

---

## Expected Test Results

### Phase 1 ✅
```
✅ Skill discovery: PASSED
✅ Config loading: PASSED
✅ File watching: PASSED
✅ Update detection: PASSED
✅ Metadata parsing: PASSED
```

### Phase 2 ✅
```
✅ Skill Parser: PASSED
✅ Duplicate Detection: PASSED
✅ Template Application: PASSED
✅ Changelog Generation: PASSED
✅ Integration Manager: PASSED
✅ Batch Processing: PASSED
```

### Phase 3 ✅
```
✅ Update Queue: PASSED
✅ Notification System: PASSED
✅ Archive System: PASSED
✅ Workflow Manager: PASSED
✅ State Persistence: PASSED
```

---

## If Tests Fail

**1. Check build:**
```bash
cd packages/skill-updater
npm run build
# Should complete with no errors
```

**2. Verify file structure:**
```bash
# From project root
ls skills/platinum/justin-strackany/_updates
ls skills/platinum/scott-leese/_updates
# Should show README.md and _TEMPLATE-update.md
```

**3. Check Node version:**
```bash
node --version
# Should be v18 or higher
```

**4. See full troubleshooting:**
Refer to `docs/TESTING-PLAN.md` section: "Troubleshooting"

---

## After Testing

### All Tests Pass ✅

**You're ready for:**
1. December 4 demo
2. Production use
3. Optional Phase 4/5 features

### Some Tests Fail ❌

**Next steps:**
1. Review error output carefully
2. Check `docs/TESTING-PLAN.md` for specific test details
3. Verify file structure and permissions
4. Re-run individual failing tests
5. Check git status for unexpected changes

---

## What Gets Tested

| Component | What It Does | How It's Tested |
|-----------|--------------|-----------------|
| **File Watcher** | Detects new .md files | Creates test file, verifies detection |
| **Config Loader** | Loads skill-config.json | Validates 2 PLATINUM configs |
| **YAML Parser** | Parses frontmatter | Tests valid/invalid YAML |
| **Skill Parser** | Extracts sections | Parses 7 test sections |
| **Duplicate Detector** | Finds similar content | 100% vs 43% similarity |
| **Template Engine** | Replaces placeholders | Applies framework template |
| **Integration Manager** | Coordinates integration | Generates preview |
| **Update Queue** | Tracks lifecycle | 4 state transitions |
| **Notifications** | Multi-channel alerts | Email + Slack delivery |
| **Archive System** | Stores processed files | Archives with metadata |
| **Workflow Manager** | End-to-end orchestration | Complete workflow |
| **Persistence** | Survives restarts | Reload from disk |

---

## Test Coverage

**Lines of Code Tested:** ~6,100 lines
**Test Files:** 3 comprehensive test suites
**Test Cases:** 15+ individual tests
**Components:** 12 major components
**Integration Points:** 8+ cross-component tests

---

## Need Help?

- **Detailed instructions:** `docs/TESTING-PLAN.md`
- **Troubleshooting:** See TESTING-PLAN.md section
- **Architecture:** `PROJECT-SUMMARY.md`
- **Expert docs:** `docs/skill-updates/`

---

**Ready?** Run `node run-all-tests.js` and watch the magic! 🎉

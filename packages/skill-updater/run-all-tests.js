#!/usr/bin/env node
/**
 * Run all tests in sequence
 * Comprehensive validation of all 3 phases
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('='.repeat(70));
console.log('  MCP-World Skill Update System - Complete Test Suite');
console.log('='.repeat(70));
console.log();
console.log('This will run all tests in sequence:');
console.log('  1. Phase 1: Foundation (Watcher & Config)');
console.log('  2. Phase 2: Integration Engine');
console.log('  3. Phase 3: Workflow Automation');
console.log();
console.log('Press Ctrl+C at any time to abort.');
console.log('='.repeat(70));
console.log();

// Helper to run a command
function runTest(name, command, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`  Running: ${name}`);
    console.log('='.repeat(70));
    console.log();

    const proc = spawn(command, args, {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log();
        console.log(`✅ ${name} - PASSED`);
        resolve();
      } else {
        console.log();
        console.log(`❌ ${name} - FAILED (exit code ${code})`);
        reject(new Error(`${name} failed`));
      }
    });

    proc.on('error', (err) => {
      console.error(`Error running ${name}:`, err);
      reject(err);
    });
  });
}

// Run tests in sequence
async function runAllTests() {
  try {
    console.log('Starting test suite...\n');

    // Phase 1: Foundation
    await runTest(
      'Phase 1: Foundation Tests',
      'node',
      ['test-watcher.js']
    );

    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Phase 2: Integration Engine
    await runTest(
      'Phase 2: Integration Engine Tests',
      'node',
      ['test-integration.js']
    );

    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Phase 3: Workflow Automation
    await runTest(
      'Phase 3: Workflow Automation Tests',
      'node',
      ['test-workflow.js']
    );

    // Final summary
    console.log();
    console.log('='.repeat(70));
    console.log('  COMPLETE TEST SUITE RESULTS');
    console.log('='.repeat(70));
    console.log();
    console.log('✅ Phase 1: Foundation - PASSED');
    console.log('✅ Phase 2: Integration Engine - PASSED');
    console.log('✅ Phase 3: Workflow Automation - PASSED');
    console.log();
    console.log('='.repeat(70));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(70));
    console.log();
    console.log('The Skill Update System is fully validated and ready for use.');
    console.log();
    console.log('Next steps:');
    console.log('  1. Review the TESTING-PLAN.md for detailed results');
    console.log('  2. Run end-to-end integration test (see docs/TESTING-PLAN.md)');
    console.log('  3. Demo the system on December 4');
    console.log();

    process.exit(0);
  } catch (error) {
    console.log();
    console.log('='.repeat(70));
    console.log('❌ TEST SUITE FAILED');
    console.log('='.repeat(70));
    console.log();
    console.log('Error:', error.message);
    console.log();
    console.log('Please check the output above for details.');
    console.log('Refer to docs/TESTING-PLAN.md for troubleshooting steps.');
    console.log();

    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log();
  console.log('Test suite interrupted by user.');
  console.log('Exiting...');
  process.exit(0);
});

// Run the tests
runAllTests();

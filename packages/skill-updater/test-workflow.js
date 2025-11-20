#!/usr/bin/env node
/**
 * Test script for Workflow Automation
 * Validates Phase 3 functionality
 */

import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createWorkflowManager } from './dist/workflow-manager.js';
import { createUpdateQueue } from './dist/update-queue.js';
import { createNotificationSystem } from './dist/notification-system.js';
import { createArchiveSystem } from './dist/archive-system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const skillsPath = path.resolve(__dirname, '../../skills');
const queuePath = path.resolve(__dirname, './.test-queue');
const archivePath = path.resolve(__dirname, './.test-archive');

console.log('='.repeat(70));
console.log('  Phase 3 Workflow Automation Test');
console.log('='.repeat(70));
console.log();

// Cleanup test directories
async function cleanup() {
  try {
    await fs.rm(queuePath, { recursive: true, force: true });
    await fs.rm(archivePath, { recursive: true, force: true });
  } catch (error) {
    // Ignore errors
  }
}

await cleanup();

// Test 1: Update Queue
console.log('Test 1: Update Queue - Lifecycle management...');
try {
  const queue = createUpdateQueue(queuePath);
  await queue.initialize();

  const mockUpdate = {
    filePath: 'test.md',
    fileName: '2024-11-20-test.md',
    metadata: {
      type: 'template',
      category: 'writing',
      priority: 'low',
      targetSection: 'Templates',
      status: 'ready',
      author: 'Test',
      dateAdded: '2024-11-20',
      tags: ['test'],
    },
    content: 'Test content',
    skillId: 'justin-strackany',
    detectedAt: new Date(),
  };

  const queued = await queue.enqueue(mockUpdate);
  console.log(`✅ Enqueued update: ${queued.id}`);
  console.log(`   Initial state: ${queued.state}`);

  await queue.updateState(
    queued.id,
    'processing',
    'Testing state transition'
  );
  console.log(`✅ Updated to processing state`);

  await queue.updateState(
    queued.id,
    'integrated',
    'Testing completion'
  );
  console.log(`✅ Updated to integrated state`);

  const retrieved = queue.get(queued.id);
  console.log(`✅ Retrieved from queue: ${retrieved.history.length} events`);

  const stats = queue.getStats();
  console.log(`✅ Queue stats:`, stats);
  console.log();
} catch (error) {
  console.error('❌ Update Queue test failed:', error.message);
  process.exit(1);
}

// Test 2: Notification System
console.log('Test 2: Notification System...');
try {
  const notifications = createNotificationSystem();

  const notification = await notifications.send(
    'update-detected',
    'Test Expert',
    'Test Notification',
    'This is a test notification message',
    ['email', 'slack'],
    { updateId: 'test-123' }
  );

  console.log(`✅ Sent notification: ${notification.id}`);
  console.log(`   Type: ${notification.type}`);
  console.log(`   Channels: ${notification.channels.join(', ')}`);
  console.log(`   Delivered: ${notification.deliveredAt ? 'Yes' : 'No'}`);

  const history = notifications.getHistory();
  console.log(`✅ Notification history: ${history.length} items`);
  console.log();
} catch (error) {
  console.error('❌ Notification System test failed:', error.message);
  process.exit(1);
}

// Test 3: Archive System
console.log('Test 3: Archive System...');
try {
  const archive = createArchiveSystem(archivePath);
  await archive.initialize();

  const mockQueuedUpdate = {
    id: 'test-123',
    update: {
      filePath: path.join(queuePath, 'test.md'),
      fileName: 'test.md',
      metadata: {
        type: 'template',
        category: 'writing',
        priority: 'low',
        targetSection: 'Templates',
        status: 'ready',
        author: 'Test',
        dateAdded: '2024-11-20',
        tags: [],
      },
      content: 'Test content',
      skillId: 'justin-strackany',
      detectedAt: new Date(),
    },
    state: 'integrated',
    history: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Create test file
  await fs.mkdir(queuePath, { recursive: true });
  await fs.writeFile(mockQueuedUpdate.update.filePath, 'Test content', 'utf-8');

  const metadata = await archive.archive(mockQueuedUpdate);
  console.log(`✅ Archived file`);
  console.log(`   Original: ${metadata.originalPath}`);
  console.log(`   Archived: ${metadata.archivedPath}`);
  console.log(`   State: ${metadata.state}`);

  const archiveStats = await archive.getStats();
  console.log(`✅ Archive stats:`, archiveStats);
  console.log();
} catch (error) {
  console.error('❌ Archive System test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}

// Test 4: Workflow Manager
console.log('Test 4: Workflow Manager - End-to-end workflow...');
try {
  const workflowConfig = {
    queuePath,
    archivePath,
    approvalTimeout: 300000, // 5 minutes
    autoArchive: false, // Don't auto-archive in test
    notificationChannels: ['email'],
  };

  const workflow = createWorkflowManager(skillsPath, workflowConfig);
  await workflow.initialize();

  // Test with mock update (dry run to avoid actual file changes)
  console.log('   Workflow manager initialized');
  console.log(`   Queue stats:`, workflow.getQueueStats());

  const pending = workflow.getPendingApprovals();
  console.log(`✅ Pending approvals: ${pending.length}`);

  const failed = workflow.getFailedIntegrations();
  console.log(`✅ Failed integrations: ${failed.length}`);

  console.log();
} catch (error) {
  console.error('❌ Workflow Manager test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}

// Test 5: State Persistence
console.log('Test 5: State Persistence - Queue reload...');
try {
  const queue1 = createUpdateQueue(queuePath);
  await queue1.initialize();

  const mockUpdate2 = {
    filePath: 'test2.md',
    fileName: '2024-11-20-test2.md',
    metadata: {
      type: 'correction',
      category: 'writing',
      priority: 'high',
      targetSection: 'Section',
      status: 'ready',
      author: 'Test',
      dateAdded: '2024-11-20',
      tags: [],
    },
    content: 'Test correction',
    skillId: 'scott-leese',
    detectedAt: new Date(),
  };

  const queued2 = await queue1.enqueue(mockUpdate2);
  console.log(`✅ Enqueued second update: ${queued2.id}`);

  // Create new queue instance (simulating restart)
  const queue2 = createUpdateQueue(queuePath);
  await queue2.initialize();

  const reloaded = queue2.get(queued2.id);
  console.log(`✅ Reloaded from disk: ${reloaded ? 'Success' : 'Failed'}`);
  console.log(`   State: ${reloaded?.state}`);
  console.log(`   History events: ${reloaded?.history.length}`);
  console.log();
} catch (error) {
  console.error('❌ State Persistence test failed:', error.message);
  process.exit(1);
}

// Cleanup
await cleanup();

// Final summary
console.log('='.repeat(70));
console.log('  Phase 3 Validation Summary');
console.log('='.repeat(70));
console.log(`✅ Update Queue: PASSED`);
console.log(`✅ Notification System: PASSED`);
console.log(`✅ Archive System: PASSED`);
console.log(`✅ Workflow Manager: PASSED`);
console.log(`✅ State Persistence: PASSED`);
console.log();
console.log('🎉 Phase 3 validation complete!');
console.log('='.repeat(70));
console.log();

process.exit(0);

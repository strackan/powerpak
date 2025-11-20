import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import {
  QueuedUpdate,
  WorkflowState,
  WorkflowEvent,
  QueueStats,
} from './workflow-types.js';
import { UpdateFile } from './types.js';
import { IntegrationResult } from './integrator-types.js';

/**
 * Update queue manager - tracks updates through their lifecycle
 */
export class UpdateQueue {
  private queue: Map<string, QueuedUpdate> = new Map();
  private queuePath: string;

  constructor(queuePath: string) {
    this.queuePath = queuePath;
  }

  /**
   * Initialize queue (load from disk if exists)
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.queuePath, { recursive: true });

      // Load existing queue items
      const files = await fs.readdir(this.queuePath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.queuePath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const item: QueuedUpdate = JSON.parse(content);

          // Convert date strings back to Date objects
          item.createdAt = new Date(item.createdAt);
          item.updatedAt = new Date(item.updatedAt);
          item.update.detectedAt = new Date(item.update.detectedAt);
          item.history = item.history.map((h) => ({
            ...h,
            timestamp: new Date(h.timestamp),
          }));

          this.queue.set(item.id, item);
        }
      }

      console.log(`[UpdateQueue] Loaded ${this.queue.size} queued updates`);
    } catch (error) {
      console.error('[UpdateQueue] Error initializing queue:', error);
    }
  }

  /**
   * Add update to queue
   */
  async enqueue(update: UpdateFile): Promise<QueuedUpdate> {
    const id = randomUUID();
    const now = new Date();

    const queuedUpdate: QueuedUpdate = {
      id,
      update,
      state: 'queued',
      history: [
        {
          timestamp: now,
          state: 'detected',
          actor: 'system',
          message: 'Update detected by file watcher',
        },
        {
          timestamp: now,
          state: 'queued',
          actor: 'system',
          message: 'Added to processing queue',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.queue.set(id, queuedUpdate);
    await this.persist(queuedUpdate);

    console.log(`[UpdateQueue] Enqueued: ${update.fileName} (${id})`);
    return queuedUpdate;
  }

  /**
   * Update state of queued item
   */
  async updateState(
    id: string,
    state: WorkflowState,
    message: string,
    actor: string = 'system',
    metadata?: Record<string, any>
  ): Promise<void> {
    const item = this.queue.get(id);
    if (!item) {
      throw new Error(`Queue item not found: ${id}`);
    }

    item.state = state;
    item.updatedAt = new Date();
    item.history.push({
      timestamp: new Date(),
      state,
      actor,
      message,
      metadata,
    });

    await this.persist(item);
    console.log(`[UpdateQueue] ${id}: ${state} - ${message}`);
  }

  /**
   * Set integration result
   */
  async setIntegrationResult(
    id: string,
    result: IntegrationResult
  ): Promise<void> {
    const item = this.queue.get(id);
    if (!item) {
      throw new Error(`Queue item not found: ${id}`);
    }

    item.integrationResult = result;
    item.updatedAt = new Date();

    // Update state based on result
    let state: WorkflowState;
    let message: string;

    switch (result.status) {
      case 'success':
        state = 'integrated';
        message = 'Successfully integrated into SKILL.md';
        break;
      case 'pending-review':
        state = 'pending-approval';
        message = 'Awaiting expert approval';
        break;
      case 'duplicate':
        state = 'failed';
        message = `Duplicate content detected (${result.error})`;
        break;
      case 'voice-mismatch':
        state = 'failed';
        message = `Voice validation failed (${result.error})`;
        break;
      case 'failed':
        state = 'failed';
        message = `Integration failed: ${result.error}`;
        break;
      default:
        state = 'processing';
        message = 'Processing...';
    }

    await this.updateState(id, state, message, 'system', {
      integrationStatus: result.status,
    });
  }

  /**
   * Get queue item by ID
   */
  get(id: string): QueuedUpdate | undefined {
    return this.queue.get(id);
  }

  /**
   * Get queue item by update file name
   */
  getByFileName(fileName: string): QueuedUpdate | undefined {
    return Array.from(this.queue.values()).find(
      (item) => item.update.fileName === fileName
    );
  }

  /**
   * Get all items in specific state
   */
  getByState(state: WorkflowState): QueuedUpdate[] {
    return Array.from(this.queue.values()).filter(
      (item) => item.state === state
    );
  }

  /**
   * Get all items for a skill
   */
  getBySkill(skillId: string): QueuedUpdate[] {
    return Array.from(this.queue.values()).filter(
      (item) => item.update.skillId === skillId
    );
  }

  /**
   * Get pending approvals
   */
  getPendingApprovals(): QueuedUpdate[] {
    return this.getByState('pending-approval');
  }

  /**
   * Get failed integrations
   */
  getFailedIntegrations(): QueuedUpdate[] {
    return this.getByState('failed');
  }

  /**
   * Remove item from queue
   */
  async dequeue(id: string): Promise<void> {
    const item = this.queue.get(id);
    if (!item) {
      throw new Error(`Queue item not found: ${id}`);
    }

    this.queue.delete(id);

    // Remove persisted file
    const filePath = path.join(this.queuePath, `${id}.json`);
    try {
      await fs.unlink(filePath);
      console.log(`[UpdateQueue] Dequeued: ${id}`);
    } catch (error) {
      console.warn(`[UpdateQueue] Could not delete queue file: ${filePath}`);
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const items = Array.from(this.queue.values());

    const byState: Record<string, number> = {};
    const bySkill: Record<string, number> = {};

    items.forEach((item) => {
      // Count by state
      byState[item.state] = (byState[item.state] || 0) + 1;

      // Count by skill
      bySkill[item.update.skillId] =
        (bySkill[item.update.skillId] || 0) + 1;
    });

    // Calculate average processing time
    const completedItems = items.filter(
      (item) => item.state === 'integrated' || item.state === 'archived'
    );
    let averageProcessingTime: number | undefined;

    if (completedItems.length > 0) {
      const totalTime = completedItems.reduce((sum, item) => {
        return sum + (item.updatedAt.getTime() - item.createdAt.getTime());
      }, 0);
      averageProcessingTime = totalTime / completedItems.length;
    }

    return {
      totalUpdates: this.queue.size,
      byState: byState as Record<WorkflowState, number>,
      bySkill,
      pendingApprovals: byState['pending-approval'] || 0,
      failedIntegrations: byState['failed'] || 0,
      averageProcessingTime,
    };
  }

  /**
   * Clear completed items older than specified days
   */
  async cleanup(olderThanDays: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const toRemove: string[] = [];

    for (const [id, item] of this.queue.entries()) {
      const isCompleted =
        item.state === 'integrated' || item.state === 'archived';
      const isOld = item.updatedAt < cutoffDate;

      if (isCompleted && isOld) {
        toRemove.push(id);
      }
    }

    for (const id of toRemove) {
      await this.dequeue(id);
    }

    console.log(
      `[UpdateQueue] Cleaned up ${toRemove.length} old queue items`
    );
    return toRemove.length;
  }

  /**
   * Persist queue item to disk
   */
  private async persist(item: QueuedUpdate): Promise<void> {
    const filePath = path.join(this.queuePath, `${item.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(item, null, 2), 'utf-8');
  }
}

/**
 * Create update queue instance
 */
export function createUpdateQueue(queuePath: string): UpdateQueue {
  return new UpdateQueue(queuePath);
}

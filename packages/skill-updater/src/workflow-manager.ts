import path from 'path';
import { UpdateFile, SkillConfig } from './types.js';
import { IntegrationResult } from './integrator-types.js';
import { IntegrationManager } from './integration-manager.js';
import { UpdateQueue } from './update-queue.js';
import { NotificationSystem } from './notification-system.js';
import { ArchiveSystem } from './archive-system.js';
import {
  QueuedUpdate,
  WorkflowConfig,
  ApprovalDecision,
  QueueStats,
} from './workflow-types.js';
import { loadSkillConfig } from './utils.js';

/**
 * Workflow manager - orchestrates the complete update workflow
 */
export class WorkflowManager {
  private integrationManager: IntegrationManager;
  private queue: UpdateQueue;
  private notifications: NotificationSystem;
  private archive: ArchiveSystem;
  private config: WorkflowConfig;
  private skillsPath: string;

  constructor(skillsPath: string, config: WorkflowConfig) {
    this.skillsPath = skillsPath;
    this.config = config;
    this.integrationManager = new IntegrationManager(skillsPath);
    this.queue = new UpdateQueue(config.queuePath);
    this.notifications = new NotificationSystem();
    this.archive = new ArchiveSystem(config.archivePath);
  }

  /**
   * Initialize workflow manager
   */
  async initialize(): Promise<void> {
    await this.queue.initialize();
    await this.archive.initialize();
    console.log('[WorkflowManager] Initialized');
  }

  /**
   * Process new update
   */
  async processUpdate(update: UpdateFile): Promise<QueuedUpdate> {
    console.log(`[WorkflowManager] Processing: ${update.fileName}`);

    // Add to queue
    const queuedUpdate = await this.queue.enqueue(update);

    // Load skill config
    const skillPath = this.getSkillPath(update.skillId);
    const config = await loadSkillConfig(skillPath);

    // Send detection notification
    await this.notifications.notifyUpdateDetected(queuedUpdate, config);

    // Start processing
    await this.queue.updateState(
      queuedUpdate.id,
      'processing',
      'Starting integration'
    );

    // Attempt integration
    const result = await this.integrationManager.processUpdate(update);

    // Store result
    await this.queue.setIntegrationResult(queuedUpdate.id, result);

    // Update queue item with result
    const updatedItem = this.queue.get(queuedUpdate.id)!;

    // Handle result
    await this.handleIntegrationResult(updatedItem, config);

    return updatedItem;
  }

  /**
   * Handle integration result based on status
   */
  private async handleIntegrationResult(
    update: QueuedUpdate,
    config: SkillConfig
  ): Promise<void> {
    const result = update.integrationResult!;

    switch (result.status) {
      case 'success':
        // Successfully integrated
        await this.handleSuccess(update, config);
        break;

      case 'pending-review':
        // Needs approval
        await this.handlePendingApproval(update, config);
        break;

      case 'duplicate':
      case 'voice-mismatch':
      case 'failed':
        // Integration failed
        await this.handleFailure(update, config, result.error || 'Unknown error');
        break;
    }
  }

  /**
   * Handle successful integration
   */
  private async handleSuccess(
    update: QueuedUpdate,
    config: SkillConfig
  ): Promise<void> {
    console.log(`[WorkflowManager] Success: ${update.update.fileName}`);

    // Send success notification
    await this.notifications.notifyUpdatePublished(update, config);

    // Archive if configured
    if (this.config.autoArchive) {
      await this.archive.archiveAndDelete(update);
      await this.queue.updateState(
        update.id,
        'archived',
        'Archived successfully'
      );
    }
  }

  /**
   * Handle pending approval
   */
  private async handlePendingApproval(
    update: QueuedUpdate,
    config: SkillConfig
  ): Promise<void> {
    console.log(
      `[WorkflowManager] Pending approval: ${update.update.fileName}`
    );

    // Send approval request notification
    await this.notifications.notifyApprovalRequested(update, config);

    // Set timeout if configured
    if (this.config.approvalTimeout) {
      setTimeout(async () => {
        const current = this.queue.get(update.id);
        if (current && current.state === 'pending-approval') {
          await this.queue.updateState(
            update.id,
            'failed',
            'Approval timeout expired',
            'system'
          );
        }
      }, this.config.approvalTimeout);
    }
  }

  /**
   * Handle integration failure
   */
  private async handleFailure(
    update: QueuedUpdate,
    config: SkillConfig,
    error: string
  ): Promise<void> {
    console.log(`[WorkflowManager] Failed: ${update.update.fileName} - ${error}`);

    // Send failure notification
    await this.notifications.notifyIntegrationFailed(update, config, error);

    // Archive failed update
    if (this.config.autoArchive) {
      await this.archive.archive(update);
    }
  }

  /**
   * Approve pending update
   */
  async approve(
    updateId: string,
    decision: ApprovalDecision,
    approver: string
  ): Promise<void> {
    const update = this.queue.get(updateId);
    if (!update) {
      throw new Error(`Update not found: ${updateId}`);
    }

    if (update.state !== 'pending-approval') {
      throw new Error(
        `Update is not pending approval: ${update.state}`
      );
    }

    if (decision.approved) {
      // Apply the integration
      await this.queue.updateState(
        updateId,
        'processing',
        'Approved - applying integration',
        approver
      );

      const skillPath = this.getSkillPath(update.update.skillId);
      const config = await loadSkillConfig(skillPath);

      // Re-process with no approval required
      const result = await this.integrationManager.processUpdate(
        update.update,
        { forceApproval: false }
      );

      await this.queue.setIntegrationResult(updateId, result);
      const updatedItem = this.queue.get(updateId)!;

      await this.handleSuccess(updatedItem, config);
    } else {
      // Rejected
      await this.queue.updateState(
        updateId,
        'rejected',
        `Rejected: ${decision.reason || 'No reason provided'}`,
        approver
      );

      // Archive rejected update
      if (this.config.autoArchive) {
        await this.archive.archiveAndDelete(update);
      }
    }
  }

  /**
   * Get pending approvals
   */
  getPendingApprovals(): QueuedUpdate[] {
    return this.queue.getPendingApprovals();
  }

  /**
   * Get failed integrations
   */
  getFailedIntegrations(): QueuedUpdate[] {
    return this.queue.getFailedIntegrations();
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): QueueStats {
    return this.queue.getStats();
  }

  /**
   * Get archive statistics
   */
  async getArchiveStats(): Promise<{
    totalArchived: number;
    byState: Record<string, number>;
    bySkill: Record<string, number>;
  }> {
    return this.archive.getStats();
  }

  /**
   * Cleanup old items
   */
  async cleanup(queueDays: number = 7, archiveDays: number = 90): Promise<{
    queueCleaned: number;
    archiveCleaned: number;
  }> {
    const queueCleaned = await this.queue.cleanup(queueDays);
    const archiveCleaned = await this.archive.cleanup(archiveDays);

    return { queueCleaned, archiveCleaned };
  }

  /**
   * Get skill directory path
   */
  private getSkillPath(skillId: string): string {
    const tiers = ['platinum', 'premium', 'regular', 'spotlight'];

    for (const tier of tiers) {
      const skillPath = path.join(this.skillsPath, tier, skillId);
      return skillPath;
    }

    throw new Error(`Could not determine path for skill: ${skillId}`);
  }
}

/**
 * Create workflow manager instance
 */
export function createWorkflowManager(
  skillsPath: string,
  config: WorkflowConfig
): WorkflowManager {
  return new WorkflowManager(skillsPath, config);
}

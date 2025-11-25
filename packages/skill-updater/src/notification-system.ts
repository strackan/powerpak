import { randomUUID } from 'crypto';
import {
  Notification,
  NotificationType,
  NotificationChannel,
  QueuedUpdate,
} from './workflow-types.js';
import { SkillConfig } from './types.js';

/**
 * Notification system - multi-channel notification delivery
 */
export class NotificationSystem {
  private notifications: Map<string, Notification> = new Map();

  /**
   * Send notification
   */
  async send(
    type: NotificationType,
    recipient: string,
    subject: string,
    message: string,
    channels: NotificationChannel[],
    metadata?: Record<string, any>
  ): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      id,
      type,
      recipient,
      subject,
      message,
      channels,
      metadata,
      sentAt: new Date(),
    };

    this.notifications.set(id, notification);

    console.log(`[Notifications] Sending ${type} to ${recipient}...`);

    // Send through each channel
    for (const channel of channels) {
      try {
        await this.sendViaChannel(notification, channel);
      } catch (error) {
        notification.error = (error as Error).message;
        console.error(
          `[Notifications] Failed to send via ${channel}:`,
          (error as Error).message
        );
      }
    }

    notification.deliveredAt = new Date();
    return notification;
  }

  /**
   * Send notification for detected update
   */
  async notifyUpdateDetected(
    update: QueuedUpdate,
    config: SkillConfig
  ): Promise<Notification | null> {
    if (!config.notifications?.onNewUpdate) {
      return null;
    }

    const channels = config.notifications.channels || [];
    if (channels.length === 0 || channels.includes('none')) {
      return null;
    }

    const subject = `New Update Detected: ${update.update.fileName}`;
    const message = this.formatUpdateDetectedMessage(update);

    return this.send(
      'update-detected',
      config.expert.name,
      subject,
      message,
      channels as NotificationChannel[],
      {
        updateId: update.id,
        skillId: update.update.skillId,
        updateType: update.update.metadata.type,
      }
    );
  }

  /**
   * Send notification for approval request
   */
  async notifyApprovalRequested(
    update: QueuedUpdate,
    config: SkillConfig
  ): Promise<Notification | null> {
    if (!config.notifications?.onIntegrationReady) {
      return null;
    }

    const channels = config.notifications.channels || [];
    if (channels.length === 0 || channels.includes('none')) {
      return null;
    }

    const subject = `Approval Required: ${update.update.fileName}`;
    const message = this.formatApprovalRequestMessage(update);

    return this.send(
      'approval-requested',
      config.expert.name,
      subject,
      message,
      channels as NotificationChannel[],
      {
        updateId: update.id,
        skillId: update.update.skillId,
        updateType: update.update.metadata.type,
      }
    );
  }

  /**
   * Send notification for published update
   */
  async notifyUpdatePublished(
    update: QueuedUpdate,
    config: SkillConfig
  ): Promise<Notification | null> {
    if (!config.notifications?.onPublish) {
      return null;
    }

    const channels = config.notifications.channels || [];
    if (channels.length === 0 || channels.includes('none')) {
      return null;
    }

    const subject = `Update Published: ${update.update.fileName}`;
    const message = this.formatPublishedMessage(update);

    return this.send(
      'update-published',
      config.expert.name,
      subject,
      message,
      channels as NotificationChannel[],
      {
        updateId: update.id,
        skillId: update.update.skillId,
        updateType: update.update.metadata.type,
      }
    );
  }

  /**
   * Send notification for failed integration
   */
  async notifyIntegrationFailed(
    update: QueuedUpdate,
    config: SkillConfig,
    error: string
  ): Promise<Notification | null> {
    const channels = config.notifications?.channels || [];
    if (channels.length === 0 || channels.includes('none')) {
      return null;
    }

    const subject = `Integration Failed: ${update.update.fileName}`;
    const message = this.formatFailedMessage(update, error);

    return this.send(
      'integration-failed',
      config.expert.name,
      subject,
      message,
      channels as NotificationChannel[],
      {
        updateId: update.id,
        skillId: update.update.skillId,
        error,
      }
    );
  }

  /**
   * Send via specific channel
   */
  private async sendViaChannel(
    notification: Notification,
    channel: NotificationChannel
  ): Promise<void> {
    switch (channel) {
      case 'email':
        await this.sendEmail(notification);
        break;
      case 'slack':
        await this.sendSlack(notification);
        break;
      case 'webhook':
        await this.sendWebhook(notification);
        break;
      case 'none':
        // Do nothing
        break;
      default:
        console.warn(`[Notifications] Unknown channel: ${channel}`);
    }
  }

  /**
   * Send email notification (stub)
   */
  private async sendEmail(notification: Notification): Promise<void> {
    // Email sending would be implemented here using nodemailer or similar
    console.log(
      `[Notifications] 📧 EMAIL: ${notification.subject} to ${notification.recipient}`
    );
    console.log(`   ${notification.message.slice(0, 100)}...`);
  }

  /**
   * Send Slack notification (stub)
   */
  private async sendSlack(notification: Notification): Promise<void> {
    // Slack webhook integration would be implemented here
    console.log(`[Notifications] 💬 SLACK: ${notification.subject}`);
    console.log(`   ${notification.message.slice(0, 100)}...`);
  }

  /**
   * Send webhook notification (stub)
   */
  private async sendWebhook(notification: Notification): Promise<void> {
    // Webhook POST would be implemented here
    console.log(`[Notifications] 🔔 WEBHOOK: ${notification.subject}`);
    console.log(`   ${notification.message.slice(0, 100)}...`);
  }

  /**
   * Format update detected message
   */
  private formatUpdateDetectedMessage(update: QueuedUpdate): string {
    const { fileName, metadata, skillId } = update.update;

    return `
📝 New Update Detected

File: ${fileName}
Skill: ${skillId}
Type: ${metadata.type}
Category: ${metadata.category}
Priority: ${metadata.priority}
Author: ${metadata.author}

Target: ${metadata.targetSection}
Status: ${metadata.status}

The update has been queued for processing.
    `.trim();
  }

  /**
   * Format approval request message
   */
  private formatApprovalRequestMessage(update: QueuedUpdate): string {
    const { fileName, metadata } = update.update;

    let previewText = '';
    if (update.integrationResult?.preview) {
      const { proposedChanges } = update.integrationResult.preview;
      previewText = `

Preview:
${proposedChanges.diff.slice(0, 500)}${proposedChanges.diff.length > 500 ? '...' : ''}
      `.trim();
    }

    return `
✋ Approval Required

File: ${fileName}
Type: ${metadata.type}
Priority: ${metadata.priority}

The update is ready for integration but requires your approval.
${previewText}

Please review and approve or reject this update.
    `.trim();
  }

  /**
   * Format published message
   */
  private formatPublishedMessage(update: QueuedUpdate): string {
    const { fileName, metadata } = update.update;

    return `
✅ Update Published

File: ${fileName}
Type: ${metadata.type}

The update has been successfully integrated into your SKILL.md file.

Target: ${metadata.targetSection}
${update.integrationResult?.changelogEntry ? `\nChangelog: ${update.integrationResult.changelogEntry}` : ''}
    `.trim();
  }

  /**
   * Format failed message
   */
  private formatFailedMessage(
    update: QueuedUpdate,
    error: string
  ): string {
    const { fileName, metadata } = update.update;

    return `
❌ Integration Failed

File: ${fileName}
Type: ${metadata.type}

Error: ${error}

Please review the update file and resolve the issue.
    `.trim();
  }

  /**
   * Get notification history
   */
  getHistory(): Notification[] {
    return Array.from(this.notifications.values());
  }

  /**
   * Get notifications by type
   */
  getByType(type: NotificationType): Notification[] {
    return Array.from(this.notifications.values()).filter(
      (n) => n.type === type
    );
  }
}

/**
 * Create notification system instance
 */
export function createNotificationSystem(): NotificationSystem {
  return new NotificationSystem();
}

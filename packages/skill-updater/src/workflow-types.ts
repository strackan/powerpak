import { UpdateFile, SkillConfig } from './types.js';
import { IntegrationResult } from './integrator-types.js';

/**
 * Workflow state for an update
 */
export type WorkflowState =
  | 'detected'
  | 'queued'
  | 'processing'
  | 'pending-approval'
  | 'approved'
  | 'rejected'
  | 'integrated'
  | 'archived'
  | 'failed';

/**
 * Update queue item - tracks an update through its lifecycle
 */
export interface QueuedUpdate {
  id: string;
  update: UpdateFile;
  state: WorkflowState;
  integrationResult?: IntegrationResult;
  approvalRequest?: ApprovalRequest;
  history: WorkflowEvent[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workflow event - audit trail entry
 */
export interface WorkflowEvent {
  timestamp: Date;
  state: WorkflowState;
  actor?: string; // Who triggered this (system or expert)
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Approval request
 */
export interface ApprovalRequest {
  id: string;
  updateId: string;
  skillId: string;
  expertName: string;
  requestedAt: Date;
  expiresAt?: Date;
  preview: {
    before: string;
    after: string;
    diff: string;
  };
  decision?: ApprovalDecision;
  decidedAt?: Date;
  decidedBy?: string;
  comments?: string;
}

/**
 * Approval decision
 */
export interface ApprovalDecision {
  approved: boolean;
  reason?: string;
  modificationRequested?: string;
}

/**
 * Notification channel configuration
 */
export type NotificationChannel = 'email' | 'slack' | 'webhook' | 'none';

/**
 * Notification message
 */
export interface Notification {
  id: string;
  type: NotificationType;
  recipient: string;
  subject: string;
  message: string;
  channels: NotificationChannel[];
  metadata?: Record<string, any>;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
}

/**
 * Notification types
 */
export type NotificationType =
  | 'update-detected'
  | 'integration-ready'
  | 'approval-requested'
  | 'update-approved'
  | 'update-rejected'
  | 'update-published'
  | 'integration-failed'
  | 'duplicate-detected';

/**
 * Archive metadata
 */
export interface ArchiveMetadata {
  originalPath: string;
  archivedPath: string;
  archivedAt: Date;
  state: WorkflowState;
  integrationResult?: IntegrationResult;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  totalUpdates: number;
  byState: Record<WorkflowState, number>;
  bySkill: Record<string, number>;
  pendingApprovals: number;
  failedIntegrations: number;
  averageProcessingTime?: number;
}

/**
 * Workflow configuration
 */
export interface WorkflowConfig {
  queuePath: string;
  archivePath: string;
  approvalTimeout?: number; // milliseconds
  autoArchive: boolean;
  notificationChannels: NotificationChannel[];
  webhookUrl?: string;
  slackWebhook?: string;
  emailConfig?: {
    from: string;
    to: string;
    smtp?: any;
  };
}

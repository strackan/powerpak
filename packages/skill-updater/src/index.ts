/**
 * @mcp-world/skill-updater
 *
 * Living document update system for MCP-World Skills
 * Watches for new update files and manages the integration workflow
 */

// Core watcher
export { UpdateWatcher, createWatcher } from './watcher.js';

// Integration manager
export {
  IntegrationManager,
  createIntegrationManager,
} from './integration-manager.js';

// Integrators
export { RulesBasedIntegrator } from './rules-integrator.js';

// Parsers and utilities
export { SkillParser } from './skill-parser.js';

// Types - Watcher
export type {
  UpdateMetadata,
  UpdateFile,
  SkillConfig,
  WatcherOptions,
  WatcherStats,
} from './types.js';

// Types - Integration
export type {
  IntegrationMode,
  IntegrationStatus,
  IntegrationPreview,
  IntegrationResult,
  IntegrationContext,
  IntegrationOptions,
  SkillSection,
  DuplicateCheckResult,
  VoiceValidationResult,
  Integrator,
} from './integrator-types.js';

// Schemas for validation
export { UpdateMetadataSchema, SkillConfigSchema } from './types.js';

// Workflow management
export { WorkflowManager, createWorkflowManager } from './workflow-manager.js';
export { UpdateQueue, createUpdateQueue } from './update-queue.js';
export {
  NotificationSystem,
  createNotificationSystem,
} from './notification-system.js';
export { ArchiveSystem, createArchiveSystem } from './archive-system.js';

// Types - Workflow
export type {
  WorkflowState,
  QueuedUpdate,
  WorkflowEvent,
  ApprovalRequest,
  ApprovalDecision,
  Notification,
  NotificationType,
  NotificationChannel,
  ArchiveMetadata,
  QueueStats,
  WorkflowConfig,
} from './workflow-types.js';

// Utilities
export {
  loadSkillConfig,
  hasSkillConfig,
  getConfiguredSkills,
  ensureUpdatesDirectory,
  formatDateForFileName,
  sanitizeFileName,
  generateUpdateFileName,
} from './utils.js';

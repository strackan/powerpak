import fs from 'fs/promises';
import path from 'path';
import { QueuedUpdate, ArchiveMetadata } from './workflow-types.js';

/**
 * Archive system - manages processed update files
 */
export class ArchiveSystem {
  private archivePath: string;

  constructor(archivePath: string) {
    this.archivePath = archivePath;
  }

  /**
   * Initialize archive directory
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.archivePath, { recursive: true });
    console.log(`[Archive] Initialized at: ${this.archivePath}`);
  }

  /**
   * Archive an update file
   */
  async archive(update: QueuedUpdate): Promise<ArchiveMetadata> {
    const { update: updateFile, state, integrationResult } = update;

    // Determine archive subdirectory based on state
    const subdir = this.getArchiveSubdir(state);
    const archiveDir = path.join(this.archivePath, subdir, updateFile.skillId);

    // Create archive directory
    await fs.mkdir(archiveDir, { recursive: true });

    // Generate archive filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveFileName = `${timestamp}_${updateFile.fileName}`;
    const archivedPath = path.join(archiveDir, archiveFileName);

    // Copy update file to archive
    try {
      await fs.copyFile(updateFile.filePath, archivedPath);
    } catch (error) {
      throw new Error(
        `Failed to archive file: ${(error as Error).message}`
      );
    }

    // Create metadata file
    const metadata: ArchiveMetadata = {
      originalPath: updateFile.filePath,
      archivedPath,
      archivedAt: new Date(),
      state,
      integrationResult,
    };

    const metadataPath = archivedPath.replace('.md', '.meta.json');
    await fs.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );

    console.log(
      `[Archive] Archived: ${updateFile.fileName} → ${subdir}/${updateFile.skillId}/`
    );

    return metadata;
  }

  /**
   * Archive and delete original file
   */
  async archiveAndDelete(update: QueuedUpdate): Promise<ArchiveMetadata> {
    const metadata = await this.archive(update);

    // Delete original file
    try {
      await fs.unlink(update.update.filePath);
      console.log(`[Archive] Deleted original: ${update.update.filePath}`);
    } catch (error) {
      console.warn(
        `[Archive] Could not delete original file: ${(error as Error).message}`
      );
    }

    return metadata;
  }

  /**
   * Get archived files for a skill
   */
  async getArchivedFiles(
    skillId: string,
    subdirFilter?: string
  ): Promise<string[]> {
    const archived: string[] = [];

    const subdirs = subdirFilter
      ? [subdirFilter]
      : ['integrated', 'rejected', 'failed'];

    for (const subdir of subdirs) {
      const archiveDir = path.join(this.archivePath, subdir, skillId);

      try {
        const files = await fs.readdir(archiveDir);
        const mdFiles = files.filter(
          (f) => f.endsWith('.md') && !f.endsWith('.meta.json')
        );
        archived.push(...mdFiles.map((f) => path.join(archiveDir, f)));
      } catch {
        // Directory doesn't exist or is empty
        continue;
      }
    }

    return archived;
  }

  /**
   * Get archive metadata for a file
   */
  async getMetadata(archivedPath: string): Promise<ArchiveMetadata | null> {
    const metadataPath = archivedPath.replace('.md', '.meta.json');

    try {
      const content = await fs.readFile(metadataPath, 'utf-8');
      const metadata: ArchiveMetadata = JSON.parse(content);

      // Convert date strings back to Date objects
      metadata.archivedAt = new Date(metadata.archivedAt);

      return metadata;
    } catch {
      return null;
    }
  }

  /**
   * Get archive statistics
   */
  async getStats(): Promise<{
    totalArchived: number;
    byState: Record<string, number>;
    bySkill: Record<string, number>;
  }> {
    const stats = {
      totalArchived: 0,
      byState: {} as Record<string, number>,
      bySkill: {} as Record<string, number>,
    };

    const subdirs = ['integrated', 'rejected', 'failed'];

    for (const subdir of subdirs) {
      const subdirPath = path.join(this.archivePath, subdir);

      try {
        const skills = await fs.readdir(subdirPath);

        for (const skillId of skills) {
          const skillPath = path.join(subdirPath, skillId);
          const stat = await fs.stat(skillPath);

          if (!stat.isDirectory()) continue;

          const files = await fs.readdir(skillPath);
          const mdFiles = files.filter((f) => f.endsWith('.md'));

          const count = mdFiles.length;
          stats.totalArchived += count;
          stats.byState[subdir] = (stats.byState[subdir] || 0) + count;
          stats.bySkill[skillId] = (stats.bySkill[skillId] || 0) + count;
        }
      } catch {
        // Directory doesn't exist
        continue;
      }
    }

    return stats;
  }

  /**
   * Cleanup old archived files
   */
  async cleanup(olderThanDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let deletedCount = 0;
    const subdirs = ['integrated', 'rejected', 'failed'];

    for (const subdir of subdirs) {
      const subdirPath = path.join(this.archivePath, subdir);

      try {
        const skills = await fs.readdir(subdirPath);

        for (const skillId of skills) {
          const skillPath = path.join(subdirPath, skillId);
          const files = await fs.readdir(skillPath);

          for (const file of files) {
            if (!file.endsWith('.md')) continue;

            const filePath = path.join(skillPath, file);
            const metadataPath = filePath.replace('.md', '.meta.json');

            try {
              const content = await fs.readFile(metadataPath, 'utf-8');
              const metadata: ArchiveMetadata = JSON.parse(content);
              const archivedAt = new Date(metadata.archivedAt);

              if (archivedAt < cutoffDate) {
                await fs.unlink(filePath);
                await fs.unlink(metadataPath);
                deletedCount++;
              }
            } catch {
              // Skip if metadata is missing or invalid
              continue;
            }
          }
        }
      } catch {
        // Directory doesn't exist
        continue;
      }
    }

    console.log(`[Archive] Cleaned up ${deletedCount} old archived files`);
    return deletedCount;
  }

  /**
   * Get archive subdirectory based on state
   */
  private getArchiveSubdir(state: string): string {
    switch (state) {
      case 'integrated':
      case 'published':
      case 'archived':
        return 'integrated';
      case 'rejected':
        return 'rejected';
      case 'failed':
      case 'duplicate':
      case 'voice-mismatch':
        return 'failed';
      default:
        return 'other';
    }
  }
}

/**
 * Create archive system instance
 */
export function createArchiveSystem(archivePath: string): ArchiveSystem {
  return new ArchiveSystem(archivePath);
}

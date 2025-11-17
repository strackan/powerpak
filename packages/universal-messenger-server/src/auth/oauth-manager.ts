import { Platform } from '@mcp-world/shared-types';

/**
 * OAuth token storage
 */
export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope?: string;
  platform: Platform;
}

/**
 * OAuth configuration
 */
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

/**
 * Central OAuth manager for all platforms
 *
 * For MVP: Uses bot tokens and service accounts from environment
 * For future: Full OAuth 2.0 web flows with token storage
 */
export class OAuthManager {
  private tokens: Map<Platform, OAuthToken> = new Map();

  constructor() {}

  /**
   * Store OAuth token for a platform
   */
  storeToken(platform: Platform, token: OAuthToken): void {
    this.tokens.set(platform, token);
  }

  /**
   * Get OAuth token for a platform
   */
  getToken(platform: Platform): OAuthToken | null {
    return this.tokens.get(platform) || null;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(platform: Platform): boolean {
    const token = this.tokens.get(platform);
    if (!token) return true;

    return new Date() >= token.expiresAt;
  }

  /**
   * Refresh token if expired
   */
  async refreshTokenIfNeeded(platform: Platform): Promise<void> {
    if (!this.isTokenExpired(platform)) return;

    const token = this.tokens.get(platform);
    if (!token || !token.refreshToken) {
      throw new Error(`No refresh token available for ${platform}`);
    }

    // TODO: Implement platform-specific token refresh
    console.warn(`Token refresh not implemented for ${platform}`);
  }

  /**
   * Clear token for a platform
   */
  clearToken(platform: Platform): void {
    this.tokens.delete(platform);
  }

  /**
   * Clear all tokens
   */
  clearAllTokens(): void {
    this.tokens.clear();
  }

  /**
   * Get all stored platforms
   */
  getStoredPlatforms(): Platform[] {
    return Array.from(this.tokens.keys());
  }
}

export default OAuthManager;

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { OAuthConfig, OAuthToken } from './oauth-manager.js';
import { Platform } from '@mcp-world/shared-types';

/**
 * Google Chat OAuth 2.0 handler
 *
 * Implements Google's OAuth flow for Chat API
 * https://developers.google.com/workspace/chat/authenticate-authorize
 */
export class GoogleChatOAuth {
  private config: OAuthConfig;
  private oauth2Client: OAuth2Client;

  constructor(config: OAuthConfig) {
    this.config = config;
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  /**
   * Get authorization URL for user to approve app
   */
  getAuthorizationUrl(state?: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
      state: state || this.generateState(),
    });
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<OAuthToken> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      if (!tokens.access_token) {
        throw new Error('No access token received');
      }

      const expiresAt = tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : new Date(Date.now() + 3600 * 1000); // Default 1 hour

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        platform: Platform.GOOGLE_CHAT,
        expiresAt,
        scope: tokens.scope || undefined,
      };
    } catch (error) {
      console.error('Error exchanging Google code for token:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<OAuthToken> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new Error('No access token received');
      }

      const expiresAt = credentials.expiry_date
        ? new Date(credentials.expiry_date)
        : new Date(Date.now() + 3600 * 1000);

      return {
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token || refreshToken,
        platform: Platform.GOOGLE_CHAT,
        expiresAt,
        scope: credentials.scope || undefined,
      };
    } catch (error) {
      console.error('Error refreshing Google token:', error);
      throw error;
    }
  }

  /**
   * Revoke access token
   */
  async revokeToken(token: string): Promise<void> {
    try {
      await this.oauth2Client.revokeToken(token);
    } catch (error) {
      console.error('Error revoking Google token:', error);
      throw error;
    }
  }

  /**
   * Get OAuth2Client with credentials
   */
  getClientWithCredentials(token: OAuthToken): OAuth2Client {
    const client = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );

    client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
    });

    return client;
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}

/**
 * Default Google Chat OAuth scopes
 */
export const GOOGLE_CHAT_SCOPES = [
  'https://www.googleapis.com/auth/chat.bot',
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/chat.spaces',
];

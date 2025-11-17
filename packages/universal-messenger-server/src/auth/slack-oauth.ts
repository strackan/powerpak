import axios from 'axios';
import { OAuthConfig, OAuthToken } from './oauth-manager.js';
import { Platform } from '@mcp-world/shared-types';

/**
 * Slack OAuth 2.0 handler
 *
 * Implements Slack's OAuth flow for workspace apps
 * https://api.slack.com/authentication/oauth-v2
 */
export class SlackOAuth {
  private config: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Get authorization URL for user to approve app
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      scope: this.config.scopes.join(','),
      redirect_uri: this.config.redirectUri,
      state: state || this.generateState(),
    });

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<OAuthToken> {
    try {
      const response = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(`Slack OAuth error: ${response.data.error}`);
      }

      // Slack tokens don't expire by default, but set to 1 year from now
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      return {
        accessToken: response.data.access_token,
        platform: Platform.SLACK,
        expiresAt,
        scope: response.data.scope,
      };
    } catch (error) {
      console.error('Error exchanging Slack code for token:', error);
      throw error;
    }
  }

  /**
   * Revoke access token
   */
  async revokeToken(token: string): Promise<void> {
    try {
      const response = await axios.post(
        'https://slack.com/api/auth.revoke',
        new URLSearchParams({
          token,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(`Slack revoke error: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error revoking Slack token:', error);
      throw error;
    }
  }

  /**
   * Test if token is valid
   */
  async testToken(token: string): Promise<boolean> {
    try {
      const response = await axios.post(
        'https://slack.com/api/auth.test',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.ok;
    } catch (error) {
      return false;
    }
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}

/**
 * Default Slack OAuth scopes for bot
 */
export const SLACK_BOT_SCOPES = [
  'channels:history',
  'channels:read',
  'chat:write',
  'groups:history',
  'groups:read',
  'im:history',
  'im:read',
  'im:write',
  'mpim:history',
  'mpim:read',
  'users:read',
  'users:read.email',
];

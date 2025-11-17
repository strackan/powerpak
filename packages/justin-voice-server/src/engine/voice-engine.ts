/**
 * VoiceEngine - Core content generation logic for Justin's voice
 *
 * Responsibilities:
 * 1. Load templates and blend recipes
 * 2. Generate content using template combinations
 * 3. Apply blend recipes for specific contexts
 * 4. Integrate with RuleEnforcer for quality control
 */

import {
  ContentGenerationRequest,
  ContentGenerationResponse,
  VoiceAnalysisResult,
  BlendRecipe as SharedBlendRecipe,
} from '@mcp-world/shared-types';
import * as fs from 'fs';
import * as path from 'path';
import { RuleEnforcer } from './rule-enforcer';

interface Template {
  id: string;
  name: string;
  category: 'beginning' | 'middle' | 'ending' | 'flavor' | 'transition';
  description: string;
  example?: string;
  useFor?: string;
  energyMatch?: string;
  pairsWith?: string[];
}

interface BlendRecipe {
  name: string;
  components: {
    opening: string;
    middle: string[];
    ending: string;
  };
  whenToUse: string;
  typicalPerformance?: string;
  energyMatch: string;
  exampleTopics?: string;
  whyItWorks?: string;
}

export class VoiceEngine {
  private templates: Template[] = [];
  private blends: BlendRecipe[] = [];
  private ruleEnforcer: RuleEnforcer;

  constructor(templatesPath?: string, blendsPath?: string, rulesPath?: string) {
    // Load templates
    const defaultTemplatesPath = path.join(__dirname, '../templates/templates.json');
    const loadTemplatesPath = templatesPath || defaultTemplatesPath;

    if (fs.existsSync(loadTemplatesPath)) {
      const data = JSON.parse(fs.readFileSync(loadTemplatesPath, 'utf-8'));
      this.templates = data.templates || [];
    }

    // Load blends
    const defaultBlendsPath = path.join(__dirname, '../templates/blends.json');
    const loadBlendsPath = blendsPath || defaultBlendsPath;

    if (fs.existsSync(loadBlendsPath)) {
      const data = JSON.parse(fs.readFileSync(loadBlendsPath, 'utf-8'));
      this.blends = data.blends || [];
    }

    // Initialize rule enforcer
    this.ruleEnforcer = new RuleEnforcer(rulesPath);
  }

  /**
   * Generate content using template IDs or blend name
   */
  generateContent(request: ContentGenerationRequest): ContentGenerationResponse {
    let beginningId: string;
    let middleId: string;
    let endingId: string;

    // If blend name is provided, use that blend recipe
    if (request.blendName) {
      const blend = this.getBlendByName(request.blendName);
      if (!blend) {
        throw new Error(`Blend recipe not found: ${request.blendName}`);
      }

      beginningId = blend.components.opening;
      middleId = blend.components.middle[0] || 'm1'; // Use first middle or default
      endingId = blend.components.ending;
    } else if (request.templateIds) {
      // Use specified template IDs
      beginningId = request.templateIds.beginning || 'o1';
      middleId = request.templateIds.middle || 'm1';
      endingId = request.templateIds.ending || 'e1';
    } else {
      // Default to "Authentic Founder" blend
      beginningId = 'o1';
      middleId = 'm1';
      endingId = 'e2';
    }

    // Get templates
    const beginningTemplate = this.getTemplateById(beginningId);
    const middleTemplate = this.getTemplateById(middleId);
    const endingTemplate = this.getTemplateById(endingId);

    if (!beginningTemplate || !middleTemplate || !endingTemplate) {
      throw new Error('One or more templates not found');
    }

    // Generate content structure
    const content = this.buildContent(
      beginningTemplate,
      middleTemplate,
      endingTemplate,
      request.topic,
      request.context
    );

    // Apply formatting rules
    const correctedContent = this.ruleEnforcer.applyFormattingRules(content);

    // Analyze voice
    const analysis = this.ruleEnforcer.analyzeVoice(correctedContent);

    return {
      content: correctedContent,
      templatesUsed: {
        beginning: beginningId,
        middle: middleId,
        ending: endingId,
      },
      voiceScore: analysis.overallScore,
    };
  }

  /**
   * Build actual content from templates
   */
  private buildContent(
    beginning: Template,
    middle: Template,
    ending: Template,
    topic?: string,
    context?: string
  ): string {
    // This is a simplified version
    // In a real implementation, you'd want to use GPT-4 or Claude to fill in templates
    // For now, we'll create a structured guide

    const parts: string[] = [];

    // Beginning
    parts.push(`[${beginning.name}]`);
    if (beginning.example) {
      parts.push(beginning.example);
    }
    parts.push('');
    parts.push(beginning.description);
    if (topic) {
      parts.push(`\nTopic: ${topic}`);
    }
    parts.push('');

    // Add a parenthetical aside (signature move)
    parts.push('(Quick aside -- this is where the magic happens)');
    parts.push('');

    // Middle
    parts.push(`[${middle.name}]`);
    parts.push(middle.description);
    if (context) {
      parts.push(`\nContext: ${context}`);
    }
    parts.push('');

    // Transition
    parts.push('But here\'s the thing --');
    parts.push('');

    // Ending
    parts.push(`[${ending.name}]`);
    parts.push(ending.description);
    parts.push('');

    // Final question (engagement)
    parts.push('Does this resonate?');

    return parts.join('\n');
  }

  /**
   * Analyze text for voice similarity
   */
  analyzeVoice(text: string): VoiceAnalysisResult {
    return this.ruleEnforcer.analyzeVoice(text);
  }

  /**
   * Get suggestions to improve text
   */
  suggestImprovements(text: string): Array<{
    issue: string;
    suggestion: string;
    example?: string;
  }> {
    return this.ruleEnforcer.suggestImprovements(text);
  }

  /**
   * Suggest a blend recipe based on context and mood
   */
  suggestBlend(context: string, mood?: string): BlendRecipe | null {
    // Normalize context
    const contextLower = context.toLowerCase();

    // Try to find a matching blend
    for (const blend of this.blends) {
      const whenToUseLower = blend.whenToUse.toLowerCase();
      const energyMatchLower = blend.energyMatch.toLowerCase();

      // Check if context matches
      if (whenToUseLower.includes(contextLower)) {
        return blend;
      }

      // Check if mood matches
      if (mood && energyMatchLower.includes(mood.toLowerCase())) {
        return blend;
      }
    }

    // Fallback: return "Authentic Founder" as default
    return this.blends.find(b => b.name === 'THE AUTHENTIC FOUNDER') || this.blends[0] || null;
  }

  /**
   * Get template by ID
   */
  getTemplateById(id: string): Template | undefined {
    return this.templates.find(t => t.id === id);
  }

  /**
   * Get all templates by category
   */
  getTemplatesByCategory(category: Template['category']): Template[] {
    return this.templates.filter(t => t.category === category);
  }

  /**
   * Get blend by name
   */
  getBlendByName(name: string): BlendRecipe | undefined {
    return this.blends.find(b => b.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Get all blend recipes
   */
  getAllBlends(): BlendRecipe[] {
    return this.blends;
  }

  /**
   * Get all templates
   */
  getAllTemplates(): Template[] {
    return this.templates;
  }

  /**
   * Get writing rules
   */
  getWritingRules() {
    return this.ruleEnforcer.getRules();
  }
}

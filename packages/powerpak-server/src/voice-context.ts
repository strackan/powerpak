/**
 * Voice Context Extractor
 *
 * Extracts voice patterns from parsed SKILL.md data for use in
 * voice generation prompts.
 */

import { PowerPakData, PowerPakSection } from './types.js';

export interface VoiceContext {
  templates: {
    openings: string[];
    middles: string[];
    endings: string[];
  };
  blendRecipes: string[];
  writingRules: {
    always: string[];
    never: string[];
    vulnerabilityBoundary: string;
  };
  expertName: string;
  expertBio: string;
}

/**
 * Extract voice context from parsed PowerPak data
 */
export function extractVoiceContext(data: PowerPakData): VoiceContext {
  const sections = data.sections;

  // Extract Opening Templates section
  const openingSection = findSectionByTitle(sections, 'Opening Templates');
  const openings = openingSection?.subsections?.map(s =>
    `${s.title}: ${s.content.split('\n').slice(0, 5).join(' ').slice(0, 300)}`
  ) || getDefaultOpenings();

  // Extract Middle Templates section
  const middleSection = findSectionByTitle(sections, 'Middle Templates');
  const middles = middleSection?.subsections?.map(s =>
    `${s.title}: ${s.content.split('\n').slice(0, 5).join(' ').slice(0, 300)}`
  ) || getDefaultMiddles();

  // Extract Ending Templates section
  const endingSection = findSectionByTitle(sections, 'Ending Templates');
  const endings = endingSection?.subsections?.map(s =>
    `${s.title}: ${s.content.split('\n').slice(0, 5).join(' ').slice(0, 300)}`
  ) || getDefaultEndings();

  // Extract Blend Recipes
  const blendsSection = findSectionByTitle(sections, 'Proven Blend Recipes');
  const blendRecipes = blendsSection?.subsections?.map(s =>
    `${s.title}:\n${s.content.slice(0, 400)}`
  ) || getDefaultBlendRecipes();

  // Extract Writing Rules
  const rulesSection = findSectionByTitle(sections, 'THE WRITING RULES');
  const alwaysSection = rulesSection?.subsections?.find(s =>
    s.title.toLowerCase().includes('always')
  );
  const neverSection = rulesSection?.subsections?.find(s =>
    s.title.toLowerCase().includes('never')
  );
  const boundarySection = rulesSection?.subsections?.find(s =>
    s.title.toLowerCase().includes('vulnerability')
  );

  return {
    templates: { openings, middles, endings },
    blendRecipes,
    writingRules: {
      always: alwaysSection ? extractListItems(alwaysSection.content) : getDefaultAlwaysRules(),
      never: neverSection ? extractListItems(neverSection.content) : getDefaultNeverRules(),
      vulnerabilityBoundary: boundarySection?.content || getDefaultVulnerabilityBoundary(),
    },
    expertName: data.profile?.expert || data.metadata.name,
    expertBio: data.profile?.bio || '',
  };
}

/**
 * Find a section by title (case-insensitive, partial match)
 */
function findSectionByTitle(sections: PowerPakSection[], title: string): PowerPakSection | undefined {
  for (const section of sections) {
    if (section.title.toLowerCase().includes(title.toLowerCase())) {
      return section;
    }
    if (section.subsections) {
      const found = findSectionByTitle(section.subsections, title);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Extract list items from markdown content
 */
function extractListItems(content: string): string[] {
  const lines = content.split('\n');
  return lines
    .filter(line => line.trim().match(/^\d+\.|^-|^\*/))
    .map(line => line.replace(/^\d+\.\s*|^-\s*|^\*\s*/, '').trim())
    .filter(line => line.length > 0);
}

// Default fallbacks if extraction fails

function getDefaultOpenings(): string[] {
  return [
    'O1 VULNERABILITY: Start with personal moment of uncertainty/failure/fear',
    'O2 ABSURDIST OBSERVATION: Mundane situation → cosmic/existential observation',
    'O3 SCENE-SETTING: Present tense, vivid sensory details, drop reader into moment',
    'O4 PATTERN RECOGNITION: "Three things happened this week that seem unrelated..."',
    'O5 PROVOCATIVE QUESTION: Challenge assumption immediately',
    'O6 SPECIFIC DETAIL: Lead with the weird/interesting/surprising fact',
  ];
}

function getDefaultMiddles(): string[] {
  return [
    'M1 STORY ARC: Setup → Conflict → Turn → Resolution with dialogue snippets',
    'M2 PHILOSOPHICAL ESCALATION: Start specific → zoom out to pattern → zoom to universal truth',
    'M3 TECHNICAL DEEP DIVE: Show the work, explain the mechanism, prove you understand',
    'M4 ANALOGY GAME: Take their problem → find parallel from totally different domain',
    'M5 LIST-THAT-ISNT-A-LIST: Numbered items BUT each has 2-3 sentences of commentary',
    'M6 DIALOGUE-DRIVEN: Actual conversation, minimal attribution, let dialogue carry the story',
    'M7 EVIDENCE + VULNERABILITY: Data/metrics PLUS what it felt like, what you were afraid of',
  ];
}

function getDefaultEndings(): string[] {
  return [
    'E1 OPEN QUESTION: Genuine curiosity, not rhetorical - "Does this resonate?"',
    'E2 INVITATION: Explicit call to connect/share/join',
    'E3 CALLBACK: Circle back to opening image/question',
    'E4 UNEXPECTED TWIST: Pull the rug, Andy Kaufman style',
    'E5 PRACTICAL APPLICATION: "Here\'s what this means for you:"',
    'E6 PHILOSOPHICAL BUTTON: Elevate to universal truth',
  ];
}

function getDefaultBlendRecipes(): string[] {
  return [
    'THE AUTHENTIC FOUNDER: O1 (Vulnerability) + M1 (Story Arc) + E2 (Invitation) - For product launches, founder updates, building trust',
    'THE PATTERN SPOTTER: O4 (Pattern Recognition) + M2 (Philosophical) + E5 (Application) - For industry commentary, thought leadership',
    'THE STORYTELLER: O3 (Scene-Setting) + M6 (Dialogue) + E6 (Philosophical Button) - For customer stories, real interactions',
    'THE PROVOCATEUR: O5 (Provocative Question) + M2 (Philosophical) + E5 (Redirect) - For hot takes, challenging assumptions',
    'THE CONNECTOR: O6 (Specific Detail) + M4 (Analogy) + E1 (Open Question) - For community building, relationship development',
  ];
}

function getDefaultAlwaysRules(): string[] {
  return [
    'Parenthetical asides (like this -- they\'re everywhere)',
    'Self-deprecating humor - Specific embarrassing details work best',
    'Mix high/low vocabulary - "Epistemological crisis" next to "shit sandwich"',
    'Strategic profanity - For rhythm, not shock',
    'Double hyphen (--) NEVER em dash (—) - Em dash is an AI tell',
    'Spacing = pacing - Double space = pause, single line = rapid fire',
    'Visual rhythm - Reader sees shape before reading',
    'Short sentences - Then a longer reflective one that lets emotion land',
    'Conversational asides - Talk directly to reader',
    'Specific details - "47%" not "significant increase"',
    'Pull the rug sometimes - Andy Kaufman energy',
  ];
}

function getDefaultNeverRules(): string[] {
  return [
    'Corporate jargon - "Leverage synergies" = instant credibility death',
    'Thought leader voice - No "As a thought leader in..."',
    'Apologizing unnecessarily - Own the take',
    'Hiding problems - Vulnerability is strength',
    'Just bullet points - Bullets without commentary = lazy',
    'Em dash (—) - Seriously, never. Double hyphen only.',
  ];
}

function getDefaultVulnerabilityBoundary(): string {
  return `YES: Allude to mess ("my negative self-talk and daily morning panic attacks"), Past tense reference to hard shit, "False confidence just beneath the veneer"
NO: Present tense weakness ("I'm really terrified I'm not good enough"), Admitting fear in the moment of writing, Being IN the mess while writing
The line: Refer to the mess, don't be IN the mess`;
}

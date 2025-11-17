#!/usr/bin/env node
/**
 * Template Extraction Script
 *
 * Parses Justin OS markdown files to extract:
 * - Beginning templates (O1-O6)
 * - Middle templates (M1-M7)
 * - Ending templates (E1-E6)
 * - Flavor elements (F1-F10)
 * - Transitions (T1-T4)
 * - Blend recipes
 * - Writing rules
 *
 * Outputs: templates.json, blends.json, rules.json
 */

import * as fs from 'fs';
import * as path from 'path';

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

interface WritingRule {
  category: 'always' | 'never' | 'formatting' | 'voice' | 'vulnerability';
  rule: string;
  explanation?: string;
  examples?: string[];
}

const JUSTIN_OS_PATH = path.join(__dirname, '../../../../justin_os');
const TEMPLATES_OUTPUT = path.join(__dirname, '../templates/templates.json');
const BLENDS_OUTPUT = path.join(__dirname, '../templates/blends.json');
const RULES_OUTPUT = path.join(__dirname, '../templates/rules.json');

function parseTemplateComponents(content: string): Template[] {
  const templates: Template[] = [];

  // Parse Openings (O1-O6)
  const openingPattern = /### (O\d+): ([A-Z\s]+)\n([\s\S]*?)(?=\n###|\n---|\Z)/g;
  let match;

  while ((match = openingPattern.exec(content)) !== null) {
    const [, id, name, body] = match;
    const lines = body.trim().split('\n');

    let description = '';
    let example = '';
    let useFor = '';
    let energyMatch = '';
    let pairsWith: string[] = [];

    for (const line of lines) {
      if (line.startsWith('"') && !example) {
        example = line.replace(/^"|"$/g, '');
      } else if (line.startsWith('**Use for:**')) {
        useFor = line.replace('**Use for:**', '').trim();
      } else if (line.startsWith('**Energy match:**')) {
        energyMatch = line.replace('**Energy match:**', '').trim();
      } else if (!line.startsWith('**') && !example && line.length > 0) {
        description += line + ' ';
      }
    }

    templates.push({
      id: id.toLowerCase(),
      name: name.trim(),
      category: 'beginning',
      description: description.trim(),
      example: example || undefined,
      useFor: useFor || undefined,
      energyMatch: energyMatch || undefined,
    });
  }

  // Parse Middles (M1-M7)
  const middlePattern = /### (M\d+): ([A-Z\s\-]+)\n([\s\S]*?)(?=\n###|\n---|\Z)/g;

  while ((match = middlePattern.exec(content)) !== null) {
    const [, id, name, body] = match;
    const lines = body.trim().split('\n');

    let description = '';
    let useFor = '';
    let pairsWith: string[] = [];

    for (const line of lines) {
      if (line.startsWith('**Use for:**')) {
        useFor = line.replace('**Use for:**', '').trim();
      } else if (line.startsWith('**Pairs with:**')) {
        const pairs = line.replace('**Pairs with:**', '').trim();
        pairsWith = pairs.split(',').map(p => p.trim().toLowerCase());
      } else if (!line.startsWith('**') && line.length > 0) {
        description += line + ' ';
      }
    }

    templates.push({
      id: id.toLowerCase(),
      name: name.trim(),
      category: 'middle',
      description: description.trim(),
      useFor: useFor || undefined,
      pairsWith: pairsWith.length > 0 ? pairsWith : undefined,
    });
  }

  // Parse Endings (E1-E6)
  const endingPattern = /### (E\d+): ([A-Z\s]+)\n([\s\S]*?)(?=\n###|\n---|\Z)/g;

  while ((match = endingPattern.exec(content)) !== null) {
    const [, id, name, body] = match;
    const lines = body.trim().split('\n');

    let description = '';
    let example = '';
    let useFor = '';
    let pairsWith: string[] = [];

    for (const line of lines) {
      if (line.startsWith('"') && !example) {
        example = line.replace(/^"|"$/g, '');
      } else if (line.startsWith('**Use for:**')) {
        useFor = line.replace('**Use for:**', '').trim();
      } else if (line.startsWith('**Pairs with:**')) {
        const pairs = line.replace('**Pairs with:**', '').trim();
        pairsWith = pairs.split(',').map(p => p.trim().toLowerCase());
      } else if (!line.startsWith('**') && line.length > 0) {
        description += line + ' ';
      }
    }

    templates.push({
      id: id.toLowerCase(),
      name: name.trim(),
      category: 'ending',
      description: description.trim(),
      example: example || undefined,
      useFor: useFor || undefined,
      pairsWith: pairsWith.length > 0 ? pairsWith : undefined,
    });
  }

  // Parse Flavor Elements (F1-F10)
  const flavorPattern = /### (F\d+): ([A-Z\s\-\(\)\/]+)\n([\s\S]*?)(?=\n###|\n---|\Z)/g;

  while ((match = flavorPattern.exec(content)) !== null) {
    const [, id, name, body] = match;

    templates.push({
      id: id.toLowerCase(),
      name: name.trim(),
      category: 'flavor',
      description: body.trim(),
    });
  }

  // Parse Transitions (T1-T4)
  const transitionPattern = /### (T\d+): ([A-Z\s]+)\n([\s\S]*?)(?=\n###|\n---|\Z)/g;

  while ((match = transitionPattern.exec(content)) !== null) {
    const [, id, name, body] = match;

    templates.push({
      id: id.toLowerCase(),
      name: name.trim(),
      category: 'transition',
      description: body.trim(),
    });
  }

  return templates;
}

function parseBlendRecipes(content: string): BlendRecipe[] {
  const blends: BlendRecipe[] = [];

  // Parse top 5 recipes
  const recipePattern = /### \d+\. ([A-Z\s]+)\n\*\*Components:\*\* (.*?)\n\*\*When to use:\*\* (.*?)\n(?:\*\*Typical performance:\*\* (.*?)\n)?(?:\*\*Energy match:\*\* (.*?)\n)?(?:\*\*Example topics:\*\* (.*?)\n)?(?:\*\*Why it works:\*\* (.*?)\n)?/g;

  let match;
  while ((match = recipePattern.exec(content)) !== null) {
    const [, name, components, whenToUse, performance, energy, topics, whyItWorks] = match;

    // Parse components (e.g., "O1 (Vulnerability) + M1 (Story Arc) + E2 (Invitation)")
    const componentParts = components.split('+').map(c => c.trim());
    const opening = componentParts[0]?.match(/([OME]\d+)/)?.[1]?.toLowerCase() || '';
    const middle = componentParts.filter(c => c.match(/M\d+/)).map(c => c.match(/M\d+/)?.[0]?.toLowerCase() || '');
    const ending = componentParts[componentParts.length - 1]?.match(/E\d+/)?.[1]?.toLowerCase() || '';

    blends.push({
      name: name.trim(),
      components: {
        opening,
        middle,
        ending,
      },
      whenToUse: whenToUse.trim(),
      typicalPerformance: performance?.trim(),
      energyMatch: energy?.trim() || '',
      exampleTopics: topics?.trim(),
      whyItWorks: whyItWorks?.trim(),
    });
  }

  // Parse experimental blends
  const experimentalPattern = /### ([A-Z\s]+)\n\*\*Components:\*\* (.*?)\n\*\*Status:\*\* (.*?)\n/g;

  while ((match = experimentalPattern.exec(content)) !== null) {
    const [, name, components, status] = match;

    if (status.includes('works consistently') || status.includes('Testing')) {
      const componentParts = components.split('+').map(c => c.trim());
      const opening = componentParts[0]?.match(/([OF]\d+)/)?.[1]?.toLowerCase() || '';
      const middle = componentParts.filter(c => c.match(/[MF]\d+/)).map(c => c.match(/[MF]\d+/)?.[0]?.toLowerCase() || '');
      const ending = componentParts[componentParts.length - 1]?.match(/E\d+/)?.[1]?.toLowerCase() || '';

      blends.push({
        name: name.trim(),
        components: {
          opening,
          middle,
          ending,
        },
        whenToUse: 'Experimental',
        energyMatch: 'Varies',
      });
    }
  }

  return blends;
}

function parseWritingRules(content: string): WritingRule[] {
  const rules: WritingRule[] = [];

  // Parse "Always" rules
  const alwaysSection = content.match(/\*\*Always:\*\*\n([\s\S]*?)\n\*\*Never:/);
  if (alwaysSection) {
    const lines = alwaysSection[1].split('\n').filter(l => l.trim().startsWith('-'));
    lines.forEach(line => {
      const ruleText = line.replace(/^-\s*/, '').trim();
      rules.push({
        category: 'always',
        rule: ruleText,
      });
    });
  }

  // Parse "Never" rules
  const neverSection = content.match(/\*\*Never:\*\*\n([\s\S]*?)(?=\n##|\Z)/);
  if (neverSection) {
    const lines = neverSection[1].split('\n').filter(l => l.trim().startsWith('-'));
    lines.forEach(line => {
      const ruleText = line.replace(/^-\s*/, '').trim();
      rules.push({
        category: 'never',
        rule: ruleText,
      });
    });
  }

  // Add specific formatting rules
  rules.push({
    category: 'formatting',
    rule: 'Use double hyphen (--) never em dash (—)',
    explanation: 'Em dash is an AI tell',
  });

  rules.push({
    category: 'formatting',
    rule: 'Spacing equals pacing',
    explanation: 'Double space = pause, single line = rapid fire, long paragraph = story time',
  });

  // Add vulnerability boundary
  rules.push({
    category: 'vulnerability',
    rule: 'Refer to the mess, don\'t be IN the mess',
    explanation: 'Allude to past struggles, don\'t express present weakness',
    examples: [
      'YES: "my negative self-talk and daily morning panic attacks"',
      'NO: "I\'m really terrified I\'m not good enough right now"',
    ],
  });

  // Add voice rules
  rules.push({
    category: 'voice',
    rule: 'Parenthetical asides (like this)',
    explanation: 'Signature conversational element',
  });

  rules.push({
    category: 'voice',
    rule: 'Mix high and low vocabulary in same sentence',
    explanation: 'Creates unique rhythm and accessibility',
    examples: ['"The ontological implications are, frankly, fucking wild"'],
  });

  rules.push({
    category: 'voice',
    rule: 'Strategic profanity for rhythm, not shock',
    explanation: 'Use cursing to create beats and emphasis',
  });

  return rules;
}

function main() {
  console.log('Extracting templates from Justin OS documentation...\n');

  // Read template components file
  const templateComponentsPath = path.join(JUSTIN_OS_PATH, '02_TEMPLATE_COMPONENTS.md');
  const templateContent = fs.readFileSync(templateComponentsPath, 'utf-8');

  console.log('Parsing template components...');
  const templates = parseTemplateComponents(templateContent);
  console.log(`  ✓ Extracted ${templates.length} templates`);

  // Read blend recipes file
  const blendRecipesPath = path.join(JUSTIN_OS_PATH, '04_BLEND_RECIPES.md');
  const blendContent = fs.readFileSync(blendRecipesPath, 'utf-8');

  console.log('Parsing blend recipes...');
  const blends = parseBlendRecipes(blendContent);
  console.log(`  ✓ Extracted ${blends.length} blend recipes`);

  // Read writing engine file
  const writingEnginePath = path.join(JUSTIN_OS_PATH, '01_WRITING_ENGINE.md');
  const rulesContent = fs.readFileSync(writingEnginePath, 'utf-8');

  console.log('Parsing writing rules...');
  const rules = parseWritingRules(rulesContent);
  console.log(`  ✓ Extracted ${rules.length} writing rules`);

  // Ensure output directory exists
  const templatesDir = path.dirname(TEMPLATES_OUTPUT);
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  // Write outputs
  console.log('\nWriting output files...');

  fs.writeFileSync(
    TEMPLATES_OUTPUT,
    JSON.stringify({ templates }, null, 2),
    'utf-8'
  );
  console.log(`  ✓ ${TEMPLATES_OUTPUT}`);

  fs.writeFileSync(
    BLENDS_OUTPUT,
    JSON.stringify({ blends }, null, 2),
    'utf-8'
  );
  console.log(`  ✓ ${BLENDS_OUTPUT}`);

  fs.writeFileSync(
    RULES_OUTPUT,
    JSON.stringify({ rules }, null, 2),
    'utf-8'
  );
  console.log(`  ✓ ${RULES_OUTPUT}`);

  console.log('\n✓ Template extraction complete!');
  console.log(`\nSummary:`);
  console.log(`  - Beginnings: ${templates.filter(t => t.category === 'beginning').length}`);
  console.log(`  - Middles: ${templates.filter(t => t.category === 'middle').length}`);
  console.log(`  - Endings: ${templates.filter(t => t.category === 'ending').length}`);
  console.log(`  - Flavors: ${templates.filter(t => t.category === 'flavor').length}`);
  console.log(`  - Transitions: ${templates.filter(t => t.category === 'transition').length}`);
  console.log(`  - Blend Recipes: ${blends.length}`);
  console.log(`  - Writing Rules: ${rules.length}`);
}

main();

#!/usr/bin/env node

/**
 * Simple PowerPak Knowledge Graph Loader
 * Loads directly into Neo4j without embeddings or Memento MCP
 */

import neo4j from 'neo4j-driver';
import { GraphExtractor } from './graph-extractor.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration from environment or defaults
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://127.0.0.1:7687';
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'powerpak_password';
const NEO4J_DATABASE = process.env.NEO4J_DATABASE || 'neo4j';

// PowerPak skill paths
const skillPaths = [
  // Platinum Tier
  {
    id: 'justin-strackany',
    tier: 'platinum',
    path: path.resolve(__dirname, '../../../skills/platinum/justin-strackany/SKILL.md'),
  },
  {
    id: 'scott-leese',
    tier: 'platinum',
    path: path.resolve(__dirname, '../../../skills/platinum/scott-leese/SKILL.md'),
  },
  // Premium Tier
  {
    id: 'gary-vaynerchuk',
    tier: 'premium',
    path: path.resolve(__dirname, '../../../skills/premium/gary-vaynerchuk/SKILL.md'),
  },
  {
    id: 'jill-rowley',
    tier: 'premium',
    path: path.resolve(__dirname, '../../../skills/premium/jill-rowley/SKILL.md'),
  },
  {
    id: 'andrew-ng',
    tier: 'premium',
    path: path.resolve(__dirname, '../../../skills/premium/andrew-ng/SKILL.md'),
  },
  // Regular Tier
  {
    id: 'maya-chen',
    tier: 'regular',
    path: path.resolve(__dirname, '../../../skills/regular/maya-chen/SKILL.md'),
  },
  {
    id: 'jordan-williams',
    tier: 'regular',
    path: path.resolve(__dirname, '../../../skills/regular/jordan-williams/SKILL.md'),
  },
  {
    id: 'priya-sharma',
    tier: 'regular',
    path: path.resolve(__dirname, '../../../skills/regular/priya-sharma/SKILL.md'),
  },
  {
    id: 'marcus-thompson',
    tier: 'regular',
    path: path.resolve(__dirname, '../../../skills/regular/marcus-thompson/SKILL.md'),
  },
  // Spotlight Tier
  {
    id: 'david-martinez',
    tier: 'spotlight',
    path: path.resolve(__dirname, '../../../skills/spotlight/david-martinez/SKILL-PREMIUM.md'),
  },
];

async function main() {
  console.log('='.repeat(70));
  console.log('  PowerPak Knowledge Graph Loader (Direct Neo4j)');
  console.log('='.repeat(70));
  console.log();

  console.log('Configuration:');
  console.log(`  Neo4j URI: ${NEO4J_URI}`);
  console.log(`  Neo4j Database: ${NEO4J_DATABASE}`);
  console.log(`  PowerPak Skills: ${skillPaths.length}`);
  console.log();

  // Connect to Neo4j
  const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
  );

  let session;
  try {
    session = driver.session({ database: NEO4J_DATABASE });

    // Verify connection
    console.log('Connecting to Neo4j...');
    await session.run('RETURN 1');
    console.log('✓ Connected to Neo4j');
    console.log();

    // Clear existing data (optional - comment out to preserve)
    console.log('Clearing existing PowerPak data...');
    await session.run(`
      MATCH (n)
      WHERE n:Expert OR n:Framework OR n:Concept OR n:Skill
      DETACH DELETE n
    `);
    console.log('✓ Cleared existing data');
    console.log();

    // Create extractor
    const extractor = new GraphExtractor();

    // Load each expert
    for (const skill of skillPaths) {
      console.log(`Loading ${skill.id}...`);

      const graphData = await extractor.extract(skill.path);

      // Create expert node
      await session.run(`
        MERGE (e:Expert {name: $name})
        SET e.entityType = $entityType,
            e.observations = $observations
      `, {
        name: graphData.expert.name,
        entityType: graphData.expert.entityType,
        observations: graphData.expert.observations
      });

      // Create framework nodes
      for (const framework of graphData.frameworks) {
        await session.run(`
          MERGE (f:Framework {name: $name})
          SET f.entityType = $entityType,
              f.observations = $observations
        `, {
          name: framework.name,
          entityType: framework.entityType,
          observations: framework.observations
        });
      }

      // Create concept nodes
      for (const concept of graphData.concepts) {
        await session.run(`
          MERGE (c:Concept {name: $name})
          SET c.entityType = $entityType,
              c.observations = $observations
        `, {
          name: concept.name,
          entityType: concept.entityType,
          observations: concept.observations
        });
      }

      // Create skill nodes
      for (const skillNode of graphData.skills) {
        await session.run(`
          MERGE (s:Skill {name: $name})
          SET s.entityType = $entityType,
              s.observations = $observations
        `, {
          name: skillNode.name,
          entityType: skillNode.entityType,
          observations: skillNode.observations
        });
      }

      // Create relationships
      for (const relation of graphData.relations) {
        const query = `
          MATCH (a {name: $from})
          MATCH (b {name: $to})
          MERGE (a)-[r:${relation.relationType}]->(b)
          SET r.strength = $strength,
              r.confidence = $confidence
        `;

        await session.run(query, {
          from: relation.from,
          to: relation.to,
          strength: relation.strength,
          confidence: relation.confidence
        });
      }

      console.log(`  ✓ Loaded ${graphData.expert.name}`);
      console.log(`    - ${graphData.frameworks.length} frameworks`);
      console.log(`    - ${graphData.concepts.length} concepts`);
      console.log(`    - ${graphData.skills.length} skills`);
      console.log(`    - ${graphData.relations.length} relationships`);
      console.log();
    }

    // Create cross-expert relationships
    console.log('Creating cross-expert relationships...');

    // Justin <-> Scott: Revenue + Sales collaboration
    await session.run(`
      MATCH (j:Expert {name: 'Justin Strackany'})
      MATCH (s:Expert {name: 'Scott Leese'})
      MERGE (j)-[r:COLLABORATES_WITH]->(s)
      SET r.strength = 0.9,
          r.confidence = 0.95,
          r.context = 'Revenue Operations + Sales Leadership'
    `);

    // Scott <-> Jill: Sales expertise
    await session.run(`
      MATCH (s:Expert {name: 'Scott Leese'})
      MATCH (j:Expert {name: 'Jill Rowley'})
      MERGE (s)-[r:COLLABORATES_WITH]->(j)
      SET r.strength = 0.8,
          r.confidence = 0.9,
          r.context = 'Sales Leadership + Social Selling'
    `);

    // Justin <-> Jordan: Customer Success focus
    await session.run(`
      MATCH (j:Expert {name: 'Justin Strackany'})
      MATCH (jo:Expert {name: 'Jordan Williams'})
      MERGE (j)-[r:COLLABORATES_WITH]->(jo)
      SET r.strength = 0.85,
          r.confidence = 0.9,
          r.context = 'Customer Success Operations'
    `);

    // Gary <-> Jill: Content + Social media
    await session.run(`
      MATCH (g:Expert {name: 'Gary Vaynerchuk'})
      MATCH (j:Expert {name: 'Jill Rowley'})
      MERGE (g)-[r:COLLABORATES_WITH]->(j)
      SET r.strength = 0.75,
          r.confidence = 0.85,
          r.context = 'Content Strategy + Social Selling'
    `);

    // Priya <-> Scott: Sales operations
    await session.run(`
      MATCH (p:Expert {name: 'Priya Sharma'})
      MATCH (s:Expert {name: 'Scott Leese'})
      MERGE (p)-[r:COLLABORATES_WITH]->(s)
      SET r.strength = 0.8,
          r.confidence = 0.9,
          r.context = 'Sales Operations + Leadership'
    `);

    console.log('✓ Cross-expert relationships created');
    console.log();

    // Summary
    const stats = await session.run(`
      MATCH (n)
      RETURN
        count(DISTINCT n) as totalNodes,
        count(DISTINCT CASE WHEN n:Expert THEN n END) as experts,
        count(DISTINCT CASE WHEN n:Framework THEN n END) as frameworks,
        count(DISTINCT CASE WHEN n:Concept THEN n END) as concepts,
        count(DISTINCT CASE WHEN n:Skill THEN n END) as skills
    `);

    const record = stats.records[0];
    console.log('='.repeat(70));
    console.log('  Knowledge Graph Loaded Successfully!');
    console.log('='.repeat(70));
    console.log();
    console.log(`  Total Nodes: ${record.get('totalNodes')}`);
    console.log(`  - Experts: ${record.get('experts')}`);
    console.log(`  - Frameworks: ${record.get('frameworks')}`);
    console.log(`  - Concepts: ${record.get('concepts')}`);
    console.log(`  - Skills: ${record.get('skills')}`);
    console.log();
    console.log('Open Neo4j Browser at http://localhost:7474 to visualize!');
    console.log();

  } catch (error) {
    console.error('✗ Error loading knowledge graph:');
    console.error(error);
    process.exit(1);
  } finally {
    if (session) await session.close();
    await driver.close();
  }
}

main();

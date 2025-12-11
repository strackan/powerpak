#!/usr/bin/env node
/**
 * Scene Manager for PowerPak Presentation
 *
 * Usage:
 *   node scene-manager.js list                       - List all scenes (brief)
 *   node scene-manager.js view                       - View scenes with headlines
 *   node scene-manager.js add <position> <title>     - Insert new scene at position
 *   node scene-manager.js delete <position>          - Delete scene at position
 *   node scene-manager.js move <from> <to>           - Move scene from one position to another
 *   node scene-manager.js swap <pos1> <pos2>         - Swap two scenes
 *   node scene-manager.js renumber                   - Fix all scene numbers sequentially
 *
 * The renumber command updates:
 *   - index.html: scene comments, data-scene attributes, navigation dots
 *   - scenes.js: totalScenes, sceneNames array, data-scene selectors, switch cases
 */

const fs = require('fs');
const path = require('path');

const HTML_FILE = path.join(__dirname, 'index.html');
const JS_FILE = path.join(__dirname, 'assets', 'scenes.js');

// Read files
function readHTML() {
  return fs.readFileSync(HTML_FILE, 'utf8');
}

function writeHTML(content) {
  fs.writeFileSync(HTML_FILE, content, 'utf8');
}

function readJS() {
  return fs.readFileSync(JS_FILE, 'utf8');
}

function writeJS(content) {
  fs.writeFileSync(JS_FILE, content, 'utf8');
}

// Parse scenes from HTML
function parseScenes(html) {
  const scenes = [];
  const sectionRegex = /<!-- SCENE (\d+[a-z]?): ([^>]+) -->\s*<section class="scene[^"]*"[^>]*data-scene="([^"]+)">([\s\S]*?)<\/section>/g;

  let match;
  while ((match = sectionRegex.exec(html)) !== null) {
    scenes.push({
      commentNum: match[1],
      title: match[2].trim(),
      dataScene: match[3],
      content: match[4],
      fullMatch: match[0],
      index: match.index
    });
  }
  return scenes;
}

// List all scenes (brief)
function listScenes() {
  const html = readHTML();
  const scenes = parseScenes(html);

  console.log('\nCurrent Scenes:');
  console.log('===============');
  scenes.forEach((scene, idx) => {
    const num = String(idx + 1).padStart(2, ' ');
    console.log(`  ${num}. ${scene.title}`);
  });
  console.log(`\nTotal: ${scenes.length} scenes\n`);
}

// View scenes with details
function viewScenes() {
  const html = readHTML();
  const scenes = parseScenes(html);

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║              POWERPAK PRESENTATION - SCENE LIST               ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');

  let currentAct = '';
  scenes.forEach((scene, idx) => {
    const num = idx + 1;

    // Try to detect act breaks from comments
    const actMatch = scene.title.match(/^(ACT \d+|Tent Pole \d+)/i);

    // Extract first line of content as description
    const h1Match = scene.content.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const h2Match = scene.content.match(/<h2[^>]*>([^<]+)<\/h2>/);
    const headline = h1Match ? h1Match[1].replace(/\s+/g, ' ').trim() : '';
    const subhead = h2Match ? h2Match[1].replace(/\s+/g, ' ').trim() : '';

    const numStr = String(num).padStart(2, ' ');
    const titleStr = scene.title.substring(0, 35).padEnd(35, ' ');

    console.log(`║ ${numStr}. ${titleStr}                        ║`);
    if (headline) {
      const headStr = headline.substring(0, 58).padEnd(58, ' ');
      console.log(`║     └─ "${headStr}" ║`);
    }
  });

  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  Total: ${scenes.length} scenes                                              ║`);
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
}

// Renumber all scenes sequentially
function renumberScenes() {
  let html = readHTML();
  const scenes = parseScenes(html);

  console.log('\nRenumbering scenes...');

  // Build mapping of old scene numbers to new scene numbers
  const oldToNewMap = {};
  scenes.forEach((scene, idx) => {
    const oldNum = parseInt(scene.dataScene);
    const newNum = idx + 1;
    if (oldNum !== newNum) {
      oldToNewMap[oldNum] = newNum;
    }
  });

  if (Object.keys(oldToNewMap).length > 0) {
    console.log('Scene number changes:');
    Object.entries(oldToNewMap).forEach(([old, newN]) => {
      console.log(`  ${old} → ${newN}`);
    });
  }

  // Work backwards to avoid index shifting issues
  for (let i = scenes.length - 1; i >= 0; i--) {
    const scene = scenes[i];
    const newNum = i + 1;

    // Update the comment and data-scene attribute
    const oldPattern = new RegExp(
      `<!-- SCENE ${scene.commentNum}: ${escapeRegex(scene.title)} -->\\s*<section class="scene[^"]*"([^>]*)data-scene="${scene.dataScene}"`,
      'g'
    );
    const newText = `<!-- SCENE ${newNum}: ${scene.title} -->\n    <section class="scene"$1data-scene="${newNum}"`;

    html = html.replace(oldPattern, newText);
  }

  // Update navigation dots
  const dotRegex = /<span class="scene-dot[^"]*" data-scene="[^"]+" title="[^"]+"><\/span>/g;
  const dots = html.match(dotRegex) || [];

  // Rebuild dots section
  let newDots = '';
  scenes.forEach((scene, idx) => {
    const num = idx + 1;
    const activeClass = num === 1 ? ' active' : '';
    newDots += `      <span class="scene-dot${activeClass}" data-scene="${num}" title="${scene.title}"></span>\n`;
  });

  // Replace dots section
  html = html.replace(
    /<div class="scene-dots">\s*([\s\S]*?)\s*<\/div>/,
    `<div class="scene-dots">\n${newDots}    </div>`
  );

  writeHTML(html);

  // Update JS file (including data-scene selectors and switch cases)
  updateJSSceneCount(scenes.length, scenes.map(s => s.title), oldToNewMap);

  console.log(`\nRenumbered ${scenes.length} scenes.`);
  console.log('Updated: index.html, scenes.js (totalScenes, sceneNames, data-scene selectors, switch cases)\n');
  listScenes();
}

// Update JavaScript scene count, names, and all data-scene selectors
function updateJSSceneCount(count, titles, oldToNewMap) {
  let js = readJS();

  // Update totalScenes
  js = js.replace(/const totalScenes = \d+;/, `const totalScenes = ${count};`);

  // Update sceneNames array
  const namesArray = "const sceneNames = [\n  '', // 0 index placeholder\n" +
    titles.map(t => `  '${t.replace(/'/g, "\\'")}'`).join(',\n') +
    '\n];';

  js = js.replace(/const sceneNames = \[[\s\S]*?\];/, namesArray);

  // Update data-scene selectors if we have a mapping
  if (oldToNewMap && Object.keys(oldToNewMap).length > 0) {
    // Sort keys in descending order to avoid replacing "1" inside "10", "11", etc.
    const sortedOldNums = Object.keys(oldToNewMap)
      .map(Number)
      .sort((a, b) => b - a);

    // Use temporary placeholders to avoid conflicts
    const placeholder = '___SCENE_PLACEHOLDER_';

    // First pass: replace old numbers with placeholders
    sortedOldNums.forEach(oldNum => {
      const newNum = oldToNewMap[oldNum];
      // Replace data-scene="X" selectors
      js = js.replace(
        new RegExp(`data-scene="${oldNum}"`, 'g'),
        `data-scene="${placeholder}${newNum}"`
      );
      // Replace case X: in switch statements
      js = js.replace(
        new RegExp(`case ${oldNum}:`, 'g'),
        `case ${placeholder}${newNum}:`
      );
    });

    // Second pass: remove placeholders
    js = js.replace(new RegExp(placeholder, 'g'), '');
  }

  writeJS(js);
}

// Delete a scene
function deleteScene(position) {
  let html = readHTML();
  const scenes = parseScenes(html);

  if (position < 1 || position > scenes.length) {
    console.error(`Invalid position ${position}. Valid range: 1-${scenes.length}`);
    return;
  }

  const scene = scenes[position - 1];
  console.log(`\nDeleting scene ${position}: "${scene.title}"...`);

  // Remove the scene section
  const sectionRegex = new RegExp(
    `\\s*<!-- SCENE ${scene.commentNum}: ${escapeRegex(scene.title)} -->[\\s\\S]*?<\\/section>`,
    ''
  );
  html = html.replace(sectionRegex, '');

  writeHTML(html);

  // Renumber remaining scenes
  renumberScenes();
}

// Add a new scene
function addScene(position, title) {
  let html = readHTML();
  const scenes = parseScenes(html);

  if (position < 1 || position > scenes.length + 1) {
    console.error(`Invalid position ${position}. Valid range: 1-${scenes.length + 1}`);
    return;
  }

  console.log(`\nAdding new scene at position ${position}: "${title}"...`);

  // Create new scene HTML
  const newScene = `
    <!-- SCENE ${position}: ${title} -->
    <section class="scene" data-scene="${position}">
      <div class="scene-inner new-scene">
        <h1 class="scene-title">${title}</h1>
        <p class="scene-subtitle">[ Edit this scene content ]</p>
      </div>
    </section>
`;

  if (position === 1) {
    // Insert at the beginning after scene-container opening
    html = html.replace(
      '<div class="scene-container">',
      '<div class="scene-container">' + newScene
    );
  } else {
    // Insert after the previous scene
    const prevScene = scenes[position - 2];
    const insertPoint = html.indexOf('</section>', prevScene.index) + '</section>'.length;
    html = html.slice(0, insertPoint) + newScene + html.slice(insertPoint);
  }

  writeHTML(html);

  // Renumber all scenes
  renumberScenes();
}

// Move scene from one position to another
function moveScene(from, to) {
  let html = readHTML();
  const scenes = parseScenes(html);

  if (from < 1 || from > scenes.length || to < 1 || to > scenes.length) {
    console.error(`Invalid positions. Valid range: 1-${scenes.length}`);
    return;
  }

  if (from === to) {
    console.log('Source and destination are the same. Nothing to do.');
    return;
  }

  console.log(`\nMoving scene ${from} to position ${to}...`);

  const scene = scenes[from - 1];

  // Extract the scene content (including comment)
  const sceneRegex = new RegExp(
    `(\\s*<!-- SCENE ${scene.commentNum}: ${escapeRegex(scene.title)} -->[\\s\\S]*?<\\/section>)`,
    ''
  );
  const sceneMatch = html.match(sceneRegex);

  if (!sceneMatch) {
    console.error('Could not find scene to move.');
    return;
  }

  const sceneContent = sceneMatch[1];

  // Remove from original position
  html = html.replace(sceneRegex, '');

  // Re-parse to get updated positions
  const updatedScenes = parseScenes(html);

  // Insert at new position
  const targetIdx = to <= from ? to - 1 : to - 2;

  if (targetIdx < 0) {
    // Insert at beginning
    html = html.replace(
      '<div class="scene-container">',
      '<div class="scene-container">' + sceneContent
    );
  } else if (targetIdx >= updatedScenes.length) {
    // Insert at end (before closing tags)
    const lastScene = updatedScenes[updatedScenes.length - 1];
    const insertPoint = html.indexOf('</section>', lastScene.index) + '</section>'.length;
    html = html.slice(0, insertPoint) + sceneContent + html.slice(insertPoint);
  } else {
    const targetScene = updatedScenes[targetIdx];
    const insertPoint = html.indexOf('</section>', targetScene.index) + '</section>'.length;
    html = html.slice(0, insertPoint) + sceneContent + html.slice(insertPoint);
  }

  writeHTML(html);

  // Renumber all scenes
  renumberScenes();
}

// Swap two scenes
function swapScenes(pos1, pos2) {
  let html = readHTML();
  const scenes = parseScenes(html);

  if (pos1 < 1 || pos1 > scenes.length || pos2 < 1 || pos2 > scenes.length) {
    console.error(`Invalid positions. Valid range: 1-${scenes.length}`);
    return;
  }

  if (pos1 === pos2) {
    console.log('Same positions. Nothing to do.');
    return;
  }

  console.log(`\nSwapping scenes ${pos1} and ${pos2}...`);

  // Ensure pos1 < pos2 for easier handling
  if (pos1 > pos2) [pos1, pos2] = [pos2, pos1];

  const scene1 = scenes[pos1 - 1];
  const scene2 = scenes[pos2 - 1];

  // Extract both scene contents
  const getSceneContent = (scene) => {
    const regex = new RegExp(
      `(\\s*<!-- SCENE ${scene.commentNum}: ${escapeRegex(scene.title)} -->[\\s\\S]*?<\\/section>)`,
      ''
    );
    const match = html.match(regex);
    return match ? match[1] : null;
  };

  const content1 = getSceneContent(scene1);
  const content2 = getSceneContent(scene2);

  if (!content1 || !content2) {
    console.error('Could not find scenes to swap.');
    return;
  }

  // Use placeholders for swap
  html = html.replace(content1, '<<<SCENE1_PLACEHOLDER>>>');
  html = html.replace(content2, '<<<SCENE2_PLACEHOLDER>>>');
  html = html.replace('<<<SCENE1_PLACEHOLDER>>>', content2);
  html = html.replace('<<<SCENE2_PLACEHOLDER>>>', content1);

  writeHTML(html);

  // Renumber all scenes
  renumberScenes();
}

// Helper: escape regex special characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'list':
    listScenes();
    break;

  case 'view':
    viewScenes();
    break;

  case 'renumber':
    renumberScenes();
    break;

  case 'delete':
    if (!args[1]) {
      console.error('Usage: node scene-manager.js delete <position>');
    } else {
      deleteScene(parseInt(args[1]));
    }
    break;

  case 'add':
    if (!args[1] || !args[2]) {
      console.error('Usage: node scene-manager.js add <position> <title>');
    } else {
      addScene(parseInt(args[1]), args.slice(2).join(' '));
    }
    break;

  case 'move':
    if (!args[1] || !args[2]) {
      console.error('Usage: node scene-manager.js move <from> <to>');
    } else {
      moveScene(parseInt(args[1]), parseInt(args[2]));
    }
    break;

  case 'swap':
    if (!args[1] || !args[2]) {
      console.error('Usage: node scene-manager.js swap <pos1> <pos2>');
    } else {
      swapScenes(parseInt(args[1]), parseInt(args[2]));
    }
    break;

  default:
    console.log(`
Scene Manager for PowerPak Presentation

Usage:
  node scene-manager.js list                    - List all scenes (brief)
  node scene-manager.js view                    - View scenes with headlines
  node scene-manager.js renumber                - Fix all scene numbers sequentially
  node scene-manager.js add <position> <title>  - Insert new scene at position
  node scene-manager.js delete <position>       - Delete scene at position
  node scene-manager.js move <from> <to>        - Move scene from one position to another
  node scene-manager.js swap <pos1> <pos2>      - Swap two scenes
`);
}

/**
 * PowerPak Scene-Based Presentation JavaScript
 * 22-scene narrative for Dec 4 Scott Leese Demo
 * Expanded from 13 to 22 scenes with full origin story
 *
 * Controls:
 * - Arrow Right / Space: Next scene
 * - Arrow Left: Previous scene
 * - 1-9: Jump to scenes 1-9
 * - Shift+0-9: Jump to scenes 10-19
 * - Ctrl+1-3: Jump to scenes 20-22
 * - Click dots: Jump to scene
 */

// Scene state
let currentScene = 1;
const totalScenes = 22;

// Scene names for title overlay
const sceneNames = [
  '', // 0 index placeholder
  'Title',
  'Credibility',
  'Wilderness',
  'Cambrian Explosion',
  'ADHD Problem',
  'Founder OS',
  'DevComX Insult',
  'Spite Project',
  'Voice OS',
  'Convergence',
  'API Moment',
  'MCP Moment',
  'Permissions',
  'Dating',
  'Enterprise',
  'Holy Shit',
  'New Internet',
  'Live Demo',
  'Platform',
  'Why Us',
  'Three Paths',
  'The Ask'
];

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initSceneNavigation();
  initDatingScenarioControls();
  updateScene();
  // Trigger initial scene animation with slight delay
  setTimeout(() => triggerSceneAnimations(1), 300);
  console.log('PowerPak Presentation v3.0.0 - 22 Scene Edition');
  console.log('Controls:');
  console.log('  Arrow keys / Space: Navigate');
  console.log('  1-9: Scenes 1-9');
  console.log('  Shift+0-9: Scenes 10-19');
  console.log('  Ctrl+1-3: Scenes 20-22');
});

// ===================== SCENE NAVIGATION =====================

function initSceneNavigation() {
  // Keyboard navigation
  document.addEventListener('keydown', handleKeyPress);

  // Dot navigation
  const dots = document.querySelectorAll('.scene-dot');
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const sceneNum = parseInt(dot.dataset.scene);
      if (sceneNum && sceneNum !== currentScene) {
        goToScene(sceneNum);
      }
    });
  });
}

function handleKeyPress(e) {
  // Don't navigate if user is typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  // Arrow/Space navigation
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextScene();
    return;
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevScene();
    return;
  }

  // Number key navigation
  // Ctrl + 1-3 for scenes 20-22
  if (e.ctrlKey && e.key >= '1' && e.key <= '3') {
    e.preventDefault();
    goToScene(19 + parseInt(e.key));
    return;
  }

  // Shift + 0-9 for scenes 10-19
  if (e.shiftKey && e.key >= '0' && e.key <= '9') {
    e.preventDefault();
    const sceneNum = e.key === '0' ? 10 : 10 + parseInt(e.key);
    if (sceneNum <= 19) {
      goToScene(sceneNum);
    }
    return;
  }

  // 1-9 for scenes 1-9
  if (!e.ctrlKey && !e.shiftKey && e.key >= '1' && e.key <= '9') {
    e.preventDefault();
    goToScene(parseInt(e.key));
    return;
  }
}

function nextScene() {
  if (currentScene < totalScenes) {
    goToScene(currentScene + 1);
  }
}

function prevScene() {
  if (currentScene > 1) {
    goToScene(currentScene - 1);
  }
}

function goToScene(sceneNum) {
  if (sceneNum < 1 || sceneNum > totalScenes) return;
  if (sceneNum === currentScene) return;

  currentScene = sceneNum;
  updateScene();
  // Small delay before triggering animations for cleaner transitions
  setTimeout(() => triggerSceneAnimations(sceneNum), 100);
}

function updateScene() {
  // Update scene visibility
  const scenes = document.querySelectorAll('.scene');
  scenes.forEach(scene => {
    const sceneNum = parseInt(scene.dataset.scene);
    scene.classList.toggle('active', sceneNum === currentScene);
  });

  // Update dots
  const dots = document.querySelectorAll('.scene-dot');
  dots.forEach(dot => {
    const dotNum = parseInt(dot.dataset.scene);
    dot.classList.toggle('active', dotNum === currentScene);
  });

  // Update progress bar
  const progressBar = document.getElementById('scene-progress');
  if (progressBar) {
    const progress = (currentScene / totalScenes) * 100;
    progressBar.style.width = `${progress}%`;
  }

  // Update title overlay
  const titleOverlay = document.getElementById('scene-title-overlay');
  if (titleOverlay) {
    titleOverlay.querySelector('.scene-number').textContent = `${currentScene}/${totalScenes}`;
    titleOverlay.querySelector('.scene-name').textContent = sceneNames[currentScene];
  }
}

// ===================== SCENE ANIMATIONS =====================

function triggerSceneAnimations(sceneNum) {
  // Reset any previous animations in this scene first
  resetSceneAnimations(sceneNum);

  switch (sceneNum) {
    case 2:
      animateCredibility();
      break;
    case 3:
      animateWilderness();
      break;
    case 4:
      animateCambrian();
      break;
    case 5:
      animateAdhdProblem();
      break;
    case 6:
      animateFounderOS();
      break;
    case 7:
      animateDevComX();
      break;
    case 8:
      animateSpite();
      break;
    case 9:
      animateVoiceOS();
      break;
    case 10:
      animateConvergence();
      break;
    case 11:
      animateApi();
      break;
    case 12:
      animateMCP();
      break;
    case 13:
      animatePermissions();
      break;
    case 16:
      animateHolyShit();
      break;
    case 17:
      animateNewInternet();
      break;
    case 20:
      animateWhyUs();
      break;
    case 21:
      animatePaths();
      break;
    case 22:
      animateAsk();
      break;
  }
}

function resetSceneAnimations(sceneNum) {
  const scene = document.querySelector(`[data-scene="${sceneNum}"]`);
  if (!scene) return;

  // Remove visible class from all animated elements
  scene.querySelectorAll('.visible').forEach(el => el.classList.remove('visible'));
}

// ===================== SCENE 2: CREDIBILITY =====================

function animateCredibility() {
  const eras = document.querySelectorAll('[data-scene="2"] .timeline-era');
  const pov = document.querySelector('[data-scene="2"] .credibility-pov');

  eras.forEach(era => {
    const delay = parseInt(era.dataset.delay) || 300;
    setTimeout(() => era.classList.add('visible'), delay);
  });

  if (pov) {
    setTimeout(() => pov.classList.add('visible'), 2000);
  }
}

// ===================== SCENE 3: WILDERNESS =====================

function animateWilderness() {
  const quote = document.querySelector('[data-scene="3"] .moment-quote');
  const reactions = document.querySelectorAll('[data-scene="3"] .reaction-line');
  const tensionBox = document.querySelector('[data-scene="3"] .tension-box');

  if (quote) {
    setTimeout(() => quote.classList.add('visible'), 300);
  }

  reactions.forEach((line, index) => {
    setTimeout(() => line.classList.add('visible'), 1500 + index * 400);
  });

  if (tensionBox) {
    setTimeout(() => tensionBox.classList.add('visible'), 3000);
  }
}

// ===================== SCENE 4: CAMBRIAN =====================

function animateCambrian() {
  const bubbles = document.querySelectorAll('[data-scene="4"] .project-bubble');

  bubbles.forEach(bubble => {
    const delay = parseInt(bubble.dataset.delay) || 500;
    setTimeout(() => bubble.classList.add('visible'), delay);
  });
}

// ===================== SCENE 5: ADHD PROBLEM =====================

function animateAdhdProblem() {
  const items = document.querySelectorAll('[data-scene="5"] .chaos-item');
  const error = document.querySelector('[data-scene="5"] .chaos-error');

  items.forEach(item => {
    const delay = parseInt(item.dataset.delay) || 200;
    setTimeout(() => item.classList.add('visible'), delay);
  });

  if (error) {
    const delay = parseInt(error.dataset.delay) || 1200;
    setTimeout(() => error.classList.add('visible'), delay);
  }
}

// ===================== SCENE 6: FOUNDER OS =====================

function animateFounderOS() {
  const layers = document.querySelectorAll('[data-scene="6"] .os-layer');

  layers.forEach(layer => {
    const delay = parseInt(layer.dataset.delay) || 300;
    setTimeout(() => layer.classList.add('visible'), delay);
  });
}

// ===================== SCENE 7: DEVCOMX =====================

function animateDevComX() {
  const context = document.querySelector('[data-scene="7"] .context-card');
  const claim = document.querySelector('[data-scene="7"] .claim-bubble');
  const reaction = document.querySelector('[data-scene="7"] .reaction-bubble');
  const feeling = document.querySelector('[data-scene="7"] .devcomx-feeling');

  if (context) setTimeout(() => context.classList.add('visible'), 300);
  if (claim) setTimeout(() => claim.classList.add('visible'), 1000);
  if (reaction) setTimeout(() => reaction.classList.add('visible'), 1800);
  if (feeling) setTimeout(() => feeling.classList.add('visible'), 2600);
}

// ===================== SCENE 8: SPITE PROJECT =====================

function animateSpite() {
  const steps = document.querySelectorAll('[data-scene="8"] .process-step');

  steps.forEach(step => {
    const delay = parseInt(step.dataset.delay) || 300;
    setTimeout(() => step.classList.add('visible'), delay);
  });
}

// ===================== SCENE 9: VOICE OS =====================

function animateVoiceOS() {
  const columns = document.querySelectorAll('[data-scene="9"] .template-column');

  columns.forEach(col => {
    const delay = parseInt(col.dataset.delay) || 300;
    setTimeout(() => col.classList.add('visible'), delay);
  });
}

// ===================== SCENE 10: CONVERGENCE =====================

function animateConvergence() {
  const founderBranch = document.querySelector('[data-scene="10"] .founder-branch');
  const voiceBranch = document.querySelector('[data-scene="10"] .voice-branch');
  const mergePoint = document.querySelector('[data-scene="10"] .merge-point');
  const result = document.querySelector('[data-scene="10"] .convergence-result');
  const conclusion = document.querySelector('[data-scene="10"] .convergence-conclusion');

  if (founderBranch) {
    const delay = parseInt(founderBranch.dataset.delay) || 300;
    setTimeout(() => founderBranch.classList.add('visible'), delay);
  }

  if (voiceBranch) {
    const delay = parseInt(voiceBranch.dataset.delay) || 500;
    setTimeout(() => voiceBranch.classList.add('visible'), delay);
  }

  if (mergePoint) {
    const delay = parseInt(mergePoint.dataset.delay) || 800;
    setTimeout(() => mergePoint.classList.add('visible'), delay);
  }

  if (result) {
    const delay = parseInt(result.dataset.delay) || 1200;
    setTimeout(() => result.classList.add('visible'), delay);
  }

  if (conclusion) {
    const delay = parseInt(conclusion.dataset.delay) || 1600;
    setTimeout(() => conclusion.classList.add('visible'), delay);
  }
}

// ===================== SCENE 11: API =====================

function animateApi() {
  const panels = document.querySelectorAll('[data-scene="11"] .api-panel');

  panels.forEach((panel, index) => {
    setTimeout(() => panel.classList.add('visible'), 300 + index * 500);
  });
}

// ===================== SCENE 12: MCP MOMENT =====================

function animateMCP() {
  const steps = document.querySelectorAll('[data-scene="12"] .evolution-step');
  const arrows = document.querySelectorAll('[data-scene="12"] .evolution-arrow');

  steps.forEach(step => {
    const delay = parseInt(step.dataset.delay) || 300;
    setTimeout(() => step.classList.add('visible'), delay);
  });

  arrows.forEach(arrow => {
    const delay = parseInt(arrow.dataset.delay) || 600;
    setTimeout(() => arrow.classList.add('visible'), delay);
  });
}

// ===================== SCENE 13: PERMISSIONS =====================

function animatePermissions() {
  const branches = document.querySelectorAll('[data-scene="13"] .major-branch');

  branches.forEach((branch, index) => {
    setTimeout(() => branch.classList.add('visible'), 300 + index * 400);
  });
}

// ===================== SCENE 16: HOLY SHIT =====================

function animateHolyShit() {
  const lines = document.querySelectorAll('[data-scene="16"] .realization-line');
  const story = document.querySelector('[data-scene="16"] .origin-story');

  lines.forEach(line => {
    const delay = parseInt(line.dataset.delay) || 500;
    setTimeout(() => line.classList.add('visible'), delay);
  });

  if (story) {
    const delay = parseInt(story.dataset.delay) || 3000;
    setTimeout(() => story.classList.add('visible'), delay);
  }
}

// ===================== SCENE 17: NEW INTERNET =====================

function animateNewInternet() {
  const items = document.querySelectorAll('[data-scene="17"] .timeline-item');
  const quote = document.querySelector('[data-scene="17"] .internet-quote');

  items.forEach(item => {
    const delay = parseInt(item.dataset.delay) || 300;
    setTimeout(() => item.classList.add('visible'), delay);
  });

  if (quote) {
    setTimeout(() => quote.classList.add('visible'), 1500);
  }
}

// ===================== SCENE 20: WHY US =====================

function animateWhyUs() {
  const panels = document.querySelectorAll('[data-scene="20"] .founder-panel');
  const result = document.querySelector('[data-scene="20"] .together-result');

  panels.forEach((panel, index) => {
    setTimeout(() => panel.classList.add('visible'), 300 + index * 400);
  });

  if (result) {
    setTimeout(() => result.classList.add('visible'), 1200);
  }
}

// ===================== SCENE 21: THREE PATHS =====================

function animatePaths() {
  const cards = document.querySelectorAll('[data-scene="21"] .path-card');

  cards.forEach((card, index) => {
    setTimeout(() => card.classList.add('visible'), 300 + index * 300);
  });
}

// ===================== SCENE 22: THE ASK =====================

function animateAsk() {
  const items = document.querySelectorAll('[data-scene="22"] .ask-item');
  const finalLine = document.querySelector('[data-scene="22"] .final-line');

  items.forEach((item, index) => {
    setTimeout(() => item.classList.add('visible'), 500 + index * 500);
  });

  if (finalLine) {
    setTimeout(() => finalLine.classList.add('visible'), 500 + items.length * 500 + 500);
  }
}

// ===================== DATING SCENARIO (SCENE 14) =====================

let datingStep = 1;
const totalDatingSteps = 4;

function initDatingScenarioControls() {
  const prevBtn = document.getElementById('prev-scenario');
  const nextBtn = document.getElementById('next-scenario');
  const timelineSteps = document.querySelectorAll('[data-scene="14"] .timeline-step');

  if (!prevBtn || !nextBtn) return;

  prevBtn.addEventListener('click', () => {
    if (datingStep > 1) {
      datingStep--;
      updateDatingStep();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (datingStep < totalDatingSteps) {
      datingStep++;
      updateDatingStep();
    }
  });

  // Click on timeline steps
  timelineSteps.forEach(step => {
    step.addEventListener('click', () => {
      const stepNum = parseInt(step.dataset.step);
      if (stepNum) {
        datingStep = stepNum;
        updateDatingStep();
      }
    });
  });

  // Permission toggles
  initPermissionToggles();

  updateDatingStep();
}

function updateDatingStep() {
  const prevBtn = document.getElementById('prev-scenario');
  const nextBtn = document.getElementById('next-scenario');
  const timelineSteps = document.querySelectorAll('[data-scene="14"] .timeline-step');
  const scenarioContents = document.querySelectorAll('[data-scene="14"] .scenario-content');

  // Update button states
  if (prevBtn) prevBtn.disabled = datingStep === 1;
  if (nextBtn) {
    nextBtn.disabled = datingStep === totalDatingSteps;
    nextBtn.textContent = datingStep === totalDatingSteps ? 'Complete' : 'Next Step';
  }

  // Update timeline
  timelineSteps.forEach(step => {
    const stepNum = parseInt(step.dataset.step);
    step.classList.remove('active', 'completed');
    if (stepNum === datingStep) {
      step.classList.add('active');
    } else if (stepNum < datingStep) {
      step.classList.add('completed');
    }
  });

  // Update content visibility
  scenarioContents.forEach(content => {
    const scenario = parseInt(content.dataset.scenario);
    content.classList.toggle('hidden', scenario !== datingStep);
  });

  // Update permission toggles based on step
  updatePermissionTogglesForStep();
}

function initPermissionToggles() {
  const toggles = document.querySelectorAll('.permission-toggle');

  toggles.forEach(toggle => {
    toggle.addEventListener('change', (e) => {
      const permission = e.target.dataset.permission;
      const statusEl = document.getElementById(`status-${permission}`);

      if (statusEl) {
        if (e.target.checked) {
          statusEl.textContent = 'Unlocked';
          statusEl.classList.remove('locked');
          statusEl.classList.add('unlocked');
        } else {
          statusEl.textContent = 'Locked';
          statusEl.classList.add('locked');
          statusEl.classList.remove('unlocked');
        }
      }

      // Auto-advance if on step 3 and both permissions granted
      if (datingStep === 3) {
        const textToggle = document.getElementById('toggle-text');
        const photosToggle = document.getElementById('toggle-photos');
        if (textToggle?.checked && photosToggle?.checked) {
          setTimeout(() => {
            datingStep = 4;
            updateDatingStep();
          }, 500);
        }
      }
    });
  });
}

function updatePermissionTogglesForStep() {
  const toggleText = document.getElementById('toggle-text');
  const togglePhotos = document.getElementById('toggle-photos');
  const statusText = document.getElementById('status-text');
  const statusPhotos = document.getElementById('status-photos');

  if (!toggleText || !togglePhotos) return;

  if (datingStep >= 4) {
    // Unlock state
    toggleText.checked = true;
    togglePhotos.checked = true;
    if (statusText) {
      statusText.textContent = 'Unlocked';
      statusText.classList.remove('locked');
      statusText.classList.add('unlocked');
    }
    if (statusPhotos) {
      statusPhotos.textContent = 'Unlocked';
      statusPhotos.classList.remove('locked');
      statusPhotos.classList.add('unlocked');
    }
  } else {
    // Locked state
    toggleText.checked = false;
    togglePhotos.checked = false;
    if (statusText) {
      statusText.textContent = 'Locked';
      statusText.classList.add('locked');
      statusText.classList.remove('unlocked');
    }
    if (statusPhotos) {
      statusPhotos.textContent = 'Locked';
      statusPhotos.classList.add('locked');
      statusPhotos.classList.remove('unlocked');
    }
  }
}

// ===================== UTILITY =====================

// Debounce for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Expose functions globally for debugging
window.goToScene = goToScene;
window.nextScene = nextScene;
window.prevScene = prevScene;
window.currentScene = () => currentScene;

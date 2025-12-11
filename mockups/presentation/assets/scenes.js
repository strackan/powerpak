/**
 * PowerPak Scene-Based Presentation JavaScript
 * 23-scene narrative for Dec 4 Scott Leese Demo
 * Expanded from 13 to 23 scenes with full origin story
 *
 * Controls:
 * - Arrow Right / Space: Next scene
 * - Arrow Left: Previous scene
 * - 1-9: Jump to scenes 1-9
 * - Shift+0-9: Jump to scenes 10-19
 * - Ctrl+1-6: Jump to scenes 20-25
 * - Click dots: Jump to scene
 */

// Scene state
let currentScene = 1;
const totalScenes = 25;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initSceneNavigation();
  initDatingScenarioControls();
  updateScene();
  // Trigger initial scene animation with slight delay
  setTimeout(() => triggerSceneAnimations(1), 300);
  console.log('PowerPak Presentation v3.0.0 - 25 Scene Edition');
  console.log('Controls:');
  console.log('  Arrow keys / Space: Navigate');
  console.log('  1-9: Scenes 1-9');
  console.log('  Shift+0-9: Scenes 10-19');
  console.log('  Ctrl+1-6: Scenes 20-25');
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

  // Click handler for scene 19 (Holy Shit callout reveal)
  const scene19 = document.querySelector('[data-scene="19"]');
  if (scene19) {
    scene19.addEventListener('click', (e) => {
      // Don't trigger if clicking on navigation elements
      if (e.target.closest('.scene-nav') || e.target.closest('.scene-dot')) return;
      handleHolyShitReveal();
    });
  }

  // Click handler for scene 20 (New Internet staged reveals)
  const scene20 = document.querySelector('[data-scene="20"]');
  if (scene20) {
    scene20.addEventListener('click', (e) => {
      // Don't trigger if clicking on navigation elements
      if (e.target.closest('.scene-nav') || e.target.closest('.scene-dot')) return;
      handleNewInternetReveal();
    });
  }
}

function handleKeyPress(e) {
  // Don't navigate if user is typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  // Arrow/Space navigation
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();

    // Special case: Scene 5 has a split reveal - trigger it first
    if (currentScene === 5) {
      const splitContainer = document.querySelector('[data-scene="5"] .cambrian-split-container');
      if (splitContainer && !splitContainer.classList.contains('split')) {
        splitContainer.classList.add('split');
        return; // Don't advance yet
      }
    }

    // Special case: Scene 19 has the "Did I invent the Internet?" callout
    if (currentScene === 19 && handleHolyShitReveal()) {
      return; // Don't advance yet - reveal the callout first
    }

    // Special case: Scene 20 has staged reveals (left table, right table, quote)
    if (currentScene === 20 && handleNewInternetReveal()) {
      return; // Don't advance yet - reveal next element first
    }

    nextScene();
    return;
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevScene();
    return;
  }

  // Number key navigation
  // Ctrl + 1-6 for scenes 20-25
  if (e.ctrlKey && e.key >= '1' && e.key <= '6') {
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
    case 5:
      animateCambrian();
      break;
    case 6:
      animateAdhdProblem();
      break;
    case 7:
      animateFounderOS();
      break;
    case 8:
      animateDevComX();
      break;
    case 9:
      animateSpite();
      break;
    case 10:
      animateVoiceOS();
      break;
    case 11:
      animateConvergence();
      break;
    case 12:
      animateApi();
      break;
    case 13:
      animateMCP();
      break;
    case 14:
      animateIntroPowerPak();
      break;
    case 16:
      animateProfessional();
      break;
    case 17:
      animatePersonal();
      break;
    case 18:
      animateCorporate();
      break;
    case 15:
      animatePermissions();
      break;
    case 19:
      animateHolyShit();
      break;
    case 20:
      animateNewInternet();
      break;
    case 21:
      // Live Demo - no animation needed
      break;
    case 22:
      // Platform Showcase - no animation needed
      break;
    case 23:
      animateWhyUs();
      break;
    case 24:
      animatePaths();
      break;
    case 25:
      animateAsk();
      break;
  }
}

function resetSceneAnimations(sceneNum) {
  const scene = document.querySelector(`[data-scene="${sceneNum}"]`);
  if (!scene) return;

  // Remove visible class from all animated elements (but keep .split for cambrian)
  scene.querySelectorAll('.visible').forEach(el => el.classList.remove('visible'));

  // Also reset split state for scene 5 when entering
  if (sceneNum === 5) {
    const splitContainer = scene.querySelector('.cambrian-split-container');
    if (splitContainer) {
      splitContainer.classList.remove('split');
    }
  }
}

// ===================== SCENE 2: CREDIBILITY =====================

function animateCredibility() {
  const scene = document.querySelector('[data-scene="2"]');
  if (!scene) return;

  // Title and subtitle
  const title = scene.querySelector('.scene-title');
  const subtitle = scene.querySelector('.scene-subtitle');

  // Left column
  const buildingHeader = scene.querySelector('.building-phase .column-header');
  const buildingWrapper = scene.querySelector('.building-wrapper');
  const buildingLabel = scene.querySelector('.building-label');
  const buildingCards = scene.querySelectorAll('.building-wrapper .timeline-era');

  // Right column
  const exitsHeader = scene.querySelector('.exits-phase .column-header');
  const ccoWrapper = scene.querySelector('.cco-wrapper');
  const ccoLabel = scene.querySelector('.cco-label');
  const exitCards = scene.querySelectorAll('.exits-phase .exit-card');

  // POV section
  const pov = scene.querySelector('.credibility-pov');

  // Animation sequence
  if (title) setTimeout(() => title.classList.add('visible'), 0);
  if (subtitle) setTimeout(() => subtitle.classList.add('visible'), 200);

  // Left column
  if (buildingHeader) setTimeout(() => buildingHeader.classList.add('visible'), 400);
  if (buildingWrapper) setTimeout(() => buildingWrapper.classList.add('visible'), 500);
  if (buildingLabel) setTimeout(() => buildingLabel.classList.add('visible'), 700);
  // All 3 cards at once
  buildingCards.forEach((card) => {
    setTimeout(() => card.classList.add('visible'), 900);
  });

  // Right column
  if (exitsHeader) setTimeout(() => exitsHeader.classList.add('visible'), 1100);
  if (ccoWrapper) setTimeout(() => ccoWrapper.classList.add('visible'), 1200);
  if (ccoLabel) setTimeout(() => ccoLabel.classList.add('visible'), 1400);
  // All 3 cards at once
  exitCards.forEach((card) => {
    setTimeout(() => card.classList.add('visible'), 1600);
  });

  // POV at end
  if (pov) setTimeout(() => pov.classList.add('visible'), 1900);
}

// ===================== SCENE 3: WILDERNESS =====================

function animateWilderness() {
  const quote = document.querySelector('[data-scene="3"] .moment-quote');
  const attribution = document.querySelector('[data-scene="3"] .moment-attribution');
  const reactions = document.querySelectorAll('[data-scene="3"] .reaction-line');
  const tensionBox = document.querySelector('[data-scene="3"] .tension-box');

  if (quote) {
    setTimeout(() => quote.classList.add('visible'), 300);
  }

  if (attribution) {
    setTimeout(() => attribution.classList.add('visible'), 900);
  }

  reactions.forEach((line, index) => {
    setTimeout(() => line.classList.add('visible'), 1500 + index * 400);
  });

  if (tensionBox) {
    setTimeout(() => tensionBox.classList.add('visible'), 3000);
  }
}

// ===================== SCENE 5: CAMBRIAN =====================

function animateCambrian() {
  const bubbles = document.querySelectorAll('[data-scene="5"] .project-bubble');
  const splitContainer = document.querySelector('[data-scene="5"] .cambrian-split-container');

  // Animate bubbles appearing
  bubbles.forEach(bubble => {
    const delay = parseInt(bubble.dataset.delay) || 500;
    setTimeout(() => bubble.classList.add('visible'), delay);
  });

  // Add click handler to trigger split animation (only once)
  if (splitContainer && !splitContainer.dataset.clickBound) {
    splitContainer.dataset.clickBound = 'true';

    // Use mousedown instead of click to avoid any interference
    splitContainer.addEventListener('mousedown', function(e) {
      e.stopPropagation();
      this.classList.toggle('split');
      console.log('Split toggled:', this.classList.contains('split'));
    });
  }
}

// Also bind on page load in case scene 5 is visited directly
document.addEventListener('DOMContentLoaded', () => {
  const splitContainer = document.querySelector('[data-scene="5"] .cambrian-split-container');
  if (splitContainer && !splitContainer.dataset.clickBound) {
    splitContainer.dataset.clickBound = 'true';
    splitContainer.addEventListener('mousedown', function(e) {
      e.stopPropagation();
      this.classList.toggle('split');
      console.log('Split toggled (init):', this.classList.contains('split'));
    });
  }
});

// ===================== SCENE 6: ADHD PROBLEM =====================

function animateAdhdProblem() {
  const items = document.querySelectorAll('[data-scene="6"] .chaos-item');
  const error = document.querySelector('[data-scene="6"] .chaos-error');

  items.forEach(item => {
    const delay = parseInt(item.dataset.delay) || 200;
    setTimeout(() => item.classList.add('visible'), delay);
  });

  if (error) {
    const delay = parseInt(error.dataset.delay) || 1200;
    setTimeout(() => error.classList.add('visible'), delay);
  }
}

// ===================== SCENE 7: FOUNDER OS =====================

function animateFounderOS() {
  const root = document.querySelector('[data-scene="7"] .os-root');
  const branches = document.querySelectorAll('[data-scene="7"] .os-branch');

  // Animate root first
  if (root) {
    const delay = parseInt(root.dataset.delay) || 200;
    setTimeout(() => root.classList.add('visible'), delay);
  }

  // Then animate branches
  branches.forEach(branch => {
    const delay = parseInt(branch.dataset.delay) || 400;
    setTimeout(() => branch.classList.add('visible'), delay);
  });
}

// ===================== SCENE 8: DEVCOMX =====================

function animateDevComX() {
  const left = document.querySelector('[data-scene="8"] .devcomx-left');
  const right = document.querySelector('[data-scene="8"] .devcomx-right');

  if (left) {
    const delay = parseInt(left.dataset.delay) || 300;
    setTimeout(() => left.classList.add('visible'), delay);
  }

  if (right) {
    const delay = parseInt(right.dataset.delay) || 800;
    setTimeout(() => right.classList.add('visible'), delay);
  }
}

// ===================== SCENE 9: SPITE PROJECT =====================

function animateSpite() {
  const steps = document.querySelectorAll('[data-scene="9"] .process-step');

  steps.forEach(step => {
    const delay = parseInt(step.dataset.delay) || 300;
    setTimeout(() => step.classList.add('visible'), delay);
  });
}

// ===================== SCENE 10: VOICE OS =====================

function animateVoiceOS() {
  const columns = document.querySelectorAll('[data-scene="10"] .template-column');
  const blendCards = document.querySelectorAll('[data-scene="10"] .blend-card');
  const accuracy = document.querySelector('[data-scene="10"] .voice-accuracy');

  columns.forEach(col => {
    const delay = parseInt(col.dataset.delay) || 300;
    setTimeout(() => col.classList.add('visible'), delay);
  });

  blendCards.forEach(card => {
    const delay = parseInt(card.dataset.delay) || 700;
    setTimeout(() => card.classList.add('visible'), delay);
  });

  if (accuracy) {
    const delay = parseInt(accuracy.dataset.delay) || 1000;
    setTimeout(() => accuracy.classList.add('visible'), delay);
  }
}

// ===================== SCENE 11: CONVERGENCE =====================

function animateConvergence() {
  const boxes = document.querySelectorAll('[data-scene="11"] .convergence-box');
  const plusSigns = document.querySelectorAll('[data-scene="11"] .convergence-plus');

  boxes.forEach(box => {
    const delay = parseInt(box.dataset.delay) || 300;
    setTimeout(() => box.classList.add('visible'), delay);
  });

  plusSigns.forEach(plus => {
    const delay = parseInt(plus.dataset.delay) || 500;
    setTimeout(() => plus.classList.add('visible'), delay);
  });
}

// ===================== SCENE 12: API =====================

function animateApi() {
  const panels = document.querySelectorAll('[data-scene="12"] .api-panel');

  panels.forEach((panel, index) => {
    setTimeout(() => panel.classList.add('visible'), 300 + index * 500);
  });
}

// ===================== SCENE 13: MCP MOMENT =====================

function animateMCP() {
  const bullets = document.querySelectorAll('[data-scene="13"] .mcp-bullet');
  const footer = document.querySelector('[data-scene="13"] .mcp-footer');

  bullets.forEach(bullet => {
    const delay = parseInt(bullet.dataset.delay) || 300;
    setTimeout(() => bullet.classList.add('visible'), delay);
  });

  if (footer) {
    const delay = parseInt(footer.dataset.delay) || 1300;
    setTimeout(() => footer.classList.add('visible'), delay);
  }
}

// ===================== SCENE 14: INTRO POWERPAK =====================

function animateIntroPowerPak() {
  const features = document.querySelector('[data-scene="14"] .powerpak-features');
  const network = document.querySelector('[data-scene="14"] .network-preview');

  if (features) {
    const delay = parseInt(features.dataset.delay) || 400;
    setTimeout(() => features.classList.add('visible'), delay);
  }

  if (network) {
    const delay = parseInt(network.dataset.delay) || 800;
    setTimeout(() => network.classList.add('visible'), delay);
  }
}

// ===================== SCENE 16: PROFESSIONAL =====================

function animateProfessional() {
  const panels = document.querySelectorAll('[data-scene="16"] .pro-panel');

  panels.forEach(panel => {
    const delay = parseInt(panel.dataset.delay) || 300;
    setTimeout(() => panel.classList.add('visible'), delay);
  });
}

// ===================== SCENE 17: PERSONAL =====================

function animatePersonal() {
  const timeline = document.querySelector('[data-scene="17"] .scenario-timeline');
  const panels = document.querySelector('[data-scene="17"] .dating-panels');
  const controls = document.querySelector('[data-scene="17"] .scenario-controls');

  if (timeline) {
    const delay = parseInt(timeline.dataset.delay) || 300;
    setTimeout(() => timeline.classList.add('visible'), delay);
  }

  if (panels) {
    const delay = parseInt(panels.dataset.delay) || 500;
    setTimeout(() => panels.classList.add('visible'), delay);
  }

  if (controls) {
    const delay = parseInt(controls.dataset.delay) || 700;
    setTimeout(() => controls.classList.add('visible'), delay);
  }

  // Reset dating step when entering scene
  datingStep = 1;
  updateDatingStep();
}

// ===================== SCENE 18: CORPORATE =====================

function animateCorporate() {
  const companyCard = document.querySelector('[data-scene="18"] .company-card');
  const dashboard = document.querySelector('[data-scene="18"] .dashboard-container');

  if (companyCard) {
    const delay = parseInt(companyCard.dataset.delay) || 300;
    setTimeout(() => companyCard.classList.add('visible'), delay);
  }

  if (dashboard) {
    const delay = parseInt(dashboard.dataset.delay) || 500;
    setTimeout(() => dashboard.classList.add('visible'), delay);
  }
}

// ===================== SCENE 19: PERMISSIONS =====================

function animatePermissions() {
  const branches = document.querySelectorAll('[data-scene="15"] .major-branch');

  branches.forEach((branch, index) => {
    setTimeout(() => branch.classList.add('visible'), 300 + index * 400);
  });
}

// ===================== SCENE 17: HOLY SHIT =====================

// Track if callout has been revealed
let holyShitCalloutRevealed = false;

function animateHolyShit() {
  const lines = document.querySelectorAll('[data-scene="19"] .realization-line');

  // Reset callout state when entering scene
  holyShitCalloutRevealed = false;

  lines.forEach(line => {
    const delay = parseInt(line.dataset.delay) || 500;
    setTimeout(() => line.classList.add('visible'), delay);
  });

  // Callout is triggered manually via click or right arrow - see handleHolyShitReveal
}

function handleHolyShitReveal() {
  if (currentScene !== 19 || holyShitCalloutRevealed) return false;

  const callout = document.querySelector('[data-scene="19"] .holy-callout');
  if (callout && !callout.classList.contains('visible')) {
    callout.classList.add('visible');
    holyShitCalloutRevealed = true;
    return true; // Consumed the click/keypress
  }
  return false;
}

// ===================== SCENE 18: NEW INTERNET =====================

// Track reveal stage for scene 20: 0=title, 1=subtitle, 2=left table, 3=right table, 4=quote, 5=done
let newInternetStage = 0;

function animateNewInternet() {
  // Reset stage when entering scene
  newInternetStage = 0;

  const title = document.querySelector('[data-scene="20"] .internet-title');
  const subtitle = document.querySelector('[data-scene="20"] .internet-subtitle');

  // Title appears immediately
  if (title) {
    title.classList.add('visible');
  }

  // Subtitle appears after 0.5s
  if (subtitle) {
    setTimeout(() => {
      subtitle.classList.add('visible');
      newInternetStage = 1; // Ready for first click
    }, 500);
  }
}

function handleNewInternetReveal() {
  if (currentScene !== 20) return false;

  const leftCol = document.querySelector('[data-scene="20"] .old-internet');
  const rightCol = document.querySelector('[data-scene="20"] .new-internet');
  const quote = document.querySelector('[data-scene="20"] .internet-quote');

  // Stage 1: Show left table (Old Internet)
  if (newInternetStage === 1 && leftCol && !leftCol.classList.contains('visible')) {
    leftCol.classList.add('visible');
    // Also animate items within
    leftCol.querySelectorAll('.timeline-item').forEach((item, i) => {
      setTimeout(() => item.classList.add('visible'), i * 100);
    });
    newInternetStage = 2;
    return true;
  }

  // Stage 2: Show right table (AI Internet)
  if (newInternetStage === 2 && rightCol && !rightCol.classList.contains('visible')) {
    rightCol.classList.add('visible');
    // Also animate items within
    rightCol.querySelectorAll('.timeline-item').forEach((item, i) => {
      setTimeout(() => item.classList.add('visible'), i * 100);
    });
    newInternetStage = 3;
    return true;
  }

  // Stage 3: Show footer quote
  if (newInternetStage === 3 && quote && !quote.classList.contains('visible')) {
    quote.classList.add('visible');
    newInternetStage = 4;
    return true;
  }

  // Stage 4+: Allow navigation to next slide
  return false;
}

// ===================== SCENE 21: WHY US =====================

function animateWhyUs() {
  const panels = document.querySelectorAll('[data-scene="23"] .founder-panel');
  const result = document.querySelector('[data-scene="23"] .together-result');

  panels.forEach((panel, index) => {
    setTimeout(() => panel.classList.add('visible'), 300 + index * 400);
  });

  if (result) {
    setTimeout(() => result.classList.add('visible'), 1200);
  }
}

// ===================== SCENE 22: THREE PATHS =====================

function animatePaths() {
  const cards = document.querySelectorAll('[data-scene="24"] .path-card');

  cards.forEach((card, index) => {
    setTimeout(() => card.classList.add('visible'), 300 + index * 300);
  });
}

// ===================== SCENE 23: THE ASK =====================

function animateAsk() {
  const items = document.querySelectorAll('[data-scene="25"] .ask-item');
  const finalLine = document.querySelector('[data-scene="25"] .final-line');

  items.forEach((item, index) => {
    setTimeout(() => item.classList.add('visible'), 500 + index * 500);
  });

  if (finalLine) {
    setTimeout(() => finalLine.classList.add('visible'), 500 + items.length * 500 + 500);
  }
}

// ===================== DATING SCENARIO (SCENE 16) =====================

let datingStep = 1;
const totalDatingSteps = 4;

function initDatingScenarioControls() {
  const prevBtn = document.getElementById('prev-scenario');
  const nextBtn = document.getElementById('next-scenario');
  const timelineSteps = document.querySelectorAll('[data-scene="17"] .timeline-step');

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

  // Initialize dashboard tabs
  initDashboardTabs();

  updateDatingStep();
}

function updateDatingStep() {
  const prevBtn = document.getElementById('prev-scenario');
  const nextBtn = document.getElementById('next-scenario');
  const timelineSteps = document.querySelectorAll('[data-scene="17"] .timeline-step');
  const scenarioContents = document.querySelectorAll('[data-scene="17"] .scenario-content');

  // Update button states
  if (prevBtn) prevBtn.disabled = datingStep === 1;
  if (nextBtn) {
    nextBtn.disabled = datingStep === totalDatingSteps;
    nextBtn.textContent = datingStep === totalDatingSteps ? 'Complete' : 'Next Step →';
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
    content.classList.toggle('active', scenario === datingStep);
  });

  // Update permission toggles based on step
  updatePermissionTogglesForStep();
}

// ===================== DASHBOARD TABS (SCENE 17) =====================

function initDashboardTabs() {
  const dashNavBtns = document.querySelectorAll('[data-scene="18"] .dash-nav-btn');
  const dashTabs = document.querySelectorAll('[data-scene="18"] .dash-tab');

  dashNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;

      // Update active button
      dashNavBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show corresponding tab
      dashTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
      });
    });
  });
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
  // Get checkboxes from slide 17 using data-permission attributes
  const toggleText = document.querySelector('[data-scene="17"] .permission-toggle[data-permission="text"]');
  const togglePhotos = document.querySelector('[data-scene="17"] .permission-toggle[data-permission="photos"]');
  const toggleLocation = document.querySelector('[data-scene="17"] .permission-toggle[data-permission="location"]');

  if (!toggleText || !togglePhotos) return;

  if (datingStep >= 3) {
    // Step 3 (Permission) or Step 4 (Unlock) - Sarah grants access
    toggleText.checked = true;
    togglePhotos.checked = true;
    // Location stays unchecked (optional permission)
    if (toggleLocation) toggleLocation.checked = false;
  } else {
    // Steps 1-2: All locked
    toggleText.checked = false;
    togglePhotos.checked = false;
    if (toggleLocation) toggleLocation.checked = false;
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

/**
 * PowerPak Demo Presentation JavaScript
 * Handles tab navigation, dating scenario steps, and journey slides
 */

document.addEventListener('DOMContentLoaded', () => {
  initTabNavigation();
  initDatingScenario();
  initJourneySlides();
  initPermissionToggles();
});

// ===================== TAB NAVIGATION =====================

function initTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;

      // Update button states
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Update content visibility
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetTab) {
          content.classList.add('active');
        }
      });

      // Reset journey slides when switching to summary tab
      if (targetTab === 'summary') {
        resetJourneySlides();
      }
    });
  });

  // Keyboard navigation for tabs
  document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '5' && e.ctrlKey) {
      const index = parseInt(e.key) - 1;
      if (tabButtons[index]) {
        tabButtons[index].click();
      }
    }
  });
}

// ===================== DATING SCENARIO =====================

let currentScenario = 1;
const totalScenarios = 4;

function initDatingScenario() {
  const prevBtn = document.getElementById('prev-scenario');
  const nextBtn = document.getElementById('next-scenario');
  const timelineSteps = document.querySelectorAll('.timeline-step');

  if (!prevBtn || !nextBtn) return;

  prevBtn.addEventListener('click', () => {
    if (currentScenario > 1) {
      currentScenario--;
      updateDatingScenario();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentScenario < totalScenarios) {
      currentScenario++;
      updateDatingScenario();
    }
  });

  // Click on timeline steps
  timelineSteps.forEach(step => {
    step.addEventListener('click', () => {
      const stepNum = parseInt(step.dataset.step);
      if (stepNum) {
        currentScenario = stepNum;
        updateDatingScenario();
      }
    });
  });

  updateDatingScenario();
}

function updateDatingScenario() {
  const prevBtn = document.getElementById('prev-scenario');
  const nextBtn = document.getElementById('next-scenario');
  const timelineSteps = document.querySelectorAll('.timeline-step');
  const scenarioContents = document.querySelectorAll('.scenario-content');

  // Update button states
  prevBtn.disabled = currentScenario === 1;
  nextBtn.disabled = currentScenario === totalScenarios;
  nextBtn.textContent = currentScenario === totalScenarios ? 'Complete' : 'Next Step';

  // Update timeline
  timelineSteps.forEach(step => {
    const stepNum = parseInt(step.dataset.step);
    step.classList.remove('active', 'completed');
    if (stepNum === currentScenario) {
      step.classList.add('active');
    } else if (stepNum < currentScenario) {
      step.classList.add('completed');
    }
  });

  // Update content visibility
  scenarioContents.forEach(content => {
    const scenario = parseInt(content.dataset.scenario);
    content.classList.toggle('hidden', scenario !== currentScenario);
  });

  // Update permission toggles based on scenario
  updatePermissionTogglesForScenario();
}

function updatePermissionTogglesForScenario() {
  const toggleText = document.getElementById('toggle-text');
  const togglePhotos = document.getElementById('toggle-photos');
  const statusText = document.getElementById('status-text');
  const statusPhotos = document.getElementById('status-photos');

  if (!toggleText || !togglePhotos) return;

  if (currentScenario >= 4) {
    // Unlock state
    toggleText.checked = true;
    togglePhotos.checked = true;
    statusText.textContent = 'Unlocked';
    statusText.classList.remove('locked');
    statusText.classList.add('unlocked');
    statusPhotos.textContent = 'Unlocked';
    statusPhotos.classList.remove('locked');
    statusPhotos.classList.add('unlocked');
  } else if (currentScenario >= 3) {
    // Partial unlock (showing permission granting)
    toggleText.checked = false;
    togglePhotos.checked = false;
  } else {
    // Locked state
    toggleText.checked = false;
    togglePhotos.checked = false;
    statusText.textContent = 'Locked';
    statusText.classList.add('locked');
    statusText.classList.remove('unlocked');
    statusPhotos.textContent = 'Locked';
    statusPhotos.classList.add('locked');
    statusPhotos.classList.remove('unlocked');
  }
}

// ===================== PERMISSION TOGGLES =====================

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

      // If in dating scenario, potentially advance to next step
      if (currentScenario === 3) {
        const textToggle = document.getElementById('toggle-text');
        const photosToggle = document.getElementById('toggle-photos');
        if (textToggle?.checked && photosToggle?.checked) {
          // Auto-advance after short delay
          setTimeout(() => {
            currentScenario = 4;
            updateDatingScenario();
          }, 500);
        }
      }
    });
  });
}

// ===================== JOURNEY SLIDES =====================

let currentSlide = 1;
const totalSlides = 7;

function initJourneySlides() {
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');
  const dots = document.querySelectorAll('.slide-dot');

  if (!prevBtn || !nextBtn) return;

  prevBtn.addEventListener('click', () => {
    if (currentSlide > 1) {
      currentSlide--;
      updateJourneySlide();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentSlide < totalSlides) {
      currentSlide++;
      updateJourneySlide();
    }
  });

  // Click on dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideNum = parseInt(dot.dataset.slide);
      if (slideNum) {
        currentSlide = slideNum;
        updateJourneySlide();
      }
    });
  });

  // Keyboard navigation (only when summary tab is active)
  document.addEventListener('keydown', (e) => {
    const summaryTab = document.getElementById('summary');
    if (!summaryTab?.classList.contains('active')) return;

    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      if (currentSlide < totalSlides) {
        currentSlide++;
        updateJourneySlide();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentSlide > 1) {
        currentSlide--;
        updateJourneySlide();
      }
    }
  });

  updateJourneySlide();
}

function updateJourneySlide() {
  const slides = document.querySelectorAll('.journey-slide');
  const dots = document.querySelectorAll('.slide-dot');
  const progressBar = document.getElementById('slide-progress');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');

  // Update slides
  slides.forEach(slide => {
    const slideNum = parseInt(slide.dataset.slide);
    slide.classList.toggle('active', slideNum === currentSlide);
  });

  // Update dots
  dots.forEach(dot => {
    const dotNum = parseInt(dot.dataset.slide);
    dot.classList.toggle('active', dotNum === currentSlide);
  });

  // Update progress bar
  if (progressBar) {
    const progress = (currentSlide / totalSlides) * 100;
    progressBar.style.width = `${progress}%`;
  }

  // Update button states
  if (prevBtn) {
    prevBtn.style.visibility = currentSlide === 1 ? 'hidden' : 'visible';
  }
  if (nextBtn) {
    nextBtn.textContent = currentSlide === totalSlides ? 'Finish' : 'Next →';
  }
}

function resetJourneySlides() {
  currentSlide = 1;
  updateJourneySlide();
}

// ===================== UTILITY FUNCTIONS =====================

// Debounce function for resize events
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

// Handle window resize
window.addEventListener('resize', debounce(() => {
  // Any resize handling if needed
}, 250));

// Log app info
console.log('PowerPak Demo v1.0.0');
console.log('Keyboard shortcuts:');
console.log('  Ctrl+1-5: Switch tabs');
console.log('  Arrow keys: Navigate slides (in Summary tab)');
console.log('  Space: Next slide (in Summary tab)');

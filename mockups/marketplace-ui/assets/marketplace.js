// MCP Universe Marketplace - JavaScript

document.addEventListener('DOMContentLoaded', function() {
  initSearch();
  initFilters();
  initProfileCards();
});

// Search functionality
function initSearch() {
  const searchInput = document.querySelector('.search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    filterProfiles(query);
  });
}

// Filter functionality
function initFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const filterSelect = document.querySelector('.filter-select');

  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const filterGroup = this.parentElement;
      const buttons = filterGroup.querySelectorAll('.filter-btn');

      buttons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      applyFilters();
    });
  });

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilters);
  }
}

// Apply all active filters
function applyFilters() {
  const categoryFilter = document.querySelector('[data-filter="category"] .filter-btn.active');
  const tierFilter = document.querySelector('[data-filter="tier"] .filter-btn.active');
  const sortSelect = document.querySelector('.filter-select');

  const category = categoryFilter ? categoryFilter.dataset.value : 'all';
  const tier = tierFilter ? tierFilter.dataset.value : 'all';
  const sort = sortSelect ? sortSelect.value : 'popular';

  const cards = Array.from(document.querySelectorAll('.profile-card'));

  // Filter cards
  let visibleCards = cards.filter(card => {
    const cardCategory = card.dataset.category;
    const cardTier = card.dataset.tier;

    const categoryMatch = category === 'all' || cardCategory === category;
    const tierMatch = tier === 'all' || cardTier === tier;

    return categoryMatch && tierMatch;
  });

  // Sort cards
  if (sort === 'popular') {
    visibleCards.sort((a, b) => {
      const ratingA = parseFloat(a.dataset.rating) || 0;
      const ratingB = parseFloat(b.dataset.rating) || 0;
      return ratingB - ratingA;
    });
  } else if (sort === 'newest') {
    // In real app, would sort by date
    visibleCards.reverse();
  } else if (sort === 'alphabetical') {
    visibleCards.sort((a, b) => {
      const nameA = a.querySelector('.profile-card-name').textContent;
      const nameB = b.querySelector('.profile-card-name').textContent;
      return nameA.localeCompare(nameB);
    });
  }

  // Show/hide cards
  cards.forEach(card => {
    if (visibleCards.includes(card)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });

  // Re-order visible cards
  const grid = document.querySelector('.profile-grid');
  if (grid) {
    visibleCards.forEach(card => grid.appendChild(card));
  }

  // Update count
  updateResultsCount(visibleCards.length);
}

// Filter profiles by search query
function filterProfiles(query) {
  const cards = document.querySelectorAll('.profile-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const name = card.querySelector('.profile-card-name').textContent.toLowerCase();
    const title = card.querySelector('.profile-card-title').textContent.toLowerCase();
    const tagline = card.querySelector('.profile-card-tagline').textContent.toLowerCase();

    if (name.includes(query) || title.includes(query) || tagline.includes(query)) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  updateResultsCount(visibleCount);
}

// Update results count
function updateResultsCount(count) {
  const resultsCount = document.querySelector('.results-count');
  if (resultsCount) {
    resultsCount.textContent = `${count} expert${count !== 1 ? 's' : ''} found`;
  }
}

// Profile card interactions
function initProfileCards() {
  const profileCards = document.querySelectorAll('.profile-card');

  profileCards.forEach(card => {
    // Click to view profile
    card.addEventListener('click', function(e) {
      // Don't trigger if clicking a button
      if (e.target.closest('.btn')) return;

      const profileUrl = this.dataset.profileUrl;
      if (profileUrl) {
        window.location.href = profileUrl;
      }
    });

    // Install button
    const installBtn = card.querySelector('.btn-install');
    if (installBtn) {
      installBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const name = card.querySelector('.profile-card-name').textContent;
        showInstallModal(name);
      });
    }

    // View profile button
    const viewBtn = card.querySelector('.btn-view');
    if (viewBtn) {
      viewBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const profileUrl = card.dataset.profileUrl;
        if (profileUrl) {
          window.location.href = profileUrl;
        }
      });
    }
  });
}

// Show install modal
function showInstallModal(name) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-icon">✓</div>
      <h2 class="modal-title">Install ${name}'s MCP Server</h2>
      <p class="modal-text">
        This is a demo mockup. In the real platform, this would guide you through
        the MCP server installation process for ${name}.
      </p>
      <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
        Got it!
      </button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Onboarding wizard functionality
function initOnboarding() {
  let currentStep = 1;
  const totalSteps = 4;

  const nextBtn = document.querySelector('.btn-next');
  const prevBtn = document.querySelector('.btn-prev');

  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      if (currentStep < totalSteps) {
        currentStep++;
        updateWizardStep(currentStep);
      } else {
        completeOnboarding();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      if (currentStep > 1) {
        currentStep--;
        updateWizardStep(currentStep);
      }
    });
  }

  // Tier selection
  const tierOptions = document.querySelectorAll('.tier-option');
  tierOptions.forEach(option => {
    option.addEventListener('click', function() {
      tierOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
}

function updateWizardStep(step) {
  // Update progress indicators
  document.querySelectorAll('.wizard-step').forEach((stepEl, index) => {
    stepEl.classList.remove('active', 'completed');
    if (index + 1 < step) {
      stepEl.classList.add('completed');
    } else if (index + 1 === step) {
      stepEl.classList.add('active');
    }
  });

  // Show/hide content
  document.querySelectorAll('.step-content').forEach((content, index) => {
    content.style.display = index + 1 === step ? 'block' : 'none';
  });

  // Update buttons
  const prevBtn = document.querySelector('.btn-prev');
  const nextBtn = document.querySelector('.btn-next');

  if (prevBtn) {
    prevBtn.style.display = step === 1 ? 'none' : 'inline-block';
  }

  if (nextBtn) {
    nextBtn.textContent = step === 4 ? 'Complete' : 'Next';
  }
}

function completeOnboarding() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-icon">🎉</div>
      <h2 class="modal-title">Installation Complete!</h2>
      <p class="modal-text">
        This is a demo mockup. In the real platform, your MCP server would now
        be installed and ready to use.
      </p>
      <button class="btn btn-primary" onclick="window.location.href='index.html'">
        Browse More Experts
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}

// Initialize onboarding if on that page
if (window.location.pathname.includes('onboarding')) {
  document.addEventListener('DOMContentLoaded', initOnboarding);
}

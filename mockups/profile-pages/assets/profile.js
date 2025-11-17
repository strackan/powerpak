// MCP Universe Profile Pages - Shared JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Install button functionality
  const installButtons = document.querySelectorAll('.install-btn');
  installButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      showInstallModal();
    });
  });

  // Copy code button
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(button => {
    button.addEventListener('click', function() {
      const codeBlock = this.parentElement.querySelector('code').textContent;
      navigator.clipboard.writeText(codeBlock).then(() => {
        this.textContent = 'Copied!';
        setTimeout(() => {
          this.textContent = 'Copy';
        }, 2000);
      });
    });
  });

  // Video placeholder
  const videoPlaceholder = document.querySelector('.video-placeholder');
  if (videoPlaceholder) {
    videoPlaceholder.addEventListener('click', function() {
      alert('Video demo would play here');
    });
  }

  // Tool card expand/collapse
  const toolCards = document.querySelectorAll('.tool-card');
  toolCards.forEach(card => {
    card.addEventListener('click', function() {
      this.classList.toggle('expanded');
    });
  });
});

function showInstallModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-icon">✓</div>
      <h2 class="modal-title">Installation Initiated!</h2>
      <p class="modal-text">
        This is a demo mockup. In the real platform, this would guide you through
        the MCP server installation process.
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

function showCalendarModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-icon">📅</div>
      <h2 class="modal-title">Book Your Onboarding Call</h2>
      <p class="modal-text">
        This is a demo mockup. In the real platform, this would open a Calendly
        or similar booking interface for white-glove onboarding.
      </p>
      <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
        Close
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

// ===== THEME =====
function toggleTheme() {
  var html = document.documentElement;
  var current = html.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  var icon = document.getElementById('theme-icon');
  if (icon) {
    icon.innerHTML = theme === 'dark' ? '&#9788;' : '&#9790;';
  }
}

// Load saved theme
(function() {
  var saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon('dark');
  }
})();


// ===== RESUME TABS =====
function switchTab(tabName, e) {
  document.querySelectorAll('.tab-content').forEach(function(el) {
    el.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(function(el) {
    el.classList.remove('active');
  });
  var tab = document.getElementById('tab-' + tabName);
  if (tab) {
    tab.classList.add('active');
  }
  if (e && e.currentTarget) {
    e.currentTarget.classList.add('active');
  }
}


// ===== DETAILED TAB - ACCESS CONTROL =====
// Change this code to your own access code (SHA-256 hash for basic obfuscation)
// Default code: "pavan2025" -> hashed below
// To generate a new hash, run in browser console:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourcode')).then(h => console.log(Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('')))
var ACCESS_HASH = '3946fdd8bd8897fb42bced5688bc20f5ac11d0b334ea4f490425d6f3ed0e0505';

function requestDetailedAccess() {
  // Check if already unlocked in this session
  if (sessionStorage.getItem('detailed_unlocked') === 'true') {
    unlockDetailedTab();
    return;
  }
  document.getElementById('access-modal').style.display = 'flex';
  setTimeout(function() {
    document.getElementById('access-code').focus();
  }, 100);
}

function closeModal() {
  document.getElementById('access-modal').style.display = 'none';
  document.getElementById('access-code').value = '';
  document.getElementById('access-error').textContent = '';
}

function verifyAccess(e) {
  e.preventDefault();
  var code = document.getElementById('access-code').value.trim();

  if (!code) {
    document.getElementById('access-error').textContent = 'Please enter an access code.';
    return false;
  }

  // Hash the input and compare
  hashString(code).then(function(hash) {
    if (hash === ACCESS_HASH) {
      sessionStorage.setItem('detailed_unlocked', 'true');
      closeModal();
      unlockDetailedTab();
    } else {
      document.getElementById('access-error').textContent = 'Invalid access code. Please try again or request access.';
      document.getElementById('access-code').value = '';
      document.getElementById('access-code').focus();
    }
  });

  return false;
}

function unlockDetailedTab() {
  var btn = document.getElementById('btn-detailed');
  btn.innerHTML = '&#128275; Detailed';
  btn.classList.remove('tab-locked');
  btn.classList.add('tab-unlocked');
  btn.onclick = function(e) { switchTab('detailed', e); };

  // Switch to the tab now
  document.querySelectorAll('.tab-content').forEach(function(el) {
    el.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(function(el) {
    el.classList.remove('active');
  });
  var tab = document.getElementById('tab-detailed');
  if (tab) {
    tab.classList.add('active');
  }
  btn.classList.add('active');
}

async function hashString(str) {
  var data = new TextEncoder().encode(str);
  var buffer = await crypto.subtle.digest('SHA-256', data);
  var hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
}

// Restore unlock state on page load
(function() {
  if (sessionStorage.getItem('detailed_unlocked') === 'true') {
    var btn = document.getElementById('btn-detailed');
    if (btn) {
      btn.innerHTML = '&#128275; Detailed';
      btn.classList.remove('tab-locked');
      btn.classList.add('tab-unlocked');
      btn.onclick = function(e) { switchTab('detailed', e); };
    }
  }
})();

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var modal = document.getElementById('access-modal');
    if (modal && modal.style.display !== 'none') {
      closeModal();
    }
  }
});

// Close modal on overlay click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal();
  }
});


// ===== CONTACT FORM =====
function handleContactForm(e) {
  e.preventDefault();

  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  var name = document.getElementById('cf-name').value.trim();
  var email = document.getElementById('cf-email').value.trim();
  var subject = document.getElementById('cf-subject').value.trim();
  var message = document.getElementById('cf-message').value.trim();

  if (!name || !email || !subject || !message) {
    status.textContent = 'Please fill in all fields.';
    status.className = 'form-status error';
    return false;
  }

  // Using Formspree - replace YOUR_FORM_ID with actual Formspree form ID
  // Sign up free at https://formspree.io and create a form to get the ID
  var FORMSPREE_URL = 'https://formspree.io/f/xzdargzv';

  // For now, show a success message (will work once Formspree is configured)
  var submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  fetch(FORMSPREE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ name: name, email: email, subject: subject, message: message })
  })
  .then(function(response) {
    if (response.ok) {
      status.textContent = 'Message sent! I will get back to you soon.';
      status.className = 'form-status success';
      form.reset();
    } else {
      status.textContent = 'Form service not configured yet. Please try again later.';
      status.className = 'form-status error';
    }
  })
  .catch(function() {
    status.textContent = 'Form service not configured yet. Please try again later.';
    status.className = 'form-status error';
  })
  .finally(function() {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  });

  return false;
}

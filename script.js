/**
 * BSA 2023 - Masterclass Portal Logic
 * Version: 1.2.1 (Cache-Busted)
 */

// 1. GLOBAL ELEMENT SELECTORS (Available to all functions)
const gate = document.getElementById('access-gate');
const appLayout = document.querySelector('.app-layout');

console.log("BSA Portal v5.2 - Masterclass Edition Loaded (JS v1.2.1)");

// 2. FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "PASTE_API_KEY_HERE",
  authDomain: "PASTE_AUTH_DOMAIN_HERE",
  projectId: "PASTE_PROJECT_ID_HERE",
  storageBucket: "PASTE_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_APP_ID_HERE"
};

// Initialize Firebase (if config keys are provided)
if (firebaseConfig.apiKey !== "PASTE_API_KEY_HERE") {
  firebase.initializeApp(firebaseConfig);
} else {
  console.warn("Firebase not configured. Access Gate will remain in Guest mode.");
}

const auth = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth() : null;
const db = (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore() : null;

// 3. NAVIGATION LOGIC
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');

function showSection(targetId) {
  navItems.forEach(b => b.classList.remove('active'));
  contentSections.forEach(s => s.classList.remove('active'));

  const btn = Array.from(navItems).find(i => i.getAttribute('data-target') === targetId);
  const targetSection = document.getElementById(targetId);

  if (btn) btn.classList.add('active');
  if (targetSection) {
    targetSection.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Render Mermaid only when visible & not already rendered
    if (window.mermaidAPI && !targetSection.hasAttribute('data-rendered')) {
      const diagrams = targetSection.querySelectorAll('.mermaid');
      if (diagrams.length > 0) {
        window.mermaidAPI.run({ nodes: diagrams })
          .then(() => targetSection.setAttribute('data-rendered', 'true'))
          .catch(err => console.error('Mermaid Error:', err));
      }
    }
  }
}

// Global Nav Listeners
navItems.forEach(btn => {
  btn.addEventListener('click', () => showSection(btn.getAttribute('data-target')));
});

// Mobile Menu
const hamburger = document.getElementById('hamburger');
const overlay = document.getElementById('sidebar-overlay');
const sidebar = document.querySelector('.sidebar');

function toggleMenu() {
  if (hamburger) hamburger.classList.toggle('active');
  if (sidebar) sidebar.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');
}

if (hamburger) hamburger.addEventListener('click', toggleMenu);
if (overlay) overlay.addEventListener('click', toggleMenu);

// 4. ACCESS GATE & AUTH LOGIC
window.closePolicy = function() {
  const modal = document.getElementById('policy-modal');
  if (modal) modal.style.display = 'none';
};
window.openPolicy = function() {
  const modal = document.getElementById('policy-modal');
  if (modal) modal.style.display = 'flex';
};

window.attemptGuestAccess = function() {
  console.log("Attempting Guest Access...");
  if (gate) gate.style.display = 'none';
  if (appLayout) appLayout.style.display = 'flex';
  showSection('part1');
};

window.attemptLogin = function() {
  console.log("Login button clicked.");
  const emailField = document.getElementById('g-user');
  const passField = document.getElementById('g-pass');
  const err = document.getElementById('login-err');
  
  if (!emailField || !passField || !err) {
    console.error("Login fields not found in DOM.");
    return;
  }

  const email = emailField.value.trim();
  const pass = passField.value;

  if (!email || !pass) {
    err.textContent = "Please fill in all fields.";
    err.classList.remove('hidden');
    return;
  }

  if (!auth) {
    console.warn("Auth not initialized. Bypassing gate...");
    window.attemptGuestAccess();
    return;
  }

  auth.signInWithEmailAndPassword(email, pass)
    .then(res => {
      handleAuthSuccess(res.user);
    })
    .catch(e => {
      let msg = e.message;
      if (e.code === 'auth/user-not-found') msg = "No user found with this email.";
      if (e.code === 'auth/wrong-password') msg = "Incorrect password.";
      err.textContent = msg;
      err.classList.remove('hidden');
      
      const card = document.querySelector('.gate-card');
      if (card) {
        card.style.animation = 'none';
        void card.offsetWidth; 
        card.style.animation = 'shake 0.4s ease';
      }
    });
};

function handleAuthSuccess(user) {
  if (gate) gate.style.display = 'none';
  if (appLayout) appLayout.style.display = 'flex';
  showSection('part1');
  checkAdmin(user.email);
}

window.forgotPassword = function() {
  const emailVal = document.getElementById('g-user')?.value.trim();
  if (!emailVal) {
    alert("Please enter your email address in the Sign In field first.");
    return;
  }
  if (!auth) {
    alert("Firebase not configured. Password reset is only available on the live site.");
    return;
  }
  auth.sendPasswordResetEmail(emailVal)
    .then(() => alert("Password reset link sent to " + emailVal))
    .catch(e => alert("Error: " + e.message));
};

window.submitRegistration = function() {
  const email = document.getElementById('r-email')?.value;
  const pass = document.getElementById('r-password')?.value;
  const name = document.getElementById('r-name')?.value;
  const profession = document.getElementById('r-profession')?.value;
  const err = document.getElementById('reg-error');
  const succ = document.getElementById('reg-success');

  if (!auth || !db) {
     alert("Firebase not configured properly. Registration is only available on the live site.");
     return;
  }

  auth.createUserWithEmailAndPassword(email, pass)
    .then(res => {
      return db.collection('users').doc(res.user.uid).set({
        name, email, profession, registeredAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      if (succ) {
        succ.textContent = "Account created! Please check your email for verification.";
        succ.classList.remove('hidden');
      }
      if (err) err.classList.add('hidden');
    })
    .catch(e => {
      if (err) {
        err.textContent = e.message;
        err.classList.remove('hidden');
      }
      if (succ) succ.classList.add('hidden');
    });
};

function checkAdmin(email) {
  const adminEmails = ['leelakrishna117@gmail.com', 'admin@bsa-guide.com'];
  if (adminEmails.includes(email.toLowerCase())) {
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav && !document.getElementById('admin-btn')) {
      const admDiv = document.createElement('div');
      admDiv.className = 'nav-section';
      admDiv.innerHTML = `<p class="nav-section-title">Administration</p>
                         <button class="nav-item" id="admin-btn" onclick="openAdmin()">Admin Dashboard</button>`;
      sidebarNav.appendChild(admDiv);
      // Re-bind listener for the new button
      const newBtn = document.getElementById('admin-btn');
      newBtn.addEventListener('click', () => showSection(newBtn.getAttribute('data-target')));
    }
  }
}

window.openAdmin = function() {
  const panel = document.getElementById('admin-panel');
  if (panel) panel.style.display = 'flex';
};
window.closeAdminPanel = function() {
  const panel = document.getElementById('admin-panel');
  if (panel) panel.style.display = 'none';
};

// 5. ACCORDIONS
document.querySelectorAll('.accordion-item').forEach(item => {
  const head = item.querySelector('.accordion-head');
  if (head) {
    head.addEventListener('click', () => {
      item.classList.toggle('open');
      const span = head.querySelector('span');
      if (span) span.textContent = item.classList.contains('open') ? '−' : '+';
    });
  }
});

// 6. QUIZ LOGIC
const questions = [
  { q: "1. Section 4: A digital log (GPS ping) is Res Gestae if:", o: ["Recorded 24h later", "Spontaneous and contemporaneous part of transaction", "Manual third party entry", "Deleted partition"], a: 1, k: "Res Gestae in the digital era refers to microsecond logs mapped to the core criminal event." },
  { q: "2. Section 6: Subsequent Conduct includes:", o: ["Backup", "OS update", "Immediate Factory Reset", "Charging"], a: 2, k: "Wiping data post-crime is a 'Digital flight from the scene' proving a guilty mind." },
  { q: "3. Section 9: Effective for establishing:", o: ["Price of phone", "Digital Alibi (Location proved else where)", "Battery health", "App version"], a: 1, k: "Digital Alibis use metadata to make presence at the scene 'Highly Improbable'." },
  { q: "4. Section 57, Expl 4: If file is synced on Phone + Cloud:", o: ["Only phone is primary", "Only cloud is primary", "Both manifestations are Primary Evidence", "Both secondary"], a: 2 },
  { q: "5. Section 63: A certificate is mandatory for:", o: ["Weapons", "All computer outputs (CDs/Printouts)", "Oral confession", "Witness observation"], a: 1 },
  { q: "6. Section 63: Mandatory technical element for integrity:", o: ["Price", "Hash Value (SHA-256)", "Color", "SIM number"], a: 1 },
  { q: "7. Section 93: Reducing paper antiquity (30y) for digital to:", o: ["10 years", "5 years", "2 years", "15 years"], a: 1 },
  { q: "8. Section 86: Court 'Shall Presume' non-alteration of:", o: ["Blogs", "Secure Electronic Records (Hashed/Encrypted)", "Word Docs", "Old files"], a: 1 }
];

let qIdx = 0, score = 0;
const qContainer = document.getElementById('quiz-container');
const resPanel = document.getElementById('quiz-result');
const scoreDisp = document.getElementById('score-display');
const scoreMsg = document.getElementById('score-message');
const restartBtn = document.getElementById('restart-btn');

function renderQ() {
  if (!qContainer) return;
  qContainer.innerHTML = '';
  const item = questions[qIdx];
  const qDiv = document.createElement('div');
  qDiv.className = 'question-block';
  qDiv.innerHTML = `<p class="question-text">${item.q}</p>
                    <div class="options-grid">
                      ${item.o.map((o, i) => `<button class="option-btn" onclick="checkAns(${i})">${o}</button>`).join('')}
                    </div>`;
  qContainer.appendChild(qDiv);
}

window.checkAns = function(idx) {
  const btns = qContainer.querySelectorAll('.option-btn');
  const correct = questions[qIdx].a;
  btns.forEach((b, i) => {
    b.disabled = true;
    if (i === correct) b.classList.add('correct');
    else if (i === idx) b.classList.add('incorrect');
  });

  if (idx === correct) score++;
  
  const nextBtn = document.createElement('button');
  nextBtn.className = 'action-btn';
  nextBtn.style.marginTop = '20px';
  nextBtn.textContent = qIdx < questions.length - 1 ? "Next Question" : "Finish Quiz";
  nextBtn.onclick = () => {
    if (qIdx < questions.length - 1) {
      qIdx++;
      renderQ();
    } else {
      showResult();
    }
  };
  qContainer.appendChild(nextBtn);
};

function showResult() {
  if (qContainer) qContainer.classList.add('hidden');
  if (resPanel) resPanel.classList.remove('hidden');
  if (scoreDisp) scoreDisp.textContent = `${score} / ${questions.length}`;
  if (scoreMsg) {
    if (score === questions.length) scoreMsg.textContent = "Perfect! You are a BSA Expert.";
    else if (score > questions.length / 2) scoreMsg.textContent = "Great job! You have a solid grasp.";
    else scoreMsg.textContent = "Keep studying. Digital law is complex!";
  }
}

if (restartBtn) {
  restartBtn.onclick = () => {
    qIdx = 0; score = 0;
    if (resPanel) resPanel.classList.add('hidden');
    if (qContainer) qContainer.classList.remove('hidden');
    renderQ();
  };
}

// Initial Quiz Render
renderQ();
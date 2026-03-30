/**
 * BSA 2023 - Masterclass Portal Logic
 * Version: 1.2.3 (Direct Access - No Gate)
 */

console.log("BSA Portal v1.2.3 - Direct Access Mode Active");

// 1. GLOBAL ELEMENT SELECTORS
const appLayout = document.querySelector('.app-layout');

// 2. NAVIGATION & UI LOGIC
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

navItems.forEach(btn => btn.addEventListener('click', () => showSection(btn.getAttribute('data-target'))));

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

// 3. ACCORDIONS
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

// 4. QUIZ LOGIC
const questions = [
  { q: "1. Section 4: A digital log (GPS ping) is Res Gestae if:", o: ["Recorded 24h later", "Spontaneous and contemporaneous part of transaction", "Manual third party entry", "Deleted partition"], a: 1 },
  { q: "2. Section 6: Subsequent Conduct includes:", o: ["Backup", "OS update", "Immediate Factory Reset", "Charging"], a: 2 },
  { q: "3. Section 9: Effective for establishing:", o: ["Price of phone", "Digital Alibi (Location proved else where)", "Battery health", "App version"], a: 1 },
  { q: "4. Section 57, Expl 4: If file is synced on Phone + Cloud:", o: ["Only phone is primary", "Only cloud is primary", "Both manifestations are Primary Evidence", "Both secondary"], a: 2 },
  { q: "5. Section 63: A certificate is mandatory for:", o: ["Weapons", "All computer outputs (CDs/Printouts)", "Oral confession", "Witness observation"], a: 1 },
  { q: "6. Section 63: Mandatory technical element for integrity:", o: ["Price", "Hash Value (SHA-256)", "Color", "SIM number"], a: 1 },
  { q: "7. Section 93: Reducing paper antiquity (30y) for digital to:", o: ["10 years", "5 years", "2 years", "15 years"], a: 1 },
  { q: "8. Section 86: Court 'Shall Presume' non-alteration of:", o: ["Blogs", "Secure Electronic Records (Hashed/Encrypted)", "Word Docs", "Old files"], a: 1 }
];

let qIdx = 0, score = 0;
const qContainer = document.getElementById('quiz-container');

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
  const resPanel = document.getElementById('quiz-result');
  if (qContainer) qContainer.classList.add('hidden');
  if (resPanel) {
    resPanel.classList.remove('hidden');
    document.getElementById('score-display').textContent = `${score} / ${questions.length}`;
  }
}

// Initial Run
renderQ();
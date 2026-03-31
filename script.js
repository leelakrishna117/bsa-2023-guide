/**
 * BSA 2023 - Masterclass Portal Logic
 * Version: 1.2.3 (Direct Access - No Gate)
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log("BSA Portal v1.2.3 - Direct Access Mode Active");

  // 1. GLOBAL ELEMENT SELECTORS
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

      // Handle Mermaid lazy rendering
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
    if (hamburger) hamburger.classList.toggle('open');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
  }

  if (hamburger) hamburger.addEventListener('click', toggleMenu);
  if (overlay) overlay.addEventListener('click', toggleMenu);

  // Close sidebar when clicking nav item on mobile
  navItems.forEach(btn => btn.addEventListener('click', () => {
    if (window.innerWidth <= 1100) toggleMenu();
  }));

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

  // 4. MEGA QUIZ LOGIC (20 QUESTIONS)
  const questions = [
    { q: "1. Section 4: A digital log (GPS ping) is Res Gestae if:", o: ["Recorded 24h later", "Spontaneous and contemporaneous part of transaction", "Manual third party entry", "Deleted partition"], a: 1 },
    { q: "2. Section 6: Subsequent Conduct includes:", o: ["Backup", "OS update", "Immediate Factory Reset", "Charging"], a: 2 },
    { q: "3. Section 9: Effective for establishing:", o: ["Price of phone", "Digital Alibi (Location proved else where)", "Battery health", "App version"], a: 1 },
    { q: "4. Section 57, Expl 4: If file is synced on Phone + Cloud:", o: ["Only phone is primary", "Only cloud is primary", "Both manifestations are Primary Evidence", "Both secondary"], a: 2 },
    { q: "5. Section 63: A certificate is mandatory for:", o: ["Weapons", "All computer outputs (CDs/Printouts)", "Oral confession", "Witness observation"], a: 1 },
    { q: "6. Section 63: Mandatory technical element for integrity:", o: ["Price", "Hash Value (SHA-256)", "Color", "SIM number"], a: 1 },
    { q: "7. Section 93: Reducing paper antiquity (30y) for digital to:", o: ["10 years", "5 years", "2 years", "15 years"], a: 1 },
    { q: "8. Section 86: Court 'Shall Presume' non-alteration of:", o: ["Blogs", "Secure Electronic Records (Hashed/Encrypted)", "Word Docs", "Old files"], a: 1 },
    { q: "9. Section 2(1)(d): Defining 'Documents' to include:", o: ["Only paper", "Electronic records and inscriptions", "Only stone carvings", "Only digital files"], a: 1 },
    { q: "10. Section 39: The 'Examiner of Electronic Evidence' is notified under:", o: ["Evidence Act Sec 1", "IT Act Section 79A", "IP Code Sec 420", "CrPC Sec 154"], a: 1 },
    { q: "11. Section 63: Who must sign 'Part B' of the certificate?", o: ["The Judge", "The Accused", "The Technical Expert/Officer in-charge", "A random witness"], a: 2 },
    { q: "12. Section 52: The Court can verify digital signatures by:", o: ["Handwriting expert only", "Visual comparison", "Comparing with admitted digital markers", "Asking the user's password"], a: 2 },
    { q: "13. Section 85: Digital signatures on agreements trigger:", o: ["Shall Presume intent", "May Presume forgery", "No presumption", "Need 2 witnesses"], a: 0 },
    { q: "14. Section 90: Presumption of email delivery applies to:", o: ["Authorship", "Content truth", "System reception in same form", "All of above"], a: 2 },
    { q: "15. Section 61: Primary evidence of a digital record is:", o: ["A printout", "A verbal description", "The data itself as stored in semiconductor memory", "A photocopy of the device"], a: 2 },
    { q: "16. Section 5: The ultimate test for evidence remains:", o: ["Relevancy", "Method of capture", "File size", "Device brand"], a: 0 },
    { q: "17. Section 8: In digital groups, statements are relevant based on:", o: ["Number of members", "Common Intention", "Admin name", "Time of post"], a: 1 },
    { q: "18. Section 63: 'Part A' of the certificate covers:", o: ["Hash values", "Verification of device ownership", "Ownership/Control of the computer", "Encryption keys"], a: 2 },
    { q: "19. Section 82: Official Gazette in electronic form is:", o: ["Shall be presumed genuine", "Requires secondary proof", "Is inadmissible", "Needs physical seal"], a: 0 },
    { q: "20. The 5-Year Rule (Section 93) requires:", o: ["High speed internet", "Proper Custody", "Only 1 year wait", "Cloud backup"], a: 1 }
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
      
      const restartBtn = document.getElementById('restart-btn');
      if (restartBtn) {
        restartBtn.onclick = () => {
          qIdx = 0; score = 0;
          resPanel.classList.add('hidden');
          qContainer.classList.remove('hidden');
          renderQ();
        };
      }
    }
  }

  // Initial Run
  renderQ();
});
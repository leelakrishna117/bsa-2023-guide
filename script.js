/**
 * BSA 2023 - Masterclass Portal Logic
 * Version: 1.2.4 (Ultra-Compatibility Mode)
 */

(function() {
  function init() {
    console.log("BSA Portal v1.2.4 - Initializing...");

    // 1. GLOBAL ELEMENT SELECTORS
    var navItems = document.querySelectorAll('.nav-item');
    var contentSections = document.querySelectorAll('.content-section');

    function showSection(targetId) {
      console.log("Switching to section:", targetId);
      for (var i = 0; i < navItems.length; i++) {
        navItems[i].classList.remove('active');
      }
      for (var j = 0; j < contentSections.length; j++) {
        contentSections[j].classList.remove('active');
      }

      var btn = null;
      for (var k = 0; k < navItems.length; k++) {
        if (navItems[k].getAttribute('data-target') === targetId) {
          btn = navItems[k];
          break;
        }
      }
      var targetSection = document.getElementById(targetId);

      if (btn) btn.classList.add('active');
      if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Handle Mermaid lazy rendering
        if (window.mermaidAPI && !targetSection.hasAttribute('data-rendered')) {
          var diagrams = targetSection.querySelectorAll('.mermaid');
          if (diagrams.length > 0) {
            window.mermaidAPI.run({ nodes: diagrams })
              .then(function() { targetSection.setAttribute('data-rendered', 'true'); })
              .catch(function(err) { console.error('Mermaid Error:', err); });
          }
        }
      }
    }

    for (var l = 0; l < navItems.length; l++) {
      (function(idx) {
        navItems[idx].addEventListener('click', function() {
          showSection(navItems[idx].getAttribute('data-target'));
        });
      })(l);
    }

    // Mobile Menu
    var hamburger = document.getElementById('hamburger');
    var overlay = document.getElementById('sidebar-overlay');
    var sidebar = document.querySelector('.sidebar');

    function toggleMenu() {
      console.log("Toggling mobile menu");
      if (hamburger) hamburger.classList.toggle('open');
      if (sidebar) sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
    }

    if (hamburger) hamburger.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);

    // Close sidebar when clicking nav item on mobile
    for (var m = 0; m < navItems.length; m++) {
      navItems[m].addEventListener('click', function() {
        if (window.innerWidth <= 1100 && sidebar && sidebar.classList.contains('open')) {
          toggleMenu();
        }
      });
    }

    // 3. ACCORDIONS - Strengthening the logic
    console.log("Attaching accordion listeners...");
    var accItems = document.querySelectorAll('.accordion-item');
    for (var n = 0; n < accItems.length; n++) {
      (function(item) {
        var head = item.querySelector('.accordion-head');
        if (head) {
          head.addEventListener('click', function(e) {
            console.log("Accordion clicked:", head.innerText);
            item.classList.toggle('open');
            var span = head.querySelector('span');
            if (span) {
              span.textContent = item.classList.contains('open') ? '−' : '+';
            }
          });
        }
      })(accItems[n]);
    }

    // 4. MEGA QUIZ LOGIC
    var questions = [
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

    var qIdx = 0, score = 0;
    var qContainer = document.getElementById('quiz-container');

    function renderQ() {
      if (!qContainer) return;
      qContainer.innerHTML = '';
      var item = questions[qIdx];
      var qDiv = document.createElement('div');
      qDiv.className = 'question-block';
      qDiv.innerHTML = '<p class="question-text">' + item.q + '</p>' +
                        '<div class="options-grid">' +
                          item.o.map(function(opt, i) { 
                            return '<button class="option-btn" onclick="checkAns(' + i + ')">' + opt + '</button>'; 
                          }).join('') +
                        '</div>';
      qContainer.appendChild(qDiv);
    }

    window.checkAns = function(idx) {
      var btns = qContainer.querySelectorAll('.option-btn');
      var correct = questions[qIdx].a;
      for (var i = 0; i < btns.length; i++) {
        btns[i].disabled = true;
        if (i === correct) btns[i].classList.add('correct');
        else if (i === idx) btns[i].classList.add('incorrect');
      }

      if (idx === correct) score++;
      
      var nextBtn = document.createElement('button');
      nextBtn.className = 'action-btn';
      nextBtn.style.marginTop = '20px';
      nextBtn.textContent = qIdx < questions.length - 1 ? "Next Question" : "Finish Quiz";
      nextBtn.onclick = function() {
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
      var resPanel = document.getElementById('quiz-result');
      if (qContainer) qContainer.classList.add('hidden');
      if (resPanel) {
        resPanel.classList.remove('hidden');
        document.getElementById('score-display').textContent = score + ' / ' + questions.length;
        
        var restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
          restartBtn.onclick = function() {
            qIdx = 0; score = 0;
            resPanel.classList.add('hidden');
            qContainer.classList.remove('hidden');
            renderQ();
          };
        }
      }
    }

    renderQ();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
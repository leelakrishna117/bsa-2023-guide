document.addEventListener('DOMContentLoaded', () => {

  // --- SIDEBAR NAVIGATION ---
  const navItems = document.querySelectorAll('.nav-item');
  const contentSections = document.querySelectorAll('.content-section');

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all nav items
      navItems.forEach(b => b.classList.remove('active'));
      // Hide all content sections
      contentSections.forEach(s => s.classList.remove('active'));

      // Add active state to clicked btn and corresponding section
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Dynamically render mermaid charts ONLY when their tab becomes visible (fixes 0px width bug)
        if (window.mermaidAPI && !targetSection.hasAttribute('data-rendered')) {
          const diagrams = targetSection.querySelectorAll('.mermaid');
          if (diagrams.length > 0) {
            window.mermaidAPI.run({ nodes: diagrams }).catch(err => console.error('Mermaid render error:', err));
            targetSection.setAttribute('data-rendered', 'true');
          }
        }
      }
    });
  });

  // --- ACCORDIONS ---
  const accordions = document.querySelectorAll('.accordion-item');
  accordions.forEach(item => {
    const head = item.querySelector('.accordion-head');
    head.addEventListener('click', () => {
      item.classList.toggle('open');
      const span = head.querySelector('span');
      if(item.classList.contains('open')) {
        span.textContent = '−';
      } else {
        span.textContent = '+';
      }
    });
  });

  // --- MEGA QUIZ LOGIC (40 QUESTIONS) ---
  const questions = [
    { q: "1. Under Section 4 of the BSA, a digital log (like a GPS ping) is relevant as Res Gestae if:", o: ["It was recorded 24 hours after the event.", "It was a spontaneous and contemporaneous part of the same transaction.", "It was manually entered by a third party.", "It was found on a deleted partition."], a: 1, k: "Res Gestae requires the digital fact to be so connected to the transaction that they form part of the same event. Spontaneity is the test for digital logs." },
    { q: "2. Which digital act constitutes 'Subsequent Conduct' under Section 6?", o: ["Routine cloud backup.", "Updating the OS.", "Factory resetting a device immediately after a crime.", "Charging the device."], a: 2, k: "Conduct that shows a 'guilty mind,' such as destroying digital evidence, is highly relevant to show the accused's reaction to the crime." },
    { q: "3. Section 9 of the BSA is most effectively used in the digital realm for:", o: ["Proving the price of the phone.", "Establishing a digital alibi (e.g., location logs proving presence elsewhere).", "Checking battery health.", "Verifying the app version."], a: 1, k: "Section 9 deals with facts that make the existence of a fact in issue 'highly probable or improbable.' Digital alibis make the prosecution's theory 'improbable.'" },
    { q: "4. A WhatsApp group name like 'The Breach Team' is relevant under which section regarding common intention?", o: ["Section 57", "Section 8", "Section 93", "Section 2"], a: 1, k: "Section 8 covers things said or done by a conspirator in reference to a common design. The group name and admin actions fall here." },
    { q: "5. If an accused is found searching for 'how to hide a body' on Google, this is relevant under Section 6 as:", o: ["Motive.", "Preparation.", "Res Gestae.", "Opportunity."], a: 1, k: "Search history often constitutes 'Preparation' for a crime, showing the mental state prior to the act." },
    { q: "6. According to Section 57, Explanation 4, if a file is stored simultaneously on a phone and a Cloud server:", o: ["Only the phone version is primary.", "Only the Cloud version is primary.", "Both manifestations are primary evidence.", "Both are secondary."], a: 2, k: "The BSA recognizes that in a synced ecosystem, each bit-for-bit identical version is an original 'manifestation.'" },
    { q: "7. A Facebook Live video stored and transmitted simultaneously is considered:", o: ["Primary Evidence under Section 57, Expl. 5.", "Secondary Evidence under Section 58.", "Hearsay.", "Oral Evidence."], a: 0, k: "The law treats simultaneous storage and transmission as an original record of the event." },
    { q: "8. Which of the following is considered Secondary Digital Evidence?", o: ["The original server HDD.", "A screenshot of a WhatsApp chat.", "A synced iCloud note.", "The original DVR unit."], a: 1, k: "A screenshot is an 'output' or a photo of the original display, making it a derivative (secondary) copy." },
    { q: "9. The 'Common Process' rule in Section 57, Expl. 4 applies to:", o: ["Handwritten letters.", "Automated system-generated confirmation emails.", "A witness's memory.", "A physical sculpture."], a: 1, k: "If many documents are made by one uniform process (like a server bot), each is primary evidence of the rest." },
    { q: "10. To admit Secondary Digital Evidence, the 'Gateway' conditions are found in:", o: ["Section 4", "Section 60", "Section 82", "Section 93"], a: 1, k: "Section 60 outlines when secondary evidence can be given (e.g., original is with the opponent or destroyed)." },
    { q: "11. A Section 63 certificate is mandatory for:", o: ["Only physical weapons.", "All computer outputs (printouts, CDs, pen drive copies).", "Oral confessions.", "Witness observation."], a: 1, k: "Any data that is not the original device itself requires a certificate to vouch for its integrity." },
    { q: "12. Who must sign the Section 63(4) certificate under the BSA 2023?", o: ["Only the Investigating Officer.", "The Person in charge of the device AND an Expert.", "Only the Accused.", "A Notary Public."], a: 1, k: "The BSA mandates a dual-signature (Manager + Expert) to ensure technical accountability." },
    { q: "13. What technical element is mandatory in a Section 63 certificate to prove non-tampering?", o: ["The price of the data.", "The Hash Value (e.g., SHA-256).", "The color of the phone.", "The SIM card number."], a: 1, k: "The 'Hash' is the digital fingerprint. If the hash matches, the integrity is proven." },
    { q: "14. Producing the original smartphone in court for inspection (without printouts) makes it:", o: ["Primary Evidence.", "Secondary Evidence.", "Oral Evidence.", "Hearsay."], a: 0, k: "Producing the 'document itself' (the device) for inspection satisfies the definition of primary evidence." },
    { q: "15. If a Section 63 certificate is missing the Expert's signature, the evidence is:", o: ["Still admissible.", "Procedurally defective and likely inadmissible.", "Treated as oral evidence.", "Automatically verified by the Judge."], a: 1, k: "The 'Expert' requirement in the Schedule is a mandatory statutory gateway." },
    { q: "16. Under Section 86, the Court 'shall presume' a Secure Electronic Record hasn't been altered if:", o: ["The owner says so.", "A prescribed security procedure (like encryption/hashing) was applied.", "It is a printed copy.", "It is more than 1 year old."], a: 1, k: "'Secure status' shifts the burden of proof to the opponent to prove alteration." },
    { q: "17. Section 85 mandates the Court to presume a digital agreement was concluded if:", o: ["The parties met for coffee.", "Their digital signatures are affixed.", "They talked on the phone.", "They exchanged business cards."], a: 1, k: "Digital signatures are the legal equivalent of signing a physical contract under the BSA." },
    { q: "18. The 'Email Transmission' presumption under Section 90 covers:", o: ["The identity of the sender.", "That the message reached the addressee as fed into the computer.", "The truth of the contents.", "The mental state of the sender."], a: 1, k: "Section 90 presumes 'delivery/integrity of the pipe,' not the 'authorship.'" },
    { q: "19. The 30-year rule for paper is reduced for electronic records in Section 93 to:", o: ["10 years.", "5 years.", "2 years.", "15 years."], a: 1, k: "Accelerated Authenticity recognizes that digital formats evolve much faster than paper." },
    { q: "20. To trigger the Section 93 presumption, the 5-year-old record must be from:", o: ["A random folder.", "Proper Custody (natural and legitimate place).", "An unsealed CD.", "A stranger's laptop."], a: 1, k: "Proper custody is the 'anchor' that makes the presumption of genuineness valid." },
    { q: "21. Under Section 82, the Court 'shall presume' the genuineness of:", o: ["Private blogs.", "Electronic Gazettes (official government notifications).", "Wikipedia.", "News websites."], a: 1, k: "Official digital publications are self-authenticating." },
    { q: "22. Section 83 creates a presumption of accuracy for digital maps/plans made by:", o: ["A local architect.", "Government authority (Central or State).", "A private tracking app.", "A tourist guide."], a: 1, k: "Official digital surveys are presumed accurate to save court time." },
    { q: "23. Section 77 allows the Court to presume that a 'Digital Certified Copy' of a public record is:", o: ["Secondary evidence.", "Genuine.", "Hearsay.", "Invalid."], a: 1, k: "If a government portal issues a digitally signed PDF, it carries the weight of the original." },
    { q: "24. The presumption of 'Digital Signatures' under Section 85 does NOT include:", o: ["Presumption of ownership of the signature.", "Presumption that the contents of the file are 100% true.", "Presumption of the agreement's conclusion.", "Identification of the signer."], a: 1, k: "Presumptions usually cover 'execution' (who signed), not 'veracity' (the truth of the story)." },
    { q: "25. If a record is NOT 'Secure' under Section 86, the Court:", o: ["Must still presume integrity.", "Does not apply the presumption of non-alteration.", "Must delete the record.", "Must arrest the owner."], a: 1, k: "Only 'Secure' records get the statutory shortcut of presumed non-alteration." },
    { q: "26. Section 39(2) makes the opinion of which person a 'Relevant Fact'?", o: ["A local IT teacher.", "The Examiner of Electronic Evidence (Sec 79A IT Act).", "A social media manager.", "The device manufacturer."], a: 1, k: "The BSA relies on a specific statutory authority for forensic opinions." },
    { q: "27. To prove a video is a 'Deepfake,' the Court relies on an expert under:", o: ["Section 4", "Section 39", "Section 93", "Section 82"], a: 1, k: "Section 39 bridges the gap between the Judge and specialized cyber-forensics." },
    { q: "28. Section 73 authorizes the Court to direct a Certifying Authority to produce:", o: ["Personal photos.", "The Digital Signature Certificate (DSC).", "Browsing history.", "Bank balance."], a: 1, k: "This allows the court to verify if a specific signature was officially issued to the accused." },
    { q: "29. Section 52 allows the Court to identify a person by:", o: ["Comparing digital signatures or fingerprints.", "Guessing.", "Asking the neighbors.", "Checking their height."], a: 0, k: "Automated/Biometric comparison is a valid method of proof under the BSA." },
    { q: "30. An Expert's opinion under Section 39 is considered:", o: ["Conclusive proof.", "A Relevant Fact (Advisory in nature but technically strong).", "Hearsay.", "Binding on the Judge."], a: 1, k: "Expert opinions guide the court but are still subject to judicial scrutiny." },
    { q: "31. The Arjun Panditrao Khotkar (2020) ruling (now codified) says a certificate is NOT needed if:", o: ["The device is broken.", "The original device is produced (Primary Evidence).", "The accused confesses.", "The video is very clear."], a: 1, k: "Section 57 (Primary) bypasses the need for the Section 63 certificate." },
    { q: "32. The Anvar P.V. v. P.K. Basheer case established that Section 65B (now Sec 63) is:", o: ["Optional.", "A 'Complete Code' for electronic evidence.", "Only for civil cases.", "Invalid."], a: 1, k: "You cannot use general rules of evidence to bypass the specific digital certificate requirement." },
    { q: "33. The Tomaso Bruno case deals with 'Adverse Inference,' meaning:", o: ["If you hide digital evidence, the court presumes it was against you.", "Digital evidence is always bad.", "Computers are unreliable.", "Printouts are always primary."], a: 0, k: "Withholding the 'best evidence' (digital logs) allows the court to presume a guilty intent." },
    { q: "34. Ritesh Sinha v. State of U.P. allows the Court to compel an accused to provide:", o: ["Their bank password.", "Voice samples or biometrics for comparison.", "Their physical house keys.", "Their childhood photos."], a: 1, k: "This logic is codified in Sections 52 and 73 for digital markers." },
    { q: "35. Lakhi Baruah v. Padma Kanta Kalita teaches us that presumptions (like Sec 93) cover:", o: ["The truth of the story inside.", "The 'Due Execution' (who signed).", "The future value of the file.", "The software's price."], a: 1, k: "The law presumes the 'act of signing,' not the 'accuracy of the statement.'" },
    { q: "36. A 'Write-Blocker' is used by an Expert to ensure:", o: ["The battery doesn't die.", "No data is altered during the extraction process.", "The screen is bright.", "The internet is off."], a: 1, k: "This is a vital part of proving 'Integrity' for the Section 63 certificate." },
    { q: "37. If an Expert says 'the system was operating properly,' they are satisfying:", o: ["Section 63 requirements.", "Section 4 requirements.", "Section 93 requirements.", "Section 2 requirements."], a: 0, k: "Evidence of a healthy system is mandatory for digital admissibility." },
    { q: "38. The phrase 'Lex non cogit ad impossibilia' explains why:", o: ["We use 5 years for digital instead of 30.", "We don't need evidence.", "Everyone is guilty.", "Computers are expensive."], a: 0, k: "The law doesn't force you to find 30-year-old hardware that no longer exists." },
    { q: "39. In a Section 63 certificate, the 'Person in Charge' is usually the:", o: ["Judge.", "Device owner or IT manager.", "Defense lawyer.", "Police constable at the station."], a: 1, k: "The person with administrative control over the resource must vouch for it." },
    { q: "40. To win a case with a 5-year-old email, you must prove:", o: ["The brand of the computer.", "Proper Custody (Natural/Legitimate storage).", "That you like the sender.", "That the email was colorful."], a: 1, k: "Section 93 presumptions only 'anchor' to proper custody." }
  ];

  let currentQuestionIndex = 0;
  let score = 0;
  let answered = false;

  const quizContainer = document.getElementById('quiz-container');
  const resultPanel = document.getElementById('quiz-result');
  const scoreDisplay = document.getElementById('score-display');
  const scoreMessage = document.getElementById('score-message');
  const restartBtn = document.getElementById('restart-btn');

  function renderQuestion() {
    if (currentQuestionIndex >= questions.length) {
      showResults();
      return;
    }
    answered = false;
    const q = questions[currentQuestionIndex];
    
    let html = `
      <div class="question-block">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
           <span style="color:var(--primary-color); font-weight:bold;">Question ${currentQuestionIndex + 1} of ${questions.length}</span>
           <span style="background:var(--card-bg); padding:5px 10px; border-radius:20px; font-size:0.9rem; border:1px solid var(--card-border);">Current Score: ${score}</span>
        </div>
        <h3 class="question-text">${q.q}</h3>
        <div class="options-grid" id="options">
    `;

    q.o.forEach((opt, index) => {
      html += `<button class="option-btn" data-index="${index}">${opt}</button>`;
    });

    html += `
        </div>
        <button id="next-btn" class="action-btn" disabled style="margin-top:20px;">Next Question</button>
      </div>
    `;

    if (quizContainer) {
      quizContainer.innerHTML = html;
      const optionBtns = document.querySelectorAll('.option-btn');
      optionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => handleAnswer(e, optionBtns, q.a));
      });

      const nextBtn = document.getElementById('next-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          currentQuestionIndex++;
          renderQuestion();
        });
      }
    }
  }

  function handleAnswer(e, buttons, correctIndex) {
    if (answered) return;
    answered = true;
    const selectedBtn = e.target;
    const selectedIndex = parseInt(selectedBtn.getAttribute('data-index'));

    buttons.forEach((btn, index) => {
      if (index === correctIndex) btn.classList.add('correct');
      else if (index === selectedIndex) btn.classList.add('incorrect');
      btn.style.cursor = 'default';
    });

    if (selectedIndex === correctIndex) score++;
    
    // Key Input logic
    const qInfo = questions[currentQuestionIndex];
    if (qInfo.k) {
       const keyDiv = document.createElement('div');
       keyDiv.style.marginTop = "15px";
       keyDiv.style.padding = "10px";
       keyDiv.style.backgroundColor = "rgba(46,160,67,0.1)";
       keyDiv.style.borderLeft = "4px solid var(--success)";
       keyDiv.style.color = "var(--text-color)";
       keyDiv.style.borderRadius = "4px";
       keyDiv.style.fontSize = "0.95rem";
       keyDiv.style.gridColumn = "span 2";
       keyDiv.style.lineHeight = "1.5";
       keyDiv.innerHTML = "<strong>🎓 Key Input:</strong> " + qInfo.k;
       
       const optionsContainer = document.getElementById('options');
       if (optionsContainer) {
         optionsContainer.appendChild(keyDiv);
       }
    }
    
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.disabled = false;
  }

  function showResults() {
    if (quizContainer) quizContainer.classList.add('hidden');
    if (resultPanel) resultPanel.classList.remove('hidden');
    const percentage = (score / questions.length) * 100;
    if (scoreDisplay) scoreDisplay.innerHTML = score + " / " + questions.length;
    
    if (scoreMessage) {
      if (percentage >= 90) {
        scoreMessage.innerHTML = "Outstanding! You have functionally MASTERED the Bharatiya Sakshya Adhiniyam, 2023.";
        if (scoreDisplay) scoreDisplay.style.color = "var(--success)";
        scoreMessage.innerHTML += "<br><span style='font-size:3rem'>🏆</span>";
      } else if (percentage >= 60) {
        scoreMessage.innerHTML = "Great job! You have a very solid understanding of the new digital and traditional evidence boundaries.";
        if (scoreDisplay) scoreDisplay.style.color = "var(--primary-color)";
      } else {
        scoreMessage.innerHTML = "A good start, but there's more to learn. The BSA brings massive technical changes worth mastering.";
        if (scoreDisplay) scoreDisplay.style.color = "var(--text-color)";
      }
    }
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      currentQuestionIndex = 0;
      score = 0;
      if (resultPanel) resultPanel.classList.add('hidden');
      if (quizContainer) quizContainer.classList.remove('hidden');
      renderQuestion();
    });
  }

  // Init Quiz
  renderQuestion();

});
/**
 * ============================================================================
 * BANK MANAGEMENT SYSTEM (BMS) - MARATHI VOICE ASSISTANT (मराठी व्हॉइस बँकिंग)
 * 
 * Rural & Digital Accessibility Features:
 * 1. Web Speech Recognition supporting Marathi (mr-IN) & English (en-IN)
 * 2. Natural Marathi Text-To-Speech (TTS) voice feedback
 * 3. Quick Action dispatching to BMS Tabs:
 *    - Check Balance ("माझं बॅलन्स किती आहे?")
 *    - Create Account ("नवीन खाते उघडा")
 *    - Deposit / Withdraw ("पैसे जमा करा / काढा")
 *    - Search Account ("खाते शोधा")
 *    - Graphs ("ग्राफिक्स व चार्ट दाखवा")
 * ============================================================================
 */

class MarathiVoiceAssistant {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synth = window.speechSynthesis || null;
    this.audioCtx = null;

    this.initSpeechEngine();
  }

  initSpeechEngine() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'mr-IN'; // Marathi (India)

      this.recognition.onstart = () => {
        this.isListening = true;
        this.playChime('start');
        this.updateModalUI('मी ऐकत आहे... कृपया स्पष्ट बोला', '...');
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const recognized = finalTranscript || interimTranscript;
        this.updateModalUI('मी ऐकले:', `"${recognized}"`);

        if (finalTranscript) {
          setTimeout(() => {
            this.processSpokenCommand(finalTranscript);
          }, 300);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.updateModalUI('आवाज स्पष्ट ऐकू आला नाही', 'कृपया खालील पर्यायांवर क्लिक करा.');
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playChime(type = 'start') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'start') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      // Audio autoplay policy
    }
  }

  speakMarathi(text, onComplete = null) {
    if (!this.synth) return;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'mr-IN';
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    const voices = this.synth.getVoices();
    const mrVoice = voices.find(v => v.lang.includes('mr') || v.lang.includes('Marathi'));
    const hiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('Hindi'));

    if (mrVoice) utterance.voice = mrVoice;
    else if (hiVoice) utterance.voice = hiVoice;

    if (onComplete) utterance.onend = onComplete;
    this.synth.speak(utterance);
  }

  startListening() {
    const modal = document.getElementById('voiceModalBackdrop');
    if (modal) modal.classList.add('active');

    this.updateModalUI('मी ऐकत आहे...', 'कृपया मराठीत बोला...');

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        console.warn('Recognition start exception', e);
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    this.isListening = false;
    const modal = document.getElementById('voiceModalBackdrop');
    if (modal) modal.classList.remove('active');
    if (this.synth) this.synth.cancel();
  }

  updateModalUI(title, text) {
    const titleEl = document.getElementById('voiceModalStatusTitle');
    const textEl = document.getElementById('voiceModalRecognizedText');
    if (titleEl) titleEl.innerText = title;
    if (textEl) textEl.innerText = text;
  }

  handleManualVoiceText(text) {
    this.updateModalUI('प्रक्रिया सुरू आहे...', `"${text}"`);
    setTimeout(() => {
      this.processSpokenCommand(text);
    }, 200);
  }

  processSpokenCommand(commandText) {
    const text = commandText.toLowerCase().trim();
    this.playChime('success');
    const isOfficer = window.appUI && window.appUI.isOfficer();

    // 1. Balance Inquiry (Customer & Officer)
    if (
      text.includes('बॅलन्स') ||
      text.includes('शिल्लक') ||
      text.includes('पैसे किती') ||
      text.includes('balance')
    ) {
      const speech = isOfficer
        ? 'खाते शिल्लक तपासण्याचा स्क्रीन उघडत आहे. कृपया १० अंकी खाते क्रमांक टाका.'
        : 'आपल्या खात्यातील उपलब्ध शिल्लक (Balance) स्क्रीनवर दाखवत आहे.';
      this.updateModalUI('बॅलन्स तपासा', 'स्क्रीन उघडत आहे...');
      this.speakMarathi(speech, () => {
        this.stopListening();
        window.appUI.switchTab('tab-check-balance');
      });
      return;
    }

    // 2. Fund Transfer (Customer)
    if (
      text.includes('पैसे पाठवा') ||
      text.includes('ट्रान्सफर') ||
      text.includes('transfer') ||
      text.includes('upi')
    ) {
      const speech = 'पैसे ट्रान्सफर (UPI) स्क्रीन उघडत आहे.';
      this.updateModalUI('पैसे ट्रान्सफर', 'स्क्रीन उघडत आहे...');
      this.speakMarathi(speech, () => {
        this.stopListening();
        window.appUI.switchTab('tab-transfer');
      });
      return;
    }

    // 3. Profile & Account Details (Customer)
    if (
      text.includes('प्रोफाईल') ||
      text.includes('माहिती') ||
      text.includes('profile') ||
      text.includes('खाते माहिती')
    ) {
      const speech = 'आपली बँक खाते माहिती व प्रोफाईल उघडत आहे.';
      this.updateModalUI('प्रोफाईल तपशील', 'स्क्रीन उघडत आहे...');
      this.speakMarathi(speech, () => {
        this.stopListening();
        window.appUI.switchTab('tab-profile');
      });
      return;
    }

    // 4. Passbook & History
    if (
      text.includes('पासबुक') ||
      text.includes('इतिहास') ||
      text.includes('व्यवहार') ||
      text.includes('history') ||
      text.includes('passbook')
    ) {
      const speech = 'व्यवहार इतिहास आणि ई-पासबुक उघडत आहे.';
      this.updateModalUI('पासबुक / इतिहास', 'स्क्रीन उघडत आहे...');
      this.speakMarathi(speech, () => {
        this.stopListening();
        window.appUI.switchTab('tab-history');
      });
      return;
    }

    // 5. Complaints & Helpdesk
    if (
      text.includes('तक्रार') ||
      text.includes('मदत') ||
      text.includes('complaint') ||
      text.includes('help')
    ) {
      const speech = 'तक्रार निवारण व हेल्पडेस्क स्क्रीन उघडत आहे.';
      this.updateModalUI('तक्रार निवारण', 'स्क्रीन उघडत आहे...');
      this.speakMarathi(speech, () => {
        this.stopListening();
        window.appUI.switchTab('tab-complaints');
      });
      return;
    }

    // 6. Create Account (Officer only; for customer, give guidance)
    if (
      text.includes('नवीन खाते') ||
      text.includes('खाते उघडा') ||
      text.includes('खाते तयार') ||
      text.includes('create account')
    ) {
      if (isOfficer) {
        const speech = 'नवीन ग्राहक खाते तयार करण्याचा फॉर्म उघडत आहे.';
        this.updateModalUI('नवीन खाते', 'फॉर्म उघडत आहे...');
        this.speakMarathi(speech, () => {
          this.stopListening();
          window.appUI.switchTab('tab-create-account');
        });
      } else {
        const speech = 'नवीन खाते बँक अधिकारी स्तरावर उघडले जाते. अधिक माहितीसाठी हेल्पडेस्क उघडत आहे.';
        this.updateModalUI('नवीन खाते सूचना', 'हेल्पडेस्क उघडत आहे...');
        this.speakMarathi(speech, () => {
          this.stopListening();
          window.appUI.switchTab('tab-complaints');
        });
      }
      return;
    }

    // 7. Deposit / Withdraw (Officer only; for customer, direct to Transfer)
    if (
      text.includes('पैसे जमा') ||
      text.includes('पैसे काढा') ||
      text.includes('डिपॉझिट') ||
      text.includes('विथड्रॉ') ||
      text.includes('deposit') ||
      text.includes('withdraw')
    ) {
      if (isOfficer) {
        const speech = 'डिपॉझिट व विथड्रॉ स्क्रीन उघडत आहे.';
        this.updateModalUI('डिपॉझिट / विथड्रॉ', 'स्क्रीन उघडत आहे...');
        this.speakMarathi(speech, () => {
          this.stopListening();
          window.appUI.switchTab('tab-deposit-withdraw');
        });
      } else {
        const speech = 'रोख रक्कम जमा किंवा काढण्यासाठी बँक शाखेत संपर्क करा. ऑनलाइन पैसे पाठवण्यासाठी UPI ट्रान्सफर उघडत आहे.';
        this.updateModalUI('रोख व्यवहार सूचना', 'UPI ट्रान्सफर उघडत आहे...');
        this.speakMarathi(speech, () => {
          this.stopListening();
          window.appUI.switchTab('tab-transfer');
        });
      }
      return;
    }

    // 8. Search Account (Officer only)
    if (
      text.includes('शोध') ||
      text.includes('search') ||
      text.includes('खाते शोधा')
    ) {
      if (isOfficer) {
        const speech = 'CBS खाते शोधक स्क्रीन उघडत आहे.';
        this.updateModalUI('खाते शोधा', 'स्क्रीन उघडत आहे...');
        this.speakMarathi(speech, () => {
          this.stopListening();
          window.appUI.switchTab('tab-search-account');
        });
      } else {
        const speech = 'आपली खात्याची माहिती स्क्रीनवर उघडत आहे.';
        this.updateModalUI('खाते माहिती', 'स्क्रीन उघडत आहे...');
        this.speakMarathi(speech, () => {
          this.stopListening();
          window.appUI.switchTab('tab-profile');
        });
      }
      return;
    }

    // 9. Graphs / Charts (Officer only)
    if (
      text.includes('ग्राफ') ||
      text.includes('चार्ट') ||
      text.includes('आलेख') ||
      text.includes('graph') ||
      text.includes('chart')
    ) {
      if (isOfficer) {
        const speech = 'बँक खात्यांचे बार चार्ट आणि पाय चार्ट ग्राफिक्स उघडत आहे.';
        this.updateModalUI('ग्राफिक्स (Computer Graphics)', 'ग्राफ तयार करत आहे...');
        this.speakMarathi(speech, () => {
          this.stopListening();
          window.appUI.switchTab('tab-graphs');
        });
      } else {
        const speech = 'आपला व्यवहार इतिहास उघडत आहे.';
        this.updateModalUI('व्यवहार इतिहास', 'स्क्रीन उघडत आहे...');
        this.speakMarathi(speech, () => {
          this.stopListening();
          window.appUI.switchTab('tab-history');
        });
      }
      return;
    }

    // Fallback
    const speech = isOfficer
      ? `आपला प्रश्न: "${commandText}". CBS डॅशबोर्ड उघडत आहे.`
      : `आपला प्रश्न: "${commandText}". मुख्य आढावा उघडत आहे.`;
    this.updateModalUI('महाबँक सहाय्यक', `"${commandText}"`);
    this.speakMarathi(speech, () => {
      this.stopListening();
      window.appUI.switchTab(isOfficer ? 'tab-officer-overview' : 'tab-dashboard');
    });
  }
}

// Global Voice Assistant Instance
window.voiceBot = new MarathiVoiceAssistant();

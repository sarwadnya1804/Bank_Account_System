/**
 * ============================================================================
 * MAHABANK - AI BANKING ASSISTANT (महामित्र AI सहाय्यक)
 * 
 * Capabilities:
 * 1. Understands Marathi & English Banking Queries
 * 2. Deep knowledge of Indian Banking, RBI Guidelines, Crop Loans, FD rates
 * 3. Direct Navigation / Action Dispatching to Banking Modals & Tabs
 * 4. Reduces the need to search for physical branch or phone support
 * ============================================================================
 */

class AIBankingAssistant {
  constructor() {
    this.chatWidget = null;
    this.messagesContainer = null;
    this.chatInput = null;
    this.isOpen = false;
    this.history = [];

    // Comprehensive Indian Banking Knowledge Base
    this.knowledgeBase = [
      {
        patterns: ['बॅलन्स', 'balance', 'शिल्लक', 'खात्यात किती', 'पैसे किती'],
        answer: () => {
          const bal = window.activeAccount ? window.activeAccount.getFormattedBalance() : '48,750.00';
          return {
            text: `आपल्या महाबँक बचत खात्यात सध्या **₹ ${bal}** शिल्लक उपलब्ध आहे.`,
            actions: [
              { label: 'मागील व्यवहार पहा', callback: "appUI.switchTab('tab-passbook')" },
              { label: 'पैसे पाठवा', callback: "appUI.switchTab('tab-transfer')" }
            ]
          };
        }
      },
      {
        patterns: ['नवीन खाते', 'खाते कसे उघडावे', 'open account', 'new account', 'खाते उघडणे'],
        answer: () => ({
          text: `महाबँकेत नवीन बचत खाते उघडणे आता अत्यंत सोपे झाले आहे:\n\n• **आवश्यक कागदपत्रे:** आधार कार्ड, पॅन कार्ड आणि २ पासपोर्ट फोटो.\n• **किमान शिल्लक (Min Balance):** ग्रामीण भागासाठी फक्त ₹१,००० आणि जन-धन खात्यासाठी ₹० (शून्य).\n• आपण शाखेत न जाता देखील **व्हिडिओ KYC** द्वारे अवघ्या १० मिनिटांत खाते सुरू करू शकता.`,
          actions: [
            { label: 'जवळची शाखा / IFSC शोधा', callback: "appUI.switchTab('tab-services')" }
          ]
        })
      },
      {
        patterns: ['fd', 'मुदत ठेव', 'व्याज दर', 'interest rate', 'fixed deposit', 'एफडी'],
        answer: () => ({
          text: `महाबँक मुदत ठेव (FD) चे सध्याचे वार्षिक व्याजदर खालीलप्रमाणे आहेत:\n\n• **१ वर्ष:** ६.८०% वार्षिक\n• **२ वर्षे:** ७.१०% वार्षिक\n• **३ वर्षे:** ७.२५% वार्षिक\n• **५ वर्षे (टॅक्स सेव्हर):** ७.५०% वार्षिक\n\n📌 **ज्येष्ठ नागरिक (६०+ वर्षे):** सर्व योजनांवर **+०.५०% अतिरिक्त व्याज** दिले जाते! ठेवींना DICGC अंतर्गत ₹५ लाखांपर्यंत विमा संरक्षण आहे.`,
          actions: [
            { label: 'FD कॅल्क्युलेटर उघडा', callback: "appUI.switchTab('tab-deposit')" }
          ]
        })
      },
      {
        patterns: ['पिक कर्ज', 'शेतकरी', 'kisan', 'kcc', 'crop loan', 'कृषी कर्ज', 'शेती कर्ज'],
        answer: () => ({
          text: `**शेतकरी बांधवांसाठी पिक कर्ज (Kisan Credit Card) योजना:**\n\n• **सवलतीचा व्याजदर:** वेळेवर परतफेड केल्यास **फक्त ४.००%** प्रभावी व्याजदर (शासकीय ३% सबसिडीसह).\n• **मर्यादा:** ₹३,००,००० पर्यंतचे पिक कर्ज कोणत्याही तारण किंवा हमीदाराशिवाय.\n• **आवश्यक कागदपत्रे:** चालू वर्षाचा ७/१२ उतारा, ८-अ, पिक पेरा नोंद आणि आधार कार्ड.`,
          actions: [
            { label: 'पिक कर्ज माहिती व अर्ज', callback: "appUI.switchTab('tab-loans')" }
          ]
        })
      },
      {
        patterns: ['ब्लॉक', 'block', 'हरवले', 'चोरी', 'atm कार्ड हरवले', 'card block'],
        answer: () => ({
          text: `⚠️ **ATM कार्ड हरवले असल्यास त्वरित खालील कारवाई करा:**\n\n१. खाली दिलेल्या बटणावर क्लिक करून आपले डेबिट कार्ड १ सेकंदात तात्पुरते किंवा कायमचे ब्लॉक करा.\n२. आपण २४x७ टोल फ्री क्रमांक **१८००-२३३-४५२६** वर कॉल करून किंवा **1930** वर सायबर फसवणुकीची नोंद करू शकता.\n३. ब्लॉक केल्यानंतर नवीन कार्ड आपल्या पत्त्यावर ५ दिवसांत पोहोचेल.`,
          actions: [
            { label: '🚨 ATM कार्ड आताच ब्लॉक करा', callback: "appUI.openAtmBlockModal()" }
          ]
        })
      },
      {
        patterns: ['पैसे पाठवा', 'send money', 'transfer', 'upi', 'imps', 'neft'],
        answer: () => ({
          text: `आपण महाबँकेतून खालील ३ प्रकारे त्वरित व सुरक्षित पैसे पाठवू शकता:\n\n• **UPI:** २४x७ मोफत, एका दिवसात ₹१ लाखांपर्यंत.\n• **IMPS:** त्वरित बँक खात्यावर हस्तांतरण (सेकंदात पोहोचते).\n• **NEFT:** मोठ्या रकमांसाठी नियमित बँक हस्तांतरण.`,
          actions: [
            { label: 'पैसे पाठवण्याचा फॉर्म उघडा', callback: "appUI.switchTab('tab-transfer')" }
          ]
        })
      },
      {
        patterns: ['पासबुक', 'statement', 'स्टेटमेंट', 'व्यवहार', 'मागील व्यवहार', 'transactions'],
        answer: () => {
          const list = window.activeAccount ? window.activeAccount.getMiniStatement(3) : [];
          let listStr = '';
          list.forEach(t => {
            const sym = t.type === 'CREDIT' ? '+ ' : '- ';
            listStr += `\n• ${t.title}: **${sym}₹${t.amount.toLocaleString('en-IN')}** (${t.getFormattedDate().split(' ')[0]})`;
          });
          return {
            text: `आपले डिजिटल ई-पासबुक तयार आहे. नुकतेच झालेले मुख्य व्यवहार:${listStr}\n\nसर्व तपशील पाहण्यासाठी खाली क्लिक करा:`,
            actions: [
              { label: 'पूर्ण ई-पासबुक उघडा', callback: "appUI.switchTab('tab-passbook')" }
            ]
          };
        }
      },
      {
        patterns: ['चेकबुक', 'cheque', 'चेक'],
        answer: () => ({
          text: `आपण घरबसल्या नवीन चेकबुक मागवू शकता:\n\n• २० पानांचे चेकबुक आपल्या नोंदणीकृत पत्त्यावर ३ ते ५ कामकाजाच्या दिवसांत स्पीड पोस्टने पाठवले जाईल.\n• यासाठी कोणतीही अतिरिक्त फी आकारली जात नाही.`,
          actions: [
            { label: 'नवीन चेकबुक मागणी करा', callback: "appUI.requestChequeBook()" }
          ]
        })
      },
      {
        patterns: ['ifsc', 'आयएफएससी', 'शाखा', 'branch'],
        answer: () => ({
          text: `आपल्या मुख्य शाखेचा तपशील:\n\n• **शाखा:** बारामती ग्रामीण शाखा\n• **IFSC कोड:** **MAHB0001245**\n• **MICR कोड:** 413014102\n\nइतर कोणत्याही भारतीय बँकेचा किंवा शाखेचा IFSC शोधण्यासाठी खाली क्लिक करा:`,
          actions: [
            { label: 'IFSC शोधक उघडा', callback: "appUI.switchTab('tab-services')" }
          ]
        })
      },
      {
        patterns: ['सायबर', 'फसवणूक', 'cyber', 'fraud', 'तक्रार', 'complaint'],
        answer: () => ({
          text: `🛡️ **सायबर सुरक्षा व सुरक्षितता नियम:**\n\n• कोणत्याही अनोळखी व्यक्तीला बँक खात्याचा OTP, ATM चा ४ अंकी पिन किंवा पासवर्ड सांगू नका.\n• कोणत्याही संशयास्पद लिंकवर क्लिक करू नका.\n• अनधिकृत व्यवहार झाल्यास त्वरित **1930** या राष्ट्रीय सायबर सुरक्षा हेल्पलाईनवर संपर्क साधा किंवा बँकेला त्वरित कळवा.`,
          actions: [
            { label: 'सुरक्षा मार्गदर्शक पहा', callback: "appUI.showToast('आपले खाते RBI नियमांनुसार पूर्ण सुरक्षित आहे', 'info')" }
          ]
        })
      }
    ];
  }

  init() {
    this.chatWidget = document.getElementById('aiChatWidget');
    this.messagesContainer = document.getElementById('chatMessages');
    this.chatInput = document.getElementById('aiChatInput');

    // Welcome Initial Message
    this.appendBotMessage(
      `नमस्कार संतोष जी! 🙏\n\nमी **महामित्र AI**, महाबँकेचा अधिकृत डिजिटल सहाय्यक आहे. मी आपल्याला खालील सर्व बाबींमध्ये मदत करू शकतो:\n\n• खात्याची शिल्लक व मागील व्यवहार\n• पैसे पाठवणे (UPI / IMPS)\n• पिक कर्ज व शासकीय योजना\n• मुदत ठेवींचे (FD) व्याजदर\n• हरवलेले ATM कार्ड ब्लॉक करणे\n\nआपल्या मनात कोणता प्रश्न आहे? आपण मराठीत किंवा इंग्रजीत विचारू शकता.`
    );
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    if (!this.chatWidget) this.init();
    this.chatWidget.classList.add('active');
    this.isOpen = true;
    if (this.chatInput) this.chatInput.focus();
  }

  closeChat() {
    if (this.chatWidget) this.chatWidget.classList.remove('active');
    this.isOpen = false;
  }

  clearChat() {
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = '';
      this.appendBotMessage('चॅट साफ केले आहे. मी आपल्या सेवेसाठी पुन्हा सज्ज आहे. काय मदत करू?');
    }
  }

  handleSubmit(event) {
    if (event) event.preventDefault();
    const query = this.chatInput.value.trim();
    if (!query) return;

    this.sendUserQuery(query);
    this.chatInput.value = '';
  }

  sendUserQuery(queryText) {
    this.openChat();
    this.appendUserMessage(queryText);

    // Show simulated typing indicator
    const typingId = this.showTypingIndicator();

    setTimeout(() => {
      this.removeTypingIndicator(typingId);
      const response = this.findBestResponse(queryText);
      this.appendBotMessage(response.text, response.actions);

      // Play audio chime
      if (window.voiceBot) {
        window.voiceBot.playChime('success');
      }
    }, 450);
  }

  findBestResponse(query) {
    const q = query.toLowerCase();

    for (const item of this.knowledgeBase) {
      const match = item.patterns.some(pattern => q.includes(pattern.toLowerCase()));
      if (match) {
        return item.answer();
      }
    }

    // Default Fallback
    return {
      text: `आपला प्रश्न: "${query}"\n\nमाझ्याकडे याबद्दलची प्राथमिक माहिती उपलब्ध आहे. आपल्याला थेट मदत हवी असल्यास खालील प्रमुख पर्यायांपैकी एकाची निवड करा किंवा आमच्या २४x७ हेल्पलाईनवर **१८००-२३३-४५२६** वर संपर्क साधा.`,
      actions: [
        { label: 'खात्याची शिल्लक तपासा', callback: "appUI.switchTab('tab-dashboard')" },
        { label: 'पैसे पाठवा', callback: "appUI.switchTab('tab-transfer')" },
        { label: 'पिक कर्ज योजना', callback: "appUI.switchTab('tab-loans')" },
        { label: 'जवळची शाखा व IFSC', callback: "appUI.switchTab('tab-services')" }
      ]
    };
  }

  appendUserMessage(text) {
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-msg user';
    msgEl.innerText = text;
    this.messagesContainer.appendChild(msgEl);
    this.scrollToBottom();
  }

  appendBotMessage(text, actions = []) {
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-msg bot';

    // Parse simple markdown-like bold text (**text**)
    const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    let html = `<div>${formatted}</div>`;

    if (actions && actions.length > 0) {
      html += '<div style="margin-top: 8px; display: flex; flex-direction: column; gap: 6px;">';
      actions.forEach(act => {
        html += `<button class="chat-action-link" onclick="${act.callback}; aiBot.closeChat();">${act.label} <i class="fa-solid fa-arrow-right" style="font-size:10px;"></i></button>`;
      });
      html += '</div>';
    }

    // Add voice speaker icon to read aloud in Marathi
    html += `
      <div style="margin-top: 8px; display: flex; justify-content: flex-end;">
        <button onclick="voiceBot.speakMarathi('${text.replace(/'/g, "\\'").replace(/\n/g, ' ')}')" title="मराठीत ऐका" style="color: var(--brand-saffron); font-size: 13px; padding: 2px 6px;">
          <i class="fa-solid fa-volume-high"></i> ऐका
        </button>
      </div>
    `;

    msgEl.innerHTML = html;
    this.messagesContainer.appendChild(msgEl);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const id = 'typing_' + Date.now();
    const ind = document.createElement('div');
    ind.id = id;
    ind.className = 'chat-msg bot';
    ind.innerHTML = '<em>महामित्र AI टाईप करत आहे...</em>';
    this.messagesContainer.appendChild(ind);
    this.scrollToBottom();
    return id;
  }

  removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }
}

// Global AI Bot Instance
window.aiBot = new AIBankingAssistant();

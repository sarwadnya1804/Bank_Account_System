# महाबँक (MahaBank) - Complete Bank Management System 🏦🇮🇳

> **भारतीय बँकिंग प्रणालीवर आधारित आधुनिक, विश्वासू, आणि सर्वसमावेशक डिजिटल बँक मॅनेजमेंट सिस्टीम.**  
> यात सुरुवातीची लोकप्रिय **MahaBank ची सुंदर भारतीय बँक डिझाईन (RuPay Card, Navy/Saffron Theme, Mobile Bottom Bar)** कायम ठेवून, तुम्ही मागितलेले सर्व मुख्य फीचर्स जसे की **Create Account (विना लॉगिन अडथळा), Deposit/Withdraw (Green/Red बटणे), Check Balance, Search Account, आणि Computer Graphics Canvas Charts (Bar & Pie Chart)** एकाच ठिकाणी अखंड जोडले आहेत!

---

## 🌟 अंतर्भूत सर्व १० मुख्य विभाग (All 10 Core Banking Tabs)

1. 🏠 **Overview & RuPay Card (मुख्य आढावा):**
   - अधिकृत RuPay डेबिट कार्ड व्हिज्युअलायझेशन व बॅलन्स लपवणे/दाखवणे (`••••••••`).
   - एकूण जमा (Credits) आणि एकूण खर्चाचे (Debits) थेट विश्लेषण.
   - नुकत्याच झालेल्या मुख्य व्यवहारांची यादी.

2. ➕ **Create Account (नवीन खाते उघडा):**
   - कोणत्याही लॉगिन अडथळ्याशिवाय थेट खाते उघडण्याची सुविधा.
   - ५ मुख्य इनपुट्स: `Account holder name`, `Email`, `Phone number (10 digit)`, `Account type (Savings/Current)`, `Opening deposit (Rs.)`.
   - फॉर्म भरताच १० अंकी अधिकृत खाते क्रमांक (`1001...`) तात्काळ तयार होतो.

3. 💵 **Deposit / Withdraw (पैसे भरा / काढा):**
   - १० अंकी खाते क्रमांक आणि रक्कम टाकून त्वरित व्यवहार.
   - **हिरवे Deposit** बटण आणि **लाल Withdraw** बटण.
   - किमान शिल्लक (Savings: ₹500, Current: ₹1000) पडताळणी व तात्काळ **नवीन शिल्लक (Updated Balance)** चे प्रदर्शन.

4. 🔍 **Check Balance (शिल्लक तपासा):**
   - १० अंकी खाते क्रमांक टाकून **Show balance** दाबा.
   - खातेदाराचे नाव, खात्याचा प्रकार आणि उपलब्ध बॅलन्स मोठ्या ठळक आकड्यांमध्ये दिसेल.

5. 🔎 **Search Account (खाते शोधा):**
   - नाव, खाते क्रमांक किंवा मोबाईल नंबरने तात्काळ शोध.
   - रिझल्ट टेबल: `Account No.`, `Holder`, `Type`, `Phone`, `Balance`.

6. 💸 **Fund Transfer (UPI / IMPS / NEFT):**
   - एका खात्यातून दुसऱ्या खात्यावर किंवा UPI वर त्वरित पैसे ट्रान्सफर करण्याची सुविधा.

7. 📖 **Transaction History (ई-पासबुक):**
   - सर्व जमा व खर्चाची तारीखवार नोंद आणि प्रिंट करण्यायोग्य पावती.

8. 📊 **Graphs (Computer Graphics - आलेख व विश्लेषण):**
   - **Balance of Records (Bar Chart):** HTML5 Canvas 2D द्वारे सर्व खात्यांमधील बॅलन्सची तुलना करणारा बार चार्ट.
   - **Savings vs Current (Pie Chart):** बचत व चालू खात्यांचे टक्केवारीसह विभाजन दाखवणारा पाय चार्ट.

9. 👥 **All Accounts & CBS Control:**
   - सर्व बँक खात्यांची यादी व **Activate / Deactivate (Freeze)** करण्याचे सुरक्षा नियंत्रण.

10. ⚠️ **Complaints & Helpdesk:**
    - ATM समस्या किंवा ट्रान्झॅक्शन तक्रार नोंदणी व निवारण कक्ष.

---

## 🎨 डिझाइन व वापरकर्ता सुविधा
- **मराठी व्हॉइस असिस्टंट (Rural Access):** ग्रामीण ग्राहकांसाठी वर **"मराठी बोला"** पर्यायावर क्लिक करून मराठीत बॅलन्स, ट्रान्सफर व माहिती विचारण्याची सोय.
- **इंग्रजी भाषा (Default) व मराठी पर्याय:** एका क्लिकवर शुद्ध मराठी व इंग्रजीमध्ये भाषांतर.
- **ब्राइट व डार्क मोड:** डोळ्यांना सुखद वाटणाऱ्या दोन्ही थीम्स.
- **मोबाईल रिस्पॉन्सिव्ह:** मोबाईलवर खाली छान **Bottom Navigation Bar** आपोआप सक्रिय होतो.

---

## 🚀 GitHub Pages वर कसे चालवायचे?
1. तुमच्या GitHub वर नवीन Repository बनवा.
2. या फोल्डरमधील फाइल्स पुश करा:
   ```bash
   git init
   git add .
   git commit -m "MahaBank Unified Bank Management System with Computer Graphics"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/mahabank.git
   git push -u origin main
   ```
3. GitHub मधील **Settings -> Pages -> Branch main -> Save** करा. तुमची वेबसाइट मोबाईलवर व कॉम्प्युटरवर मोफत लाईव्ह होईल!

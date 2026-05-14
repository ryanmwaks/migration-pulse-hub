/* ============================================================
   ZURI — Migration Pulse Hub Chatbot Engine v1.0
   Multilingual · Human-handover · Trauma-informed · Rights-based

   Supports: EN · SW · SO · AR · AM · OM · TI · RW · RN · LG · DIN · NUS · FR
   Escalation: WhatsApp +254118969209 | info@migrationpulsehub.org
   ============================================================ */

const ZURI = (function () {
  'use strict';

  /* ----------------------------------------------------------
     CONFIG
  ---------------------------------------------------------- */
  const CFG = {
    whatsapp:   'https://wa.me/254118969209',
    email:      'info@migrationpulsehub.org',
    website:    'https://www.migrationpulsehub.org',
    botName:    'ZURI',
    org:        'Migration Pulse Hub',
    storageKey: 'zuri_state_v1',
    typingMs:   900,
  };

  /* ----------------------------------------------------------
     SAFETY KEYWORDS — trigger immediate human escalation
  ---------------------------------------------------------- */
  const SAFETY_PATTERNS = [
    /traffick/i, /abuse/i, /exploit/i, /violence/i, /rape/i,
    /murder/i, /kidnap/i, /torture/i, /suicide/i, /kill (me|myself)/i,
    /danger/i, /urgent.{0,15}help/i, /child.{0,15}protect/i,
    /sex.*slave/i, /forced.*marriage/i, /at risk/i, /unsafe/i,
  ];

  /* ----------------------------------------------------------
     LANGUAGES
  ---------------------------------------------------------- */
  const LANGS = {
    en:  'English',
    sw:  'Kiswahili',
    so:  'Somali',
    ar:  'عربي',
    am:  'አማርኛ',
    om:  'Oromoo',
    ti:  'ትግርኛ',
    rw:  'Kinyarwanda',
    rn:  'Kirundi',
    lg:  'Luganda',
    din: 'Dinka',
    nus: 'Nuer',
    fr:  'Français',
  };

  /* ----------------------------------------------------------
     TRANSLATIONS  (key UI strings per language)
     Note: Less-common languages use best-effort translations.
     Professional review recommended before production.
  ---------------------------------------------------------- */
  const T = {
    en: {
      welcome:     "Hello! 👋 Welcome to Migration Pulse Hub. I'm <strong>ZURI</strong>, your digital assistant.\n\nI can help you with events, reports, partnerships, sponsorship, vendor booking, media enquiries, volunteering, or general support.\n\nHow may I assist you today?",
      privacy:     "🔒 We collect only the minimum details needed to respond to your enquiry. Please do not share passwords, IDs, or financial documents here.",
      menu_title:  "Please choose what you need help with:",
      name_q:      "What is your full name?",
      email_q:     "What is your email address?",
      phone_q:     "What is your phone number? (include country code)",
      country_q:   "Which country are you in?",
      org_q:       "What is your organisation or institution? (type 'none' if not applicable)",
      role_q:      "What is your role or job title?",
      message_q:   "Please describe your enquiry in a few sentences:",
      consent_q:   "Do you consent to Migration Pulse Hub using your details to respond to this enquiry?",
      consent_yes: "Yes, I consent",
      consent_no:  "No, go back",
      escalate_q:  "How would you like us to follow up with you?",
      wa_btn:      "📲 Continue on WhatsApp",
      email_btn:   "📧 Send via Email",
      human_btn:   "🙋 Speak to a Human",
      thanks:      "✅ Thank you! Your enquiry has been received. The Migration Pulse Hub team will follow up with you shortly.\n\n<em>Reference: {ref}</em>",
      safety_msg:  "⚠️ It sounds like you may be in an urgent or sensitive situation. Please connect directly with our team immediately.",
      restart:     "Start over",
      back:        "← Back",
      send:        "Send",
      typing:      "ZURI is typing…",
      select_lang: "Select your language:",
      attendance_q:"How will you attend the event?",
      att_options: ["In Person – Nairobi", "Virtual / Online", "Both"],
      session_q:   "Which sessions are you most interested in? (e.g. Policy, Youth, Culture — or type 'any')",
      access_q:    "Do you have any accessibility requirements? (e.g. wheelchair, interpreter) — type 'none' if not",
      sponsor_cat_q:"Which sponsorship package interests you?",
      spon_opts:   ["Platinum – KES 2M", "Gold – KES 1M", "Silver – KES 500K", "Community Partner – KES 150K", "Discuss Custom Package"],
      vendor_cat_q:"What type of vendor/exhibitor are you?",
      vendor_opts: ["Refugee-led Food Vendor", "Arts, Crafts & Textiles", "Technology & Innovation", "NGO / Advocacy Org", "Publishing & Media", "Cultural Exhibitor", "Other"],
      booth_q:     "What booth size do you require? (small / medium / large) and do you need electricity?",
      media_house_q:"Which media house or outlet do you represent?",
      deadline_q:  "What is your deadline for this request?",
      interview_q: "Please describe your media request or interview topic:",
      urgency_q:   "How urgent is your situation?",
      urgency_opts:["Urgent – I need help now", "Soon – within days", "Not urgent"],
      safe_contact_q:"What is your preferred safe contact method? (e.g. WhatsApp, email — only share what you are comfortable with)",
      issue_type_q:"What type of issue are you experiencing?",
      issue_opts:  ["Refugee status / documentation", "Protection from violence", "Child protection", "Trafficking or exploitation", "Access to services", "Legal rights", "Other protection issue"],
      volunteer_area_q: "Which area would you like to volunteer in?",
      vol_opts:    ["Event Support", "Translation / Interpretation", "Legal Aid Assistance", "Research & Data", "Communications & Media", "Community Outreach", "Other"],
      skills_q:    "Briefly describe your skills and availability:",
      partner_type_q: "What type of partnership are you seeking?",
      partner_opts:["Academic / Research", "Civil Society / NGO", "Government Institution", "Media Partner", "Funding / Donor", "Technical Partner", "Other"],
      website_issue_q:"Please describe the website issue you experienced:",
      topic_q:     "What topic would you like to propose for your panel or workshop?",
      bio_q:       "Please share a brief biography (2–3 sentences):",
      human_hand:  "Thank you. I'm connecting you with the Migration Pulse Hub team. Choose how you'd like to continue:",
      safety_hand: "🚨 This sounds urgent. Please contact our team immediately using the options below. If you are in immediate physical danger, please call local emergency services (police / ambulance).",
      field_req:   "This field is required. Please provide a response.",
    },

    sw: {
      welcome:     "Habari! 👋 Karibu Migration Pulse Hub. Mimi ni <strong>ZURI</strong>, msaidizi wako wa kidijitali.\n\nNinaweza kukusaidia na matukio, ripoti, ushirikiano, udhamini, maswali ya wasambazaji, vyombo vya habari, kujitolea, au msaada wa jumla.\n\nNinawezaje kukusaidia leo?",
      privacy:     "🔒 Tunakusanya taarifa za chini zinazohitajika tu kujibu swali lako. Tafadhali usishiriki nywila, vitambulisho, au nyaraka za fedha hapa.",
      menu_title:  "Tafadhali chagua unahitaji msaada na nini:",
      name_q:      "Jina lako kamili ni nani?",
      email_q:     "Anwani yako ya barua pepe ni nini?",
      phone_q:     "Nambari yako ya simu ni nini? (jumuisha nambari ya nchi)",
      country_q:   "Uko nchi gani?",
      org_q:       "Shirika lako au taasisi ni nini? (andika 'hakuna' ikiwa haihusiki)",
      message_q:   "Tafadhali elezea swali lako kwa sentensi chache:",
      consent_q:   "Je, unakubali Migration Pulse Hub itumie maelezo yako kujibu swali hili?",
      consent_yes: "Ndiyo, nakubali",
      consent_no:  "Hapana, rudi nyuma",
      escalate_q:  "Ungependa tufuatilie vipi?",
      wa_btn:      "📲 Endelea kwenye WhatsApp",
      email_btn:   "📧 Tuma kwa Barua Pepe",
      human_btn:   "🙋 Ongea na Mtu",
      thanks:      "✅ Asante! Swali lako limepokelewa. Timu ya Migration Pulse Hub itafuatilia hivi karibuni.",
      safety_msg:  "⚠️ Inaonekana uko katika hali ya dharura. Tafadhali wasiliana na timu yetu moja kwa moja sasa hivi.",
      restart:     "Anza upya",
      back:        "← Rudi",
      send:        "Tuma",
      human_hand:  "Asante. Nakuunganisha na timu ya Migration Pulse Hub. Chagua jinsi unavyotaka kuendelea:",
      safety_hand: "🚨 Hii inaonekana dharura. Tafadhali wasiliana na timu yetu mara moja. Ikiwa uko katika hatari ya mwili, piga simu huduma za dharura za eneo lako.",
      field_req:   "Sehemu hii inahitajika. Tafadhali toa jibu.",
    },

    so: {
      welcome:     "Salaan! 👋 Soo dhawow Migration Pulse Hub. Waxaan ahay <strong>ZURI</strong>, kaaliyahaaga dhijitaalka ah.\n\nWaxaan kuu caawin karaa xafladaha, warbixinnada, ortaagga, deeqaha, qeybtiyeyaasha, warbaahinta, ama taageerada guud.\n\nSideed kuu caawin karaa maanta?",
      privacy:     "🔒 Waxaan uruurinaynaa macluumaadka ugu yar ee lagama maarmaan ah si aan uga jawaabno su'aalahaaga. Fadlan ha wadaagto furaha sirta, aqoonsiga, ama dukumiintiyada xasaasiga ah halkan.",
      menu_title:  "Fadlan dooro waxa aad u baahan tahay caawinta:",
      name_q:      "Magacaaga buuxa waa maxay?",
      email_q:     "Ciwaanka emailkaaga waa maxay?",
      phone_q:     "Telefoon lambarkaa waa maxay? (ku dar lambarka wadanka)",
      country_q:   "Wadanka aad ku jirto waa kee?",
      org_q:       "Xaruntaada ama hay'addaada waa maxay? (qor 'midna' haddaan khusayn)",
      message_q:   "Fadlan si gaaban u sharax su'aashaada:",
      consent_q:   "Miyaad oggolaan tahay Migration Pulse Hub inay isticmaasho xogahaaga si ay uga jawaabto su'aalahan?",
      consent_yes: "Haa, waan oggolahay",
      consent_no:  "Maya, ku noqo",
      escalate_q:  "Sideed rabtaa inaan kula xiriirno?",
      wa_btn:      "📲 Sii wad WhatsApp",
      email_btn:   "📧 Dir Iimeelka",
      human_btn:   "🙋 La xiriir Qof",
      thanks:      "✅ Mahadsanid! Su'aashaadii la helay. Kooxda Migration Pulse Hub waxa ay kula soo xidhiidhi doontaa dhawaan.",
      safety_msg:  "⚠️ Waxay u muuqataa inaad jirto xaalad degdeg ah. Fadlan si toos ah ula xiriir kooxdeena hadda.",
      restart:     "Dib u bilow",
      back:        "← Dib u noqo",
      send:        "Dir",
      human_hand:  "Mahadsanid. Waxaan kula xiriiraynaa kooxda Migration Pulse Hub. Dooro sida aad rabto inaad sii wato:",
      safety_hand: "🚨 Tani waa xaalad degdeg ah. Fadlan si degdeg ah ula xiriir kooxdeena. Haddaad jirto khatar jidh, wac adeegyada gurmadka degdega ee gobolkaaga.",
      field_req:   "Goobtan waa loo baahan yahay. Fadlan bixo jawaab.",
    },

    ar: {
      welcome:     "مرحباً! 👋 أهلاً بك في Migration Pulse Hub. أنا <strong>ZURI</strong>، مساعدك الرقمي.\n\nيمكنني مساعدتك في الفعاليات، التقارير، الشراكات، الرعاية، حجز الباعة، استفسارات الإعلام، التطوع، أو الدعم العام.\n\nكيف يمكنني مساعدتك اليوم؟",
      privacy:     "🔒 نجمع فقط الحد الأدنى من البيانات اللازمة للرد على استفسارك. يُرجى عدم مشاركة كلمات المرور أو الهويات أو الوثائق المالية هنا.",
      menu_title:  "يُرجى اختيار ما تحتاج المساعدة فيه:",
      name_q:      "ما اسمك الكامل؟",
      email_q:     "ما عنوان بريدك الإلكتروني؟",
      phone_q:     "ما رقم هاتفك؟ (أضف رمز البلد)",
      country_q:   "في أي بلد أنت؟",
      org_q:       "ما منظمتك أو مؤسستك؟ (اكتب 'لا شيء' إن لم ينطبق)",
      message_q:   "يُرجى وصف استفسارك في بضع جمل:",
      consent_q:   "هل تُوافق على استخدام Migration Pulse Hub لبياناتك للرد على هذا الاستفسار؟",
      consent_yes: "نعم، أوافق",
      consent_no:  "لا، عد للخلف",
      escalate_q:  "كيف تريد أن نتابع معك؟",
      wa_btn:      "📲 تابع عبر واتساب",
      email_btn:   "📧 إرسال عبر البريد الإلكتروني",
      human_btn:   "🙋 التحدث مع إنسان",
      thanks:      "✅ شكراً! تم استلام استفسارك. سيتابع معك فريق Migration Pulse Hub قريباً.",
      safety_msg:  "⚠️ يبدو أنك في موقف عاجل أو حساس. يُرجى التواصل مع فريقنا مباشرةً الآن.",
      restart:     "ابدأ من جديد",
      back:        "← رجوع",
      send:        "إرسال",
      human_hand:  "شكراً. أنا أربطك بفريق Migration Pulse Hub. اختر كيف تريد المتابعة:",
      safety_hand: "🚨 يبدو هذا أمراً عاجلاً. يُرجى التواصل مع فريقنا فوراً. إذا كنت في خطر جسدي مباشر، اتصل بخدمات الطوارئ المحلية.",
      field_req:   "هذا الحقل مطلوب. يُرجى تقديم إجابة.",
    },

    am: {
      welcome:     "ሰላም! 👋 ወደ Migration Pulse Hub እንኳን ደህና መጡ። እኔ <strong>ZURI</strong> ዲጂታል ረዳትዎ ነኝ።\n\nስለ ዝግጅቶች፣ ሪፖርቶች፣ ሽርክናዎች፣ ስፖንሰርሺፕ፣ ሻጭ ቦታ ዕዝ፣ ሚዲያ ጥያቄዎች ወይም አጠቃላይ ድጋፍ ልረዳዎ እችላለሁ።\n\nዛሬ እንዴት ልረዳዎ?",
      privacy:     "🔒 ለጥያቄዎ ምላሽ ለመስጠት አስፈላጊ የሆነ ዝቅተኛ ዝርዝሮችን ብቻ እንሰበስባለን። እዚህ የይለፍ ቃሎችን፣ መታወቂያዎችን ወይም የፋይናንስ ሰነዶችን አያጋሩ።",
      menu_title:  "ምን እርዳታ ያስፈልግዎ እባክዎ ይምረጡ:",
      name_q:      "ሙሉ ስምዎ ምንድን ነው?",
      email_q:     "የኢሜይል አድራሻዎ ምንድን ነው?",
      phone_q:     "የስልክ ቁጥርዎ ምን ያህል ነው? (የሀገር ኮድ ያካትቱ)",
      country_q:   "በምን ሀገር ውስጥ ነዎት?",
      org_q:       "ድርጅትዎ ወይም ተቋምዎ ምንድን ነው? (የማይሠራ ከሆነ 'ምንም' ይጻፉ)",
      message_q:   "ጥያቄዎን በጥቂት ዓረፍተ ነገሮች እባክዎ ያብራሩ:",
      consent_q:   "Migration Pulse Hub ዝርዝሮችዎን ለዚህ ጥያቄ ምላሽ ለመስጠት እንዲጠቀምበት ይስማማሉ?",
      consent_yes: "አዎ፣ እስማማለሁ",
      consent_no:  "አይ፣ ወደ ኋላ ተመለስ",
      escalate_q:  "እንዴት ሊከታተሉዎ ይፈልጋሉ?",
      wa_btn:      "📲 በዋትስአፕ ቀጥሉ",
      email_btn:   "📧 በኢሜይል ላኩ",
      human_btn:   "🙋 ሰው ጋር ይናገሩ",
      thanks:      "✅ እናመሰግናለን! ጥያቄዎ ደርሷል። የ Migration Pulse Hub ቡድን ብዙም ሳይቆይ ይከታተልዎታል።",
      safety_msg:  "⚠️ ለአስቸኳይ ወይም ስሜታዊ ሁኔታ ውስጥ ሊሆኑ ይችላሉ። ቡድናችን ጋር አሁን ቀጥተኛ ግንኙነት ያድርጉ።",
      restart:     "እንደገና ጀምር",
      back:        "← ተመለስ",
      send:        "ላክ",
      human_hand:  "እናመሰግናለን። ከMigration Pulse Hub ቡድን ጋር እያገናኘዎ ነኝ። ለቀጠሉ ያለዎትን መንገድ ይምረጡ:",
      safety_hand: "🚨 ይህ አስቸኳይ ይመስላል። ቡድናችን ጋር ወዲያው ያሳልፉ። ወዲያዊ አካላዊ አደጋ ውስጥ ከሆኑ፣ የአካባቢ የድንገተኛ ጊዜ አገልግሎቶችን ይደውሉ።",
      field_req:   "ይህ መስክ ያስፈልጋል። እባክዎ ምላሽ ያቅርቡ።",
    },

    om: {
      welcome:     "Nagaan! 👋 Baga gara Migration Pulse Hub dhuftan. Ani <strong>ZURI</strong>, gargaaraa dijitaalaa keessan.\n\nWaa'ee taateewwan, gabaasota, gamtummaa, deeggarsa, galma gurbayyii, miidiyaa, ykn gargaarsa waliigalaa isin gargaaruu danda'a.\n\nGuyyaa kana akkamiin isin gargaaruu danda'a?",
      privacy:     "🔒 Odeeffannoo xiqqoo barbaachisaa qofa sassaabna. Maaloo jecha icciitii, eenyummaa, ykn galmee maallaqaa asitti hin qoodiin.",
      menu_title:  "Maaloo maal irratti gargaarsa barbaaddu filadhu:",
      name_q:      "Maqaa guutuu kee maal?",
      email_q:     "Teessoo imeelii kee maal?",
      phone_q:     "Lakkoofsa bilbilaa kee maal? (koodii biyyaa dabaluu)",
      country_q:   "Biyya kami keessa jirta?",
      org_q:       "Dhaabbata ykn instituutii kee maal? ('hin jiru' barreessi yoo hin dheekkamne)",
      message_q:   "Gaaffii kee gara gabaabsaan ibsi:",
      consent_q:   "Migration Pulse Hub odeeffannoo kee gaaffii kanaaf deebii kennuuf fayyadamuuf hayyama keetaa?",
      consent_yes: "Eeyyee, hayyama kenna",
      consent_no:  "Lakki, deebi'i",
      escalate_q:  "Akkamiin nu hordofsiifachuu barbaadda?",
      wa_btn:      "📲 WhatsApp irratti itti fufi",
      email_btn:   "📧 Imeelii ergii",
      human_btn:   "🙋 Nama waliin haasayi",
      thanks:      "✅ Galatoomi! Gaaffiin kee fudhatameera. Gareen Migration Pulse Hub ati isin hordofa.",
      safety_msg:  "⚠️ Yeroo hatattamaa ykn xiyeeffannaa barbaaddu keessa jiruu fakkaatta. Maaloo yeroo ammaa gareewwan keenya waliin qunnamtii qabaadhu.",
      restart:     "Irra deebi'i eegali",
      back:        "← Deebi'i",
      send:        "Ergi",
      human_hand:  "Galatoomi. Garee Migration Pulse Hub waliin si walqunnamsiisaa jira. Itti fufiinsi akkamiin akka barbaaddu filadhu:",
      safety_hand: "🚨 Kun hatattama fakkaata. Maaloo garee keenyaan hatattamaan quunnamaa. Balaa qaamaa keessa yoo jiraatte, tajaajila hatattamaa naannoo kee waamudhaa.",
      field_req:   "Achiisa kana ni barbaachisa. Maaloo deebii kenni.",
    },

    ti: {
      welcome:     "ሰላም! 👋 ናብ Migration Pulse Hub እንቋዕ ደሓን መጻእካ/ኺ። ኣነ <strong>ZURI</strong>, ዲጂታላዊ ሓጋዚ ናይ ንዓኻ/ኽ እዩ።\n\nብዛዕባ ፍጻሜታት፣ ጸብጻባት፣ ምሕዝነት፣ ስፖንሰርሽፕ ወይ ሓጋዚ ሓበሬታ ክሕግዝካ/ኺ ይኽእል።\n\nሎሚ ከም'ቲ ኽሕግዘካ/ኺ?",
      privacy:     "🔒 ንሕቶኻ ንምምላሽ ዝቐነሰ ዝርዝራት ጥራይ ንእክብ። ኣብዚ ሕሉፍ ቃላት፣ ናይ መን ሰብ ወረቃቕቲ ወይ ናይ ፋይናንስ ሰነዳት ኣይትካፍል።",
      menu_title:  "ኣብ ምንታይ ሓጋዚ ሓበሬታ ዘድልየካ/ኽ ምረጽ:",
      name_q:      "ምሉእ ስምካ/ኺ እንታይ እዩ?",
      email_q:     "ኣድራሻ ኢሜልካ/ኺ እንታይ እዩ?",
      phone_q:     "ቁጽሪ ቴሌፎንካ/ኺ እንታይ እዩ? (ናይ ሃገር ኮድ ኣካቱ)",
      country_q:   "ኣብ ኣየናይ ሃገር ኢኻ/ኺ?",
      org_q:       "ናይ ውደባ/ትካል ስምካ/ኺ እንታይ እዩ? (እንተ ዘይሃሎ 'ዘሎ የለን' ጻሓፍ)",
      message_q:   "ሕቶኻ/ኺ ኣብ ቅሩብ ሓሳባት ገሊጽካ/ኺ:",
      consent_q:   "Migration Pulse Hub ዝርዝራትካ/ኺ ንዚ ሕቶ ንምምላሽ ክጥቀም ይፍቀዶ?",
      consent_yes: "እወ፣ ይፍቀደለይ",
      consent_no:  "ኣይፋለይን፣ ምለስ",
      escalate_q:  "ብኸምዚ ምክትታልና ትደሊ/ትደልዪ?",
      wa_btn:      "📲 ኣብ WhatsApp ቀጽሉ",
      email_btn:   "📧 ብኢሜል ስደዱ",
      human_btn:   "🙋 ምስ ሰብ ተዛረቡ",
      thanks:      "✅ የቐንየልካ/ኺ! ሕቶኻ/ኺ ተቐቢልናዮ። ቡድን Migration Pulse Hub ቀልጢፉ ክከታተለካ/ኺ እዩ።",
      safety_msg:  "⚠️ ኣብ ዘፍርሕ ወይ ህጹጽ ኩነታት ምህላዉ ይርአ። ሕጂ ብቐጥታ ምስ ቡድንና ርኸቡ።",
      restart:     "ካብ መጀመርታ ጀምር",
      back:        "← ተመለስ",
      send:        "ስደዱ",
      human_hand:  "የቐንየልካ/ኺ። ምስ ቡድን Migration Pulse Hub ኣጣምረካ/ኺ ኣለኹ። ብኸምዚ ቀጽሉ ክትመርጽ:",
      safety_hand: "🚨 ህጹጽ ይኹን ይርአ። ቡድንና ብህጹጽ ተወከሱ። ካብ ሓደጋ ኣካላዊ ዘፍርሕ እንተ ሃለዉ፣ ናይ ከባቢ ህጹጽ ኣገልግሎት ጸውዑ።",
      field_req:   "እዚ ዓምዲ ዘድሊ እዩ። ሓሳብ ኣቕርቡ።",
    },

    rw: {
      welcome:     "Muraho! 👋 Murakaza neza kuri Migration Pulse Hub. Ndi <strong>ZURI</strong>, umufasha wawe w'ikoranabuhanga.\n\nNshobora kukuganiriza ku bikorwa, raporo, ubufatanye, inkunga, inyungu z'abakoranya, itumatumanaho, ubwitange, cyangwa ubufasha rusange.\n\nNshobora kukufasha gute uyu munsi?",
      privacy:     "🔒 Dutunga gusa amakuru make agenewe gusubiza ikibazo cyawe. Ntugabane passwords, indangamuntu, cyangwa inyandiko z'imari hano.",
      menu_title:  "Hitamo icyo ukeneye ubufasha muri:",
      name_q:      "Amazina yawe yose ni ayahe?",
      email_q:     "Aderesi ya imeri yawe ni iyihe?",
      phone_q:     "Nimero ya telefoni yawe ni iyihe? (shyiramo code y'igihugu)",
      country_q:   "Uri mu gihugu cyihe?",
      org_q:       "Umuryango cyangwa inzego zawe ni iyihe? (andika 'ntaho' niba bitabaye ngombwa)",
      message_q:   "Sobanura ikibazo cyawe mu magambo make:",
      consent_q:   "Wemerera Migration Pulse Hub gukoresha amakuru yawe gusubiza iki kibazo?",
      consent_yes: "Yego, nemera",
      consent_no:  "Oya, subira inyuma",
      escalate_q:  "Urashaka tugukomeze gute?",
      wa_btn:      "📲 Komeza kuri WhatsApp",
      email_btn:   "📧 Ohereza imeri",
      human_btn:   "🙋 Ganira n'umuntu",
      thanks:      "✅ Urakoze! Ikibazo cyawe cyakirwa. Itsinda rya Migration Pulse Hub rizakugarukaho vuba.",
      safety_msg:  "⚠️ Bisa nk'aho uri mu bihe by'ihungabana. Nyamuneka wahuza na tsinda ryacu ubu.",
      restart:     "Tangira bushya",
      back:        "← Subira inyuma",
      send:        "Ohereza",
      human_hand:  "Urakoze. Nakuhuza n'itsinda rya Migration Pulse Hub. Hitamo uburyo urashaka gukomezamo:",
      safety_hand: "🚨 Bisa nk'ihutirwa. Nyamuneka wahuza na tsinda ryacu ako kanya. Niba uri mu makuba y'umubiri, hamagara serivisi z'ubutabazi zo mu karere kawe.",
      field_req:   "Uru rwego rurasabwa. Tanga igisubizo.",
    },

    rn: {
      welcome:     "Salut! 👋 Murakaza neza kuri Migration Pulse Hub. Ndi <strong>ZURI</strong>, umufasha wawe wa numerike.\n\nNshobora kukufasha ku bikorwa, raporo, inkunga, cyangwa ubufasha rusange.\n\nNshobora kukufasha gute uyu munsi?",
      privacy:     "🔒 Turondera gusa amakuru make agenewe gusubiza ikibazo cawe. Ntugabane amagambo banga, indangamuntu cyangwa inyandiko z'imari hano.",
      menu_title:  "Hitamo ico ukeneye ubufasha muri:",
      name_q:      "Amazina yawe yose ni ayahe?",
      email_q:     "Aderesi yawe ya imeri ni iyihe?",
      phone_q:     "Numero yawe ya telefone ni iyihe? (shyiramo code y'igihugu)",
      country_q:   "Uri mu gihugu kihe?",
      org_q:       "Umuryango wawe ni uwuhe? (andika 'nta na kimwe' niba bitaba ngombwa)",
      message_q:   "Sobanura ikibazo cawe mu magambo make:",
      consent_q:   "Emera Migration Pulse Hub gukoresha amakuru yawe gusubiza iki kibazo?",
      consent_yes: "Ego, nemera",
      consent_no:  "Oya, subira inyuma",
      escalate_q:  "Urashaka tugukomeze gute?",
      wa_btn:      "📲 Komeza kuri WhatsApp",
      email_btn:   "📧 Ereka imeri",
      human_btn:   "🙋 Ganira n'umuntu",
      thanks:      "✅ Urakoze! Ikibazo cawe cakirwa. Umurwi wa Migration Pulse Hub uzokugarukaho vuba.",
      safety_msg:  "⚠️ Bisa nkaho uri mu bihe vyihutirwa. Tubuze na tsinda ryacu ubu.",
      restart:     "Tangira ubushya",
      back:        "← Subira inyuma",
      send:        "Ereka",
      human_hand:  "Urakoze. Nakuhuza n'umurwi wa Migration Pulse Hub. Hitamo uburyo urashaka gukomezako:",
      safety_hand: "🚨 Bisa nk'ihutirwa. Nyamuneka tubuze na tsinda ryacu ako kanya. Niba uri mu makuba y'umubiri, hamagara serivisi z'ubutabazi zo mu karere kawe.",
      field_req:   "Uru rwego rurasabwa. Tanga igisubizo.",
    },

    lg: {
      welcome:     "Oli otya! 👋 Tukwanirizza eri Migration Pulse Hub. Nze <strong>ZURI</strong>, omuyambi wo ow'edijitali.\n\nNsobola okukuyamba ku byafaayo, lipoota, bulungibwansi, sponsorship, n'obweyambi obwenjawulo.\n\nNsobola okukuyamba ntya leero?",
      privacy:     "🔒 Tuteeka amawulire amakeera agasooka okusaba. Ttonda okugabana passwords, ID, oba ebiwandiiko bya sente wano.",
      menu_title:  "Londa kye okwagala obuyambi mu:",
      name_q:      "Erinnya lyo lyonna kiki?",
      email_q:     "Endagiriro ya imeyiro yo kiki?",
      phone_q:     "Namba ya simu yo kiki? (yongera code ya nsi)",
      country_q:   "Oli mu nsi ki?",
      org_q:       "Ekibiina kyo oba sitisensi yo kiki? (wandiika 'tewali' bwe kitaba bya ngu)",
      message_q:   "Saba okwogera ebikubeera mu bigambo bitono:",
      consent_q:   "Oyagala Migration Pulse Hub okukozesa amawulire go okuddamu ku kibuuzo kino?",
      consent_yes: "Weewaawo, nsala",
      consent_no:  "Nedda, ddayo",
      escalate_q:  "Oyagala tukugoberere ntya?",
      wa_btn:      "📲 Endeera ku WhatsApp",
      email_btn:   "📧 Siira ku imeyiro",
      human_btn:   "🙋 Yogera n'omuntu",
      thanks:      "✅ Webale! Ekirowoozo kyo kikiriddwa. Ekibiina kya Migration Pulse Hub kijja kukugobererako mangu.",
      safety_msg:  "⚠️ Biddikira ng'oli mu kifo ekitegeerwa mangu. Kulumba, kuba ow'amazima ne kibiina kyaffe kaakano.",
      restart:     "Tandika omulundi gwa ntono",
      back:        "← Ddayo",
      send:        "Siira",
      human_hand:  "Webale. Nkuyungiriza n'ekibiina kya Migration Pulse Hub. Londa engeri gy'oyagala okweyongera:",
      safety_hand: "🚨 Biddikira ng'ekifo eky'amazima. Kulumba, kuba ow'amazima ne kibiina kyaffe mangu. Bw'oli mu kabi ky'omubiri, yita nga basaasira b'eby'obuggya.",
      field_req:   "Awo kwagala. Noonya okuwaayo okuddamu.",
    },

    din: {
      welcome:     "Loi! 👋 Buk waar Migration Pulse Hub. An <strong>ZURI</strong>, awuɔɔt apiu yin.\n\nEn adhol yin lɔ guiir ee biëëc, aricin, mïth, wil, abuk vendor, aricin kek media, wil piöuc, abuk yic de mïth.\n\nEn adhol yin jɔt cɔk?",
      privacy:     "🔒 Ke yök kë tïŋ ke raan kë cïï ke cät. Tiëŋ cie passwords, ID, wala documents kä.",
      menu_title:  "Piir kë jɔt guiir ee:",
      name_q:      "Nyïŋ de ku tɔc?",
      email_q:     "Adreeth de email de?",
      phone_q:     "Akïïm de phone de? (käm code de guop)",
      country_q:   "Guop kɔ nhom?",
      org_q:       "Ciëŋ de wala institution de? (gör 'acïï' käm ke cïï)",
      message_q:   "Rëc guir de wäl pïr:",
      consent_q:   "Loi aye Migration Pulse Hub käm info de tïŋ guir kë?",
      consent_yes: "Ŋoot, loi",
      consent_no:  "Acie, la cäth",
      escalate_q:  "Köŋ jɔt tök?",
      wa_btn:      "📲 Cɔk WhatsApp",
      email_btn:   "📧 Tiëp Email",
      human_btn:   "🙋 Gam raan",
      thanks:      "✅ Bäk! Guir de yök. Ciëŋ kek Migration Pulse Hub acɔ la.",
      safety_msg:  "⚠️ Piöör nhïïm ke wäär. Gam ciëŋ ke jɔt.",
      restart:     "Cɔk nhïm",
      back:        "← La cäth",
      send:        "Tiëp",
      human_hand:  "Bäk. En tïŋ yin kek ciëŋ Migration Pulse Hub. Piir jɔt cɔk:",
      safety_hand: "🚨 Wäär. Gam ciëŋ jɔt. Käm ke piöör yic, wiel aric de guop de.",
      field_req:   "Kë cïï käm. Tiëŋ tïŋ.",
    },

    nus: {
      welcome:     "Malo! 👋 Ba Migration Pulse Hub. An <strong>ZURI</strong>, malual mar digitalic.\n\nCan ji mi ee yic, riëc, kuany, kä vendor, media, vol, ba yic tuany.\n\nCan jil yin tɔ?",
      privacy:     "🔒 Ke yɔk kë tïŋ kuany kɔ. Tiëŋ cie passwords, ID, wala doc.",
      menu_title:  "Gam kë ji kuany:",
      name_q:      "Nyïŋ de tɔ?",
      email_q:     "Email de?",
      phone_q:     "Phone de? (code de guop)",
      country_q:   "Guop kɔ?",
      org_q:       "Ciëŋ de? (gör 'acïï' kä cïï)",
      message_q:   "Rëc guir de:",
      consent_q:   "Loi Migration Pulse Hub tïŋ info de?",
      consent_yes: "Ŋoot",
      consent_no:  "Acie",
      escalate_q:  "Jal tök?",
      wa_btn:      "📲 WhatsApp",
      email_btn:   "📧 Email",
      human_btn:   "🙋 Raan",
      thanks:      "✅ Bäk! Guir de yök.",
      safety_msg:  "⚠️ Wäär. Gam ciëŋ jɔt.",
      restart:     "Cɔk",
      back:        "← Cäth",
      send:        "Tiëp",
      human_hand:  "Bäk. Tïŋ yin kek ciëŋ Migration Pulse Hub:",
      safety_hand: "🚨 Wäär. Gam ciëŋ jɔt. Wiel aric guop de.",
      field_req:   "Käm. Tiëŋ tïŋ.",
    },

    fr: {
      welcome:     "Bonjour! 👋 Bienvenue sur Migration Pulse Hub. Je suis <strong>ZURI</strong>, votre assistante numérique.\n\nJe peux vous aider pour les événements, les rapports, les partenariats, le sponsoring, la réservation de stands, les demandes médias, le bénévolat, ou le support général.\n\nComment puis-je vous aider aujourd'hui?",
      privacy:     "🔒 Nous collectons uniquement les informations minimales nécessaires pour répondre à votre demande. Veuillez ne pas partager de mots de passe, pièces d'identité ou documents financiers ici.",
      menu_title:  "Veuillez choisir l'objet de votre demande:",
      name_q:      "Quel est votre nom complet?",
      email_q:     "Quelle est votre adresse e-mail?",
      phone_q:     "Quel est votre numéro de téléphone? (inclure l'indicatif pays)",
      country_q:   "Dans quel pays êtes-vous?",
      org_q:       "Quelle est votre organisation ou institution? (tapez 'aucune' si non applicable)",
      message_q:   "Veuillez décrire votre demande en quelques phrases:",
      consent_q:   "Consentez-vous à ce que Migration Pulse Hub utilise vos données pour répondre à cette demande?",
      consent_yes: "Oui, je consens",
      consent_no:  "Non, retour",
      escalate_q:  "Comment souhaitez-vous que nous assurions le suivi?",
      wa_btn:      "📲 Continuer sur WhatsApp",
      email_btn:   "📧 Envoyer par e-mail",
      human_btn:   "🙋 Parler à un humain",
      thanks:      "✅ Merci! Votre demande a été reçue. L'équipe de Migration Pulse Hub vous contactera bientôt.",
      safety_msg:  "⚠️ Il semble que vous soyez dans une situation urgente. Veuillez contacter directement notre équipe maintenant.",
      restart:     "Recommencer",
      back:        "← Retour",
      send:        "Envoyer",
      human_hand:  "Merci. Je vous mets en relation avec l'équipe de Migration Pulse Hub. Choisissez comment vous souhaitez continuer:",
      safety_hand: "🚨 Cela semble urgent. Veuillez contacter notre équipe immédiatement. Si vous êtes en danger physique immédiat, appelez les services d'urgence locaux.",
      field_req:   "Ce champ est obligatoire. Veuillez fournir une réponse.",
    },
  };

  /* ----------------------------------------------------------
     ENQUIRY CATEGORIES
  ---------------------------------------------------------- */
  const CATEGORIES = [
    { id: 'event_reg',    en: '🗓️ Event Registration',        icon: '🗓️' },
    { id: 'refugee_week', en: '🕊️ Refugee Week 2026 Booking',  icon: '🕊️' },
    { id: 'sponsor',      en: '🤝 Sponsorship Enquiry',        icon: '🤝' },
    { id: 'vendor',       en: '🛍️ Vendor / Exhibitor Booking', icon: '🛍️' },
    { id: 'reports',      en: '📄 Reports & Publications',     icon: '📄' },
    { id: 'partner',      en: '🌍 Partnership Enquiry',        icon: '🌍' },
    { id: 'volunteer',    en: '💛 Volunteer Enquiry',           icon: '💛' },
    { id: 'media',        en: '📸 Media Enquiry',              icon: '📸' },
    { id: 'legal',        en: '⚖️ Legal / Protection Enquiry', icon: '⚖️' },
    { id: 'general',      en: '✉️ General Contact',            icon: '✉️' },
    { id: 'tech',         en: '🖥️ Website Technical Issue',    icon: '🖥️' },
    { id: 'human',        en: '🙋 Speak to a Human Now',       icon: '🙋' },
  ];

  /* ----------------------------------------------------------
     CONVERSATION FLOWS (field sequences per category)
  ---------------------------------------------------------- */
  const FLOWS = {
    general: [
      { id:'name',    q:'name_q',    type:'text' },
      { id:'contact', q:'email_q',   type:'text' },
      { id:'country', q:'country_q', type:'text' },
      { id:'message', q:'message_q', type:'text' },
    ],
    event_reg: [
      { id:'name',         q:'name_q',        type:'text' },
      { id:'email',        q:'email_q',        type:'text' },
      { id:'phone',        q:'phone_q',        type:'text' },
      { id:'country',      q:'country_q',      type:'text' },
      { id:'org',          q:'org_q',          type:'text' },
      { id:'attendance',   q:'attendance_q',   type:'choice', opts:'att_options' },
      { id:'sessions',     q:'session_q',      type:'text' },
      { id:'accessibility',q:'access_q',       type:'text' },
      { id:'consent',      q:'consent_q',      type:'consent' },
    ],
    refugee_week: [
      { id:'name',         q:'name_q',         type:'text' },
      { id:'email',        q:'email_q',         type:'text' },
      { id:'phone',        q:'phone_q',         type:'text' },
      { id:'country',      q:'country_q',       type:'text' },
      { id:'org',          q:'org_q',           type:'text' },
      { id:'attendance',   q:'attendance_q',    type:'choice', opts:'att_options' },
      { id:'sessions',     q:'session_q',       type:'text' },
      { id:'accessibility',q:'access_q',        type:'text' },
      { id:'consent',      q:'consent_q',       type:'consent' },
    ],
    sponsor: [
      { id:'org',     q:'org_q',          type:'text' },
      { id:'name',    q:'name_q',         type:'text' },
      { id:'email',   q:'email_q',        type:'text' },
      { id:'phone',   q:'phone_q',        type:'text' },
      { id:'country', q:'country_q',      type:'text' },
      { id:'tier',    q:'sponsor_cat_q',  type:'choice', opts:'spon_opts' },
      { id:'message', q:'message_q',      type:'text' },
    ],
    vendor: [
      { id:'org',      q:'org_q',          type:'text' },
      { id:'name',     q:'name_q',         type:'text' },
      { id:'email',    q:'email_q',        type:'text' },
      { id:'phone',    q:'phone_q',        type:'text' },
      { id:'country',  q:'country_q',      type:'text' },
      { id:'category', q:'vendor_cat_q',   type:'choice', opts:'vendor_opts' },
      { id:'booth',    q:'booth_q',        type:'text' },
      { id:'products', q:'message_q',      type:'text' },
    ],
    reports: [
      { id:'name',    q:'name_q',    type:'text' },
      { id:'contact', q:'email_q',   type:'text' },
      { id:'country', q:'country_q', type:'text' },
      { id:'message', q:'message_q', type:'text' },
    ],
    partner: [
      { id:'org',     q:'org_q',           type:'text' },
      { id:'name',    q:'name_q',          type:'text' },
      { id:'email',   q:'email_q',         type:'text' },
      { id:'phone',   q:'phone_q',         type:'text' },
      { id:'country', q:'country_q',       type:'text' },
      { id:'type',    q:'partner_type_q',  type:'choice', opts:'partner_opts' },
      { id:'message', q:'message_q',       type:'text' },
    ],
    volunteer: [
      { id:'name',    q:'name_q',              type:'text' },
      { id:'email',   q:'email_q',             type:'text' },
      { id:'phone',   q:'phone_q',             type:'text' },
      { id:'country', q:'country_q',           type:'text' },
      { id:'area',    q:'volunteer_area_q',     type:'choice', opts:'vol_opts' },
      { id:'skills',  q:'skills_q',            type:'text' },
    ],
    media: [
      { id:'name',      q:'name_q',        type:'text' },
      { id:'outlet',    q:'media_house_q', type:'text' },
      { id:'email',     q:'email_q',       type:'text' },
      { id:'phone',     q:'phone_q',       type:'text' },
      { id:'deadline',  q:'deadline_q',    type:'text' },
      { id:'request',   q:'interview_q',   type:'text' },
    ],
    legal: [
      { id:'name',    q:'name_q',         type:'text' },
      { id:'contact', q:'safe_contact_q', type:'text' },
      { id:'country', q:'country_q',      type:'text' },
      { id:'issue',   q:'issue_type_q',   type:'choice', opts:'issue_opts' },
      { id:'urgency', q:'urgency_q',      type:'choice', opts:'urgency_opts' },
      { id:'desc',    q:'message_q',      type:'text' },
      { id:'consent', q:'consent_q',      type:'consent' },
    ],
    tech: [
      { id:'name',    q:'name_q',            type:'text' },
      { id:'email',   q:'email_q',           type:'text' },
      { id:'issue',   q:'website_issue_q',   type:'text' },
    ],
  };

  /* ----------------------------------------------------------
     STATE
  ---------------------------------------------------------- */
  let S = {
    lang: 'en',
    step: 'welcome',    // welcome | menu | flow | escalate | done
    category: null,
    flowIdx: 0,
    collected: {},
    isOpen: false,
  };

  /* ----------------------------------------------------------
     DOM REFERENCES (populated in init)
  ---------------------------------------------------------- */
  let dom = {};

  /* ----------------------------------------------------------
     HELPERS
  ---------------------------------------------------------- */
  function t(key) {
    const lang = T[S.lang] || T.en;
    return lang[key] || T.en[key] || key;
  }

  function optArr(key) {
    const lang = T[S.lang] || T.en;
    return lang[key] || T.en[key] || [];
  }

  function genRef() {
    return 'MPH-' + Date.now().toString(36).toUpperCase();
  }

  function isSafe(text) {
    return !SAFETY_PATTERNS.some(p => p.test(text));
  }

  function sanitize(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  function saveState() {
    try {
      localStorage.setItem(CFG.storageKey, JSON.stringify({
        lang: S.lang, collected: S.collected, category: S.category,
      }));
    } catch (_) {}
  }

  /* ----------------------------------------------------------
     UI BUILDERS
  ---------------------------------------------------------- */
  function buildRoot() {
    const root = document.createElement('div');
    root.id = 'zuri-root';
    root.className = 'zuri-root';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'ZURI Chat Assistant');
    root.innerHTML = `
      <!-- Floating button -->
      <button id="zuri-fab" aria-label="Open ZURI chat assistant" title="Chat with ZURI">
        <svg id="zuri-fab-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <svg id="zuri-fab-icon-close" style="display:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        <span class="zuri-badge" id="zuri-badge" aria-hidden="true">1</span>
      </button>

      <!-- Chat window -->
      <div id="zuri-window" role="dialog" aria-modal="true" aria-label="ZURI Chat Assistant">

        <!-- Header -->
        <div class="zuri-header">
          <div class="zuri-avatar" aria-hidden="true">🤝</div>
          <div class="zuri-header-info">
            <div class="zuri-header-name">
              ZURI
              <span class="zuri-online-dot" title="Online"></span>
            </div>
            <div class="zuri-header-sub">Migration Pulse Hub · Digital Assistant</div>
          </div>
          <div class="zuri-header-actions">
            <button class="zuri-header-btn" id="zuri-restart-btn" title="Restart" aria-label="Restart conversation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
              </svg>
            </button>
            <button class="zuri-header-btn" id="zuri-close-btn" title="Close" aria-label="Close chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Language bar -->
        <div class="zuri-lang-bar" id="zuri-lang-bar" role="toolbar" aria-label="Language selector">
          ${Object.entries(LANGS).map(([code, name]) =>
            `<button class="zuri-lang-btn${S.lang===code?' active':''}" data-lang="${code}" aria-pressed="${S.lang===code}">${name}</button>`
          ).join('')}
        </div>

        <!-- Announcement bar -->
        <div class="zuri-announce-bar" id="zuri-announce">
          📣 Refugee Week Kenya 2026 — Registration open! June 15–21, Uhuru Gardens, Nairobi
        </div>

        <!-- Messages -->
        <div id="zuri-messages" role="log" aria-live="polite" aria-label="Chat messages"></div>

        <!-- Progress -->
        <div class="zuri-progress" id="zuri-progress" style="display:none">
          <span class="zuri-progress-step" id="zp1"></span>
          <span class="zuri-progress-step" id="zp2"></span>
          <span class="zuri-progress-step" id="zp3"></span>
          <span class="zuri-progress-step" id="zp4"></span>
          <span class="zuri-progress-step" id="zp5"></span>
        </div>

        <!-- Quick replies -->
        <div class="zuri-quick-replies" id="zuri-replies" aria-label="Quick reply options"></div>

        <!-- Action cards (escalation) -->
        <div class="zuri-action-card" id="zuri-actions" style="display:none"></div>

        <!-- Input -->
        <div class="zuri-input-area">
          <textarea id="zuri-input" placeholder="Type a message…" rows="1" aria-label="Type your message"></textarea>
          <button id="zuri-send" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <!-- Privacy -->
        <div class="zuri-privacy">
          🔒 ZURI is a digital assistant and does not provide legal advice. For urgent matters, use <a href="tel:+254118969209">+254 118 969 209</a>.
        </div>
      </div>
    `;
    document.body.appendChild(root);
  }

  /* ----------------------------------------------------------
     MESSAGE FUNCTIONS
  ---------------------------------------------------------- */
  function addMsg(html, type = 'bot') {
    const msgDiv = document.createElement('div');
    msgDiv.className = `zuri-msg ${type}`;

    if (type === 'bot') {
      msgDiv.innerHTML = `
        <div class="zuri-msg-avatar" aria-hidden="true">Z</div>
        <div class="zuri-msg-bubble">${html}</div>
      `;
    } else if (type === 'user') {
      msgDiv.innerHTML = `
        <div class="zuri-msg-bubble">${sanitize(html)}</div>
      `;
    } else {
      msgDiv.innerHTML = `<div class="zuri-msg-bubble">${html}</div>`;
    }

    dom.messages.appendChild(msgDiv);
    dom.messages.scrollTop = dom.messages.scrollHeight;
    return msgDiv;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'zuri-typing';
    el.id = 'zuri-typing-indicator';
    el.innerHTML = `
      <div class="zuri-msg-avatar" aria-hidden="true">Z</div>
      <div class="zuri-msg-bubble">
        <div class="zuri-dots" aria-label="ZURI is typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    dom.messages.appendChild(el);
    dom.messages.scrollTop = dom.messages.scrollHeight;
    return el;
  }

  function removeTyping() {
    const el = document.getElementById('zuri-typing-indicator');
    if (el) el.remove();
  }

  function botSay(html, delayExtra = 0) {
    return new Promise(resolve => {
      const typingEl = showTyping();
      setTimeout(() => {
        typingEl.remove();
        addMsg(html, 'bot');
        resolve();
      }, CFG.typingMs + delayExtra);
    });
  }

  function clearReplies() {
    dom.replies.innerHTML = '';
    dom.replies.style.display = 'none';
  }

  function showReplies(options) {
    // options = [{label, value, cls}]
    dom.replies.innerHTML = '';
    dom.replies.style.display = 'flex';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = `zuri-quick-reply ${opt.cls || ''}`;
      btn.textContent = opt.label;
      btn.dataset.value = opt.value || opt.label;
      btn.addEventListener('click', () => handleReply(btn.dataset.value, opt.label));
      dom.replies.appendChild(btn);
    });
  }

  function clearActions() {
    dom.actions.innerHTML = '';
    dom.actions.style.display = 'none';
  }

  function showActions(options) {
    // options = [{label, cls, href, icon}]
    dom.actions.innerHTML = '';
    dom.actions.style.display = 'flex';
    options.forEach(opt => {
      if (opt.href) {
        const a = document.createElement('a');
        a.className = `zuri-action-btn ${opt.cls}`;
        a.href = opt.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.innerHTML = `${opt.icon || ''}<span>${opt.label}</span>`;
        dom.actions.appendChild(a);
      } else {
        const btn = document.createElement('button');
        btn.className = `zuri-action-btn ${opt.cls}`;
        btn.innerHTML = `${opt.icon || ''}<span>${opt.label}</span>`;
        btn.addEventListener('click', opt.onClick);
        dom.actions.appendChild(btn);
      }
    });
  }

  function updateProgress() {
    const flow = FLOWS[S.category];
    if (!flow) { dom.progress.style.display = 'none'; return; }
    const total = Math.min(flow.length, 5);
    const done = Math.min(S.flowIdx, total);
    dom.progress.style.display = 'flex';
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`zp${i}`);
      if (!el) continue;
      if (i <= done) el.className = 'zuri-progress-step done';
      else if (i === done + 1) el.className = 'zuri-progress-step active';
      else el.className = 'zuri-progress-step';
    }
  }

  /* ----------------------------------------------------------
     FLOW CONTROL
  ---------------------------------------------------------- */
  async function startFlow(categoryId) {
    S.category = categoryId;
    S.flowIdx = 0;
    S.collected = {};
    S.step = 'flow';

    // Immediate human escalation
    if (categoryId === 'human') {
      await escalateHuman();
      return;
    }

    // Legal flow — show safety notice first
    if (categoryId === 'legal') {
      await botSay(
        `<strong>⚖️ Legal & Protection Enquiry</strong><br><br>` +
        `Thank you for reaching out. Before we continue, please know:<br><br>` +
        `• ZURI is a digital assistant — we do <strong>not</strong> provide legal advice.<br>` +
        `• For <strong>immediate danger</strong>, please call local emergency services.<br>` +
        `• Your information will only be shared with the MPH legal/protection team.<br><br>` +
        `Would you like to continue or speak to a human directly?`
      );
      showReplies([
        { label: 'Continue with form', value: 'continue_legal' },
        { label: '🙋 Speak to human now', value: 'human', cls: 'danger' },
      ]);
      return;
    }

    await askNextField();
  }

  async function askNextField() {
    updateProgress();
    const flow = FLOWS[S.category];
    if (!flow || S.flowIdx >= flow.length) {
      await finishFlow();
      return;
    }

    const field = flow[S.flowIdx];
    clearReplies();
    clearActions();

    const q = t(field.q);

    if (field.type === 'choice') {
      await botSay(q);
      const opts = optArr(field.opts);
      showReplies(opts.map(o => ({ label: o, value: o })));
    } else if (field.type === 'consent') {
      await botSay(q + `<br><br><em style="font-size:.8rem;color:#888;">By clicking 'Yes', you agree that the details provided in this conversation may be used by Migration Pulse Hub solely to respond to your enquiry.</em>`);
      showReplies([
        { label: t('consent_yes'), value: '__consent_yes__', cls: 'amber' },
        { label: t('consent_no'), value: '__consent_no__', cls: '' },
      ]);
    } else {
      await botSay(q);
      dom.input.focus();
    }
  }

  async function finishFlow() {
    S.step = 'escalate';
    clearReplies();
    updateProgress();

    const ref = genRef();
    S.collected._ref = ref;
    S.collected._category = S.category;
    S.collected._lang = S.lang;

    saveState();

    await botSay(t('escalate_q'));

    const waText = buildWAMessage();
    const emailSubject = buildEmailSubject();
    const emailBody = buildEmailBody();

    showActions([
      {
        label: t('wa_btn'),
        cls: 'whatsapp',
        href: `${CFG.whatsapp}?text=${encodeURIComponent(waText)}`,
        icon: `<svg style="width:18px;height:18px;flex-shrink:0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
      },
      {
        label: t('email_btn'),
        cls: 'email',
        href: `mailto:${CFG.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`,
        icon: `<svg style="width:18px;height:18px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
      },
      {
        label: t('human_btn'),
        cls: 'human',
        icon: `<svg style="width:18px;height:18px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        onClick: escalateHuman,
      },
    ]);

    await botSay(t('thanks').replace('{ref}', ref), 300);
    S.step = 'done';
  }

  /* ----------------------------------------------------------
     ESCALATION
  ---------------------------------------------------------- */
  async function escalateHuman() {
    clearReplies();
    await botSay(t('human_hand'));
    showActions([
      {
        label: '📲 WhatsApp — +254 118 969 209',
        cls: 'whatsapp',
        href: `${CFG.whatsapp}?text=${encodeURIComponent('Hello, I would like to speak with a Migration Pulse Hub team member.')}`,
        icon: '',
      },
      {
        label: '📧 Email — info@migrationpulsehub.org',
        cls: 'email',
        href: `mailto:${CFG.email}?subject=Human%20Handover%20Request`,
        icon: '',
      },
    ]);
    S.step = 'done';
  }

  async function escalateSafety(triggeredText) {
    clearReplies();
    addMsg(t('safety_msg'), 'safety');
    showActions([
      {
        label: '🚨 WhatsApp — Immediate Support',
        cls: 'whatsapp',
        href: `${CFG.whatsapp}?text=${encodeURIComponent('URGENT: I need immediate support from Migration Pulse Hub.')}`,
        icon: '',
      },
      {
        label: '📧 Emergency Email',
        cls: 'email',
        href: `mailto:${CFG.email}?subject=URGENT%20Protection%20Concern&body=${encodeURIComponent('URGENT: ' + triggeredText)}`,
        icon: '',
      },
    ]);
    await botSay(t('safety_hand'), 200);
    S.step = 'done';
  }

  /* ----------------------------------------------------------
     PAYLOAD BUILDERS
  ---------------------------------------------------------- */
  function buildWAMessage() {
    const lines = [
      `*Migration Pulse Hub Enquiry*`,
      `Category: ${S.category}`,
      `Ref: ${S.collected._ref || genRef()}`,
      `Language: ${LANGS[S.lang] || S.lang}`,
      `---`,
    ];
    Object.entries(S.collected).forEach(([k, v]) => {
      if (!k.startsWith('_')) lines.push(`${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`);
    });
    return lines.join('\n');
  }

  function buildEmailSubject() {
    const cat = CATEGORIES.find(c => c.id === S.category);
    return `[ZURI] ${cat ? cat.en : 'Enquiry'} — ${S.collected._ref || ''}`;
  }

  function buildEmailBody() {
    const lines = [
      `Migration Pulse Hub — ZURI Chatbot Submission`,
      `Reference: ${S.collected._ref || ''}`,
      `Category: ${S.category}`,
      `Language: ${LANGS[S.lang] || S.lang}`,
      ``,
      `DETAILS:`,
    ];
    Object.entries(S.collected).forEach(([k, v]) => {
      if (!k.startsWith('_')) lines.push(`${k.toUpperCase()}: ${v}`);
    });
    lines.push(``, `Submitted via ZURI Chatbot on ${new Date().toLocaleString()}`);
    return lines.join('\n');
  }

  /* ----------------------------------------------------------
     INPUT HANDLER
  ---------------------------------------------------------- */
  async function handleInput(rawText) {
    const text = (rawText || '').trim();
    if (!text) return;

    // Safety check — always first
    if (!isSafe(text)) {
      addMsg(text, 'user');
      clearReplies();
      await escalateSafety(text);
      return;
    }

    if (S.step === 'welcome') {
      addMsg(text, 'user');
      await showMainMenu();
      return;
    }

    if (S.step === 'menu') {
      // handled by quick reply buttons
      return;
    }

    if (S.step === 'flow') {
      const flow = FLOWS[S.category];
      if (!flow || S.flowIdx >= flow.length) return;
      const field = flow[S.flowIdx];

      if (field.type === 'choice' || field.type === 'consent') return; // use buttons only
      if (!text) {
        await botSay(t('field_req'));
        return;
      }

      addMsg(text, 'user');
      S.collected[field.id] = text;
      S.flowIdx++;
      await askNextField();
    }
  }

  async function handleReply(value, label) {
    clearReplies();

    // Special consent values
    if (value === '__consent_yes__') {
      addMsg(label, 'user');
      const flow = FLOWS[S.category];
      if (flow) { S.collected[flow[S.flowIdx].id] = 'Consented'; }
      S.flowIdx++;
      await askNextField();
      return;
    }
    if (value === '__consent_no__') {
      addMsg(label, 'user');
      await botSay('Understood. Your conversation has not been submitted. You can restart whenever you are ready.');
      showReplies([{ label: t('restart'), value: '__restart__' }]);
      return;
    }
    if (value === '__restart__') {
      restart();
      return;
    }
    if (value === 'human') {
      addMsg(label, 'user');
      await escalateHuman();
      return;
    }
    if (value === 'continue_legal') {
      addMsg(label, 'user');
      await askNextField();
      return;
    }

    // Category selection from main menu
    if (S.step === 'menu') {
      addMsg(label, 'user');
      await startFlow(value);
      return;
    }

    // Choice field in flow
    if (S.step === 'flow') {
      addMsg(label, 'user');
      const flow = FLOWS[S.category];
      if (flow && S.flowIdx < flow.length) {
        S.collected[flow[S.flowIdx].id] = value;
        S.flowIdx++;
        await askNextField();
      }
    }
  }

  /* ----------------------------------------------------------
     MAIN MENU
  ---------------------------------------------------------- */
  async function showMainMenu() {
    S.step = 'menu';
    dom.progress.style.display = 'none';
    clearActions();
    await botSay(t('menu_title'));
    showReplies(CATEGORIES.map(c => ({
      label: c.en,
      value: c.id,
      cls: c.id === 'human' ? 'teal' : c.id === 'legal' ? 'danger' : '',
    })));
  }

  /* ----------------------------------------------------------
     WELCOME
  ---------------------------------------------------------- */
  async function startConversation() {
    dom.messages.innerHTML = '';
    clearReplies();
    clearActions();
    S.step = 'welcome';
    S.category = null;
    S.flowIdx = 0;
    S.collected = {};
    dom.progress.style.display = 'none';

    // Privacy notice first
    addMsg(t('privacy'), 'system');

    // Welcome message
    await botSay(t('welcome'), 200);

    // Jump straight to menu
    await showMainMenu();
  }

  /* ----------------------------------------------------------
     RESTART
  ---------------------------------------------------------- */
  function restart() {
    startConversation();
  }

  /* ----------------------------------------------------------
     LANGUAGE SWITCH
  ---------------------------------------------------------- */
  function setLanguage(code) {
    S.lang = code;
    // Update active button
    document.querySelectorAll('.zuri-lang-btn').forEach(btn => {
      const isActive = btn.dataset.lang === code;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });
    // RTL for Arabic
    const root = document.getElementById('zuri-root');
    root.setAttribute('dir', code === 'ar' ? 'rtl' : 'ltr');
    // Restart in new language
    startConversation();
  }

  /* ----------------------------------------------------------
     TOGGLE WINDOW
  ---------------------------------------------------------- */
  function openChat() {
    S.isOpen = true;
    dom.window.classList.add('visible');
    dom.fab.classList.add('open');
    document.getElementById('zuri-fab-icon-chat').style.display = 'none';
    document.getElementById('zuri-fab-icon-close').style.display = '';
    document.getElementById('zuri-badge').style.display = 'none';
    dom.fab.setAttribute('aria-label', 'Close ZURI chat');
    dom.input.focus();
  }

  function closeChat() {
    S.isOpen = false;
    dom.window.classList.remove('visible');
    dom.fab.classList.remove('open');
    document.getElementById('zuri-fab-icon-chat').style.display = '';
    document.getElementById('zuri-fab-icon-close').style.display = 'none';
    dom.fab.setAttribute('aria-label', 'Open ZURI chat assistant');
  }

  function toggleChat() {
    if (S.isOpen) closeChat();
    else openChat();
  }

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  function init() {
    buildRoot();

    // Cache DOM
    dom.fab      = document.getElementById('zuri-fab');
    dom.window   = document.getElementById('zuri-window');
    dom.messages = document.getElementById('zuri-messages');
    dom.replies  = document.getElementById('zuri-replies');
    dom.actions  = document.getElementById('zuri-actions');
    dom.input    = document.getElementById('zuri-input');
    dom.send     = document.getElementById('zuri-send');
    dom.progress = document.getElementById('zuri-progress');

    // Events
    dom.fab.addEventListener('click', toggleChat);
    document.getElementById('zuri-close-btn').addEventListener('click', closeChat);
    document.getElementById('zuri-restart-btn').addEventListener('click', () => { restart(); });

    // Send button
    dom.send.addEventListener('click', () => {
      const val = dom.input.value;
      dom.input.value = '';
      autoResize();
      handleInput(val);
    });

    // Enter key (Shift+Enter = newline)
    dom.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const val = dom.input.value;
        dom.input.value = '';
        autoResize();
        handleInput(val);
      }
    });

    // Auto-resize textarea
    dom.input.addEventListener('input', autoResize);

    // Language buttons
    document.getElementById('zuri-lang-bar').addEventListener('click', (e) => {
      const btn = e.target.closest('.zuri-lang-btn');
      if (btn && btn.dataset.lang) setLanguage(btn.dataset.lang);
    });

    // Quick replies (delegated — container populated dynamically)
    document.getElementById('zuri-replies').addEventListener('click', (e) => {
      const btn = e.target.closest('.zuri-quick-reply');
      if (btn) handleReply(btn.dataset.value, btn.textContent);
    });

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && S.isOpen) closeChat();
    });

    // Show announcement bar
    const announce = document.getElementById('zuri-announce');
    if (announce) announce.classList.add('show');

    // Start conversation on first open
    dom.fab.addEventListener('click', () => {
      if (S.isOpen && dom.messages.children.length === 0) {
        startConversation();
      }
    }, { once: false });

    // Initialize with conversation ready (start on first open)
    startConversation();
  }

  function autoResize() {
    const el = dom.input;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 90) + 'px';
  }

  /* ----------------------------------------------------------
     PUBLIC API
  ---------------------------------------------------------- */
  return { init, open: openChat, close: closeChat, restart };

})(); // end ZURI IIFE

/* ---- Auto-init on DOMContentLoaded ---- */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ZURI.init);
} else {
  ZURI.init();
}

(function(_G) {
  'use strict';

  // حماية الواجهة ضد اختصارات فحص الكود والنسخ
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', function(e) {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].indexOf(e.key) !== -1) ||
        (e.ctrlKey && ['U', 'S', 'u', 's'].indexOf(e.key) !== -1)
      ) {
        e.preventDefault();
        return false;
      }
    });
  }

  let LG = 'ar';
  try { if (typeof localStorage !== 'undefined') LG = localStorage.getItem('ebda2_lang') || 'ar'; } catch (e) {}
  const tr = p => (Array.isArray(p) ? p[LG === 'ar' ? 0 : 1] : p);
  const esc = s => String(s || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, ''');

  let FX = { EGP: 1, USD: 56.15, SAR: 14.97, AED: 15.29 };
  const SYM = { EGP: ['ج.م', 'EGP'], USD: ['$', 'USD'], SAR: ['ر.س', 'SAR'], AED: ['د.إ', 'AED'] };
  let dispCurr = 'EGP', curPage = 1, activeTab = 'both', partnerParams = null;

  const _S = {
    ans: {},
    assets: ['home_room'],
    assetMeta: { own: 'owned_family', area: 16, util: 'residential_quiet' },
    user: {
      name: '', age: '25-34', edu: 'university', field: 'eng_ind',
      country: 'egypt', envType: 'metro_city', localRaw: 'workshops_markets',
      firstAdopter: 'local_shops_cafes', capEGP: 20000, email: '', token: ''
    },
    out: null,
    ws: { quotes: [], tasks: {}, calc: { c1: 100, c2: 45, c3: 15, c4: 30, c5: 30, price: 310 } }
  };

  const UI = {
    brand: ['اعرف أكثر عن نفسك', 'Know Yourself Better'],
    about: ['اعرف أكثر عن ريادة الأعمال', 'Entrepreneurship & Careers'],
    wsBtn: ['مساحتي الشخصية', 'My Workspace'],
    usdLbl: ['الدولار:', 'USD:'],
    hook: ['اكتشف نفسك، واكتشف مسارات وفرصًا لم تكن تعرف أنها لديك.', 'Discover yourself, and unlock career & venture paths you never knew you had.'],
    next: ['التالي ←', 'Next →'],
    prev: ['→ السابق', '← Back'],
    p5Title: ['المجموعة 5 من 5: بياناتك، قطاعك، وبيئتك', 'Set 5 of 5: Your Sector, Context & Environment'],
    name: ['الاسم', 'Your Name'],
    age: ['الفئة العمرية', 'Age Group'],
    edu: ['المستوى التعليمي', 'Education Level'],
    field: ['مجال الدراسة أو الخبرة أو الاهتمام', 'Study, Experience or Interest Sector'],
    country: ['البلد / النطاق الجغرافي', 'Country / Region'],
    envType: ['طبيعة مدينتك أو منطقتك', 'Area Nature'],
    localRaw: ['أبرز ميزة أو مورد في محيطك', 'Nearest Local Advantage'],
    firstAdopter: ['أقرب شريحة تتعامل معها', 'Closest Target Audience'],
    assetsBox: ['الأصول أو الأدوات المتاحة لديك حاليًا (اضغط للاختيار)', 'Available Assets or Tools (Click to select)'],
    assetOwn: ['حالة الأصل', 'Asset Status'],
    assetArea: ['المساحة التقريبية (م²)', 'Approx. Area (m²)'],
    assetUtil: ['طبيعة المكان', 'Space Readiness'],
    capital: ['الميزانية المتاحة (أدخل 0 إذا كنت تبحث عن وظيفة فقط)', 'Available Budget (Enter 0 if seeking a job only)'],
    capCurr: ['عملة الإدخال', 'Currency'],
    showPlan: ['اكشف مسارك المهني والريادي ←', 'Reveal Career & Venture Paths →'],
    capNote: ['الميزانية المعتمدة للحساب:', 'Approved Budget Cap:'],
    copyWord: ['نسخ', 'Copy'],
    copiedWord: ['تم ✓', 'Copied ✓'],
    editBtn: ['تعديل الإجابات أو القطاع', 'Edit Answers or Sector'],
    tabJobs: ['مسار الوظائف والمهن (5 ترشيحات لعام 2026)', '2026 Career Paths (Top 5 Matches)'],
    tabBiz: ['مسار المشروع المستقل (الدالة المركبة)', 'Composite Venture Path'],
    compassTag: ['تحليل بوصلتك الفطرية (من بصمة وقت فراغك وخبرتك)', 'Your Intrinsic Compass Analysis'],
    readinessJob: ['توجيه الاستعداد: معطياتك الحالية تجعل البدء بوظيفة من المسميات الخمسة أدناه هو الخيار الأذكى لتأمين دخل قوي واكتساب خبرة القطاع أولًا، مع التحضير التدريجي لمشروعك الجانبي.', 'Readiness Note: Starting with one of the 5 matched careers below is your smartest immediate move to build income and industry mastery while preparing your side venture.'],
    readinessBiz: ['توجيه الاستعداد: لديك جاهزية مناسبة لاختبار مشروعك المفصل عبر عينة أولية (MVP)، مع إمكانية الاستفادة من المسميات الوظيفية الخمسة أدناه لتطوير مسارك المهني أو بناء فريقك.', 'Readiness Note: You are well-positioned to test your tailored venture via a lean MVP, while leveraging the 5 matched career roles below.'],
    jobsHeader: ['أفضل 5 مسميات وظيفية تناسب تكوينك في سوق عمل 2026', 'Top 5 Matched Job Titles for Your Profile (2026 Market)'],
    jobSkillLbl: ['مهارة تبدأ بتعلمها خلال 30 يومًا:', '30-Day Entry Skill to Learn:'],
    jobSectorLbl: ['جهات التوظيف في مصر والعالم العربي:', 'Hiring Sectors (Egypt & Arab World):'],
    bizHeader: ['مشروعك المفصل بالدالة المركبة', 'Your Composite-Engine Venture'],
    sec1: ['1. توزيع الميزانية المتاحة', '1. Budget Allocation'],
    colItem: ['البند', 'Item'],
    colAmt: ['المبلغ', 'Amount'],
    sec2: ['2. أول تجربة عملية لاختبار الطلب (MVP)', '2. First Demand Validation Experiment (MVP)'],
    sec3: ['3. أهم مخاطرة يجب الانتباه لها', '3. Key Risk to Watch'],
    sec4: ['4. خطوات التنفيذ الخمس', '4. Five Execution Steps'],
    sec5: ['5. أين تجد الموردين أو الأدوات؟', '5. Where to Find Suppliers & Tools?'],
    sec6: ['6. الإجراءات القانونية والجهات الرسمية', '6. Legal Steps & Official Portals'],
    colStage: ['المرحلة', 'Stage'],
    colReq: ['الإجراء', 'Requirement'],
    colAuth: ['الجهة', 'Authority'],
    openWsTitle: ['افتح مساحتك الشخصية (حاسبة الأرباح + مقارنة الموردين + قائمة المهام)', 'Open Personal Workspace (Calculator + Suppliers + Checklist)'],
    partnerBtn: ['اختبر توافق شريك معك', 'Test Partner Compatibility'],
    openWsBtn: ['افتح مساحتي الشخصية ←', 'Open My Workspace →'],
    welcome: ['أهلًا بك يا', 'Welcome,'],
    copyLink: ['نسخ رابط مساحتي', 'Copy Workspace Link'],
    varCost: ['إجمالي التكلفة المتغيرة للوحدة:', 'Unit Variable Cost:'],
    netMargin: ['صافي هامش المساهمة:', 'Net Contribution Margin:'],
    sellPrice: ['سعر البيع للوحدة', 'Unit Selling Price'],
    quotesTitle: ['2. جدول مقارنة عروض أسعار الموردين', '2. Supplier Quotes Comparison'],
    qName: ['اسم المورد', 'Supplier Name'],
    qArea: ['المنطقة', 'Area'],
    qMat: ['البند / الخامة', 'Item / Material'],
    qPrice: ['سعر الوحدة', 'Unit Price'],
    qMoq: ['أقل كمية MOQ', 'MOQ'],
    qShip: ['تكلفة النقل', 'Shipping'],
    qWaste: ['نسبة الهدر %', 'Waste %'],
    addQuoteBtn: ['+ إضافة العرض', '+ Add Quote'],
    colTotalUnit: ['التكلفة الكلية للوحدة', 'Landed Unit Cost'],
    bestTag: ['الأفضل', 'Best'],
    delBtn: ['حذف', 'Delete'],
    emptyQuotes: ['سجل أول عرض سعر حقيقي من السوق بالأعلى.', 'Log your first market quote above.'],
    tasksTitle: ['3. قائمة مهام الانطلاق', '3. Launch Checklist'],
    backPlan: ['→ العودة إلى النتيجة', '← Back to Results'],
    dlJson: ['تنزيل بياناتي', 'Export JSON'],
    clrData: ['حذف البيانات', 'Reset All']
  };

  // توسيع قائمة القطاعات لتشمل الهندسة، الصناعة، الطاقة، البايو-حيوي، الطب، الفندقة، الخدمات، إلخ.
  const SELECT_OPTS = {
    'in-age': [
      ['18-24', ['18 - 24 سنة (خريج جديد / بداية المسار)', '18 - 24 (Fresh Grad / Early Career)']],
      ['25-34', ['25 - 34 سنة', '25 - 34']],
      ['35-45', ['35 - 45 سنة', '35 - 45']],
      ['46+', ['أكثر من 45 سنة', '45+']]
    ],
    'in-edu': [
      ['literate', ['يقرأ ويكتب / خبرة عملية حرة', 'Basic Literacy / Hands-On Experience']],
      ['basic', ['تعليم أساسي / إعدادي', 'Basic Schooling']],
      ['secondary_vocational', ['ثانوي / دبلوم صناعي أو فني أو فندقي أو زراعي', 'High School / Technical, Industrial or Hotel Diploma']],
      ['university', ['جامعي / دراسات عليا', 'University Degree / Postgrad']]
    ],
    'in-field': [
      ['eng_ind', ['الهندسة، التصنيع، الإنتاج، والمقاولات (ميكانيكا/كهرباء/مدني/صناعي)', 'Engineering, Manufacturing, Production & Construction']],
      ['energy_env', ['الطاقة المتجددة، الكهرباء، المياه، البيئة، والاستدامة', 'Renewable Energy, Power, Water & Sustainability']],
      ['med_biotech', ['الطب، الصيدلة، التكنولوجيا الحيوية (Biotech)، والرعاية الصحية', 'Medicine, Pharmacy, Biotechnology & Healthcare']],
      ['chem_science', ['العلوم الأساسية، الكيمياء، المعامل، والتركيبات الصناعية', 'Chemistry, Lab Sciences & Industrial Formulations']],
      ['agri_food', ['الزراعة، الصناعات الغذائية، الإنتاج الحيوي، والبيطري', 'Agriculture, Food Processing, Bio-Agri & Vet']],
      ['hosp_tourism', ['الفندقة، الضيافة، السياحة، الطهي، وتنظيم الفعاليات', 'Hospitality, Hotels, Tourism, Culinary & Events']],
      ['arts_design', ['الفنون التطبيقية، التصميم، العمارة الداخلية، والإعلام المرئي', 'Applied Arts, Design, Interior Architecture & Media']],
      ['tech_data', ['الحاسبات، البرمجة، الذكاء الاصطناعي، وتحليل البيانات', 'Software, IT, AI & Data Analytics']],
      ['biz_commerce', ['التجارة، الإدارة، المحاسبة، التسويق، وسلاسل الإمداد', 'Business, Finance, Marketing, Trade & Supply Chain']],
      ['services_edu', ['الخدمات المهنية، التعليم، اللغات، القانون، والعلوم الإنسانية', 'Professional Services, Education, Languages & Humanities']]
    ],
    'in-country': [
      ['egypt', ['مصر (القاهرة / الإسكندرية / الأقاليم والمدن الصناعية والسياحية)', 'Egypt']],
      ['gulf', ['السعودية ودول الخليج العربي', 'Saudi Arabia & GCC']],
      ['levant', ['الأردن / الشام / العراق', 'Levant & Iraq']],
      ['maghreb', ['المغرب العربي (المغرب / الجزائر / تونس)', 'North Africa / Maghreb']],
      ['global', ['أي بلد آخر / عمل عن بُعد عابر للحدود', 'Other Country / Remote Global']]
    ],
    'in-env-type': [
      ['metro_city', ['مدينة كبرى أو منطقة صناعية وتجارية', 'Major Metro or Industrial/Commercial City']],
      ['touristic_city', ['مدينة سياحية أو فندقية أو تراثية أو ساحلية', 'Touristic, Hotel, Heritage or Resort City']],
      ['rural_village', ['منطقة زراعية أو ريفية غنية بالمحاصيل والموارد الحيوية', 'Agricultural or Bio-Resource Rural Region']],
      ['border_port_city', ['مدينة ميناء أو محور لوجستي وتجاري', 'Port City or Logistics/Trade Hub']]
    ],
    'in-local-raw': [
      ['workshops_markets', ['قرب من مصانع، ورش إنتاج، وأسواق جملة', 'Factories, Production Workshops & Wholesale Hubs']],
      ['palm_dates_waste', ['وفرة النخيل والتمور والمخلفات الحيوية والخامات البيئية', 'Date Palms, Biomass, Agricultural Waste & Eco-Fibers']],
      ['crops_herbs_farms', ['مزارع محاصيل، نباتات طبية وعطرية، وإنتاج غذائي', 'Farms, Medicinal Plants, Herbs & Food Crops']],
      ['african_coffee_spices', ['تجارة البن، التوابل، الأعشاب، أو الخامات التعدينية', 'Coffee, Spices, Botanicals or Mineral Raw Materials']],
      ['no_special_raw', ['تجمع سكني، طبي، فندقي، أو إداري يطلب خدمات وحلولًا', 'Urban, Medical, Hotel or Corporate Service Hub']]
    ],
    'in-first-adopter': [
      ['local_shops_cafes', ['المصانع، الفنادق، المستشفيات، الكافيهات، والشركات (B2B)', 'Factories, Hotels, Hospitals, Cafes & Companies (B2B)']],
      ['online_consumers', ['الأفراد والعملاء عبر الإنترنت والسوشيال ميديا (B2C)', 'Online Consumers & Social Commerce (B2C)']],
      ['tourists_visitors', ['السياح، النزلاء، المسافرون، والمنتجعات البيئية', 'Tourists, Hotel Guests, Expats & Eco-Lodges']],
      ['village_farmers', ['المزارعون، أصحاب الورش، أو الأسر في محيطي المباشر', 'Local Farmers, Workshop Owners & Neighborhood Families']]
    ],
    'in-asset-own': [
      ['owned_self', ['مِلكي شخصيًا', 'Owned by Me']],
      ['owned_family', ['مِلك للعائلة ومتاح لي', 'Family Owned']],
      ['rented', ['مستأجر / متاح للاستخدام', 'Rented / Accessible']]
    ],
    'in-asset-util': [
      ['residential_quiet', ['مكان سكني هادئ (مكتب / غرفة / بدون ضوضاء)', 'Quiet Residential Space']],
      ['sunny_ventilated', ['مكان مشمس وجيد التهوية (سطح / مزرعة / ساحة)', 'Sunny & Well-Ventilated (Rooftop / Open Yard)']],
      ['commercial_licensed', ['مكان تجاري أو ورشة أو معمل قابل للترخيص', 'Commercial, Workshop or Licensable Premise']]
    ]
  };

  const ASSET_LIST = [
    ['home_room', ['غرفة أو مكتب بالمنزل + حاسوب/هاتف', 'Home Room / Desk + Laptop/Phone']],
    ['roof', ['سطح منزل مشمس أو حديقة', 'Sunny House Rooftop or Garden']],
    ['land', ['أرض زراعية أو ساحة مفتوحة', 'Agricultural or Open Land']],
    ['warehouse', ['مخزن أو غرفة حفظ مستقلة', 'Storage Room or Warehouse']],
    ['workshop', ['ورشة إنتاج أو معمل أو مطبخ تجهيز', 'Workshop, Lab or Prep Space']],
    ['shop_office', ['محل تجاري أو مكتب إداري', 'Commercial Shop or Office']],
    ['vehicle', ['سيارة / فان / وسيلة نقل وتوزيع', 'Car / Van / Service Vehicle']],
    ['none', ['هاتف ذكي أو لابتوب فقط (بدون مكان)', 'Smartphone or Laptop Only (No Space)']]
  ];

  // الأسئلة الـ 12 (في 4 صفحات × 3 أسئلة)
  const QUESTION_PAGES = [
    {
      title: ['المجموعة 1 من 5: بصمة وقت الفراغ والترفيه', 'Set 1 of 5: Leisure & Media Footprint'],
      items: [
        { id: 'q1', q: ['1. أي تجربة ترفيهية تشد انتباهك وتندمج معها أكثر؟', '1. Which entertainment experience absorbs you the most?'], opts: [
          { v: 'cinema', t: ['السينما: الكادر البصري المتقن، الألوان، والتصميم الهندسي للمشهد خلف الكواليس.', 'Cinema: visual framing, color palettes, and behind-the-scenes craft.'] },
          { v: 'theater', t: ['المسرح والفعاليات الحية: طاقة الحضور المباشر، الضيافة، والتفاعل اللحظي مع الناس.', 'Live Theater & Events: real-time human energy, hosting, and stage presence.'] },
          { v: 'mystery', t: ['أفلام الغموض والوثائقيات العلمية: تفكيك الألغاز وفهم الأنظمة والظواهر المعقدة.', 'Mystery & Science Docs: decoding puzzles and complex natural/technical systems.'] },
          { v: 'real_action', t: ['لا تستهويني الفنون الأدائية؛ أفضل الحركة الواقعية، التجارة، أو فك وتركيب الأشياء بيدي.', 'Not into performing arts; I prefer real-world action, trade, or hands-on mechanics.'] }
        ]},
        { id: 'q2', q: ['2. في أوقات فراغك، أي إيقاع تفضله عندما تتابع محتوى أو تتسلى؟', '2. In your free time, which content pace do you naturally prefer?'], opts: [
          { v: 'series', t: ['المسلسلات الطويلة: أستمتع ببناء التفاصيل وتطور الخطوط والعمليات خطوة بخطوة.', 'Long Series: enjoying gradual world-building and steady operational progression.'] },
          { v: 'movies', t: ['الأفلام المكثفة: أفضل المهمة أو القصة التي تبدأ وتُحسم بالكامل في ساعتين.', 'Focused Movies: a complete mission resolved decisively in two hours.'] },
          { v: 'books', t: ['الكتب والمقالات العلمية والتحليلية: أحب التركيز العميق وبناء المعرفة المتخصصة.', 'Books & Technical Reads: quiet concentration and deep specialized knowledge.'] },
          { v: 'tiktok', t: ['المقاطع السريعة (تيك توك / ريلز): ألتقط الفكرة والترند وحركة السوق في ثوانٍ.', 'Short Clips (TikTok/Reels): spotting trends, hooks, and market pulse in seconds.'] }
        ]},
        { id: 'q3', q: ['3. لو تفرغت يومًا كاملًا بلا رقيب، أي نشاط ينسيك الوقت تمامًا؟', '3. On a completely free day, which activity makes you lose track of time?'], opts: [
          { v: 'creator', t: ['تصميم أو تصنيع منتج، أو ابتكار نموذج أو شكل جديد من الصفر.', 'Designing, prototyping, or crafting a new product or concept from scratch.'] },
          { v: 'arbitrageur', t: ['البحث عن فرص بيع وشراء وصفقات وتعاقدات تضاعف العائد المالي.', 'Spotting buy-low/sell-high deals, B2B contracts, and commercial opportunities.'] },
          { v: 'orchestrator', t: ['تنظيم منظومة عمل، أو إدارة تشغيل مكان/فندق/خط إنتاج بدقة وانضباط.', 'Running a tight operation, facility, hospitality venue, or production line smoothly.'] },
          { v: 'strategist', t: ['تحليل البيانات، أو البحث في معمل/مختبر، أو برمجة نظام يحل مشكلة معقدة.', 'Analyzing data, experimenting in a lab, or engineering a smart technical system.'] }
        ]}
      ]
    },
    {
      title: ['المجموعة 2 من 5: دورك المبكر والوسيط العملي', 'Set 2 of 5: Early Role & Working Medium'],
      items: [
        { id: 'q4', q: ['4. أيام المدرسة أو الجامعة أو في بداياتك، ما الدور الذي كنت تجد نفسك فيه تلقائيًا؟', '4. In school, university clubs, or early projects, which role did you naturally take?'], opts: [
          { v: 'role_design', t: ['التصميم البصري، الرسم الهندسي/الفني، تنسيق المكان، أو إخراج الواجهة.', 'Visual/CAD design, spatial styling, magazine layout, or art direction.'] },
          { v: 'role_events', t: ['تنظيم الرحلات والفعاليات، استقبال الضيوف، وقيادة الفرق الميدانية.', 'Organizing trips/events, hosting guests, and leading on-ground teams.'] },
          { v: 'role_science', t: ['التجارب المعملية والحيوية، البحث العلمي، أو تبسيط وشرح المواد الدقيقة.', 'Lab & bio-experiments, scientific research, or explaining complex subjects.'] },
          { v: 'role_sales', t: ['التفاوض مع الموردين، الشراء بأفضل سعر، أو جلب الرعاة والعملاء.', 'Negotiating with vendors, sourcing deals, or closing sponsors and clients.'] },
          { v: 'role_tech', t: ['تركيب وإصلاح المعدات والماكينات، حسابات الطاقة والتكاليف، أو البرمجة.', 'Fixing machinery/electronics, energy & cost calculations, or coding systems.'] }
        ]},
        { id: 'q5', q: ['5. أي وسيط عملي ترتاح للتعامل معه أكثر في يومك المهني؟', '5. Which medium do you enjoy working with most in your daily work?'], opts: [
          { v: 'mat_gloss', t: ['الماكينات، المعدات الهندسية، أنظمة الطاقة، والمعادن الدقيقة.', 'Machinery, engineering systems, solar/power equipment, and precision metals.'] },
          { v: 'mat_liquid', t: ['المعامل الحيوية والطبية، الكيمياء، المستخلصات، والتركيبات الدوائية/التجميلية.', 'Biotech & medical labs, chemistry, extracts, and pharmaceutical/cosmetic formulas.'] },
          { v: 'mat_bio_exp', t: ['الضيافة والفندقة، السياحة، الأغذية والمشروبات، أو الزراعة والبيئة.', 'Hospitality, hotels, tourism experiences, F&B, or agriculture and environment.'] },
          { v: 'mat_warm', t: ['المنتجات المصنعة، خطوط التغليف، الأثاث، الجلود، والسلع الملموسة.', 'Manufactured goods, packaging lines, furniture, leather, and tactile products.'] },
          { v: 'mat_digital', t: ['الشاشات، البرمجيات، التصميم الرقمي، الأتمتة، والبيانات والمالية.', 'Screens, software, digital design, AI automation, and financial/data systems.'] }
        ]},
        { id: 'q6', q: ['6. كيف تشعر لو جلست في مكتب أو مكان مغلق واحد طوال اليوم؟', '6. How do you feel sitting in one closed room or office all day?'], opts: [
          { v: 'loc_kinetic', t: ['أختنق من الجلوس؛ طاقتي في المواقع الميدانية، المصانع، الفنادق، أو السفر والزيارات.', 'Suffocated! I thrive on-site in factories, hotels, hospitals, field projects, or travel.'] },
          { v: 'loc_stationary', t: ['أرتاح في معملي أو مكتبي أو ورشتي المنظمة أعمل داخلها بتركيز عميق.', 'Comfortable! I love working deeply inside my organized lab, studio, or office.'] },
          { v: 'loc_hybrid', t: ['أفضل الدمج المرن بين التخطيط المكتبي والنزول الميداني عند الحاجة.', 'Hybrid: combining desk planning/design with targeted field or client visits.'] }
        ]}
      ]
    },
    {
      title: ['المجموعة 3 من 5: أسلوب التعلم وحدود الاستنزاف', 'Set 3 of 5: Learning Style & Friction Points'],
      items: [
        { id: 'q7', q: ['7. عندما تتعلم تقنية أو صنعة جديدة، كيف تتقنها أسرع؟', '7. When learning a new technical or professional skill, how do you master it fastest?'], opts: [
          { v: 'learn_trial', t: ['التجربة العملية المباشرة باليد وفك وتركيب النماذج والقوالب.', 'Hands-on prototyping, trial, and assembling working models.'] },
          { v: 'learn_people', t: ['النزول للمصنع أو الفندق أو السوق والتعلم من المهندسين والخبراء الممارسين.', 'On-site immersion in the factory, hotel, or market alongside practitioners.'] },
          { v: 'learn_study', t: ['دراسة الأكواد القياسية والأبحاث العلمية والمعادلات وتطبيقها بدقة.', 'Studying standard codes, scientific papers, and exact protocols.'] }
        ]},
        { id: 'q8', q: ['8. ما أكثر عائق كان يجعلك تتردد أو تشعر بالحيرة المهنية؟', '8. What caused you the most career hesitation or confusion before?'], opts: [
          { v: 'blk_math', t: ['عدم معرفة المسميات الوظيفية الحديثة التي تناسب طبيعتي خارج القوالب التقليدية.', 'Not knowing modern job titles that fit my nature outside traditional stereotypes.'] },
          { v: 'blk_sell', t: ['الحرج من البيع التجاري المباشر أو تسويق نفسي وخدماتي.', 'Discomfort with aggressive selling or self-promotion.'] },
          { v: 'blk_capital', t: ['قلة رأس المال للبدء بمشروع أو الخوف من تجميد المدخرات.', 'Limited starting capital or fear of locking savings in dead inventory.'] },
          { v: 'blk_perf', t: ['تعدد اهتماماتي بين أكثر من مجال والبحث عن المسار الأعلى قيمة.', 'Having multi-disciplinary interests and seeking the highest-value path.'] }
        ]},
        { id: 'q9', q: ['9. أي مهمة يومية تستنزف طاقتك وتفضل الابتعاد عنها؟', '9. Which daily task drains your energy the most?'], opts: [
          { v: 'hate_retail', t: ['الفصال اليومي المتكرر مع الزبائن الأفراد على مبيعات التجزئة الصغيرة.', 'Petty daily haggling with walk-in retail consumers.'] },
          { v: 'hate_factory', t: ['التشغيل اليدوي الروتيني المتكرر بلا إبداع أو تطوير.', 'Mindless repetitive manual labor without problem-solving or design.'] },
          { v: 'hate_field', t: ['اللف العشوائي في الشوارع والزحام بدون مواعيد أو عقود محددة.', 'Random door-to-door street commuting without scheduled B2B appointments.'] },
          { v: 'hate_screen', t: ['الجلوس الصامت المعزول أمام الشاشات والجداول طوال النهار بلا تفاعل.', 'Sitting isolated in front of screens all day with zero human or physical interaction.'] }
        ]}
      ]
    },
    {
      title: ['المجموعة 4 من 5: هدفك الحالي وجاهزية ريادة الأعمال', 'Set 4 of 5: Current Goal & Readiness'],
      items: [
        { id: 'q10', q: ['10. ما الهدف الأهم الذي تبحث عنه في هذه المرحلة؟', '10. What is your primary goal at this stage?'], opts: [
          { v: 'goal_job', t: ['التركيز على مسار وظيفي قوي في سوق 2026 يمنحني دخلًا وخبرة متخصصة.', 'Focusing on a high-growth 2026 career path that builds strong income and expertise.'] },
          { v: 'goal_biz', t: ['تأسيس مشروع خاص أو مكتب خدمات/تصنيع مستقل.', 'Launching an independent venture, micro-factory, or specialized service agency.'] },
          { v: 'goal_both', t: ['رؤية المسارين معًا: أفضل الوظائف المناسبة لي + مشروع ينمو بالتدريج.', 'Seeing both: my best-fit 2026 career roles + a tailored venture path.'] }
        ]},
        { id: 'q11', q: ['11. لو عملت في تأسيس مشروعك لمدة 3 أشهر قبل تحقيق صافي ربح، ما وضعك المالي؟', '11. If you worked on a new venture for 3 months before seeing net profit, what is your status?'], opts: [
          { v: 'runway_ok', t: ['مصاريف معيشتي مغطاة بأمان وأستطيع التركيز على التأسيس.', 'My living expenses are safely covered during the launch phase.'] },
          { v: 'runway_tight', t: ['أحتاج دخلًا شهريًا مستمرًا؛ لذا يفضل أن يبدأ المشروع بجانب وظيفة.', 'I need steady monthly income; my venture should start alongside a career role.'] },
          { v: 'runway_no', t: ['لا أتحمل أي مخاطرة مالية الآن؛ الأولوية لوظيفة قوية أو خدمة بلا تكلفة تأسيس.', 'Zero financial risk tolerance now; priority is a strong job or zero-capex service.'] }
        ]},
        { id: 'q12', q: ['12. كيف تفضل إدارة المهام التنفيذية التي تقع خارج تخصصك؟', '12. How do you prefer handling operational tasks outside your specialty?'], opts: [
          { v: 'mode_outsource', t: ['التعاقد مع مصانع/ورش خارجية بالقطعة واستخدام أدوات ذكية جاهزة.', 'Outsource manufacturing/logistics to external plants and use automated tools.'] },
          { v: 'mode_partner', t: ['العمل ضمن فريق متعدد التخصصات أو مع شريك يكمل الجانب التجاري/الفني.', 'Collaborate within a cross-functional team or with a complementary partner.'] },
          { v: 'mode_hire', t: ['الإشراف المباشر والاستعانة بفنيين ومنفذين باليومية أو العمولة.', 'Supervise directly and hire technicians or reps on daily/commission terms.'] }
        ]}
      ]
    }
  ];

  // =========================================================================
  // قاعدة بيانات الوظائف الشاملة لعام 2026 (52 مسمى وظيفيًا في 10 قطاعات)
  // [id, sectors[], cores[], leisures[], roles[], mats[], mobs[], avoidHate, arTitle, enTitle, why[ar,en], skill[ar,en], sector[ar,en]]
  // =========================================================================
  const JOBS_DB_2026 = [
    // --- 1. القطاع الهندسي والصناعي (Engineering, Manufacturing & Industrial) ---
    ['j01', ['eng_ind','arts_design'], ['creator','strategist'], ['cinema','mystery'], ['role_design','role_tech'], ['mat_gloss','mat_warm'], ['loc_stationary','loc_hybrid'], 'hate_field',
      'مهندس تصميم وتطوير منتجات صناعية (CAD/CAM & R&D)', 'Industrial Product Design & CAD/CAM Engineer',
      ['تجمع بين عينك التصميمية البصرية والتفكير الهندسي لتحويل الأفكار إلى قوالب ومنتجات قابلة للتصنيع الكمي.', 'Blends your visual framing eye with engineering precision to turn concepts into manufacturable molds and products.'],
      ['إتقان SolidWorks أو Fusion 360 وتصميم 3 نماذج قابلة للطباعة ثلاثية الأبعاد أو حقن البلاستيك/تشكيل المعادن.', 'Master SolidWorks/Fusion 360 and design 3 DFM (Design for Manufacturing) prototypes.'],
      ['مصانع الأجهزة المنزلية، الأثاث، القوالب (الاسطمبات)، والصناعات الهندسية والسيارات في مصر والخليج.', 'Appliance, furniture, mold-making, and automotive/engineering plants across Egypt & GCC.']
    ],
    ['j02', ['eng_ind','tech_data','energy_env'], ['strategist','orchestrator'], ['mystery','series'], ['role_tech'], ['mat_gloss','mat_digital'], ['loc_hybrid','loc_kinetic'], 'hate_retail',
      'مهندس أتمتة صناعية وتحكم آلي (PLC / SCADA & Robotics)', 'Industrial Automation & PLC/SCADA Engineer',
      ['تستثمر شغفك بفهم الأنظمة المعقدة في برمجة وربط خطوط الإنتاج الآلية لتعمل بدقة وأمان.', 'Channels your system-decoding mindset into programming automated production lines and smart sensors.'],
      ['احتراف برمجة وحدات PLC (Siemens/Allen-Bradley) وشاشات HMI وأنظمة التحكم الصناعي.', 'Master Siemens/Allen-Bradley PLC programming, HMI interfaces, and industrial IoT sensors.'],
      ['المصانع الغذائية والدوائية، محطات المياه والطاقة، ومدن العاشر من رمضان والعبور وبرج العرب والجبيل.', 'Food/pharma plants, water/power stations, and industrial zones in 10th of Ramadan, Borg El-Arab & GCC.']
    ],
    ['j03', ['eng_ind','biz_commerce'], ['orchestrator','strategist'], ['series','books'], ['role_tech','role_events'], ['mat_gloss','mat_warm'], ['loc_stationary','loc_hybrid'], 'hate_retail',
      'مهندس تخطيط إنتاج وتطوير صناعي رشيق (Lean & Six Sigma)', 'Production Planning & Lean Manufacturing Engineer',
      ['توظف نفسك الطويل وحبك لترتيب الكواليس في ضبط جداول التشغيل وتقليل الهدر ورفع إنتاجية المصنع.', 'Applies your long-term operational discipline to optimize factory schedules, eliminate waste, and boost yield.'],
      ['الحصول على الحزام الأخضر في Lean Six Sigma وإتقان تخطيط الموارد الصناعية (MRP / SAP).', 'Earn Lean Six Sigma Green Belt and master Manufacturing Resource Planning (MRP/SAP).'],
      ['كبرى المجموعات الصناعية، مصانع النسيج والملابس التصديرية، والصناعات الهندسية والغذائية.', 'Major industrial groups, export textile/apparel plants, and FMCG manufacturers.']
    ],
    ['j04', ['eng_ind','arts_design'], ['creator','orchestrator','strategist'], ['cinema','series'], ['role_design','role_tech'], ['mat_digital','mat_gloss'], ['loc_stationary','loc_hybrid'], 'hate_field',
      'مهندس نمذجة معلومات المباني والتوائم الرقمية (BIM Coordinator)', 'BIM & Digital Twin Engineering Specialist',
      ['تبني المشروعات الهندسية والمعمارية كاملة على الحاسوب وتكشف التعارضات قبل وضع طوبة واحدة في الموقع.', 'Builds full 3D digital twins of construction/industrial projects to resolve clashes before on-site execution.'],
      ['إتقان Revit وNavisworks وإدارة تنسيق القطاعات الهندسية (MEP / Structural / Arch).', 'Master Revit, Navisworks, and multi-disciplinary clash detection (MEP/Structural).'],
      ['شركات الاستشارات الهندسية الكبرى، المطورون العقاريون، والمشروعات القومية والخليجية عن بُعد.', 'Top engineering consultancies, real estate developers, and regional mega-projects (on-site or remote).']
    ],
    ['j05', ['eng_ind','energy_env'], ['orchestrator','arbitrageur'], ['real_action','movies'], ['role_tech','role_events'], ['mat_gloss'], ['loc_kinetic','loc_hybrid'], 'hate_screen',
      'مهندس اعتمادية وصيانة وقائية للمعدات والخطوط', 'Reliability & Preventive Maintenance Engineer',
      ['تبتعد عن رتابة المكاتب وتقود جاهزية الماكينات والمعدات الثقيلة لمنع الأعطال المفاجئة المكلفة.', 'Steps away from desk isolation to keep heavy machinery and production lines running with zero unplanned downtime.'],
      ['تعلم الصيانة التنبؤية (تحليل الاهتزازات والكاميرات الحرارية) وأنظمة إدارة الصيانة (CMMS).', 'Learn predictive maintenance (vibration/thermal diagnostics) and CMMS software.'],
      ['مصانع الأسمنت والحديد والبتروكيماويات، خطوط الإنتاج، وأساطيل النقل والمعدات.', 'Petrochemicals, steel/cement plants, heavy manufacturing, and fleet operations.']
    ],
    ['j06', ['eng_ind','biz_commerce','energy_env'], ['arbitrageur','performer'], ['theater','movies','tiktok'], ['role_sales','role_tech'], ['mat_gloss'], ['loc_kinetic','loc_hybrid'], 'hate_screen',
      'مهندس مبيعات فنية وتطوير مشروعات صناعية (B2B Technical Sales)', 'B2B Technical Sales & Industrial Solutions Engineer',
      ['تدمج فهمك الهندسي مع طاقة التفاوض والحركة لإغلاق عقود توريد معدات وخطوط إنتاج بعمولات ضخمة.', 'Combines engineering credibility with interpersonal persuasion to close high-ticket B2B machinery and project deals.'],
      ['إتقان إعداد العروض الفنية والمالية (Techno-Commercial Proposals) وحساب العائد على الاستثمار للمصانع.', 'Master techno-commercial bidding, tender specs, and ROI calculations for B2B buyers.'],
      ['وكلاء الماكينات والمعدات الصناعية، شركات الكيمياويات الهندسية، وأنظمة التكييف المركزي والطاقة.', 'Industrial machinery dealers, HVAC/MEP contractors, and engineering solution providers.']
    ],

    // --- 2. قطاع الطاقة المتجددة والبيئة والاستدامة (Energy, Renewables & Sustainability) ---
    ['j07', ['energy_env','eng_ind'], ['creator','strategist','orchestrator'], ['mystery','movies','real_action'], ['role_tech'], ['mat_gloss','mat_digital'], ['loc_hybrid','loc_kinetic'], 'hate_retail',
      'مهندس تصميم وتنفيذ محطات الطاقة الشمسية والهجينة (Solar PV Engineer)', 'Solar PV & Hybrid Energy Systems Engineer',
      ['تشارك في أحد أسرع القطاعات نموًا في مصر والمنطقة عبر تصميم محطات توفر ملايين الجنيهات من فواتير الكهرباء.', 'Designs solar and hybrid power plants that slash electricity bills for factories, farms, and resorts.'],
      ['احتراف برنامج PVsyst وAutoCAD الكهربائي وحسابات الأحمال والربط على الشبكة (On-Grid / Off-Grid).', 'Master PVsyst, electrical CAD sizing, inverter selection, and grid-tie/off-grid battery design.'],
      ['شركات الطاقة الشمسية (EPC)، المزارع الكبرى، المنتجعات السياحية، والمناطق الصناعية.', 'Solar EPC contractors, agribusinesses, eco-resorts, and industrial facilities.']
    ],
    ['j08', ['energy_env','eng_ind','chem_science'], ['strategist','orchestrator'], ['books','mystery'], ['role_science','role_tech'], ['mat_digital','mat_gloss'], ['loc_hybrid','loc_stationary'], 'hate_retail',
      'أخصائي تدقيق كفاءة الطاقة والمباني الخضراء (Energy & LEED Auditor)', 'Energy Efficiency & Green Building (LEED) Specialist',
      ['تحلل استهلاك المصانع والفنادق والمباني الكبرى لتصميم حلول تخفض استهلاك الطاقة بنسبة 20% إلى 40%.', 'Audits factories, hotels, and commercial towers to cut energy waste by 20–40% and achieve green certifications.'],
      ['دراسة معايير ISO 50001 لإدارة الطاقة أو شهادة LEED Green Associate وأدوات الفحص الحراري.', 'Study ISO 50001 Energy Management, LEED/EDGE standards, and power-quality auditing.'],
      ['المكاتب الاستشارية الهندسية، الفنادق العالمية، المصانع التصديرية، والجهات التمويلية الخضراء.', 'Engineering consultancies, international hotel chains, export factories, and green-finance projects.']
    ],
    ['j09', ['energy_env','agri_food','chem_science'], ['creator','orchestrator','arbitrageur'], ['real_action','series'], ['role_science','role_tech'], ['mat_bio_exp','mat_warm'], ['loc_kinetic','loc_hybrid'], 'hate_screen',
      'أخصائي الاقتصاد الدائري وتدوير المخلفات الحيوية والصناعية (Waste-to-Value)', 'Circular Economy & Biomass Upcycling Specialist',
      ['تحول المخلفات الزراعية والصناعية المهدرة إلى وقود بديل، أسمدة عضوية، أو خامات صناعية عالية الربحية.', 'Transforms agricultural and industrial waste streams into bio-fertilizers, alternative fuels, or eco-materials.'],
      ['تعلم تكنولوجيا الكومبوست الهوائي، الفحم الحيوي (Biochar)، والبدائل الصناعية من ألياف النخيل والمحاصيل.', 'Learn bioconversion processes, biochar/composting tech, and industrial waste valorization.'],
      ['شركات تدوير المخلفات، مصانع الأسمنت والطاقة، المشروعات الزراعية الكبرى، ومبادرات البيئة.', 'Waste-to-energy firms, agro-industrial estates, eco-material startups, and environmental agencies.']
    ],
    ['j10', ['energy_env','biz_commerce','chem_science'], ['strategist'], ['books','mystery'], ['role_science','role_tech'], ['mat_digital'], ['loc_stationary','loc_hybrid'], 'hate_field',
      'محلل البصمة الكربونية وتقارير الاستدامة والتصدير الأخضر (ESG & Carbon Analyst)', 'ESG & Carbon Footprint Compliance Analyst',
      ['مهنة حديثة جدًا ومطلوبة بقوة لأن المصانع المصدرة لأوروبا والخليج أصبحت ملزمة بحساب بصمتها الكربونية (CBAM).', 'High-demand 2026 role helping exporters and corporations measure carbon footprints (CBAM/ESG) to access global markets.'],
      ['إتقان بروتوكول الغازات الدفيئة (GHG Protocol) ومعايير ISO 14064 وتقارير الاستدامة.', 'Master the GHG Protocol, ISO 14064 carbon accounting, and EU CBAM compliance reporting.'],
      ['المصانع المصدرة لأوروبا، البنوك والمؤسسات المالية، شركات الاستشارات، وشركات البورصة.', 'Export manufacturers, banks, sustainability consultancies, and listed corporations.']
    ],
    ['j11', ['energy_env','chem_science','eng_ind'], ['orchestrator','strategist'], ['series','mystery'], ['role_science','role_tech'], ['mat_liquid','mat_gloss'], ['loc_hybrid','loc_kinetic'], 'hate_retail',
      'مهندس/أخصائي معالجة وتحلية المياه والعمليات البيئية', 'Water Treatment & Desalination Process Specialist',
      ['تدير وتصمم محطات تحلية المياه ومعالجة الصرف الصناعي للفنادق والمصانع والمزارع.', 'Designs and operates RO desalination and industrial wastewater treatment plants for resorts and factories.'],
      ['إتقان تصميم محطات التناضح العكسي (RO) والتحاليل الكيميائية والميكروبيولوجية للمياه.', 'Master Reverse Osmosis (RO) system sizing, membrane dosing chemistry, and water quality testing.'],
      ['شركات معالجة المياه، المنتجعات السياحية الساحلية، المدن الجديدة، والمصانع الكبرى.', 'Water tech companies, Red Sea/North Coast resorts, new cities, and industrial plants.']
    ],

    // --- 3. القطاع البايو-حيوي والطبي والصحي (Biotech, Medical, Pharma & Healthcare) ---
    ['j12', ['med_biotech','chem_science','agri_food'], ['strategist','creator'], ['mystery','books'], ['role_science'], ['mat_liquid'], ['loc_stationary'], 'hate_field',
      'أخصائي بحث وتطوير العمليات الحيوية والتكنولوجيا الحيوية (Bioprocess & Biotech R&D)', 'Biotech R&D & Bioprocess Development Specialist',
      ['تعمل في قلب المختبرات الحديثة لتطوير المستخلصات الحيوية، الإنزيمات، اللقاحات، أو المركبات العلاجية.', 'Works at the forefront of modern labs developing biologics, enzymes, diagnostics, or bioactive extracts.'],
      ['إتقان تقنيات التخمير الحيوي (Fermentation)، زراعة الخلايا، الكروماتوجرافيا (HPLC)، ومعايير GLP/GMP.', 'Master upstream/downstream bioprocessing, PCR/HPLC analytics, and GLP/GMP lab standards.'],
      ['شركات التكنولوجيا الحيوية، مصانع المستحضرات الحيوية واللقاحات، والمراكز البحثية في مصر والعالم.', 'Biotech firms, vaccine/biologics plants, reference labs, and R&D centers.']
    ],
    ['j13', ['med_biotech','chem_science'], ['creator','strategist'], ['cinema','books'], ['role_science','role_design'], ['mat_liquid'], ['loc_stationary','loc_hybrid'], 'hate_field',
      'أخصائي تطوير التركيبات الدوائية والتجميلية العلاجية (Dermocosmetic Formulator)', 'Pharmaceutical & Dermocosmetic Formulation Scientist',
      ['تبتكر تركيبات الكريمات، السيروم، والمستحضرات الطبية وتضبط قوامها وثباتها وفعاليتها قبل التصنيع الكمي.', 'Formulates therapeutic skincare and pharmaceutical products, perfecting rheology, stability, and efficacy.'],
      ['دراسة علم انسيابية القوام (Rheology)، المواد الفعالة، واختبارات الثبات المتسارع واشتراطات هيئة الدواء.', 'Master cosmetic/pharma rheology, active delivery systems, stability testing, and EDA regulations.'],
      ['مصانع الأدوية ومستحضرات التجميل الطبي، شركات التصنيع لدى الغير (Toll)، ومعامل التطوير.', 'Pharma & dermocosmetic factories, toll-manufacturing plants, and R&D formulation labs.']
    ],
    ['j14', ['med_biotech','tech_data'], ['strategist'], ['mystery','books'], ['role_science','role_tech'], ['mat_digital'], ['loc_stationary'], 'hate_field',
      'أخصائي المعلوماتية الحيوية وتحليل البيانات الطبية (Bioinformatics & Clinical Data)', 'Bioinformatics & Clinical Trial Data Analyst',
      ['تجمع بين الخلفية البيولوجية/الطبية وتحليل البيانات والبرمجة، وهي من أعلى المهن العلمية دخلًا وطلبًا عالميًا.', 'Bridges biology/medicine with data science and Python/R—one of the highest-value global scientific careers.'],
      ['تعلم Python أو R لتحليل البيانات الجينية والسريرية وإدارة قواعد بيانات الأبحاث الطبية (CDISC).', 'Learn Python/R for genomic & clinical data analysis and biostatistics.'],
      ['شركات الأبحاث السريرية العالمية (CROs)، شركات الجينوم والـ Biotech، والمستشفيات البحثية والعمل عن بُعد.', 'Global Clinical Research Organizations (CROs), genomics startups, and remote biotech teams.']
    ],
    ['j15', ['med_biotech','eng_ind'], ['performer','arbitrageur','orchestrator'], ['theater','movies'], ['role_science','role_sales','role_tech'], ['mat_gloss','mat_liquid'], ['loc_kinetic','loc_hybrid'], 'hate_screen',
      'أخصائي تطبيقات سريرية ودعم فني للأجهزة الطبية والمعملية (Clinical Application Specialist)', 'Biomedical & Lab Clinical Application Specialist',
      ['بدل المندوب التقليدي، تعمل كخبير علمي/هندسي يدرب الأطباء والمعامل على تشغيل الأجهزة الطبية والحيوية الحديثة.', 'Instead of routine sales, act as the technical expert training doctors and labs on advanced medical/biotech analyzers.'],
      ['فهم تكنولوجيا أجهزة التحاليل والأشعة (IVD / Imaging) ومهارات العرض والتدريب العملي للأطباء.', 'Master IVD/biomedical analyzer workflows, troubleshooting, and clinical training presentation.'],
      ['الوكلاء والشركات العالمية للأجهزة الطبية والمعملية والحيوية في مصر والخليج.', 'Multinational medical device, diagnostics (IVD), and lab equipment distributors in Egypt & GCC.']
    ],
    ['j16', ['med_biotech','services_edu'], ['orchestrator','strategist'], ['series','books'], ['role_science','role_events'], ['mat_digital','mat_bio_exp'], ['loc_hybrid','loc_stationary'], 'hate_retail',
      'أخصائي جودة الرعاية الصحية واعتماد المستشفيات (Healthcare Quality & JCI)', 'Healthcare Quality & Patient Safety Specialist',
      ['تقود تنظيم العمليات الطبية والإدارية داخل المستشفيات والمراكز الطبية لضمان سلامة المرضى والاعتماد الدولي.', 'Designs clinical workflows and safety protocols in hospitals to achieve GAHAR/JCI accreditation.'],
      ['دراسة معايير الاعتماد المصرية (GAHAR) والدولية (JCI) والتحضير لشهادة CPHQ في الجودة الصحية.', 'Study GAHAR/JCI accreditation standards and prepare for the CPHQ healthcare quality credential.'],
      ['المستشفيات الخاصة والدولية، سلاسل المعامل، شركات التأمين الطبي، ومشروعات التأمين الصحي الشامل.', 'Private hospital groups, diagnostic chains, health-tech platforms, and insurance networks.']
    ],
    ['j17', ['med_biotech','hosp_tourism','services_edu'], ['performer','orchestrator','arbitrageur'], ['theater','movies'], ['role_events','role_sales'], ['mat_bio_exp','mat_digital'], ['loc_hybrid','loc_kinetic'], 'hate_factory',
      'منسق السياحة العلاجية وخدمات المرضى الدوليين (Medical Tourism Coordinator)', 'International Patient & Medical Tourism Coordinator',
      ['تدمج المعرفة الطبية بمهارات الضيافة والتنظيم لإدارة رحلة المرضى العرب والأجانب القادمين للعلاج والاستشفاء.', 'Combines healthcare knowledge with hospitality to manage end-to-end treatment journeys for international patients.'],
      ['تطوير مهارات التواصل الطبي متعدد اللغات، تنسيق ملفات المرضى، وبناء شراكات مع المستشفيات والفنادق.', 'Medical communication, patient case coordination, and hospital-hotel partnership management.'],
      ['المستشفيات الكبرى، مراكز جراحات العيون والأسنان والتجميل، وشركات السياحة العلاجية.', 'Specialized medical centers (dental, eye, cosmetic, orthopedic) and medical tourism agencies.']
    ],

    // --- 4. القطاع الفندقي والسياحي والضيافة والفعاليات (Hospitality, Hotels, Tourism & Events) ---
    ['j18', ['hosp_tourism','biz_commerce','tech_data'], ['strategist','arbitrageur'], ['mystery','movies','tiktok'], ['role_sales','role_tech'], ['mat_digital'], ['loc_stationary','loc_hybrid'], 'hate_field',
      'مدير إيرادات وتسعير ديناميكي للفنادق والمنتجعات (Hotel Revenue Manager)', 'Hotel Revenue & Dynamic Pricing Manager',
      ['واحدة من أرفع الوظائف الفندقية دخلًا؛ تدير خوارزميات تسعير الغرف ومنصات الحجز العالمية (Booking/Expedia) لتعظيم أرباح الفندق.', 'One of hospitality’s highest-paid analytical roles: dynamically pricing rooms across OTAs to maximize RevPAR.'],
      ['إتقان مؤشرات الأداء الفندقي (RevPAR, ADR, Occupancy) وإدارة أنظمة التوزيع (Channel Managers & PMS).', 'Master RevPAR/ADR analytics, OTA channel management, and hotel PMS forecasting.'],
      ['الفنادق والمنتجعات العالمية، شركات إدارة الشقق الفندقية، ومنصات الحجز والسفر.', 'International hotel chains, serviced-apartment operators, and travel tech platforms.']
    ],
    ['j19', ['hosp_tourism','arts_design','services_edu'], ['creator','performer'], ['theater','cinema'], ['role_events','role_design'], ['mat_bio_exp'], ['loc_kinetic','loc_hybrid'], 'hate_screen',
      'مصمم تجارب وبرامج سياحية وثقافية وبيئية (Experiential Travel Curator)', 'Experiential Travel & Eco-Tourism Designer',
      ['تبتكر رحلات وتجارب حية ذات قصة (تراث، حرف يدوية، طبيعة، طهي محلي) بدل البرامج السياحية النمطية.', 'Designs narrative-driven cultural, culinary, and eco-adventures for modern travelers and corporate retreats.'],
      ['بناء شبكة علاقات مع الفنادق البيئية والحرفيين وإتقان السرد القصصي (Storytelling) والتسويق الرقمي للسياحة.', 'Curate local artisan/eco-lodge networks, storytelling itineraries, and digital travel marketing.'],
      ['شركات السياحة المتخصصة، الفنادق البيئية (أسوان/الفيوم/سيناء/الواحات)، ومنصات التجارب العالمية.', 'Boutique travel operators, eco-lodges, cultural centers, and global experience platforms.']
    ],
    ['j20', ['hosp_tourism','agri_food','biz_commerce'], ['orchestrator','arbitrageur'], ['series','real_action'], ['role_events','role_tech'], ['mat_bio_exp'], ['loc_kinetic','loc_hybrid'], 'hate_screen',
      'مدير عمليات الأغذية والمشروبات وضبط تكاليف الضيافة (F&B Operations & Cost Manager)', 'F&B Operations & Hospitality Cost Controller',
      ['تدير منظومة المطاعم والكافيهات والفنادق من الداخل: ضبط المقادير، جودة الخدمة، ومنع الهدر لرفع صافي الربح.', 'Runs the engine of hotels, restaurants, and cafes: standardizing recipes, service SOPs, and food-cost control.'],
      ['احتراف هندسة قوائم الطعام (Menu Engineering)، حساب الـ Food Cost، ومعايير سلامة الغذاء (HACCP).', 'Master Menu Engineering, recipe costing cards, inventory control, and HACCP food safety.'],
      ['الفنادق والمنتجعات، سلاسل المطاعم والكافيهات، المطابخ السحابية، وشركات التموين (Catering).', 'Hotels, restaurant/cafe chains, cloud kitchens, and inflight/corporate catering firms.']
    ],
    ['j21', ['hosp_tourism','services_edu','biz_commerce'], ['performer','orchestrator'], ['theater','movies'], ['role_events','role_sales'], ['mat_bio_exp'], ['loc_kinetic','loc_hybrid'], 'hate_screen',
      'مدير تخطيط وتنفيذ المؤتمرات والفعاليات الكبرى (MICE & Corporate Events Manager)', 'MICE & Corporate Events Producer',
      ['توظف طاقتك المسرحية الحية ودقتك التنظيمية في إخراج المؤتمرات، المعارض الدولية، وحفلات الشركات من الألف للياء.', 'Channels your live-stage energy and organizational grip into producing conferences, expos, and brand launches.'],
      ['إدارة ميزانيات الفعاليات، التعاقد مع الفنادق وموردي الصوتيات والإضاءة، وإدارة الحشود والبروتوكول.', 'Event budgeting, hotel/AV vendor negotiation, sponsorship decks, and on-site run-of-show management.'],
      ['شركات تنظيم المعارض والمؤتمرات، الفنادق الكبرى، الشركات متعددة الجنسيات، والهيئات الدولية.', 'Event production agencies, convention centers, luxury hotels, and corporate marketing departments.']
    ],
    ['j22', ['hosp_tourism','services_edu'], ['performer','creator'], ['theater','cinema'], ['role_events'], ['mat_bio_exp'], ['loc_kinetic'], 'hate_screen',
      'مدير تجربة النزلاء والكونسيرج والضيافة الفاخرة (Guest Experience & Luxury Concierge)', 'Guest Experience & Luxury Concierge Manager',
      ['تكون الواجهة الراقية للفندق أو المنتجع، وتصمم تفاصيل إقامة استثنائية لكبار الزوار والوفود الدولية.', 'Serves as the refined face of luxury properties, crafting bespoke stays and VIP guest experiences.'],
      ['إجادة اللغات، بروتوكول الضيافة الدولية الفاخرة، وإدارة أنظمة تقييم وولاء النزلاء (Guest CRM).', 'Multilingual etiquette, VIP hospitality protocol, and guest satisfaction recovery systems.'],
      ['فنادق الخمس نجوم، المنتجعات السياحية في البحر الأحمر والأقصر وأسوان والخليج، وشركات الطيران واليخوت.', '5-star hotels, Red Sea/Nile/GCC luxury resorts, aviation VIP lounges, and yachting hospitality.']
    ],

    // --- 5. قطاع الزراعة والأغذية والإنتاج الحيوي (Agriculture, Food Science & Agribusiness) ---
    ['j23', ['agri_food','chem_science','med_biotech'], ['creator','strategist'], ['mystery','books'], ['role_science'], ['mat_bio_exp','mat_liquid'], ['loc_stationary','loc_hybrid'], 'hate_retail',
      'مهندس تطوير منتجات غذائية وأغذية وظيفية وصحية (Food R&D Technologist)', 'Food R&D & Functional Nutrition Technologist',
      ['تبتكر وصفات وتركيبات غذائية صناعية جديدة (بدائل صحية، سناكس عالية البروتين، مربيات وصوصات) وتضبط فترة صلاحيتها.', 'Develops new commercial food products, healthy snacks, and functional beverages with extended shelf life.'],
      ['دراسة تكنولوجيا التصنيع الغذائي، بدائل السكر والمواد الحافظة الطبيعية، ومواصفات هيئة سلامة الغذاء.', 'Master food preservation tech, clean-label formulation, sensory testing, and NFSA standards.'],
      ['مصانع الأغذية والمشروبات، شركات الألبان، العلامات الصحية الناشئة، ومراكز البحوث.', 'Food & beverage factories, dairy plants, health-food microbrands, and agro-industrial hubs.']
    ],
    ['j24', ['agri_food','biz_commerce'], ['orchestrator','arbitrageur'], ['movies','real_action'], ['role_sales','role_events'], ['mat_bio_exp','mat_warm'], ['loc_kinetic','loc_hybrid'], 'hate_screen',
      'أخصائي تصدير حاصلات زراعية وغذائية وسلاسل تبريد (Agri-Export & Cold Chain Specialist)', 'Agri-Food Export & Cold-Chain Operations Specialist',
      ['تقود تصدير المحاصيل المصرية والعربية (موالح، تمور، أعشاب عطرية، خضروات مجففة/مجمدة) للأسواق الدولية بالعملة الصعبة.', 'Manages the export of fresh/dried crops, dates, and herbs to global buyers through compliant cold-chain logistics.'],
      ['إتقان اشتراطات الحجر الزراعي، شهادات GlobalGAP، التكويد التصديري، وإجراءات الشحن البحري والجوي.', 'Master GlobalGAP compliance, phytosanitary certificates, packhouse grading, and export incoterms (FOB/CIF).'],
      ['محطات فرز وتعبئة الحاصلات، شركات التصدير الزراعي، والمزارع التصديرية الكبرى.', 'Export packhouses, agribusiness exporters, and international fresh-produce trading firms.']
    ],
    ['j25', ['agri_food','energy_env','eng_ind'], ['strategist','orchestrator'], ['series','mystery'], ['role_science','role_tech'], ['mat_bio_exp','mat_gloss'], ['loc_hybrid','loc_kinetic'], 'hate_retail',
      'مهندس زراعة ذكية وصوب هيدروبونيك وأنظمة ري حديثة (Smart Ag-Tech Engineer)', 'Smart Agriculture & Hydroponics Systems Engineer',
      ['تدمج الزراعة بالتكنولوجيا للتحكم في المناخ والتسميد والمياه داخل الصوب والمزارع الحديثة بأعلى إنتاجية للمتر.', 'Combines agronomy with sensor automation to run high-yield hydroponic greenhouses and precision irrigation.'],
      ['تصميم محاليل التغذية المائية (Fertigation)، إدارة مناخ الصوب المبردة، وحساسات الرطوبة والملوحة.', 'Master hydroponic nutrient dosing (EC/pH), climate-controlled greenhouses, and solar irrigation.'],
      ['المشروعات الزراعية الحديثة، شركات تكنولوجيا الزراعة (Ag-Tech)، ومزارع التصدير في مصر والخليج.', 'Modern greenhouse projects, Ag-Tech startups, and desert reclamation mega-farms.']
    ],

    // --- 6. قطاع الفنون والتصميم والعمارة والإعلام (Design, Architecture, Media & Creative) ---
    ['j26', ['arts_design','tech_data'], ['creator','strategist'], ['cinema','books'], ['role_design','role_tech'], ['mat_digital'], ['loc_stationary','loc_hybrid'], 'hate_field',
      'مصمم منتجات رقمية وتجربة مستخدم (UI/UX Product Designer)', 'Digital Product Designer (UI/UX)',
      ['تجمع بين حسك البصري السينمائي وفهم سلوك الإنسان لتصميم واجهات التطبيقات والمواقع دون كتابة كود معقد.', 'Combines visual framing sensibility with human psychology to design intuitive apps and web platforms.'],
      ['احتراف Figma وبناء نظام تصميم (Design System) و3 دراسات حالة كاملة في معرض أعمالك.', 'Master Figma, component design systems, and build 3 end-to-end UX case studies.'],
      ['شركات التقنية والـ Fintech، استوديوهات التصميم، والعمل الحر بالدولار مع شركات عالمية.', 'Tech startups, fintechs, digital agencies, and remote global product teams.']
    ],
    ['j27', ['arts_design','eng_ind','hosp_tourism'], ['creator','orchestrator'], ['cinema','theater'], ['role_design','role_events'], ['mat_warm','mat_gloss'], ['loc_hybrid','loc_kinetic'], 'hate_screen',
      'مهندس/مصمم مساحات تجارية وفندقية وعرض بصري (Retail & Hospitality Interior Designer)', 'Hospitality & Retail Spatial / Visual Merchandising Designer',
      ['تصمم الإضاءة، توزيع المساحات، والديكور الداخلي للكافيهات، الفنادق، والمعارض التجارية بما يضاعف إقبال العملاء.', 'Designs lighting, spatial flow, and interior identity for hotels, cafes, and retail stores to boost sales.'],
      ['إتقان 3ds Max / SketchUp وتصميم المخططات التنفيذية (Shop Drawings) وخامات التشطيب.', 'Master 3D visualization, commercial lighting layout, and material/fixture specification.'],
      ['مكاتب العمارة والتصميم الداخلي، سلاسل التجزئة والمطاعم، وشركات التطوير الفندقي والعقاري.', 'Interior architecture studios, retail/hospitality groups, and real estate developers.']
    ],
    ['j28', ['arts_design','eng_ind','biz_commerce'], ['creator','arbitrageur'], ['cinema','tiktok'], ['role_design'], ['mat_warm'], ['loc_stationary','loc_hybrid'], 'hate_field',
      'مصمم عبوات وهويات بصرية للمنتجات الاستهلاكية والتصديرية (Packaging & Structural Designer)', 'Structural Packaging & Brand Identity Designer',
      ['العبوة هي البائع الصامت؛ تخصصك في تصميم شكل العلبة وهويتها يجعل المصانع والبراندات تتسابق للتعاقد معك.', 'Packaging sells the product: designing structural dielines and shelf-stopping visuals is in massive demand by brands.'],
      ['احتراف Adobe Illustrator وتصميم خطوط التكسير والقص (Dielines) ومعرفة خامات الكرتون والطباعة.', 'Master structural dielines, print pre-press specs, and 3D packaging mockups.'],
      ['مصانع التغليف والطباعة، شركات الأغذية ومستحضرات التجميل، ووكالات الإعلان والعلامات الناشئة.', 'Packaging plants, FMCG/cosmetics companies, branding agencies, and export brands.']
    ],

    // --- 7. قطاع الحاسبات والذكاء الاصطناعي والبيانات (Software, AI, No-Code & Data) ---
    ['j29', ['tech_data','biz_commerce','eng_ind'], ['strategist','orchestrator'], ['mystery','series','books'], ['role_tech'], ['mat_digital'], ['loc_stationary','loc_hybrid'], 'hate_field',
      'مهندس أتمتة العمليات والذكاء الاصطناعي للشركات (AI Workflow & Automation Architect)', 'AI Workflow & Business Automation Specialist',
      ['تربط أنظمة الشركة (واتساب، المبيعات، المخازن، خدمة العملاء) بوكلاء الذكاء الاصطناعي لتعمل تلقائيًا 24 ساعة.', 'Connects company tools (WhatsApp, CRM, inventory) with AI agents to automate operations 24/7.'],
      ['إتقان منصات n8n وMake وربط الـ APIs وقواعد بيانات Supabase/Airtable وهندسة الأوامر.', 'Master n8n, Make, REST APIs, webhooks, and LLM agent workflows.'],
      ['الشركات الناشئة، العيادات والمستشفيات، المتاجر الإلكترونية، ووكالات الأتمتة عالميًا.', 'Tech companies, healthcare clinics, e-commerce brands, and global remote clients.']
    ],
    ['j30', ['tech_data','arts_design','biz_commerce'], ['creator','arbitrageur'], ['cinema','movies','tiktok'], ['role_design','role_tech'], ['mat_digital'], ['loc_stationary','loc_hybrid'], 'hate_factory',
      'مطور مواقع وتطبيقات سريعة بدون كود (No-Code & Low-Code Developer)', 'No-Code / Low-Code Web & App Developer',
      ['تبني منصات حجز، متاجر، وتطبيقات كاملة للشركات في أسبوع واحد بدل 6 أشهر باستخدام المنصات البصرية.', 'Builds full booking platforms, directories, and web apps in days using visual development stacks.'],
      ['احتراف Webflow أو Framer أو Bubble مع ربط بوابات الدفع الإلكتروني وقواعد البيانات.', 'Master Webflow, Framer, or Bubble integrated with payment gateways and cloud databases.'],
      ['وكالات تطوير المواقع، رواد الأعمال، الشركات الخدمية، ومنصات العمل الحر الدولية.', 'Digital agencies, startup founders, service businesses, and global freelance platforms.']
    ],
    ['j31', ['tech_data','biz_commerce','eng_ind'], ['strategist'], ['mystery','books'], ['role_tech','role_science'], ['mat_digital'], ['loc_stationary'], 'hate_field',
      'محلل بيانات الذكاء التجاري وضبط التكاليف (BI & Operations Data Analyst)', 'Business Intelligence (BI) & Costing Data Analyst',
      ['تحول الأرقام المبعثرة في المبيعات والمخازن والتشغيل إلى لوحات قياس تفاعلية تكشف فرص الربح ومواطن الهدر.', 'Turns raw sales, inventory, and production numbers into interactive dashboards that expose profit leaks.'],
      ['إتقان SQL وPower BI وExcel المتقدم والنمذجة المالية والتشغيلية.', 'Master SQL, Power BI, Advanced Excel, and unit-economics modeling.'],
      ['البنوك، سلاسل التجزئة، شركات التوزيع واللوجستيات، المصانع، وشركات الاتصالات.', 'Banks, retail chains, logistics firms, factories, and telecom operators.']
    ],

    // --- 8. قطاع التجارة وسلاسل الإمداد والمالية والتسويق (Business, Supply Chain, Finance & Marketing) ---
    ['j32', ['biz_commerce','eng_ind','agri_food'], ['arbitrageur','orchestrator'], ['movies','real_action'], ['role_sales','role_tech'], ['mat_warm','mat_gloss'], ['loc_hybrid','loc_kinetic'], 'hate_screen',
      'أخصائي مشتريات استراتيجية وتطوير موردين (Strategic Sourcing & Procurement)', 'Strategic Sourcing & Vendor Management Specialist',
      ['تمارس مهارة التفاوض واقتناص أفضل الخامات والأسعار من المصانع المحلية والدولية بأموال الشركة الكبرى.', 'Exercises your deal-hunting and negotiation skills to source raw materials and factory contracts using corporate capital.'],
      ['تحليل التكلفة الكلية للاستيراد والتوريد (Landed Cost)، شروط التعاقد، وتقييم جودة الموردين.', 'Master landed-cost calculation, supplier auditing, and contract negotiation.'],
      ['المصانع، سلاسل الهايبرماركت والتجزئة، شركات المقاولات، ومنصات التجارة الإلكترونية.', 'Manufacturing plants, retail chains, construction firms, and e-commerce marketplaces.']
    ],
    ['j33', ['biz_commerce','arts_design','tech_data'], ['arbitrageur','performer','creator'], ['tiktok','movies'], ['role_sales','role_design'], ['mat_digital'], ['loc_stationary','loc_hybrid'], 'hate_factory',
      'مدير تسويق النمو وإعلانات الأداء (Growth & Performance Marketing Specialist)', 'Performance & Growth Marketing Specialist',
      ['تستثمر فهمك السريع لسيكولوجية الجمهور والترندات في إدارة ميزانيات الإعلانات وتحويلها لمبيعات فورية مقاسة بالأرقام.', 'Turns your fast trend-radar and consumer psychology insight into measurable ROAS and e-commerce sales.'],
      ['إتقان إعلانات Meta وTikTok وGoogle وتتبع التحويلات (Pixel/CAPI) واختبار الفيديوهات البيعية.', 'Master Meta/TikTok/Google Ads, conversion tracking, CRO, and short-form ad hooks.'],
      ['المتاجر الإلكترونية، العقارات، العيادات، التطبيقات، ووكالات التسويق في مصر والخليج.', 'E-commerce brands, real estate, clinics, apps, and digital agencies across MENA.']
    ],
    ['j34', ['biz_commerce','services_edu','tech_data'], ['performer','arbitrageur'], ['theater','movies'], ['role_sales','role_events'], ['mat_digital','mat_warm'], ['loc_kinetic','loc_hybrid'], 'hate_factory',
      'مسؤول تطوير الأعمال والشراكات للشركات (B2B Business Development Manager)', 'B2B Business Development & Partnerships Manager',
      ['تبتعد عن فصال الأفراد الصغير، وتقود بناء العلاقات وإغلاق العقود الكبيرة مع الشركات والمؤسسات.', 'Leaves petty retail behind to build executive relationships and close high-value B2B contracts.'],
      ['بناء قوائم العملاء من الشركات (B2B Prospecting)، تقديم العروض، وإدارة صفقات المبيعات عبر CRM.', 'Master B2B outbound prospecting, consultative pitching, and CRM pipeline management.'],
      ['شركات البرمجيات، اللوجستيات، التوريدات الصناعية والفندقية، والخدمات المهنية.', 'SaaS firms, logistics providers, industrial/hospitality suppliers, and B2B agencies.']
    ],

    // --- 9. قطاع الخدمات المهنية، إدارة الأصول، والتعليم الحديث (Services, Facilities & EdTech) ---
    ['j35', ['services_edu','eng_ind','hosp_tourism'], ['orchestrator'], ['series','real_action'], ['role_events','role_tech'], ['mat_gloss','mat_bio_exp'], ['loc_kinetic','loc_hybrid'], 'hate_screen',
      'مدير تشغيل المرافق والأصول العقارية والتجارية (Facilities & Property Operations Manager)', 'Facilities & Commercial Property Operations Manager',
      ['تدير تشغيل المجمعات التجارية، المباني الإدارية، أو القرى السياحية (الصيانة، الأمن، النظافة، الطاقة، وعقود المستأجرين).', 'Oversees the complete operational health of commercial buildings, compounds, or resorts (maintenance, energy, vendors).'],
      ['دراسة أساسيات إدارة المرافق (IFMA / ISO 41001) وإدارة عقود الصيانة وميزانيات التشغيل.', 'Learn Facility Management standards (ISO 41001), SLA vendor management, and preventive maintenance scheduling.'],
      ['شركات إدارة الأصول والمرافق، المطورون العقاريون، البنوك، والمستشفيات والجامعات.', 'Facility management companies, real estate developers, malls, hospitals, and corporate campuses.']
    ],
    ['j36', ['services_edu','arts_design','med_biotech'], ['creator','strategist','performer'], ['books','cinema','theater'], ['role_science','role_design'], ['mat_digital'], ['loc_stationary','loc_hybrid'], 'hate_field',
      'مصمم تجارب تعليمية ومناهج تدريبية تفاعلية (Instructional & Learning Experience Designer)', 'Instructional & Learning Experience Designer (LXD)',
      ['تحول قدرتك على الشرح والتبسيط وحبك للكتب/السينما إلى تصميم برامج تدريبية ومنصات تعليمية للشركات والجامعات.', 'Transforms your gift for simplifying complex knowledge into interactive training programs and e-learning courses.'],
      ['إتقان نماذج التصميم التعليمي (ADDIE) وأدوات بناء المحتوى التفاعلي (Articulate Storyline / AI Video).', 'Master Instructional Design (ADDIE), Articulate Storyline, and interactive micro-learning tools.'],
      ['شركات تكنولوجيا التعليم (EdTech)، إدارات التدريب والتطوير بالشركات الكبرى، والجامعات الدولية.', 'EdTech platforms, corporate L&D departments, training academies, and international universities.']
    ]
  ];

  function termHtml(en) {
    const s = esc(en);
    return `<span class="en-term">${s}</span><button type="button" class="copy-btn" data-en="${s}">${tr(UI.copyWord)}</button>`;
  }

  // =========================================================================
  // الدالة المركبة الشاملة (Composite Engine: F1 x F2 x F3 x F4)
  // =========================================================================
  function _runCompositeEngine(ans, user, assets, assetMeta) {
    // 1. حساب النواة الفطرية F1 من بصمة الترفيه والفراغ (q1, q2, q3)
    const f1 = { creator: 0, performer: 0, orchestrator: 0, arbitrageur: 0, strategist: 0 };
    if (ans.q1 === 'cinema') { f1.creator += 30; f1.strategist += 10; }
    else if (ans.q1 === 'theater') { f1.performer += 32; f1.creator += 12; }
    else if (ans.q1 === 'mystery') { f1.strategist += 32; f1.orchestrator += 10; }
    else if (ans.q1 === 'real_action') { f1.arbitrageur += 24; f1.orchestrator += 24; }

    if (ans.q2 === 'series') { f1.orchestrator += 26; f1.strategist += 12; }
    else if (ans.q2 === 'movies') { f1.arbitrageur += 22; f1.creator += 14; }
    else if (ans.q2 === 'books') { f1.strategist += 28; f1.creator += 10; }
    else if (ans.q2 === 'tiktok') { f1.arbitrageur += 26; f1.performer += 22; }

    if (ans.q3 && f1[ans.q3] !== undefined) f1[ans.q3] += 34;

    // 2. دمج الدور المبكر F2 (q4)
    if (ans.q4 === 'role_design') f1.creator += 26;
    if (ans.q4 === 'role_events') { f1.performer += 24; f1.orchestrator += 22; }
    if (ans.q4 === 'role_science') { f1.strategist += 26; f1.creator += 14; }
    if (ans.q4 === 'role_sales') { f1.arbitrageur += 28; f1.performer += 14; }
    if (ans.q4 === 'role_tech') { f1.strategist += 24; f1.orchestrator += 18; }

    const sortedCores = Object.keys(f1).sort((a, b) => f1[b] - f1[a]);
    const primaryCore = sortedCores[0];
    const secondaryCore = sortedCores[1];

    const leisureInsights = {
      cinema: ['ميلك للسينما والكادر البصري يكشف «عقلية المخرج والمصمم» الذي يبرع في هندسة التفاصيل والتكوين قبل خروج المنتج أو المشهد للنور.', 'Your preference for cinema reveals a "Director & Designer" mind that excels at framing, prototyping, and behind-the-scenes craft.'],
      theater: ['انجذابك للمسرح والفعاليات الحية يكشف «طاقة الحضور والتفاعل البشري والضيافة»؛ أنت تلمع في قيادة اللحظة الحية والإقناع ولا تناسبك العزلة.', 'Your attraction to live theater reveals strong interpersonal presence; you shine in live hospitality, events, persuasion, and leadership.'],
      mystery: ['حبك لأفلام الغموض والوثائقيات يكشف «عقلية المحلل والباحث» الذي يستمتع بتفكيك الأنظمة المعقدة وربط الأسباب بالنتائج.', 'Your love for mystery and science docs reveals an analytical R&D mind that thrives on decoding complex systems.'],
      real_action: ['تفضيلك للواقع الملموس والحركة على الفنون الأدائية يكشف «شخصية عملية تنفيذية» تنجح في التشغيل الهندسي أو الإنتاجي أو التجاري الملموس.', 'Your preference for real-world action over performing arts reveals a pragmatic executor built for tangible operations, engineering, or trade.']
    };
    const paceInsights = {
      series: ['كما أن تفضيلك للمسلسلات الطويلة يمنحك «نَفَسًا طويلًا» في إدارة العمليات المستمرة، خطوط الإنتاج، والمشروعات التراكمية.', 'Preferring long-form series shows you have the stamina for continuous operations, supply chains, and cumulative growth.'],
      movies: ['كما أن تفضيلك للأفلام المكثفة يمنحك «طاقة الحسم السريع» في إغلاق الصفقات وإنجاز المهام والمشروعات المحددة بوقت.', 'Preferring focused movies shows decisive sprint energy for closing deals and delivering time-bound projects.'],
      books: ['كما أن حبك للكتب والقراءة العميقة يمنحك «تفوقًا معرفيًا وبحثيًا» في التخصصات الدقيقة والتخطيط.', 'Loving deep reading grants you analytical mastery for specialized R&D, engineering, and strategic roles.'],
      tiktok: ['كما أن تفضيلك للإيقاع السريع يمنحك «رادارًا فوريًا لالتقاط حركة السوق والترندات وسلوك المستهلك».', 'Fast-paced media habits give you a sharp radar for market pulse, consumer hooks, and rapid commercial testing.']
    };

    const compassText = `${tr(leisureInsights[ans.q1 || 'cinema'])} ${tr(paceInsights[ans.q2 || 'movies'])}`;

    const field = user.field || 'eng_ind';
    const mat = ans.q5 || 'mat_gloss';
    const mob = ans.q6 || 'loc_hybrid';
    const hate = ans.q9 || 'hate_retail';
    const cap = user.capEGP || 0;
    const isEgypt = user.country === 'egypt';
    const prefersJobFirst = ans.q10 === 'goal_job' || ans.q11 === 'runway_no' || cap < 1500;

    // -----------------------------------------------------------------------
    // أ. تسجيل وترتيب جميع وظائف 2026 (JOBS_DB_2026) لاختيار أفضل 5 وظائف دقيقة
    // -----------------------------------------------------------------------
    const scoredJobs = JOBS_DB_2026.map(j => {
      let score = 0;
      const [id, jSectors, jCores, jLeisures, jRoles, jMats, jMobs, jAvoidHate] = j;

      // تطابق القطاع الأساسي والفرعي
      if (jSectors[0] === field) score += 48;
      else if (jSectors.indexOf(field) !== -1) score += 30;

      // تطابق النواة الفطرية
      if (jCores[0] === primaryCore) score += 28;
      else if (jCores.indexOf(primaryCore) !== -1) score += 18;
      if (jCores.indexOf(secondaryCore) !== -1) score += 10;

      // تطابق بصمة الترفيه (المسرح/السينما/الكتب/المسلسلات/تيك توك)
      if (jLeisures.indexOf(ans.q1) !== -1) score += 16;
      if (jLeisures.indexOf(ans.q2) !== -1) score += 14;

      // تطابق الدور المبكر والوسيط والحركة
      if (jRoles.indexOf(ans.q4) !== -1) score += 18;
      if (jMats[0] === mat) score += 22;
      else if (jMats.indexOf(mat) !== -1) score += 12;

      if (jMobs[0] === mob) score += 14;
      else if (jMobs.indexOf(mob) !== -1) score += 8;

      // استبعاد ما يكرهه المستخدم
      if (hate === 'hate_field' && jMobs[0] === 'loc_kinetic' && jMobs.length === 1) score -= 35;
      if (hate === 'hate_screen' && jMats[0] === 'mat_digital' && jMats.length === 1) score -= 35;
      if (jAvoidHate === hate) score += 10;

      return { job: j, score };
    }).sort((a, b) => b.score - a.score);

    const topJobs = scoredJobs.slice(0, 5).map(x => ({
      ar: x.job[8],
      en: x.job[9],
      why: x.job[10],
      skill: x.job[11],
      sector: x.job[12]
    }));

    // -----------------------------------------------------------------------
    // ب. توليد المشروع المستقل بالدالة المركبة عبر كافة القطاعات (F1 x F2 x F3 x F4)
    // -----------------------------------------------------------------------
    let venture = null;

    // 1. قطاع الطاقة المتجددة والبيئة والاستدامة
    if (field === 'energy_env' || (field === 'eng_ind' && (user.localRaw === 'palm_dates_waste' || assets.includes('roof')) && mat === 'mat_gloss')) {
      const isBioWaste = user.localRaw === 'palm_dates_waste' || user.localRaw === 'crops_herbs_farms' || mat === 'mat_bio_exp';
      venture = isBioWaste ? {
        title: ['وحدة تدوير المخلفات الزراعية والحيوية لإنتاج بدائل الطاقة والأسمدة العضوية والخامات البيئية', 'Biomass & Agricultural Waste Upcycling Micro-Plant'],
        en: 'Biomass & Circular Economy Unit',
        desc: ['تحويل جريد النخيل ومخلفات المحاصيل والمزارع والكافيهات إلى منتجات عالية الطلب (فحم حيوي مضغوط للتصدير والشوي، كومبوست عضوي مخصب للمزارع، أو ألواح وخامات بيئية) بهوامش ربح مرتفعة لأن الخامة شبه مجانية.', 'Convert abundant palm midribs, crop residues, and organic waste into high-demand briquettes/biochar, enriched organic compost, or eco-materials using low-cost local feedstock.'],
        calc: {
          title: ['حاسبة طن المنتج الحيوي / البيئي المعاد تدويره', '1-Ton Upcycled Bio-Product Calculator'],
          labels: [['تكلفة جمع ونقل المخلفات الخام للطن', 'Raw Biomass Collection & Transport'], ['تكلفة الفرم أو الكبس أو المعالجة الحيوية والطاقة', 'Shredding, Pressing / Bioprocessing'], ['أكياس التعبئة المنسوجة أو الكراتين للطن', 'Packaging Bags / Cartons'], ['تكلفة النقل للمشتري أو المزرعة أو المصدر', 'Delivery to Buyer'], ['تكلفة العينات والتسويق التجاري (B2B)', 'B2B Samples & Marketing']],
          def: { c1: 1200, c2: 950, c3: 350, c4: 400, c5: 200, price: 5200 }
        },
        exp: ['اجمع دفعة تجريبية صغيرة وحولها لدى مكبس أو مفرمة محلية مؤجرة بالساعة لإنتاج 200 كجم فقط، واعرض عيناتها على 5 مزارع أو مطاعم أو مصدرين.', 'Process a 200kg pilot batch using rented local shredding/pressing equipment and test sales with 5 farms, restaurants, or exporters.'],
        risk: ['اضبط نسبة الرطوبة والكثافة القياسية قبل التغليف، ولا تشترِ ماكينات ضخمة في البداية بل استأجر ساعات تشغيل.', 'Control moisture levels strictly and rent machine hours initially before investing in heavy equipment.'],
        kwAr: ['ماكينات فرم وكبس المخلفات الزراعية والفحم الحيوي', 'تصنيع الكومبوست والبدائل البيئية من جريد النخيل'],
        kwEn: ['Biomass briquettes & biochar production', 'Agricultural waste upcycling business model']
      } : {
        title: ['مكتب خدمات تصميم وتركيب وصيانة أنظمة الطاقة الشمسية وتخفيض فواتير الكهرباء للمنشآت', 'Solar PV Systems, Maintenance & Energy-Saving Agency'],
        en: 'Solar PV & Energy Auditing Service',
        desc: ['تقديم خدمة فحص الأحمال الكهربائية وتوريد وتركيب وصيانة وتنظيف ألواح الطاقة الشمسية وتحسين معامل القدرة للمزارع، المصانع، الفيلات، والمنشآت التجارية بنظام التعاقد المباشر مع موردي الجملة.', 'Provide energy-load auditing, solar PV installation coordination, and scheduled panel cleaning/maintenance retainers for farms, factories, and villas.'],
        calc: {
          title: ['حاسبة عقد تركيب أو صيانة وتدقيق الطاقة للمنشأة', 'Solar / Energy Service Contract Calculator'],
          labels: [['تكلفة المستلزمات الفنية أو معدات القياس والتركيب', 'Technical Supplies / Mounting Gear'], ['أجور الفنيين المساعدين في الموقع', 'On-Site Technician Wages'], ['تكلفة الانتقالات والنقل للموقع', 'Site Transport'], ['تكلفة المعاينة والتسويق الهندسي', 'Audit & Client Acquisition'], ['احتياطي الضمان والمتابعة الدورية', 'Warranty & Follow-up Reserve']],
          def: { c1: 1800, c2: 1200, c3: 400, c4: 500, c5: 300, price: 7500 }
        },
        exp: ['قدم فحصًا مجانيًا لفاتورة الكهرباء والأحمال لـ 5 مصانع صغيرة أو مزارع أو عيادات واكشف لهم حجم التوفير الشهري لتوقيع أول تعاقد.', 'Offer a free electricity-bill and load audit to 5 local factories, farms, or clinics to demonstrate exact monthly savings and close your first contract.'],
        risk: ['تعاقد مع موردي ألواح وإنفرترات معتمدين بضمان رسمي، وركز على عقود الصيانة والتنظيف الدوري لضمان دخل شهري متكرر.', 'Source warrantied tier-1 inverters/panels and bundle recurring cleaning/maintenance retainers for steady cash flow.'],
        kwAr: ['توريد وتركيب محطات طاقة شمسية للمزارع والمصانع', 'تحسين معامل القدرة وتخفيض استهلاك الكهرباء'],
        kwEn: ['Solar PV EPC & O&M maintenance service', 'Commercial energy auditing business']
      };
    }
    // 2. القطاع البايو-حيوي والطبي والصحي والكيميائي
    else if (field === 'med_biotech' || field === 'chem_science') {
      const isB2BMed = primaryCore === 'arbitrageur' || primaryCore === 'orchestrator' || mob === 'loc_kinetic' || ans.q4 === 'role_sales';
      venture = isB2BMed ? {
        title: ['وكالة توريد المستهلكات الطبية والمعملية والعبوات القياسية للعيادات والمعامل والمراكز الصحية', 'B2B Medical, Dental & Lab Consumables Supply Agency'],
        en: 'B2B Medical & Lab Consumables Supply',
        desc: ['العيادات ومراكز الأسنان والمعامل تستهلك يوميًا أصنافًا لا تتوقف (أنابيب سحب، قفازات، مطهرات قياسية، مستلزمات تعقيم، ورق رسم قلب وسونار). تتفق مع الوكلاء والمصانع وتوردها في مواعيد ثابتة نقدًا.', 'Clinics, dental centers, and labs consume daily essentials (tubes, gloves, sterilization pouches, medical paper, disinfectants). Supply them on a scheduled weekly cash route.'],
        calc: {
          title: ['حاسبة طلبية التوريد الأسبوعية للعيادة أو المعمل', 'Weekly Clinic/Lab Order Calculator'],
          labels: [['تكلفة شراء المستهلكات الطبية/المعملية من الوكيل جملة', 'Wholesale Medical Supplies Cost'], ['تكلفة الفرز والتجهيز والتغليف', 'Sorting & Packing'], ['تكلفة التوصيل لخط السير الطبي', 'Route Delivery Cost'], ['عينات التجربة والكتالوج الفني', 'Trial Samples & Catalog'], ['خصم السداد النقدي الفوري', 'Cash Payment Discount']],
          def: { c1: 1400, c2: 40, c3: 60, c4: 50, c5: 50, price: 2100 }
        },
        exp: ['حدد 5 أصناف طبية/معملية عالية السحب، ومر بعيناتها المعتمدة على 15 عيادة أو معملًا في منطقتك لتأمين أول 5 عملاء دائمين.', 'Select 5 high-turnover medical/lab consumables, visit 15 local clinics or labs with certified samples, and lock in 5 recurring weekly buyers.'],
        risk: ['لا تتعامل إلا في المستلزمات المسجلة رسميًا بوزارة الصحة وهيئة الدواء والمدون عليها رقم التشغيلة وتاريخ الصلاحية.', 'Deal strictly in EDA/MoH registered medical supplies with clear batch numbers and expiry dates.'],
        kwAr: ['جملة المستلزمات والمستهلكات الطبية والمعملية القصر العيني والجمهورية', 'توريد مستلزمات معامل التحاليل والعيادات'],
        kwEn: ['B2B medical & lab consumables distribution', 'Dental and clinic supplies route sales']
      } : {
        title: ['معمل تطوير وعلامة متخصصة للمستحضرات العلاجية التجميلية أو المستخلصات الحيوية بالتصنيع التعاقدي', 'Biotech / Dermocosmetic Formulation Microbrand (Toll Manufacturing)'],
        en: 'Dermocosmetic & Bio-Formulation Brand',
        desc: ['توظيف خلفيتك العلمية والحيوية في ابتكار تركيبة دقيقة تحل مشكلة محددة (عناية علاجية بالبشرة والشعر، أو مستخلص حيوي/نباتي آمن للمحاصيل)، وتصنيعها لدى مصنع مرخص بكميات مرنة وبيعها بعلامتك.', 'Leverage your scientific/biotech background to formulate targeted dermocosmetics or safe bio-extracts, manufactured in small batches at a licensed toll facility.'],
        calc: {
          title: ['حاسبة عبوة المستحضر / المستخلص الحيوي (100 مل)', 'Bio/Cosmetic Unit Calculator (100ml)'],
          labels: [['تكلفة المواد الفعالة والمستخلصات الحيوية للعبوة', 'Bio-Active Ingredients Cost'], ['أجرة التصنيع والتعبئة بالمصنع المرخص', 'Licensed Toll Factory Fee'], ['العبوة القياسية بالمضخة/القطارة والملصق', 'Dropper/Pump Bottle & Label'], ['تكلفة الشحن أو عمولة الصيدلية/الموزع', 'Shipping / Pharmacy Margin'], ['تكلفة العينات الطبية والتسويق العلمي', 'Medical Samples & Marketing']],
          def: { c1: 65, c2: 22, c3: 24, c4: 35, c5: 44, price: 320 }
        },
        exp: ['جهز 20 عينة اختبار (Testers) وقدمها لأطباء جلدية أو صيادلة أو مزارعين مستهدفين لتجربة الفاعلية؛ ابدأ الإنتاج الكمي بعد طلب 5 منهم الشراء.', 'Prepare 20 trial samples for dermatologists, pharmacists, or target users; trigger batch production once 5 convert to paid orders.'],
        risk: ['التزم باختبارات الثبات والميكروبيولوجي والتصنيع والإخطار الرسمي عبر مصنع مرخص قبل البيع التجاري.', 'Complete stability and microbiological testing and register via a licensed manufacturing plant before commercial sale.'],
        kwAr: ['مصانع تصنيع للغير Toll Manufacturing مستحضرات طبية وتجميلية', 'خامات ومستخلصات فعالة للصناعات الدوائية والحيوية'],
        kwEn: ['Dermocosmetic toll manufacturing low MOQ', 'Bio-active formulation private label']
      };
    }
    // 3. القطاع الفندقي والسياحي والضيافة والفعاليات
    else if (field === 'hosp_tourism' || ((primaryCore === 'performer' || ans.q1 === 'theater') && (user.envType === 'touristic_city' || user.firstAdopter === 'tourists_visitors'))) {
      const isPropMgmt = primaryCore === 'orchestrator' || primaryCore === 'arbitrageur' || assets.includes('shop_office') || assets.includes('home_room');
      venture = isPropMgmt && ans.q1 !== 'theater' ? {
        title: ['وكالة إدارة وتشغيل الشقق الفندقية وبيوت الضيافة وتوريد مستلزمات الفنادق', 'Short-Term Rental Management & Hospitality Supply Agency'],
        en: 'Boutique Hospitality & Airbnb Management',
        desc: ['إدارة الشقق المفروشة والوحدات السياحية لصالح ملاكها (التصوير، التسعير على Booking/Airbnb، استقبال النزلاء، وإدارة النظافة والصيانة الفندقية) مقابل نسبة 20% إلى 25% من الإيراد دون أن تشتري عقارًا.', 'Manage furnished apartments and boutique vacation rentals for property owners (listing optimization, dynamic pricing, guest check-in, hotel-grade housekeeping) for a 20–25% commission without owning real estate.'],
        calc: {
          title: ['حاسبة إدارة الحجز الفندقي (لكل إقامة 3 ليالٍ)', '3-Night Guest Booking Calculator'],
          labels: [['تكلفة النظافة الفندقية وغسيل المفروشات للوحدة', 'Hotel Housekeeping & Laundry'], ['باقة الضيافة الترحيبية للنزيل (قهوة/مياه/مستلزمات)', 'Guest Welcome Amenities'], ['تكلفة الاستقبال أو القفل الذكي والصيانة البسيطة', 'Check-in / Minor Maintenance'], ['تكلفة الإعلان وتنشيط الحجوزات', 'Listing Promotion'], ['احتياطي الطوارئ للوحدة', 'Operations Buffer']],
          def: { c1: 350, c2: 120, c3: 100, c4: 130, c5: 80, price: 1850 }
        },
        exp: ['اتفق مع مالك شقة واحدة غير مستغلة جيدًا في منطقة حيوية أو سياحية، وأعد تنسيقها وتصويرها وأدر حجوزاتها لمدة شهر واحد لإثبات العائد.', 'Partner with 1 owner of an underperforming apartment, restyle and photograph it, and manage bookings for 30 days to prove higher occupancy.'],
        risk: ['ضع قائمة فحص نظافة وصيانة من 15 نقطة بعد كل نزيل، والتزم باشتراطات تسجيل النزلاء الرسمية.', 'Enforce a strict 15-point housekeeping checklist between guests and comply with local guest-registration laws.'],
        kwAr: ['إدارة وتشغيل الشقق الفندقية على بوكينج وإيربي إن بي', 'جملة المفروشات ومستلزمات الضيافة الفندقية'],
        kwEn: ['Short-term rental co-hosting & management', 'Boutique hospitality operations SOP']
      } : {
        title: ['وكالة تصميم وتنظيم التجارب السياحية والثقافية والبيئية والفعاليات المتخصصة', 'Experiential Travel, Eco-Tours & Event Curation Agency'],
        en: 'Experiential Travel & Events Curation',
        desc: ['ابتكار وتنظيم تجارب حية ذات قصة (جولات تراثية ومعمارية، تجارب طهي وحرف محلية، رحلات فلك وطبيعة، أو فعاليات شركات) للسياح والأجانب المقيمين والشركات بالحجز المسبق.', 'Curate and host story-driven live experiences (heritage walks, artisan & culinary trails, eco-retreats, or corporate team events) funded upfront by ticket bookings.'],
        calc: {
          title: ['حاسبة اقتصاديات الفرد في التجربة أو الفعالية', 'Per-Guest Experience Calculator'],
          labels: [['تكلفة الانتقالات المنسقة والرسوم للفرد', 'Transport & Entry Fees'], ['تكلفة الضيافة أو الوجبة التراثية للفرد', 'Hospitality & Local Meal'], ['حصة الحرفي أو المرشد أو المكان للفرد', 'Venue / Artisan Host Share'], ['عمولة منصة الحجز أو إعلان التسويق للفرد', 'Booking Platform / Ad Fee'], ['احتياطي الجودة والتأمين', 'Quality & Safety Buffer']],
          def: { c1: 220, c2: 150, c3: 90, c4: 90, c5: 50, price: 980 }
        },
        exp: ['صمم تجربة واحدة استثنائية من 4 ساعات، وافتح الحجز المسبق لـ 10 مقاعد فقط؛ نفذ التجربة بأموال الحجز ووثقها بالفيديو.', 'Design 1 standout 4-hour experience, pre-sell 10 tickets online, and execute using booking proceeds while filming guest reactions.'],
        risk: ['تعاون دائمًا مع وسائل نقل سياحي وأماكن ومرشدين مرخصين رسميًا لضمان السلامة والالتزام القانوني.', 'Always partner with officially licensed tourist transport, venues, and certified guides.'],
        kwAr: ['تنظيم التجارب السياحية الثقافية والبيئية في مصر والعالم العربي', 'إدارة الفعاليات ورحلات الشركات'],
        kwEn: ['Experiential travel curation business', 'Corporate retreat & cultural tour design']
      };
    }
    // 4. القطاع الهندسي والصناعي
    else if (field === 'eng_ind') {
      const isMaker = primaryCore === 'creator' || ans.q4 === 'role_design' || assets.includes('workshop');
      venture = isMaker ? {
        title: ['استوديو تصميم وتصنيع رقمي ونماذج أولية وإنتاج قطع هندسية وديكورية (CAD / CNC / Laser)', 'Digital Fabrication, Prototyping & Custom Engineering Studio'],
        en: 'CAD / CNC Prototyping & Micro-Manufacturing',
        desc: ['تحويل خبرتك الهندسية والتصميمية إلى تصميم قطع غيار غير متوفرة، قوالب، منظمات معدنية/خشبية، أو وحدات إضاءة وتجهيزات للمحلات والمصانع، وتنفيذها بالقطعة لدى ورش الـ CNC والليزر والطباعة ثلاثية الأبعاد.', 'Turn your engineering/CAD skills into custom spare parts, fixtures, commercial displays, or wood/metal products machined on-demand at CNC, laser, and 3D-printing workshops.'],
        calc: {
          title: ['حاسبة القطعة الهندسية / الصناعية المصنعة بالطلب', 'Custom Engineered Unit Calculator'],
          labels: [['تكلفة الخامات الهندسية (معدن / خشب / بوليمر)', 'Raw Engineering Material'], ['أجرة التشغيل على ماكينات CNC / الليزر / الخراطة', 'CNC / Laser Machining Fee'], ['التشطيب والدهان الإلكتروستاتيك والتجميع', 'Finishing, Coating & Assembly'], ['التغليف الواقي والنقل للعميل', 'Protective Packing & Delivery'], ['تكلفة التسويق والعينات الهندسية', 'B2B Marketing & Samples']],
          def: { c1: 240, c2: 130, c3: 65, c4: 55, c5: 60, price: 890 }
        },
        exp: ['صمم 3 نماذج لمنتج أو حامل أو قطعة تجهيز مطلوبة للمحلات/المصانع على برنامج CAD، ونفذ 3 عينات فقط لدى ورشة CNC واعرضها للتعاقد بالطلب.', 'Model 3 high-demand commercial fixtures or parts in CAD, machine 3 samples at a local CNC workshop, and secure pre-orders.'],
        risk: ['راجع التفاوتات الهندسية (Tolerances) بدقة على عينة أولى قبل قص أو تشغيل أي كمية.', 'Verify dimensional tolerances on a single golden sample before cutting full material sheets.'],
        kwAr: ['ورش تصنيع CNC وتقطيع ليزر بالقطعة والطلب', 'تصميم وتصنيع تجهيزات المحلات وقطع الغيار الهندسية'],
        kwEn: ['On-demand CNC & laser micro-manufacturing', 'CAD product prototyping service']
      } : {
        title: ['وكالة عقود الصيانة الوقائية والتوريدات الفنية للمصانع، العيادات، والكافيهات', 'B2B Preventive Maintenance & Technical Supply Agency'],
        en: 'B2B Preventive Maintenance Retainers',
        desc: ['الماكينات التجارية والصناعية (خطوط التعبئة، ماكينات الإسبريسو، التبريد، وحدات الأسنان) تتعطل فجأة فتخسر المنشأة آلاف الجنيهات. تقدم عقد زيارة وقائية شهرية مجدولة للفحص وتغيير الفلاتر والجوانات ومنع الأعطال.', 'Commercial and industrial machines (packaging lines, chillers, espresso machines, dental units) suffer costly downtime. Offer scheduled monthly preventive maintenance retainers and spare-parts supply.'],
        calc: {
          title: ['حاسبة عقد الصيانة الوقائية الشهري للمنشأة', 'Monthly B2B Maintenance Retainer Calculator'],
          labels: [['تكلفة قطع الغيار الاستهلاكية (جوانات/فلاتر/زيوت)', 'Consumable Spare Parts'], ['أجر المهندس/الفني للزيارة المجدولة', 'Technician Visit Allocation'], ['تكلفة الانتقالات لموقع العميل', 'Site Transport'], ['إهلاك أجهزة الفحص والقياس', 'Diagnostic Tool Wear'], ['تكلفة اكتساب العقد التجاري', 'B2B Contract Acquisition']],
          def: { c1: 220, c2: 200, c3: 70, c4: 40, c5: 60, price: 1200 }
        },
        exp: ['قدم فحصًا فنيًا مجانيًا من 15 دقيقة لـ 8 منشآت (مصانع صغيرة، كافيهات، أو عيادات) وسلمهم تقريرًا بحالة الماكينة لتوقيع أول 3 عقود شهرية.', 'Perform a free 15-minute diagnostic check for 8 local facilities and hand them a machine-health report to close your first 3 monthly retainers.'],
        risk: ['ركز على التخصص في نوع محدد من المعدات في نطاق جغرافي متقارب لتوفير قطع الغيار وسرعة الاستجابة.', 'Specialize in 1–2 equipment categories within a tight geographic zone for fast response and spare-parts efficiency.'],
        kwAr: ['عقود صيانة وقائية للمصانع والكافيهات والعيادات', 'توريد قطع غيار خطوط الإنتاج والماكينات التجارية'],
        kwEn: ['B2B preventive maintenance retainer model', 'Commercial equipment service SLA']
      };
    }
    // 5. قطاع الزراعة والأغذية والإنتاج الحيوي
    else if (field === 'agri_food') {
      const hasSunSpace = assets.includes('roof') || assets.includes('land') || assets.includes('workshop');
      venture = hasSunSpace ? {
        title: ['وحدة تجفيف وتجهيز وتعبئة الحاصلات الزراعية والنباتات العطرية والخضروات المفرغة من الهواء (Vacuum)', 'Agri-Crop Solar Drying & Vacuum Food-Prep Unit'],
        en: 'Agri-Drying & Vacuum Food Processing',
        desc: ['تحويل المحاصيل الطازجة (أعشاب طبية وعطرية، طماطم مجففة، فواكه، أو خضروات مقطعة جاهزة للطهي) عبر التجفيف الصحي أو التغليف المفرغ من الهواء (Vacuum) لتوريدها للمطاعم، الفنادق، وشركات التصدير.', 'Process fresh local crops into high-margin sun-dried herbs/tomatoes or vacuum-sealed prepped vegetables for restaurants, hotels, and export traders.'],
        calc: {
          title: ['حاسبة الكيلو المجهز ومغلف بالفاكيوم', '1kg Processed & Vacuum-Packed Calculator'],
          labels: [['تكلفة المحصول الخام شاملة نسبة الفرز والتصافي', 'Raw Crop + Sorting Yield Loss'], ['تكلفة الغسيل، التجفيف/التقطيع، والطاقة', 'Washing, Drying & Processing'], ['أكياس الفاكيوم الغذائية السميكة والملصق', 'Food-Grade Vacuum Bag & Label'], ['تكلفة النقل والتوزيع للمشتري', 'Delivery to Buyer'], ['عينات التجربة للمطاعم والتجار', 'B2B Trial Samples']],
          def: { c1: 55, c2: 15, c3: 10, c4: 10, c5: 8, price: 160 }
        },
        exp: ['جهز 15 كجم فقط من صنف واحد مطلوب بشدة في المطاعم أو العطارة الفاخرة، وغلفه بالفاكيوم واعرضه على 5 مشترين تجاريين.', 'Prepare 15kg of a single high-demand item, vacuum-seal it, and pitch samples to 5 commercial kitchens or spice wholesalers.'],
        risk: ['التجفيف التام من الرطوبة والالتزام باشتراطات سلامة الغذاء هما سر بقاء المنتج دون تلف.', 'Strict moisture control and food-safety hygiene are essential to prevent spoilage.'],
        kwAr: ['تجفيف الأعشاب الطبية والطماطم والفواكه للتصدير', 'تجهيز وتعبئة الخضروات بالفاكيوم للمطاعم والفنادق'],
        kwEn: ['Dehydrated herbs & sun-dried tomatoes B2B', 'Fresh-cut vacuum vegetables processing']
      } : {
        title: ['علامة تجارية لتعبئة وتجارة الأغذية الصحية المتخصصة والتمور والبن والتوابل النقية', 'Specialty Health Foods, Dates & Artisanal Coffee Microbrand'],
        en: 'Specialty Food & Dates Microbrand',
        desc: ['انتقاء محاصيل غذائية عالية الجودة من المصدر (تمور فاخرة، قهوة مختصة، عسل، مكسرات، أو خلطات توابل وأعشاب نقية) وتقديمها في عبوات محكمة بوزن قياسي وهوية راقية للكافيهات والمستهلكين.', 'Source premium raw crops directly from origin (artisan dates, specialty coffee, pure spices, healthy snacks) and package them in airtight branded pouches for cafes and online buyers.'],
        calc: {
          title: ['حاسبة العبوة الغذائية المتخصصة (250 جم)', 'Specialty Food Pack Calculator (250g)'],
          labels: [['تكلفة الخامة الغذائية النقية من المصدر', 'Origin Raw Food Cost'], ['الفرز، التحميص أو التجهيز لدى الغير', 'Sorting / Roasting Fee'], ['العبوة المحكمة بصمام/سحاب والملصق', 'Zipper/Valve Pouch & Label'], ['تكلفة الشحن أو التوصيل', 'Shipping Cost'], ['تكلفة التذوق والتسويق الرقمي', 'Tasting Samples & Ads']],
          def: { c1: 52, c2: 12, c3: 15, c4: 25, c5: 20, price: 185 }
        },
        exp: ['جهز 25 عبوة فقط من صنف واحد مميز، واعرضها للتذوق والبيع المسبق في المكاتب أو الكافيهات أو عبر الإنترنت قبل شراء كميات كبيرة.', 'Pack 25 units of one signature item and validate repeat orders via tasting sessions and online pre-sales.'],
        risk: ['اشترِ بكميات صغيرة طازجة أولًا بأول لحماية النكهة وتجنب ركود المخزون.', 'Buy small fresh batches to preserve aroma and keep cash flow agile.'],
        kwAr: ['تعبئة وتغليف التمور والقهوة المختصة والأغذية الصحية', 'أكياس تغليف غذائي بصمام وبرطمانات جملة'],
        kwEn: ['Specialty coffee & artisanal dates private label', 'Healthy food microbrand packaging']
      };
    }
    // 6. قطاع الفنون والتصميم والعمارة أو الحاسبات والبيانات
    else if (field === 'arts_design' || field === 'tech_data') {
      const isTactileBrand = mat === 'mat_warm' || mat === 'mat_gloss';
      venture = isTactileBrand ? {
        title: ['تأسيس علامة تجارية متخصصة (Microbrand) للمنتجات التصميمية والجلدية والديكورية بالتصنيع بالقطعة', 'Design-Led Tactile Product Microbrand (Contract Manufacturing)'],
        en: 'Design-Led Product Microbrand',
        desc: ['تحويل موهبتك في التصميم أو العمارة إلى منتج ملموس عالي القيمة (وحدات إضاءة، منظمات مكاتب خشب ونحاس، محافظ وحقائب جلدية، أو منتجات ديكور)، مع تصنيعه بالقطعة لدى الورش المتخصصة دون امتلاك مصنع.', 'Channel your design/architectural eye into a high-margin physical product (lighting, desk setups, leather goods, decor) outsourced per-piece to specialized workshops.'],
        calc: {
          title: ['حاسبة القطعة التصميمية وهامش العلامة التجارية', 'Design Microbrand Unit Calculator'],
          labels: [['تكلفة الخامات الأساسية للقطعة (جلد/خشب/معدن)', 'Raw Materials Cost'], ['مصنعية الورشة بالقطعة (CNC / خياطة / تشطيب)', 'Workshop Per-Piece Labor'], ['علبة التغليف المبتكرة وتجربة فتح الصندوق', 'Custom Unboxing Packaging'], ['تكلفة الشحن والتوصيل للعميل', 'Courier Shipping'], ['تكلفة الإعلان لاكتساب العميل (CAC)', 'Ad Spend per Sale (CAC)']],
          def: { c1: 135, c2: 65, c3: 25, c4: 40, c5: 50, price: 460 }
        },
        exp: ['صمم منتجًا واحدًا فقط (Hero Product)، ونفذ منه 5 عينات لدى ورشة متقنة، وصوره في إضاءة طبيعية لاختبار البيع الفعلي قبل إنتاج 50 قطعة.', 'Design a single Hero Product, produce 5 samples at a workshop, shoot in natural light, and validate real orders before batch production.'],
        risk: ['لا تشتت ميزانيتك في 10 تصميمات؛ ابدأ بمنتج واحد فقط يحل مشكلة واضحة واضبط جودته.', 'Start with a single hero SKU rather than spreading your budget thin across multiple designs.'],
        kwAr: ['ورش تصنيع بالقطعة للجلود والأخشاب والإضاءة والديكور', 'تأسيس مايكروبراند وتصميم علب التغليف'],
        kwEn: ['Contract manufacturing microbrand low MOQ', 'Industrial & craft product design brand']
      } : {
        title: ['استوديو بناء المواقع التفاعلية وأتمتة الأعمال بالذكاء الاصطناعي وبدون برمجة معقدة', 'No-Code Web Studio & B2B AI Automation Agency'],
        en: 'No-Code Web & AI Automation Studio',
        desc: ['تقديم حلول رقمية سريعة وعالية العائد للشركات والعيادات والمتاجر: تصميم مواقع حجز وصفحات هبوط تفاعلية، أو ربط أنظمة الرد الآلي وحجز المواعيد وإدارة العملاء مقابل رسوم تأسيس واشتراك شهري.', 'Build high-converting booking websites, landing pages, and automated WhatsApp/CRM workflows for clinics, brands, and SMEs on a setup + monthly retainer model.'],
        calc: {
          title: ['حاسبة تسعير المشروع الرقمي أو باقة الأتمتة', 'Digital Project & Automation Calculator'],
          labels: [['تكلفة الاستضافة والنطاق واشتراكات المنصات للعميل', 'Cloud Hosting & Platform Licenses'], ['اشتراكات أدوات الذكاء الاصطناعي والقوالب', 'AI & Template Tools'], ['تكلفة ساعات التصميم والإعداد والربط', 'Design & Setup Hours'], ['تكلفة التسويق والوصول للعميل', 'Client Acquisition'], ['احتياطي التعديلات والدعم الفني', 'Support & Revisions Buffer']],
          def: { c1: 350, c2: 200, c3: 450, c4: 250, c5: 150, price: 3200 }
        },
        exp: ['ابنِ نموذجًا حيًا يعمل على هاتفك لموقع أو نظام حجز آلي لعيادة أو مطعم في منطقتك، واعرض عليهم تجربته لمدة 5 أيام مجانًا.', 'Build a live demo on your phone for a local clinic or restaurant and offer a 5-day trial to close your first paid project.'],
        risk: ['حدد نطاق العمل (عدد الصفحات أو المهام المؤتمتة) في اتفاق مكتوب واضح قبل البدء.', 'Define exact project deliverables in a concise written scope before starting.'],
        kwAr: ['بناء مواقع ومنصات بدون كود بالذكاء الاصطناعي', 'أتمتة واتساب وحجز المواعيد للشركات والعيادات'],
        kwEn: ['No-code web agency Framer Webflow', 'B2B AI workflow automation n8n Make']
      };
    }
    // 7. قطاع التجارة والخدمات المهنية والتعليم وبقية التقاطعات
    else {
      const isServiceCreator = primaryCore === 'creator' || primaryCore === 'performer' || field === 'services_edu' || user.localRaw === 'no_special_raw';
      venture = isServiceCreator ? {
        title: ['وكالة خدمات مهنية أو تعليمية أو تشغيلية مجمعة في باقات واضحة السعر (Productized Service)', 'Productized Professional, Educational or Facility Service Agency'],
        en: 'Productized Service Agency',
        desc: ['تحويل خبرتك في التنظيم أو الإدارة أو التعليم أو الخدمات إلى «باقة محددة المهام والسعر» توفر الوقت والجهد على الشركات أو الأسر (مثل: ضبط تكاليف وحسابات الورش، تنسيق وصيانة المكاتب والعيادات، أو برامج تدريبية تطبيقية مصغرة).', 'Package your organizational, advisory, educational, or facility expertise into a fixed-scope, fixed-price service for businesses or busy families.'],
        calc: {
          title: ['حاسبة باقة الخدمة الموحدة (لكل عميل أو اشتراك)', 'Productized Service Package Calculator'],
          labels: [['تكلفة المنفذين المساعدين أو ساعات العمل للباقة', 'Execution / Assistant Hours'], ['الأدوات أو المطبوعات أو المستهلكات للعميل', 'Tools, Templates & Consumables'], ['تكلفة الانتقالات أو المنصة الرقمية', 'Transport / Platform Cost'], ['تكلفة التسويق وجلب العميل', 'Client Acquisition Cost'], ['احتياطي ضمان الجودة والمتابعة', 'Quality Guarantee Buffer']],
          def: { c1: 300, c2: 90, c3: 60, c4: 100, c5: 50, price: 1150 }
        },
        exp: ['صمم باقة خدمة واحدة واضحة النتيجة، ونفذها لـ 5 عملاء بسعر إطلاقي مقابل تقييم مكتوب وعقد اشتراك شهري.', 'Define 1 clear service package and deliver it to 5 pilot clients for a written testimonial and monthly retainer renewal.'],
        risk: ['اعتمد قائمة فحص قياسية (Checklist) لكل عملية تسليم حتى تستطيع تفويض الخدمة لمساعدين لاحقًا.', 'Standardize delivery with a 10-point checklist so you can delegate execution as you scale.'],
        kwAr: ['تحويل الخدمات المهنية والتشغيلية إلى باقات اشتراك شهري', 'خدمات إدارة المرافق وضبط التكاليف والتدريب للشركات'],
        kwEn: ['Productized service business model', 'B2B recurring retainer service agency']
      } : {
        title: ['وكالة التوريد التجاري بالعينات وعقود التوزيع النقدي وبناء العلامات بنظام الوايت لابل', 'Smart B2B Sample Brokerage, Route Supply & White-Label Trade'],
        en: 'Smart B2B Supply & White-Label Trade',
        desc: ['الربط الذكي بين المصانع المحلية والمشترين التجاريين (محلات، كافيهات، عيادات، أو متاجر إلكترونية) عبر أخذ عينات قياسية وتوريد البضائع سريعة الدوران نقدًا أو تحت علامتك الخاصة (White Label) دون تجميد رأس المال في مخزون راكد.', 'Bridge local factories and commercial buyers using physical sample kits, fulfilling fast-moving goods on cash terms or under your own White-Label packaging.'],
        calc: {
          title: ['حاسبة الكرتونة / الوحدة في التوريد التجاري أو الوايت لابل', 'Commercial Supply / White-Label Unit Calculator'],
          labels: [['سعر شراء الوحدة أو الكرتونة من المصنع نقدًا', 'Factory Cash Buy Price'], ['تكلفة التغليف المخصص أو الفرز والنقل', 'Custom Packaging / Freight'], ['تكلفة التوصيل للمشتري', 'Delivery to Buyer'], ['تكلفة العينات والتسويق التجاري', 'Sample Kit & Marketing'], ['خصم الدفع النقدي الفوري', 'Cash-on-Delivery Discount']],
          def: { c1: 280, c2: 25, c3: 15, c4: 20, c5: 10, price: 450 }
        },
        exp: ['اتفق مع مصنعين على عينات لـ 3 أصناف أساسية، واعرضها على 15 مشتريًا مستهدفًا؛ لا تسحب البضاعة إلا بعد تأكيد 5 طلبات نقدية.', 'Secure 3 core product samples from local factories and lock in 5 cash orders from target buyers before pulling inventory.'],
        risk: ['الالتزام التام بالبيع النقدي عند التسليم وفحص مطابقة البضاعة للعينة المعتمدة.', 'Enforce strict cash-on-delivery and inspect every batch against your approved sample.'],
        kwAr: ['مصانع التصنيع للغير وايت لابل وتجارة الجملة السريعة', 'توريد مستهلكات الكافيهات والعيادات والمحلات بالكاش'],
        kwEn: ['White label & B2B cash distribution', 'Sample-based wholesale brokerage']
      };
    }

    const supplierClusters = isEgypt
      ? [
          ['مصر (القاهرة، الإسكندرية، والأقاليم): المدن الصناعية (العاشر من رمضان، العبور، السادس من أكتوبر، برج العرب، السادات) للتصنيع التعاقدي والخامات، وأسواق الجملة المتخصصة (شارع الجمهورية للمعدات والأجهزة الطبية، شارع الجيش للكيمياويات والمعامل، باب الشعرية والجمالية للجلود والمعادن، درب البرابرة للتغليف، والمنشية والعطارين).', 'Egypt Hubs: Industrial zones (10th of Ramadan, Obour, 6th of October, Borg El-Arab) for toll manufacturing & raw materials; specialized wholesale hubs (Gomhouria St. for machinery/medical gear, El-Geish St. for lab/chemicals, Bab El-Shaariya & Gamaliya, Darb El-Barabra, and Mansheya).']
        ]
      : [
          ['في بلدك والمنطقة العربية: المدن الصناعية ومناطق المستودعات المركزية، مصانع التصنيع للغير (Private Label)، الوكلاء المعتمدون للمعدات الطبية والهندسية والفندقية، ومنصات التوريد التجاري B2B.', 'In Your Country & MENA: Local industrial cities, central wholesale depots, licensed private-label factories, authorized medical/engineering/hospitality dealers, and B2B sourcing platforms.']
        ];

    const legalSteps = isEgypt
      ? [
          { stage: ['1. مرحلة التحقق والعينات', '1. MVP Validation'], req: ['اختبار العينات والتعامل مع مصانع وموردين مرخصين بفواتير ضريبية رسمية', 'Validate MVP samples through licensed factories and suppliers with official invoices'], auth: ['جهاز تنمية المشروعات (MSMEDA)', 'MSMEDA'], url: 'https://www.msmeda.org.eg' },
          { stage: ['2. الكيان القانوني والحوافز', '2. Legal Entity & Incentives'], req: ['السجل التجاري والبطاقة الضريبية والاستفادة من حوافز قانون المشروعات 152 لسنة 2020', 'Commercial Register, Tax Card & SME Law 152/2020 tax/licensing incentives'], auth: ['مصلحة الضرائب / تنمية التجارة', 'Tax Authority / ITDA'], url: 'https://www.eta.gov.eg' },
          { stage: ['3. الاعتماد الفني والقطاعي', '3. Sector Accreditation'], req: ['استيفاء اشتراطات الجهة المختصة بنشاطك (التنمية الصناعية IDA / هيئة الدواء EDA / سلامة الغذاء NFSA / السياحة / الطاقة)', 'Obtain sector clearance (IDA Industrial / EDA Drug Auth / NFSA Food Safety / Tourism / NREA Solar)'], auth: ['البوابة الحكومية المصرية', 'Egypt Digital Portal'], url: 'https://digital.gov.eg' }
        ]
      : [
          { stage: ['1. التحقق المبدئي', '1. Initial Validation'], req: ['التعاقد مع مصانع وموردين مرخصين رسميًا في بلدك قبل التوسع', 'Partner with officially licensed local factories and accredited suppliers'], auth: ['غرفة التجارة والصناعة', 'Chamber of Commerce'], url: 'https://www.unescwa.org' },
          { stage: ['2. الترخيص التجاري أو المهني', '2. Commercial / Professional License'], req: ['استخراج سجل المنشآت الصغيرة أو وثيقة العمل الحر أو الترخيص المهني للقطاع', 'Obtain an SME Commercial Register, Freelance Permit, or Sector License'], auth: ['وزارة التجارة والصناعة', 'Ministry of Commerce'], url: 'https://www.unescwa.org' }
        ];

    const effectiveCap = Math.max(cap, 3000);
    const c1 = Math.round(effectiveCap * 0.42), c2 = Math.round(effectiveCap * 0.18), c3 = Math.round(effectiveCap * 0.22), c4 = effectiveCap - (c1 + c2 + c3);

    return {
      compassText,
      prefersJobFirst,
      jobs: topJobs,
      venture: {
        ...venture,
        clusters: supplierClusters,
        legalSteps,
        capSplit: [
          { item: ['تنفيذ النموذج الأولي أو عينات الاختبار (MVP) أو تجهيز الخدمة', 'Initial MVP Prototype / Sample Batch / Service Setup'], amount: c1 },
          { item: ['أدوات القياس، التغليف، أو العرض الفني والتجاري', 'Testing Tools, Packaging & Technical Presentation'], amount: c2 },
          { item: ['اختبار الطلب الفعلي والتعاقد مع أول 10 عملاء', 'Demand Validation & First 10 Clients'], amount: c3 },
          { item: ['احتياطي سيولة نقدية لحماية التشغيل', 'Operating Cash Reserve'], amount: c4 }
        ],
        fiveSteps: [
          ['حدد المواصفة الفنية القياسية لأول عينة أو باقة خدمة.', 'Define the exact technical specification for your first sample or service package.'],
          ['اجمع 3 عروض أسعار من الموردين أو الورش وسجلها في مساحتك الشخصية.', 'Collect 3 quotes from suppliers/workshops and log them in your workspace.'],
          ['نفذ عينة الاختبار (MVP) واضبط تكلفة الوحدة وهامش المساهمة في الحاسبة.', 'Execute the MVP sample and verify unit margin in the calculator.'],
          ['اعرض العينة أو الخدمة للتعاقد الفعلي واكسب أول عميل راضٍ.', 'Pitch the MVP for real sale and win your first satisfied customer.'],
          ['استخدم سابقة الأعمال الأولى في التوسع التدريجي الآمن.', 'Use your first successful case study to scale safely.']
        ]
      }
    };
  }

  // دعم التشغيل كـ Serverless API على Vercel إذا وضع في api/engine.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = function(req, res) {
      try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const result = _runCompositeEngine(body.ans || {}, body.user || {}, body.assets || ['home_room'], body.assetMeta || {});
        res.status(200).json({ ok: true, data: result });
      } catch (err) {
        res.status(400).json({ ok: false });
      }
    };
  }

  if (typeof window === 'undefined') return;

  function fmtMoney(egp) {
    const v = egp / (FX[dispCurr] || 1), s = tr(SYM[dispCurr] || SYM.EGP);
    return dispCurr === 'EGP'
      ? Math.round(v).toLocaleString(LG === 'ar' ? 'ar-EG' : 'en-US') + ' ' + s
      : v.toLocaleString('en-US', { maximumFractionDigits: 1 }) + ' ' + s;
  }

  function getCapInEGP() {
    const el = document.getElementById('in-capital'), cEl = document.getElementById('in-cap-curr');
    const val = el ? parseFloat(el.value) : 20000;
    if (isNaN(val) || val < 0) return 0;
    return Math.round(val * (FX[cEl ? cEl.value : 'EGP'] || 1));
  }

  function updateCapPreview() {
    const cap = getCapInEGP();
    _S.user.capEGP = cap;
    const note = document.getElementById('cap-preview-note');
    if (note) note.textContent = `${tr(UI.capNote)} ${fmtMoney(cap)}`;
  }

  function renderQuizPage() {
    const g = QUESTION_PAGES[curPage - 1];
    if (!g) return;
    document.getElementById('page-title-lbl').textContent = tr(g.title);
    document.getElementById('page-step-lbl').textContent = `${curPage} / 5`;
    document.getElementById('page-prog-bar').style.width = (curPage * 20) + '%';
    document.getElementById('prev-page-btn').style.visibility = curPage === 1 ? 'hidden' : 'visible';

    document.getElementById('questions-mount').innerHTML = g.items.map(it => {
      const sel = _S.ans[it.id] || '';
      const optsHtml = it.opts.map(o => {
        const isSel = sel === o.v;
        return `<button type="button" class="opt ${isSel ? 'selected' : ''}" data-qid="${it.id}" data-val="${o.v}" aria-pressed="${isSel ? 'true' : 'false'}"><span>${esc(tr(o.t))}</span><span class="opt-check">✓</span></button>`;
      }).join('');
      return `<div class="q-block" id="qb-${it.id}"><span class="q-title">${esc(tr(it.q))}</span><div class="opts">${optsHtml}</div></div>`;
    }).join('');
  }

  function populatePage5Selects() {
    Object.keys(SELECT_OPTS).forEach(id => {
      const selEl = document.getElementById(id);
      if (!selEl) return;
      const curVal = selEl.value;
      selEl.innerHTML = SELECT_OPTS[id].map(([val, lblPair]) => `<option value="${val}">${esc(tr(lblPair))}</option>`).join('');
      if (curVal) selEl.value = curVal;
    });

    const box = document.getElementById('asset-cards-box');
    if (box) {
      box.innerHTML = ASSET_LIST.map(([k, lblPair]) => {
        const isSel = _S.assets.includes(k);
        return `<button type="button" class="opt ${isSel ? 'selected' : ''}" data-asset="${k}" aria-pressed="${isSel ? 'true' : 'false'}"><span>${esc(tr(lblPair))}</span><span class="opt-check">✓</span></button>`;
      }).join('');
    }
  }

  function syncInputsFromState() {
    if (_S.user.name) document.getElementById('in-name').value = _S.user.name;
    if (_S.user.age) document.getElementById('in-age').value = _S.user.age;
    if (_S.user.edu) document.getElementById('in-edu').value = _S.user.edu;
    if (_S.user.field) document.getElementById('in-field').value = _S.user.field;
    if (_S.user.country) document.getElementById('in-country').value = _S.user.country;
    if (_S.user.envType) document.getElementById('in-env-type').value = _S.user.envType;
    if (_S.user.localRaw) document.getElementById('in-local-raw').value = _S.user.localRaw;
    if (_S.user.firstAdopter) document.getElementById('in-first-adopter').value = _S.user.firstAdopter;
    if (_S.user.capEGP !== undefined) document.getElementById('in-capital').value = _S.user.capEGP;
    const panel = document.getElementById('asset-details-panel');
    if (panel) panel.style.display = _S.assets.includes('none') ? 'none' : 'block';
  }

  function readPage5Inputs() {
    _S.user.name = document.getElementById('in-name').value.trim();
    _S.user.age = document.getElementById('in-age').value;
    _S.user.edu = document.getElementById('in-edu').value;
    _S.user.field = document.getElementById('in-field').value;
    _S.user.country = document.getElementById('in-country').value;
    _S.user.envType = document.getElementById('in-env-type').value;
    _S.user.localRaw = document.getElementById('in-local-raw').value;
    _S.user.firstAdopter = document.getElementById('in-first-adopter').value;
    _S.user.capEGP = getCapInEGP();
    if (!_S.assets.includes('none')) {
      _S.assetMeta.own = document.getElementById('in-asset-own').value;
      _S.assetMeta.area = parseFloat(document.getElementById('in-asset-area').value) || 16;
      _S.assetMeta.util = document.getElementById('in-asset-util').value;
    }
    saveLocal();
  }

  function renderCapsulePage() {
    const res = _runCompositeEngine(_S.ans, _S.user, _S.assets, _S.assetMeta);
    _S.out = res;
    const v = res.venture;

    const jobsHtml = res.jobs.map((jb, i) => `
      <div class="box" style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:6px;">
          <strong style="font-size:.98rem;">${i + 1}. ${esc(LG === 'ar' ? jb.ar : jb.en)}</strong>
          ${termHtml(jb.en)}
        </div>
        <p style="font-size:.88rem;margin-bottom:6px;">${esc(tr(jb.why))}</p>
        <div style="font-size:.83rem;background:var(--paper);padding:8px 12px;border-radius:var(--r-sm);border:1px solid var(--line);">
          <div><strong>${esc(tr(UI.jobSkillLbl))}</strong> ${esc(tr(jb.skill))}</div>
          <div style="margin-top:4px;"><strong>${esc(tr(UI.jobSectorLbl))}</strong> ${esc(tr(jb.sector))}</div>
        </div>
      </div>
    `).join('');

    const splitRows = v.capSplit.map(s => `<tr><td>${esc(tr(s.item))}</td><td><strong>${fmtMoney(s.amount)}</strong></td></tr>`).join('');
    const legalRows = v.legalSteps.map(l => `<tr><td><strong>${esc(tr(l.stage))}</strong></td><td>${esc(tr(l.req))}</td><td><a href="${esc(l.url)}" target="_blank" rel="noopener" class="btn ghost sm">${esc(tr(l.auth))} ↗</a></td></tr>`).join('');
    const kwHtml = v.kwAr.concat(v.kwEn).map(k => termHtml(k)).join(' ');

    const showJobsBlock = activeTab === 'both' || activeTab === 'jobs';
    const showBizBlock = activeTab === 'both' || activeTab === 'biz';

    document.getElementById('capsule-mount').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
        <span class="tag solid">${esc(tr(UI.compassTag))}</span>
        <button type="button" class="btn ghost sm" onclick="App.goPage(5)">${esc(tr(UI.editBtn))}</button>
      </div>

      <div class="box strong">
        <p style="font-weight:600;margin-bottom:6px;">${esc(res.compassText)}</p>
        <p class="muted" style="font-size:.83rem;">${esc(tr(res.prefersJobFirst ? UI.readinessJob : UI.readinessBiz))}</p>
      </div>

      <div class="mode-tabs">
        <button type="button" class="mode-tab ${activeTab === 'jobs' || activeTab === 'both' ? 'active' : ''}" onclick="App.setResultTab('jobs')">${esc(tr(UI.tabJobs))}</button>
        <button type="button" class="mode-tab ${activeTab === 'biz' || activeTab === 'both' ? 'active' : ''}" onclick="App.setResultTab('biz')">${esc(tr(UI.tabBiz))}</button>
      </div>

      <div class="${showJobsBlock ? '' : 'hidden'}">
        <h2 style="margin-bottom:12px;">${esc(tr(UI.jobsHeader))}</h2>
        ${jobsHtml}
      </div>

      <div class="${showBizBlock ? '' : 'hidden'}" style="margin-top:24px;padding-top:18px;border-top:1px solid var(--line);">
        <span class="tag solid" style="margin-bottom:8px;">${esc(tr(UI.bizHeader))}</span>
        <h2>${esc(tr(v.title))} ${termHtml(v.en)}</h2>
        <p style="margin-bottom:14px;">${esc(tr(v.desc))}</p>

        <h3>${esc(tr(UI.sec1))} (${fmtMoney(Math.max(_S.user.capEGP, 3000))})</h3>
        <div class="table-wrap"><table class="mono-tbl"><thead><tr><th>${esc(tr(UI.colItem))}</th><th>${esc(tr(UI.colAmt))}</th></tr></thead><tbody>${splitRows}</tbody></table></div>

        <div class="grid-2" style="margin:16px 0;">
          <div class="box strong" style="margin-bottom:0;"><h3>${esc(tr(UI.sec2))}</h3><p style="font-size:.88rem;">${esc(tr(v.exp))}</p></div>
          <div class="box" style="margin-bottom:0;"><h3>${esc(tr(UI.sec3))}</h3><p style="font-size:.88rem;">${esc(tr(v.risk))}</p></div>
        </div>

        <div class="box"><h3>${esc(tr(UI.sec4))}</h3><ol style="padding-inline-start:20px;font-size:.88rem;">${v.fiveSteps.map(s => `<li>${esc(tr(s))}</li>`).join('')}</ol></div>
        <div class="box"><h3>${esc(tr(UI.sec5))}</h3><ul style="padding-inline-start:18px;font-size:.86rem;margin-bottom:10px;">${v.clusters.map(c => `<li>${esc(tr(c))}</li>`).join('')}</ul><div style="line-height:2;">${kwHtml}</div></div>

        <h3>${esc(tr(UI.sec6))}</h3>
        <div class="table-wrap"><table class="mono-tbl"><thead><tr><th>${esc(tr(UI.colStage))}</th><th>${esc(tr(UI.colReq))}</th><th>${esc(tr(UI.colAuth))}</th></tr></thead><tbody>${legalRows}</tbody></table></div>
      </div>

      <div class="box strong" style="background:var(--soft);margin-top:18px;">
        <h3>${esc(tr(UI.openWsTitle))}</h3>
        <div class="grid-2" style="margin:10px 0;">
          <input type="text" id="cap-name" value="${esc(_S.user.name)}" placeholder="${esc(tr(UI.name))}">
          <input type="email" id="cap-email" value="${esc(_S.user.email)}" placeholder="Email (Optional)" dir="ltr" style="text-align:left;">
        </div>
        <div class="row-between" style="margin-top:8px;padding-top:10px;">
          <button type="button" class="btn ghost sm" onclick="App.sharePartnerLink()">${esc(tr(UI.partnerBtn))}</button>
          <button type="button" class="btn" onclick="App.openWorkspace()">${esc(tr(UI.openWsBtn))}</button>
        </div>
      </div>
    `;
  }

  function renderWorkspacePage() {
    const res = _S.out || _runCompositeEngine(_S.ans, _S.user, _S.assets, _S.assetMeta);
    const v = res.venture;
    const uName = _S.user.name || (LG === 'ar' ? 'صديقنا' : 'Founder');
    const wsUrl = `${window.location.origin}${window.location.pathname}?ws_token=${_S.user.token || '1'}`;

    const quotes = _S.ws.quotes;
    let minL = Infinity;
    quotes.forEach(q => { const l = q.price + (q.ship / Math.max(q.moq, 1)) + (q.price * (q.waste / 100)); if (l < minL) minL = l; });
    const qRows = quotes.map((q, idx) => {
      const landed = q.price + (q.ship / Math.max(q.moq, 1)) + (q.price * (q.waste / 100));
      const best = quotes.length > 1 && Math.abs(landed - minL) < 0.01;
      return `<tr><td><strong>${esc(q.name)}</strong></td><td>${esc(q.mat)}</td><td>${fmtMoney(q.price)}</td><td>${q.moq}</td><td><strong>${fmtMoney(Math.round(landed))}</strong> ${best ? `<span class="tag solid">${esc(tr(UI.bestTag))}</span>` : ''}</td><td><button type="button" class="btn ghost sm" onclick="App.delQuote(${idx})">${esc(tr(UI.delBtn))}</button></td></tr>`;
    }).join('');

    const c = _S.ws.calc;
    const varCost = (c.c1 || 0) + (c.c2 || 0) + (c.c3 || 0) + (c.c4 || 0) + (c.c5 || 0);
    const margin = (c.price || 0) - varCost, marginPct = c.price > 0 ? Math.round((margin / c.price) * 100) : 0;

    document.getElementById('workspace-mount').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--line);">
        <div><h2>${esc(tr(UI.welcome))} ${esc(uName)}</h2><p class="muted" style="font-size:.84rem;">${esc(tr(v.title))}</p></div>
        <button type="button" class="btn ghost sm" onclick="App.copyWsLink('${wsUrl}',this)">${esc(tr(UI.copyLink))}</button>
      </div>
      <h3>1. ${esc(tr(v.calc.title))}</h3>
      <div class="grid-3" style="margin-bottom:10px;">
        <div><label class="muted" style="font-size:.75rem;">${esc(tr(v.calc.labels[0]))}</label><input type="number" id="uc-1" value="${c.c1}" oninput="App.recalcWsUnit()"></div>
        <div><label class="muted" style="font-size:.75rem;">${esc(tr(v.calc.labels[1]))}</label><input type="number" id="uc-2" value="${c.c2}" oninput="App.recalcWsUnit()"></div>
        <div><label class="muted" style="font-size:.75rem;">${esc(tr(v.calc.labels[2]))}</label><input type="number" id="uc-3" value="${c.c3}" oninput="App.recalcWsUnit()"></div>
        <div><label class="muted" style="font-size:.75rem;">${esc(tr(v.calc.labels[3]))}</label><input type="number" id="uc-4" value="${c.c4}" oninput="App.recalcWsUnit()"></div>
        <div><label class="muted" style="font-size:.75rem;">${esc(tr(v.calc.labels[4]))}</label><input type="number" id="uc-5" value="${c.c5}" oninput="App.recalcWsUnit()"></div>
        <div><label style="font-size:.76rem;font-weight:700;">${esc(tr(UI.sellPrice))}</label><input type="number" id="uc-p" value="${c.price}" oninput="App.recalcWsUnit()"></div>
      </div>
      <div class="box strong" id="uc-summary">${esc(tr(UI.varCost))} <strong>${fmtMoney(varCost)}</strong> | ${esc(tr(UI.netMargin))} <strong>${fmtMoney(margin)} (${marginPct}%)</strong></div>

      <h3 style="margin-top:20px;">${esc(tr(UI.quotesTitle))}</h3>
      <div class="box">
        <div class="grid-3" style="margin-bottom:8px;">
          <input type="text" id="q-in-name" placeholder="${esc(tr(UI.qName))}"><input type="text" id="q-in-area" placeholder="${esc(tr(UI.qArea))}"><input type="text" id="q-in-mat" placeholder="${esc(tr(UI.qMat))}">
        </div>
        <div class="grid-3">
          <input type="number" id="q-in-price" placeholder="${esc(tr(UI.qPrice))}" min="1"><input type="number" id="q-in-moq" placeholder="${esc(tr(UI.qMoq))}" value="50" min="1"><input type="number" id="q-in-ship" placeholder="${esc(tr(UI.qShip))}" value="150" min="0">
        </div>
        <div class="grid-2" style="margin-top:8px;">
          <input type="number" id="q-in-waste" placeholder="${esc(tr(UI.qWaste))}" value="3" min="0"><button type="button" class="btn" onclick="App.addQuote()">${esc(tr(UI.addQuoteBtn))}</button>
        </div>
      </div>
      <div class="table-wrap"><table class="mono-tbl"><thead><tr><th>${esc(tr(UI.qName))}</th><th>${esc(tr(UI.qMat))}</th><th>${esc(tr(UI.qPrice))}</th><th>MOQ</th><th>${esc(tr(UI.colTotalUnit))}</th><th>${esc(tr(UI.delBtn))}</th></tr></thead><tbody>${qRows || `<tr><td colspan="6" class="muted" style="text-align:center;">${esc(tr(UI.emptyQuotes))}</td></tr>`}</tbody></table></div>

      <h3 style="margin-top:20px;">${esc(tr(UI.tasksTitle))}</h3>
      ${v.fiveSteps.map((st, idx) => { const d = Boolean(_S.ws.tasks['t_' + idx]); return `<div class="task-item ${d ? 'done' : ''}" onclick="App.toggleTask(${idx})"><span class="opt-check" style="${d ? 'background:#fff;color:#111;border-color:#fff;' : ''}">${d ? '✓' : ''}</span><span>${idx + 1}. ${esc(tr(st))}</span></div>`; }).join('')}

      <div class="row-between">
        <button type="button" class="btn ghost sm" onclick="App.goPage(6)">${esc(tr(UI.backPlan))}</button>
        <div style="display:flex;gap:6px;"><button type="button" class="btn ghost sm" onclick="App.exportDataJSON()">${esc(tr(UI.dlJson))}</button><button type="button" class="btn ghost sm" onclick="App.clearAllData()">${esc(tr(UI.clrData))}</button></div>
      </div>
    `;
  }

  function saveLocal() { try { localStorage.setItem('ebda2_v16', JSON.stringify(_S)); } catch (e) {} }
  function loadLocal() {
    try {
      const raw = localStorage.getItem('ebda2_v16'); if (!raw) return;
      const d = JSON.parse(raw);
      if (d.ans) _S.ans = d.ans; if (d.assets) _S.assets = d.assets; if (d.assetMeta) _S.assetMeta = { ..._S.assetMeta, ...d.assetMeta };
      if (d.user) _S.user = { ..._S.user, ...d.user }; if (d.ws) _S.ws = { ..._S.ws, ...d.ws };
      if (_S.user.token) document.getElementById('nav-ws-btn').classList.remove('hidden');
    } catch (e) {}
  }

  document.addEventListener('click', function(e) {
    const optBtn = e.target.closest('.opt[data-qid]');
    if (optBtn) {
      const qId = optBtn.getAttribute('data-qid'), val = optBtn.getAttribute('data-val');
      _S.ans[qId] = val;
      const block = document.getElementById('qb-' + qId);
      if (block) {
        block.classList.remove('missing');
        block.querySelectorAll('.opt').forEach(b => { b.classList.remove('selected'); b.setAttribute('aria-pressed', 'false'); });
      }
      optBtn.classList.add('selected');
      optBtn.setAttribute('aria-pressed', 'true');
      saveLocal();
      return;
    }

    const assetBtn = e.target.closest('.opt[data-asset]');
    if (assetBtn) {
      const key = assetBtn.getAttribute('data-asset'), box = document.getElementById('asset-cards-box');
      if (key === 'none') _S.assets = ['none'];
      else {
        _S.assets = _S.assets.filter(a => a !== 'none');
        if (_S.assets.includes(key)) _S.assets = _S.assets.filter(a => a !== key);
        else _S.assets.push(key);
        if (!_S.assets.length) _S.assets = ['none'];
      }
      box.querySelectorAll('.opt').forEach(b => {
        const isSel = _S.assets.includes(b.getAttribute('data-asset'));
        b.classList.toggle('selected', isSel);
        b.setAttribute('aria-pressed', isSel ? 'true' : 'false');
      });
      const panel = document.getElementById('asset-details-panel');
      if (panel) panel.style.display = _S.assets.includes('none') ? 'none' : 'block';
      saveLocal();
      return;
    }

    const copyBtn = e.target.closest('.copy-btn[data-en]');
    if (copyBtn && navigator.clipboard) {
      navigator.clipboard.writeText(copyBtn.getAttribute('data-en') || '').then(() => {
        copyBtn.textContent = tr(UI.copiedWord);
        setTimeout(() => { copyBtn.textContent = tr(UI.copyWord); }, 1200);
      });
    }
  });

  const App = {
    setLang(lang) {
      LG = lang;
      try { localStorage.setItem('ebda2_lang', lang); } catch (e) {}
      document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.getElementById('btn-lang-ar').classList.toggle('active', lang === 'ar');
      document.getElementById('btn-lang-en').classList.toggle('active', lang === 'en');

      document.getElementById('ui-brand').textContent = tr(UI.brand);
      document.getElementById('ui-about-link').textContent = tr(UI.about);
      document.getElementById('nav-ws-btn').textContent = tr(UI.wsBtn);
      document.getElementById('ui-usd-lbl').textContent = tr(UI.usdLbl);
      document.getElementById('ui-hook').textContent = tr(UI.hook);
      document.getElementById('prev-page-btn').textContent = tr(UI.prev);
      document.getElementById('next-page-btn').textContent = tr(UI.next);
      document.getElementById('ui-p5-title').textContent = tr(UI.p5Title);
      document.getElementById('lbl-name').textContent = tr(UI.name);
      document.getElementById('lbl-age').textContent = tr(UI.age);
      document.getElementById('lbl-edu').textContent = tr(UI.edu);
      document.getElementById('lbl-field').textContent = tr(UI.field);
      document.getElementById('lbl-country').textContent = tr(UI.country);
      document.getElementById('lbl-env-type').textContent = tr(UI.envType);
      document.getElementById('lbl-local-raw').textContent = tr(UI.localRaw);
      document.getElementById('lbl-first-adopter').textContent = tr(UI.firstAdopter);
      document.getElementById('lbl-assets-box').textContent = tr(UI.assetsBox);
      document.getElementById('lbl-asset-own').textContent = tr(UI.assetOwn);
      document.getElementById('lbl-asset-area').textContent = tr(UI.assetArea);
      document.getElementById('lbl-asset-util').textContent = tr(UI.assetUtil);
      document.getElementById('lbl-capital').textContent = tr(UI.capital);
      document.getElementById('lbl-cap-curr').textContent = tr(UI.capCurr);
      document.getElementById('btn-p5-back').textContent = tr(UI.prev);
      document.getElementById('btn-p5-go').textContent = tr(UI.showPlan);

      populatePage5Selects();
      syncInputsFromState();
      updateCapPreview();

      if (curPage >= 1 && curPage <= 4) renderQuizPage();
      if (curPage === 6) renderCapsulePage();
      if (curPage === 7) renderWorkspacePage();
    },
    nextPage() {
      const g = QUESTION_PAGES[curPage - 1];
      if (g) {
        for (const it of g.items) {
          if (!_S.ans[it.id]) {
            const b = document.getElementById('qb-' + it.id);
            if (b) { b.classList.add('missing'); b.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
            return;
          }
        }
      }
      if (curPage === 4 && partnerParams) { App.showPartnerReport(); return; }
      App.goPage(curPage + 1);
    },
    prevPage() { if (curPage > 1) App.goPage(curPage - 1); },
    goPage(p) {
      curPage = p;
      document.getElementById('quiz-page-card').classList.toggle('hidden', p < 1 || p > 4);
      document.getElementById('page-5-card').classList.toggle('hidden', p !== 5);
      document.getElementById('page-6-card').classList.toggle('hidden', p !== 6);
      document.getElementById('page-7-card').classList.toggle('hidden', p !== 7);
      if (p >= 1 && p <= 4) renderQuizPage();
      if (p === 6) renderCapsulePage();
      if (p === 7) renderWorkspacePage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    showResults() {
      readPage5Inputs();
      const res = _runCompositeEngine(_S.ans, _S.user, _S.assets, _S.assetMeta);
      _S.out = res;
      _S.ws.calc = { ...res.venture.calc.def };
      activeTab = 'both';
      saveLocal();
      App.goPage(6);
    },
    setResultTab(tab) {
      activeTab = activeTab === tab ? 'both' : tab;
      renderCapsulePage();
    },
    changeCurrency() {
      dispCurr = document.getElementById('curr-select').value;
      updateCapPreview();
      if (curPage === 6) renderCapsulePage();
      if (curPage === 7) renderWorkspacePage();
    },
    updateCapPreview,
    openWorkspace() {
      const nEl = document.getElementById('cap-name'), eEl = document.getElementById('cap-email');
      if (nEl && nEl.value.trim()) _S.user.name = nEl.value.trim();
      if (eEl && eEl.value.trim()) _S.user.email = eEl.value.trim();
      if (!_S.user.token) _S.user.token = Math.random().toString(36).substring(2, 12);
      document.getElementById('nav-ws-btn').classList.remove('hidden');
      saveLocal();
      App.goPage(7);
    },
    recalcWsUnit() {
      const c = _S.ws.calc;
      c.c1 = parseFloat(document.getElementById('uc-1').value) || 0;
      c.c2 = parseFloat(document.getElementById('uc-2').value) || 0;
      c.c3 = parseFloat(document.getElementById('uc-3').value) || 0;
      c.c4 = parseFloat(document.getElementById('uc-4').value) || 0;
      c.c5 = parseFloat(document.getElementById('uc-5').value) || 0;
      c.price = parseFloat(document.getElementById('uc-p').value) || 0;
      saveLocal();
      const v = c.c1 + c.c2 + c.c3 + c.c4 + c.c5, m = c.price - v, p = c.price > 0 ? Math.round((m / c.price) * 100) : 0;
      const b = document.getElementById('uc-summary');
      if (b) b.innerHTML = `${esc(tr(UI.varCost))} <strong>${fmtMoney(v)}</strong> | ${esc(tr(UI.netMargin))} <strong>${fmtMoney(m)} (${p}%)</strong>`;
    },
    addQuote() {
      const name = document.getElementById('q-in-name').value.trim(), area = document.getElementById('q-in-area').value.trim() || '—', mat = document.getElementById('q-in-mat').value.trim() || '—';
      const price = parseFloat(document.getElementById('q-in-price').value), moq = parseInt(document.getElementById('q-in-moq').value, 10) || 1, ship = parseFloat(document.getElementById('q-in-ship').value) || 0, waste = parseFloat(document.getElementById('q-in-waste').value) || 0;
      if (!name || isNaN(price) || price <= 0) return;
      _S.ws.quotes.push({ name, area, mat, price, moq, ship, waste });
      saveLocal(); renderWorkspacePage();
    },
    delQuote(i) { _S.ws.quotes.splice(i, 1); saveLocal(); renderWorkspacePage(); },
    toggleTask(i) { _S.ws.tasks['t_' + i] = !_S.ws.tasks['t_' + i]; saveLocal(); renderWorkspacePage(); },
    copyWsLink(u, b) { if (navigator.clipboard) navigator.clipboard.writeText(u).then(() => { b.textContent = tr(UI.copiedWord); setTimeout(() => b.textContent = tr(UI.copyLink), 1400); }); },
    sharePartnerLink() { const u = `${window.location.origin}${window.location.pathname}?partner_check=1&hq1=${encodeURIComponent(_S.ans.q1 || '')}&hq9=${encodeURIComponent(_S.ans.q9 || '')}`; if (navigator.clipboard) navigator.clipboard.writeText(u).then(() => alert(LG === 'ar' ? 'تم نسخ رابط اختبار الشريك.' : 'Partner test link copied.')); },
    showPartnerReport() {
      let s = 55; if (_S.ans.q1 !== partnerParams.hq1) s += 25; if (_S.ans.q9 !== partnerParams.hq9) s += 15;
      const b = document.getElementById('partner-banner');
      b.innerHTML = `<h3>${LG === 'ar' ? 'نسبة التكامل مع شريكك:' : 'Partner Synergy Score:'} ${s}%</h3><button type="button" class="btn sm" style="margin-top:8px;" onclick="window.location.href=window.location.pathname">${LG === 'ar' ? 'ابدأ تجربتك المستقلة' : 'Start Your Own Assessment'}</button>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    exportDataJSON() { const a = document.createElement('a'); a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(_S, null, 2)); a.download = 'my-compass.json'; document.body.appendChild(a); a.click(); a.remove(); },
    clearAllData() { if (confirm(LG === 'ar' ? 'حذف كافة البيانات؟' : 'Reset all data?')) { try { localStorage.removeItem('ebda2_v16'); } catch (e) {} window.location.href = window.location.pathname; } }
  };

  _G.App = App;

  loadLocal();
  App.setLang(LG);
  const p = new URLSearchParams(window.location.search);
  if (p.get('partner_check') === '1') {
    partnerParams = { hq1: p.get('hq1') || '', hq9: p.get('hq9') || '' };
    const b = document.getElementById('partner-banner');
    b.classList.remove('hidden');
    b.innerHTML = `<strong>${LG === 'ar' ? 'اختبار توافق الشريك: أجب عن الأسئلة لحساب درجة التكامل.' : 'Partner Fit Test: Answer the questions to calculate role synergy.'}</strong>`;
  }
  if (p.get('ws_token') && Object.keys(_S.ans).length === 12) App.goPage(7);

  fetch('https://open.er-api.com/v6/latest/USD').then(r => r.json()).then(d => {
    if (d && d.rates && d.rates.EGP) {
      FX.USD = d.rates.EGP; FX.SAR = FX.USD / (d.rates.SAR || 3.75); FX.AED = FX.USD / (d.rates.AED || 3.6725);
      const el = document.getElementById('fx-usd'); if (el) el.textContent = FX.USD.toFixed(2) + ' EGP';
      updateCapPreview();
    }
  }).catch(() => {});
})(typeof window !== 'undefined' ? window : global);

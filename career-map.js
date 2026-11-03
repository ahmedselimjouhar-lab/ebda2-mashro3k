/*
 * EBDA2 Career Map v4
 * Occupational task summaries are adapted from O*NET OnLine occupation pages.
 * Interest codes are O*NET Interest Profiler high-point codes where specified.
 * They describe U.S. occupational reference patterns, not Egyptian demand or
 * qualification rules. The creative-company profile is an explicitly marked
 * product archetype, not an official O*NET occupation.
 */
(function () {
  'use strict';
  window.EBDA_CAREER_MAP = {
    director: {
      interestCode: 'AE', sourceType: 'onet',
      tasksAr: ['تفسير النص أو الفكرة وتحويلها إلى رؤية للمشاهد','تحديد التكوين وحركة الكاميرا والصوت وحركة الممثلين','توجيه الفريق ومراجعة اللقطات والنسخة النهائية'],
      tasksEn: ['Interpret a script or idea as a visual direction','Plan framing, camera movement, sound, and performer movement','Guide the team and review scenes and the final cut'],
      frictionAr: 'تعديلات متكررة، ضغط المواعيد والميزانية، تنسيق فريق متعدد التخصصات، ومسؤولية القرار الإبداعي.',
      frictionEn: 'Repeated revisions, deadline and budget pressure, coordinating specialists, and owning creative decisions.',
      medium: ['visual','people','digital'], models: ['employee','freelance','company','micro','hybrid'],
      source: 'https://www.onetonline.org/link/summary/27-2012.00'
    },
    creative_company: {
      interestCode: 'EAC', sourceType: 'composite',
      tasksAr: ['تطوير فكرة أو عرض إنتاجي قابل للبيع','التفاوض مع العملاء وتحديد النطاق والتكلفة','تكوين فريق وإدارة الجودة والتسليم والتدفق النقدي'],
      tasksEn: ['Develop a sellable creative-production concept','Negotiate scope and cost with clients','Build a team and manage quality, delivery, and cash flow'],
      frictionAr: 'البيع والتحصيل وإدارة التعديلات والحقوق والتعاقدات إلى جانب العمل الإبداعي.',
      frictionEn: 'Sales, collections, revisions, rights, and contracts alongside creative work.',
      medium: ['visual','people','digital'], models: ['company','micro','hybrid'],
      source: 'https://www.onetonline.org/link/summary/27-2012.00',
      noteAr: 'ملف ريادي مركب للتوجيه، وليس تصنيفًا مهنيًا مستقلًا في O*NET.',
      noteEn: 'An exploratory entrepreneurial composite, not a standalone O*NET occupation.'
    },
    ceo: {
      interestCode: 'EC', sourceType: 'onet',
      tasksAr: ['تحديد أهداف المؤسسة وأولوياتها','توزيع الموارد ومتابعة الأداء','بناء العلاقات والتفاوض وتحمل مسؤولية النتائج'],
      tasksEn: ['Set organizational goals and priorities','Allocate resources and monitor performance','Build relationships, negotiate, and own outcomes'],
      frictionAr: 'قرارات ناقصة المعلومات، إدارة الأفراد، التدفق النقدي والمساءلة عن النتائج.',
      frictionEn: 'Decisions under uncertainty, people management, cash flow, and accountability.',
      medium: ['people','numbers','systems'], models: ['employee','company','micro','hybrid'],
      source: 'https://www.onetonline.org/link/summary/11-1011.00'
    },
    editor: {
      interestCode: 'AC', sourceType: 'onet',
      tasksAr: ['فرز اللقطات ومراجعة المادة الخام','ترتيب المشاهد وضبط الإيقاع والصوت','تنفيذ التعديلات وفق ملاحظات المخرج والعميل'],
      tasksEn: ['Review and select raw footage','Arrange scenes and refine pacing and sound','Revise the cut in response to director and client feedback'],
      frictionAr: 'العمل الطويل أمام الشاشة، مراجعات متكررة، وإدارة ملفات ضخمة ومواعيد تسليم.',
      frictionEn: 'Long screen sessions, repeated revisions, large media files, and delivery deadlines.',
      medium: ['visual','digital'], models: ['employee','freelance','micro','hybrid'],
      source: 'https://www.onetonline.org/link/summary/27-4032.00'
    },
    graphic: {
      interestCode: 'AC', sourceType: 'onet',
      tasksAr: ['فهم رسالة العميل والجمهور المستهدف','تطوير تكوينات بصرية واختيار الخطوط والألوان','مراجعة التصميم وتجهيز الملفات للنشر أو الطباعة'],
      tasksEn: ['Understand the client message and audience','Develop visual layouts and select type and color','Review designs and prepare files for digital or print use'],
      frictionAr: 'تفسير ملاحظات العميل، حدود الهوية، تعديلات كثيرة ومواعيد ضيقة.',
      frictionEn: 'Interpreting client feedback, brand constraints, many revisions, and tight deadlines.',
      medium: ['visual','digital'], models: ['employee','freelance','micro','hybrid'],
      source: 'https://www.onetonline.org/link/summary/27-1024.00'
    },
    architect: {
      interestCode: 'RCA', sourceType: 'onet',
      tasksAr: ['تحويل احتياج العميل إلى تصور للمساحة','إعداد الرسومات والنماذج ومراجعة المواد والقيود الفنية','التنسيق مع التخصصات ومراجعة التنفيذ'],
      tasksEn: ['Translate client needs into spatial concepts','Prepare drawings and models while checking materials and technical constraints','Coordinate with specialists and review implementation'],
      frictionAr: 'اشتراطات فنية وقانونية، تعديلات عميل، تنسيق تخصصات ومسؤولية سلامة.',
      frictionEn: 'Technical and legal constraints, client revisions, coordination, and safety responsibility.',
      medium: ['visual','digital','physical'], models: ['employee','freelance','company','hybrid'],
      source: 'https://www.onetonline.org/link/summary/17-1011.00'
    },
    mechanical: {
      interestCode: 'RIC', sourceType: 'onet',
      tasksAr: ['قراءة الرسومات والمخططات الفنية','تصميم أو اختبار مكونات وأنظمة ميكانيكية','تحليل الأعطال وتحسين الأداء والاعتمادية'],
      tasksEn: ['Read blueprints and technical schematics','Design or test mechanical components and systems','Diagnose failures and improve performance and reliability'],
      frictionAr: 'قيود المواصفات والسلامة، اختبارات متكررة، مسؤولية تقنية وتوثيق دقيق.',
      frictionEn: 'Specifications and safety constraints, repeated testing, technical accountability, and documentation.',
      medium: ['physical','systems','digital'], models: ['employee','freelance','company','hybrid'],
      source: 'https://www.onetonline.org/link/summary/17-2141.00'
    },
    software: {
      interestCode: 'IC', sourceType: 'onet',
      tasksAr: ['تحليل متطلبات المستخدم أو النظام','تصميم وكتابة واختبار الشيفرة','تصحيح الأخطاء وصيانة النظام وتوثيق التغييرات'],
      tasksEn: ['Analyze user and system requirements','Design, write, and test code','Debug, maintain, and document software changes'],
      frictionAr: 'تصحيح أخطاء غامضة، تغيّر المتطلبات، تعلم مستمر وعمل ذهني طويل.',
      frictionEn: 'Ambiguous bugs, changing requirements, continuous learning, and sustained cognitive work.',
      medium: ['digital','systems','numbers'], models: ['employee','freelance','company','hybrid'],
      source: 'https://www.onetonline.org/link/summary/15-1252.00'
    },
    data: {
      interestCode: 'IC', sourceType: 'onet',
      tasksAr: ['تنظيف مجموعات بيانات وفهم جودتها','اختبار فرضيات وبناء نماذج وتحليلات','عرض النتائج بصريًا وشرح حدودها'],
      tasksEn: ['Clean datasets and assess data quality','Test hypotheses and build analytical models','Visualize findings and explain their limitations'],
      frictionAr: 'بيانات ناقصة أو متحيزة، تحقق متكرر، وإيصال نتائج تقنية لغير المتخصصين.',
      frictionEn: 'Incomplete or biased data, repeated validation, and explaining technical findings to non-specialists.',
      medium: ['numbers','digital','systems'], models: ['employee','freelance','company','hybrid'],
      source: 'https://www.onetonline.org/link/summary/15-2051.00'
    },
    nurse: {
      interestCode: 'SCI', sourceType: 'onet',
      tasksAr: ['تقييم احتياجات المريض وملاحظة التغيرات','تنفيذ خطة الرعاية وتوثيقها','التنسيق مع المرضى وأسرهم والفريق الطبي'],
      tasksEn: ['Assess patient needs and observe changes','Deliver and document nursing care','Coordinate with patients, families, and the clinical team'],
      frictionAr: 'مناوبات وضغط عاطفي وجسدي، إجراءات دقيقة، ومسؤولية مهنية مرخصة.',
      frictionEn: 'Shift work, emotional and physical demands, precise procedures, and licensed professional accountability.',
      medium: ['people','living','systems'], models: ['employee','hybrid'],
      source: 'https://www.onetonline.org/link/summary/29-1141.00',
      noteAr: 'الممارسة السريرية تتطلب المؤهل والتدريب والترخيص المحلي.', noteEn: 'Clinical practice requires locally recognized education, training, and licensure.'
    },
    accountant: {
      interestCode: 'CEI', sourceType: 'onet',
      tasksAr: ['تسجيل المعاملات وتصنيفها','مطابقة الحسابات واكتشاف الفروق','إعداد التقارير المالية ومراجعة الالتزام بالإجراءات'],
      tasksEn: ['Record and classify transactions','Reconcile accounts and detect discrepancies','Prepare financial reports and review procedural compliance'],
      frictionAr: 'مواعيد إقفال، تكرار ودقة عالية، وتحديث مستمر للضرائب والقواعد.',
      frictionEn: 'Closing deadlines, repetitive precision, and changing tax and reporting rules.',
      medium: ['numbers','systems','digital'], models: ['employee','freelance','micro','hybrid'],
      source: 'https://www.onetonline.org/link/summary/13-2011.00'
    },
    chef: {
      interestCode: 'ERC', sourceType: 'onet',
      tasksAr: ['تحضير الطعام وضبط الوصفة والتوقيت','فحص جودة المكونات والنظافة','إدارة المخزون وتنسيق عمل المطبخ'],
      tasksEn: ['Prepare food and control recipes and timing','Inspect ingredient quality and sanitation','Manage inventory and coordinate kitchen work'],
      frictionAr: 'وقوف طويل وحرارة وضغط توقيت وتلف خامات ومسؤولية سلامة الغذاء.',
      frictionEn: 'Long periods standing, heat, time pressure, perishable inputs, and food-safety responsibility.',
      medium: ['physical','living','people'], models: ['employee','freelance','micro','company','hybrid'],
      source: 'https://www.onetonline.org/link/summary/35-1011.00'
    },
    webdeveloper: {
      interestCode: 'CI', sourceType: 'onet', onet: '15-1254.00',
      tasksAr: ['بناء صفحات وتطبيقات ويب وصيانتها','اختبار التوافق والأداء وإصلاح المشكلات','تنظيم البيانات والربط بالخدمات الأخرى'],
      tasksEn: ['Build and maintain websites and web applications','Test compatibility and performance and fix issues','Structure data and integrate external services'],
      frictionAr: 'تحديثات مستمرة، توافق متصفحات، أمن وخصوصية، ومشكلات استضافة.',
      frictionEn: 'Continuous updates, browser compatibility, security and privacy, and hosting issues.',
      medium: ['digital','systems'], models: ['employee','freelance','company','hybrid'], source: 'https://www.onetonline.org/link/summary/15-1254.00'
    },
    market_research: {
      interestCode: 'ECI', sourceType: 'onet', onet: '13-1161.00',
      tasksAr: ['تصميم استبيان أو مقابلات لفهم العميل','تحليل سلوك المستهلك والمنافسين','تحويل النتائج إلى تقرير وتوصيات تسويقية'],
      tasksEn: ['Design surveys or interviews to understand customers','Analyze consumer and competitor behavior','Turn findings into reports and marketing recommendations'],
      frictionAr: 'صعوبة الوصول لعينة ممثلة، تحيز الإجابات، وتنظيف البيانات وتفسيرها.',
      frictionEn: 'Reaching representative samples, response bias, and cleaning and interpreting data.',
      medium: ['people','numbers','digital'], models: ['employee','freelance','micro','company','hybrid'], source: 'https://www.onetonline.org/link/summary/13-1161.00'
    },
    eventplanner: {
      interestCode: 'ECS', sourceType: 'onet', onet: '13-1121.00',
      tasksAr: ['فهم أهداف العميل وميزانية الحدث','تنسيق المكان والموردين والضيافة والتجهيزات','متابعة التنفيذ وحل المشكلات ومراجعة الفواتير'],
      tasksEn: ['Understand client goals and event budgets','Coordinate venues, suppliers, catering, and equipment','Monitor delivery, resolve issues, and review bills'],
      frictionAr: 'تغييرات اللحظة الأخيرة، ساعات غير منتظمة، تعدد الموردين والمسؤولية المباشرة.',
      frictionEn: 'Last-minute changes, irregular hours, many vendors, and direct accountability.',
      medium: ['people','systems','physical'], models: ['freelance','micro','company','hybrid'], source: 'https://www.onetonline.org/link/summary/13-1121.00'
    },
    logistics: {
      interestCode: 'CEI', sourceType: 'onet', onet: '13-1081.00',
      tasksAr: ['تخطيط حركة البضائع من الشراء إلى التسليم','التنسيق مع الموردين والعملاء ومقدمي النقل','متابعة المخزون والتكلفة ومواعيد التسليم'],
      tasksEn: ['Plan product flow from purchasing to delivery','Coordinate suppliers, clients, and transport providers','Track inventory, costs, and delivery schedules'],
      frictionAr: 'تأخيرات ومخزون راكد، تغيرات أسعار، ومشكلات تشغيل لا تقع كلها تحت السيطرة.',
      frictionEn: 'Delays, dead stock, price changes, and operational issues beyond full control.',
      medium: ['systems','numbers','people'], models: ['employee','freelance','micro','company','hybrid'], source: 'https://www.onetonline.org/link/summary/13-1081.00'
    },
    sales: {
      interestCode: 'EC', sourceType: 'onet', onet: '41-4012.00',
      tasksAr: ['اكتشاف احتياجات العميل وترشيح الحل المناسب','شرح المنتج وتسعيره والتفاوض على الشروط','متابعة ما بعد البيع ومعالجة الاعتراضات'],
      tasksEn: ['Discover customer needs and recommend suitable solutions','Explain products, quote prices, and negotiate terms','Follow up after the sale and handle objections'],
      frictionAr: 'رفض متكرر وأهداف مبيعات وضغط متابعة وتحصيل.',
      frictionEn: 'Frequent rejection, sales targets, follow-up pressure, and collections.',
      medium: ['people','systems'], models: ['employee','freelance','micro','company','hybrid'], source: 'https://www.onetonline.org/link/summary/41-4012.00'
    },
    teacher: {
      interestCode: 'S', sourceType: 'onet', onet: '25-2031.00',
      tasksAr: ['تحضير الدرس وشرح المفاهيم بأكثر من طريقة','متابعة فهم المتعلمين وتقييم تقدمهم','إدارة المجموعة والتواصل مع الأسر أو الزملاء'],
      tasksEn: ['Prepare lessons and explain concepts in different ways','Assess learners’ understanding and progress','Manage the group and communicate with families or colleagues'],
      frictionAr: 'إدارة مجموعة متفاوتة، تحضير وتصحيح، وتكرار الشرح والصبر على بطء التقدم.',
      frictionEn: 'Managing varied learners, preparation and grading, repetition, and patience with uneven progress.',
      medium: ['people','digital','visual'], models: ['employee','freelance','micro','company','hybrid'], source: 'https://www.onetonline.org/link/summary/25-2031.00'
    },
    psychologist: {
      interestCode: 'SI', sourceType: 'onet', onet: '19-3033.00',
      tasksAr: ['إجراء مقابلات وتقييمات مهنية ضمن نطاق الاختصاص','توثيق الملاحظات ومراجعة الأدلة','تقديم تدخلات أو استشارات وفق التأهيل والترخيص'],
      tasksEn: ['Conduct professional interviews and assessments within scope','Document observations and review evidence','Provide interventions or counseling within qualifications and licensure'],
      frictionAr: 'عبء عاطفي، حدود مهنية وسرية، وتدريب وإشراف متخصص مستمر.',
      frictionEn: 'Emotional load, professional boundaries and confidentiality, and ongoing specialist supervision.',
      medium: ['people','systems'], models: ['employee','freelance','micro','hybrid'], source: 'https://www.onetonline.org/link/summary/19-3033.00',
      noteAr: 'الخدمات النفسية المنظمة تتطلب التأهيل والترخيص بحسب البلد.', noteEn: 'Regulated psychological services require qualifications and licensing according to local law.'
    },
    electrician: {
      interestCode: 'RC', sourceType: 'onet', onet: '47-2111.00',
      tasksAr: ['قراءة المخططات وتحديد مسارات التوصيل','تركيب وصيانة الأسلاك والمكونات','اختبار الدوائر والالتزام الصارم بمعايير السلامة'],
      tasksEn: ['Read plans and determine wiring routes','Install and maintain wiring and components','Test circuits and follow strict safety codes'],
      frictionAr: 'مخاطر كهربائية وعمل ميداني واشتراطات سلامة ومسؤولية قانونية.',
      frictionEn: 'Electrical hazards, field work, safety rules, and legal accountability.',
      medium: ['physical','systems'], models: ['employee','freelance','micro','company'], source: 'https://www.onetonline.org/link/summary/47-2111.00',
      noteAr: 'التنفيذ الكهربائي لا يتم دون تأهيل واشتراطات السلامة والترخيص المحلي اللازم.', noteEn: 'Electrical work must not be performed without required training, safety controls, and local authorization.'
    },
    camera: {
      interestCode: 'ARC', sourceType: 'onet', onet: '27-4031.00',
      tasksAr: ['اختيار زوايا التصوير وحركة الكاميرا','ضبط التركيز والتعريض والتكوين','التنسيق مع المخرج والإضاءة والصوت'],
      tasksEn: ['Choose camera angles and movement','Control focus, exposure, and composition','Coordinate with direction, lighting, and sound teams'],
      frictionAr: 'معدات وتجهيز ونقل، ساعات تصوير طويلة، وتكرار اللقطات تحت ضغط الوقت.',
      frictionEn: 'Equipment logistics, travel, long shoots, and repeated takes under time pressure.',
      medium: ['visual','physical','digital'], models: ['freelance','employee','micro','company','hybrid'], source: 'https://www.onetonline.org/link/summary/27-4031.00'
    },
    sound: {
      interestCode: 'RAC', sourceType: 'onet', onet: '27-4014.00',
      tasksAr: ['تجهيز الميكروفونات ومعدات التسجيل','تسجيل الصوت ومراقبة مستوياته وجودته','معالجة التسجيلات ومزامنتها مع الصورة'],
      tasksEn: ['Set up microphones and recording equipment','Record audio and monitor levels and quality','Process recordings and synchronize them with video'],
      frictionAr: 'أعطال تقنية دقيقة، ضوضاء، تجهيزات في مواقع مختلفة، ومواعيد تسليم.',
      frictionEn: 'Precise technical faults, noise, varied locations, and delivery deadlines.',
      medium: ['physical','digital','visual'], models: ['freelance','employee','micro','company','hybrid'], source: 'https://www.onetonline.org/link/summary/27-4014.00'
    },
    agriculture: {
      interestCode: 'ERC', sourceType: 'onet', onet: '11-9013.00',
      tasksAr: ['تخطيط التشغيل والعمالة والمدخلات الزراعية','متابعة الإنتاج والبيانات والظروف البيئية','تنسيق الحصاد والتخزين والبيع'],
      tasksEn: ['Plan operations, labor, and agricultural inputs','Monitor production, records, and environmental conditions','Coordinate harvesting, storage, and sales'],
      frictionAr: 'موسمية الإنتاج والطقس والتلف وتقلب الأسعار والاحتياج إلى رأس مال تشغيلي.',
      frictionEn: 'Seasonality, weather, spoilage, price volatility, and working-capital needs.',
      medium: ['living','physical','systems'], models: ['employee','micro','company','hybrid'], source: 'https://www.onetonline.org/link/summary/11-9013.00'
    }
  };
})();

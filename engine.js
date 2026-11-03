(() => {
  'use strict';

  const STORAGE_KEY = 'ebda2_career_v4';
  const LANG_KEY = 'ebda2_lang';
  const ORDER = ['R', 'I', 'A', 'S', 'E', 'C'];
  const DIMENSIONS = {
    R: { ar: 'العملي والتطبيقي', en: 'Realistic / Practical', shortAr: 'عملي', shortEn: 'Practical', descAr: 'التعامل مع الأدوات والمعدات والمواد وتحويل الأفكار إلى شيء ملموس.', descEn: 'Working with tools, equipment, materials, and turning plans into tangible results.' },
    I: { ar: 'التحليلي والاستقصائي', en: 'Investigative / Analytical', shortAr: 'تحليلي', shortEn: 'Analytical', descAr: 'البحث عن الأسباب، فحص الأدلة، حل المشكلات وفهم الأنظمة المعقدة.', descEn: 'Finding causes, examining evidence, solving problems, and understanding complex systems.' },
    A: { ar: 'الإبداعي والفني', en: 'Artistic / Creative', shortAr: 'إبداعي', shortEn: 'Creative', descAr: 'ابتكار أفكار وأشكال وقصص وحلول، والتجريب بدل الالتزام بقالب واحد.', descEn: 'Creating ideas, forms, stories, and solutions; experimenting beyond fixed templates.' },
    S: { ar: 'الاجتماعي والإنساني', en: 'Social / Helping', shortAr: 'إنساني', shortEn: 'Helping', descAr: 'التعليم والرعاية والإرشاد ومساعدة الناس على التعلم أو تجاوز المشكلات.', descEn: 'Teaching, caring, guiding, and helping people learn or overcome difficulties.' },
    E: { ar: 'القيادي والمبادر', en: 'Enterprising / Leading', shortAr: 'قيادي', shortEn: 'Leading', descAr: 'إقناع الآخرين والتفاوض واتخاذ القرارات وتحريك مشروع أو فريق نحو هدف.', descEn: 'Persuading, negotiating, making decisions, and moving a project or team toward a goal.' },
    C: { ar: 'التنظيمي والدقيق', en: 'Conventional / Organizing', shortAr: 'تنظيمي', shortEn: 'Organizing', descAr: 'ترتيب المعلومات والأرقام والإجراءات وملاحظة التفاصيل وضمان الدقة.', descEn: 'Organizing information, numbers, and procedures; noticing details and ensuring accuracy.' }
  };

  // Original, indirect Arabic/English activity items. Four equally weighted items per RIASEC dimension.
  const QUESTIONS = [
    { id:'r1', d:'R', ar:'في مكان فيه جهاز أو معدّة توقفت عن العمل، غالبًا ستجد نفسك تفحصها وتحاول فهم آليتها قبل أن تطلب من شخص آخر التدخل.', en:'When a device or machine stops working, you may find yourself inspecting it and trying to understand its mechanism before asking someone else to step in.' },
    { id:'r2', d:'R', ar:'لو كان أمامك اختيار بين مشاهدة شرح عن صناعة شيء وبين تنفيذ نموذج صغير بيدك، تميل إلى تنفيذ النموذج.', en:'Given the choice between watching an explanation of how something is made and building a small model yourself, you lean toward building it.' },
    { id:'r3', d:'R', ar:'في مشروع جماعي، قد تفضّل أن تتولى تركيب الأجزاء أو تشغيل المعدّات أو اختبار المنتج على أن تكتفي بمتابعة الخطة.', en:'In a group project, you may prefer assembling parts, operating equipment, or testing the product rather than only following the plan.' },
    { id:'r4', d:'R', ar:'فكرة قضاء وقت في ورشة أو موقع عمل أو مزرعة لإنجاز مهمة ملموسة تبدو لك تجربة تستحق المحاولة.', en:'Spending time in a workshop, worksite, or farm to complete a tangible task sounds worth trying.' },

    { id:'i1', d:'I', ar:'عندما تظهر نتيجة غير متوقعة، يصعب عليك الاكتفاء بها؛ تميل إلى البحث عن السبب الذي أدى إليها.', en:'When an unexpected result appears, you find it hard to leave it unexplained; you tend to look for the cause.' },
    { id:'i2', d:'I', ar:'قد تستمتع بمقارنة معلومات متعارضة أو أرقام مختلفة حتى تكتشف أين يوجد الاختلاف الحقيقي.', en:'You may enjoy comparing conflicting information or figures until you discover where the real difference lies.' },
    { id:'i3', d:'I', ar:'لو كان هناك سؤال لا تعرف إجابته، قد تقضي وقتًا في تجربة احتمالات متعددة بدل قبول أول تفسير.', en:'When you do not know the answer to a question, you may spend time testing different explanations rather than accepting the first one.' },
    { id:'i4', d:'I', ar:'تفكيك مشكلة معقدة إلى أجزاء صغيرة وفهم العلاقة بينها يمكن أن يكون نشاطًا ممتعًا بالنسبة لك.', en:'Breaking a complicated problem into smaller parts and understanding how they connect can be enjoyable for you.' },

    { id:'a1', d:'A', ar:'لو طُلب منك تقديم فكرة عادية، قد تميل إلى ابتكار شكل أو صورة أو قصة تجعلها مختلفة عن الطريقة المعتادة.', en:'When asked to present an ordinary idea, you may want to invent a visual form or story that makes it feel different.' },
    { id:'a2', d:'A', ar:'قد تعود إلى صورة أو مشهد أو تصميم أكثر من مرة، وتغيّر تفاصيل صغيرة حتى يصل إلى الإحساس الذي تريده.', en:'You may revisit an image, scene, or design repeatedly, changing small details until it conveys the feeling you want.' },
    { id:'a3', d:'A', ar:'في نشاط مفتوح من غير خطوات محددة، تميل إلى التجريب وصنع أكثر من احتمال قبل الاستقرار على شكل نهائي.', en:'In an open-ended activity without fixed steps, you tend to experiment with several possibilities before settling on a final form.' },
    { id:'a4', d:'A', ar:'قد تفضّل مهمة تسمح لك بترك بصمتك الخاصة، حتى لو استغرقت وقتًا أطول من تنفيذ نموذج جاهز.', en:'You may prefer a task that lets you leave your own signature, even if it takes longer than following a ready-made template.' },

    { id:'s1', d:'S', ar:'عندما يواجه شخص صعوبة في فهم أمر ما، قد تجد نفسك تشرح له بأكثر من طريقة حتى يصل للفكرة.', en:'When someone struggles to understand something, you may find yourself explaining it in different ways until it clicks.' },
    { id:'s2', d:'S', ar:'قد تتابع احتياج شخص يمر بظرف صعب، وتعتبر تحسّن حالته نتيجة مهمة تستحق وقتك.', en:'You may follow up with someone going through a difficult time and consider their improvement a meaningful result.' },
    { id:'s3', d:'S', ar:'في مجموعة، قد تنتبه لمن لم يستطع المشاركة وتحاول أن تمنحه مساحة ليعبّر عن رأيه.', en:'In a group, you may notice who has not had a chance to contribute and try to make room for their voice.' },
    { id:'s4', d:'S', ar:'يمكن أن تكون متابعة تعلّم شخص أو تقدّمه في مهارة ما أكثر إرضاءً لك من إنجاز المهمة وحدك.', en:'Following someone’s learning or progress in a skill can be more rewarding to you than completing the task alone.' },

    { id:'e1', d:'E', ar:'لو كانت لديك فكرة تؤمن بها، قد تستمتع بعرضها على أشخاص مختلفين والتفاوض معهم للوصول إلى اتفاق.', en:'When you believe in an idea, you may enjoy presenting it to different people and negotiating toward an agreement.' },
    { id:'e2', d:'E', ar:'قد تنجذب إلى موقف يحتاج شخصًا يتخذ القرار ويتحمل مسؤولية النتيجة بدل انتظار تعليمات تفصيلية.', en:'You may be drawn to situations where someone must make the decision and own the outcome instead of waiting for detailed instructions.' },
    { id:'e3', d:'E', ar:'في مشروع فيه عدة أشخاص، قد تجد نفسك تلقائيًا تحدد الأولويات وتوزع الأدوار وتتابع التنفيذ.', en:'In a project with several people, you may naturally set priorities, assign roles, and follow up on execution.' },
    { id:'e4', d:'E', ar:'تحويل فرصة غير واضحة إلى اتفاق أو خدمة أو مشروع قابل للتنفيذ قد يكون تحديًا يحمسك.', en:'Turning an unclear opportunity into an agreement, service, or workable project may feel like an energizing challenge.' },

    { id:'c1', d:'C', ar:'قد تستمتع بترتيب ملفات أو سجلات أو معلومات متفرقة حتى يصبح الوصول إلى أي معلومة سهلًا.', en:'You may enjoy organizing scattered files, records, or information until everything becomes easy to locate.' },
    { id:'c2', d:'C', ar:'عند مراجعة جدول أو حسابات، قد تلاحظ اختلافًا صغيرًا يستحق التوقف عنده حتى لو لم ينتبه له الآخرون.', en:'When reviewing a schedule or accounts, you may notice a small discrepancy worth checking even if others miss it.' },
    { id:'c3', d:'C', ar:'قد تفضّل أن تضع خطوات واضحة ومتكررة لإنجاز مهمة بدل الاعتماد على الذاكرة أو الارتجال كل مرة.', en:'You may prefer clear, repeatable steps for a task rather than relying on memory or improvising each time.' },
    { id:'c4', d:'C', ar:'إغلاق مهمة بعد التأكد من اكتمال التفاصيل ومطابقتها للمعايير يمنحك شعورًا بالرضا.', en:'Finishing a task after checking its details and standards can give you a sense of satisfaction.' }
  ];

  // Deliberately interleave dimensions so the category is less obvious to respondents.
  const DISPLAY_QUESTION_IDS = [
    'r1','i1','a1','s1','e1','c1',
    'i2','a2','s2','e2','c2','r2',
    'a3','s3','e3','c3','r3','i3',
    's4','e4','c4','r4','i4','a4'
  ];
  const DISPLAY_QUESTIONS = DISPLAY_QUESTION_IDS.map(id => QUESTIONS.find(q => q.id === id));

  const FLOW_ITEMS = [
    { id:'fR', d:'R', ar:'عندما تنشغل بتركيب شيء أو إصلاحه أو التعامل مع أداة ومعدّة، هل يحدث أن يمر الوقت دون أن تنتبه وتريد مواصلة العمل؟', en:'When assembling or repairing something, or working with a tool or machine, do you sometimes lose track of time and want to continue?' },
    { id:'fI', d:'I', ar:'عندما تبحث عن سبب مشكلة أو تحاول فهم بيانات أو لغز، هل تجد نفسك مستمرًا في التفكير فيه حتى بعد انتهاء الوقت المحدد؟', en:'When investigating a problem, data, or a puzzle, do you keep thinking about it and continue beyond the time you planned?' },
    { id:'fA', d:'A', ar:'عندما تصمم أو تكتب أو تعدّل صورة أو مشهدًا، هل تنشغل بالتفاصيل لدرجة أنك لا تشعر بمرور الوقت؟', en:'When designing, writing, or editing an image or scene, do you become so absorbed in details that you lose track of time?' },
    { id:'fS', d:'S', ar:'عندما تساعد شخصًا على التعلم أو تجاوز مشكلة، هل تستمر معه باهتمام حتى بعد انتهاء الوقت الذي خصصته؟', en:'When helping someone learn or work through a problem, do you stay engaged even after the time you set aside has passed?' },
    { id:'fE', d:'E', ar:'عندما تقود فكرة أو تفاوض أو تحاول تحريك مشروع، هل يزداد اندماجك كلما ظهرت عقبة تحتاج قرارًا؟', en:'When leading an idea, negotiating, or moving a project forward, do you become more absorbed when a challenge requires a decision?' },
    { id:'fC', d:'C', ar:'عندما ترتب بيانات أو تراجع أرقامًا أو تحسّن نظامًا، هل تستطيع الاستمرار بدقة دون أن تشعر بالملل سريعًا؟', en:'When organizing data, checking figures, or improving a system, can you continue carefully without becoming bored quickly?' }
  ];

  // Behavioral traces are supporting clues, not diagnostic personality claims.
  const TRACE_ITEMS = [
    { id:'tr1', ar:'لو عندك يوم فاضي تمامًا، أي نشاط ممكن تختاره من نفسك؟', en:'With a completely free day, which activity might you choose on your own?', options:[
      {ar:'أصلح أو أركّب شيئًا أو أجرّب أداة',en:'Repair or assemble something, or try a tool',d:'R',medium:'physical'},
      {ar:'أبحث في سؤال محير أو أفك لغزًا',en:'Investigate a puzzling question or solve a puzzle',d:'I',medium:'numbers'},
      {ar:'أصنع صورة أو قصة أو تصميمًا',en:'Create an image, story, or design',d:'A',medium:'visual'},
      {ar:'أشرح لشخص شيئًا أو أساعده يتعلم',en:'Explain something to someone or help them learn',d:'S',medium:'people'},
      {ar:'أرتب لقاءً أو أقنع مجموعة بفكرة',en:'Organize a gathering or persuade a group about an idea',d:'E',medium:'people'},
      {ar:'أرتب ملفات أو قوائم أو تفاصيل مبعثرة',en:'Organize scattered files, lists, or details',d:'C',medium:'systems'}
    ]},
    { id:'tr2', ar:'وأنت تشاهد فيلمًا أو إعلانًا أو محتوى، ما الذي تلاحظه تلقائيًا؟', en:'When watching a film, advertisement, or other content, what do you notice automatically?', options:[
      {ar:'الصورة والإضاءة وتكوين الكادر',en:'The image, lighting, and framing',d:'A',medium:'visual'},
      {ar:'كيف صُنعت الفكرة أو التقنية المستخدمة',en:'How the idea was built or what technique was used',d:'R',medium:'physical'},
      {ar:'السبب وراء تصرف الناس أو نجاح الفكرة',en:'Why people behaved that way or why the idea worked',d:'I',medium:'people'},
      {ar:'رد فعل الجمهور ومشاعر الشخصيات',en:'The audience response and the characters’ feelings',d:'S',medium:'people'},
      {ar:'طريقة العرض والإقناع والتسويق',en:'The presentation, persuasion, and marketing',d:'E',medium:'people'},
      {ar:'ترتيب الأحداث والتفاصيل والاستمرارية',en:'The sequence, details, and continuity',d:'C',medium:'systems'}
    ]},
    { id:'tr3', ar:'في المدرسة أو الجامعة أو البيت، عندما تشارك في تجهيز نشاط، أي دور كنت تميل إليه تلقائيًا؟', en:'At school, university, or home, when helping prepare an activity, which role did you naturally gravitate toward?', options:[
      {ar:'أصمم الشكل أو أكتب أو أجهز العرض',en:'Design the look, write, or prepare the presentation',d:'A',medium:'visual'},
      {ar:'أبحث عن المعلومات وأتأكد من صحتها',en:'Research information and check its accuracy',d:'I',medium:'numbers'},
      {ar:'أقسم المهام وأتابع ما تم إنجازه',en:'Divide tasks and track progress',d:'E',medium:'systems'},
      {ar:'أصنع أو أركب الأشياء المطلوبة',en:'Make or assemble the things needed',d:'R',medium:'physical'},
      {ar:'أشرح للآخرين وأحل الخلافات بينهم',en:'Explain things to others and resolve disagreements',d:'S',medium:'people'},
      {ar:'أرتب الوقت والقائمة والميزانية والتفاصيل',en:'Organize the schedule, list, budget, and details',d:'C',medium:'numbers'}
    ]},
    { id:'tr4', ar:'أي نوع من التفاصيل يمكن أن يجعلك تواصل البحث أو المشاهدة دون أن تطلب منك ذلك؟', en:'What kind of detail can keep you researching or watching without anyone asking you to?', options:[
      {ar:'كيف يتحرك الشيء أو يعمل عمليًا',en:'How something moves or works in practice',d:'R',medium:'physical'},
      {ar:'الأسباب والأدلة والاحتمالات الخفية',en:'Causes, evidence, and hidden possibilities',d:'I',medium:'numbers'},
      {ar:'الأسلوب البصري والحكاية والخيال',en:'Visual style, storytelling, and imagination',d:'A',medium:'visual'},
      {ar:'تجارب الناس ومشكلاتهم وعلاقاتهم',en:'People’s experiences, problems, and relationships',d:'S',medium:'people'},
      {ar:'كيف يتغير رأي الجمهور أو يتحقق التأثير',en:'How an audience changes its mind or is influenced',d:'E',medium:'people'},
      {ar:'تسلسل الخطوات والقواعد والتفاصيل',en:'The sequence of steps, rules, and details',d:'C',medium:'systems'}
    ]},
    { id:'tr5', ar:'أي وسيط ترتاح للتعامل معه لفترة طويلة؟', en:'Which medium would you feel comfortable working with for an extended time?', options:[
      {ar:'شاشات وبرامج وأدوات رقمية',en:'Screens, software, and digital tools',d:'I',medium:'digital'},
      {ar:'أدوات وخامات وأشياء ملموسة',en:'Tools, materials, and tangible objects',d:'R',medium:'physical'},
      {ar:'صور وأصوات وألوان ومشاهد',en:'Images, sounds, colors, and scenes',d:'A',medium:'visual'},
      {ar:'أشخاص وعلاقات واحتياجات بشرية',en:'People, relationships, and human needs',d:'S',medium:'people'},
      {ar:'أرقام وبيانات وموارد ونظم',en:'Numbers, data, resources, and systems',d:'C',medium:'numbers'},
      {ar:'نباتات أو طعام أو مواد حيوية',en:'Plants, food, or biological materials',d:'R',medium:'living'}
    ]},
    { id:'tr6', ar:'عندما تتعلم مهارة جديدة، أي جزء تستمتع به غالبًا؟', en:'When learning a new skill, which part do you usually enjoy most?', options:[
      {ar:'التجريب وصنع شيء بطريقتي',en:'Experimenting and making something my way',d:'A',medium:'visual'},
      {ar:'فهم المبادئ والأسباب وراءها',en:'Understanding the principles and reasons behind it',d:'I',medium:'numbers'},
      {ar:'التدرب حتى أتقن التنفيذ بيدي',en:'Practicing until I can perform it by hand',d:'R',medium:'physical'},
      {ar:'مشاركة ما تعلمته ومساعدة غيري',en:'Sharing what I learned and helping others',d:'S',medium:'people'},
      {ar:'استخدامها لإقناع شخص أو الوصول لفرصة',en:'Using it to persuade someone or reach an opportunity',d:'E',medium:'people'},
      {ar:'تنظيم خطواتها ووضع طريقة قابلة للتكرار',en:'Organizing its steps into a repeatable method',d:'C',medium:'systems'}
    ]}
  ];

  const WORKSTYLE_ITEMS = [
    {id:'w_autonomy',ar:'أفضل أن أختار طريقة تنفيذ العمل وترتيب خطواته بنفسي.',en:'I prefer choosing how the work is done and ordering the steps myself.'},
    {id:'w_clients',ar:'أستمتع بالتواصل مع العملاء وشرح قيمة خدمة أو منتج والتفاوض.',en:'I enjoy meeting clients, explaining the value of a service or product, and negotiating.'},
    {id:'w_lead',ar:'أستمتع بتنسيق عمل أشخاص آخرين وتحمل مسؤولية النتيجة الجماعية.',en:'I enjoy coordinating other people’s work and taking responsibility for the group outcome.'},
    {id:'w_stability',ar:'الدخل المنتظم والمهام الواضحة أهم عندي من فرصة دخل أعلى لكنه متقلب.',en:'Regular income and clear duties matter more to me than a chance at higher but variable income.'},
    {id:'w_operations',ar:'أستمتع بتحسين عملية متكررة والحفاظ على مستوى ثابت من الجودة.',en:'I enjoy improving a repeatable process and maintaining consistent quality.'},
    {id:'w_uncertainty',ar:'أستطيع التعامل مع فترة من عدم اليقين إذا كنت أختبر فرصة أؤمن بها.',en:'I can handle a period of uncertainty while testing an opportunity I believe in.'}
  ];

  // Legacy numeric vectors from V3 are retained for backwards reference only. V4 scoring uses the O*NET occupational high-point codes in career-map.js.
  const CAREERS = [
    { id:'director', ar:'مخرج / منتج سينمائي', en:'Film / Video Director or Producer', onet:'27-2012.00', profile:[2.13,2.24,6.14,3.12,5.78,3.56], sector:'arts', formal:false,
      workAr:'تحويل رؤية أو نص إلى مشاهد، اختيار طريقة الحكي والصورة، وتنسيق عمل فريق فني وتقني.', workEn:'Turning a vision or script into scenes, shaping the visual story, and coordinating a creative and technical team.',
      testAr:'اكتب مشهدًا قصيرًا من صفحة واحدة، ثم صوّره أو خطط له في 5 لقطات. جرّب قيادة الفكرة من النص إلى الصورة.', testEn:'Write a one-page scene, then film it or plan it in five shots. Try taking an idea from script to image.',
      formalAr:'ابدأ بمشروعات قصيرة ومساعدة فرق تصوير أو مونتاج. الدراسة المتخصصة مفيدة لكنها ليست شرطًا عالميًا موحدًا لدخول كل أدوار المجال.', formalEn:'Start with short projects and assisting film or editing crews. Specialized study helps, but entry requirements vary by role and country.' },
    { id:'creative_company', ar:'مؤسس / صاحب شركة إنتاج فني', en:'Founder / Owner of a Creative Production Company', onet:'COMPOSITE: 27-2012.00 + 11-1011.00', profile:[1.70,2.65,4.15,3.33,6.37,4.27], sector:'arts', formal:false, composite:true,
      workAr:'الجمع بين الرؤية الإبداعية وإدارة فريق وميزانية وعملاء، وتحويل الأفكار الفنية إلى مشروعات إنتاج قابلة للاستمرار.', workEn:'Combining creative direction with team, budget, and client management to turn artistic ideas into sustainable production projects.',
      testAr:'صمّم تصورًا لمشروع إنتاج فني صغير: الفكرة، الجمهور، فريق من 3 أدوار، ميزانية أولية، وخطوة واحدة لاختبار اهتمام عميل محتمل. لا تبدأ بتأسيس شركة أو إنفاق كبير.', testEn:'Draft a small creative-production project: concept, audience, three team roles, a preliminary budget, and one way to test a potential client’s interest. Do not start by registering a company or spending heavily.',
      formalAr:'لا تحتاج إلى تأسيس شركة كي تختبر هذا المسار. ابدأ بمشروع إنتاج صغير، وتعلّم التسعير والتعاقد وإدارة الحقوق والتدفق النقدي قبل تحمل التزامات قانونية أو مالية.', formalEn:'You do not need to register a company to test this path. Start with a small production project and learn pricing, contracts, rights management, and cash flow before taking on legal or financial commitments.' },
    { id:'ceo', ar:'صاحب شركة / مدير تنفيذي', en:'Business Owner / Chief Executive', onet:'11-1011.00', profile:[1.26,3.05,2.16,3.54,6.96,4.97], sector:'business', formal:false,
      workAr:'تحديد اتجاه المؤسسة، اتخاذ القرارات، بناء العلاقات، وتحمّل مسؤولية النتائج والموارد.', workEn:'Setting an organization’s direction, making decisions, building relationships, and owning outcomes and resources.',
      testAr:'اختر مشكلة صغيرة في سوق تعرفه، تحدث مع 3 عملاء محتملين، واكتب عرضًا بسيطًا لحل يمكن اختباره قبل إنفاق المال.', testEn:'Choose a small problem in a market you know, speak with three potential customers, and write a simple offer you can test before spending money.',
      formalAr:'ابدأ بتجربة صغيرة ومسؤولية محدودة، وتعلّم أساسيات البيع والتكاليف والتشغيل. لا تحتاج إلى تأسيس شركة كي تختبر ملاءمتك لهذا النوع من العمل.', formalEn:'Begin with a small experiment and limited responsibility. Learn sales, costs, and operations; you do not need to register a company to test this work.' },
    { id:'editor', ar:'مونتير / محرر فيديو', en:'Film and Video Editor', onet:'27-4032.00', profile:[3.14,1.91,5.61,1.96,3.08,3.75], sector:'arts', formal:false,
      workAr:'اختيار اللقطات وترتيبها وضبط الإيقاع والصوت والصورة حتى تصبح القصة واضحة ومؤثرة.', workEn:'Selecting and arranging footage, shaping pace, sound, and image so the story feels clear and effective.',
      testAr:'استخدم لقطات متاحة لديك لصناعة فيديو من 30 إلى 60 ثانية، وجرّب نسختين بإيقاعين مختلفين.', testEn:'Use footage you already have to create a 30–60 second video, then make two edits with different pacing.',
      formalAr:'ابدأ بملف أعمال صغير يوضح اختياراتك في الإيقاع والحكي. جهاز مناسب وبرنامج مونتاج وممارسة منتظمة أهم من اسم دورة بعينها.', formalEn:'Build a small portfolio showing your choices in pacing and storytelling. Suitable equipment, editing software, and regular practice matter more than a particular course title.' },
    { id:'graphic', ar:'مصمم جرافيك / مصمم هوية', en:'Graphic Designer', onet:'27-1024.00', profile:[3.38,2.86,7.00,2.16,3.43,3.92], sector:'arts', formal:false,
      workAr:'ترجمة فكرة أو رسالة إلى شكل بصري، واختيار الألوان والخطوط والتكوين بما يخدم المعنى.', workEn:'Translating a message into visual form and choosing color, type, and composition to serve its meaning.',
      testAr:'اختر نشاطًا أو منتجًا افتراضيًا وصمم له 3 اتجاهات بصرية مختلفة، ثم اشرح سبب كل اختيار.', testEn:'Choose a fictional product or activity and create three different visual directions, explaining each choice.',
      formalAr:'ملف الأعمال هو نقطة البداية الأساسية. استخدم الأدوات المتاحة واطلب ملاحظات على وضوح التصميم، لا على جماله فقط.', formalEn:'A portfolio is the key starting point. Use the tools available and seek feedback on clarity as well as visual appeal.' },
    { id:'architect', ar:'مهندس معماري', en:'Architect', onet:'17-1011.00', profile:[4.92,3.88,4.13,2.53,3.65,4.44], sector:'engineering', formal:true,
      workAr:'تصميم المساحات والمباني مع الموازنة بين الوظيفة والشكل والمواد والاشتراطات الفنية.', workEn:'Designing spaces and buildings while balancing function, form, materials, and technical requirements.',
      testAr:'أعد تخطيط غرفة أو مساحة صغيرة على الورق، مع تحديد الحركة والإضاءة والاستخدام قبل اختيار الشكل.', testEn:'Redesign a room or small space on paper, mapping movement, light, and use before choosing its appearance.',
      formalAr:'الممارسة المهنية كمهندس معماري تتطلب دراسة واعتمادًا مهنيًا وفق نظام بلدك. يمكن اختبار الميل بالتصميم والرسم قبل الالتزام بمسار الدراسة.', formalEn:'Professional architectural practice requires recognized education and credentials under local rules. You can test your interest through design exercises before committing to study.' },
    { id:'mechanical', ar:'مهندس ميكانيكا', en:'Mechanical Engineer', onet:'17-2141.00', profile:[6.39,5.12,2.02,1.22,1.97,4.83], sector:'engineering', formal:true,
      workAr:'فهم حركة القوى والآلات والأنظمة الميكانيكية، وتصميمها أو اختبارها وتحسين أدائها.', workEn:'Understanding forces, machines, and mechanical systems, then designing, testing, or improving their performance.',
      testAr:'اختر آلية منزلية بسيطة، ارسم مكوناتها وطريقة عملها، وحدد كيف يمكن تحسين نقطة ضعف فيها. لا تفك معدات خطرة أو موصولة بالكهرباء.', testEn:'Choose a simple household mechanism, sketch its parts and operation, and identify one improvement. Do not dismantle hazardous or powered equipment.',
      formalAr:'المسمى الهندسي المهني يحتاج عادةً إلى دراسة هندسية معتمدة. ابدأ بتجارب آمنة في الفيزياء والرسم الهندسي والنمذجة.', formalEn:'Professional engineering roles typically require an accredited engineering qualification. Begin with safe physics, technical drawing, and modeling exercises.' },
    { id:'software', ar:'مهندس برمجيات / مطور برامج', en:'Software Developer', onet:'15-1252.00', profile:[3.61,6.05,2.37,1.81,1.87,5.62], sector:'tech', formal:false,
      workAr:'تحويل احتياج أو مشكلة إلى تعليمات وأنظمة رقمية، واختبارها وتصحيحها وتحسينها.', workEn:'Turning a need or problem into digital instructions and systems, then testing, debugging, and improving them.',
      testAr:'ابنِ أداة صغيرة تحل مشكلة تستخدمها فعلًا، حتى لو كانت صفحة واحدة أو آلة حاسبة بسيطة.', testEn:'Build a small tool that solves a problem you actually face, even if it is just one page or a simple calculator.',
      formalAr:'يمكن اختبار المجال بمشروع صغير وتعلم تدريجي. الشهادة قد تفيد لبعض الوظائف، لكن متطلبات الدخول تختلف بين الشركات والأدوار.', formalEn:'You can test the field with a small project and gradual learning. A degree helps for some roles, but entry requirements vary by employer and role.' },
    { id:'data', ar:'عالم بيانات / محلل بيانات متقدم', en:'Data Scientist', onet:'15-2051.00', profile:[2.17,6.98,2.61,1.66,1.71,5.39], sector:'tech', formal:false,
      workAr:'استخراج معنى من البيانات، اختبار الفرضيات، واستخدام الإحصاء والبرمجة لبناء تفسيرات أو توقعات.', workEn:'Finding meaning in data, testing hypotheses, and using statistics and programming to build explanations or predictions.',
      testAr:'استخدم جدول بيانات عامًّا، اطرح سؤالًا واحدًا، نظّف البيانات وارسم نتيجة تشرحها لشخص آخر.', testEn:'Use a public dataset, ask one question, clean the data, and make a chart that explains one finding to someone else.',
      formalAr:'ابدأ بالإحصاء والجداول والبرمجة الأساسية. بعض الأدوار المتقدمة تفضّل خلفية جامعية كمية، لكن تجربة تحليل صغيرة تساعدك في اختبار الميل.', formalEn:'Start with statistics, spreadsheets, and basic coding. Some advanced roles prefer quantitative degrees, but a small analysis project can help test your interest.' },
    { id:'nurse', ar:'ممرض / ممرضة', en:'Registered Nurse', onet:'29-1141.00', profile:[3.46,4.71,1.34,5.57,2.38,4.75], sector:'health', formal:true,
      workAr:'متابعة حالة المريض، تنفيذ الرعاية وفق بروتوكولات، ملاحظة التغيرات، والتنسيق مع الفريق الطبي.', workEn:'Monitoring patients, providing care under protocols, noticing changes, and coordinating with the clinical team.',
      testAr:'تحدث مع ممرض ممارس عن يوم العمل الفعلي ومواقف الضغط والتعامل مع المرضى. لا تمارس أي إجراء طبي دون تأهيل وإشراف.', testEn:'Speak with a practicing nurse about the real workday, pressure, and patient contact. Do not perform clinical procedures without training and supervision.',
      formalAr:'التمريض مهنة صحية منظمة وتتطلب مؤهلًا وتدريبًا وترخيصًا حسب بلدك. الميل وحده لا يغني عن التأهيل المهني.', formalEn:'Nursing is a regulated health profession requiring education, supervised training, and licensure according to local rules. Interest does not replace qualification.' },
    { id:'accountant', ar:'محاسب / مراجع حسابات', en:'Accountant / Auditor', onet:'13-2011.00', profile:[1.14,3.57,1.08,2.13,3.87,7.00], sector:'business', formal:false,
      workAr:'تسجيل المعاملات ومراجعة السجلات واكتشاف الفروق والتأكد من اتساق الأرقام مع القواعد.', workEn:'Recording transactions, reviewing records, finding discrepancies, and checking figures against rules.',
      testAr:'أنشئ سجلًا افتراضيًا لمصروفات مشروع صغير، راجع الإجمالي، واكتشف أي رقم لا يتطابق مع بقية البيانات.', testEn:'Create a fictional expense ledger for a small project, check the totals, and find any figure that does not reconcile.',
      formalAr:'ابدأ بمبادئ المحاسبة والجداول والتسويات. بعض مهام المراجعة أو التوقيع المهني قد تتطلب مؤهلًا أو ترخيصًا محليًا.', formalEn:'Begin with accounting fundamentals, spreadsheets, and reconciliations. Some audit or sign-off roles may require local qualifications or licensing.' },
    { id:'chef', ar:'طاهٍ محترف / شيف', en:'Chef / Head Cook', onet:'35-1011.00', profile:[4.84,1.68,2.72,2.95,5.13,4.35], sector:'hospitality', formal:false,
      workAr:'تحضير الطعام وإدارة المكونات والتوقيت والجودة، وتنسيق العمل في مطبخ يعمل بإيقاع سريع.', workEn:'Preparing food and managing ingredients, timing, quality, and coordination in a fast-paced kitchen.',
      testAr:'اختر طبقًا واحدًا وأعده ثلاث مرات مع تسجيل الوقت والكمية والتكلفة وتحسين النتيجة في كل مرة.', testEn:'Choose one dish and prepare it three times, recording time, quantities, and cost while improving the result each time.',
      formalAr:'يمكن أن تبدأ بالتدريب العملي أو العمل تحت إشراف في مطبخ، مع تعلم سلامة الغذاء. الخبرة العملية أساسية.', formalEn:'You can start with supervised kitchen practice or training, while learning food safety. Practical experience is essential.' },
    { id:'webdeveloper', ar:'مطور مواقع وتطبيقات ويب', en:'Web Developer', onet:'15-1254.00', profile:[2.0,5.0,2.5,1.5,1.5,6.5], sector:'tech', formal:false,
      workAr:'بناء مواقع وتطبيقات ويب واختبارها وصيانتها وربطها بالخدمات والبيانات.', workEn:'Building, testing, maintaining, and integrating websites and web applications.',
      testAr:'أنشئ صفحة ويب بسيطة تحل مشكلة حقيقية، واختبرها على هاتفين أو متصفحين مختلفين.', testEn:'Build a simple web page that solves a real problem and test it on two phones or browsers.',
      formalAr:'يمكن اختبار المجال بمشروع صغير؛ متطلبات التعليم تختلف حسب الدور وصاحب العمل.', formalEn:'You can test the field with a small project; education requirements vary by role and employer.' },
    { id:'market_research', ar:'محلل أبحاث سوق', en:'Market Research Analyst', onet:'13-1161.00', profile:[1.0,5.8,2.6,2.5,6.8,5.5], sector:'business', formal:false,
      workAr:'فهم العملاء والسوق والمنافسين عبر البحث والاستبيانات وتحليل البيانات والتقارير.', workEn:'Understanding customers, markets, and competitors through research, surveys, analysis, and reporting.',
      testAr:'اختر منتجًا محليًا، تحدث مع خمسة مستخدمين محتملين، وصنف احتياجاتهم دون افتراض أن آراءهم تمثل السوق كله.', testEn:'Choose a local product, interview five potential users, and classify their needs without assuming the sample represents the whole market.',
      formalAr:'ابدأ بأساسيات البحث وتصميم الأسئلة والجداول والتحليل. لا تقدم نتائج عينة صغيرة كأنها دراسة سوق ممثلة.', formalEn:'Learn research design, question writing, spreadsheets, and analysis. Do not present a small sample as representative market research.' },
    { id:'eventplanner', ar:'منظم فعاليات ومؤتمرات', en:'Event Planner', onet:'13-1121.00', profile:[2.0,3.5,3.0,4.5,6.8,5.5], sector:'business', formal:false,
      workAr:'تنسيق أهداف العميل والميزانية والمكان والموردين والبرنامج والتفاصيل التشغيلية للحدث.', workEn:'Coordinating client objectives, budget, venue, vendors, agenda, and event operations.',
      testAr:'نظم لقاءً صغيرًا افتراضيًا على الورق: برنامج، قائمة مهام، ميزانية تقديرية، وخطة بديلة. لا تستأجر مكانًا قبل اختبار الطلب.', testEn:'Plan a small hypothetical gathering: agenda, task list, draft budget, and contingency plan. Do not rent a venue before testing demand.',
      formalAr:'ابدأ بحدث محدود مع جهة قائمة أو فريق خبير، وتحقق من التصاريح والسلامة ومتطلبات المكان.', formalEn:'Start with a limited event alongside an established organization or experienced team; check permits, safety, and venue requirements.' },
    { id:'logistics', ar:'أخصائي لوجستيات وسلاسل إمداد', en:'Logistician / Supply Chain Specialist', onet:'13-1081.00', profile:[2.0,5.0,1.0,2.5,5.5,6.8], sector:'business', formal:false,
      workAr:'تنسيق الشراء والمخزون والتوزيع والتسليم، ومتابعة التكلفة والعلاقات مع الموردين والعملاء.', workEn:'Coordinating purchasing, inventory, distribution, and delivery while tracking cost and supplier/customer relationships.',
      testAr:'ارسم رحلة منتج من المورد إلى العميل، وحدد نقاط التأخير والتكلفة والمعلومات الناقصة.', testEn:'Map a product’s journey from supplier to customer and identify delays, costs, and missing information.',
      formalAr:'ابدأ بتحليل مخزون أو تدفق طلبات بسيط، وتعلم الجداول وإدارة العمليات قبل تحمل مسؤولية بضائع أو نقل.', formalEn:'Start by analyzing a simple inventory or order flow, and learn spreadsheets and operations before taking responsibility for goods or transport.' },
    { id:'sales', ar:'مندوب / مستشار مبيعات للشركات', en:'B2B Sales Representative', onet:'41-4012.00', profile:[1.5,2.0,1.5,2.5,6.8,5.0], sector:'business', formal:false,
      workAr:'فهم احتياج العميل، ترشيح منتج أو خدمة، عرض السعر والتفاوض والمتابعة بعد البيع.', workEn:'Understanding customer needs, recommending products or services, quoting, negotiating, and following up.',
      testAr:'اختر منتجًا تعرفه واكتب عرضًا موجزًا لعميل محتمل، ثم اختبره في محادثة حقيقية دون ضغط أو ادعاء.', testEn:'Choose a product you know and write a concise offer for a potential customer, then test it in a real conversation without pressure or misrepresentation.',
      formalAr:'تعلم فهم المنتج وإدارة الاعتراضات والمتابعة وأخلاقيات البيع. قد تبدأ بوظيفة قبل العمل المستقل.', formalEn:'Learn product knowledge, objection handling, follow-up, and ethical selling. Employment may be a useful first step before self-employment.' },
    { id:'teacher', ar:'معلم / مدرب', en:'Teacher / Trainer', onet:'25-2031.00', profile:[1.5,3.5,4.5,6.8,3.5,4.5], sector:'education', formal:true,
      workAr:'تحضير المحتوى وشرحه بطرق متعددة ومتابعة تقدم المتعلمين وتقييم فهمهم.', workEn:'Preparing and explaining material in different ways and tracking and assessing learner progress.',
      testAr:'حضّر شرحًا مدته عشر دقائق لمفهوم تعرفه، وقدمه لشخص آخر ثم لاحظ أين احتاج إلى توضيح إضافي.', testEn:'Prepare a ten-minute explanation of a concept you know, teach it to someone, and note where further clarification was needed.',
      formalAr:'متطلبات التدريس الرسمي تختلف حسب البلد والمرحلة والمؤسسة. يمكن اختبار الميل بالتدريب أو إعداد محتوى تعليمي ضمن نطاق خبرتك.', formalEn:'Formal teaching requirements vary by country, level, and institution. You can test your interest by tutoring or making educational content within your expertise.' },
    { id:'psychologist', ar:'أخصائي نفسي إكلينيكي / إرشادي', en:'Clinical / Counseling Psychologist', onet:'19-3033.00', profile:[1.0,6.0,2.0,6.8,1.5,3.5], sector:'health', formal:true,
      workAr:'تقييم احتياجات نفسية وإجراء مقابلات وتوثيقها وتقديم تدخلات مهنية ضمن الاختصاص والترخيص.', workEn:'Assessing psychological needs, conducting and documenting interviews, and providing professional interventions within scope and licensure.',
      testAr:'اقرأ عن طبيعة العمل وتحدث مع مختص مرخص عن الدراسة والإشراف والحدود المهنية. لا تقدم علاجًا أو تشخيصًا تجريبيًا.', testEn:'Learn about the work and speak with a licensed professional about education, supervision, and boundaries. Do not offer experimental diagnosis or treatment.',
      formalAr:'هذا مسار منظم يتطلب تعليمًا متخصصًا وتدريبًا وترخيصًا محليًا؛ الاهتمام وحده لا يجيز تقديم الخدمة.', formalEn:'This is a regulated path requiring specialist education, training, and local licensure; interest alone does not authorize practice.' },
    { id:'electrician', ar:'فني كهرباء / كهربائي مؤهل', en:'Qualified Electrician', onet:'47-2111.00', profile:[6.8,3.0,1.0,1.0,1.5,4.5], sector:'engineering', formal:true,
      workAr:'قراءة المخططات وتركيب وصيانة مكونات كهربائية واختبارها وفق اشتراطات السلامة.', workEn:'Reading plans, installing and maintaining electrical components, and testing them under safety requirements.',
      testAr:'ابدأ بملاحظة عمل فني مؤهل ودراسة أساسيات السلامة. لا تجرّب فتح أو توصيل دوائر كهربائية بنفسك.', testEn:'Begin by observing a qualified technician and studying safety basics. Do not experiment by opening or wiring electrical circuits yourself.',
      formalAr:'العمل الكهربائي يتطلب تدريبًا مناسبًا واشتراطات سلامة وتصاريح أو ترخيصًا حيث يلزم.', formalEn:'Electrical work requires appropriate training, safety controls, and permits or licenses where required.' },
    { id:'camera', ar:'مشغل كاميرا / مدير تصوير', en:'Camera Operator', onet:'27-4031.00', profile:[5.8,1.5,6.5,1.0,2.0,4.0], sector:'arts', formal:false,
      workAr:'اختيار زاوية اللقطة وضبط الكاميرا والتعريض والتركيز والتنسيق مع الإضاءة والصوت.', workEn:'Choosing shot angles, controlling camera exposure and focus, and coordinating with lighting and sound.',
      testAr:'صوّر المشهد نفسه بثلاث زوايا مختلفة، ثم قارن كيف غيرت كل زاوية المعنى.', testEn:'Film the same scene from three angles and compare how each changes its meaning.',
      formalAr:'ملف أعمال وممارسة آمنة مع فريق تصوير يساعدان على اختبار المجال؛ متطلبات التخصص تختلف بين الأدوار.', formalEn:'A portfolio and safe practice with a film crew help test the field; specialist requirements vary by role.' },
    { id:'sound', ar:'فني هندسة صوت', en:'Sound Engineering Technician', onet:'27-4014.00', profile:[6.3,2.5,5.4,1.5,2.0,5.0], sector:'arts', formal:false,
      workAr:'إعداد معدات التسجيل والميكروفونات وضبط الصوت ومعالجة التسجيلات ومزامنتها.', workEn:'Setting up recording equipment and microphones, adjusting sound, processing recordings, and syncing audio.',
      testAr:'سجل حوارًا قصيرًا في مكانين مختلفين، قارن الضوضاء والوضوح، واكتب كيف تحسن التسجيل.', testEn:'Record a short dialogue in two locations, compare noise and clarity, and note how you would improve the recording.',
      formalAr:'ابدأ بتجارب تسجيل آمنة ومعدات متاحة، ثم تعلم مبادئ الصوت والإشارة وسلامة الكهرباء.', formalEn:'Start with safe recording experiments using available equipment, then learn audio, signal, and electrical safety basics.' },
    { id:'agriculture', ar:'مدير تشغيل زراعي', en:'Agricultural Operations Manager', onet:'11-9013.00', profile:[5.0,2.5,1.0,2.0,6.7,5.0], sector:'agriculture', formal:false,
      workAr:'تنسيق الإنتاج والعمالة والمدخلات ومتابعة المحاصيل والبيانات والتخزين والتسويق.', workEn:'Coordinating production, labor, and inputs while monitoring crops, records, storage, and sales.',
      testAr:'تحدث مع منتج زراعي عن مشكلة واحدة في الحصاد أو التخزين أو التسويق، وارسم سلسلة الحل دون شراء معدات.', testEn:'Ask a grower about one harvesting, storage, or marketing problem and map a possible solution without buying equipment.',
      formalAr:'التدريب الزراعي أو الخبرة الميدانية مهمان؛ لا تقدم توصيات فنية للمحاصيل أو المبيدات دون مختص مؤهل.', formalEn:'Agricultural training or field experience matters; do not offer crop or pesticide advice without a qualified specialist.' }
  ];

  const COPY = {
    ar: {
      about:'كيف يعمل الاختبار؟', introEyebrow:'اكتشاف مهني', start:'ابدأ اكتشاف نفسك ←', resume:'كمّل من آخر مرة', next:'التالي', back:'السابق', show:'اكتشف المهنة الأقرب لي',
      quizEyebrow:'ميولك للأنشطة', quizTitle:'أي نوع من العمل تختاره بإرادتك؟', scaleHelp:'قيّم مدى انطباق كل موقف عليك في الواقع، بعيدًا عن الراتب أو المكانة الاجتماعية.',
      flowEyebrow:'إشارات الاندماج', flowTitle:'في أي نوع من المهام ممكن تنسى الوقت؟', flowHelp:'فكّر في تجربة حقيقية مررت بها، أو أقرب نشاط تتوقع أنك ستندمج فيه. لا تختار الإجابة لمجرد أنها تبدو مثالية.',
      profileEyebrow:'الواقع العملي', profileTitle:'خلّينا نربط ميولك بظروفك الحالية.', profileHelp:'البيانات دي لا تقلل من توافقك مع مهنة بسبب السن أو الفلوس. هي بتغيّر طريقة البداية والخطوة العملية المقترحة.',
      labels:['ده مش أنا خالص','غالبًا مش أنا','أحيانًا حسب الموقف','ده بيحصل معايا غالبًا','ده أنا بوضوح'],
      flowLabels:['أبدًا','نادرًا','أحيانًا','غالبًا','بشكل متكرر'],
      validation:'جاوب على كل المواقف الظاهرة قبل ما تكمل.', flowValidation:'جاوب على إشارات الاندماج الستة قبل ما تكمل.', traceValidation:'اختر إجابة واحدة لكل موقف قبل المتابعة.', workValidation:'جاوب على أسئلة طريقة العمل الستة قبل المتابعة.',
      pageTitles:['مواقف العمل العملي','مواقف التحليل والبحث','مواقف الإبداع وصناعة الأفكار','مواقف التعامل والقيادة والتنظيم'],
      resultEyebrow:'الهوية المهنية الأقرب', why:'ليه الترشيح ده ظهر؟', tasks:'طبيعة الشغل اليومية', flowLabel:'إشارة الاندماج في المهام', profileTitle:'بصمتك في أنواع العمل الستة', nextTitle:'أول تجربة عملية مناسبة لظروفك', altTitle:'مسارات قريبة تستحق الاستكشاف', method:'كيف حُسبت النتيجة؟', sourceNote:'المؤشر يقارن شكل اهتماماتك بملفات مهنية مرجعية. النسبة ليست احتمال نجاح أو تشخيصًا، والاختبار العربي بصيغته الحالية لم يخضع بعد لدراسة تقنين محلية.', edit:'راجع إجاباتك', reset:'ابدأ من جديد', mainScore:'مؤشر تقارب ترتيب الاهتمامات', flowScore:'إشارة اندماج تقريبية', noTools:'لا توجد أداة محددة مسجلة؛ ابدأ بمحادثة مهنية وملاحظة يوم عمل قبل شراء أي معدات.',
      high:'مرتفع', medium:'متوسط', low:'منخفض', matchedField:'خبرتك الحالية قريبة من المجال المرشح؛ ابدأ من مهارة قابلة للنقل بدل العودة إلى نقطة الصفر.', differentField:'مجالك الحالي مختلف عن المسار المرشح؛ جرّب مهمة قصيرة أولًا قبل اتخاذ قرار دراسة أو تغيير مهني كبير.', experienceSome:'خبرتك السابقة يمكن تحويلها إلى دليل عملي؛ وثّق أمثلة على التنظيم أو التواصل أو حل المشكلات التي مارستها بالفعل.', experienceNone:'بما أنك في بداية الخبرة، اجعل أول خطوة مشروعًا تجريبيًا صغيرًا أو مشاهدة مهنية مباشرة بدل الالتزام بتكلفة كبيرة.',
      timeLow:'وقتك الأسبوعي محدود؛ قسّم التجربة إلى جلستين قصيرتين وثبّت الاستمرارية قبل زيادة الحمل.', timeHigh:'لديك وقت مناسب لتجربة أعمق؛ خصص جزءًا للتعلم وجزءًا لإنتاج عمل يمكن عرضه.',
      budgetFree:'ابدأ بالأدوات المجانية أو المتاحة لديك، ولا تنفق قبل أن تنفذ تجربة واحدة وتعرف ما الذي ينقصك فعلًا.', budgetPaid:'يمكنك تخصيص جزء محدود من الميزانية لأداة أو تدريب محدد بعد تحديد فجوة واضحة؛ تجنب شراء حزمة كبيرة في البداية.',
      locationPrefix:'مكانك المسجل لخطة البحث:', educationFormal:'هذا المسار قد يتطلب مؤهلًا متخصصًا أو تدريبًا وترخيصًا بحسب الدور والبلد. لا يمكن تحديد أهليتك من اسم المؤهل وحده؛ راجع الجهة المنظمة قبل الممارسة.', educationFormalReady:'ذكرت مؤهلًا بعد الثانوي أو تدريبًا مهنيًا، لكن الاختبار لا يعرف تخصصه أو اعتماده. قارن تخصصك بمتطلبات الجهة المنظمة قبل اعتبار نفسك مؤهلًا للممارسة.', educationOpen:'يمكنك اختبار المجال بمشروع أو ملف أعمال أولي؛ المتطلبات التعليمية تختلف حسب الدور وصاحب العمل.', educationEarly:'بياناتك الحالية لا تشير إلى تأهيل متخصص لهذا الدور. ابدأ بتجربة آمنة واستكشف مسار الدراسة أو التدريب المطلوب قبل ممارسة المهنة.',
      budgetLow:'ميزانيتك محدودة؛ استخدم بدائل مجانية أو استعارة الأدوات، واجعل الإنفاق الوحيد بعد ظهور فجوة محددة في التجربة.', budgetMedium:'ميزانيتك المتوسطة تسمح بتجربة مدفوعة صغيرة واحدة، مثل خامة أو أداة أساسية أو ورشة قصيرة، بعد مقارنة البدائل.', budgetHigh:'بما أن ميزانيتك مرنة، لا تبدأ بشراء معدات كثيرة. اختبر المجال أولًا ثم وجّه الإنفاق إلى أكثر نقطة أثبتت أنها تعطل تنفيذك.',
      timeVeryLow:'المتاح لك 1–3 ساعات أسبوعيًا؛ اجعل التجربة محددة في جلسة أو جلستين قصيرتين ولا تقِس اهتمامك بمشروع كبير.', timeLow:'المتاح لك 4–7 ساعات أسبوعيًا؛ وزّعها بين تعلّم قصير وتنفيذ عينة واحدة.', timeMedium:'المتاح لك 8–12 ساعة أسبوعيًا؛ خصص نصفها للتطبيق وإنتاج نموذج يمكن عرضه.', timeHigh:'لديك أكثر من 12 ساعة أسبوعيًا؛ نفّذ مشروعًا مصغرًا من البداية للنهاية وسجّل الوقت الذي اندمجت فيه والمهام التي استنزفتك.',
      fieldNames:{none:'بداية جديدة / مجال مختلف',arts:'فن وإعلام وتصميم',business:'تجارة وإدارة وماليات',tech:'تكنولوجيا وبرمجة وبيانات',engineering:'هندسة وصناعة وصيانة',health:'طب ورعاية صحية',education:'تعليم وتدريب',science:'علوم وبحث',hospitality:'ضيافة وأغذية',other:'مجال آخر'},
      introLead:'فيه ناس بتستمتع بحل الأرقام، وناس بتنسى الوقت وهي بتصمم، أو تعالج، أو تبني، أو تقود فريق. الاختبار ده بيقارن ميولك لطبيعة المهام بملفات مهنية، عشان يديك نقطة بداية واقعية لا حكم نهائي على مستقبلك.',
      taskDescriptions:'الدرجة هنا مبنية على نوع الأنشطة التي تميل إليها، لا على شهرة المهنة أو دخلها أو صورتها الاجتماعية.',
      profileIntro:'مؤهلك وخبرتك ووقتك وأدواتك وميزانيتك ومكانك تغيّر خطة البداية والتجربة المقترحة. لا نستخدم الاسم في القياس، ولا نجمع بيانات عن الجنس لأنها لا تصلح لقياس الميل المهني.',
      confidence:'تذكير: المهنة المرشحة بداية للاستكشاف، وليست قرارًا نهائيًا. جرّب المهام نفسها في الواقع ثم قارن شعورك ونتيجتك.'
    },
    en: {
      about:'How does it work?', introEyebrow:'Career discovery', start:'Start discovering yourself →', resume:'Continue where I left off', next:'Next', back:'Back', show:'Find my closest career match',
      quizEyebrow:'Activity interests', quizTitle:'Which kinds of work would you choose voluntarily?', scaleHelp:'Rate how accurately each situation describes your natural tendencies, apart from salary or social status.',
      flowEyebrow:'Engagement signals', flowTitle:'Which tasks might make you lose track of time?', flowHelp:'Think of a real experience, or the closest activity you expect to become absorbed in. Do not choose what merely sounds ideal.',
      profileEyebrow:'Practical context', profileTitle:'Let’s connect your interests with your current circumstances.', profileHelp:'These details do not reduce your career-interest fit because of age or money. They shape the suggested starting route and first experiment.',
      labels:['Not like me at all','Mostly unlike me','Sometimes / depends','Mostly like me','Very much like me'],
      flowLabels:['Never','Rarely','Sometimes','Often','Very often'],
      validation:'Answer every visible situation before continuing.', flowValidation:'Answer all six engagement signals before continuing.', traceValidation:'Choose one answer for every situation before continuing.', workValidation:'Answer all six work-style questions before continuing.',
      pageTitles:['Hands-on work situations','Analysis and investigation','Creative work and idea-making','People, leadership, and organization'],
      resultEyebrow:'Closest occupational identity', why:'Why did this match appear?', tasks:'What the work actually involves', flowLabel:'Task-engagement signal', profileTitle:'Your six work-interest dimensions', nextTitle:'A first practical experiment based on your circumstances', altTitle:'Nearby paths worth exploring', method:'How was this result calculated?', sourceNote:'This indicator compares your interest pattern with reference occupational profiles. It is not a probability of success or a diagnosis. This Arabic adaptation has not yet undergone local validation.', edit:'Review answers', reset:'Start over', mainScore:'Interest-rank alignment index', flowScore:'Exploratory engagement signal', noTools:'No specific tool was recorded. Start with an informational interview or job shadow before buying equipment.',
      high:'High', medium:'Moderate', low:'Low', matchedField:'Your current field is related to this career. Start with a transferable skill rather than returning to zero.', differentField:'Your current field differs from this path. Try a short task before making a major study or career-change decision.', experienceSome:'Your previous experience may provide transferable evidence. Document examples of organization, communication, or problem-solving you have already done.', experienceNone:'Since you are early in your work experience, begin with a small trial project or job shadow rather than a large commitment.',
      timeLow:'Your weekly time is limited. Divide the experiment into two short sessions and build consistency before increasing the workload.', timeHigh:'You have room for a deeper trial. Reserve time for learning and for producing work you can show.',
      budgetFree:'Start with free or available tools. Do not spend until you have completed one trial and identified what you truly lack.', budgetPaid:'You can reserve a limited amount for one focused tool or course after identifying a clear gap. Avoid buying a large package at the start.',
      locationPrefix:'Location for your opportunity search:', educationFormal:'This path may require a specialized qualification, supervised training, or a license depending on the role and country. Your eligibility cannot be determined from the qualification label alone; check the regulator before practicing.', educationFormalReady:'You reported post-secondary education or professional training, but the assessment does not know its specialization or accreditation. Compare it with the regulator’s requirements before treating yourself as qualified.', educationOpen:'You can test this field with a small project or portfolio. Education requirements vary by role and employer.', educationEarly:'Your answers do not indicate specialist preparation for this role. Start with a safe trial and investigate the required education or training before practicing.',
      budgetLow:'Your budget is limited. Use free alternatives or borrow equipment, and spend only after the trial reveals a specific gap.', budgetMedium:'Your moderate budget can support one small paid trial, such as a basic material, tool, or short workshop, after comparing alternatives.', budgetHigh:'Even with a flexible budget, do not start by buying extensive equipment. Test the work first, then spend only on a proven bottleneck.',
      timeVeryLow:'You have 1–3 hours a week. Keep the experiment to one or two short sessions; do not judge your interest through a large project.', timeLow:'You have 4–7 hours a week. Split the time between brief learning and producing one sample.', timeMedium:'You have 8–12 hours a week. Reserve about half for hands-on practice and producing a sample you can show.', timeHigh:'You have more than 12 hours a week. Complete a small end-to-end project and record which tasks absorbed you and which drained you.',
      fieldNames:{none:'Starting fresh / different field',arts:'Arts, media, and design',business:'Business, management, and finance',tech:'Technology, software, and data',engineering:'Engineering, industry, and maintenance',health:'Medicine and healthcare',education:'Education and training',science:'Science and research',hospitality:'Hospitality and food',other:'Other field'},
      introLead:'Some people enjoy balancing accounts; others lose track of time designing, caring, building, or leading a team. This assessment compares your task interests with occupational reference profiles to offer a practical starting point, not a final verdict on your future.',
      taskDescriptions:'The score reflects the kinds of activities you prefer, not a career’s fame, income, or social image.',
      profileIntro:'Your education, experience, time, tools, budget, and location shape the first-step plan. Your name is not scored, and gender is not collected because it is not a valid measure of vocational interest.',
      confidence:'Reminder: the suggested career is a starting point for exploration, not a final decision. Try the tasks in real life, then compare how you feel and what you produce.'
    }
  };

  let lang = 'ar';
  try { lang = localStorage.getItem(LANG_KEY) || 'ar'; } catch (_) {}
  let currentPage = 0;
  const DEFAULT_STATE = { answers:{}, flow:{}, trace:{}, workstyle:{}, profile:{ name:'', education:'none', field:'none', experience:'0', hours:'5', budget:'0', location:'', cityType:'unknown', runway:'unknown', tools:[], access:[] }, lastResult:null };
  let state = structuredClone(DEFAULT_STATE);
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem('ebda2_career_v3') || 'null');
    if (stored && typeof stored === 'object') state = { ...DEFAULT_STATE, ...stored, trace:{...(stored.trace||{})}, workstyle:{...(stored.workstyle||{})}, profile:{ ...DEFAULT_STATE.profile, ...(stored.profile || {}), tools:[...((stored.profile||{}).tools||[])], access:[...((stored.profile||{}).access||[])] } };
  } catch (_) {}

  const $ = id => document.getElementById(id);
  const t = (ar, en) => lang === 'ar' ? ar : en;
  const tr = key => COPY[lang][key];
  const esc = value => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {} };

  function applyLanguage() {
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-lang]').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    $('about-link').textContent = tr('about');
    $('intro-eyebrow').textContent = tr('introEyebrow');
    $('intro-title').textContent = t('مش لازم تحب اسم الوظيفة. المهم تحب اللي بتعمله كل يوم.','You do not have to love a job title. You need to enjoy what you do every day.');
    $('intro-lead').textContent = tr('introLead');
    $('fact-one-title').textContent = t('24 موقفًا','24 situations');
    $('fact-one-copy').textContent = t('تقيس أنواع الأنشطة التي تميل إليها','Map the activities you naturally lean toward');
    $('fact-two-title').textContent = t('6 إشارات اندماج + 6 مواقف سلوكية','6 engagement + 6 behavioral clues');
    $('fact-two-copy').textContent = t('ماذا تفعل تلقائيًا وما الذي يجذب انتباهك','What you do naturally and what draws your attention');
    $('fact-three-title').textContent = t('هوية + نموذج عمل + فرصة','Identity + work model + opportunity');
    $('fact-three-copy').textContent = t('مهنة مرشحة وطريقة دخل وتجارب مشروعات','A career, way of working, and business experiments');
    $('intro-note').textContent = t('اختار اللي هتعمله فعلًا، مش اللي شكله أذكى أو أكثر احترامًا في نظر الناس. مفيش إجابة صح أو غلط.','Choose what you would really do, not what seems clever or socially admired. There are no right or wrong answers.');
    $('start-btn').textContent = tr('start');
    $('resume-btn').textContent = tr('resume');
    $('privacy-note').textContent = t('إجاباتك محفوظة على نفس الجهاز فقط. الموقع لا يرسلها إلى واتساب أو إلى خادم خارجي.','Your answers are stored on this device only. The site does not send them to WhatsApp or an external server.');
    $('quiz-eyebrow').textContent = tr('quizEyebrow'); $('quiz-title').textContent = tr('quizTitle'); $('scale-help').textContent = tr('scaleHelp');
    $('flow-eyebrow').textContent = tr('flowEyebrow'); $('flow-title').textContent = tr('flowTitle'); $('flow-help').textContent = tr('flowHelp');
    $('trace-eyebrow').textContent = t('بصمة السلوك والاهتمامات اليومية','Behavioral and leisure clues'); $('trace-title').textContent = t('بعيدًا عن وصفك لنفسك، ماذا تفعل تلقائيًا؟','Beyond self-description, what do you naturally do?'); $('trace-help').textContent = t('اختر الأقرب لما تفعله فعلًا، وليس لما تتمنى أن تكون عليه. هذه إشارات استكشافية وليست أحكامًا على شخصيتك.','Choose what you actually do, not what you wish you did. These are exploratory clues, not personality verdicts.');
    $('workstyle-eyebrow').textContent = t('طريقة العمل التي تناسبك','Your preferred way of working'); $('workstyle-title').textContent = t('كيف تحب أن يكون شكل يوم العمل؟','What kind of workday suits you?'); $('workstyle-help').textContent = t('هذه الأسئلة تميّز بين الوظيفة والعمل الحر والمشروع المستقل وتأسيس شركة والعمل الهجين.','These questions help distinguish employment, freelancing, a small business, company building, and hybrid work.');
    $('profile-eyebrow').textContent = tr('profileEyebrow'); $('profile-title').textContent = tr('profileTitle'); $('profile-help').textContent = tr('profileHelp');
    $('label-name').textContent = t('تحب نناديك بإيه؟ (اختياري)','What should we call you? (optional)');
    $('label-education').textContent = t('مستواك التعليمي الحالي','Current education');
    $('label-field').textContent = t('أقرب مجال لدراستك أو خبرتك','Closest field to your study or experience');
    $('label-experience').textContent = t('سنوات الخبرة العملية','Years of work experience');
    $('label-hours').textContent = t('الوقت المتاح للتجربة أو التعلم أسبوعيًا','Time available for trial or learning per week');
    $('label-budget').textContent = t('ميزانية تقدر تخصصها للتجربة الأولى','Budget available for the first experiment');
    $('label-location').textContent = t('المدينة أو المحافظة / البلد','City / governorate / country');
    $('label-city-type').textContent = t('طبيعة المكان الذي تعيش أو تعمل فيه','Type of area where you live or work'); $('label-runway').textContent = t('إلى متى تستطيع تحمل دخل غير منتظم؟','How long could you manage with irregular income?'); $('label-access').textContent = t('ما الذي تستطيع الوصول إليه في محيطك؟','What can you access in your area?');
    $('label-tools').textContent = t('إيه المتاح عندك حاليًا؟ (اختار كل اللي ينطبق)','What do you currently have available? (Select all that apply)');
    $('tool-phone').textContent = t('موبايل','Phone'); $('tool-computer').textContent = t('كمبيوتر أو لابتوب','Computer or laptop'); $('tool-camera').textContent = t('كاميرا أو ميكروفون','Camera or microphone'); $('tool-tools').textContent = t('أدوات أو معدات عملية','Practical tools or equipment'); $('tool-workspace').textContent = t('مكان أقدر أشتغل أو أتدرب فيه','A place to work or practice'); $('tool-network').textContent = t('معارف أو علاقات في مجال مهني','Professional contacts or network'); $('tool-vehicle').textContent = t('وسيلة انتقال أو نقل','Transport vehicle'); $('tool-storage').textContent = t('مخزن أو مساحة تخزين','Storage space'); $('tool-land').textContent = t('أرض أو سطح أو مساحة خارجية','Land, roof, or outdoor space');
    $('access-suppliers').textContent=t('موردون وتجار جملة','Suppliers and wholesalers'); $('access-workshops').textContent=t('ورش وفنيون','Workshops and technicians'); $('access-farms').textContent=t('مزارع ومنتجون زراعيون','Farms and growers'); $('access-tourism').textContent=t('فنادق وأنشطة سياحية','Hotels and tourism businesses'); $('access-businesses').textContent=t('محلات وشركات محلية','Local shops and businesses'); $('access-schools').textContent=t('مدارس ومراكز تعليم','Schools and learning centers'); $('access-health').textContent=t('مؤسسات صحية','Healthcare organizations'); $('access-factories').textContent=t('مصانع ومناطق إنتاج','Factories and production areas');
    fillStaticOptions(); syncProfile();
    $('quiz-back').textContent = tr('back'); $('quiz-next').textContent = tr('next'); $('flow-back').textContent = tr('back'); $('flow-next').textContent = tr('next'); $('trace-back').textContent=tr('back'); $('trace-next').textContent=tr('next'); $('workstyle-back').textContent=tr('back'); $('workstyle-next').textContent=tr('next'); $('profile-back').textContent = tr('back'); $('show-results').textContent = tr('show');
    $('footer-copy').textContent = t('أداة استكشاف مهني أولية — ليست تشخيصًا نفسيًا أو ضمانًا للنجاح.','An exploratory career tool — not a psychological diagnosis or a guarantee of success.');
    $('reset-btn').textContent = tr('reset');
    renderPage();
  }

  function fillStaticOptions() {
    const sets = [
      ['p-education', [['none','بدون مؤهل بعد الإعدادية','No formal qualification beyond middle school'],['secondary','ثانوي','Secondary school'],['diploma','دبلوم / معهد','Diploma / institute'],['bachelor','بكالوريوس / ليسانس','Bachelor’s degree'],['postgrad','دراسات عليا','Postgraduate'],['professional','تدريب أو شهادات مهنية','Professional training or certificates']]],
      ['p-field', [['none','لسه ببدأ / مجال مختلف','Starting fresh / different field'],['arts','فن وإعلام وتصميم','Arts, media, and design'],['business','تجارة وإدارة وماليات','Business, management, and finance'],['tech','تكنولوجيا وبرمجة وبيانات','Technology, software, and data'],['engineering','هندسة وصناعة وصيانة','Engineering, industry, and maintenance'],['health','طب ورعاية صحية','Medicine and healthcare'],['education','تعليم وتدريب','Education and training'],['science','علوم وبحث','Science and research'],['hospitality','ضيافة وأغذية','Hospitality and food'],['other','مجال آخر','Other field']]],
      ['p-experience', [['0','لسه من غير خبرة','No experience yet'],['1','أقل من سنتين','Under 2 years'],['3','من سنتين إلى 5','2–5 years'],['6','أكثر من 5 سنوات','Over 5 years']]],
      ['p-hours', [['2','ساعة إلى 3 ساعات','1–3 hours'],['5','4 إلى 7 ساعات','4–7 hours'],['9','8 إلى 12 ساعة','8–12 hours'],['16','أكثر من 12 ساعة','Over 12 hours']]],
      ['p-budget', [['0','من غير إنفاق حاليًا','No spending for now'],['low','محدودة','Limited'],['medium','متوسطة','Moderate'],['high','مرنة','Flexible']]],
      ['p-city-type', [['unknown','غير محدد','Not specified'],['large','مدينة كبيرة','Large city'],['industrial','منطقة صناعية أو ميناء','Industrial area or port'],['tourist','مدينة سياحية أو ساحلية','Tourist or coastal city'],['rural','قرية أو منطقة زراعية','Rural or agricultural area'],['small','مدينة صغيرة أو ضاحية','Small city or suburb']]],
      ['p-runway', [['unknown','لا أعرف / أفضل عدم الإجابة','Not sure / prefer not to say'],['none','لا أستطيع حاليًا','I cannot currently'],['short','أقل من 3 أشهر','Under 3 months'],['medium','3 إلى 6 أشهر','3–6 months'],['long','أكثر من 6 أشهر','Over 6 months']]]
    ];
    sets.forEach(([id, options]) => {
      const el = $(id), previous = el.value;
      el.innerHTML = options.map(([value, ar, en]) => `<option value="${esc(value)}">${esc(t(ar,en))}</option>`).join('');
      if (options.some(o => o[0] === previous)) el.value = previous;
    });
  }

  function syncProfile() {
    const p = state.profile;
    $('p-name').value = p.name || '';
    ['education','field','experience','hours','budget'].forEach(k => { if (p[k] !== undefined) $('p-' + k).value = String(p[k]); });
    $('p-location').value = p.location || ''; $('p-city-type').value = p.cityType || 'unknown'; $('p-runway').value = p.runway || 'unknown';
    document.querySelectorAll('input[name="tool"]').forEach(el => { el.checked = (p.tools || []).includes(el.value); });
    document.querySelectorAll('input[name="access"]').forEach(el => { el.checked = (p.access || []).includes(el.value); });
  }

  function readProfile() {
    const p = state.profile;
    p.name = $('p-name').value.trim();
    p.education = $('p-education').value;
    p.field = $('p-field').value;
    p.experience = $('p-experience').value;
    p.hours = $('p-hours').value;
    p.budget = $('p-budget').value;
    p.location = $('p-location').value.trim(); p.cityType = $('p-city-type').value; p.runway = $('p-runway').value;
    p.tools = Array.from(document.querySelectorAll('input[name="tool"]:checked')).map(el => el.value);
    p.access = Array.from(document.querySelectorAll('input[name="access"]:checked')).map(el => el.value);
  }

  function showOnly(id) {
    ['intro','quiz','flow','trace','workstyle','profile','results'].forEach(section => $(section).classList.toggle('hidden', section !== id));
    window.scrollTo({ top:0, behavior:'smooth' });
  }

  function renderPage() {
    if (currentPage === 0) {
      showOnly('intro');
      const hasProgress = Object.keys(state.answers).length > 0 || Object.keys(state.flow).length > 0 || Object.keys(state.trace).length > 0 || Object.keys(state.workstyle).length > 0;
      $('resume-btn').hidden = !hasProgress;
    } else if (currentPage >= 1 && currentPage <= 4) {
      showOnly('quiz'); renderQuizPage();
    } else if (currentPage === 5) {
      showOnly('flow'); renderFlowPage();
    } else if (currentPage === 6) {
      showOnly('trace'); renderTracePage();
    } else if (currentPage === 7) {
      showOnly('workstyle'); renderWorkstylePage();
    } else if (currentPage === 8) {
      showOnly('profile'); $('profile-counter').textContent='8 / 9'; syncProfile();
    } else if (currentPage === 9) {
      showOnly('results'); renderResults();
    }
  }

  function ratingButtons(id, selected, cssClass='') {
    const labels = tr('labels');
    return `<div class="rating ${cssClass}" role="group" aria-label="${esc(t('مقياس من 1 إلى 5','Rating from 1 to 5'))}">` + labels.map((label,i) => {
      const value = i + 1, is = Number(selected) === value;
      return `<button type="button" data-answer-id="${esc(id)}" data-answer-value="${value}" class="${is ? 'selected' : ''}" aria-pressed="${is}"><strong>${value}</strong>${esc(label)}</button>`;
    }).join('') + '</div>';
  }

  function flowRatingButtons(id, selected) {
    const labels = tr('flowLabels');
    return `<div class="rating" role="group" aria-label="${esc(t('مقياس تكرار من 1 إلى 5','Frequency scale from 1 to 5'))}">` + labels.map((label,i) => {
      const value = i + 1, is = Number(selected) === value;
      return `<button type="button" data-answer-id="${esc(id)}" data-answer-value="${value}" class="${is ? 'selected' : ''}" aria-pressed="${is}"><strong>${value}</strong>${esc(label)}</button>`;
    }).join('') + '</div>';
  }

  function renderQuizPage() {
    const subset = DISPLAY_QUESTIONS.slice((currentPage - 1) * 6, currentPage * 6);
    $('step-counter').textContent = `${currentPage} / 9`;
    $('progress-fill').style.width = `${currentPage / 9 * 100}%`;
    $('question-list').innerHTML = subset.map((q,i) => `<article class="question" id="item-${q.id}"><p class="question-title"><span class="question-index">${(currentPage - 1) * 6 + i + 1}.</span> ${esc(t(q.ar,q.en))}</p>${ratingButtons(q.id,state.answers[q.id])}</article>`).join('');
    $('quiz-validation').hidden = true;
    $('quiz-back').textContent = tr('back'); $('quiz-next').textContent = tr('next');
    $('quiz-back').disabled = false;
  }

  function renderFlowPage() {
    $('flow-counter').textContent = '5 / 9';
    $('flow-progress-fill').style.width = '55.6%';
    $('flow-list').innerHTML = FLOW_ITEMS.map((q,i) => `<article class="question" id="item-${q.id}"><p class="question-title"><span class="question-index">${25 + i}.</span> ${esc(t(q.ar,q.en))}</p>${flowRatingButtons(q.id,state.flow[q.id])}</article>`).join('');
    $('flow-validation').hidden = true;
  }

  function renderTracePage() {
    $('trace-counter').textContent = '6 / 9'; $('trace-progress-fill').style.width = '66.7%';
    $('trace-list').innerHTML = TRACE_ITEMS.map((q,i) => {
      const selected = Number(state.trace[q.id] || 0);
      const opts = q.options.map((o,j) => `<button type="button" class="choice-option ${selected === j+1 ? 'selected' : ''}" data-answer-id="${q.id}" data-answer-value="${j+1}" aria-pressed="${selected === j+1}">${esc(t(o.ar,o.en))}</button>`).join('');
      return `<article class="question" id="item-${q.id}"><p class="question-title"><span class="question-index">${31+i}.</span> ${esc(t(q.ar,q.en))}</p><div class="choice-grid">${opts}</div></article>`;
    }).join(''); $('trace-validation').hidden = true;
  }

  function renderWorkstylePage() {
    $('workstyle-counter').textContent = '7 / 9'; $('workstyle-progress-fill').style.width = '77.8%';
    $('workstyle-list').innerHTML = WORKSTYLE_ITEMS.map((q,i) => `<article class="question" id="item-${q.id}"><p class="question-title"><span class="question-index">${37+i}.</span> ${esc(t(q.ar,q.en))}</p>${ratingButtons(q.id,state.workstyle[q.id],'work-rating')}</article>`).join('');
    $('workstyle-validation').hidden = true;
  }

  function getScores() {
    const scores = {};
    ORDER.forEach(d => {
      const items = QUESTIONS.filter(q => q.d === d);
      scores[d] = items.reduce((sum,q) => sum + Number(state.answers[q.id] || 0),0) / items.length;
    });
    return scores;
  }

  function getTopDimensions(scores) {
    return [...ORDER].sort((a,b) => scores[b] - scores[a]);
  }

  function careerMatch(career, scores) {
    const meta = (window.EBDA_CAREER_MAP || {})[career.id] || {};
    const interestCode = meta.interestCode || career.interestCode || ORDER.slice().sort((a,b) => scores[b]-scores[a]).slice(0,2).join('');
    // Average ranks for tied dimensions: equal scores must not be broken by
    // the fixed display order (R, I, A, S, E, C).
    const ordered = ORDER.slice().sort((a,b) => scores[b] - scores[a]);
    const rank = {};
    let cursor = 0;
    while (cursor < ordered.length) {
      let end = cursor + 1;
      while (end < ordered.length && Math.abs(scores[ordered[end]] - scores[ordered[cursor]]) < 1e-9) end++;
      const averageRank = (cursor + end - 1) / 2;
      for (let i = cursor; i < end; i++) rank[ordered[i]] = averageRank;
      cursor = end;
    }
    const codeLetters = [...interestCode].slice(0,3);
    const weights = [3,2,1];
    let fitPoints = codeLetters.reduce((sum,d,i) => sum + weights[i] * ((5-rank[d])/5), 0);
    // A two-letter O*NET code has no third high-point type. Fill its missing
    // slot with the average rank of unlisted dimensions to keep scores comparable.
    if (codeLetters.length < 3) {
      const unlisted = ORDER.filter(d => !codeLetters.includes(d));
      const neutralRank = unlisted.reduce((sum,d)=>sum+rank[d],0) / (unlisted.length || 1);
      for (let i = codeLetters.length; i < 3; i++) fitPoints += weights[i] * ((5-neutralRank)/5);
    }
    const similarity = Math.round(100 * fitPoints / 6);
    const traceOptions = TRACE_ITEMS.map(q => ({q, option:q.options[(Number(state.trace[q.id]||0))-1]})).filter(x=>x.option);
    const traceHits = traceOptions.filter(x => interestCode.includes(x.option.d)).length;
    const traceFit = traceOptions.length ? Math.round(traceHits / traceOptions.length * 100) : 0;
    const codeFlow = codeLetters.map(d => d);
    const flowWeights = [3,2,1];
    let flowPoints = codeFlow.reduce((sum,d,i) => sum + flowWeights[i] * ((Number(state.flow['f'+d] || 0)-1)/4), 0);
    if (codeFlow.length < 3) {
      const unlisted = ORDER.filter(d => !codeFlow.includes(d));
      const neutralFlow = unlisted.reduce((sum,d)=>sum + ((Number(state.flow['f'+d] || 0)-1)/4),0) / (unlisted.length || 1);
      for (let i = codeFlow.length; i < 3; i++) flowPoints += flowWeights[i] * neutralFlow;
    }
    const flowSignal = Object.keys(state.flow).length
      ? Math.round(100 * flowPoints / 6)
      : 0;
    const topCodes = [...interestCode];
    return { ...career, interestCode, similarity, traceFit, flowSignal, topCodes };
  }

  function getTraceSummary() {
    const counts = Object.fromEntries(ORDER.map(d=>[d,0]));
    const mediums = {};
    for (const q of TRACE_ITEMS) {
      const option = q.options[(Number(state.trace[q.id]||0))-1];
      if (!option) continue;
      counts[option.d]++;
      mediums[option.medium] = (mediums[option.medium]||0)+1;
    }
    const topMedium = Object.entries(mediums).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'digital';
    return {counts, mediums, topMedium, answered:Object.keys(state.trace).length};
  }

  function getWorkModelResults(careerId = null) {
    const w = state.workstyle;
    const v = id => Math.max(1,Math.min(5,Number(w[id]||3)));
    const autonomy=v('w_autonomy'), clients=v('w_clients'), lead=v('w_lead'), stability=v('w_stability'), operations=v('w_operations'), uncertainty=v('w_uncertainty');
    const raw = [
      {id:'employee',ar:'موظف متخصص',en:'Employed specialist',v:0.30*stability+0.25*operations+0.20*(6-autonomy)+0.15*(6-uncertainty)+0.10*(6-lead),descAr:'تعمل داخل مؤسسة مع دخل أكثر انتظامًا وحدود مسؤوليات أوضح.',descEn:'Work within an organization with more predictable income and clearer responsibility boundaries.'},
      {id:'freelance',ar:'مستقل يقدم خدمة',en:'Independent freelancer',v:0.30*autonomy+0.25*clients+0.20*(6-lead)+0.15*uncertainty+0.10*(6-stability),descAr:'تبيع مهارة أو خدمة مباشرة لعملاء، وتدير وقتك وعلاقاتك بنفسك.',descEn:'Sell a skill or service directly to clients and manage your own time and relationships.'},
      {id:'micro',ar:'صاحب مشروع صغير',en:'Small-business owner',v:0.22*autonomy+0.25*clients+0.20*operations+0.18*lead+0.15*uncertainty,descAr:'تبني نشاطًا محدود النطاق له عملاء وتشغيل وتكاليف متكررة.',descEn:'Build a focused operation with customers, recurring processes, and costs.'},
      {id:'company',ar:'مؤسس شركة',en:'Company founder',v:0.18*autonomy+0.20*clients+0.25*lead+0.17*uncertainty+0.20*(6-stability),descAr:'تطور عرضًا وفريقًا وعمليات قابلة للتوسع، مع مسؤولية عالية عن المخاطر.',descEn:'Develop an offer, team, and scalable operations while owning substantial risk.'},
      {id:'hybrid',ar:'مسار هجين',en:'Hybrid path',v:0.25*stability+0.20*autonomy+0.20*clients+0.15*uncertainty+0.20*(6-lead),descAr:'تحافظ على مصدر دخل أو وظيفة، وتختبر نشاطًا مستقلًا تدريجيًا.',descEn:'Keep an income source or job while gradually testing an independent activity.'}
    ];
    const runway = profileRunwayCode();
    const budget = ({'0':0,low:1,medium:2,high:3})[state.profile.budget] ?? 0;
    const hours = Number(state.profile.hours||5);
    const careerMeta = careerId ? ((window.EBDA_CAREER_MAP || {})[careerId] || {}) : null;
    const allowedModels = careerMeta && Array.isArray(careerMeta.models) ? new Set(careerMeta.models) : null;
    const eligible = allowedModels ? raw.filter(m => allowedModels.has(m.id)) : raw;
    return eligible.map(m=>{
      const preferenceScore = Math.round(((m.v-1)/4)*100);
      const runwayTable = {
        none:{employee:100,freelance:35,micro:20,company:10,hybrid:95},
        short:{employee:95,freelance:50,micro:35,company:25,hybrid:100},
        medium:{employee:85,freelance:70,micro:65,company:55,hybrid:95},
        long:{employee:65,freelance:90,micro:90,company:90,hybrid:85},
        unknown:{employee:75,freelance:65,micro:60,company:55,hybrid:80}
      };
      const budgetTable = [
        {employee:100,freelance:75,micro:45,company:25,hybrid:95},
        {employee:90,freelance:85,micro:65,company:45,hybrid:95},
        {employee:75,freelance:90,micro:85,company:75,hybrid:90},
        {employee:65,freelance:95,micro:95,company:95,hybrid:85}
      ];
      const timeTable = hours<=2 ? {employee:100,freelance:65,micro:45,company:25,hybrid:95} : hours<=5 ? {employee:90,freelance:80,micro:70,company:50,hybrid:95} : hours<=9 ? {employee:75,freelance:90,micro:85,company:75,hybrid:90} : {employee:65,freelance:95,micro:95,company:90,hybrid:85};
      const runwayFit = runwayTable[runway][m.id];
      const budgetFit = budgetTable[budget][m.id];
      const timeFit = timeTable[m.id];
      const readinessScore = Math.round(runwayFit*.40 + budgetFit*.35 + timeFit*.25);
      const score = Math.round(preferenceScore*.75 + readinessScore*.25);
      return {...m,preferenceScore,readinessScore,score};
    }).sort((a,b)=>b.score-a.score);
  }

  function profileRunwayCode() {
    return ['none','short','medium','long'].includes(state.profile.runway) ? state.profile.runway : 'unknown';
  }

  const PROJECT_IDEAS = [
    {id:'video_sme',sector:'arts',titleAr:'إنتاج فيديوهات قصيرة للشركات المحلية',titleEn:'Short-form video production for local businesses',customerAr:'مطاعم ومتاجر وخدمات تحتاج محتوى مرئيًا منتظمًا',customerEn:'Restaurants, shops, and service businesses needing regular visual content',offerAr:'تصوير أو مونتاج حزمة صغيرة من الفيديوهات مع تسليم واضح ومحدد',offerEn:'Shoot or edit a small package of videos with a clear scope and delivery',testAr:'اعرض نموذجًا واحدًا على ثلاثة أنشطة محلية واسأل عن احتياجهم وميزانيتهم قبل شراء معدات',testEn:'Show one sample to three local businesses and ask about their needs and budget before buying gear',assets:['phone','computer','camera'],access:['businesses','tourism'],cities:['large','tourist','small'],medium:['visual','digital'],models:['freelance','micro','company','hybrid'],capital:0,hours:2},
    {id:'editing',sector:'arts',titleAr:'خدمة مونتاج عن بُعد',titleEn:'Remote video-editing service',customerAr:'صناع محتوى وشركات ووكالات إنتاج صغيرة',customerEn:'Content creators, businesses, and small production agencies',offerAr:'مونتاج مقاطع قصيرة أو حلقات وفق نطاق وتعديلات متفق عليها',offerEn:'Edit short clips or episodes under an agreed scope and revision limit',testAr:'أنجز عينة قبل/بعد من مادة تملك حق استخدامها، ثم اختبرها مع عميلين محتملين',testEn:'Create a before/after sample using footage you have rights to, then test it with two potential clients',assets:['computer'],access:['businesses'],cities:['large','small','tourist','rural'],medium:['digital','visual'],models:['freelance','micro','hybrid'],capital:0,hours:2},
    {id:'product_photo',sector:'arts',titleAr:'تصوير منتجات للمتاجر والمطاعم',titleEn:'Product photography for shops and restaurants',customerAr:'متاجر إلكترونية ومطاعم وعلامات ناشئة',customerEn:'Online shops, restaurants, and emerging brands',offerAr:'جلسة تصوير منتجات محدودة مع صور جاهزة للاستخدام التجاري',offerEn:'A small product shoot with commercially usable images',testAr:'صوّر ثلاثة منتجات بإضاءة متاحة واطلب تقييم أصحابها قبل التسعير',testEn:'Photograph three products with available lighting and ask owners for feedback before pricing',assets:['phone','camera','workspace'],access:['businesses','tourism'],cities:['large','tourist','small'],medium:['visual','physical'],models:['freelance','micro','hybrid'],capital:1,hours:3},
    {id:'event_coverage',sector:'arts',titleAr:'تغطية مرئية للفعاليات الصغيرة',titleEn:'Visual coverage for small events',customerAr:'منظمو الفعاليات والمراكز والأنشطة المحلية',customerEn:'Event organizers, venues, and local activities',offerAr:'تغطية صور أو فيديو قصيرة وفق جدول تسليم واضح',offerEn:'Photo or short-video coverage with a clear delivery schedule',testAr:'تعاون مع فعالية صغيرة بموافقة المنظم واختبر الوقت والتكلفة الفعلية',testEn:'With organizer permission, support a small event and measure actual time and cost',assets:['phone','camera'],access:['tourism','businesses'],cities:['large','tourist','small'],medium:['visual','people'],models:['freelance','micro','company'],capital:1,hours:3},
    {id:'web_presence',sector:'tech',titleAr:'إنشاء صفحات ويب تعريفية للأنشطة الصغيرة',titleEn:'Simple web presence for small businesses',customerAr:'مقدمو خدمات ومتاجر لا يملكون صفحة واضحة على الإنترنت',customerEn:'Service providers and shops without a clear online presence',offerAr:'صفحة تعريفية بسيطة ببيانات النشاط ووسيلة تواصل ونموذج طلب',offerEn:'A simple business page with details, contact options, and an inquiry form',testAr:'ابنِ نموذجًا تجريبيًا لنشاط افتراضي واعرضه على ثلاثة أصحاب أعمال',testEn:'Build a demo for a fictional business and show it to three business owners',assets:['computer'],access:['businesses'],cities:['large','industrial','tourist','small','rural'],medium:['digital','systems'],models:['freelance','micro','company','hybrid'],capital:0,hours:3},
    {id:'automation',sector:'tech',titleAr:'أتمتة مهام إدارية بسيطة',titleEn:'Automation of simple administrative tasks',customerAr:'مكاتب وشركات صغيرة تكرر إدخال البيانات أو إعداد التقارير',customerEn:'Small offices repeating data entry or report preparation',offerAr:'تحسين نموذج أو جدول أو تنبيه آلي بعد فهم سير العمل',offerEn:'Improve a form, spreadsheet, or automated reminder after mapping the workflow',testAr:'راقب مهمة متكررة لدى نشاط بموافقته، وقدّر الوقت الحالي ثم صمم نموذجًا أوليًا',testEn:'Observe a recurring task with permission, estimate current time, and create a prototype',assets:['computer'],access:['businesses'],cities:['large','industrial','small'],medium:['digital','systems','numbers'],models:['freelance','micro','company','hybrid'],capital:0,hours:3},
    {id:'data_report',sector:'tech',titleAr:'تقارير ولوحات متابعة مبسطة',titleEn:'Simple reporting dashboards',customerAr:'متاجر أو فرق صغيرة تحتاج متابعة مبيعات أو مخزون',customerEn:'Shops or small teams tracking sales or inventory',offerAr:'تنظيف جدول بيانات وإنشاء تقرير دوري مفهوم',offerEn:'Clean a spreadsheet and produce a clear recurring report',testAr:'استخدم بيانات افتراضية وابنِ لوحة واحدة ثم اختبر فهم المستخدم لها',testEn:'Use synthetic data to build one dashboard and test whether a user understands it',assets:['computer'],access:['businesses'],cities:['large','industrial','small'],medium:['numbers','digital','systems'],models:['freelance','micro','hybrid'],capital:0,hours:3},
    {id:'market_interviews',sector:'business',titleAr:'بحث عملاء ومنافسين للمشروعات الصغيرة',titleEn:'Customer and competitor research for small firms',customerAr:'مشروعات تفكر في إطلاق منتج أو تعديل خدمة',customerEn:'Businesses considering a product launch or service change',offerAr:'مقابلات استكشافية ومقارنة عروض المنافسين مع توضيح حدود العينة',offerEn:'Exploratory interviews and competitor-offer mapping with transparent sample limits',testAr:'أجرِ خمس مقابلات بموافقة المشاركين واكتب ما تعلمته وما لا تستطيع الجزم به',testEn:'Conduct five consent-based interviews and document what you learned and cannot conclude',assets:['phone','computer','network'],access:['businesses','suppliers'],cities:['large','industrial','tourist','small'],medium:['people','numbers'],models:['freelance','micro','hybrid'],capital:0,hours:2},
    {id:'b2b_sales',sector:'business',titleAr:'خدمة تطوير مبيعات للشركات الصغيرة',titleEn:'Sales development support for small businesses',customerAr:'موردون ومصنعون ومقدمو خدمات للشركات',customerEn:'Suppliers, manufacturers, and B2B service providers',offerAr:'تنظيم قائمة العملاء المحتملين ومتابعة الاستفسارات والعروض',offerEn:'Organize prospect lists and follow up on inquiries and proposals',testAr:'اختر قطاعًا واحدًا، تحدث مع موردين وعملاء، واختبر عرض خدمة محددًا دون ضمان المبيعات',testEn:'Choose one sector, speak with suppliers and buyers, and test a defined service offer without promising sales',assets:['phone','computer','network'],access:['suppliers','factories','businesses'],cities:['large','industrial','small'],medium:['people','systems'],models:['freelance','micro','company','hybrid'],capital:0,hours:3},
    {id:'inventory',sector:'business',titleAr:'تنظيم المخزون والطلبات للمتاجر الصغيرة',titleEn:'Inventory and order-flow setup for small shops',customerAr:'متاجر تعاني من تشتت المخزون أو الطلبات',customerEn:'Shops struggling with fragmented inventory or orders',offerAr:'إعداد سجل مخزون وطريقة متابعة بسيطة وتدريب صاحب النشاط عليها',offerEn:'Set up a simple stock register and tracking routine, then train the owner',testAr:'ارسم دورة منتج واحد من الاستلام حتى البيع واختبر نموذج سجل بسيطًا',testEn:'Map one product from receiving to sale and test a simple tracking sheet',assets:['computer','phone'],access:['businesses','suppliers'],cities:['large','industrial','small'],medium:['systems','numbers'],models:['freelance','micro','hybrid'],capital:0,hours:2},
    {id:'event_coordination',sector:'business',titleAr:'تنسيق مناسبات ولقاءات صغيرة',titleEn:'Coordination of small gatherings and events',customerAr:'شركات ومراكز ومجموعات تحتاج لقاءات محدودة',customerEn:'Businesses, centers, and groups arranging small gatherings',offerAr:'إدارة قائمة المهام والموردين والتوقيت والتسجيل',offerEn:'Manage the task list, vendors, schedule, and registration',testAr:'ضع خطة فعالية افتراضية، ثم اسأل جهة قائمة عن أكثر جزء تشغيلي يسبب لها مشكلة',testEn:'Plan a hypothetical event, then ask an established organizer which operational task causes the most difficulty',assets:['phone','network'],access:['tourism','businesses','schools'],cities:['large','tourist','small'],medium:['people','systems'],models:['freelance','micro','company'],capital:1,hours:3},
    {id:'bookkeeping',sector:'business',titleAr:'مساندة مسك الدفاتر والتقارير التشغيلية',titleEn:'Bookkeeping and operational reporting support',customerAr:'مشروعات صغيرة تحتاج ترتيب المستندات والمصروفات',customerEn:'Small businesses needing organized records and expense tracking',offerAr:'تنظيم بيانات ومصروفات وتقارير داخل نطاق التأهيل المسموح',offerEn:'Organize records, expenses, and reports within the provider’s qualifications',testAr:'أنشئ نموذج مصروفات افتراضيًا واختبر الدقة. لا تقدم مراجعة أو إقرارًا أو توقيعًا مهنيًا دون الصلاحية اللازمة',testEn:'Create a fictional expense ledger and test accuracy. Do not offer audit, tax filing, or professional sign-off without the required authorization',assets:['computer'],access:['businesses'],cities:['large','industrial','small'],medium:['numbers','systems'],models:['freelance','micro','hybrid'],capital:0,hours:3},
    {id:'learning_material',sector:'education',titleAr:'تصميم مواد تعليمية وتدريبية',titleEn:'Educational and training material design',customerAr:'مدربون ومراكز تعليم ومدارس ومؤسسات',customerEn:'Trainers, learning centers, schools, and organizations',offerAr:'تحويل موضوع معروف إلى عرض أو ورقة عمل أو فيديو تعليمي',offerEn:'Turn a familiar subject into a presentation, worksheet, or learning video',testAr:'صمم درسًا قصيرًا واختبر فهمه مع متعلمين من الفئة المستهدفة',testEn:'Design a short lesson and test comprehension with learners from the target group',assets:['computer','phone'],access:['schools','businesses'],cities:['large','small','rural'],medium:['digital','visual','people'],models:['freelance','micro','company','hybrid'],capital:0,hours:2},
    {id:'tutoring',sector:'education',titleAr:'دروس أو تدريب فردي في مجال تتقنه',titleEn:'One-to-one tutoring or training in a subject you know',customerAr:'متعلمين يحتاجون دعمًا في مجال لديك فيه كفاءة مثبتة',customerEn:'Learners needing support in a subject where you have demonstrated competence',offerAr:'جلسة تجريبية ذات هدف واضح وقياس فهم قبلها وبعدها',offerEn:'A trial session with a clear objective and a simple before/after understanding check',testAr:'قدّم جلسة تجريبية واحدة ضمن مجال خبرتك، واطلب تقييمًا من المتعلم',testEn:'Offer one trial session within your area of competence and ask the learner for feedback',assets:['phone','computer','workspace'],access:['schools'],cities:['large','small','rural'],medium:['people','digital'],models:['freelance','micro','hybrid'],capital:0,hours:2},
    {id:'health_admin',sector:'health',titleAr:'تنظيم إداري ومحتوى توعوي بمراجعة مختص',titleEn:'Healthcare administration and expert-reviewed information content',customerAr:'عيادات ومراكز ومؤسسات صحية مرخصة',customerEn:'Licensed clinics, centers, and healthcare organizations',offerAr:'تنظيم مواعيد أو ملفات إدارية أو تصميم مواد معلوماتية يراجعها مختص مرخص',offerEn:'Organize appointments or administrative records, or design information materials reviewed by a licensed professional',testAr:'تحدث مع مؤسسة مرخصة عن احتياج إداري. لا تقدم تشخيصًا أو علاجًا أو نصيحة طبية مستقلة',testEn:'Ask a licensed organization about an administrative need. Do not provide independent diagnosis, treatment, or medical advice',assets:['computer','phone','network'],access:['health'],cities:['large','small'],medium:['people','systems'],models:['employee','freelance','micro','hybrid'],capital:0,hours:2},
    {id:'clinic_workflow',sector:'health',titleAr:'تنظيم المواعيد وتجربة المراجعين للعيادات',titleEn:'Appointment and patient-experience coordination for clinics',customerAr:'عيادات ومراكز طبية مرخصة',customerEn:'Licensed clinics and medical centers',offerAr:'تحسين تذكير المواعيد وتدفق الاستقبال والمتابعة الإدارية دون تدخل سريري',offerEn:'Improve appointment reminders, reception flow, and administrative follow-up without clinical work',testAr:'اسأل عيادة عن أكثر نقطة إدارية تسبب تأخيرًا، وصمم مخطط سير عمل تجريبيًا دون الاطلاع على بيانات مرضى حقيقية',testEn:'Ask a clinic about one administrative bottleneck and draft a workflow prototype without accessing real patient data',assets:['computer','phone'],access:['health'],cities:['large','small'],medium:['people','systems'],models:['employee','freelance','micro','hybrid'],capital:0,hours:2},
    {id:'health_content',sector:'health',titleAr:'إنتاج مواد تثقيف صحي بمراجعة مختص مرخص',titleEn:'Patient education content production reviewed by licensed professionals',customerAr:'عيادات ومراكز صحية وأطباء مرخصون',customerEn:'Clinics, healthcare centers, and licensed clinicians',offerAr:'تحويل معلومات يعتمدها المختص إلى منشورات أو فيديوهات أو أدلة مبسطة',offerEn:'Turn clinician-approved information into posts, videos, or plain-language guides',testAr:'أنتج نموذجًا بصريًا لمعلومة عامة بعد مراجعتها من مختص، ولا تقدم تشخيصًا أو توصية علاجية بنفسك',testEn:'Create a visual sample of general information after expert review; do not provide diagnosis or treatment recommendations yourself',assets:['computer','phone'],access:['health','businesses'],cities:['large','small','tourist'],medium:['visual','digital','people'],models:['freelance','micro','hybrid'],capital:0,hours:3},
    {id:'cad_support',sector:'engineering',titleAr:'رسومات ونمذجة CAD ضمن نطاق التأهيل',titleEn:'CAD drafting and modeling within qualified scope',customerAr:'مكاتب هندسية وورش ومصنعون',customerEn:'Engineering offices, workshops, and manufacturers',offerAr:'رسومات أو نماذج أولية أو توثيق فني تحت مراجعة مختص عند الحاجة',offerEn:'Drawings, prototypes, or technical documentation reviewed by a qualified professional where needed',testAr:'أنشئ نموذجًا تدريبيًا لقطعة غير حساسة واطلب مراجعة مهندس مؤهل. لا توقع أو تعتمد تصميمًا رسميًا',testEn:'Create a training model of a non-critical part and ask a qualified engineer to review it. Do not sign off or certify regulated designs',assets:['computer','tools'],access:['workshops','factories'],cities:['industrial','large'],medium:['digital','physical'],models:['freelance','employee','micro','hybrid'],capital:1,hours:3},
    {id:'maintenance_coord',sector:'engineering',titleAr:'تنسيق خدمات صيانة مع فنيين مؤهلين',titleEn:'Maintenance coordination with qualified technicians',customerAr:'عقارات ومتاجر ومكاتب تحتاج إدارة طلبات الصيانة',customerEn:'Properties, shops, and offices coordinating maintenance requests',offerAr:'استقبال الطلبات وجدولتها وربط العميل بفني مؤهل ومتابعة الإغلاق',offerEn:'Receive and schedule requests, connect clients with qualified technicians, and track completion',testAr:'تحدث مع مالك عقار أو متجر عن تأخر الصيانة، واختبر نموذج متابعة دون تنفيذ أعمال فنية بنفسك',testEn:'Ask a property or shop owner about maintenance delays and test a tracking workflow without performing technical work yourself',assets:['phone','network'],access:['workshops','businesses'],cities:['large','industrial','small'],medium:['people','systems'],models:['freelance','micro','company','hybrid'],capital:0,hours:2},
    {id:'food_preorder',sector:'hospitality',titleAr:'منتج غذائي متخصص بالطلب المسبق',titleEn:'Specialty food product by pre-order',customerAr:'مجموعة صغيرة من العملاء في نطاق يمكن خدمته',customerEn:'A small customer group within a deliverable service radius',offerAr:'اختبار وصفة أو منتج واحد بكميات صغيرة وبنظام طلب مسبق',offerEn:'Test one recipe or product in small batches using pre-orders',testAr:'اختبر اهتمام العملاء باستبيان وطلبات مبدئية، وتحقق أولًا من قواعد سلامة الغذاء والتراخيص المحلية قبل الإنتاج أو البيع',testEn:'Test interest through a survey and preliminary orders; first verify local food-safety rules and permits before producing or selling',assets:['workspace','tools','storage'],access:['suppliers','businesses'],cities:['large','tourist','small','rural'],medium:['living','physical'],models:['micro','company','hybrid'],capital:1,hours:3},
    {id:'menu_costing',sector:'hospitality',titleAr:'توحيد الوصفات وحساب تكلفة الأطباق للمطاعم',titleEn:'Recipe standardization and menu-costing support for restaurants',customerAr:'مطاعم ومقاهٍ ومطابخ إنتاج صغيرة',customerEn:'Restaurants, cafes, and small production kitchens',offerAr:'توثيق وصفة واحدة، أحجام الحصص، تكلفة المكونات، وخطوات التحضير',offerEn:'Document one recipe, portion sizes, ingredient costs, and preparation steps',testAr:'اختر وصفة تعرفها، احسب تكلفتها بمكونات وأسعار موثقة، ثم اطلب من مطعم مراجعة نموذجك. لا تقدم اعتمادًا صحيًا أو محاسبيًا رسميًا',testEn:'Cost a recipe using documented ingredient prices, then ask a restaurant to review the sample. Do not claim formal food-safety or accounting certification',assets:['computer','phone'],access:['businesses','suppliers'],cities:['large','tourist','small'],medium:['numbers','systems','living'],models:['employee','freelance','micro','hybrid'],capital:0,hours:3},
    {id:'food_event_service',sector:'hospitality',titleAr:'تجهيز ضيافة غذائية محدودة للفعاليات بالطلب المسبق',titleEn:'Small pre-ordered food service for local events',customerAr:'منظمو فعاليات ومكاتب ومجموعات صغيرة',customerEn:'Event organizers, offices, and small groups',offerAr:'قائمة محدودة وعدد طلبات معروف مسبقًا مع تسليم منظم',offerEn:'A limited menu and pre-confirmed order count with organized delivery',testAr:'اختبر طلبًا تجريبيًا صغيرًا مع جهة واحدة، واحسب الوقت والهدر والتكلفة، وتحقق من اشتراطات سلامة الغذاء قبل البيع',testEn:'Test one small order with one organization, track time, waste, and costs, and verify food-safety requirements before selling',assets:['phone','workspace','storage'],access:['businesses','suppliers'],cities:['large','tourist','small'],medium:['living','physical','people'],models:['micro','company','hybrid'],capital:2,hours:5},
    {id:'farm_pack',sector:'agriculture',titleAr:'فرز وتعبئة وربط المنتج الزراعي بالمشتري',titleEn:'Agricultural sorting, packing, and buyer coordination',customerAr:'مزارعون وتجار ومطاعم ومتاجر غذائية',customerEn:'Growers, traders, restaurants, and food retailers',offerAr:'تجربة تنظيم مواصفات العبوة والفرز والطلب والتسليم مع منتج واحد',offerEn:'Test packaging specifications, sorting, orders, and delivery for one product',testAr:'ارسم سلسلة منتج واحد من المزرعة إلى المشتري واسأل طرفين عن الهدر أو التأخير. لا تشترِ محصولًا قبل اختبار الاتفاق',testEn:'Map one product from farm to buyer and ask two parties about waste or delays. Do not purchase stock before testing an agreement',assets:['vehicle','storage','land','phone'],access:['farms','suppliers','businesses'],cities:['rural','industrial','large'],medium:['living','physical','systems'],models:['micro','company','hybrid'],capital:1,hours:3}
  ];

  function getOpportunityIdeas(career, workModels, profile) {
    const trace = getTraceSummary();
    const bestModels = workModels.slice(0,2).map(m=>m.id);
    const assets = new Set(profile.tools||[]), access = new Set(profile.access||[]);
    const budgetRank = ({'0':0,low:1,medium:2,high:3})[profile.budget] ?? 0;
    const hours = Number(profile.hours||5);
    const items = PROJECT_IDEAS.map(idea => {
      const sectorFit = idea.sector === career.sector ? 100 : (idea.sector === profile.field ? 72 : 35);
      const experienceBoost = Number(profile.experience||0) > 0 && idea.sector === profile.field ? 8 : 0;
      const assetFit = idea.assets.length ? idea.assets.filter(x=>assets.has(x)).length/idea.assets.length*100 : 60;
      const accessFit = idea.access.length ? Math.max(idea.access.filter(x=>access.has(x)).length/idea.access.length*100, access.size===0?45:0) : 60;
      const cityFit = profile.cityType==='unknown' ? 55 : idea.cities.includes(profile.cityType) ? 100 : 35;
      const budgetFit = idea.capital <= budgetRank ? 100 : Math.max(20,100-(idea.capital-budgetRank)*35);
      const timeFit = hours >= idea.hours ? 100 : Math.max(20,100-(idea.hours-hours)*14);
      const modelFit = idea.models.some(m=>bestModels.includes(m)) ? 100 : 45;
      const mediumFit = idea.medium.includes(trace.topMedium) ? 100 : 50;
      const adjustedSectorFit = Math.min(100,sectorFit+experienceBoost);
      const score = Math.round(adjustedSectorFit*.30 + assetFit*.15 + accessFit*.15 + cityFit*.10 + budgetFit*.10 + timeFit*.08 + modelFit*.07 + mediumFit*.05);
      return {...idea,score,components:{sectorFit,assetFit,accessFit,cityFit,budgetFit,timeFit,modelFit,mediumFit}};
    }).sort((a,b)=>b.score-a.score);
    return items.slice(0,3);
  }

  function composeIdentity(career, model) {
    const id = career.id;
    if (id === 'creative_company') {
      if (model.id === 'company') return t('مؤسس شركة إنتاج إبداعي', 'Creative production-company founder');
      if (model.id === 'micro') return t('صاحب استوديو إنتاج إبداعي صغير', 'Owner of a small creative production studio');
      if (model.id === 'hybrid') return t('منتج إبداعي بمسار عمل هجين', 'Creative producer on a hybrid work path');
    }
    if (model.id==='company') {
      if (id === 'ceo') return t('مؤسس / مدير شركة', 'Company founder / executive');
      if (id === 'chef') return t('مؤسس نشاط متخصص في المنتجات والخدمات الغذائية', 'Founder of a specialty food business');
      if (['director','camera','editor','graphic','sound'].includes(id)) return t('مؤسس شركة في مجال الإنتاج المرئي: '+career.ar, 'Founder in visual production: '+career.en);
      if (career.sector === 'business') return t('مؤسس شركة خدمات أعمال متخصصة: '+career.ar, 'Founder of a specialist business-services firm: '+career.en);
      if (career.sector === 'tech') return t('مؤسس شركة تقنية متخصصة: '+career.ar, 'Founder of a specialist technology company: '+career.en);
      if (career.sector === 'engineering') return t('مؤسس شركة خدمات هندسية: '+career.ar, 'Founder of an engineering-services firm: '+career.en);
      if (career.sector === 'hospitality') return t('مؤسس نشاط غذائي أو للضيافة: '+career.ar, 'Founder of a food or hospitality business: '+career.en);
      if (career.sector === 'education') return t('مؤسس مشروع تعليمي: '+career.ar, 'Founder of an educational venture: '+career.en);
      if (career.sector === 'agriculture') return t('مؤسس نشاط زراعي: '+career.ar, 'Founder of an agricultural venture: '+career.en);
      return t('مؤسس شركة في مجال '+career.ar, 'Founder in '+career.en);
    }
    if (model.id==='freelance') return t('مستقل متخصص: '+career.ar, 'Independent specialist: '+career.en);
    if (model.id==='micro') {
      if (id === 'ceo') return t('صاحب نشاط تجاري صغير', 'Small-business owner');
      if (id === 'chef') return t('صاحب مشروع غذائي صغير', 'Small food-business owner');
      return t('صاحب نشاط متخصص في: '+career.ar, 'Small-business owner in: '+career.en);
    }
    if (model.id==='employee') return career.ar || career.en;
    if (model.id==='hybrid') return t('متخصص في '+career.ar+' بمسار هجين', 'Hybrid path in '+career.en);
    return career.ar || career.en;
  }


  function getFieldMessage(career,p) {
    const related = career.sector === p.field ||
      (career.id === 'creative_company' && p.field === 'business') ||
      (career.sector === 'arts' && p.field === 'tech') ||
      (career.sector === 'tech' && p.field === 'science');
    const experience = Number(p.experience || 0);
    const hours = Number(p.hours || 0);
    const locationText = p.location ? `${tr('locationPrefix')} ${esc(p.location)}.` : '';
    const toolNames = {
      phone:t('الموبايل','phone'), computer:t('الكمبيوتر','computer'), camera:t('الكاميرا أو الميكروفون','camera or microphone'),
      tools:t('الأدوات العملية','practical tools'), workspace:t('مكان العمل أو التدريب','workspace'), network:t('العلاقات المهنية','professional network'), vehicle:t('وسيلة انتقال أو نقل','transport vehicle'), storage:t('مخزن أو مساحة تخزين','storage space'), land:t('أرض أو سطح أو مساحة خارجية','land or outdoor space')
    };

    // The same interest match is kept separate from feasibility. Context changes the actual first-step plan.
    let trial = t(career.testAr,career.testEn);
    if (p.tools.includes('network')) {
      trial = t('استفد من علاقاتك: اطلب مقابلة قصيرة مع شخص يعمل في المجال، واطلب منه مراجعة نموذج أولي أو السماح لك بملاحظة جزء من يوم العمل.','Use your network: request a short interview with someone in the field and ask them to review a sample or let you observe part of a workday.');
    } else if (p.tools.includes('camera') && ['director','creative_company','editor','graphic'].includes(career.id)) {
      trial = t('لديك كاميرا أو ميكروفون؛ نفّذ عينة مصوّرة قصيرة مرتبطة بالمهنة، ثم راجعها من حيث الفكرة والتنفيذ لا من حيث المعدات وحدها.','You have a camera or microphone. Produce a short filmed sample related to this career, then review its concept and execution—not just the equipment.');
    } else if (p.tools.includes('computer') && ['software','data','accountant','graphic','editor','creative_company'].includes(career.id)) {
      trial = t('وجود كمبيوتر أو لابتوب يتيح لك تنفيذ نموذج عملي بنفسك؛ أنجز عينة صغيرة قابلة للمراجعة بدل الاكتفاء بجمع الدورات.','Your computer or laptop lets you make a practical sample. Produce a small piece of work that can be reviewed instead of only collecting courses.');
    } else if (p.tools.includes('tools') && ['mechanical','architect','chef'].includes(career.id)) {
      trial = t('لديك أدوات عملية؛ نفّذ تجربة آمنة ومحدودة مرتبطة بالمهنة، واستعن بإشراف متخصص عند وجود معدات أو مخاطر.','You have practical tools. Run a safe, limited trial related to the career, and seek supervision for specialist equipment or risks.');
    } else if (p.tools.includes('workspace')) {
      trial = t('لديك مكان مخصص؛ حوّله إلى مساحة تجربة ثابتة. نفّذ نموذجًا واحدًا في جلستين، وسجّل ما استمتعت به وما استنزفك.','You have a dedicated space. Turn it into a consistent trial area: complete one sample over two sessions and record what energized and drained you.');
    } else if (p.tools.includes('phone')) {
      trial = t('ابدأ بالموبايل: وثّق تجربة قصيرة أو سجّل ملاحظاتك ونتائجك، ثم اعرضها على شخص لديه خبرة في المجال.','Start with your phone: document a short trial or record your observations and results, then show them to someone experienced in the field.');
    }

    let education;
    const postSecondary = ['diploma','bachelor','postgrad','professional'].includes(p.education);
    if (career.formal && postSecondary && related) education = tr('educationFormalReady');
    else if (career.formal) education = tr('educationEarly');
    else education = tr('educationOpen');

    const field = related ? tr('matchedField') : tr('differentField');
    let exp;
    if (experience >= 6) exp = t('لديك أكثر من خمس سنوات خبرة مسجلة؛ اختبر المسار عبر مهمة متقدمة، وحوّل خبرتك القابلة للنقل إلى أمثلة أو ملف أعمال.','You reported over five years of experience. Test this path with an advanced task and translate transferable experience into concrete examples or a portfolio.');
    else if (experience >= 3) exp = t('لديك خبرة من سنتين إلى خمس؛ ابدأ بمهمة متوسطة الصعوبة تربط خبرتك الحالية بطبيعة هذا العمل.','You reported two to five years of experience. Start with an intermediate task that connects your experience to this work.');
    else if (experience >= 1) exp = t('لديك خبرة محدودة؛ اختر مهمة تأسيسية واحدة، ثم قارنها بما تعلمته في عملك السابق.','You reported some early experience. Choose one foundational task and compare it with what you learned in previous work.');
    else exp = tr('experienceNone');

    let time;
    if (hours <= 2) time = tr('timeVeryLow');
    else if (hours <= 5) time = tr('timeLow');
    else if (hours <= 9) time = tr('timeMedium');
    else time = tr('timeHigh');

    let budget;
    if (p.budget === '0') budget = tr('budgetFree');
    else if (p.budget === 'low') budget = tr('budgetLow');
    else if (p.budget === 'medium') budget = tr('budgetMedium');
    else budget = tr('budgetHigh');

    const tools = p.tools.length
      ? t('الموارد التي ذكرتها: ','Resources you listed: ') + p.tools.map(k => toolNames[k]).join(t('، ','; ')) + '.'
      : tr('noTools');
    if (p.budget === '0' || p.budget === 'low') {
      trial += t(' ابدأ بنسخة مجانية أو بخامات مستعملة/مستعارة، ولا تشترِ معدات قبل اختبار المهمة.',' Start with a free version or borrowed/used materials; do not buy equipment before testing the task.');
    }
    if (hours <= 5) {
      trial += t(' نفّذها في جلسة أو جلستين قصيرتين بما يتناسب مع وقتك المتاح.',' Keep it to one or two short sessions to fit your available time.');
    }
    const locationLine = locationText
      ? `<p>${locationText} ${esc(t('استخدمه للبحث عن جهة تدريب أو شخص يعمل في المجال قريب منك. لم نتحقق من وجود فرص أو تراخيص متاحة في هذا المكان.','Use it to look for a nearby training provider or practitioner. No local vacancies or licensing rules have been verified for this location.'))}</p>`
      : '';

    return { field, exp, education, time, budget, tools, trial, locationLine };
  }

  function renderResults() {
    const scores = getScores();
    const matched = CAREERS.map(c => careerMatch(c,scores)).sort((a,b) => b.similarity - a.similarity);
    // The RIASEC occupational profile leads. Behavioral traces and engagement only
    // arbitrate close matches; they are not presented as validated psychometric scales.
    const topSimilarity = matched[0].similarity;
    const leadGap = matched.length > 1 ? topSimilarity - matched[1].similarity : 100;
    const matchCaution = leadGap <= 3
      ? t('هناك أكثر من مهنة متقاربة في نمط الاهتمام؛ استخدم هذا اللقب كبداية، وقارن المهام اليومية والتجربة العملية قبل الحسم.','Several occupations have a similar interest pattern. Treat this title as a starting point and compare the real tasks and practical trial before deciding.')
      : '';
    const nearTies = matched.filter(c => topSimilarity - c.similarity <= 8)
      .sort((a,b) => b.traceFit - a.traceFit || b.flowSignal - a.flowSignal || b.similarity - a.similarity);
    const best = nearTies[0] || matched[0];
    const ranked = [best, ...matched.filter(c => c.id !== best.id)];
    const p = state.profile;
    const route = getFieldMessage(best,p);
    const topDims = getTopDimensions(scores);
    const modelResults = getWorkModelResults(best.id);
    const primaryModel = modelResults[0];
    const ideas = getOpportunityIdeas(best,modelResults,p);
    const traceSummary = getTraceSummary();
    const careerMeta = (window.EBDA_CAREER_MAP || {})[best.id] || {};
    const who = p.name ? `${esc(p.name)}، ` : '';
    const identity = composeIdentity(best,primaryModel);
    const dimCards = topDims.map(d => {
      const pct = Math.round(((scores[d] - 1) / 4) * 100);
      const meta = DIMENSIONS[d];
      return `<div class="bar-row"><span>${esc(t(meta.shortAr,meta.shortEn))}</span><div class="bar-track"><span style="width:${pct}%"></span></div><span class="bar-value">${pct}</span></div>`;
    }).join('');
    const evidenceDims = topDims.filter(d => Math.abs(scores[topDims[0]] - scores[d]) < 1e-9);
    const topWhy = evidenceDims.map(d => `<div class="evidence-card"><strong>${esc(t(DIMENSIONS[d].ar,DIMENSIONS[d].en))}</strong><p>${esc(t(DIMENSIONS[d].descAr,DIMENSIONS[d].descEn))}</p></div>`).join('');
    const alternatives = ranked.slice(1,3).map(c => `<div class="alternative"><strong>${esc(t(c.ar,c.en))}</strong><p>${t('مؤشر تقارب ترتيب الاهتمامات: ','Interest-rank alignment: ')}<b class="ltr">${c.similarity}/100</b></p><p>${t('تقاطع الإشارات السلوكية: ','Behavioral clue overlap: ')}<b class="ltr">${c.traceFit}/100</b></p></div>`).join('');
    const flowLevel = best.flowSignal >= 70 ? tr('high') : best.flowSignal >= 40 ? tr('medium') : tr('low');
    const modelCards = modelResults.slice(0,3).map((m,i)=>`<div class="model-card"><div class="model-card-head"><strong>${esc(t(m.ar,m.en))}</strong><span class="mini-score ltr">${m.score}/100</span></div><p>${esc(t(m.descAr,m.descEn))}</p><p class="fine-print">${esc(t('ميلك لهذا النموذج','Preference'))}: <b class="ltr">${m.preferenceScore}/100</b> · ${esc(t('قابلية البدء بمواردك الحالية','Current readiness'))}: <b class="ltr">${m.readinessScore}/100</b></p>${i===0?`<span class="result-tag">${esc(t('الأقرب لإجاباتك','Closest to your answers'))}</span>`:''}</div>`).join('');
    const taskList = (careerMeta.tasksAr || []).map((a,i)=>`<li>${esc(t(a,(careerMeta.tasksEn||[])[i]||a))}</li>`).join('');
    const ideaCards = ideas.map((idea,i)=>`<article class="idea-card"><div class="idea-head"><span class="idea-index">${i+1}</span><strong>${esc(t(idea.titleAr,idea.titleEn))}</strong><span class="mini-score ltr">${idea.score}/100</span></div><p><b>${esc(t('العميل المحتمل','Potential customer'))}:</b> ${esc(t(idea.customerAr,idea.customerEn))}</p><p><b>${esc(t('العرض','Offer'))}:</b> ${esc(t(idea.offerAr,idea.offerEn))}</p><div class="idea-test"><b>${esc(t('اختبار الفكرة قبل الإنفاق','Test before spending'))}:</b> ${esc(t(idea.testAr,idea.testEn))}</div><p class="fine-print">${esc(t('احتياج البداية: '+(idea.capital===0?'خدمة أو نموذج أولي بموارد أساسية':'بعض التجهيزات أو المواد')+' · الوقت المقترح أسبوعيًا: '+idea.hours+' ساعات أو أكثر','Starting needs: '+(idea.capital===0?'a service or prototype using basic resources':'some equipment or materials')+' · Suggested weekly time: '+idea.hours+' hours or more'))}</p><p class="fine-print">${esc(t('درجة مواءمة أولية مع بياناتك وليست قياسًا للطلب أو الربحية.','Initial fit with your inputs; not a measure of demand or profitability.'))}</p></article>`).join('');
    const cityName = p.location ? esc(p.location) : t('لم تحدد مكانًا','No location specified');
    const mediumNames = {visual:t('الصورة والصوت','visual/audio'),physical:t('الأدوات والخامات','tools/materials'),digital:t('الوسيط الرقمي','digital'),people:t('الأشخاص والعلاقات','people/relationships'),numbers:t('الأرقام والبيانات','numbers/data'),systems:t('الأنظمة والإجراءات','systems/processes'),living:t('المواد الحية والغذاء','living materials/food')};
    const eduValue = p.education;
    const eduAr = ({none:'بداية تعليمية من دون مؤهل بعد الإعدادية',secondary:'مؤهل ثانوي',diploma:'دبلوم أو معهد',bachelor:'بكالوريوس أو ليسانس',postgrad:'دراسات عليا',professional:'تدريب أو شهادات مهنية'})[eduValue] || 'غير محدد';
    const eduEn = ({none:'No formal qualification beyond middle school',secondary:'Secondary education',diploma:'Diploma or institute',bachelor:'Bachelor’s degree',postgrad:'Postgraduate education',professional:'Professional training or certificates'})[eduValue] || 'Not specified';
    const fieldName = COPY[lang].fieldNames[p.field] || COPY[lang].fieldNames.none;
    const expTxt = Number(p.experience) === 0 ? t('لا توجد خبرة عملية سابقة مسجلة','No previous work experience recorded') : t('خبرة عملية سابقة: '+p.experience+' سنوات أو أكثر','Previous work experience: '+p.experience+' years or more');
    const metaNote = careerMeta.noteAr ? `<p class="fine-print">${esc(t(careerMeta.noteAr,careerMeta.noteEn))}</p>` : '';
    const cityTypeName = ({large:t('مدينة كبيرة','Large city'),industrial:t('منطقة صناعية أو ميناء','Industrial area or port'),tourist:t('مدينة سياحية أو ساحلية','Tourist or coastal city'),rural:t('قرية أو منطقة زراعية','Rural or agricultural area'),small:t('مدينة صغيرة أو ضاحية','Small city or suburb'),unknown:t('غير محدد','Not specified')})[p.cityType] || '';
    const runwayName = ({none:t('لا أستطيع تحمل دخل متغير حاليًا','Cannot manage irregular income currently'),short:t('أقل من ثلاثة أشهر','Under three months'),medium:t('ثلاثة إلى ستة أشهر','Three to six months'),long:t('أكثر من ستة أشهر','Over six months'),unknown:t('لم تحدد','Not specified')})[p.runway] || '';
    const workModeNote = primaryModel.id==='employee' ? t('المؤشرات الحالية تميل إلى تثبيت الخبرة والدخل أولًا. يمكن اختبار فكرة جانبية صغيرة دون ترك العمل أو تحمل التزامات كبيرة.','Your current answers lean toward building experience and income stability first. A small side experiment can be tested without leaving work or taking on major commitments.') : primaryModel.id==='hybrid' ? t('قد يناسبك الاحتفاظ بمصدر دخل قائم أثناء اختبار النشاط المستقل تدريجيًا.','A hybrid route may suit you: keep an existing income source while testing independent work gradually.') : t('النتيجة تشير إلى تقارب مع نموذج مستقل، لكن لا تبدأ بالتزامات ثابتة قبل اختبار وجود عميل مستعد للدفع.','Your answers align with an independent model, but avoid fixed commitments until you test whether a customer is willing to pay.');
    $('result-mount').innerHTML = `
      <div class="result-top">
        <div><span class="result-tag">${esc(t('هويتك المهنية ونموذج عملك المحتمل','Your possible professional identity and work model'))}</span><h1 class="result-name">${who}${esc(identity)}</h1><p class="result-intro">${esc(t(best.workAr,best.workEn))}</p>${matchCaution?`<p class="fine-print" style="margin-top:8px">${esc(matchCaution)}</p>`:''}</div>
        <div class="score-chip"><strong>${best.similarity}<small style="font-size:.8rem">/100</small></strong><span>${esc(t('مؤشر ترتيب الاهتمامات','Interest-rank alignment index'))}</span></div>
      </div>
      <div class="result-section"><h3>${esc(t('لماذا ظهرت هذه الهوية؟','Why this identity appeared'))}</h3><div class="evidence">${topWhy}</div><p class="fine-print" style="margin-top:10px">${esc(t('الدرجة تقارن ترتيب اهتماماتك بالرمز المهني المرجعي؛ لا تعني احتمال النجاح أو أنك محصور في هذا العمل.','This score compares your interest ranking with the occupational reference code; it is not a probability of success or a limit on what you can do.'))}</p></div>
      <div class="result-section"><h3>${esc(t('المهام الحقيقية داخل المهنة','Actual tasks in this occupation'))}</h3><ul class="task-list">${taskList}</ul><div class="friction-box"><b>${esc(t('الجزء الذي قد يكون مرهقًا','Potentially demanding parts'))}:</b> ${esc(t(careerMeta.frictionAr||'',careerMeta.frictionEn||''))}</div><p class="fine-print">${careerMeta.sourceType === 'composite' ? esc(t('الملف المركب الداخلي: ','Internal composite profile: ')) + '<b class="ltr">' + esc(best.interestCode) + '*</b>' : t('المرجع المهني: ','Occupational reference: ') + '<a href="' + esc(careerMeta.source||'#') + '" target="_blank" rel="noopener">' + esc(best.onet) + '</a> · ' + t('رمز الاهتمامات: ','Interest code: ') + '<b class="ltr">' + esc(best.interestCode) + '</b>'}</p>${metaNote}</div>
      <div class="result-section"><h3>${esc(t('بصمة الاهتمامات والاندماج','Interest and engagement profile'))}</h3><div class="bars">${dimCards}</div><p class="fine-print">${esc(tr('flowLabel'))}: <b class="ltr">${best.flowSignal}/100</b> (${esc(flowLevel)}). ${t('إشارة اندماج استكشافية منفصلة.','A separate exploratory engagement clue.')}</p><p class="fine-print">${esc(t('تقاطع الاختيارات السلوكية مع رمز المهنة','Behavioral clues overlapping the occupational code'))}: <b class="ltr">${best.traceFit}/100</b>. ${esc(t('تُستخدم هذه الإشارات لمراجعة التقارب، وليست اختبارًا نفسيًا مقننًا.','These clues help cross-check the match; they are not a validated psychometric test.'))}</p><p class="fine-print">${esc(t('الوسيط الأكثر تكرارًا في اختياراتك: ','Most frequent medium in your choices: '))}<b>${esc(mediumNames[traceSummary.topMedium])}</b></p></div>
      <div class="result-section"><h3>${esc(t('شكل العمل الأقرب لطريقتك','Work model closest to your preferences'))}</h3><div class="model-grid">${modelCards}</div><div class="path-card"><strong>${esc(t('كيف تقرأ هذا الترشيح؟','How to interpret this suggestion'))}</strong><p>${esc(workModeNote)}</p></div></div>
      <div class="result-section"><h3>${esc(t('مشروعات تستحق الاختبار وفق اهتماماتك ومواردك','Business experiments matched to your interests and resources'))}</h3><p class="fine-print">${esc(t('الاقتراحات التالية فرضيات أولية وليست فرصًا سوقية مثبتة. ترتيبها يتغير وفق مجالك ووسيطك وأدواتك وإمكانية وصولك والوقت والميزانية ونموذج العمل.','The following are initial hypotheses, not proven market opportunities. Their order changes with your field, preferred medium, assets, access, time, budget, and work model.'))}</p><div class="idea-grid">${ideaCards}</div><div class="path-card"><strong>${esc(t('قبل أن تنفق','Before spending'))}</strong><p>${esc(t('ابدأ بمقابلات قصيرة مع عملاء محتملين، ثم جرّب نموذجًا صغيرًا أو طلبًا مسبقًا مناسبًا لطبيعة النشاط. لا نستنتج وجود طلب محلي من اسم المدينة وحده.','Start with short interviews with potential customers, then test a small prototype or pre-order appropriate to the activity. A city name alone does not establish local demand.'))}</p><p class="fine-print">${esc(t('المكان المسجل: ','Recorded location: '))}${cityName} · ${esc(cityTypeName)}. ${esc(t('لم يتم التحقق من الأسعار أو المنافسين أو التراخيص المحلية آليًا.','Local prices, competitors, and licensing have not been verified automatically.'))}</p></div></div>
      <div class="result-section"><h3>${esc(t('كيف تؤثر ظروفك الحالية على أول خطوة؟','How your current circumstances shape the first step'))}</h3><div class="path-card"><strong>${esc(t('تجربة المهنة','Career trial'))}</strong><p>${esc(route.trial)}</p></div><div class="path-card"><strong>${esc(t('طريق التأهيل','Qualification route'))}</strong><p>${esc(t(best.formalAr,best.formalEn))}</p><p>${esc(route.education)}</p></div><div class="path-card"><strong>${esc(t('ظروفك ومواردك','Your context and resources'))}</strong><ul><li>${esc(route.field)}</li><li>${esc(route.exp)}</li><li>${esc(route.time)}</li><li>${esc(route.budget)}</li><li>${esc(route.tools)}</li><li>${esc(t('المؤهل: '+eduAr+' · المجال الحالي: '+fieldName+' · الخبرة: '+expTxt,'Education: '+eduEn+' · Current field: '+fieldName+' · Experience: '+expTxt))}</li><li>${esc(t('طبيعة المنطقة: '+cityTypeName+' · القدرة على تحمل دخل متغير: '+runwayName,'Area type: '+cityTypeName+' · Income runway: '+runwayName))}</li><li>${esc(t('إمكانية الوصول إلى موردين أو جهات محلية: '+(p.access.length?'تم تحديد '+p.access.length+' أنواع من الجهات':'لم تحدد جهات محلية'),'Local access: '+(p.access.length?p.access.length+' access categories selected':'No local access categories selected')))}</li></ul>${route.locationLine}</div></div>
      <div class="result-section"><h3>${esc(tr('altTitle'))}</h3><div class="alternatives">${alternatives}</div></div>
      <div class="result-section"><h3>${esc(tr('method'))}</h3><p class="fine-print">${esc(t('قُسم القياس إلى طبقتين: Human Fit للميل المهني، وOpportunity Fit لملاءمة نموذج العمل والتجارب مع الموارد. المهن تستخدم رموز الاهتمامات المنشورة في O*NET؛ نقارن ترتيب أبعادك الستة مع الحروف المرجعية بوزن تنازلي للحرف الأول ثم التالي. الأسئلة العربية هنا تكييف استكشافي غير مقنن محليًا، لذلك الدرجة ليست احتمال نجاح ولا تشخيصًا.','The model separates Human Fit (career interests) from Opportunity Fit (work-model and experiment feasibility). Occupations use O*NET interest codes; your six-dimension ranking is compared with the reference letters, giving greater weight to earlier letters. This Arabic adaptation has not been locally validated, so its score is neither a success probability nor a diagnosis.'))}</p><p class="fine-print">${esc(t('أوزان ملاءمة الفرص داخل المحرك قواعد ترتيب أولية للاختبار: المجال 30%، الأصول 15%، الوصول المحلي 15%، نوع المنطقة 10%، الميزانية 10%، الوقت 8%، نموذج العمل 7%، والوسيط 5%. هذه ليست أوزانًا بحثية مثبتة، ولا تتنبأ بالربحية أو الطلب.','Opportunity-fit weights are provisional ranking rules: sector 30%, assets 15%, local access 15%, area type 10%, budget 10%, time 8%, work model 7%, and medium 5%. These are not research-validated weights and do not predict profitability or demand.'))}</p><p class="fine-print">${esc(tr('sourceNote'))}</p></div>
      <p class="fine-print" style="margin-top:17px">${esc(tr('confidence'))}</p>
      <div class="actions result-actions"><button type="button" class="btn secondary" id="edit-answers">${esc(tr('edit'))}</button><button type="button" class="btn primary" id="print-result">${esc(t('اطبع النتيجة','Print result'))}</button></div>
    `;
    $('edit-answers').addEventListener('click',() => { currentPage = 1; renderPage(); });
    $('print-result').addEventListener('click',() => window.print());
    state.lastResult = { careerId:best.id, workModel:primaryModel.id, score:best.similarity, traceFit:best.traceFit, flowSignal:best.flowSignal, opportunityIds:ideas.map(x=>x.id), profileScores:scores, completedAt:new Date().toISOString() };
    save();
  }

  function requireAnswered(items, data, errorId) {
    const missing = items.filter(q => !data[q.id]);
    items.forEach(q => { const el = $('item-' + q.id); if (el) el.classList.toggle('missing',missing.some(m => m.id === q.id)); });
    if (missing.length) {
      $(errorId).textContent = tr(errorId === 'flow-validation' ? 'flowValidation' : errorId === 'trace-validation' ? 'traceValidation' : errorId === 'workstyle-validation' ? 'workValidation' : 'validation');
      $(errorId).hidden = false;
      const first = $('item-' + missing[0].id);
      if (first) first.scrollIntoView({behavior:'smooth',block:'center'});
      return false;
    }
    $(errorId).hidden = true;
    return true;
  }

  function go(page) { currentPage = page; renderPage(); }

  document.addEventListener('click', event => {
    const langBtn = event.target.closest('[data-lang]');
    if (langBtn) {
      lang = langBtn.dataset.lang === 'en' ? 'en' : 'ar';
      try { localStorage.setItem(LANG_KEY,lang); } catch (_) {}
      applyLanguage(); return;
    }
    const answerBtn = event.target.closest('[data-answer-id]');
    if (answerBtn) {
      const id = answerBtn.dataset.answerId, value = Number(answerBtn.dataset.answerValue);
      if (id.startsWith('f')) state.flow[id] = value; else if (id.startsWith('tr')) state.trace[id] = value; else if (id.startsWith('w_')) state.workstyle[id] = value; else state.answers[id] = value;
      answerBtn.closest('.question').classList.remove('missing');
      answerBtn.parentElement.querySelectorAll('button').forEach(b => { const chosen = b === answerBtn; b.classList.toggle('selected',chosen); b.setAttribute('aria-pressed',String(chosen)); });
      save(); return;
    }
    if (event.target.closest('#start-btn')) { go(1); return; }
    if (event.target.closest('#resume-btn')) {
      if (QUESTIONS.some(q => !state.answers[q.id])) go(1);
      else if (FLOW_ITEMS.some(q => !state.flow[q.id])) go(5);
      else if (TRACE_ITEMS.some(q => !state.trace[q.id])) go(6);
      else if (WORKSTYLE_ITEMS.some(q => !state.workstyle[q.id])) go(7);
      else go(8);
      return;
    }
    if (event.target.closest('#quiz-back')) { go(currentPage === 1 ? 0 : currentPage - 1); return; }
    if (event.target.closest('#quiz-next')) {
      const subset = DISPLAY_QUESTIONS.slice((currentPage - 1) * 6,currentPage * 6);
      if (requireAnswered(subset,state.answers,'quiz-validation')) go(currentPage === 4 ? 5 : currentPage + 1);
      return;
    }
    if (event.target.closest('#flow-back')) { go(4); return; }
    if (event.target.closest('#flow-next')) { if (requireAnswered(FLOW_ITEMS,state.flow,'flow-validation')) go(6); return; }
    if (event.target.closest('#trace-back')) { go(5); return; }
    if (event.target.closest('#trace-next')) { if (requireAnswered(TRACE_ITEMS,state.trace,'trace-validation')) go(7); return; }
    if (event.target.closest('#workstyle-back')) { go(6); return; }
    if (event.target.closest('#workstyle-next')) { if (requireAnswered(WORKSTYLE_ITEMS,state.workstyle,'workstyle-validation')) go(8); return; }
    if (event.target.closest('#profile-back')) { go(7); return; }
    if (event.target.closest('#show-results')) { readProfile(); save(); go(9); return; }
    if (event.target.closest('#reset-btn')) {
      const confirmText = t('هل تريد مسح كل الإجابات المحفوظة والبدء من جديد؟','Clear all saved answers and start over?');
      if (window.confirm(confirmText)) { state = structuredClone(DEFAULT_STATE); save(); go(0); }
    }
  });

  ['p-name','p-education','p-field','p-experience','p-hours','p-budget','p-location','p-city-type','p-runway'].forEach(id => {
    $(id).addEventListener('input',() => { readProfile(); save(); });
    $(id).addEventListener('change',() => { readProfile(); save(); });
  });
  document.querySelectorAll('input[name="tool"],input[name="access"]').forEach(el => el.addEventListener('change',() => { readProfile(); save(); }));

  // Expose a small read-only scoring API for QA and future integration.
  window.EbdaCareerEngine = Object.freeze({
    dimensions: ORDER.slice(),
    questionCount: QUESTIONS.length,
    flowQuestionCount: FLOW_ITEMS.length,
    traceQuestionCount: TRACE_ITEMS.length,
    workstyleQuestionCount: WORKSTYLE_ITEMS.length,
    workModels: () => getWorkModelResults(),
    careerCount: CAREERS.length,
    projectIdeaCount: PROJECT_IDEAS.length,
    score: () => {
      const scores = getScores();
      return CAREERS.map(c => careerMatch(c,scores)).sort((a,b) => b.similarity - a.similarity);
    }
  });

  const dimensionCountsValid = ORDER.every(d => QUESTIONS.filter(q => q.d === d).length === 4);
  const careerProfilesValid = CAREERS.every(c => c.profile.length === 6 && c.profile.every(v => Number.isFinite(v) && v >= 0 && v <= 7));
  if (!QUESTIONS.every(q => ORDER.includes(q.d)) || !dimensionCountsValid || !careerProfilesValid || QUESTIONS.length !== 24 || FLOW_ITEMS.length !== 6 || TRACE_ITEMS.length !== 6 || WORKSTYLE_ITEMS.length !== 6 || DISPLAY_QUESTIONS.length !== QUESTIONS.length || new Set(DISPLAY_QUESTION_IDS).size !== QUESTIONS.length || CAREERS.some(c => !((window.EBDA_CAREER_MAP||{})[c.id]||{}).interestCode)) {
    console.error('Assessment data integrity check failed.');
  }
  applyLanguage();
})();

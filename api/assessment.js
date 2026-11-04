'use strict';

/*
 * EBDA2 V5 server-side assessment endpoint.
 * Questions, answer keys, role profiles, scoring weights and project ranking
 * remain server-side. The browser receives only the current question page.
 * This is an exploratory product instrument, not a validated psychometric test.
 */
const crypto = require('node:crypto');

const SESSION_TTL_MS = 3 * 60 * 60 * 1000;
const TOKEN_HEADER = 'x-assessment-token';

function getSessionSecret() {
  const secret = process.env.ASSESSMENT_SECRET || '';
  return secret.length >= 32 ? secret : null;
}
function issueSessionToken() {
  const secret = getSessionSecret();
  if (!secret) return null;
  const now = Date.now();
  const payload = Buffer.from(JSON.stringify({v:1,iat:now,exp:now+SESSION_TTL_MS,nonce:crypto.randomBytes(18).toString('hex')})).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return {token:`${payload}.${signature}`,expiresAt:now+SESSION_TTL_MS};
}
function verifySessionToken(token) {
  const secret = getSessionSecret();
  if (!secret || typeof token !== 'string' || token.length > 2000) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const expected = crypto.createHmac('sha256', secret).update(parts[0]).digest();
  let supplied;
  try { supplied = Buffer.from(parts[1], 'base64url'); } catch (_) { return false; }
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return false;
  try {
    const claims = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    return claims.v === 1 && Number.isFinite(claims.exp) && claims.exp > Date.now() && claims.iat <= Date.now()+30000;
  } catch (_) { return false; }
}
function getRequestToken(req, body) {
  return req.headers[TOKEN_HEADER] || req.headers[TOKEN_HEADER.toUpperCase()] || body?.sessionToken || '';
}
function publicQuestionId(internalId) {
  const secret = getSessionSecret();
  if (!secret) return '';
  return 'q_' + crypto.createHmac('sha256', secret).update('question:' + internalId).digest('hex').slice(0,20);
}
function normalizeSubmittedAnswers(rawAnswers) {
  const normalized = {};
  const expected = [...QUESTIONS,...TRACE,...FLOW,...COGNITIVE,...WORKSTYLE];
  for (const q of expected) {
    const externalId = publicQuestionId(q.id);
    if (Object.prototype.hasOwnProperty.call(rawAnswers, externalId)) normalized[q.id] = rawAnswers[externalId];
  }
  return normalized;
}

const REFERENCES = {
  ria: {
    label: "John Holland's RIASEC Model",
    full: "Holland, J. L. (1997). Making Vocational Choices: A Theory of Vocational Personalities and Work Environments (3rd ed.). Psychological Assessment Resources.",
    institution: 'O*NET Interest Profiler — U.S. Department of Labor, Employment and Training Administration',
    tool: 'O*NET Interest Profiler Manual',
    url: 'https://www.onetcenter.org/reports/IP_Manual.html',
    note: 'صياغة السؤال أصلية للموقع ومستوحاة من إطار الاهتمامات المهنية. ليست بندًا منقولًا من O*NET Interest Profiler، ولا تعني أن وزارة العمل الأمريكية اعتمدت هذا السؤال.'
  },
  leisure: {
    label: 'Listening, Watching, and Reading: The Structure and Correlates of Entertainment Preferences',
    full: 'Rentfrow, P. J., Goldberg, L. R., & Zilca, R. (2011). Journal of Personality, 79(2), 223–258. DOI: 10.1111/j.1467-6494.2010.00662.x',
    institution: 'Journal of Personality; authors affiliated with University of Cambridge, Oregon Research Institute, and Signal Patterns',
    url: 'https://doi.org/10.1111/j.1467-6494.2010.00662.x',
    note: 'الدراسة تناولت تفضيلات الترفيه وارتباطاتها؛ لا تثبت أن نوع المحتوى الذي يشاهده الشخص يحدد مهنته. نستخدمها كمرجعية لأسئلة الاهتمام الترفيهي فقط.'
  },
  critical: {
    label: 'The Critical Incident Technique',
    full: 'Flanagan, J. C. (1954). The Critical Incident Technique. Psychological Bulletin, 51(4), 327–358. DOI: 10.1037/h0061470',
    institution: 'Psychological Bulletin — American Psychological Association',
    url: 'https://doi.org/10.1037/h0061470',
    note: 'استلهام منهجي لاستدعاء مواقف وسلوكيات محددة بدل الاكتفاء بوصف الشخص لنفسه. صياغة الموقع ليست مقابلة كفاءة مقننة.'
  },
  flow: {
    label: 'Work-Related Flow Inventory (WOLF)',
    full: 'Bakker, A. B. (2008). The Work-Related Flow Inventory: Construction and Initial Validation of the WOLF. Journal of Vocational Behavior, 72(3), 400–414. DOI: 10.1016/j.jvb.2007.11.007',
    institution: 'Journal of Vocational Behavior',
    url: 'https://doi.org/10.1016/j.jvb.2007.11.007',
    note: 'أسئلة الموقع أصلية ومستلهمة من مفهوم الاندماج في العمل، وليست بنود مقياس WOLF الرسمي ولا تنتج درجة WOLF مقننة.'
  },
  fit: {
    label: 'Person–Environment Fit Theory',
    full: 'Kristof-Brown, A. L., Zimmerman, R. D., & Johnson, E. C. (2005). Consequences of Individuals’ Fit at Work: A Meta-Analysis of Person–Job, Person–Organization, Person–Group, and Person–Supervisor Fit. Personnel Psychology, 58(2), 281–342.',
    institution: 'Personnel Psychology',
    url: 'https://doi.org/10.1111/j.1744-6570.2005.00672.x',
    note: 'إطار لفهم التوافق بين الفرد وبيئة العمل. الأسئلة هنا من تصميم الموقع وليست مقياسًا منشورًا أو مقننًا.'
  },
  eo: {
    label: 'Entrepreneurial Orientation Framework',
    full: 'Lumpkin, G. T., & Dess, G. G. (1996). Clarifying the Entrepreneurial Orientation Construct and Linking It to Performance. Academy of Management Review, 21(1), 135–172.',
    institution: 'Academy of Management Review',
    url: 'https://doi.org/10.2307/258632',
    note: 'إطار بحثي لدراسة توجهات النشاط الريادي على مستوى المنظمة، نستخدمه بحذر كمرجعية لصياغة مواقف عن المبادرة والاستقلال والتجريب، وليس كاختبار شخصية فردي.'
  },
  chc: {
    label: 'Cattell–Horn–Carroll (CHC) Theory of Cognitive Abilities',
    full: 'McGrew, K. S. (2009). CHC Theory and the Human Cognitive Abilities Project: Standing on the Shoulders of the Giants of Psychometric Intelligence Research. Intelligence, 37(1), 1–10. DOI: 10.1016/j.intell.2008.08.004',
    institution: 'Journal: Intelligence',
    url: 'https://doi.org/10.1016/j.intell.2008.08.004',
    note: 'إطار نظري واسع للقدرات المعرفية. تحديات الموقع قصيرة وأصلية، ولا تنتج درجة ذكاء عامة أو IQ ولا تقيس كل جوانب الإطار.'
  },
  crt: {
    label: 'Cognitive Reflection Test (CRT)',
    full: 'Frederick, S. (2005). Cognitive Reflection and Decision Making. Journal of Economic Perspectives, 19(4), 25–42. DOI: 10.1257/089533005775196732',
    institution: 'American Economic Association — Journal of Economic Perspectives',
    url: 'https://doi.org/10.1257/089533005775196732',
    note: 'الدراسة الأصلية تقدم اختبارًا محددًا للتأمل المعرفي. أسئلة الموقع ليست أسئلة CRT الأصلية ولا تنتج درجة CRT؛ الإحالة هنا للمفهوم العام فقط.'
  },
  spatial: {
    label: 'Mental Rotation of Three-Dimensional Objects',
    full: 'Shepard, R. N., & Metzler, J. (1971). Mental Rotation of Three-Dimensional Objects. Science, 171(3972), 701–703. DOI: 10.1126/science.171.3972.701',
    institution: 'Science — American Association for the Advancement of Science',
    url: 'https://doi.org/10.1126/science.171.3972.701',
    note: 'مرجع كلاسيكي للتصور والدوران المكاني. التحدي المعروض هنا من تأليف الموقع وليس شكلًا منقولًا من الدراسة.'
  },
  mechanic: {
    label: 'Mechanical Comprehension and Causal Reasoning',
    full: 'Bennett Mechanical Comprehension Test — reference to the established construct; this site does not reproduce its items.',
    institution: 'Pearson Assessments (publisher of the Bennett Mechanical Comprehension Test)',
    url: 'https://www.pearsonassessments.com/',
    note: 'مرجع للمجال العام للفهم الميكانيكي فقط. السؤال الحالي أصلي، وليس بندًا من اختبار Bennett، ولا يقدّر الكفاءة المهنية أو السلامة الفنية.'
  }
};

const QUESTIONS = [
  // 24 RIASEC activity-interest questions: four per dimension.
  {id:'r01',s:'ria',d:'R',q:'لو قدامك شيء محتاج يتعمل، أي نوع من التفاصيل ممكن يشدك أكثر؟',ref:'ria'},
  {id:'r02',s:'ria',d:'R',q:'في يوم متاح من غير التزامات، أي تجربة ممكن تختارها من نفسك؟',ref:'ria'},
  {id:'r03',s:'ria',d:'R',q:'لو شاركت في تجهيز مكان أو منتج، أي جزء تحب تمسكه بإيدك؟',ref:'ria'},
  {id:'r04',s:'ria',d:'R',q:'لما حاجة تتوقف عن العمل، إيه اللي ممكن يخليك تفضل متابع المشكلة؟',ref:'ria'},
  {id:'i01',s:'ria',d:'I',q:'لو سمعت تفسيرين مختلفين لنفس الموقف، إيه اللي غالبًا هتعمله؟',ref:'ria'},
  {id:'i02',s:'ria',d:'I',q:'أي نوع من التفاصيل ممكن يخليك تفتح أكثر من مصدر وتكمل بحث؟',ref:'ria'},
  {id:'i03',s:'ria',d:'I',q:'لما نتيجة تحصل بعكس المتوقع، إيه أول حاجة تشغلك؟',ref:'ria'},
  {id:'i04',s:'ria',d:'I',q:'لو قدامك مشكلة كبيرة، أي خطوة تحس إنها ممتعة بالنسبة لك؟',ref:'ria'},
  {id:'a01',s:'ria',d:'A',q:'لو عندك حرية تغيّر شكل شيء عادي، إيه اللي ممكن تستمتع به؟',ref:'ria'},
  {id:'a02',s:'ria',d:'A',q:'وأنت بتشوف مكان أو منتج لأول مرة، أي تفصيلة ممكن تفضل في بالك؟',ref:'ria'},
  {id:'a03',s:'ria',d:'A',q:'لو مطلوب منك توصل فكرة للناس، أي طريقة أقرب لك؟',ref:'ria'},
  {id:'a04',s:'ria',d:'A',q:'إيه اللي ممكن يخليك ترجع تعدّل في حاجة خلصتها بالفعل؟',ref:'ria'},
  {id:'s01',s:'ria',d:'S',q:'لو حد في مجموعة مش قادر يشارك، غالبًا هتتصرف إزاي؟',ref:'ria'},
  {id:'s02',s:'ria',d:'S',q:'أي نتيجة ممكن تحسسك إن وقتك كان له معنى؟',ref:'ria'},
  {id:'s03',s:'ria',d:'S',q:'لما حد يسألك عن حاجة مش فاهمها، أي جزء ممكن تستمتع به؟',ref:'ria'},
  {id:'s04',s:'ria',d:'S',q:'لو شخص محتاج مساعدة لفترة، إيه اللي يخليك تفضل متابع معاه؟',ref:'ria'},
  {id:'e01',s:'ria',d:'E',q:'لو عندك فكرة شايف إنها تستحق التجربة، إيه اللي ممكن تعمله؟',ref:'ria'},
  {id:'e02',s:'ria',d:'E',q:'في نشاط جماعي، أي مسؤولية ممكن تلاقي نفسك بتاخدها تلقائيًا؟',ref:'ria'},
  {id:'e03',s:'ria',d:'E',q:'لو ظهرت فرصة جديدة لكنها مش واضحة بالكامل، إيه اللي يجذبك؟',ref:'ria'},
  {id:'e04',s:'ria',d:'E',q:'أي موقف ممكن يديك إحساس بالإنجاز؟',ref:'ria'},
  {id:'c01',s:'ria',d:'C',q:'لما تكون قدامك معلومات أو حاجات كتير متداخلة، إيه اللي تميل تعمله؟',ref:'ria'},
  {id:'c02',s:'ria',d:'C',q:'أي نوع من التفاصيل ممكن يخليك تراجع حاجة مرة تانية؟',ref:'ria'},
  {id:'c03',s:'ria',d:'C',q:'لو عندك مهمة بتتكرر، إيه اللي ممكن يخليك تحبها؟',ref:'ria'},
  {id:'c04',s:'ria',d:'C',q:'إمتى تحس إن المهمة اتقفلت فعلًا؟',ref:'ria'},
].map(q=>({...q,kind:'rating',scale:['مش شبه اختياري','قليلًا','أحيانًا','غالبًا','ده اختياري جدًا']}))
  // Interleave the six interest dimensions so adjacent questions do not reveal a pattern.
  .sort((a,b)=>{
    const order={r:0,i:1,a:2,s:3,e:4,c:5};
    const na=Number(a.id.slice(1)), nb=Number(b.id.slice(1));
    return na-nb || order[a.id[0]]-order[b.id[0]];
  })
  .map((q,i)=>({...q,page:Math.floor(i/6)}));

const TRACE = [
  {id:'t01',s:'trace',q:'لو عندك يوم فاضي تمامًا، أي حاجة ممكن تلاقي نفسك بتعملها من غير ترتيب مسبق؟',ref:'leisure',options:[
    {t:'أجرب أصلّح أو أركّب حاجة',x:{R:2}}, {t:'أبحث في موضوع محيرني',x:{I:2}}, {t:'أعمل تصميم أو أكتب أو أبتكر فكرة',x:{A:2}}, {t:'أقابل ناس أو أساعد حد',x:{S:2}}, {t:'أرتب نشاط أو أبدأ اتفاق مع حد',x:{E:2}}, {t:'أنظم ملفات أو تفاصيل أو قوائم',x:{C:2}}]},
  {id:'t02',s:'trace',q:'وأنت بتتفرج على فيلم أو إعلان، إيه اللي ممكن تلاحظه لوحدك؟',ref:'leisure',options:[
    {t:'الصورة والإضاءة والتكوين',x:{A:2,medium:'visual'}}, {t:'طريقة التنفيذ والأدوات',x:{R:2,medium:'physical'}}, {t:'السبب وراء نجاح الفكرة أو فشلها',x:{I:2}}, {t:'مشاعر الناس ورد فعل الجمهور',x:{S:2}}, {t:'طريقة الإقناع وعرض المنتج',x:{E:2,builder:'market'}}, {t:'ترتيب التفاصيل والاستمرارية',x:{C:2}}]},
  {id:'t03',s:'trace',q:'في نشاط مدرسي أو عائلي أو مع الأصدقاء، أي دور كنت تميل له؟',ref:'critical',options:[
    {t:'أجهز الشكل أو أعمل الجزء الإبداعي',x:{A:2,builder:'identity'}}, {t:'أدور على المعلومات وأتأكد منها',x:{I:2}}, {t:'أقسم المهام وأتابع التنفيذ',x:{E:1,C:1,builder:'operations'}}, {t:'أجهز الأدوات وأركب المطلوب',x:{R:2}}, {t:'أشرح وأساعد وأقرب وجهات النظر',x:{S:2}}, {t:'أرتب الوقت والميزانية والتفاصيل',x:{C:2}}]},
  {id:'t04',s:'trace',q:'لما تدخل مكان لأول مرة، إيه اللي ممكن يلفت انتباهك قبل غيره؟',ref:'fit',options:[
    {t:'سهولة الحركة واستخدام المكان',x:{R:1,I:1,builder:'experience'}}, {t:'التصميم والألوان والإضاءة',x:{A:2,builder:'identity'}}, {t:'طريقة استقبال الناس والتعامل معاهم',x:{S:2}}, {t:'الخدمة والأسعار وطريقة البيع',x:{E:2,builder:'market'}}, {t:'تنظيم المكان وسير العمل',x:{C:2,builder:'operations'}}, {t:'الأسباب اللي خلت المكان ناجح أو مزدحم',x:{I:2,builder:'market'}}]},
  {id:'t05',s:'trace',q:'لو شفت منتج كويس لكنه مش معروف، إيه أول فكرة ممكن تيجي في بالك؟',ref:'critical',options:[
    {t:'أفهم إيه اللي يميزه وأطوره',x:{I:1,R:1,builder:'product'}}, {t:'أبني له اسم وشكل وقصة',x:{A:1,E:1,builder:'identity'}}, {t:'أحدد مين ممكن يحتاجه',x:{I:1,E:1,builder:'market'}}, {t:'أدور على موردين وطريقة إنتاجه',x:{R:1,C:1,builder:'supply'}}, {t:'أجرب أبيعه وأشوف استجابة الناس',x:{E:2,builder:'sales'}}, {t:'أرتب دورة الطلب والتسليم وخدمة العميل',x:{C:2,builder:'operations'}}]},
  {id:'t06',s:'trace',q:'وأنت بتتعلم حاجة جديدة، أي جزء ممكن يخليك تكمل فيها؟',ref:'critical',options:[
    {t:'إني أجرب وأطلع بحاجة ملموسة',x:{R:1,A:1}}, {t:'إني أفهم النظام اللي وراها',x:{I:2}}, {t:'إني أضيف لها أسلوبي',x:{A:2}}, {t:'إني أستخدمها لمساعدة شخص',x:{S:2}}, {t:'إني أحولها لفرصة أو منتج',x:{E:1,A:1,builder:'product'}}, {t:'إني أتقن خطواتها وأكررها بدقة',x:{C:2}}]},
  {id:'t07',s:'trace',q:'لو فتحت محل أو فندق أو مطعم، إيه أكتر حاجة ممكن تركز عليها في أول زيارة؟',ref:'leisure',options:[
    {t:'جودة المنتج أو الخدمة نفسها',x:{R:1,I:1,builder:'product'}}, {t:'هوية المكان وشكله وتفاصيله',x:{A:2,builder:'identity'}}, {t:'راحة الزبون وتجربته',x:{S:1,A:1,builder:'experience'}}, {t:'التسعير وطريقة تقديم العرض',x:{E:2,builder:'sales'}}, {t:'التشغيل والنظافة وسهولة الخدمة',x:{C:1,R:1,builder:'operations'}}, {t:'الموقع والطلب والمنافسين',x:{I:1,E:1,builder:'market'}}]},
  {id:'t08',s:'trace',q:'لو أصحابك بيجهزوا رحلة أو مناسبة، أي جزء ممكن تتولاه من غير ما يطلبوا منك؟',ref:'critical',options:[
    {t:'اختيار المكان والتجربة',x:{A:1,I:1}}, {t:'التفاوض والحجز والتواصل',x:{E:2}}, {t:'ترتيب الميزانية والمواعيد',x:{C:2}}, {t:'التأكد إن كل شخص مرتاح ومشارك',x:{S:2}}, {t:'تجهيز الأدوات أو الأنشطة',x:{R:2}}, {t:'البحث عن أفضل البدائل والمقارنة',x:{I:2}}]},
  {id:'t09',s:'trace',q:'لما تتابع موضوع بتحبه لفترة طويلة، إيه اللي غالبًا بتدور عليه؟',ref:'leisure',options:[
    {t:'كيف يتصنع أو يشتغل',x:{R:2}}, {t:'الأرقام والأسباب والأنماط',x:{I:2}}, {t:'الأسلوب والذوق والتفاصيل',x:{A:2}}, {t:'تجارب الناس واحتياجاتهم',x:{S:2}}, {t:'الفرص والتجارة والتأثير',x:{E:2}}, {t:'القواعد والتاريخ والترتيب',x:{C:2}}]},
  {id:'t10',s:'trace',q:'لو طلب منك حد تساعده يحسن نشاط صغير، إيه أول حاجة ممكن تسأل عنها؟',ref:'critical',options:[
    {t:'المنتج بيتعمل إزاي؟',x:{R:1,I:1,builder:'product'}}, {t:'الناس بتشتريه ليه أو مش بتشتريه ليه؟',x:{I:1,E:1,builder:'market'}}, {t:'شكله وطريقة عرضه عاملين إزاي؟',x:{A:1,E:1,builder:'identity'}}, {t:'العملاء بيتعاملوا معاه إزاي؟',x:{S:1,E:1,builder:'experience'}}, {t:'التكلفة والطلب والتسليم متظبطين؟',x:{C:2,builder:'operations'}}, {t:'مين المسؤول عن كل خطوة؟',x:{E:1,C:1,builder:'operations'}}]},
  {id:'t11',s:'trace',q:'إيه نوع المحتوى اللي ممكن ترجع له أكتر من مرة؟',ref:'leisure',options:[
    {t:'شرح عملي أو تجربة إصلاح',x:{R:2}}, {t:'تحليل أو وثائقي أو لغز',x:{I:2}}, {t:'سينما أو فن أو تصميم',x:{A:2}}, {t:'قصص ناس وتجارب إنسانية',x:{S:2}}, {t:'تجارة أو تفاوض أو قصص شركات',x:{E:2}}, {t:'تعليمات أو مراجعات دقيقة ومقارنات',x:{C:2}}]},
  {id:'t12',s:'trace',q:'لو عندك فكرة منتج تحب وجوده في السوق، أي جزء من الرحلة يجذبك أكثر؟',ref:'eo',options:[
    {t:'تجربة المنتج وتحسين جودته',x:{R:1,I:1,builder:'product'}}, {t:'فهم الناس والمشكلة اللي يحلها',x:{I:2,builder:'market'}}, {t:'اختيار الاسم والهوية والشكل',x:{A:1,E:1,builder:'identity'}}, {t:'العثور على المورد وطريقة التصنيع',x:{R:1,C:1,builder:'supply'}}, {t:'الوصول للعملاء وبيع المنتج',x:{E:2,builder:'sales'}}, {t:'تنظيم الطلبات والدفع والشحن',x:{C:2,builder:'operations'}}]}
].map((q,i)=>({...q,kind:'choice',page:Math.floor(i/6)}));

const FLOW = ['R','I','A','S','E','C'].map((d,i)=>({id:'f'+d,s:'flow',d,kind:'rating',page:0,ref:'flow',q:[
  'لما تنشغل بإصلاح شيء أو تركيبه، هل ممكن تفضل مكمل لأنك مستمتع بالعملية؟',
  'لما تحاول تفهم سبب مشكلة، هل تلاقي نفسك بتفكر فيها حتى بعد ما تسيبها؟',
  'لما تصمم أو تكتب أو تعدّل حاجة، هل ممكن تندمج لدرجة تنسى الوقت؟',
  'لما تساعد شخص يتعلم أو يتجاوز مشكلة، هل بتكمل معاه باهتمام؟',
  'لما تقود فكرة أو تفاوض أو تحرك مشروع، هل العقبات بتخليك أكثر اندماجًا؟',
  'لما ترتب بيانات أو تراجع تفاصيل أو تحسن نظام، هل تقدر تستمر من غير ملل سريع؟'
][i]}));

const WORKSTYLE = [
  {id:'w_autonomy',s:'work',kind:'rating',ref:'fit',q:'أفضل يكون عندي مساحة أختار طريقة تنفيذ الشغل وترتيب خطواته.'},
  {id:'w_clients',s:'work',kind:'rating',ref:'fit',q:'التعامل مع العملاء وفهم احتياجهم وشرح قيمة المنتج أو الخدمة جزء أحب أشارك فيه.'},
  {id:'w_brand',s:'work',kind:'rating',ref:'eo',q:'أستمتع بامتلاك فكرة أو عرض واضح وتحويله لشيء الناس تقدر تتعرف عليه وتطلبه.'},
  {id:'w_vendors',s:'work',kind:'rating',ref:'eo',q:'أحب تنسيق موردين أو متخصصين مستقلين لإنجاز أجزاء مختلفة من نفس الخدمة أو المنتج.'},
  {id:'w_team',s:'work',kind:'rating',ref:'eo',q:'أستمتع ببناء فريق وتوزيع المسؤوليات ومتابعة نتيجة شغل جماعي.'},
  {id:'w_stability',s:'work',kind:'rating',ref:'fit',q:'الدخل المنتظم والمهام الواضحة مهمين بالنسبة لي حتى لو كانت فرصة الدخل الأعلى أقل.'},
  {id:'w_uncertainty',s:'work',kind:'rating',ref:'eo',q:'أقدر أتعامل مع فترة مش واضحة بالكامل لو بختبر فكرة بخطوات محسوبة.'},
  {id:'w_delivery',s:'work',kind:'rating',ref:'fit',q:'أفضل أن أنفذ الخدمة بنفسي بدل إدارة أشخاص أو موردين ينفذونها.'}
].map((q,i)=>({...q,page:0}));

const COGNITIVE = [
  {id:'cog01',s:'cognitive',kind:'choice',page:0,domain:'logic',ref:'chc',q:'في مخزن، كل الصناديق الزرقاء على الرف العلوي. بعض الصناديق على الرف العلوي عليها ملصق هش. هل نقدر نجزم إن بعض الصناديق الزرقاء عليها ملصق هش؟',options:['أيوه، أكيد','لا، المعلومات لا تكفي','كل الصناديق الزرقاء هشة'],correct:1},
  {id:'cog02',s:'cognitive',kind:'choice',page:0,domain:'numeric',ref:'crt',q:'اشتريت منتجًا بـ 160 جنيهًا. زاد سعره 25%، وبعدها حصل خصم 20% على السعر الجديد. السعر النهائي كام؟',options:['160 جنيهًا','164 جنيهًا','192 جنيهًا','200 جنيه'],correct:0},
  {id:'cog03',s:'cognitive',kind:'choice',page:0,domain:'verbal',ref:'chc',q:'إعلان يقول: «كل العملاء الذين اشتروا المنتج في التجربة الأولى عادوا للشراء». أي معلومة إضافية نحتاجها قبل الحكم إن المنتج ناجح؟',options:['عدد العملاء وطول فترة المتابعة','لون العبوة','اسم الموظف الذي باع المنتج','مكان تصوير الإعلان'],correct:0},
  {id:'cog04',s:'cognitive',kind:'choice',page:0,domain:'spatial',ref:'spatial',q:'وأنت ماشي في شارع، كان اتجاهك ناحية الشرق. مشيت مربعين، وبعدها لفيت ربع لفة لليمين ومشيت مربعًا واحدًا. بالنسبة لنقطة البداية، بقيت فين؟',options:['مربعين شرقًا ومربعًا جنوبًا','مربعين شرقًا ومربعًا شمالًا','مربعًا شرقًا ومربعين جنوبًا','مربعًا غربًا ومربعًا جنوبًا'],correct:0},
  {id:'cog05',s:'cognitive',kind:'choice',page:0,domain:'mechanical',ref:'mechanic',q:'ترس صغير يدور مع عقارب الساعة ويلامس ترسًا أكبر مباشرة. في أي اتجاه سيدور الترس الأكبر؟',options:['مع عقارب الساعة','عكس عقارب الساعة','لن يدور','الاتجاه غير مرتبط بالترس الأول'],correct:1},
  {id:'cog06',s:'cognitive',kind:'choice',page:1,domain:'logic',ref:'crt',q:'إذا كان كل مورد معتمد قد اجتاز مراجعة الجودة، وكان المورد «س» لم يجتز المراجعة، فما الاستنتاج الأدق؟',options:['المورد «س» معتمد','المورد «س» غير معتمد وفق هذه القاعدة','كل الموردين غير معتمدين','لا توجد أي علاقة بين الأمرين'],correct:1},
  {id:'cog07',s:'cognitive',kind:'choice',page:1,domain:'numeric',ref:'chc',q:'ثلاثة أشخاص يجهزون 90 طلبًا في 3 ساعات، بالمعدل نفسه. كم طلبًا يجهز 6 أشخاص في 3 ساعات؟',options:['90','135','180','270'],correct:2},
  {id:'cog08',s:'cognitive',kind:'choice',page:1,domain:'verbal',ref:'chc',q:'تقرير يقول: «ارتفعت المبيعات بعد تغيير شكل العبوة». أي صياغة أدق علميًا؟',options:['تغيير العبوة هو السبب المؤكد','هناك ارتباط زمني، لكن نحتاج فحص عوامل أخرى','العبوة الجديدة لا تؤثر أبدًا','المبيعات سترتفع دائمًا'],correct:1},
  {id:'cog09',s:'cognitive',kind:'choice',page:1,domain:'spatial',ref:'spatial',q:'سهم يشير إلى أعلى. أدرته ربع دورة عكس عقارب الساعة، ثم نصف دورة. إلى أين يشير الآن؟',options:['أعلى','أسفل','يمين','يسار'],correct:2},
  {id:'cog10',s:'cognitive',kind:'choice',page:1,domain:'mechanical',ref:'mechanic',q:'عجلة قيادة متصلة بعجلة أخرى بسير غير متقاطع. إذا دارت الأولى مع عقارب الساعة، فكيف تدور الثانية؟',options:['مع عقارب الساعة','عكس عقارب الساعة','تتحرك في خط مستقيم','لا يمكن أن تتحرك'],correct:0}
];

const CAREERS = [
  {id:'brand_builder',title:'صانع ومطوّر علامات تجارية',code:'EAC',custom:true,sector:['business','arts','food','hospitality'],medium:['visual','people','digital','systems'],builder:['identity','product','market','sales','operations'],models:['employee','freelance','solo','small','company','hybrid'],tasks:['اكتشاف فرصة أو احتياج في السوق','تطوير المنتج أو العرض والهوية التي تميّزه','تنسيق الموردين والتسويق والبيع وتجربة العميل'],friction:'متابعة الجودة والتكلفة والتحصيل والعملاء؛ الإبداع وحده لا يكفي لإدارة العلامة.'},
  {id:'product_developer',title:'مطوّر منتجات وتجارب',code:'IAR',custom:true,sector:['food','business','hospitality','technology','engineering'],medium:['physical','digital','living','visual'],builder:['product','market','experience'],models:['employee','freelance','solo','small','company','hybrid'],tasks:['فهم احتياج المستخدم أو العميل','تحويل الفكرة إلى نموذج وتجربته','تحسين المنتج بناءً على الملاحظات والبيانات'],friction:'تجارب لا تنجح من أول مرة، قيود تكلفة ومواصفات، وتعديلات متكررة.'},
  {id:'creative_company',title:'مؤسس/مشغّل مشروع إنتاج إبداعي',code:'EAC',custom:true,sector:['arts','business','technology'],medium:['visual','digital','people'],builder:['identity','sales','operations'],models:['solo','small','company','hybrid'],tasks:['تطوير عرض إبداعي قابل للبيع','التعاقد مع عملاء وموردين ومبدعين','متابعة الجودة والتسليم والتحصيل'],friction:'البيع والتحصيل وإدارة التعديلات والحقوق إلى جانب العمل الإبداعي.'},
  {id:'director',title:'مخرج أو منتج سينمائي',code:'AE',sector:['arts'],medium:['visual','people','digital'],builder:['identity','experience'],models:['employee','freelance','company','hybrid'],tasks:['تحويل النص أو الفكرة إلى رؤية للمشاهد','توجيه التصوير والأداء والصوت','مراجعة اللقطات والنسخة النهائية'],friction:'تعديلات وميزانيات ومواعيد وتنسيق فريق متعدد التخصصات.',url:'https://www.onetonline.org/link/summary/27-2012.00'},
  {id:'camera',title:'مشغّل كاميرا / مدير تصوير',code:'ARC',sector:['arts'],medium:['visual','physical'],models:['employee','freelance','solo','hybrid'],tasks:['تجهيز الكاميرا والعدسات','ضبط الإضاءة والتكوين والحركة','تسجيل اللقطات وفق رؤية المشروع'],friction:'معدات ومواقع تصوير وساعات عمل متغيرة وضغط فني.',url:'https://www.onetonline.org/link/summary/27-4031.00'},
  {id:'editor',title:'مونتير / محرر فيديو',code:'AC',sector:['arts','technology'],medium:['digital','visual'],models:['employee','freelance','solo','hybrid'],tasks:['فرز اللقطات','تركيب المشاهد وضبط الإيقاع والصوت','تنفيذ تعديلات متكررة'],friction:'وقت طويل أمام الشاشة وتعديلات ومواعيد تسليم.',url:'https://www.onetonline.org/link/summary/27-4032.00'},
  {id:'graphic',title:'مصمم جرافيك وهوية بصرية',code:'AC',sector:['arts','business'],medium:['visual','digital'],builder:['identity'],models:['employee','freelance','solo','hybrid'],tasks:['فهم رسالة العلامة والجمهور','تصميم الهوية والتطبيقات البصرية','تجهيز الملفات ومراجعتها'],friction:'تفسير ملاحظات العملاء وكثرة التعديلات.',url:'https://www.onetonline.org/link/summary/27-1024.00'},
  {id:'architect',title:'مهندس معماري',code:'RCA',sector:['engineering','arts','hospitality'],medium:['visual','digital','physical'],builder:['experience','product'],models:['employee','freelance','company','hybrid'],tasks:['تحويل احتياج العميل إلى تصور مكاني','إعداد الرسومات والنماذج','مراجعة المواد والتنسيق مع التخصصات'],friction:'اشتراطات فنية وقانونية ومسؤولية سلامة وتعديلات.',url:'https://www.onetonline.org/link/summary/17-1011.00'},
  {id:'mechanical',title:'مهندس ميكانيكا',code:'RIC',sector:['engineering','industry'],medium:['physical','systems','digital'],models:['employee','freelance','company','hybrid'],tasks:['قراءة الرسومات الفنية','تصميم أو اختبار أنظمة ميكانيكية','تحليل الأعطال وتحسين الأداء'],friction:'اختبارات ومواصفات وسلامة وتوثيق دقيق.',url:'https://www.onetonline.org/link/summary/17-2141.00'},
  {id:'software',title:'مهندس برمجيات / مطوّر برامج',code:'IC',sector:['technology','business'],medium:['digital','systems'],builder:['product'],models:['employee','freelance','solo','company','hybrid'],tasks:['تحليل متطلبات المستخدم','كتابة واختبار الشيفرة','تصحيح الأخطاء وصيانة النظام'],friction:'أخطاء غامضة وتعلم مستمر وتغير المتطلبات.',url:'https://www.onetonline.org/link/summary/15-1252.00'},
  {id:'data',title:'محلل بيانات',code:'IC',sector:['technology','sports','business','health'],medium:['numbers','digital','systems'],builder:['market','operations'],models:['employee','freelance','solo','company','hybrid'],tasks:['تنظيف البيانات','اختبار الفرضيات والأنماط','شرح النتائج وحدودها'],friction:'بيانات ناقصة أو متحيزة وضرورة توضيح النتائج.',url:'https://www.onetonline.org/link/summary/15-2051.00'},
  {id:'nurse',title:'ممرض / ممرضة',code:'SCI',sector:['health','community'],medium:['people','living'],models:['employee','hybrid'],tasks:['تقييم احتياجات المرضى','تنفيذ الرعاية وتوثيقها','التنسيق مع الفريق الطبي والأسرة'],friction:'مناوبات وضغط جسدي وعاطفي ومتطلبات ترخيص.',url:'https://www.onetonline.org/link/summary/29-1141.00'},
  {id:'accountant',title:'محاسب / مراجع حسابات',code:'CEI',sector:['business'],medium:['numbers','systems'],models:['employee','freelance','solo','hybrid'],tasks:['تسجيل ومراجعة المعاملات','إعداد تقارير مالية','فحص التباينات والالتزام بالإجراءات'],friction:'مواعيد إقفال ودقة عالية وقواعد تتغير.',url:'https://www.onetonline.org/link/summary/13-2011.00'},
  {id:'financial_analyst',title:'محلل مالي واستثماري',code:'IEC',custom:true,sector:['business'],medium:['numbers','digital'],builder:['market'],models:['employee','freelance','hybrid'],tasks:['تحليل البيانات المالية','مقارنة السيناريوهات والمخاطر','شرح الافتراضات والنتائج'],friction:'بيانات غير مؤكدة ومسؤولية تفسير المخاطر؛ لا يساوي تقديم استشارة مرخصة.'},
  {id:'sports_analyst',title:'محلل أداء رياضي',code:'IAC',custom:true,sector:['sports'],medium:['numbers','digital','people'],builder:['market'],models:['employee','freelance','solo','hybrid'],tasks:['تحليل أداء اللاعبين والفرق','استخراج مؤشرات من المباريات','عرض النتائج للمدربين أو الجمهور'],friction:'الحاجة إلى بيانات جيدة وفهم اللعبة والتخصص الرياضي.'},
  {id:'auto_diagnostic',title:'فني تشخيص أعطال سيارات',code:'RIC',custom:true,sector:['engineering','industry'],medium:['physical','systems'],models:['employee','freelance','small','hybrid'],tasks:['فحص الأعراض والأنظمة','استخدام أدوات التشخيص','تحديد سبب العطل واختبار الإصلاح'],friction:'مسؤولية السلامة وتحديث المعرفة وتكلفة الأدوات.'},
  {id:'chef',title:'طاهٍ محترف / شيف',code:'ERC',sector:['food','hospitality'],medium:['living','physical','people'],builder:['product','experience'],models:['employee','freelance','small','solo','hybrid'],tasks:['تطوير وتجهيز الوصفات','ضبط الجودة والتكلفة','تنظيم التحضير والتقديم'],friction:'ساعات وقوف طويلة وضغط توقيت واشتراطات سلامة الغذاء.',url:'https://www.onetonline.org/link/summary/35-1011.00'},
  {id:'webdeveloper',title:'مطور مواقع وتطبيقات ويب',code:'CI',sector:['technology','business'],medium:['digital','systems'],builder:['product','operations'],models:['employee','freelance','solo','company','hybrid'],tasks:['بناء صفحات وواجهات','ربط الخدمات والبيانات','اختبار الموقع وصيانته'],friction:'تصحيح أخطاء وتوافق الأجهزة والتحديث المستمر.',url:'https://www.onetonline.org/link/summary/15-1254.00'},
  {id:'market_research',title:'محلل أبحاث سوق',code:'ECI',sector:['business','food','hospitality','technology'],medium:['people','numbers','digital'],builder:['market','product'],models:['employee','freelance','solo','hybrid'],tasks:['تصميم أسئلة بحثية','مقابلة العملاء وتحليل النتائج','مقارنة العروض والمنافسين'],friction:'عينات محدودة واحتمال تحيز الإجابات.',url:'https://www.onetonline.org/link/summary/13-1161.00'},
  {id:'eventplanner',title:'منظم فعاليات وتجارب',code:'ECS',sector:['arts','hospitality','community'],medium:['people','systems','visual'],builder:['experience','operations'],models:['employee','freelance','solo','small','company','hybrid'],tasks:['تصميم برنامج الفعالية','تنسيق الموردين والمكان والمواعيد','إدارة تجربة الحضور'],friction:'تغييرات اللحظة الأخيرة وتنسيق موردين ومخاطر تشغيلية.',url:'https://www.onetonline.org/link/summary/13-1121.00'},
  {id:'logistics',title:'أخصائي لوجستيات وسلاسل إمداد',code:'CEI',sector:['business','industry','food'],medium:['systems','numbers','physical'],builder:['supply','operations'],models:['employee','freelance','company','hybrid'],tasks:['متابعة تدفق الطلبات والمواد','تنسيق الشحن والمخزون','حل التأخير وتحسين التكلفة'],friction:'اعتماد على أطراف متعددة وتغير المواعيد والتكاليف.',url:'https://www.onetonline.org/link/summary/13-1081.00'},
  {id:'sales',title:'مستشار أو مندوب مبيعات',code:'EC',sector:['business','food','technology','hospitality'],medium:['people','systems'],builder:['sales','market'],models:['employee','freelance','solo','company','hybrid'],tasks:['اكتشاف احتياج العميل','شرح العرض والتفاوض','متابعة العلاقة وإغلاق الاتفاق'],friction:'رفض متكرر وأهداف ومتابعة وتحصيل.',url:'https://www.onetonline.org/link/summary/41-4012.00'},
  {id:'teacher',title:'معلم / مدرب',code:'S',sector:['education','community','technology','arts'],medium:['people','digital'],models:['employee','freelance','solo','small','hybrid'],tasks:['شرح المفاهيم','تصميم أنشطة تعلم','متابعة تقدم المتعلمين'],friction:'تحضير وتصحيح وإدارة مجموعات مختلفة.',url:'https://www.onetonline.org/link/summary/25-2031.00'},
  {id:'psychologist',title:'أخصائي نفسي',code:'SI',sector:['health','community'],medium:['people','systems'],models:['employee','freelance','hybrid'],tasks:['إجراء تقييم مهني مناسب','تقديم تدخلات ضمن نطاق المؤهل','توثيق المتابعة والإحالة عند الحاجة'],friction:'تأهيل وترخيص ومسؤولية أخلاقية وضغط عاطفي.',url:'https://www.onetonline.org/link/summary/19-3033.00'},
  {id:'electrician',title:'فني كهرباء / كهربائي مؤهل',code:'RC',sector:['engineering','industry'],medium:['physical','systems'],models:['employee','freelance','small','hybrid'],tasks:['فحص الدوائر والمكونات','تركيب وصيانة الأنظمة','اختبار السلامة'],friction:'مخاطر كهربائية ومسؤولية تتطلب تدريبًا وإجراءات سلامة.',url:'https://www.onetonline.org/link/summary/47-2111.00'},
  {id:'sound',title:'فني هندسة صوت',code:'RAC',sector:['arts','technology'],medium:['physical','digital','visual'],models:['employee','freelance','solo','hybrid'],tasks:['إعداد الميكروفونات والمعدات','ضبط الصوت ومعالجة التسجيل','مزامنة الصوت مع الصورة'],friction:'مواعيد غير ثابتة ومعدات وضوضاء وضغط تسليم.',url:'https://www.onetonline.org/link/summary/27-4014.00'},
  {id:'agriculture',title:'مشغّل أو مدير نشاط زراعي',code:'ERC',sector:['agriculture','food','nature'],medium:['living','physical','systems'],builder:['product','supply','operations'],models:['employee','small','solo','company','hybrid'],tasks:['متابعة الإنتاج والجودة','تنظيم العمالة والموارد','ربط المنتج بالتخزين أو السوق'],friction:'موسمية وطقس ومخاطر إنتاج وتكاليف نقل.',url:'https://www.onetonline.org/link/summary/11-9013.00'},
  {id:'social_service',title:'أخصائي خدمات اجتماعية ومجتمعية',code:'S',custom:true,sector:['community','education','health'],medium:['people'],models:['employee','hybrid'],tasks:['فهم احتياجات الأفراد والأسر','توجيههم إلى خدمات مناسبة','متابعة الحالات والتنسيق'],friction:'ضغط عاطفي وإجراءات ومحدودية الموارد.'},
  {id:'early_childhood',title:'معلم طفولة مبكرة',code:'SAC',custom:true,sector:['education','community'],medium:['people','visual'],models:['employee','small','hybrid'],tasks:['تصميم أنشطة مناسبة للعمر','ملاحظة نمو الأطفال','التواصل مع أولياء الأمور'],friction:'مسؤولية رعاية وسلامة وصبر وتنظيم يومي.'},
  {id:'hairstylist',title:'مصفف شعر / مقدم خدمة عناية شخصية',code:'AES',custom:true,sector:['community','arts'],medium:['people','physical','visual'],models:['employee','freelance','small','solo','hybrid'],tasks:['فهم رغبة العميل','تنفيذ خدمة دقيقة','إدارة المواعيد والجودة والنظافة'],friction:'وقوف طويل وتواصل مباشر ومتطلبات صحية ومهنية.'},
  {id:'hotel_experience',title:'مطوّر تجربة ضيافة / مدير منشأة ضيافة',code:'EAS',custom:true,sector:['hospitality','nature','arts'],medium:['people','visual','systems','living'],builder:['experience','identity','operations'],models:['employee','solo','small','company','hybrid'],tasks:['تصميم تجربة الضيف ومسارات الخدمة','تنسيق التشغيل والموردين والموارد','تحسين جودة الإقامة والاستدامة'],friction:'تشغيل يومي ومناوبات وتكاليف وصيانة واشتراطات سلامة.'}
];

const IDEAS = [
  {id:'problem_discovery',title:'خدمة اكتشاف مشكلات العملاء قبل إطلاق مشروع',sector:'business',models:['employee','freelance','solo','hybrid'],medium:['people','numbers'],builder:['market','experience'],tools:[],access:[],budget:0,hours:1,customer:'أصحاب أنشطة صغيرة أو أشخاص يفكرون في إطلاق خدمة',offer:'مقابلات قصيرة ورصد تجربة العميل وتلخيص المشكلات المتكررة',test:'اختار نشاطًا أو خدمة تعرفها، واسأل خمسة أشخاص بموافقتهم عن أصعب جزء في التجربة. لا تعرض حلًا أو تعد بنتيجة قبل فهم المشكلة.'},
  {id:'digital_presence',title:'خدمة تأسيس حضور رقمي للأنشطة الصغيرة',sector:'technology',models:['freelance','solo','hybrid'],medium:['digital','systems'],builder:['operations','market'],tools:['phone','computer','internet'],access:['businesses'],budget:0,hours:3,customer:'محلات ومقدمو خدمات يحتاجون صفحة واضحة لاستقبال الطلبات',offer:'صفحة تعريفية ونموذج طلب وربط خدمة جاهزة بعد اختبار احتياج العميل',test:'اعمل نموذجًا تجريبيًا لنشاط افتراضي واعرضه على ثلاثة أصحاب أعمال. لا تشترِ اشتراكًا قبل وجود اهتمام واضح.'},
  {id:'brand_launch',title:'مشغّل علامة تجارية بمنتج يُنفّذ لدى موردين',sector:'business',models:['solo','small','hybrid','company'],medium:['people','systems','visual'],builder:['identity','product','supply','operations'],tools:['phone','computer','internet'],access:['suppliers','production','packaging','marketing','payment','shipping','platforms'],budget:0,hours:4,customer:'فئة محددة تبحث عن منتج متخصص بعرض وهوية واضحة',offer:'امتلاك العلامة وعلاقة العميل وتنسيق الإنتاج والتعبئة والدفع والشحن مع أطراف خارجية',test:'ابدأ بمقابلات وطلب اهتمام غير مدفوع، واحصل على عروض موردين مكتوبة وشروط دفع واسترجاع قبل قبول طلبات أو دفع مقدمات.'},
  {id:'market_interviews',title:'خدمة بحث عملاء ومنافسين للمشروعات الصغيرة',sector:'business',models:['freelance','solo','hybrid'],medium:['people','numbers'],builder:['market','product'],tools:['phone','computer','internet'],access:['businesses','customers'],budget:0,hours:2,customer:'أصحاب مشروعات قبل إطلاق منتج أو تعديل خدمة',offer:'مقابلات استكشافية ومقارنة عروض المنافسين مع بيان حدود العينة',test:'أجرِ خمس مقابلات بموافقة المشاركين واكتب النتائج وما لا يمكن الجزم به.'},
  {id:'content_service',title:'خدمة تنسيق وإنتاج محتوى للأنشطة المحلية',sector:'arts',models:['freelance','solo','small','hybrid'],medium:['visual','digital','people'],builder:['identity','sales','operations'],tools:['phone','computer','internet'],access:['businesses','marketing'],budget:0,hours:3,customer:'مطاعم ومتاجر وخدمات تحتاج محتوى منتظمًا',offer:'خطة محتوى محدودة وتنسيق مستقلين للتصوير أو التصميم عند الحاجة',test:'جهّز نموذجًا واحدًا واعرض نطاقًا وسعرًا واضحين على ثلاثة أنشطة قبل شراء معدات.'},
  {id:'editing_remote',title:'خدمة مونتاج عن بُعد',sector:'arts',models:['freelance','solo','hybrid'],medium:['digital','visual'],builder:['operations'],tools:['computer','internet'],access:['businesses','marketing'],budget:0,hours:3,customer:'صناع محتوى وشركات صغيرة',offer:'مونتاج مقاطع قصيرة بنطاق وتعديلات وتسليم محددين',test:'أنجز عينة من مادة تملك حق استخدامها واطلب تقييم عميلين محتملين.'},
  {id:'ops_setup',title:'تنظيم الطلبات والمخزون للمتاجر الصغيرة',sector:'business',models:['freelance','solo','hybrid'],medium:['systems','numbers','digital'],builder:['operations'],tools:['phone','computer'],access:['businesses'],budget:0,hours:2,customer:'متاجر صغيرة لديها طلبات أو مخزون غير منظم',offer:'إعداد سجل طلبات ومخزون بسيط وطريقة متابعة أسبوعية',test:'ارسم دورة منتج واحد واختبر جدول متابعة تجريبيًا دون الوصول إلى بيانات حساسة.'},
  {id:'data_reports',title:'تقارير ولوحات متابعة مبسطة',sector:'technology',models:['freelance','solo','hybrid'],medium:['numbers','digital','systems'],builder:['market','operations'],tools:['computer','internet'],access:['businesses'],budget:0,hours:3,customer:'فرق ومتاجر تحتاج متابعة مبيعات أو مخزون',offer:'تنظيف جدول بيانات وتقديم تقرير مفهوم بمؤشرات متفق عليها',test:'استخدم بيانات افتراضية وابنِ نموذجًا واحدًا ثم اختبر فهمه.'},
  {id:'supplier_coordination',title:'خدمة تنسيق موردين وتنفيذ طلبات',sector:'business',models:['solo','small','hybrid'],medium:['people','systems'],builder:['supply','operations','sales'],tools:['phone','internet'],access:['suppliers','businesses','shipping'],budget:0,hours:4,customer:'شركات صغيرة لا تريد إدارة عدة موردين بنفسها',offer:'تنسيق عروض الأسعار والمواعيد والجودة والتسليم ضمن عقد واضح',test:'قابل موردين وعميلين، واختبر طلبًا افتراضيًا دون تحصيل أموال أو ضمان نتيجة قبل الاتفاق.'},
  {id:'food_product_test',title:'اختبار منتج غذائي متخصص عبر منتِج مرخّص',sector:'food',models:['solo','small','hybrid'],medium:['living','physical','people'],builder:['product','identity','supply'],tools:['phone','computer'],access:['production','packaging','suppliers','businesses'],budget:1,hours:4,customer:'فئة غذائية متخصصة أو متاجر تبحث عن منتج مميز',offer:'تطوير مواصفات وعرض أولي مع جهة إنتاج مستوفية للاشتراطات',test:'اختبر اهتمام العملاء واسأل جهة الإنتاج عن الحد الأدنى والتكلفة والاشتراطات. لا تبيع قبل التحقق من متطلبات سلامة الغذاء.'},
  {id:'hospitality_audit',title:'تحسين تجربة الضيافة لمنشأة قائمة',sector:'hospitality',models:['freelance','solo','hybrid'],medium:['people','visual','systems'],builder:['experience','operations'],tools:['phone','computer'],access:['tourism','businesses','customers'],budget:0,hours:3,customer:'نزل صغيرة وبيوت ضيافة ومطاعم',offer:'مراجعة رحلة العميل وملاحظات الخدمة واقتراح تحسينات قابلة للاختبار',test:'حلل تجربة منشأة بموافقتها وقدم ملاحظات أولية غير ملزمة.'},
  {id:'learning_material',title:'تصميم مواد تعليمية وتدريبية',sector:'education',models:['freelance','solo','small','hybrid'],medium:['digital','visual','people'],builder:['product','experience'],tools:['phone','computer','internet'],access:['schools','businesses'],budget:0,hours:3,customer:'مدربون ومراكز تعليم ومدارس',offer:'تحويل موضوع تعرفه إلى عرض أو ورقة عمل أو فيديو تعليمي',test:'صمم درسًا قصيرًا واختبر فهمه مع متعلمين من الفئة المستهدفة.'},
  {id:'b2b_sales',title:'تطوير مبيعات ومتابعة عملاء للشركات الصغيرة',sector:'business',models:['freelance','solo','hybrid'],medium:['people','systems'],builder:['market','sales'],tools:['phone','computer','internet'],access:['suppliers','factories','businesses'],budget:0,hours:3,customer:'موردون ومصنعون ومقدمو خدمات للشركات',offer:'تنظيم قائمة عملاء ومتابعة الاستفسارات والعروض',test:'اختبر قطاعًا واحدًا وعرض خدمة محددًا دون ضمان مبيعات.'},
  {id:'visual_product',title:'تصميم هوية وتغليف لمنتج ناشئ',sector:'arts',models:['freelance','solo','hybrid'],medium:['visual','digital','physical'],builder:['identity','product'],tools:['computer','internet'],access:['businesses','packaging','marketing'],budget:0,hours:3,customer:'منتجون صغار وعلامات ناشئة',offer:'تصميم أولي للهوية والملصق مع ملفات تسليم للطباعة',test:'صمم نموذجًا تجريبيًا لمنتج افتراضي واعرضه على ثلاثة منتجين.'},
  {id:'repair_diagnosis',title:'خدمة فحص أولي وتنسيق إصلاحات متخصصة',sector:'engineering',models:['employee','freelance','small','hybrid'],medium:['physical','systems'],builder:['product','operations'],tools:['phone','tools'],access:['workshops'],budget:1,hours:4,customer:'أفراد أو ورش تحتاج توثيق الأعراض ومتابعة الإصلاح',offer:'فحص أو تنسيق ضمن حدود تدريبك وصلاحياتك، دون أعمال خطرة أو ادعاء ترخيص',test:'تدرّب مع فني مؤهل وابدأ بملاحظة عملية آمنة.'},
  {id:'agri_link',title:'تنسيق توريد منتج زراعي للمشترين',sector:'agriculture',models:['solo','small','hybrid'],medium:['living','systems','people'],builder:['supply','market','operations'],tools:['phone','vehicle'],access:['farms','suppliers','businesses','shipping'],budget:1,hours:4,customer:'مزارعون ومطاعم ومتاجر غذائية',offer:'تنسيق مواصفات الطلب والكمية والتعبئة والتسليم',test:'ارسم سلسلة منتج واحد واسأل طرفين عن التأخير والهدر قبل شراء أي محصول.'},
  {id:'creative_events',title:'تنسيق فعاليات وتجارب صغيرة',sector:'arts',models:['freelance','solo','small','hybrid'],medium:['people','visual','systems'],builder:['experience','operations','sales'],tools:['phone','internet'],access:['tourism','businesses','schools'],budget:1,hours:4,customer:'شركات ومراكز ومجموعات صغيرة',offer:'تنسيق الجدول والموردين والحضور والتجربة',test:'ضع خطة فعالية افتراضية واسأل جهة قائمة عن أصعب مشكلة تشغيلية.'},
  {id:'sustainable_hospitality',title:'تصور أولي لتجربة إقامة مستدامة',sector:'nature',models:['employee','solo','small','company','hybrid'],medium:['visual','living','systems','people'],builder:['experience','product','operations'],tools:['phone','computer','internet'],access:['tourism','businesses','workshops'],budget:0,hours:3,customer:'منشآت ضيافة قائمة أو ملاك أراضٍ ومشروعات تطوير',offer:'بحث أولي في تجربة الضيف وكفاءة الموارد والهوية المحلية',test:'حلل منشأة قائمة واقترح تحسينًا واحدًا قابلًا للقياس؛ لا تبدأ بتكاليف إنشاء فندق.'},
  {id:'service_design',title:'تحسين رحلة العميل لخدمة محلية',sector:'business',models:['freelance','solo','hybrid'],medium:['people','systems','visual'],builder:['experience','market','operations'],tools:['phone','computer'],access:['businesses','customers'],budget:0,hours:2,customer:'عيادات أو متاجر أو خدمات محلية',offer:'رسم رحلة العميل وتحديد نقاط التأخير والارتباك',test:'راقب التجربة بموافقة صاحب النشاط ثم اقترح تعديلًا واحدًا.'}
];

const DIM = ['R','I','A','S','E','C'];
const SECTION_PAGE = {ria:4,trace:2,flow:1,cognitive:2,work:1};

function safeJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (_) { return null; } }
  return null;
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) return true;
  try { return new URL(origin).host.toLowerCase() === String(host).toLowerCase(); }
  catch (_) { return false; }
}
function headers(res) {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','same-origin');
  res.setHeader('Cross-Origin-Resource-Policy','same-origin');
}
function send(res,status,data) { res.statusCode=status; res.end(JSON.stringify(data)); }
function publicQuestion(q) {
  const out = {id:publicQuestionId(q.id), text:q.q, kind:q.kind, reference:REFERENCES[q.ref]};
  if (q.kind === 'rating') out.scale = q.scale || ['مش شبه اختياري','قليلًا','أحيانًا','غالبًا','ده اختياري جدًا'];
  if (q.kind === 'choice') out.options = q.options.map(o => typeof o === 'string' ? o : o.t);
  return out;
}
function listFor(section) {
  if (section==='ria') return QUESTIONS.filter(q=>q.s==='ria');
  if (section==='trace') return TRACE;
  if (section==='flow') return FLOW;
  if (section==='cognitive') return COGNITIVE;
  if (section==='work') return WORKSTYLE;
  return null;
}
function pageQuestions(section,page) {
  const bank=listFor(section); if(!bank) return null;
  const size=section==='ria'||section==='trace'?6:section==='cognitive'?5:10;
  const pageCount=Math.ceil(bank.length/size);
  if(page<0||page>=pageCount) return null;
  return {section,page,pageCount,total:bank.length,items:bank.slice(page*size,(page+1)*size).map(publicQuestion)};
}
function mean(arr) { return arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0; }
function clamp(n,a=1,b=5) { return Math.max(a,Math.min(b,Number(n)||a)); }
function dimensionScores(answers) {
  const scores={};
  for(const d of DIM) scores[d]=mean(QUESTIONS.filter(q=>q.d===d).map(q=>clamp(answers[q.id])));
  return scores;
}
function traceSignals(answers) {
  const counts=Object.fromEntries(DIM.map(d=>[d,0])); const builder={identity:0,product:0,market:0,supply:0,sales:0,operations:0,experience:0}; const mediums={};
  for(const q of TRACE){const idx=Number(answers[q.id]); const option=q.options[idx]; if(!option) continue;
    for(const d of DIM) counts[d]+=Number(option.x[d]||0);
    for(const key of Object.keys(builder)) builder[key]+=Number(option.x[key]||0);
    if(option.x.medium) mediums[option.x.medium]=(mediums[option.x.medium]||0)+1;
  }
  return {counts,builder,mediums,topMedium:Object.entries(mediums).sort((a,b)=>b[1]-a[1])[0]?.[0]||'digital'};
}
function meanFlow(answers,d){ return clamp(answers['f'+d]||1); }
function careerScore(c,scores,trace,answers,profile) {
  const rankOrder=[...DIM].sort((a,b)=>scores[b]-scores[a]);
  const rank={}; let i=0;
  while(i<rankOrder.length){let j=i+1;while(j<rankOrder.length&&Math.abs(scores[rankOrder[j]]-scores[rankOrder[i]])<0.0001)j++;const r=(i+j-1)/2;for(let k=i;k<j;k++)rank[rankOrder[k]]=r;i=j;}
  const code=c.code.split(''); const rankFit=mean(code.map((d,pos)=>(5-rank[d])/5*(3-pos)/3));
  const rawFit=mean(code.map(d=>(scores[d]-1)/4));
  const traceFit=mean(code.map(d=>trace.counts[d]))/(Math.max(1,...Object.values(trace.counts))||1);
  const flowFit=mean(code.map(d=>(meanFlow(answers,d)-1)/4));
  const builderTags=c.builder||[]; const builderFit=builderTags.length?mean(builderTags.map(k=>trace.builder[k]))/(Math.max(1,...Object.values(trace.builder))||1):0.35;
  const evidenceMap={
    built_brand:['brand_builder','product_developer','creative_company'],built_website:['webdeveloper','software','brand_builder'],
    sold:['brand_builder','creative_company','sales','market_research'],managed_suppliers:['brand_builder','creative_company','logistics','eventplanner','agriculture'],
    made_content:['director','camera','editor','graphic','sound','creative_company'],analyzed:['data','financial_analyst','accountant','market_research','sports_analyst'],
    taught:['teacher','early_childhood'],repaired:['mechanical','electrician','auto_diagnostic'],cared:['nurse','psychologist','social_service','early_childhood'],managed_ops:['brand_builder','creative_company','eventplanner','logistics','agriculture','hotel_experience']
  };
  const evidenceTypes=profile.experienceTypes||[];
  const evidenceMatches=evidenceTypes.filter(type=>(evidenceMap[type]||[]).includes(c.id)).length;
  const evidenceFit=evidenceTypes.length?Math.min(1,evidenceMatches/Math.max(1,Math.min(2,evidenceTypes.length))):0.5;
  const sectorAliases={coffee:['food','hospitality','business'],food:['food','hospitality'],hospitality:['hospitality','food'],nature:['nature','agriculture','hospitality'],animals:['nature','health','community'],arts:['arts','hospitality','business'],business:['business','technology'],technology:['technology','business'],sports:['sports','technology','health'],education:['education','community'],health:['health','community'],engineering:['engineering','industry'],community:['community','education','health']};
  const selectedSectors=(profile.domains||[]).flatMap(x=>sectorAliases[x]||[x]);
  const domainFit=selectedSectors.length?(c.sector.some(x=>selectedSectors.includes(x))?1:0.35):0.5;
  const overall=100*(0.28*rankFit+0.12*rawFit+0.20*traceFit+0.09*flowFit+0.15*builderFit+0.10*evidenceFit+0.06*domainFit);
  return {...c,score:Math.round(overall),subscores:{interest:Math.round(100*(.65*rankFit+.35*rawFit)),behaviour:Math.round(100*traceFit),engagement:Math.round(100*flowFit),builder:Math.round(100*builderFit),experienceEvidence:Math.round(100*evidenceFit),domain:Math.round(100*domainFit)}};
}
function workModels(a,p,career) {
  const v=id=>clamp(a[id]||3); const stable=v('w_stability'),autonomy=v('w_autonomy'),clients=v('w_clients'),brand=v('w_brand'),vendors=v('w_vendors'),team=v('w_team'),uncertain=v('w_uncertainty'),ownExecution=v('w_delivery');
  const prefs=[
    {id:'employee',title:'وظيفة داخل مؤسسة',preference:.35*stable+.25*(6-autonomy)+.20*(6-uncertain)+.20*(6-vendors),desc:'تتخصص في دور واضح داخل جهة عمل، مع دخل أكثر انتظامًا ومسؤوليات محددة.'},
    {id:'freelance',title:'عمل حر: بيع مهارتك بنفسك',preference:.28*autonomy+.25*clients+.25*ownExecution+.12*(6-stable)+.10*uncertain,desc:'تبيع مهارة أو خدمة تنفذها بنفسك وتتولى العلاقة مع العميل.'},
    {id:'solo',title:'مشغّل مشروع فردي عبر موردين',preference:.20*autonomy+.20*brand+.24*vendors+.16*clients+.12*(6-team)+.08*uncertain,desc:'تمتلك العرض والعلامة وعلاقة العميل، وتنسق موردين ومقدمي خدمات مستقلين دون الحاجة إلى موظفين دائمين.'},
    {id:'small',title:'صاحب مشروع صغير بتشغيل مباشر',preference:.20*autonomy+.18*brand+.18*clients+.18*ownExecution+.14*vendors+.12*uncertain,desc:'تدير نشاطًا محدودًا وقد تتولى جزءًا من التشغيل أو تحتاج إلى مكان أو مخزون أو معدات.'},
    {id:'company',title:'مؤسس شركة بفريق',preference:.18*autonomy+.18*brand+.25*team+.16*vendors+.13*clients+.10*uncertain,desc:'تبني فريقًا ونظام تشغيل وتتحمل مسؤولية التنسيق والنتائج والتوسع.'},
    {id:'hybrid',title:'مسار هجين: دخل قائم مع تجربة مستقلة',preference:.30*stable+.18*autonomy+.18*clients+.18*brand+.16*uncertain,desc:'تحافظ على مصدر دخل أو وظيفة بالتوازي مع اختبار مسار مستقل تدريجيًا.'}
  ];
  const budgetValue={none:0,zero:0,low:1,medium:2,high:3}[p.budget];
  const budgetUnknown=budgetValue===undefined;
  const budget=budgetValue??0;
  const runway=p.runway||'unknown';
  const restrictedRoles=new Set(['nurse','psychologist','social_service']);
  const allowed=new Set(restrictedRoles.has(career.id)?(career.models||['employee','hybrid']):(career.models||prefs.map(x=>x.id)));
  const eligible=prefs.filter(m=>allowed.has(m.id));
  return eligible.map(m=>{
    const budgetFit=budgetUnknown?(m.id==='employee'?85:m.id==='hybrid'?85:m.id==='freelance'?75:m.id==='solo'?65:45):budget===0?(m.id==='employee'?100:m.id==='hybrid'?100:m.id==='freelance'?78:m.id==='solo'?70:35):budget===1?(m.id==='employee'?95:m.id==='hybrid'?95:m.id==='freelance'?90:m.id==='solo'?85:55):budget===2?85:90;
    const runwayFit=runway==='none'?(m.id==='employee'?100:m.id==='hybrid'?98:m.id==='freelance'?48:m.id==='solo'?55:25):runway==='short'?(m.id==='employee'?95:m.id==='hybrid'?100:m.id==='freelance'?65:m.id==='solo'?70:45):runway==='medium'?80:85;
    const assetFit=(p.tools||[]).includes('none')?(m.id==='employee'?95:m.id==='hybrid'?90:m.id==='freelance'?70:m.id==='solo'?65:35):(!(p.tools||[]).length?70:100);
    const hours=Number(p.hours||4); const timeFit=hours>=10?95:hours>=5?80:hours>=3?65:45;
    const feasibility=Math.round(.32*budgetFit+.28*runwayFit+.20*assetFit+.20*timeFit);
    return {...m,preferenceScore:Math.round((m.preference-1)/4*100),readiness:feasibility,overall:Math.round(.7*((m.preference-1)/4*100)+.3*feasibility)};
  }).sort((a,b)=>b.overall-a.overall);
}
function projectIdeas(career,models,p) {
  const topModels=models.slice(0,3).map(x=>x.id); const tools=new Set(p.tools||[]); const access=new Set(p.access||[]); const domains=new Set(p.domains||[]); const builder=career.builder||[];
  const budgetValue={none:0,zero:0,low:1,medium:2,high:3}[p.budget]; const budgetUnknown=budgetValue===undefined; const budget=budgetValue??0; const hours=Number(p.hours||4);
  const aliases={coffee:['food','hospitality','business'],food:['food','hospitality'],hospitality:['hospitality','food'],nature:['nature','agriculture','hospitality'],animals:['nature','health','community'],arts:['arts','hospitality','business'],business:['business','technology'],technology:['technology','business'],sports:['sports','technology','health'],education:['education','community'],health:['health','community'],engineering:['engineering','industry'],community:['community','education','health']};
  const requestedSectors=[...domains].flatMap(x=>aliases[x]||[x]);
  const fieldAliases={arts:['arts'],business:['business'],technology:['technology'],engineering:['engineering','industry'],health:['health'],education:['education'],science:['technology','health'],food:['food','hospitality'],hospitality:['hospitality'],other:[]};
  const fieldSectors=fieldAliases[p.field]||[];
  const valueSector={sustainability:['nature','agriculture','hospitality'],beauty:['arts','hospitality'],care:['health','community','education'],knowledge:['education','technology','business'],independence:['business','technology','arts'],culture:['arts','hospitality'],animals:['nature','health'],efficiency:['technology','business','industry']};
  const valueSectors=(p.values||[]).flatMap(x=>valueSector[x]||[]);
  const cityBoost={tourist:['hospitality','arts','food'],rural:['agriculture','food'],industrial:['engineering','industry','business'],large:['business','technology','arts','education','health'],small:['business','food','education','community'],unknown:[]}[p.cityType]||[];
  return IDEAS.map(idea=>{
    const domainFit=requestedSectors.length?(requestedSectors.includes(idea.sector)?100:35):(career.sector.includes(idea.sector)?85:45);
    const sector=cityBoost.length?(cityBoost.includes(idea.sector)?Math.max(domainFit,85):domainFit):domainFit;
    const valueFit=valueSectors.length?(valueSectors.includes(idea.sector)?100:40):55;
    const model=idea.models.some(x=>topModels.includes(x))?100:35;
    const tool=idea.tools.length?idea.tools.filter(x=>tools.has(x)).length/idea.tools.length*100:60;
    const accessFit=idea.access.length?Math.max(idea.access.filter(x=>access.has(x)).length/idea.access.length*100,access.size?0:35):60;
    const capital=budgetUnknown?(idea.budget===0?75:20):(budget>=idea.budget?100:Math.max(10,100-(idea.budget-budget)*38));
    const time=hours>=idea.hours?100:Math.max(20,100-(idea.hours-hours)*12);
    const maker=idea.builder.some(x=>builder.includes(x))?100:55;
    const fieldFit=fieldSectors.length?(fieldSectors.includes(idea.sector)?100:40):55;
    return {...idea,fit:Math.round(.17*sector+.17*model+.15*tool+.15*accessFit+.10*capital+.08*time+.07*maker+.05*valueFit+.06*fieldFit),fitParts:{sector,model,tool,access:accessFit,capital,time,maker,valueFit,fieldFit}};
  }).sort((a,b)=>b.fit-a.fit).slice(0,3);
}
function validateAnswers(a) {
  const expected=[...QUESTIONS,...TRACE,...FLOW,...COGNITIVE,...WORKSTYLE];
  const missing=expected.filter(q=>a[q.id]===undefined||a[q.id]===null||a[q.id]==='');
  if(missing.length) return {ok:false,missing:missing.length};
  for(const q of QUESTIONS.concat(FLOW,WORKSTYLE)) if(!Number.isInteger(Number(a[q.id]))||Number(a[q.id])<1||Number(a[q.id])>5) return {ok:false,invalid:q.id};
  for(const q of TRACE.concat(COGNITIVE)) if(!Number.isInteger(Number(a[q.id]))||Number(a[q.id])<0||Number(a[q.id])>=(q.options||[]).length) return {ok:false,invalid:q.id};
  return {ok:true};
}
function cognitiveSummary(a) {
  const domains={logic:[],numeric:[],verbal:[],spatial:[],mechanical:[]};
  for(const q of COGNITIVE) domains[q.domain].push(Number(a[q.id])===q.correct?1:0);
  const labels={logic:'الاستدلال المنطقي',numeric:'التعامل العددي',verbal:'فهم المعلومات والاستنتاج اللفظي',spatial:'التصور المكاني',mechanical:'فهم العلاقات الميكانيكية'};
  return Object.entries(domains).map(([k,v])=>({id:k,title:labels[k],correct:v.reduce((x,y)=>x+y,0),items:v.length}));
}
function safeProfile(p) {
  return {
    education:String(p.education||'unknown').slice(0,30), field:String(p.field||'none').slice(0,30),
    experience:String(p.experience||'0').slice(0,10), hours:Number(p.hours||4), budget:String(p.budget||'unknown').slice(0,20),
    location:String(p.location||'').slice(0,80), cityType:String(p.cityType||'unknown').slice(0,30), runway:String(p.runway||'unknown').slice(0,20),
    tools:Array.isArray(p.tools)?p.tools.filter(x=>typeof x==='string').slice(0,20):[],
    access:Array.isArray(p.access)?p.access.filter(x=>typeof x==='string').slice(0,30):[],
    domains:Array.isArray(p.domains)?p.domains.filter(x=>typeof x==='string').slice(0,20):[],
    values:Array.isArray(p.values)?p.values.filter(x=>typeof x==='string').slice(0,20):[],
    experienceTypes:Array.isArray(p.experienceTypes)?p.experienceTypes.filter(x=>typeof x==='string').slice(0,20):[]
  };
}
function scoreAssessment(body) {
  const answers=normalizeSubmittedAnswers(body.answers||{}); const valid=validateAnswers(answers); if(!valid.ok) return {error:'لم تكتمل كل الإجابات أو توجد إجابة خارج النطاق.',detail:valid};
  const profile=safeProfile(body.profile||{}); const scores=dimensionScores(answers); const trace=traceSignals(answers);
  const matches=CAREERS.map(c=>careerScore(c,scores,trace,answers,profile)).sort((a,b)=>b.score-a.score);
  const best=matches[0]; const models=workModels(answers,profile,best); const ideas=projectIdeas(best,models,profile); const cognition=cognitiveSummary(answers);
  const topDims=[...DIM].sort((a,b)=>scores[b]-scores[a]).slice(0,3);
  const dimensionNames={R:'عملي وتطبيقي',I:'تحليلي واستقصائي',A:'إبداعي',S:'اجتماعي وإنساني',E:'مبادر وتجاري',C:'تنظيمي ودقيق'};
  const strengths=topDims.map(d=>dimensionNames[d]);
  const expTypes=profile.experienceTypes;
  const experienceSignals=[];
  const known={built_brand:'بناء علامة أو منتج',built_website:'إنشاء موقع أو أداة رقمية',sold:'بيع منتج أو خدمة',managed_suppliers:'تنسيق موردين أو مقدمي خدمات',made_content:'إنشاء محتوى أو تصميم',analyzed:'تحليل بيانات أو مشكلات',taught:'تعليم أو تدريب',repaired:'إصلاح أو تركيب',cared:'رعاية أو خدمة أشخاص',managed_ops:'تنظيم عمليات أو طلبات'};
  for(const x of expTypes) if(known[x]) experienceSignals.push(known[x]);
  const careerMeta={tasks:best.tasks,friction:best.friction,source:best.url||null,sourceType:best.custom?'ملف تركيبي استكشافي للموقع':'مرجع مهني O*NET'};
  let firstStep='ابدأ بتجربة صغيرة تحاكي مهمة يومية في هذا المجال، وراقب هل تستمتع بالتنفيذ نفسه أم فقط بفكرة المهنة.';
  if(profile.budget==='zero'||profile.budget==='none') firstStep='لا تبدأ بشراء معدات أو مخزون. ابدأ بمقابلات مجانية ونموذج رقمي أو تجربة مراقبة/تعلم، واختبر وجود عميل قبل الالتزام بأي تكلفة.';
  if((profile.tools||[]).includes('none')) firstStep='بما أنك لا تملك أدوات أو أصول حاليًا، ابدأ بملاحظة العمل ومقابلات أصحاب الخبرة وتجربة تعلم باستخدام موارد مجانية أو مستعارة. لا تفترض أن عليك شراء معدات الآن.';
  else if(!(profile.tools||[]).length) firstStep+=' لم تسجل أدوات أو أصولًا في الإجابات؛ راجعها قبل اعتبارها غير متاحة، ويمكنك البدء بمقابلات وملاحظة العمل دون شراء معدات.';
  if(profile.tools.includes('computer')||profile.tools.includes('phone')) firstStep+=' استخدم الأدوات المتاحة بالفعل لبناء عينة أو توثيق تجربة.';
  if(profile.access.includes('production')&&profile.access.includes('packaging')) firstStep+=' لديك وصول معلن إلى إنتاج/تجهيز وتعبئة خارجية؛ قارن عروضًا مكتوبة وشروط الحد الأدنى والجودة قبل اعتماد مورد.';
  if(profile.field&&profile.field!=='none'&&profile.field!=='other') firstStep+=' مجالك الحالي قد يوفر نقطة انطلاق أو معرفة قابلة للنقل، لكن لا نفترض أنه المجال الذي تستمتع به أكثر.';
  if(profile.location) firstStep+=` ابدأ اختبار الفكرة بمحادثات مع أشخاص من محيطك في ${profile.location}، من غير افتراض مسبق بوجود طلب أو مورد مناسب هناك.`;
  if(Number(profile.experience||0)>=3) firstStep+=' خبرتك السابقة تتيح لك اختبار مستوى أكثر تقدمًا، من غير افتراض أنك لازم تستمر في نفس المهنة.';
  const educationLabels={none:'لم تسجل مؤهلًا بعد الإعدادية',secondary:'ثانوي',diploma:'دبلوم أو معهد',bachelor:'بكالوريوس أو ليسانس',postgrad:'دراسات عليا',professional:'تدريب أو شهادات مهنية'};
  const regulated={
    nurse:{fields:['health'],title:'التمريض'},
    psychologist:{fields:['health'],title:'الممارسة النفسية'},
    architect:{fields:['engineering'],title:'الهندسة المعمارية'},
    mechanical:{fields:['engineering'],title:'الهندسة الميكانيكية'},
    electrician:{fields:['engineering'],title:'الأعمال الكهربائية'},
    auto_diagnostic:{fields:['engineering'],title:'تشخيص وإصلاح السيارات'}
  };
  let qualificationMessage='';
  if(regulated[best.id]) {
    const requirement=regulated[best.id];
    const relatedField=requirement.fields.includes(profile.field);
    const furtherStudy=['diploma','bachelor','postgrad','professional'].includes(profile.education);
    qualificationMessage = relatedField && furtherStudy
      ? `ذكرت خلفية تعليمية أو مهنية في مجال قريب من ${requirement.title}. ده قد يساعدك في تحديد نقطة البداية، لكنه لا يثبت استيفاء شروط المزاولة أو الترخيص؛ تحقق من المتطلبات المصرية الحالية قبل تقديم الخدمة.`
      : `الترشيح هنا يعكس اهتمامًا بطبيعة مهام ${requirement.title}، وليس إثباتًا للأهلية. بياناتك الحالية لا تكفي لتأكيد المؤهل أو الترخيص المطلوب؛ ابدأ بالتحقق من مسار الدراسة والتدريب والاشتراطات المصرية.`;
  } else if(['none','secondary'].includes(profile.education)) {
    qualificationMessage='مستواك التعليمي الحالي لا يلغي ملاءمتك لهذا المجال. ابدأ بتجربة المهام الأساسية، ثم حدد هل تحتاج مؤهلًا رسميًا أو تدريبًا أو ملف أعمال للوصول للمستوى الذي تريده.';
  } else if(profile.education==='professional') {
    qualificationMessage='التدريب والشهادات المهنية التي ذكرتها قد تكون نقطة بداية مفيدة. قارنها بمتطلبات الدور الفعلية، وحدد ما ينقصك من تطبيق عملي أو اعتماد رسمي.';
  } else {
    qualificationMessage='مؤهلك الحالي قد يفتح لك بعض طرق الدخول، لكنه لا يحدد وحده ملاءمتك للمهنة. راجع متطلبات الوظائف الفعلية وحدد الفجوة بين مؤهلك والمهام المطلوبة.';
  }
  return {
    identity:{id:best.id,title:best.title,score:best.score,why:`ظهر هذا الترشيح لأن اهتماماتك وسلوكك في المواقف اليومية وإشارات اندماجك تقاطعت مع طبيعة المهام في هذا الدور. أعلى ميول ظهرت: ${strengths.join('، ')}.`,strengths,subscores:best.subscores,tasks:careerMeta.tasks,friction:careerMeta.friction,referenceType:careerMeta.sourceType,source:careerMeta.source},
    alternatives:matches.slice(1,4).map(c=>({id:c.id,title:c.title,score:c.score,tasks:c.tasks.slice(0,2),sourceType:c.custom?'تركيب استكشافي':'O*NET'})),
    workModels:models.slice(0,4).map(m=>({id:m.id,title:m.title,preferenceScore:m.preferenceScore,readiness:m.readiness,overall:m.overall,description:m.desc})),
    ideas:ideas.map(i=>({id:i.id,title:i.title,fit:i.fit,customer:i.customer,offer:i.offer,test:i.test,capital:i.budget,model:i.models})),
    cognitive:{label:'مؤشرات من تحديات قصيرة غير مقننة',domains:cognition,notice:'هذه نتائجك في مجموعة أسئلة تجريبية قصيرة فقط. لا تمثل معدل ذكاء أو ترتيبًا بين الناس أو حكمًا على قدرتك المستقبلية.'},
    context:{budget:profile.budget,tools:profile.tools,accessCount:profile.access.length,location:profile.location,cityType:profile.cityType,education:educationLabels[profile.education]||'غير محدد',field:profile.field,experience:profile.experience,hours:profile.hours,runway:profile.runway,values:profile.values,experienceSignals,firstStep,qualificationMessage},
    methodology:{questionCount:QUESTIONS.length+TRACE.length+FLOW.length+COGNITIVE.length+WORKSTYLE.length,careerCount:CAREERS.length,ideaCount:IDEAS.length,scoreLabel:'مؤشر تقارب استكشافي وليس احتمال نجاح أو درجة سيكومترية مقننة.'}
  };
}

module.exports = async function handler(req,res) {
  headers(res);
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  if(!sameOrigin(req)) return send(res,403,{error:'الطلب غير مسموح من مصدر مختلف.'});
  const body = req.method === 'POST' ? safeJsonBody(req) : null;
  if (req.method === 'POST' && body?.action === 'start') {
    const issued = issueSessionToken();
    if (!issued) return send(res,503,{error:'إعداد حماية الاختبار غير مكتمل. أضف ASSESSMENT_SECRET في إعدادات Vercel.'});
    return send(res,200,{sessionToken:issued.token,expiresAt:issued.expiresAt});
  }
  if (!getSessionSecret()) return send(res,503,{error:'إعداد حماية الاختبار غير مكتمل. أضف ASSESSMENT_SECRET في إعدادات Vercel.'});
  if (!verifySessionToken(getRequestToken(req,body))) return send(res,401,{error:'جلسة الاختبار غير صالحة أو انتهت. ابدأ جلسة جديدة.'});
  if(req.method==='GET') {
    const action=String(req.query?.action||'');
    if(action!=='questions') return send(res,400,{error:'طلب غير معروف.'});
    const section=String(req.query?.section||''); const page=Number(req.query?.page||0);
    if(!Number.isInteger(page)) return send(res,400,{error:'رقم الصفحة غير صحيح.'});
    const result=pageQuestions(section,page); if(!result) return send(res,404,{error:'مجموعة الأسئلة غير موجودة.'});
    return send(res,200,result);
  }
  if(req.method==='POST') {
    if(!body||body.action!=='score') return send(res,400,{error:'بيانات الطلب غير صحيحة.'});
    const serialized=JSON.stringify(body); if(serialized.length>70000) return send(res,413,{error:'حجم البيانات أكبر من المسموح.'});
    const result=scoreAssessment(body);
    if(result.error) return send(res,422,result);
    return send(res,200,result);
  }
  res.setHeader('Allow','GET, POST'); return send(res,405,{error:'طريقة الطلب غير مدعومة.'});
};

// Export test helpers only in local Node test execution. Vercel does not expose these as routes.
module.exports._test={QUESTIONS,TRACE,FLOW,WORKSTYLE,COGNITIVE,CAREERS,IDEAS,scoreAssessment,pageQuestions,REFERENCES,publicQuestionId};

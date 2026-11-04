(() => {
  'use strict';
  const API = '/api/assessment';
  const STORE = 'ebda2_v5_answers';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const stages = [
    {id:'ria',title:'اختيارات في مواقف مختلفة',kicker:'المجموعة الأولى',help:'اختار الدرجة الأقرب لتصرفك الطبيعي. مفيش إجابة مثالية، وخد وقتك.',pages:4,back:'ابدأ',next:'نكمل'},
    {id:'trace',title:'تفاصيل من يومك',kicker:'المجموعة التانية',help:'اختار أقرب تصرف ليك في الموقف. مفيش اختيار أفضل من التاني.',pages:2,back:'الصفحة السابقة',next:'نكمل'},
    {id:'flow',title:'مواقف بتقابلك',kicker:'المجموعة التالتة',help:'اختار درجة قرب كل موقف من تجربتك. فكر في اللي بيحصل معاك فعلًا.',pages:1,back:'الصفحة السابقة',next:'نكمل'},
    {id:'cognitive',title:'تفاصيل ومعلومات',kicker:'المجموعة الرابعة',help:'اقرأ الموقف واختار الإجابة الأدق بناءً على المعلومات اللي قدامك.',pages:2,back:'الصفحة السابقة',next:'نكمل'},
    {id:'work',title:'ترتيب خطواتك',kicker:'المجموعة الخامسة',help:'اختار درجة قرب كل موقف من الطريقة اللي ترتاح لها غالبًا.',pages:1,back:'الصفحة السابقة',next:'الواقع العملي'}
  ];
  const state = loadState();
  let stageIndex = Number.isInteger(state.stageIndex) ? Math.min(4,Math.max(0,state.stageIndex)) : 0;
  let pageIndex = Number.isInteger(state.pageIndex) ? Math.min(3,Math.max(0,state.pageIndex)) : 0;
  let activeItems = [];
  let busy = false;

  function loadState() {
    const fallback = {answers:{},profile:{},stageIndex:0,pageIndex:0,sessionToken:'',sessionExpiresAt:0};
    try { const saved = JSON.parse(localStorage.getItem(STORE)||'null'); return saved && typeof saved==='object' ? {...fallback,...saved,answers:{...fallback.answers,...saved.answers},profile:{...fallback.profile,...saved.profile}} : fallback; }
    catch (_) { return fallback; }
  }
  function saveState() {
    state.stageIndex=stageIndex; state.pageIndex=pageIndex;
    try { localStorage.setItem(STORE,JSON.stringify(state)); } catch (_) { /* Storage is optional; the current session still works. */ }
  }
  function checkedValues(name) { return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(x=>x.value); }
  function setChecks(name, values=[]) { document.querySelectorAll(`input[name="${name}"]`).forEach(el=>el.checked=values.includes(el.value)); }
  function profileFromForm() {
    return {
      education:$('p-education').value, field:$('p-field').value, experience:$('p-experience').value,
      hours:$('p-hours').value, budget:$('p-budget').value, location:$('p-location').value.trim(),
      cityType:$('p-city-type').value, runway:$('p-runway').value,
      tools:checkedValues('tool'),access:checkedValues('access'),domains:checkedValues('domain'),
      values:checkedValues('value'),experienceTypes:checkedValues('experienceType')
    };
  }
  function fillProfile() {
    const p=state.profile||{};
    for (const [key,id] of Object.entries({education:'p-education',field:'p-field',experience:'p-experience',hours:'p-hours',budget:'p-budget',location:'p-location',cityType:'p-city-type',runway:'p-runway'})) if(p[key]!==undefined) $(id).value=String(p[key]);
    for (const [name,key] of [['tool','tools'],['access','access'],['domain','domains'],['value','values'],['experienceType','experienceTypes']]) setChecks(name,p[key]||[]);
    if(p.name) $('p-name').value=p.name;
  }
  function show(section) {
    ['intro','assessment','profile','results'].forEach(id=>$(id).classList.toggle('hidden',id!==section));
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function sourceMarkup(ref) {
    if(!ref) return '';
    const copyText=[ref.label,ref.full,ref.institution,ref.tool?`الأداة المرجعية: ${ref.tool}`:'',ref.url].filter(Boolean).join('\n');
    return `<details class="source-disclosure"><summary>${esc(ref.label)}</summary><div class="source-body"><p class="source-full">${esc(ref.full)}</p><p><strong>الجهة أو المرجع:</strong> ${esc(ref.institution)}</p>${ref.tool?`<p><strong>الأداة المرجعية:</strong> ${esc(ref.tool)}</p>`:''}<p>${esc(ref.note)}</p><a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">افتح المرجع الأصلي</a><button type="button" class="copy-source" data-copy="${esc(copyText)}">نسخ المرجع كاملًا</button></div></details>`;
  }
  function ratingMarkup(q) {
    const selected=state.answers[q.id]===undefined?0:Number(state.answers[q.id]);
    return `<div class="rating" role="group" aria-label="اختيار درجة الإجابة">${q.scale.map((label,i)=>`<button type="button" class="answer-btn ${selected===i+1?'selected':''}" data-qid="${esc(q.id)}" data-answer="${i+1}" aria-pressed="${selected===i+1}"><strong>${i+1}</strong><span>${esc(label)}</span></button>`).join('')}</div>`;
  }
  function choiceMarkup(q) {
    const selected=state.answers[q.id]===undefined?-1:Number(state.answers[q.id]);
    return `<div class="choice-grid" role="group" aria-label="اختار إجابة">${q.options.map((option,i)=>`<button type="button" class="choice-option answer-btn ${selected===i?'selected':''}" data-qid="${esc(q.id)}" data-answer="${i}" aria-pressed="${selected===i}">${esc(option)}</button>`).join('')}</div>`;
  }
  function renderQuestion(q,index) {
    return `<article class="question" id="question-${esc(q.id)}"><p class="question-title"><span class="question-index">${index+1}.</span>${esc(q.text)}</p>${q.kind==='rating'?ratingMarkup(q):choiceMarkup(q)}${sourceMarkup(q.reference)}</article>`;
  }
  async function startSession() {
    const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},credentials:'same-origin',cache:'no-store',body:JSON.stringify({action:'start'})});
    const payload=await response.json();
    if(!response.ok) throw new Error(payload.error||'تعذر بدء جلسة الاختبار.');
    state.sessionToken=payload.sessionToken; state.sessionExpiresAt=payload.expiresAt; saveState();
  }
  async function ensureSession(force=false) {
    if(force || !state.sessionToken || !state.sessionExpiresAt || Date.now()>state.sessionExpiresAt-60000) await startSession();
  }
  async function fetchPage(stage,page) {
    await ensureSession();
    const request=()=>fetch(`${API}?action=questions&section=${encodeURIComponent(stage)}&page=${page}`,{method:'GET',headers:{'Accept':'application/json','X-Assessment-Token':state.sessionToken},cache:'no-store',credentials:'same-origin'});
    let response=await request();
    if(response.status===401){await ensureSession(true);response=await request();}
    if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.error||`تعذر تحميل الأسئلة (${response.status}).`);}
    return response.json();
  }
  async function renderStage() {
    const stage=stages[stageIndex]; show('assessment'); busy=true; $('next-btn').disabled=true; $('back-btn').disabled=true;
    $('stage-kicker').textContent=stage.kicker; $('stage-title').textContent=stage.title; $('stage-help').textContent=stage.help;
    $('step-counter').textContent=`${stageIndex+1} من ${stages.length} · ${pageIndex+1}/${stage.pages}`;
    const completed=stageIndex/stages.length+(pageIndex/stage.pages)/stages.length;
    $('progress-fill').style.width=`${Math.min(100,Math.round(completed*100))}%`;
    $('question-list').innerHTML='<div class="loading-card">بنجهز المواقف…</div>'; $('question-error').hidden=true;
    try {
      const payload=await fetchPage(stage.id,pageIndex); activeItems=payload.items;
      $('question-list').innerHTML=activeItems.map(renderQuestion).join('');
      $('back-btn').textContent=pageIndex>0?'الصفحة السابقة':(stageIndex===0?'العودة للبداية':stages[stageIndex-1].back);
      const isLast=stageIndex===stages.length-1&&pageIndex===stage.pages-1;
      $('next-btn').textContent=pageIndex<stage.pages-1?'الصفحة التالية':(isLast?'إلى بياناتك':stage.next);
      $('next-btn').disabled=false; $('back-btn').disabled=false;
      busy=false;
    } catch(error) {
      $('question-list').innerHTML=''; $('question-error').textContent=error.message+' تأكد من نشر مجلد api مع الموقع، ثم أعد المحاولة.'; $('question-error').hidden=false;
      $('next-btn').disabled=true; $('back-btn').disabled=false; busy=false;
    }
  }
  function allPageAnswered() { return activeItems.every(q=>state.answers[q.id]!==undefined); }
  function markMissing() {
    activeItems.forEach(q=>{const item=$(`question-${q.id}`); if(item)item.classList.toggle('missing',state.answers[q.id]===undefined);});
    const first=activeItems.find(q=>state.answers[q.id]===undefined); if(first){$(`question-${first.id}`).scrollIntoView({behavior:'smooth',block:'center'});}
  }
  function goNext() {
    if(!allPageAnswered()){markMissing();$('question-error').textContent='جاوب على المواقف الظاهرة قبل ما نكمل.';$('question-error').hidden=false;return;}
    if(pageIndex<stages[stageIndex].pages-1){pageIndex++;saveState();renderStage();return;}
    if(stageIndex<stages.length-1){stageIndex++;pageIndex=0;saveState();renderStage();return;}
    fillProfile();show('profile');saveState();
  }
  function goBack() {
    if(pageIndex>0){pageIndex--;saveState();renderStage();return;}
    if(stageIndex>0){stageIndex--;pageIndex=stages[stageIndex].pages-1;saveState();renderStage();return;}
    show('intro');
  }
  function normalizeNone(name) {
    const group=[...document.querySelectorAll(`input[name="${name}"]`)];
    const none=group.find(x=>x.value==='none');
    if(!none) return;
    if(none.checked) group.forEach(x=>{if(x!==none)x.checked=false;});
    else if(group.some(x=>x!==none&&x.checked)) none.checked=false;
  }
  function resultMarkup(data) {
    const identity=data.identity;
    const alternatives=data.alternatives.map((a,i)=>`<div class="alternative"><strong>${i+2}. ${esc(a.title)}</strong><p>${esc(a.tasks.join('، '))}</p><span class="fine-print">${esc(a.sourceType)}</span></div>`).join('');
    const models=data.workModels.map((m,i)=>`<article class="model-card"><div class="model-card-head"><strong>${i+1}. ${esc(m.title)}</strong><span class="mini-score">${m.preferenceScore}/100</span></div><p>${esc(m.description)}</p><div class="model-metrics"><span>تفضيلك النسبي: <b>${m.preferenceScore}/100</b></span><span>قابلية البدء الآن: <b>${m.readiness}/100</b></span></div></article>`).join('');
    const ideas=data.ideas.map((idea,i)=>`<article class="idea-card"><div class="idea-head"><span class="idea-index">${i+1}</span><strong>${esc(idea.title)}</strong><span class="mini-score">مواءمة أولية ${idea.fit}/100</span></div><p><strong>لمن؟</strong> ${esc(idea.customer)}</p><p><strong>العرض:</strong> ${esc(idea.offer)}</p><div class="idea-test"><strong>اختبرها من غير التزام كبير:</strong> ${esc(idea.test)}</div></article>`).join('');
    const cognition=data.cognitive.domains.map(d=>`<div class="cognitive-row"><span>${esc(d.title)}</span><strong>${d.correct} من ${d.items}</strong></div>`).join('');
    const exp=data.context.experienceSignals.length?`<p>الخبرات التي ذكرتها: ${data.context.experienceSignals.map(esc).join('، ')}.</p>`:'';
    const source=identity.source?`<p class="fine-print">المرجع المهني: <a href="${esc(identity.source)}" target="_blank" rel="noopener noreferrer">O*NET OnLine</a></p>`:`<p class="fine-print">هذه هوية تركيبية استكشافية خاصة بالموقع، وليست مسمى مهنيًا رسميًا في O*NET.</p>`;
    return `<div class="result-top"><div><span class="result-tag">الهوية المهنية المرشحة</span><h1 class="result-name">${esc(identity.title)}</h1><p class="result-intro">${esc(identity.why)}</p></div></div>
      <section class="result-section"><h3>ليه الترشيح ده ظهر؟</h3><div class="evidence"><div class="evidence-card"><strong>أقوى ميول ظهرت</strong><p>${identity.strengths.map(esc).join(' · ')}</p></div><div class="evidence-card"><strong>خبرات سابقة ذكرتها</strong>${exp||'<p>لم تسجل خبرة محددة؛ ده لا يمنع ظهور أي مسار.</p>'}</div></div>${source}<p class="fine-print">مؤشر المطابقة استكشافي وليس احتمال نجاح أو تشخيصًا نفسيًا أو إثباتًا للمهارة.</p></section>
      <section class="result-section"><h3>طبيعة الشغل اليومية</h3><ul class="task-list">${identity.tasks.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="friction-box"><strong>الجزء اللي ممكن يكون مرهق:</strong> ${esc(identity.friction)}</div></section>
      <section class="result-section"><h3>طريقة العمل الأقرب لك</h3><p class="fine-print">فصلنا بين تفضيلك لطريقة العمل وبين قدرتك على البدء بها الآن. الدرجة الأولى عن ميلك، والثانية عن ظروفك الحالية، وليست توقعًا للنجاح.</p><div class="model-grid">${models}</div></section>
      <section class="result-section"><h3>أفكار تستحق الاختبار بناءً على ميولك ومواردك</h3><p class="fine-print">دي فرضيات بداية وليست فرصًا سوقية مثبتة أو دراسة جدوى. ترتيبها يتأثر بالمجال والوقت والميزانية والأدوات والخدمات المتاحة.</p><div class="idea-grid">${ideas}</div></section>
      <section class="result-section"><h3>أول خطوة مناسبة لظروفك</h3><div class="path-card"><p>${esc(data.context.firstStep)}</p>${data.context.location?`<p>المكان الذي أدخلته: ${esc(data.context.location)}. لم نتحقق آليًا من الطلب أو الموردين أو الأسعار في هذه المنطقة.</p>`:''}</div></section>
      <section class="result-section"><h3>مؤشرات من تحديات التفكير</h3><p class="fine-print">دي إجابات على مواقف قصيرة، مش مقياس ذكاء أو IQ. سؤالان أو أكثر لكل مجال لا يكفوا للحكم على قدرة ثابتة أو مقارنة نفسك بالآخرين.</p><div class="cognitive-grid">${cognition}</div><p class="fine-print">${esc(data.cognitive.notice)}</p></section>
      <section class="result-section"><h3>كيف نستخدم النتيجة؟</h3><p class="fine-print">الترشيح بداية للنقاش والتجربة. اختبر مهمة فعلية من المجال، لاحظ ما استمتعت به وما استنزفك، ثم راجع المسار. المهن المنظمة أو الصحية أو الهندسية قد تحتاج تعليمًا أو ترخيصًا رسميًا حسب القواعد المحلية.</p></section>
      <div class="actions result-actions"><button class="btn secondary" id="edit-profile" type="button">راجع البيانات</button><button class="btn secondary" id="print-result" type="button">اطبع النتيجة</button><button class="btn primary" id="restart-result" type="button">ابدأ من جديد</button></div>`;
  }
  async function submitResults() {
    if(busy)return; busy=true; const button=$('show-results'); button.disabled=true; button.textContent='بنحلل إجاباتك…';
    const profile=profileFromForm(); profile.name=$('p-name').value.trim(); state.profile=profile; saveState();
    try {
      const payload={action:'score',answers:state.answers,profile};
      await ensureSession();
      const request=()=>fetch(API,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json','X-Assessment-Token':state.sessionToken},credentials:'same-origin',cache:'no-store',body:JSON.stringify(payload)});
      let response=await request();
      if(response.status===401){await ensureSession(true);response=await request();}
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||'تعذر حساب النتيجة.');
      $('result-mount').innerHTML=resultMarkup(data);
      $('results').classList.remove('hidden'); $('intro').classList.add('hidden'); $('assessment').classList.add('hidden'); $('profile').classList.add('hidden');
      if(profile.name){const h=$('result-mount').querySelector('.result-top');h.insertAdjacentHTML('afterbegin',`<p class="eyebrow">${esc(profile.name)}، دي نقطة البداية المقترحة ليك</p>`);}
      $('edit-profile').addEventListener('click',()=>{fillProfile();show('profile');});
      $('print-result').addEventListener('click',()=>window.print());
      $('restart-result').addEventListener('click',resetAll);
      window.scrollTo({top:0,behavior:'smooth'});
    } catch(error) {
      $('profile-error').textContent=error.message+' جرّب مرة تانية. لو استمرت المشكلة، تأكد إن مجلد api منشور مع الموقع.'; $('profile-error').hidden=false;
    } finally {busy=false;button.disabled=false;button.textContent='اكتشف هويتي وطريق عملي';}
  }
  function resetAll() { if(!window.confirm('تمسح كل الإجابات المحفوظة وتبدأ من الأول؟'))return; localStorage.removeItem(STORE);location.reload(); }

  document.addEventListener('click',async event=>{
    const answer=event.target.closest('.answer-btn');
    if(answer){const id=answer.dataset.qid;const value=Number(answer.dataset.answer);state.answers[id]=value;saveState();const card=answer.closest('.question');card?.classList.remove('missing');card?.querySelectorAll('.answer-btn').forEach(btn=>{const selected=btn===answer;btn.classList.toggle('selected',selected);btn.setAttribute('aria-pressed',String(selected));});return;}
    const copy=event.target.closest('.copy-source');
    if(copy){try{await navigator.clipboard.writeText(copy.dataset.copy||'');const old=copy.textContent;copy.textContent='اتنسخ';setTimeout(()=>copy.textContent=old,1300);}catch(_){copy.textContent='انسخ المرجع من النص';}return;}
  });
  $('start-btn').addEventListener('click',()=>{stageIndex=0;pageIndex=0;saveState();renderStage();});
  $('resume-btn').addEventListener('click',()=>{if(Object.keys(state.answers).length){if(state.stageIndex>=stages.length){fillProfile();show('profile');}else{stageIndex=state.stageIndex||0;pageIndex=state.pageIndex||0;renderStage();}}else renderStage();});
  $('next-btn').addEventListener('click',goNext); $('back-btn').addEventListener('click',goBack);
  $('profile-back').addEventListener('click',()=>{stageIndex=stages.length-1;pageIndex=stages[stageIndex].pages-1;saveState();renderStage();});
  $('show-results').addEventListener('click',submitResults); $('reset-btn').addEventListener('click',resetAll);
  document.querySelectorAll('#profile input, #profile select').forEach(el=>{
    el.addEventListener('change',()=>{state.profile=profileFromForm();state.profile.name=$('p-name').value.trim();saveState();});
    if(el.type==='text') el.addEventListener('input',()=>{state.profile=profileFromForm();state.profile.name=$('p-name').value.trim();saveState();});
  });
  document.querySelectorAll('input[name="tool"]').forEach(el=>el.addEventListener('change',()=>{normalizeNone('tool');state.profile=profileFromForm();saveState();}));
  document.querySelectorAll('input[name="access"]').forEach(el=>el.addEventListener('change',()=>{normalizeNone('access');state.profile=profileFromForm();saveState();}));
  $('resume-btn').hidden=Object.keys(state.answers).length===0;
})();

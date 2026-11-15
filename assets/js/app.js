(function(){
  "use strict";
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  var smooth=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
  /* uniform random int in [0,n) from the browser's secure RNG (rejection sampling avoids modulo bias) */
  function rnd(n){var a=new Uint32Array(1),lim=Math.floor(4294967296/n)*n;
    do{crypto.getRandomValues(a);}while(a[0]>=lim);return a[0]%n;}
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=rnd(i+1),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  /* make a non-button element keyboard-operable */
  function activate(el,fn){el.setAttribute('tabindex','0');el.setAttribute('role','button');
    el.addEventListener('click',fn);
    el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fn(e);}});}

  /* ================= NAV ================= */
  var navmenu=document.getElementById('navmenu');
  document.querySelectorAll('#navmenu .nav-link').forEach(function(a){a.addEventListener('click',function(){
    if(navmenu.classList.contains('show'))bootstrap.Collapse.getOrCreateInstance(navmenu).hide();});});

  /* ================= SPOT THE PHISH ================= */
  /* meta row: [label, value, flag|"decoy"|null, tip]. body part: {t,flag,tip} flag = real red flag, {t,decoy} = harmless text. */
  var MAILS=[
    {meta:[["From","IT Help Desk <support@micros0ft-helpdesk.com>","sender","The display name says “IT Help Desk,” but the real domain <b>micros0ft-helpdesk.com</b> uses a zero for the “o” and isn't Microsoft."],
           ["To","undisclosed-recipients","decoy"],
           ["Subject","⚠ URGENT: Your mailbox will be deactivated","subject","Urgent, fear-based subject lines push you to act before thinking."]],
     body:[
       {t:"Dear User,",flag:"greeting",tip:"A generic greeting (“Dear User”) — a company you use would normally address you by name."},
       {t:"We detected unusual activity on your account. Your mailbox will be "},
       {t:"permanently deactivated within 24 hours",flag:"urgency",tip:"A countdown threat creates false urgency so you panic and comply."},
       {t:" unless you verify your identity now."},{t:"BREAK"},{t:"Please "},
       {t:"click here to confirm your password (http://micros0ft-verify.ru/login)",flag:"link",tip:"It asks you to “confirm your password” — legitimate IT never does this — and the real link goes to <b>micros0ft-verify.ru</b>, not Microsoft."},
       {t:" and keep your access active."},{t:"BREAK"},{t:"Review the attached "},
       {t:"MailboxVerify.html",flag:"attach",tip:"An unexpected .html attachment often opens a fake login page that steals credentials."},
       {t:" for details."},{t:"BREAK"},{t:"Thank you for your cooperation.",decoy:true},{t:"BREAK"},{t:"Best regards, The IT Team",decoy:true}
     ],total:6},
    {meta:[["From","Daniel Osei <ceo.northwind@gmail.com>","sender","The “CEO” is emailing from a personal <b>gmail.com</b> address, not the company domain — a classic impersonation tell."],
           ["To","You","decoy"],
           ["Subject","Quick favor","subject","A vague, casual subject (“Quick favor”) lowers your guard in CEO-fraud scams."]],
     body:[
       {t:"Hi, are you at your desk? I'm going into back-to-back meetings "},
       {t:"and need this done urgently",flag:"urgency",tip:"Urgency plus “I'm unreachable” discourages you from verifying by phone or in person."},
       {t:"."},{t:"BREAK"},{t:"I need you to buy "},
       {t:"5 × $200 gift cards",flag:"giftcard",tip:"Requests for gift cards are almost always fraud — no real executive buys them this way."},
       {t:" for a client. Send me the codes once done."},{t:"BREAK"},{t:"Please "},
       {t:"keep this between us",flag:"secrecy",tip:"“Keep this confidential” stops you checking with a colleague who'd spot the scam."},
       {t:" for now — I'll reimburse you later."},{t:"BREAK"},{t:"Thanks, Daniel",decoy:true},{t:"BREAK"},{t:"Sent from my iPhone",decoy:true}
     ],total:5}
  ];
  var LABELS={sender:"Look-alike / wrong sender",subject:"Fear-based subject",greeting:"Generic greeting",
    urgency:"False urgency / threat",link:"Credential-stealing link",attach:"Unexpected attachment",
    giftcard:"Gift-card request",secrecy:"Demand for secrecy"};
  var cur=0,foundSet={};
  var emailPane=document.getElementById('emailPane'),findingsEl=document.getElementById('findings'),
      cFound=document.getElementById('cFound'),cTotal=document.getElementById('cTotal'),
      cBar=document.getElementById('cBar'),simMsg=document.getElementById('simMsg'),
      reportBtn=document.getElementById('reportBtn'),reportMsg=document.getElementById('reportMsg');

  function tips(m){var out=[],seen={};
    m.meta.forEach(function(r){if(r[2]&&r[2]!=='decoy'&&!seen[r[2]]){seen[r[2]]=1;out.push({f:r[2],tip:r[3]});}});
    m.body.forEach(function(s){if(s.flag&&!seen[s.flag]){seen[s.flag]=1;out.push({f:s.flag,tip:s.tip});}});
    return out;}
  function tipFor(f){var m=MAILS[cur],r='';m.meta.forEach(function(x){if(x[2]===f)r=x[3];});m.body.forEach(function(s){if(s.flag===f)r=s.tip;});return r;}

  /* every clickable part looks identical (class "pick") so the answers aren't given away by styling */
  function renderMail(){
    var m=MAILS[cur];foundSet={};
    var h='<div class="email-meta border-bottom pb-2 mb-3">';
    m.meta.forEach(function(r){
      var v=r[2]==='decoy'?'<span class="pick" data-decoy="1">'+escapeHtml(r[1])+'</span>'
        :r[2]?'<span class="pick" data-flag="'+r[2]+'">'+escapeHtml(r[1])+'</span>':escapeHtml(r[1]);
      h+='<div class="mb-1"><span class="k">'+r[0]+'</span> '+v+'</div>';});
    h+='</div><div class="email-body"><p>';
    m.body.forEach(function(s){
      if(s.t==='BREAK'){h+='</p><p>';return;}
      if(s.flag)h+='<span class="pick" data-flag="'+s.flag+'">'+escapeHtml(s.t)+'</span>';
      else if(s.decoy)h+='<span class="pick" data-decoy="1">'+escapeHtml(s.t)+'</span>';
      else h+=escapeHtml(s.t);});
    h+='</p></div>';
    emailPane.innerHTML=h;
    cTotal.textContent=m.total;
    findingsEl.innerHTML='';
    tips(m).forEach(function(o){var li=document.createElement('li');
      li.className='list-group-item finding';li.id='find-'+o.f;li.innerHTML='<span class="text-muted">❓ Red flag not found yet</span>';findingsEl.appendChild(li);});
    update();simMsg.classList.add('d-none');bind();resetReport();
  }
  function bind(){
    emailPane.querySelectorAll('.pick').forEach(function(el){
      activate(el,function(){
        var f=el.getAttribute('data-flag');
        if(!f){if(Object.keys(foundSet).length<MAILS[cur].total)flash("That part is harmless — a normal piece of an email. Keep looking for the real red flags.");return;}
        emailPane.querySelectorAll('[data-flag="'+f+'"]').forEach(function(n){n.classList.add('found');});
        if(!foundSet[f]){foundSet[f]=1;mark(f);update();}});});
  }
  function mark(f){var li=document.getElementById('find-'+f);if(li){li.classList.add('hit');li.innerHTML='<b>✅ '+LABELS[f]+'</b><br><span class="text-muted">'+tipFor(f)+'</span>';}}
  function update(){var n=Object.keys(foundSet).length,t=MAILS[cur].total;
    cFound.textContent=n;var pct=Math.round(n/t*100);cBar.style.width=pct+'%';cBar.parentNode.setAttribute('aria-valuenow',pct);
    if(n>=t)flash("🎯 Nailed it — you found every red flag. Real inboxes won't highlight them for you, so this scanning habit is what keeps you safe.");}
  function flash(t){simMsg.innerHTML=t;simMsg.classList.remove('d-none');}

  document.getElementById('revealBtn').addEventListener('click',function(){
    emailPane.querySelectorAll('[data-flag]').forEach(function(n){n.classList.add('found');});
    tips(MAILS[cur]).forEach(function(o){if(!foundSet[o.f]){foundSet[o.f]=1;mark(o.f);}});
    update();flash("Answers revealed. Every item marked ✓ is a warning sign — spotting any one is reason enough to stop and report.");});
  document.getElementById('resetBtn').addEventListener('click',renderMail);
  var tabs=document.querySelectorAll('[data-mail]');
  tabs.forEach(function(b){b.addEventListener('click',function(){
    tabs.forEach(function(x){x.classList.remove('active');x.setAttribute('aria-selected','false');});
    b.classList.add('active');b.setAttribute('aria-selected','true');
    cur=parseInt(b.getAttribute('data-mail'),10);emailPane.setAttribute('aria-labelledby',b.id);renderMail();});});

  /* ================= PASSWORD LAB ================= */
  var PW=window.PW,human=PW.human,isCommon=PW.isCommon,estBits=PW.estBits;
  var pwInput=document.getElementById('pwInput'),pwMeter=document.getElementById('pwMeter'),
      pwVerdict=document.getElementById('pwVerdict'),pwCrack=document.getElementById('pwCrack'),pwWhy=document.getElementById('pwWhy');
  function checkPw(){var pw=pwInput.value;
    if(!pw){pwMeter.style.width='0';pwMeter.className='progress-bar';pwVerdict.textContent='Waiting…';pwVerdict.className='fw-bold mt-1 text-muted';pwCrack.textContent='';pwWhy.textContent='';return;}
    var common=isCommon(pw);
    var bits=estBits(pw),seconds=Math.pow(2,bits)/2/1e10,score,label,cls;
    if(common){score=10;label="Very weak — a common password pattern";cls="bg-danger";}
    else{
      if(bits<35){score=25;label="Weak";cls="bg-danger";}
      else if(bits<55){score=55;label="Okay";cls="bg-warning";}
      else if(bits<75){score=80;label="Strong";cls="bg-success";}
      else{score=100;label="Excellent";cls="bg-success";}}
    pwMeter.style.width=score+'%';pwMeter.className='progress-bar '+cls;pwMeter.parentNode.setAttribute('aria-valuenow',score);
    pwVerdict.textContent=label;pwVerdict.className='fw-bold mt-1 '+(score>=80?'text-success':score>=55?'text-warning':'text-danger');
    pwCrack.textContent=common?"⏱ A dictionary attack cracks this almost instantly.":"⏱ Theoretical brute-force time (random guessing, worst case): "+human(seconds)+".";
    pwWhy.innerHTML=pw.length<12?"Tip: it's under 12 characters. <b>Length</b> matters most — add words to grow the time dramatically.":"Nice length. A long passphrase like this is what makes brute force hopeless. (Real attackers also try patterns, so never reuse a password.)";}
  pwInput.addEventListener('input',checkPw);

  var WORDS=Array.from(new Set(window.PHISH_WORDS)),PP_WORDS=7,ppReady=false;
  var ppOut=document.getElementById('ppOut'),ppCrack=document.getElementById('ppCrack');
  function genPp(){var w=[];for(var i=0;i<PP_WORDS;i++)w.push(WORDS[rnd(WORDS.length)]);
    var pp=w.join("-");ppOut.textContent=pp;ppReady=true;
    var bits=PP_WORDS*Math.log2(WORDS.length),seconds=Math.pow(2,bits)/2/1e10;
    ppCrack.innerHTML="🎲 ~"+Math.round(bits)+" bits of randomness ("+PP_WORDS+" words from a "+WORDS.length+"-word list). Offline worst case against a fast hash: <b>"+human(seconds)+"</b> — sites using slow hashing (bcrypt, Argon2) are far tougher.";}
  document.getElementById('ppBtn').addEventListener('click',genPp);
  document.getElementById('ppCopy').addEventListener('click',function(){if(!ppReady)return;
    var b=this,t=ppOut.textContent;
    function done(txt){b.textContent=txt;setTimeout(function(){b.textContent="Copy";},1500);}
    function fallback(){var r=document.createRange();r.selectNodeContents(ppOut);var s=getSelection();s.removeAllRanges();s.addRange(r);done("Press Ctrl/⌘+C");}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){done("Copied!");},fallback);
    else fallback();});

  /* ================= MFA ================= */
  document.querySelectorAll('.mfa-card').forEach(function(c){
    var s=c.querySelector('.mfa-state');c.setAttribute('aria-expanded','false');
    activate(c,function(){var hide=s.classList.toggle('d-none');c.setAttribute('aria-expanded',String(!hide));});});

  /* ================= REPORT ================= */
  function resetReport(){reportMsg.classList.add('d-none');reportBtn.disabled=false;reportBtn.textContent="🚩 Report the sample phishing email";}
  reportBtn.addEventListener('click',function(){
    reportMsg.classList.remove('d-none');
    reportMsg.innerHTML="✅ <b>That's exactly the right move.</b> In a real inbox this would send the message to your security team and remove it from your mailbox. Reporting — even after a mistake — is always the right call.";
    this.textContent="✔ Reported";this.disabled=true;});

  /* ================= QUIZ ================= */
  var QUIZ=[
    {q:"An email says your account will be closed in 2 hours unless you log in via its link. What's the biggest red flag?",
     o:["The urgent deadline pushing you to act fast","The email has a logo","It was sent in the morning","It's addressed to you"],a:0,
     fb:"Urgency is the classic pressure tactic — slow down and verify through the official site, not the link."},
    {q:"The safest way to check where a link really goes is to:",
     o:["Click it and see","Hover over it (or long-press) to preview the real URL","Trust the blue link text","Reply and ask"],a:1,
     fb:"The visible text can lie; the true destination appears when you hover or long-press."},
    {q:"Your 'CEO' texts asking you to urgently buy gift cards and keep it secret. You should:",
     o:["Buy them quickly","Reply with the codes","Verify directly via a known number / in person","Keep it confidential as asked"],a:2,
     fb:"Gift-card + urgency + secrecy is textbook CEO fraud. Always verify through a trusted channel."},
    {q:"Which password is strongest?",
     o:["P@ssw0rd!","Summer2024","Qwerty123","river-copper-lantern-maple-82"],a:3,
     fb:"Length wins. A long multi-word passphrase is far harder to crack than a short 'complex' one."},
    {q:"Which form of MFA best resists phishing?",
     o:["SMS text codes","Security questions","A passkey / FIDO2 security key","No MFA, just a long password"],a:2,
     fb:"Passkeys / security keys only work on the real site, so a phished password alone can't get in."},
    {q:"You clicked a phishing link and entered your password. What now?",
     o:["Say nothing and hope","Delete the email only","Turn off your computer","Report to IT immediately and change your password"],a:3,
     fb:"Speed limits the damage. Report right away and change the password from a trusted device — you won't be blamed."}
  ];
  var quizBox=document.getElementById('quizBox');
  function buildQuiz(){var h='';
    QUIZ.forEach(function(it,qi){
      h+='<fieldset class="q mb-3" data-q="'+qi+'"><legend class="fw-bold text-navy mb-2 fs-6">'+(qi+1)+'. '+escapeHtml(it.q)+'</legend>';
      shuffle(it.o.map(function(_,i){return i;})).forEach(function(oi){
        h+='<label class="opt" data-oi="'+oi+'"><input class="form-check-input m-0" type="radio" name="q'+qi+'" value="'+oi+'"><span>'+escapeHtml(it.o[oi])+'</span></label>';});
      h+='<div class="fb d-none" data-fb="'+qi+'"></div></fieldset>';});
    h+='<div class="alert alert-warning small d-none" id="quizWarn" role="alert"></div>';
    h+='<button class="btn btn-brand w-100 mt-2" id="scoreBtn">Score my answers</button>';
    h+='<button class="btn btn-outline-secondary w-100 mt-2 d-none" id="retryBtn">Try again</button>';
    h+='<div class="alert alert-light border text-center mt-3 d-none" id="scoreBox" role="status"><div class="display-6 fw-bold text-navy" id="scoreNum"></div><div id="scoreTxt"></div></div>';
    quizBox.innerHTML=h;
    document.getElementById('scoreBtn').addEventListener('click',score);
    document.getElementById('retryBtn').addEventListener('click',function(){buildQuiz();quizBox.scrollIntoView({behavior:smooth,block:'start'});});}
  function score(){var ok=0,missing=[],warn=document.getElementById('quizWarn');
    QUIZ.forEach(function(it,qi){if(!quizBox.querySelector('input[name="q'+qi+'"]:checked'))missing.push(qi);});
    if(missing.length){warn.textContent="Please answer every question first — missing: "+missing.map(function(i){return i+1;}).join(", ")+".";
      warn.classList.remove('d-none');
      quizBox.querySelector('.q[data-q="'+missing[0]+'"]').scrollIntoView({behavior:smooth,block:'center'});return;}
    warn.classList.add('d-none');
    QUIZ.forEach(function(it,qi){
      var q=quizBox.querySelector('.q[data-q="'+qi+'"]'),sel=q.querySelector('input:checked'),v=parseInt(sel.value,10),
          fb=q.querySelector('.fb');
      fb.classList.remove('d-none');
      q.querySelector('.opt[data-oi="'+it.a+'"]').classList.add('correct');
      if(v===it.a){ok++;fb.className='fb ok';fb.innerHTML='✅ Correct. '+it.fb;}
      else{q.querySelector('.opt[data-oi="'+v+'"]').classList.add('wrong');fb.className='fb no';fb.innerHTML='❌ Not quite. '+it.fb;}
      q.querySelectorAll('input').forEach(function(i){i.disabled=true;});});
    var box=document.getElementById('scoreBox');box.classList.remove('d-none');
    document.getElementById('scoreNum').textContent=ok+' / '+QUIZ.length;
    document.getElementById('scoreTxt').textContent=ok===QUIZ.length?"Perfect — you're a hard target for phishing. 🛡️":
      ok>=4?"Solid. Review the ones you missed and you're in great shape.":"Worth another look — scroll back through the guide and retry.";
    document.getElementById('scoreBtn').classList.add('d-none');document.getElementById('retryBtn').classList.remove('d-none');
    box.scrollIntoView({behavior:smooth,block:'center'});}
  buildQuiz();

  renderMail();
})();

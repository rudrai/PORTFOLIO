/* ============================================================
   STARFIELD BACKGROUND
============================================================ */
(function(){
  const canvas = document.getElementById('starfield');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, stars = [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.floor((w*h)/9000);
    stars = new Array(count).fill(0).map(()=>({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*1.3 + 0.2,
      a: Math.random()*0.6 + 0.15,
      tw: Math.random()*0.02 + 0.005,
      dir: Math.random() > 0.5 ? 1 : -1
    }));
  }
  window.addEventListener('resize', resize);
  resize();

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener('mousemove', e=>{
    tmx = (e.clientX / w - 0.5);
    tmy = (e.clientY / h - 0.5);
  });

  function draw(){
    ctx.clearRect(0,0,w,h);
    mx += (tmx - mx) * 0.03;
    my += (tmy - my) * 0.03;

    /* constellation lines between nearby stars */
    const maxDist = Math.min(140, Math.max(90, w/12));
    ctx.lineWidth = 1;
    for(let i=0;i<stars.length;i++){
      const s1 = stars[i];
      const ox1 = mx * s1.r * 14;
      const oy1 = my * s1.r * 14;
      for(let j=i+1;j<stars.length;j++){
        const s2 = stars[j];
        const dx = s1.x - s2.x;
        const dy = s1.y - s2.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < maxDist){
          const ox2 = mx * s2.r * 14;
          const oy2 = my * s2.r * 14;
          const alpha = (1 - dist/maxDist) * 0.14;
          ctx.strokeStyle = `rgba(243,241,234,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(s1.x + ox1, s1.y + oy1);
          ctx.lineTo(s2.x + ox2, s2.y + oy2);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = '#f3f1ea';
    for(const s of stars){
      if(!reduceMotion){
        s.a += s.tw * s.dir;
        if(s.a > 0.9 || s.a < 0.1) s.dir *= -1;
      }
      ctx.globalAlpha = s.a;
      const ox = mx * s.r * 14;
      const oy = my * s.r * 14;
      ctx.beginPath();
      ctx.arc(s.x + ox, s.y + oy, s.r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ============================================================
   HERO SHARD PARALLAX
============================================================ */
(function(){
  const shards = document.querySelectorAll('.shard');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion) return;
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e=>{
    mx = (e.clientX / window.innerWidth - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
    shards.forEach((s, i)=>{
      const depth = (i+1) * 10;
      s.style.transform = `translate3d(${mx*depth}px, ${my*depth}px, 0)`;
    });
  });
})();

/* ============================================================
   PROJECT CARD 3D TILT
============================================================ */
(function(){
  const cards = document.querySelectorAll('[data-tilt]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion) return;
  cards.forEach(card=>{
    card.addEventListener('mousemove', e=>{
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${px*14}deg) rotateX(${-py*14}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.transform = 'perspective(700px) rotateY(0) rotateX(0) scale(1)';
    });
  });
})();

/* ============================================================
   MOBILE NAV
============================================================ */
(function(){
  const toggle = document.getElementById('navToggle');
  const links = document.querySelector('.nav-links');
  if(!toggle || !links) return;

  function closeMenu(){
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', ()=>{
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', ()=>{
    if(window.innerWidth > 720) closeMenu();
  });
})();

/* ============================================================
   SCROLL REVEAL
============================================================ */
(function(){
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:0.15});
  els.forEach(el=>io.observe(el));
})();

/* ============================================================
   FORMS — wired to /api/contact (Vercel serverless function)
============================================================ */
async function submitToContactApi(payload){
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  let data = {};
  try { data = await res.json(); } catch(_) {}
  if(!res.ok){
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }
  return data;
}

const heroForm = document.getElementById('heroForm');
if(heroForm){
  const heroStatus = document.getElementById('heroFormStatus');
  const heroBtn = heroForm.querySelector('button');
  const heroOriginalLabel = heroBtn.textContent;
  let heroRevertTimer = null;

  heroForm.addEventListener('submit', async function(e){
    e.preventDefault();
    const btn = heroBtn;
    const emailInput = this.querySelector('input[name="email"]');
    const companyInput = this.querySelector('input[name="company"]');

    clearTimeout(heroRevertTimer);
    btn.disabled = true;
    btn.textContent = 'Sending…';
    if(heroStatus){ heroStatus.textContent = ''; heroStatus.removeAttribute('data-state'); }

    try{
      await submitToContactApi({
        type: 'lead',
        email: emailInput.value,
        company: companyInput ? companyInput.value : ''
      });
      btn.textContent = 'Sent ✓';
      if(heroStatus){
        heroStatus.textContent = 'Thanks — I\'ll get back to you soon.';
        heroStatus.setAttribute('data-state', 'ok');
      }
      this.reset();
      heroRevertTimer = setTimeout(()=>{ btn.textContent = heroOriginalLabel; }, 2400);
    }catch(err){
      btn.textContent = heroOriginalLabel;
      if(heroStatus){
        heroStatus.textContent = err.message || 'Could not send right now — try again in a bit.';
        heroStatus.setAttribute('data-state', 'error');
      }
    }finally{
      btn.disabled = false;
    }
  });
}

const contactForm = document.getElementById('contactForm');
if(contactForm){
  const contactStatus = document.getElementById('contactFormStatus');
  const contactBtn = contactForm.querySelector('.form-submit');
  const contactOriginalLabel = contactBtn.textContent;
  let contactRevertTimer = null;

  contactForm.addEventListener('submit', async function(e){
    e.preventDefault();
    const btn = contactBtn;
    const nameInput = this.querySelector('input[name="name"]');
    const emailInput = this.querySelector('input[name="email"]');
    const messageInput = this.querySelector('textarea[name="message"]');
    const companyInput = this.querySelector('input[name="company"]');

    clearTimeout(contactRevertTimer);
    btn.disabled = true;
    btn.textContent = 'Sending…';
    if(contactStatus){ contactStatus.textContent = ''; contactStatus.removeAttribute('data-state'); }

    try{
      await submitToContactApi({
        type: 'message',
        name: nameInput.value,
        email: emailInput.value,
        message: messageInput.value,
        company: companyInput ? companyInput.value : ''
      });
      btn.textContent = 'Message sent ✓';
      if(contactStatus){
        contactStatus.textContent = 'Got it — thanks for reaching out. I\'ll reply by email soon.';
        contactStatus.setAttribute('data-state', 'ok');
      }
      this.reset();
      contactRevertTimer = setTimeout(()=>{ btn.textContent = contactOriginalLabel; }, 2400);
    }catch(err){
      btn.textContent = contactOriginalLabel;
      if(contactStatus){
        contactStatus.textContent = err.message || 'Could not send right now — try again in a bit.';
        contactStatus.setAttribute('data-state', 'error');
      }
    }finally{
      btn.disabled = false;
    }
  });
}


/* ============================================================
   DESIGN POLISH (additive)
============================================================ */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* scroll progress */
  const bar = document.getElementById('scrollProgress');
  if(bar){
    const upd = ()=>{
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
    };
    window.addEventListener('scroll', upd, {passive:true});
    window.addEventListener('resize', upd);
    upd();
  }

  /* cursor glow */
  const glow = document.getElementById('cursorGlow');
  if(glow && !reduce){
    let gx = 0, gy = 0, tx = 0, ty = 0, started = false;
    window.addEventListener('mousemove', e=>{
      tx = e.clientX; ty = e.clientY;
      if(!started){ gx = tx; gy = ty; started = true; glow.classList.add('on'); }
    });
    document.addEventListener('mouseleave', ()=> glow.classList.remove('on'));
    document.addEventListener('mouseenter', ()=> started && glow.classList.add('on'));
    (function loop(){
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* stat count-up */
  const stats = document.querySelectorAll('.stat-num[data-count]');
  if(stats.length){
    const run = el=>{
      const end = parseInt(el.dataset.count, 10), suffix = el.dataset.suffix || '';
      if(reduce){ el.textContent = end + suffix; return; }
      const start = end > 100 ? end - 40 : 0, dur = 1200, t0 = performance.now();
      (function tick(t){
        const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(start + (end - start) * eased) + suffix;
        if(p < 1) requestAnimationFrame(tick);
      })(t0);
    };
    const io = new IntersectionObserver(es=>{
      es.forEach(en=>{ if(en.isIntersecting){ run(en.target); io.unobserve(en.target); } });
    }, {threshold:0.6});
    stats.forEach(s=>io.observe(s));
  }

  /* skill level meters */
  const map = {CORE:3, STRONG:2, GROWING:1};
  document.querySelectorAll('.skill-item .level').forEach(el=>{
    const label = el.textContent.trim(), n = map[label];
    if(!n) return;
    const m = document.createElement('span');
    m.className = 'meter';
    m.setAttribute('aria-hidden', 'true');
    for(let i=0;i<3;i++){ const d = document.createElement('i'); if(i < n) d.className = 'on'; m.appendChild(d); }
    el.insertBefore(m, el.firstChild);
  });

  /* card highlight follows cursor */
  document.querySelectorAll('.project-visual').forEach(c=>{
    c.addEventListener('mousemove', e=>{
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* active nav link */
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  if(links.length && 'IntersectionObserver' in window){
    const byId = {};
    links.forEach(a=>{ byId[a.getAttribute('href').slice(1)] = a; });
    const spy = new IntersectionObserver(es=>{
      es.forEach(en=>{
        if(en.isIntersecting){
          links.forEach(a=>a.classList.remove('active'));
          byId[en.target.id] && byId[en.target.id].classList.add('active');
        }
      });
    }, {rootMargin:'-45% 0px -50% 0px'});
    Object.keys(byId).forEach(id=>{ const s = document.getElementById(id); if(s) spy.observe(s); });
  }
})();
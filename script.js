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
   FORMS (decorative — replace with real endpoint)
============================================================ */
const heroForm = document.getElementById('heroForm');
if(heroForm){
  heroForm.addEventListener('submit', function(e){
    e.preventDefault();
    const btn = this.querySelector('button');
    const original = btn.textContent;
    btn.textContent = 'Sent ✓';
    setTimeout(()=>{ btn.textContent = original; this.reset(); }, 1800);
  });
}
const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    const btn = this.querySelector('.form-submit');
    const original = btn.textContent;
    btn.textContent = 'Message sent ✓';
    setTimeout(()=>{ btn.textContent = original; this.reset(); }, 1800);
  });
}
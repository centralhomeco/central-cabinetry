// Central Cabinetry v2

// NAV
function toggleMenu(){document.getElementById('navLinks').classList.toggle('open')}
document.addEventListener('click',function(e){
    var nb=document.querySelector('.navbar');
    if(nb&&!nb.contains(e.target))document.getElementById('navLinks').classList.remove('open');
});

// HERO CAROUSEL
var slideIndex=0;
function initHero(){
    var slides=document.querySelectorAll('.hero-slide');
    var dotsEl=document.getElementById('heroDots');
    if(!slides.length)return;
    slides.forEach(function(_,i){
        var d=document.createElement('button');
        d.className='hero-dot'+(i===0?' active':'');
        d.onclick=function(){goToSlide(i)};
        if(dotsEl)dotsEl.appendChild(d);
    });
    setInterval(function(){changeSlide(1)},5000);
}
function changeSlide(dir){
    var slides=document.querySelectorAll('.hero-slide');
    if(!slides.length)return;
    slides[slideIndex].classList.remove('active');
    slideIndex=(slideIndex+dir+slides.length)%slides.length;
    slides[slideIndex].classList.add('active');
    updateDots();
}
function goToSlide(i){
    var slides=document.querySelectorAll('.hero-slide');
    slides[slideIndex].classList.remove('active');
    slideIndex=i;
    slides[slideIndex].classList.add('active');
    updateDots();
}
function updateDots(){
    document.querySelectorAll('.hero-dot').forEach(function(d,i){
        d.classList.toggle('active',i===slideIndex);
    });
}

// MULTISTEP FORM
function nextStep(n){
    document.querySelectorAll('.form-step').forEach(function(s){s.classList.remove('active')});
    document.querySelectorAll('.step').forEach(function(s){s.classList.remove('active')});
    var step=document.getElementById('step'+n);
    var stepBtn=document.getElementById('step'+n+'btn');
    if(step)step.classList.add('active');
    if(stepBtn)stepBtn.classList.add('active');
}

// LIGHTBOX
function openLightbox(src){
    var lb=document.getElementById('lightbox');
    var img=document.getElementById('lightboxImg');
    if(lb&&img){img.src=src;lb.classList.add('open')}
}
function closeLightbox(){
    var lb=document.getElementById('lightbox');
    if(lb)lb.classList.remove('open');
}

// FORMS
function submitContact(e){e.preventDefault();alert('Thank you! We will get back to you shortly.');e.target.reset()}
function submitAppointment(e){e.preventDefault();alert('Appointment confirmed! We will contact you within 24 hours.');e.target.reset();nextStep(1)}

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
        e.preventDefault();
        var t=document.querySelector(this.getAttribute('href'));
        if(t)t.scrollIntoView({behavior:'smooth'});
    });
});

window.addEventListener('DOMContentLoaded',initHero);
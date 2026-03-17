document.addEventListener('DOMContentLoaded',function(){

    var navbar=document.getElementById('navbar');
    var navToggle=document.getElementById('navToggle');
    var navLinks=document.getElementById('navLinks');
    var hero=document.querySelector('.hero');

    window.addEventListener('scroll',function(){
        if(window.scrollY>60){
            navbar.classList.add('scrolled');
        }else{
            navbar.classList.remove('scrolled');
        }
    });

    setTimeout(function(){
        hero.classList.add('loaded');
    },100);

    navToggle.addEventListener('click',function(){
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(function(link){
        link.addEventListener('click',function(){
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    var reveals=document.querySelectorAll('.reveal');
    var revealObserver=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
            if(entry.isIntersecting){
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    },{threshold:0.15,rootMargin:'0px 0px -40px 0px'});

    reveals.forEach(function(el,i){
        el.style.transitionDelay=(i%4)*80+'ms';
        revealObserver.observe(el);
    });

    var counters=document.querySelectorAll('[data-target]');
    var counterObserver=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
            if(entry.isIntersecting){
                var el=entry.target;
                var target=parseInt(el.getAttribute('data-target'));
                var step=Math.ceil(target/60);
                var current=0;
                var timer=setInterval(function(){
                    current+=step;
                    if(current>=target){
                        current=target;
                        clearInterval(timer);
                    }
                    el.textContent=current;
                },25);
                counterObserver.unobserve(el);
            }
        });
    },{threshold:0.5});

    counters.forEach(function(counter){
        counterObserver.observe(counter);
    });

    navLinks.querySelectorAll('a[href^="#"]').forEach(function(anchor){
        anchor.addEventListener('click',function(e){
            e.preventDefault();
            var target=document.querySelector(this.getAttribute('href'));
            if(target){
                target.scrollIntoView({behavior:'smooth'});
            }
        });
    });

});

// Firebase Config
var firebaseConfig = {
    apiKey: "AIzaSyBAYFkXGCFng8Qguk1GPWUciNziJPKVbYU",
    authDomain: "jnmantenimiento-d40e3.firebaseapp.com",
    projectId: "jnmantenimiento-d40e3",
    storageBucket: "jnmantenimiento-d40e3.firebasestorage.app",
    messagingSenderId: "799423716713",
    appId: "1:799423716713:web:ee2af732fd9d1140b531f8"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

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

    navLinks.querySelectorAll('a[href^="#"]').forEach(function(anchor){
        anchor.addEventListener('click',function(e){
            e.preventDefault();
            var target=document.querySelector(this.getAttribute('href'));
            if(target){
                target.scrollIntoView({behavior:'smooth'});
            }
        });
    });

    // Load content from Firestore then init animations
    loadSiteContent().then(function(){
        initAnimations();
        initLightbox();
    }).catch(function(){
        initAnimations();
        initLightbox();
    });

});

function initAnimations(){
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
}

function setText(id,text){
    var el=document.getElementById(id);
    if(el && text) el.textContent=text;
}

function setHTML(id,html){
    var el=document.getElementById(id);
    if(el && html) el.innerHTML=html;
}

function parseTitle(raw){
    if(!raw) return '';
    return raw.replace(/\*([^*]+)\*/g,'<em>$1</em>');
}

function escHTML(s){
    var d=document.createElement('div');
    d.textContent=s;
    return d.innerHTML;
}

function loadSiteContent(){
    var sections=['hero','about','services','cta','portfolio','numbers','contact','footer','general'];
    var promises=sections.map(function(section){
        return db.collection('siteContent').doc(section).get().then(function(doc){
            if(doc.exists) return {section:section,data:doc.data()};
            return null;
        }).catch(function(){ return null; });
    });

    return Promise.all(promises).then(function(results){
        var generalData=null;
        results.forEach(function(r){
            if(!r) return;
            if(r.section==='general') generalData=r.data;
        });

        results.forEach(function(r){
            if(!r) return;
            applySectionData(r.section,r.data,generalData);
        });
    });
}

function applySectionData(section,data,general){
    switch(section){
        case 'hero':
            setText('fs-hero-badge',data.badge);
            setText('fs-hero-line1',data.titleLine1);
            setText('fs-hero-line2',data.titleLine2);
            setText('fs-hero-line3',data.titleLine3);
            setText('fs-hero-subtitle',data.subtitle);
            setText('fs-hero-btn1',data.btnPrimary);
            setText('fs-hero-btn2',data.btnSecondary);
            break;

        case 'about':
            setText('fs-about-tag',data.tag);
            if(data.title) setHTML('fs-about-title',parseTitle(data.title));
            setText('fs-about-desc',data.description);
            var aboutImg=document.getElementById('fs-about-image');
            if(aboutImg && data.image) aboutImg.src=data.image;
            var statNum=document.getElementById('fs-about-statNumber');
            if(statNum && data.statNumber){
                statNum.setAttribute('data-target',data.statNumber);
            }
            setText('fs-about-statSymbol',data.statSymbol);
            setText('fs-about-statLabel',data.statLabel);
            if(data.features && data.features.length){
                renderAboutFeatures(data.features);
            }
            break;

        case 'services':
            setText('fs-services-tag',data.tag);
            if(data.title) setHTML('fs-services-title',parseTitle(data.title));
            if(data.items && data.items.length){
                renderServiceCards(data.items);
            }
            break;

        case 'cta':
            setText('fs-cta-title',data.title);
            setText('fs-cta-subtitle',data.subtitle);
            setText('fs-cta-btnText',data.btnText);
            break;

        case 'portfolio':
            setText('fs-portfolio-tag',data.tag);
            if(data.title) setHTML('fs-portfolio-title',parseTitle(data.title));
            setText('fs-portfolio-desc',data.description);
            var pItems = data.items || [];
            if(data.mainImage){
                var exists = pItems.some(function(it){return it.image===data.mainImage;});
                if(!exists) pItems.unshift({image:data.mainImage, label:'Antes y después'});
            }
            if(pItems.length){
                renderPortfolioCards(pItems);
            }
            break;

        case 'numbers':
            if(data.items && data.items.length){
                renderNumberCards(data.items);
            }
            break;

        case 'contact':
            setText('fs-contact-tag',data.tag);
            if(data.title) setHTML('fs-contact-title',parseTitle(data.title));
            setText('fs-contact-desc',data.description);
            setText('fs-contact-wspTitle',data.wspTitle);
            setText('fs-contact-wspSub',data.wspSubtitle);
            var contactImg=document.getElementById('fs-contact-image');
            if(contactImg && data.image) contactImg.src=data.image;
            break;

        case 'footer':
            setText('fs-footer-desc',data.description);
            setText('fs-footer-copyright',data.copyright);
            break;

        case 'general':
            if(data.whatsappNumber && data.whatsappNumber!=='TUNUMERO'){
                var wspMsg=encodeURIComponent(data.whatsappMessage||'Hola, me interesa solicitar un presupuesto');
                var wspUrl='https://wa.me/'+data.whatsappNumber+'?text='+wspMsg;
                var wspLinks=document.querySelectorAll('#fs-cta-btn, #fs-contact-wsp, #fs-wsp-float');
                wspLinks.forEach(function(el){ el.href=wspUrl; });
            }
            if(data.marqueeTexts && data.marqueeTexts.length){
                renderMarquee(data.marqueeTexts);
            }
            break;
    }
}

function renderAboutFeatures(features){
    var container=document.getElementById('fs-about-features');
    if(!container) return;
    var svgs=[
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'
    ];
    container.innerHTML='';
    features.forEach(function(f,i){
        var div=document.createElement('div');
        div.className='feature reveal';
        div.innerHTML=
            '<div class="feature-icon">'+( svgs[i%svgs.length] )+'</div>'+
            '<div><h3>'+escHTML(f.title)+'</h3><p>'+escHTML(f.description)+'</p></div>';
        container.appendChild(div);
    });
}

function renderServiceCards(items){
    var grid=document.getElementById('fs-services-grid');
    if(!grid) return;
    grid.innerHTML='';
    items.forEach(function(item){
        var article=document.createElement('article');
        article.className='service-card reveal';
        article.innerHTML=
            '<div class="service-img"><img src="'+escHTML(item.image)+'" alt="'+escHTML(item.title)+'" width="600" height="400" loading="lazy"></div>'+
            '<div class="service-body">'+
            '<span class="service-num">'+escHTML(item.num)+'</span>'+
            '<h3>'+escHTML(item.title)+'</h3>'+
            '<p>'+escHTML(item.description)+'</p>'+
            '<a href="#contacto" class="service-link">Consultar <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>'+
            '</div>';
        grid.appendChild(article);
    });
}

function renderPortfolioCards(items){
    var container=document.getElementById('fs-portfolio-items');
    if(!container) return;
    container.innerHTML='';
    items.forEach(function(item){
        var div=document.createElement('div');
        div.className='pe-card reveal';
        div.innerHTML=
            '<img src="'+escHTML(item.image)+'" alt="'+escHTML(item.label)+'" width="600" height="400" loading="lazy">'+
            '<div class="pe-overlay"><span>'+escHTML(item.label)+'</span></div>';
        container.appendChild(div);
    });
}

function renderNumberCards(items){
    var grid=document.getElementById('fs-numbers-grid');
    if(!grid) return;
    grid.innerHTML='';
    items.forEach(function(item){
        var div=document.createElement('div');
        div.className='num-item reveal';
        div.innerHTML=
            '<span class="num-value" data-target="'+item.value+'">0</span>'+
            '<span class="num-plus">'+escHTML(item.suffix)+'</span>'+
            '<span class="num-label">'+escHTML(item.label)+'</span>';
        grid.appendChild(div);
    });
}

// ---- LIGHTBOX ----
function initLightbox(){
    var lightbox=document.getElementById('lightbox');
    var lbImg=document.getElementById('lightbox-img');
    var lbCaption=document.getElementById('lightbox-caption');
    var lbCounter=document.getElementById('lightbox-counter');
    var btnClose=document.getElementById('lightbox-close');
    var btnPrev=document.getElementById('lightbox-prev');
    var btnNext=document.getElementById('lightbox-next');
    var images=[];
    var currentIdx=0;

    function collectImages(){
        images=[];
        var cards=document.querySelectorAll('#fs-portfolio-items .pe-card');
        cards.forEach(function(card){
            var img=card.querySelector('img');
            var overlay=card.querySelector('.pe-overlay span');
            if(img){
                images.push({
                    src:img.src,
                    label:overlay?overlay.textContent:''
                });
            }
        });
    }

    function showImage(idx){
        if(images.length===0) return;
        currentIdx=((idx%images.length)+images.length)%images.length;
        lbImg.src=images[currentIdx].src;
        lbImg.alt=images[currentIdx].label;
        lbCaption.textContent=images[currentIdx].label;
        lbCounter.textContent=(currentIdx+1)+' / '+images.length;
    }

    function openLightbox(idx){
        collectImages();
        showImage(idx);
        lightbox.classList.add('active');
        document.body.style.overflow='hidden';
    }

    function closeLightbox(){
        lightbox.classList.remove('active');
        document.body.style.overflow='';
    }

    document.getElementById('fs-portfolio-items').addEventListener('click',function(e){
        var card=e.target.closest('.pe-card');
        if(!card) return;
        var cards=Array.prototype.slice.call(document.querySelectorAll('#fs-portfolio-items .pe-card'));
        var idx=cards.indexOf(card);
        if(idx!==-1) openLightbox(idx);
    });

    btnClose.addEventListener('click',closeLightbox);
    btnPrev.addEventListener('click',function(){ showImage(currentIdx-1); });
    btnNext.addEventListener('click',function(){ showImage(currentIdx+1); });

    lightbox.addEventListener('click',function(e){
        if(e.target===lightbox) closeLightbox();
    });

    document.addEventListener('keydown',function(e){
        if(!lightbox.classList.contains('active')) return;
        if(e.key==='Escape') closeLightbox();
        if(e.key==='ArrowLeft') showImage(currentIdx-1);
        if(e.key==='ArrowRight') showImage(currentIdx+1);
    });
}

function renderMarquee(texts){
    var track=document.getElementById('fs-marquee');
    if(!track) return;
    var html='';
    // Duplicate for infinite scroll
    for(var r=0;r<2;r++){
        texts.forEach(function(t,i){
            if(i>0 || r>0) html+='<span class="dot"></span>';
            html+='<span>'+escHTML(t)+'</span>';
        });
    }
    track.innerHTML=html;
}

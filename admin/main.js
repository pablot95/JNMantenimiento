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

// ==================== AUTH ====================
var ADMIN_USER = 'Jnmantenimiento';
var ADMIN_PASS = 'Jnmantenimiento1';

var loginForm = document.getElementById('loginForm');
var loginScreen = document.getElementById('loginScreen');
var adminPanel = document.getElementById('adminPanel');
var loginError = document.getElementById('loginError');

function isLoggedIn() {
    return sessionStorage.getItem('adminAuth') === 'true';
}

function showAdmin() {
    loginScreen.style.display = 'none';
    adminPanel.style.display = 'block';
    loadAllSections();
    loadImages();
}

function showLogin() {
    loginScreen.style.display = 'flex';
    adminPanel.style.display = 'none';
    sessionStorage.removeItem('adminAuth');
}

if (isLoggedIn()) {
    showAdmin();
}

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var user = document.getElementById('loginUser').value.trim();
    var password = document.getElementById('loginPassword').value;
    loginError.textContent = '';

    if (user === ADMIN_USER && password === ADMIN_PASS) {
        sessionStorage.setItem('adminAuth', 'true');
        showAdmin();
    } else {
        loginError.textContent = 'Usuario o contraseña incorrectos';
    }
});

document.getElementById('logoutBtn').addEventListener('click', function() {
    showLogin();
});

// ==================== HERO LIVE PREVIEW ====================
['hero-badge','hero-titleLine1','hero-titleLine2','hero-titleLine3','hero-subtitle'].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function() {
        var map = {
            'hero-badge': 'prev-hero-badge',
            'hero-titleLine1': 'prev-hero-line1',
            'hero-titleLine2': 'prev-hero-line2',
            'hero-titleLine3': 'prev-hero-line3',
            'hero-subtitle': 'prev-hero-sub'
        };
        var target = document.getElementById(map[id]);
        if (target) target.textContent = this.value;
    });
});

// ==================== IMAGE PREVIEWS ====================
function setupImagePreview(inputId, previewId) {
    var input = document.getElementById(inputId);
    var preview = document.getElementById(previewId);
    if (!input || !preview) return;
    input.addEventListener('input', function() {
        if (this.value) {
            preview.src = this.value;
            preview.classList.add('visible');
            preview.onerror = function() { preview.classList.remove('visible'); };
        } else {
            preview.classList.remove('visible');
        }
    });
}

setupImagePreview('about-image', 'about-image-preview');
setupImagePreview('contact-image', 'contact-image-preview');
setupImagePreview('img-url', 'img-add-preview');

// ==================== DRAG & DROP ====================
function fileToBase64(file, callback) {
    var reader = new FileReader();
    reader.onload = function(e) { callback(e.target.result); };
    reader.readAsDataURL(file);
}

function setupDropzone(dropzone) {
    var fileInput = dropzone.querySelector('.dropzone-file');
    var inputId = dropzone.getAttribute('data-input');
    var previewId = dropzone.getAttribute('data-preview');

    dropzone.addEventListener('click', function(e) {
        if (e.target !== fileInput) fileInput.click();
    });

    dropzone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', function() {
        dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        var file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleDropFile(file, inputId, previewId, dropzone);
        }
    });

    fileInput.addEventListener('change', function() {
        if (this.files[0]) {
            handleDropFile(this.files[0], inputId, previewId, dropzone);
        }
    });
}

function handleDropFile(file, inputId, previewId, dropzone) {
    fileToBase64(file, function(base64) {
        if (inputId) {
            var input = document.getElementById(inputId);
            if (input) input.value = base64;
        }
        if (previewId) {
            var preview = document.getElementById(previewId);
            if (preview) {
                preview.src = base64;
                preview.classList.add('visible');
            }
        }
        // For dynamic items (services, portfolio)
        var dynInput = dropzone.closest('.dynamic-item');
        if (dynInput) {
            var imgInput = dynInput.querySelector('.svc-image, .port-image');
            if (imgInput) imgInput.value = base64;
            var dynPreview = dynInput.querySelector('.dyn-preview');
            if (dynPreview) {
                dynPreview.src = base64;
                dynPreview.classList.add('visible');
            }
        }
        dropzone.classList.add('has-file');
        var p = dropzone.querySelector('p');
        if (p) p.textContent = '✓ Imagen cargada: ' + file.name;
    });
}

// Init existing dropzones
document.querySelectorAll('.dropzone').forEach(setupDropzone);

// Main images dropzone
var mainDropzone = document.getElementById('img-main-dropzone');
if (mainDropzone) {
    mainDropzone.setAttribute('data-input', 'img-url');
    mainDropzone.setAttribute('data-preview', 'img-add-preview');
    setupDropzone(mainDropzone);
}

// ==================== TOAST ====================
function showToast(message, type) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'success');
    toast.classList.add('show');
    setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== LOAD DATA ====================
function loadAllSections() {
    var sections = ['hero', 'about', 'services', 'cta', 'portfolio', 'numbers', 'contact', 'footer', 'general'];
    sections.forEach(function(section) {
        db.collection('siteContent').doc(section).get().then(function(doc) {
            if (doc.exists) {
                populateForm(section, doc.data());
            }
        }).catch(function(err) {
            console.error('Error loading ' + section + ':', err);
        });
    });
}

function populateForm(section, data) {
    switch (section) {
        case 'hero':
            setVal('hero-badge', data.badge);
            setVal('hero-titleLine1', data.titleLine1);
            setVal('hero-titleLine2', data.titleLine2);
            setVal('hero-titleLine3', data.titleLine3);
            setVal('hero-subtitle', data.subtitle);
            setVal('hero-btnPrimary', data.btnPrimary);
            setVal('hero-btnSecondary', data.btnSecondary);
            // Update preview
            setText2('prev-hero-badge', data.badge);
            setText2('prev-hero-line1', data.titleLine1);
            setText2('prev-hero-line2', data.titleLine2);
            setText2('prev-hero-line3', data.titleLine3);
            setText2('prev-hero-sub', data.subtitle);
            break;

        case 'about':
            setVal('about-tag', data.tag);
            setVal('about-title', data.title);
            setVal('about-description', data.description);
            setVal('about-image', data.image);
            setVal('about-statNumber', data.statNumber);
            setVal('about-statSymbol', data.statSymbol);
            setVal('about-statLabel', data.statLabel);
            showPreview('about-image', 'about-image-preview');
            if (data.features) {
                renderFeatures(data.features);
            }
            break;

        case 'services':
            setVal('services-tag', data.tag);
            setVal('services-title', data.title);
            if (data.items) {
                renderServiceItems(data.items);
            }
            break;

        case 'cta':
            setVal('cta-title', data.title);
            setVal('cta-subtitle', data.subtitle);
            setVal('cta-btnText', data.btnText);
            break;

        case 'portfolio':
            setVal('portfolio-tag', data.tag);
            setVal('portfolio-title', data.title);
            setVal('portfolio-description', data.description);
            // Migrate old mainImage into items if present
            var portfolioItems = data.items || [];
            if (data.mainImage) {
                var alreadyExists = portfolioItems.some(function(it) { return it.image === data.mainImage; });
                if (!alreadyExists) {
                    portfolioItems.unshift({ image: data.mainImage, label: 'Antes y después' });
                }
            }
            if (portfolioItems.length) {
                renderPortfolioItems(portfolioItems);
            }
            break;

        case 'numbers':
            if (data.items) {
                renderNumberItems(data.items);
            }
            break;

        case 'contact':
            setVal('contact-tag', data.tag);
            setVal('contact-title', data.title);
            setVal('contact-description', data.description);
            setVal('contact-wspTitle', data.wspTitle);
            setVal('contact-wspSubtitle', data.wspSubtitle);
            setVal('contact-image', data.image);
            showPreview('contact-image', 'contact-image-preview');
            break;

        case 'footer':
            setVal('footer-description', data.description);
            setVal('footer-copyright', data.copyright);
            break;

        case 'general':
            setVal('general-whatsappNumber', data.whatsappNumber);
            setVal('general-whatsappMessage', data.whatsappMessage);
            setVal('general-marqueeTexts', data.marqueeTexts ? data.marqueeTexts.join(', ') : '');
            break;
    }
}

function setVal(id, value) {
    var el = document.getElementById(id);
    if (el && value !== undefined && value !== null) {
        el.value = value;
    }
}

function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function setText2(id, text) {
    var el = document.getElementById(id);
    if (el && text) el.textContent = text;
}

function showPreview(inputId, previewId) {
    var input = document.getElementById(inputId);
    var preview = document.getElementById(previewId);
    if (input && preview && input.value) {
        preview.src = previewSrc(input.value);
        preview.classList.add('visible');
        preview.onerror = function() { preview.classList.remove('visible'); };
    }
}

// ==================== SAVE DATA ====================
function saveSection(section) {
    var data = {};

    switch (section) {
        case 'hero':
            data = {
                badge: getVal('hero-badge'),
                titleLine1: getVal('hero-titleLine1'),
                titleLine2: getVal('hero-titleLine2'),
                titleLine3: getVal('hero-titleLine3'),
                subtitle: getVal('hero-subtitle'),
                btnPrimary: getVal('hero-btnPrimary'),
                btnSecondary: getVal('hero-btnSecondary')
            };
            break;

        case 'about':
            data = {
                tag: getVal('about-tag'),
                title: getVal('about-title'),
                description: getVal('about-description'),
                image: getVal('about-image'),
                statNumber: parseInt(getVal('about-statNumber')) || 0,
                statSymbol: getVal('about-statSymbol'),
                statLabel: getVal('about-statLabel'),
                features: collectFeatures()
            };
            break;

        case 'services':
            data = {
                tag: getVal('services-tag'),
                title: getVal('services-title'),
                items: collectServiceItems()
            };
            break;

        case 'cta':
            data = {
                title: getVal('cta-title'),
                subtitle: getVal('cta-subtitle'),
                btnText: getVal('cta-btnText')
            };
            break;

        case 'portfolio':
            data = {
                tag: getVal('portfolio-tag'),
                title: getVal('portfolio-title'),
                description: getVal('portfolio-description'),
                items: collectPortfolioItems()
            };
            break;

        case 'numbers':
            data = {
                items: collectNumberItems()
            };
            break;

        case 'contact':
            data = {
                tag: getVal('contact-tag'),
                title: getVal('contact-title'),
                description: getVal('contact-description'),
                wspTitle: getVal('contact-wspTitle'),
                wspSubtitle: getVal('contact-wspSubtitle'),
                image: getVal('contact-image')
            };
            break;

        case 'footer':
            data = {
                description: getVal('footer-description'),
                copyright: getVal('footer-copyright')
            };
            break;

        case 'general':
            var marqueeRaw = getVal('general-marqueeTexts');
            data = {
                whatsappNumber: getVal('general-whatsappNumber'),
                whatsappMessage: getVal('general-whatsappMessage'),
                marqueeTexts: marqueeRaw ? marqueeRaw.split(',').map(function(t) { return t.trim(); }).filter(Boolean) : []
            };
            break;
    }

    db.collection('siteContent').doc(section).set(data, { merge: true })
        .then(function() {
            showToast('✓ ' + section + ' guardado correctamente');
        })
        .catch(function(err) {
            showToast('Error al guardar: ' + err.message, 'error');
        });
}

// ==================== DYNAMIC ITEMS: FEATURES ====================
function renderFeatures(features) {
    var container = document.getElementById('about-features-container');
    container.innerHTML = '';
    features.forEach(function(f, i) {
        addFeature(f.title, f.description);
    });
}

function addFeature(title, description) {
    var container = document.getElementById('about-features-container');
    var index = container.children.length;
    var div = document.createElement('div');
    div.className = 'dynamic-item';
    div.innerHTML =
        '<div class="item-header"><span>Característica ' + (index + 1) + '</span><button class="btn-remove" onclick="this.parentElement.parentElement.remove()">Eliminar</button></div>' +
        '<div class="form-grid">' +
        '<div class="form-group"><label>Título</label><input type="text" class="feature-title" value="' + escapeAttr(title || '') + '"></div>' +
        '<div class="form-group"><label>Descripción</label><input type="text" class="feature-desc" value="' + escapeAttr(description || '') + '"></div>' +
        '</div>';
    container.appendChild(div);
}

function collectFeatures() {
    var items = [];
    var container = document.getElementById('about-features-container');
    container.querySelectorAll('.dynamic-item').forEach(function(item) {
        items.push({
            title: item.querySelector('.feature-title').value.trim(),
            description: item.querySelector('.feature-desc').value.trim()
        });
    });
    return items;
}

// ==================== DYNAMIC ITEMS: SERVICES ====================
function renderServiceItems(items) {
    var container = document.getElementById('services-items-container');
    container.innerHTML = '';
    items.forEach(function(item) {
        addServiceItem(item.num, item.title, item.description, item.image);
    });
}

function addServiceItem(num, title, description, image) {
    var container = document.getElementById('services-items-container');
    var index = container.children.length;
    var div = document.createElement('div');
    div.className = 'dynamic-item';
    div.innerHTML =
        '<div class="item-header"><span>Servicio ' + (index + 1) + '</span><button class="btn-remove" onclick="this.parentElement.parentElement.remove()">Eliminar</button></div>' +
        '<div class="form-group"><label>Número</label><input type="text" class="svc-num" value="' + escapeAttr(num || ('0' + (index + 1))) + '"></div>' +
        '<div class="form-group"><label>Título</label><input type="text" class="svc-title" value="' + escapeAttr(title || '') + '"></div>' +
        '<div class="form-group"><label>Descripción</label><textarea class="svc-desc" rows="2">' + escapeHTML(description || '') + '</textarea></div>' +
        '<div class="form-group"><label>Imagen</label>' +
        '<div class="dropzone" data-input="" data-preview=""><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p>Arrastrá imagen</p><input type="file" accept="image/*" class="dropzone-file"></div>' +
        '<input type="text" class="svc-image" value="' + escapeAttr(image || '') + '" placeholder="O pegá URL">' +
        '<img class="dyn-preview img-preview' + (image ? ' visible' : '') + '" src="' + escapeAttr(previewSrc(image)) + '" alt="Preview">' +
        '</div>';
    container.appendChild(div);
    setupDropzone(div.querySelector('.dropzone'));
}

function collectServiceItems() {
    var items = [];
    var container = document.getElementById('services-items-container');
    container.querySelectorAll('.dynamic-item').forEach(function(item) {
        items.push({
            num: item.querySelector('.svc-num').value.trim(),
            title: item.querySelector('.svc-title').value.trim(),
            description: item.querySelector('.svc-desc').value.trim(),
            image: item.querySelector('.svc-image').value.trim()
        });
    });
    return items;
}

// ==================== DYNAMIC ITEMS: PORTFOLIO ====================
function renderPortfolioItems(items) {
    var container = document.getElementById('portfolio-items-container');
    container.innerHTML = '';
    items.forEach(function(item) {
        addPortfolioItem(item.image, item.label);
    });
}

function addPortfolioItem(image, label) {
    var container = document.getElementById('portfolio-items-container');
    var index = container.children.length;
    var div = document.createElement('div');
    div.className = 'dynamic-item';
    div.innerHTML =
        '<div class="item-header"><span>Imagen ' + (index + 1) + '</span><button class="btn-remove" onclick="this.parentElement.parentElement.remove()">Eliminar</button></div>' +
        '<div class="form-grid">' +
        '<div class="form-group"><label>Etiqueta</label><input type="text" class="port-label" value="' + escapeAttr(label || '') + '"></div>' +
        '<div class="form-group full"><label>Imagen (arrastrá o pegá URL)</label>' +
        '<div class="dropzone" data-input="" data-preview=""><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><p>Arrastrá una imagen acá o hacé clic</p><input type="file" accept="image/*" class="dropzone-file"></div>' +
        '<input type="text" class="port-image" value="' + escapeAttr(image || '') + '">' +
        '<img class="dyn-preview img-preview' + (image ? ' visible' : '') + '" src="' + escapeAttr(previewSrc(image)) + '" alt="Preview">' +
        '</div></div>';
    container.appendChild(div);
    setupDropzone(div.querySelector('.dropzone'));
}

function collectPortfolioItems() {
    var items = [];
    var container = document.getElementById('portfolio-items-container');
    container.querySelectorAll('.dynamic-item').forEach(function(item) {
        items.push({
            image: item.querySelector('.port-image').value.trim(),
            label: item.querySelector('.port-label').value.trim()
        });
    });
    return items;
}

// ==================== DYNAMIC ITEMS: NUMBERS ====================
function renderNumberItems(items) {
    var container = document.getElementById('numbers-items-container');
    container.innerHTML = '';
    items.forEach(function(item) {
        addNumberItem(item.value, item.suffix, item.label);
    });
}

function addNumberItem(value, suffix, label) {
    var container = document.getElementById('numbers-items-container');
    var index = container.children.length;
    var div = document.createElement('div');
    div.className = 'dynamic-item';
    div.innerHTML =
        '<div class="item-header"><span>Estadística ' + (index + 1) + '</span><button class="btn-remove" onclick="this.parentElement.parentElement.remove()">Eliminar</button></div>' +
        '<div class="form-grid">' +
        '<div class="form-group"><label>Valor numérico</label><input type="number" class="num-val" value="' + (value || 0) + '"></div>' +
        '<div class="form-group"><label>Sufijo (+, %, h, etc.)</label><input type="text" class="num-suffix" value="' + escapeAttr(suffix || '') + '"></div>' +
        '<div class="form-group full"><label>Etiqueta</label><input type="text" class="num-label" value="' + escapeAttr(label || '') + '"></div>' +
        '</div>';
    container.appendChild(div);
}

function collectNumberItems() {
    var items = [];
    var container = document.getElementById('numbers-items-container');
    container.querySelectorAll('.dynamic-item').forEach(function(item) {
        items.push({
            value: parseInt(item.querySelector('.num-val').value) || 0,
            suffix: item.querySelector('.num-suffix').value.trim(),
            label: item.querySelector('.num-label').value.trim()
        });
    });
    return items;
}

// ==================== IMAGES MANAGEMENT ====================
function loadImages() {
    db.collection('images').orderBy('name').get().then(function(snapshot) {
        var gallery = document.getElementById('images-gallery');
        gallery.innerHTML = '';
        if (snapshot.empty) {
            gallery.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem;">No hay imágenes registradas.</p>';
            return;
        }
        snapshot.forEach(function(doc) {
            var data = doc.data();
            var div = document.createElement('div');
            div.className = 'gallery-item';
            div.innerHTML =
                '<img src="' + escapeAttr(data.url) + '" alt="' + escapeAttr(data.name) + '" onerror="this.style.display=\'none\'">' +
                '<div class="gallery-item-info"><p>' + escapeHTML(data.name) + '</p><small>' + escapeHTML(data.url) + '</small></div>' +
                '<div class="gallery-item-actions">' +
                '<button class="btn-copy-url" onclick="copyUrl(\'' + escapeAttr(data.url) + '\')">Copiar URL</button>' +
                '<button class="btn-remove" onclick="deleteImage(\'' + doc.id + '\')">Eliminar</button>' +
                '</div>';
            gallery.appendChild(div);
        });
    });
}

function addImage() {
    var name = getVal('img-name');
    var url = getVal('img-url');
    if (!name || !url) {
        showToast('Completá nombre y URL', 'error');
        return;
    }
    db.collection('images').add({ name: name, url: url })
        .then(function() {
            showToast('✓ Imagen agregada');
            document.getElementById('img-name').value = '';
            document.getElementById('img-url').value = '';
            document.getElementById('img-add-preview').classList.remove('visible');
            loadImages();
        })
        .catch(function(err) {
            showToast('Error: ' + err.message, 'error');
        });
}

function deleteImage(docId) {
    if (!confirm('¿Seguro que querés eliminar esta imagen?')) return;
    db.collection('images').doc(docId).delete()
        .then(function() {
            showToast('✓ Imagen eliminada');
            loadImages();
        })
        .catch(function(err) {
            showToast('Error: ' + err.message, 'error');
        });
}

function copyUrl(url) {
    navigator.clipboard.writeText(url).then(function() {
        showToast('✓ URL copiada al portapapeles');
    });
}

// ==================== INIT DATA ====================
document.getElementById('initDataBtn').addEventListener('click', function() {
    if (!confirm('Esto cargará los datos iniciales de la página en Firestore. ¿Continuar?')) return;

    var batch = db.batch();

    batch.set(db.collection('siteContent').doc('hero'), {
        badge: 'Mantenimiento \u00b7 Obras \u00b7 Proyectos',
        titleLine1: 'Construimos',
        titleLine2: 'soluciones',
        titleLine3: 'que perduran',
        subtitle: 'Servicios integrales adaptados a cada cliente, con la calidad y el profesionalismo que tu proyecto merece.',
        btnPrimary: 'Solicitar presupuesto',
        btnSecondary: 'Ver nuestras obras'
    });

    batch.set(db.collection('siteContent').doc('about'), {
        tag: 'Sobre nosotros',
        title: 'Una pyme en constante *expansión*',
        description: 'En JN Servicios Integrales nos dedicamos al mantenimiento, obras y proyectos con un compromiso claro: brindar soluciones integrales y adaptadas a cada cliente, ofreciendo un servicio especializado que maximiza beneficios según sus intereses y necesidades.',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
        statNumber: 100,
        statSymbol: '%',
        statLabel: 'Compromiso',
        features: [
            { title: 'Atención personalizada', description: 'Acompañamiento en cada etapa del proyecto, desde la planificación hasta la entrega final.' },
            { title: 'Calidad y eficiencia', description: 'Ejecución impecable en mantenimiento y obras, cumpliendo plazos y estándares de calidad.' },
            { title: 'Relaciones duraderas', description: 'Construimos confianza a largo plazo basada en resultados y transparencia total.' }
        ]
    });

    batch.set(db.collection('siteContent').doc('services'), {
        tag: 'Lo que hacemos',
        title: 'Nuestros *servicios*',
        items: [
            { num: '01', title: 'Mantenimiento', description: 'Servicios preventivos y correctivos para edificios, comunidades e instalaciones. Garantizamos el óptimo funcionamiento de cada espacio con intervenciones eficientes y planificadas.', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80' },
            { num: '02', title: 'Obras', description: 'Ejecución integral de obras civiles, reformas y rehabilitaciones. Desde pequeñas intervenciones hasta proyectos de gran envergadura, con materiales de primera calidad.', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80' },
            { num: '03', title: 'Proyectos', description: 'Desarrollo de proyectos a medida con innovación y profesionalismo. Planificamos, diseñamos y ejecutamos cada detalle para que el resultado supere expectativas.', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80' }
        ]
    });

    batch.set(db.collection('siteContent').doc('cta'), {
        title: '¿Tienes un proyecto en mente?',
        subtitle: 'Hablemos sobre cómo podemos hacerlo realidad.',
        btnText: 'Escribinos por WhatsApp'
    });

    batch.set(db.collection('siteContent').doc('portfolio'), {
        tag: 'Resultados reales',
        title: 'Nuestras *obras*',
        description: 'Cada proyecto es una oportunidad para demostrar nuestro compromiso con la calidad. Mirá la transformación.',
        items: [
            { image: 'images/antesydespues.jpeg', label: 'Antes y después' },
            { image: '/images/remodelacion.jpg', label: 'Reforma integral' },
            { image: 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&q=80', label: 'Rehabilitación' },
            { image: 'https://images.unsplash.com/photo-1523413363574-c30aa1c2a516?w=600&q=80', label: 'Proyecto a medida' }
        ]
    });

    batch.set(db.collection('siteContent').doc('numbers'), {
        items: [
            { value: 150, suffix: '+', label: 'Proyectos realizados' },
            { value: 98, suffix: '%', label: 'Clientes satisfechos' },
            { value: 10, suffix: '+', label: 'Años de experiencia' },
            { value: 24, suffix: 'h', label: 'Atención disponible' }
        ]
    });

    batch.set(db.collection('siteContent').doc('contact'), {
        tag: 'Contacto',
        title: 'Hablemos de tu *proyecto*',
        description: 'Estamos listos para escucharte. Contanos qué necesitás y te asesoramos sin compromiso. Respuesta rápida garantizada.',
        wspTitle: 'WhatsApp',
        wspSubtitle: 'Respuesta inmediata',
        image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80'
    });

    batch.set(db.collection('siteContent').doc('footer'), {
        description: 'Mantenimiento, obras y proyectos con la calidad que tu espacio merece.',
        copyright: '© 2026 JN Servicios Integrales. Todos los derechos reservados.'
    });

    batch.set(db.collection('siteContent').doc('general'), {
        whatsappNumber: 'TUNUMERO',
        whatsappMessage: 'Hola, me interesa solicitar un presupuesto',
        marqueeTexts: ['Mantenimiento', 'Obras civiles', 'Reformas integrales', 'Proyectos a medida', 'Rehabilitación', 'Instalaciones']
    });

    batch.commit()
        .then(function() {
            showToast('✓ Datos iniciales cargados correctamente');
            loadAllSections();
        })
        .catch(function(err) {
            showToast('Error: ' + err.message, 'error');
        });
});

// ==================== UTILITIES ====================
function escapeAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHTML(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Adjust relative paths for admin (which is in /admin/ subfolder)
function previewSrc(src) {
    if (!src) return '';
    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('../')) return src;
    if (src.startsWith('/')) return src;
    return '../' + src;
}

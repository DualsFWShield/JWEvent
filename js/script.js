document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIG ---
    const CONFIG = {
        onedriveUrl: "https://1drv.ms/f/s!AvN5c1X9...", // Placeholder
        defaultLang: 'fr',
        greetings: [
            { text: "Bonjour", lang: "fr" }, { text: "Hello", lang: "en" },
            { text: "Hallo", lang: "nl" }, { text: "Guten Tag", lang: "de" },
            { text: "Hola", lang: "es" }, { text: "Olá", lang: "pt" },
            { text: "안녕하세요", lang: "ko" }, { text: "Bon bini", lang: "pap" }
        ]
    };

    // --- 0. NAVIGATION ---
    const mainNav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Scrolled state
    function updateNav() {
        if (window.scrollY > 60) {
            mainNav.classList.add('scrolled');
        } else {
            mainNav.classList.remove('scrolled');
        }
    }

    // Active link tracking
    function updateActiveLink() {
        const scrollPos = window.scrollY + 120;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) {
                if (scrollPos >= top && scrollPos < top + height) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
            updateNav();
            updateActiveLink();
        });
    }, { passive: true });
    updateNav();

    // --- 1. HERO ANIMATIONS ---
    const cloudContainer = document.getElementById('bonjour-container');
    const layers = document.querySelectorAll('.hero-text-layer');
    const heroSection = document.getElementById('hero');

    // Floating Words
    if (cloudContainer) {
        function spawnGreeting() {
            const wordData = CONFIG.greetings[Math.floor(Math.random() * CONFIG.greetings.length)];
            const el = document.createElement('span');
            el.innerText = wordData.text;
            el.className = 'floating-word';

            const x = Math.random() * 90 + 5;
            const y = Math.random() * 90 + 5;
            const scale = Math.random() * 1.5 + 1.0;
            const duration = Math.random() * 4 + 4;

            el.style.left = `${x}%`;
            el.style.top = `${y}%`;
            el.style.fontSize = `${2 * scale}rem`;
            el.style.opacity = '0';
            el.style.color = Math.random() > 0.85 ? 'var(--gold)' : `rgba(255,255,255,${0.04 + Math.random() * 0.08})`;
            el.style.textShadow = '0 0 20px rgba(0,0,0,0.3)';

            cloudContainer.appendChild(el);

            el.animate([
                { opacity: 0, transform: `translateY(40px) scale(${scale})` },
                { opacity: 0.7, transform: `translateY(0px) scale(${scale})`, offset: 0.2 },
                { opacity: 0.7, transform: `translateY(-40px) scale(${scale})`, offset: 0.8 },
                { opacity: 0, transform: `translateY(-80px) scale(${scale})` }
            ], {
                duration: duration * 1000,
                easing: 'ease-in-out'
            }).onfinish = () => el.remove();
        }
        setInterval(spawnGreeting, 600);
    }

    // Gyroscope Parallax
    function handleOrientation(event) {
        const x = event.gamma || 0;
        const y = event.beta || 0;

        const moveX = Math.max(-30, Math.min(30, x));
        const moveY = Math.max(-30, Math.min(30, y - 45));

        requestAnimationFrame(() => {
            layers.forEach(layer => {
                const speed = parseFloat(layer.getAttribute('data-speed')) || 0.5;
                layer.style.transform = `translate(calc(-50% + ${moveX * speed * 3}px), calc(-50% + ${moveY * speed * 3}px))`;
            });
        });
    }

    // iOS 13+ permission
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permBtn = document.createElement('button');
        permBtn.innerText = "Enable 3D Effects";
        permBtn.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            z-index: 9999; padding: 12px 28px; background: var(--gold);
            font-size: 0.9rem; font-weight: 600; border: none; color: #000;
            border-radius: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            font-family: var(--font-body); cursor: none;
        `;
        document.body.appendChild(permBtn);

        permBtn.addEventListener('click', () => {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                        permBtn.remove();
                    }
                })
                .catch(console.error);
        });
    } else {
        window.addEventListener('deviceorientation', handleOrientation);
    }

    // Mouse Fallback for parallax
    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;
            layers.forEach(layer => {
                const speed = layer.getAttribute('data-speed');
                layer.style.transform = `translate(calc(-50% + ${x * speed}px), calc(-50% + ${y * speed}px))`;
            });
        });
    }

    // --- 2. THREE.JS ATOMIUM ---
    const atomiumContainer = document.getElementById('atomium-container');
    if (atomiumContainer && window.THREE) {
        init3D();
    }

    function init3D() {
        const width = atomiumContainer.clientWidth;
        const height = atomiumContainer.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x080808);

        const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
        camera.position.set(0, 0, 150);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        atomiumContainer.appendChild(renderer.domElement);

        // Cinematic Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
        scene.add(ambientLight);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
        hemiLight.position.set(0, 200, 0);
        scene.add(hemiLight);

        const spotLight = new THREE.SpotLight(0xffffff, 3);
        spotLight.position.set(50, 100, 100);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.5;
        scene.add(spotLight);

        const goldLight = new THREE.PointLight(0xE8C547, 2);
        goldLight.position.set(-50, 20, 50);
        scene.add(goldLight);

        // Load STL
        const loader = new THREE.STLLoader();
        loader.load('assets/atomium.stl', (geometry) => {
            const material = new THREE.MeshPhysicalMaterial({
                color: 0xdddddd,
                metalness: 0.5,
                roughness: 0.2,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                reflectivity: 0.8
            });
            const mesh = new THREE.Mesh(geometry, material);
            geometry.center();
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.set(1.5, 1.5, 1.5);
            scene.add(mesh);

            function animate() {
                requestAnimationFrame(animate);
                mesh.rotation.z += 0.003;
                renderer.render(scene, camera);
            }
            animate();

        }, undefined, (error) => { });

        window.addEventListener('resize', () => {
            const w = atomiumContainer.clientWidth;
            const h = atomiumContainer.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        });
    }

    // --- 3. SCROLL OBSERVER ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.mag-article, .contact-card, .masonry-item, .group-photo-wrapper, .group-info').forEach(el => {
        el.classList.add('fade-in-section');
        observer.observe(el);
    });

    // --- 4. LOCALE & TRANSLATIONS ---
    const langSelect = document.getElementById('langSelect');
    let currentLang = CONFIG.defaultLang;

    async function loadTranslations(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Could not load translations for ${lang}`);
            }
            const translations = await response.json();
            applyTranslations(translations);

            try {
                localStorage.setItem('prefLang', lang);
            } catch (e) {
                console.warn("LocalStorage access blocked:", e);
            }
        } catch (error) {
            console.error("Translation error:", error);
        }
    }

    function applyTranslations(translations) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = translations[key];
            if (val) el.innerHTML = val;
        });
    }

    if (langSelect) {
        try {
            const saved = localStorage.getItem('prefLang');
            if (saved) currentLang = saved;
        } catch (e) {
            console.warn("LocalStorage access blocked:", e);
        }

        langSelect.value = currentLang;
        loadTranslations(currentLang);

        langSelect.addEventListener('change', (e) => {
            currentLang = e.target.value;
            loadTranslations(currentLang);
        });
    }

    // --- 5. CUSTOM CURSOR ---
    const cursor = document.getElementById('cursor');
    if (matchMedia('(pointer:fine)').matches && cursor) {
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth cursor follow
        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover effect on interactive elements
        document.querySelectorAll('a, button, select, .upload-zone, .mag-article, .contact-card').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });
    } else {
        if (cursor) cursor.style.display = 'none';
        // Restore default cursor on touch devices
        document.documentElement.style.cursor = 'auto';
        document.querySelectorAll('*').forEach(el => { el.style.cursor = ''; });
    }

    // --- 6. IMAGE UPLOAD & COMPRESSION (ImgBB) ---
    setupUploadZone();

    function setupUploadZone() {
        const dropZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('fileInput');
        const progressContainer = document.getElementById('upload-progress');
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const successMsg = document.getElementById('upload-success');
        const errorMsg = document.getElementById('upload-error');
        const uploadContent = document.getElementById('upload-content');

        if (!dropZone || !fileInput) return;

        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        ['dragleave', 'dragend'].forEach(evt => {
            dropZone.addEventListener(evt, () => dropZone.classList.remove('dragover'));
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) handleFile(e.target.files[0]);
        });

        function handleFile(file) {
            progressContainer.style.display = 'block';
            successMsg.style.display = 'none';
            errorMsg.style.display = 'none';
            uploadContent.style.opacity = '0.5';
            progressBar.style.width = '0%';
            progressText.innerText = "Analyse du fichier...";

            const MAX_SIZE = 31 * 1024 * 1024;

            if (file.size > MAX_SIZE) {
                progressText.innerText = "Compression en cours...";
                compressImage(file, (compressedBlob) => {
                    uploadToImgBB(compressedBlob);
                });
            } else {
                uploadToImgBB(file);
            }
        }

        function compressImage(file, callback) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    let width = img.width;
                    let height = img.height;
                    const MAX_DIM = 4096;

                    if (width > height) {
                        if (width > MAX_DIM) {
                            height *= MAX_DIM / width;
                            width = MAX_DIM;
                        }
                    } else {
                        if (height > MAX_DIM) {
                            width *= MAX_DIM / height;
                            height = MAX_DIM;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        callback(blob);
                    }, 'image/jpeg', 0.8);
                };
            };
        }

        function uploadToImgBB(file) {
            progressText.innerText = "Envoi vers ImgBB...";
            progressBar.style.width = '30%';

            const formData = new FormData();
            formData.append('key', '5ac2f3dcdf784f32f2e8e2e23f3dbe7d');
            formData.append('image', file);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://api.imgbb.com/1/upload', true);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    progressBar.style.width = Math.min(percentComplete, 90) + '%';
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        progressBar.style.width = '100%';
                        progressText.innerText = "Terminé !";
                        successMsg.style.display = 'block';
                        addToGallery(response.data.display_url || response.data.url);

                        setTimeout(() => {
                            progressContainer.style.display = 'none';
                            successMsg.style.display = 'none';
                            uploadContent.style.opacity = '1';
                            fileInput.value = '';
                        }, 5000);
                    } else {
                        showError();
                    }
                } else {
                    showError();
                }
            };

            xhr.onerror = showError;

            function showError() {
                progressContainer.style.display = 'none';
                errorMsg.style.display = 'block';
                uploadContent.style.opacity = '1';
            }

            xhr.send(formData);
        }

        function addToGallery(url) {
            const galleryGrid = document.getElementById('gallery-grid');
            const item = document.createElement('div');
            item.className = 'masonry-item fade-in-section';

            const img = document.createElement('img');
            img.src = url;
            img.style.width = '100%';
            img.style.display = 'block';

            item.appendChild(img);
            galleryGrid.insertBefore(item, galleryGrid.firstChild);

            if (observer) observer.observe(item);
            setTimeout(() => item.classList.add('is-visible'), 100);
        }
    }

    // --- 7. AUTOMATIC GALLERY LOADING ---
    loadGalleryImages();

    async function loadGalleryImages() {
        try {
            const response = await fetch(`assets/gallery.json?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error("Gallery manifest not found");

            const images = await response.json();
            const galleryGrid = document.getElementById('gallery-grid');

            if (images.length > 0 && galleryGrid) {
                galleryGrid.innerHTML = '';

                images.forEach(src => {
                    const item = document.createElement('div');
                    item.className = 'masonry-item fade-in-section';

                    const img = document.createElement('img');
                    img.src = src;
                    img.loading = "lazy";
                    img.style.width = "100%";
                    img.style.display = "block";

                    item.appendChild(img);
                    galleryGrid.appendChild(item);

                    if (observer) {
                        observer.observe(item);
                    } else {
                        item.classList.add('is-visible');
                    }
                });
            }
        } catch (e) {
            console.log("No dynamic gallery images found or error loading gallery.json", e);
        }
    }

});

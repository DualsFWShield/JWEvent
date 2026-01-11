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

    // --- 1. HERO ANIMATIONS ---
    const cloudContainer = document.getElementById('bonjour-container');
    const layers = document.querySelectorAll('.hero-text-layer');
    const heroSection = document.getElementById('hero');

    // Floating Words (More frequent spawn)
    if (cloudContainer) {
        function spawnGreeting() {
            const wordData = CONFIG.greetings[Math.floor(Math.random() * CONFIG.greetings.length)];
            const el = document.createElement('span');
            el.innerText = wordData.text;
            el.className = 'floating-word';

            // Mobile-optimized placement (Bigger & Faster)
            const x = Math.random() * 90 + 5;
            const y = Math.random() * 90 + 5;
            const scale = Math.random() * 1.5 + 1.0; // BIGGER: 1.0 to 2.5
            const duration = Math.random() * 4 + 4; // FASTER: 4 to 8 seconds

            el.style.left = `${x}%`;
            el.style.top = `${y}%`;
            el.style.fontSize = `${2 * scale}rem`;
            el.style.opacity = '0';
            el.style.color = Math.random() > 0.9 ? 'var(--gold)' : 'rgba(255,255,255,0.1)';
            el.style.textShadow = '0 0 10px rgba(0,0,0,0.5)';

            cloudContainer.appendChild(el);

            el.animate([
                { opacity: 0, transform: `translateY(40px) scale(${scale})` },
                { opacity: 0.9, transform: `translateY(0px) scale(${scale})`, offset: 0.2 },
                { opacity: 0.9, transform: `translateY(-40px) scale(${scale})`, offset: 0.8 },
                { opacity: 0, transform: `translateY(-80px) scale(${scale})` }
            ], {
                duration: duration * 1000,
                easing: 'ease-in-out'
            }).onfinish = () => el.remove();
        }
        setInterval(spawnGreeting, 500); // More frequent spawn
    }

    // Real Gyroscope Parallax
    function handleOrientation(event) {
        // Gamma: Left/Right tilt (-90 to 90)
        // Beta: Front/Back tilt (-180 to 180)
        const x = event.gamma || 0;
        const y = event.beta || 0;

        // Clamp values to avoid extreme shifts
        const moveX = Math.max(-30, Math.min(30, x));
        const moveY = Math.max(-30, Math.min(30, y - 45));

        requestAnimationFrame(() => {
            layers.forEach(layer => {
                const speed = parseFloat(layer.getAttribute('data-speed')) || 0.5;
                layer.style.transform = `translate(calc(-50% + ${moveX * speed * 3}px), calc(-50% + ${moveY * speed * 3}px))`;
            });
        });
    }

    // Request Permission for iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permBtn = document.createElement('button');
        permBtn.innerText = "Enable 3D Effects";
        permBtn.style.position = 'fixed'; permBtn.style.bottom = '20px'; permBtn.style.left = '50%';
        permBtn.style.transform = 'translateX(-50%)'; permBtn.style.zIndex = '9999';
        permBtn.style.padding = '12px 24px'; permBtn.style.background = 'var(--gold)';
        permBtn.style.fontSize = '1rem'; permBtn.style.fontWeight = 'bold';
        permBtn.style.border = 'none'; permBtn.style.color = '#000'; permBtn.style.borderRadius = '30px';
        permBtn.style.boxShadow = '0 10px 20px rgba(0,0,0,0.5)';
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
        // Non-iOS 13+ devices
        window.addEventListener('deviceorientation', handleOrientation);
    }

    // Mouse Fallback
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


    // --- 2. THREE.JS ATOMIUM (STL LOADING) ---
    const atomiumContainer = document.getElementById('atomium-container');
    if (atomiumContainer && window.THREE) {
        init3D();
    }

    function init3D() {
        const width = atomiumContainer.clientWidth;
        const height = atomiumContainer.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050505);

        const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
        camera.position.set(0, 0, 150); // CLOSER (was 300) to appear Bigger

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        atomiumContainer.appendChild(renderer.domElement);

        // Lighting (Cinematic)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
        hemiLight.position.set(0, 200, 0);
        scene.add(hemiLight);

        const spotLight = new THREE.SpotLight(0xffffff, 3);
        spotLight.position.set(50, 100, 100);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.5;
        scene.add(spotLight);

        const goldLight = new THREE.PointLight(0xD4AF37, 2.5);
        goldLight.position.set(-50, 20, 50);
        scene.add(goldLight);

        // Load STL
        const loader = new THREE.STLLoader();
        loader.load('assets/atomium.stl', (geometry) => {
            const material = new THREE.MeshPhysicalMaterial({
                color: 0xdddddd, // Lighter base
                metalness: 0.5,  // Less metal = more visible color
                roughness: 0.2,  // Slightly rougher to catch light
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                reflectivity: 0.8
            });
            const mesh = new THREE.Mesh(geometry, material);

            geometry.center();

            // CORRECTION FOR ORIENTATION & SCALE
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.set(1.5, 1.5, 1.5); // BIGGER scaling

            scene.add(mesh);

            // Animation Loop
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
    }, { threshold: 0.1 });

    document.querySelectorAll('.mag-article, .hub-card, .masonry-item').forEach(el => {
        el.classList.add('fade-in-section');
        observer.observe(el);
    });

    // --- 4. LOCALE & TRANSLATIONS (FETCH BASED) ---
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

            // Save preference
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
        // Load saved language or default
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

    // --- 5. CUSTOM CURSOR (Hidden on touch devices usually, but kept for hybrid) ---
    const cursor = document.getElementById('cursor');
    if (matchMedia('(pointer:fine)').matches && cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        // Hover effects...
    } else {
        if (cursor) cursor.style.display = 'none'; // Hide on touch
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

        // Click trigger
        dropZone.addEventListener('click', () => fileInput.click());

        // Drag & Drop
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

        // File Select
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) handleFile(e.target.files[0]);
        });

        function handleFile(file) {
            // Reset UI
            progressContainer.style.display = 'block';
            successMsg.style.display = 'none';
            errorMsg.style.display = 'none';
            uploadContent.style.opacity = '0.5';
            progressBar.style.width = '0%';
            progressText.innerText = "Analyse du fichier..."; // Default generic msg, will be translated if full re-run

            const MAX_SIZE = 31 * 1024 * 1024; // 31MB

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

                    // Resize logic: Max 4096px dimension to be safe & significant reduction
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

                    // Compress to JPEG 0.8
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
                    progressBar.style.width = Math.min(percentComplete, 90) + '%'; // Keep 10% for processing
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

                        // Reset after delay
                        setTimeout(() => {
                            progressContainer.style.display = 'none';
                            successMsg.style.display = 'none';
                            uploadContent.style.opacity = '1';
                            fileInput.value = ''; // Reset input
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

            // Create proper Image element
            const img = document.createElement('img');
            img.src = url;
            img.style.width = '100%';
            img.style.borderRadius = '10px';
            img.style.display = 'block';

            item.appendChild(img);

            // Prepend or Append? Prepend to show latest first
            galleryGrid.insertBefore(item, galleryGrid.firstChild);

            // Trigger scroll observer for animation
            if (window.observer) window.observer.observe(item);
            setTimeout(() => item.classList.add('is-visible'), 100);
        }
    }

    // --- 7. AUTOMATIC GALLERY LOADING ---
    loadGalleryImages();

    async function loadGalleryImages() {
        try {
            // Add cache-busting to ensure instant updates
            const response = await fetch(`assets/gallery.json?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error("Gallery manifest not found");

            const images = await response.json();
            const galleryGrid = document.getElementById('gallery-grid');

            if (images.length > 0 && galleryGrid) {
                // Clear any existing static items just in case (though we removed them)
                galleryGrid.innerHTML = '';

                images.forEach(src => {
                    const item = document.createElement('div');
                    item.className = 'masonry-item fade-in-section';

                    const img = document.createElement('img');
                    img.src = src;
                    img.loading = "lazy";
                    img.style.width = "100%";
                    img.style.display = "block";
                    img.style.borderRadius = "10px"; // Ensure styling matches

                    item.appendChild(img);
                    galleryGrid.appendChild(item);

                    // Observe for animation
                    if (typeof observer !== 'undefined') {
                        observer.observe(item);
                    } else {
                        item.classList.add('is-visible'); // Fallback
                    }
                });
            }
        } catch (e) {
            console.log("No dynamic gallery images found or error loading gallery.json", e);
        }
    }

});

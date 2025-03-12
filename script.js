document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.getElementById('theme-toggle');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const inputSections = document.querySelectorAll('.input-section');
    const urlInput = document.getElementById('url-input');
    const textInput = document.getElementById('text-input');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const qrSize = document.getElementById('qr-size');
    const sizeValue = document.getElementById('size-value');
    const qrColor = document.getElementById('qr-color');
    const qrBgColor = document.getElementById('qr-bg-color');
    const generateBtn = document.getElementById('generate-btn');
    const qrWrapper = document.getElementById('qr-wrapper');
    const qrCodeElement = document.getElementById('qr-code');
    const qrLoader = document.querySelector('.qr-loader');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');

    // State
    let qrCodeInstance = null;
    let currentTab = 'link';
    let fileContent = null;

    // Initialize
    function init() {
        setupEventListeners();
        checkThemePreference();
        updateSizeValue();
    }

    // Event Listeners
    function setupEventListeners() {
        // Theme Toggle
        themeToggle.addEventListener('click', toggleTheme);

        // Tab Switching
        tabButtons.forEach(button => {
            button.addEventListener('click', () => switchTab(button.dataset.tab));
        });

        // File Input
        fileInput.addEventListener('change', handleFileSelection);

        // QR Size Slider
        qrSize.addEventListener('input', updateSizeValue);

        // Generate Button
        generateBtn.addEventListener('click', generateQRCode);

        // Download Button
        downloadBtn.addEventListener('click', downloadQRCode);

        // Share Button
        shareBtn.addEventListener('click', shareQRCode);
    }

    // Dark Mode Toggle
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        // Save preference
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    }

    // Check Saved Theme Preference
    function checkThemePreference() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    // Tab Switching
    function switchTab(tab) {
        currentTab = tab;
        
        // Update tab buttons
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tab);
        });
        
        // Update tab content
        inputSections.forEach(section => {
            section.classList.toggle('active', section.id === `${tab}-tab`);
        });
    }

    // Handle File Selection
    function handleFileSelection() {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileInfo.textContent = `Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`;
            
            // Read file content
            const reader = new FileReader();
            reader.onload = function(e) {
                fileContent = e.target.result;
            };
            reader.readAsText(file);
        } else {
            fileInfo.textContent = 'No file selected';
            fileContent = null;
        }
    }

    // Update Size Value Display
    function updateSizeValue() {
        const size = qrSize.value;
        sizeValue.textContent = `${size} x ${size}`;
        
        // Update QR wrapper size
        qrWrapper.style.width = `${size}px`;
        qrWrapper.style.height = `${size}px`;
    }

    // Generate QR Code
    function generateQRCode() {
        // Show loader
        qrLoader.classList.add('active');
        qrCodeElement.classList.remove('active');
        
        // Get content based on current tab
        let content = '';
        
        switch(currentTab) {
            case 'link':
                content = urlInput.value.trim();
                break;
            case 'text':
                content = textInput.value.trim();
                break;
            case 'file':
                content = fileContent;
                break;
        }
        
        // Validation
        if (!content) {
            showMessage('Please enter content to generate QR code');
            qrLoader.classList.remove('active');
            return;
        }

        // Clear previous QR code
        if (qrCodeInstance) {
            qrCodeInstance.clear();
            qrCodeElement.innerHTML = '';
        }

        // Add animation delay for effect
        setTimeout(() => {
            // Create new QR code
            qrCodeInstance = new QRCode(qrCodeElement, {
                text: content,
                width: parseInt(qrSize.value),
                height: parseInt(qrSize.value),
                colorDark: qrColor.value,
                colorLight: qrBgColor.value,
                correctLevel: QRCode.CorrectLevel.H
            });
            
            // Hide loader and show QR code with animation
            qrLoader.classList.remove('active');
            setTimeout(() => {
                qrCodeElement.classList.add('active');
            }, 100);
            
            // Enable download and share buttons
            downloadBtn.disabled = false;
            shareBtn.disabled = false;
        }, 800); // Artificial delay for animation effect
    }

    // Download QR Code
    function downloadQRCode() {
        if (!qrCodeInstance) return;
        
        // Get QR code image
        const img = qrCodeElement.querySelector('img');
        if (!img) return;
        
        // Create a virtual canvas to draw the QR code for download
        const canvas = document.createElement('canvas');
        const size = parseInt(qrSize.value);
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = qrBgColor.value;
        ctx.fillRect(0, 0, size, size);
        
        // Draw the QR code image on the canvas
        const tempImg = new Image();
        tempImg.onload = function() {
            ctx.drawImage(tempImg, 0, 0, size, size);
            
            // Create download link
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        tempImg.src = img.src;
    }

    // Share QR Code
    function shareQRCode() {
        if (!qrCodeInstance) return;
        
        const img = qrCodeElement.querySelector('img');
        if (!img || !navigator.share) {
            showMessage('Sharing is not supported in your browser');
            return;
        }
        
        // Convert image to blob for sharing
        fetch(img.src)
            .then(response => response.blob())
            .then(blob => {
                const file = new File([blob], 'qrcode.png', { type: 'image/png' });
                
                navigator.share({
                    title: 'QR Code',
                    text: 'QR Code generated with my awesome generator!',
                    files: [file]
                }).catch(error => {
                    console.error('Error sharing:', error);
                    showMessage('Could not share QR code');
                });
            });
    }

    // Show Message
    function showMessage(text) {
        // Simple alert for now, can be replaced with custom toast notification
        alert(text);
    }

    // Add particle animation to the background
    function initParticles() {
        const container = document.createElement('div');
        container.className = 'particles-container';
        document.body.appendChild(container);
        
        for (let i = 0; i < 50; i++) {
            createParticle(container);
        }
    }

    function createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position, size and animation duration
        const size = Math.random() * 10 + 5;
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        const duration = Math.random() * 20 + 10;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.animationDuration = `${duration}s`;
        
        container.appendChild(particle);
        
        // Remove particles after animation to avoid memory leak
        setTimeout(() => {
            particle.remove();
            createParticle(container);
        }, duration * 1000);
    }

    // Add style for particles
    function addParticleStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .particles-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: -1;
                pointer-events: none;
            }
            
            .particle {
                position: absolute;
                background: linear-gradient(45deg, var(--accent-color), #9c27b0);
                border-radius: 50%;
                opacity: 0.3;
                animation: float linear infinite;
            }
            
            @keyframes float {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 0.3;
                }
                25% {
                    opacity: 0.5;
                }
                50% {
                    transform: translateY(-100vh) rotate(180deg);
                    opacity: 0.2;
                }
                75% {
                    opacity: 0.4;
                }
                100% {
                    transform: translateY(-200vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Create QR code pixel animation
    function addQRPixelAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #qr-code img {
                opacity: 0;
            }
            
            #qr-code.active img {
                animation: fadeInPixels 0.8s forwards;
            }
            
            @keyframes fadeInPixels {
                0% {
                    opacity: 0;
                    filter: blur(10px);
                }
                50% {
                    filter: blur(5px);
                }
                100% {
                    opacity: 1;
                    filter: blur(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize
    init();
    addParticleStyles();
    addQRPixelAnimationStyles();
    initParticles();
});
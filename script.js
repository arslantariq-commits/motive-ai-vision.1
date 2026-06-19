const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const viewer = document.getElementById('viewer');
const bValLabel = document.getElementById('bright-val');
const pValLabel = document.getElementById('pixel-val');
const aiBtn = document.getElementById('ai-btn');

// Links Panel Elements
const linksPanel = document.getElementById('links-panel');
const openLinksBtn = document.getElementById('open-links-btn');
const closeLinksBtn = document.getElementById('close-links-btn');
const micStatus = document.getElementById('micStatus');

let imgObj = new Image();
let brightness = 100;
let pixels = 0;
let isAiOn = false;
let prevB = 100, prevP = 0;

// 🎙️ وائس ریکگنیشن انجن لاجک
let recognition;
let isListening = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isListening = true;
        micStatus.innerHTML = "🎙️ Robot is actively listening...";
        micStatus.style.color = "#ffd700";
    };

    recognition.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const command = event.results[lastResultIndex][0].transcript.toLowerCase().trim();
        console.log("Robot Heard:", command);

        if (command.includes("back to home") || command.includes("go back")) {
            closeLinksPanelViaVoice();
        } else if (command.includes("status check") || command.includes("check status")) {
            triggerVoiceClick('btn-status');
        } else if (command.includes("qa helpdesk") || command.includes("open qa")) {
            triggerVoiceClick('btn-qa');
        } else if (command.includes("yoda helpdesk") || command.includes("open yoda")) {
            triggerVoiceClick('btn-yoda');
        } else if (command.includes("hardware") || command.includes("software") || command.includes("hard software")) {
            triggerVoiceClick('btn-hardware');
        } else if (command.includes("it internal") || command.includes("open it")) {
            triggerVoiceClick('btn-it');
        } else if (command.includes("omega") || command.includes("scheduling") || command.includes("omega scheduling")) {
            triggerVoiceClick('btn-omega');
        }
    };

    recognition.onerror = (e) => {
        console.log("Mic waiting/error:", e.error);
    };

    recognition.onend = () => {
        isListening = false;
        micStatus.innerHTML = "🔇 Robot Mic Off";
        micStatus.style.color = "#ff4444";
        // اگر پینل کھلا ہوا ہے تو مائیک دوبارہ آن کر دو
        if (!linksPanel.classList.contains('panel-hidden')) {
            recognition.start();
        }
    };
}

function triggerVoiceClick(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
        card.style.borderColor = "#ffd700";
        card.style.background = "rgba(255, 215, 0, 0.15)";
        card.click();
        setTimeout(() => {
            card.style.borderColor = "rgba(255, 215, 0, 0.15)";
            card.style.background = "rgba(255, 255, 255, 0.03)";
        }, 1200);
    }
}

function closeLinksPanelViaVoice() {
    linksPanel.classList.add('panel-hidden');
    if (recognition && isListening) {
        recognition.stop();
    }
}

// Links Navigation Controls (بٹنز پر کلک کرنے سے مائیک آٹو آن/آف ہوگا)
openLinksBtn.onclick = () => {
    linksPanel.classList.remove('panel-hidden');
    if (recognition && !isListening) {
        recognition.start();
    }
};

closeLinksBtn.onclick = () => {
    closeLinksPanelViaVoice();
};

// اگر پہلی بار براؤزر بلاک کرے تو پینل پر کہیں بھی کلک کرنے سے ایکٹو ہو جائے گا
linksPanel.onclick = () => {
    if (recognition && !isListening) {
        recognition.start();
    }
};

// File Selection (آپ کے پرانے امیج فنکشنز)
const fileInput = document.getElementById('fileInput');
fileInput.onchange = (e) => handleFile(e.target.files[0]);

window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
});

function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        imgObj = new Image(); 
        imgObj.onload = () => {
            canvas.width = imgObj.width;
            canvas.height = imgObj.height;
            viewer.classList.remove('viewer-hidden');
            render();
        };
        imgObj.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function adjustBrightness(amount) {
    brightness = Math.min(Math.max(brightness + amount, 0), 400);
    render();
}

function adjustPixel(amount) {
    pixels = Math.min(Math.max(pixels + amount, 0), 10);
    render();
}

function render() {
    if (!imgObj.src) return;
    bValLabel.innerText = brightness + "%";
    pValLabel.innerText = pixels;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.filter = `brightness(${brightness}%) contrast(${100 + pixels * 15}%) saturate(${100 + pixels * 3}%)`;
    ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
    ctx.restore();
}

aiBtn.onclick = () => {
    if (!isAiOn) {
        prevB = brightness; prevP = pixels;
        brightness = 190; pixels = 5;
        aiBtn.innerText = "✅ AI Enhance: ON";
        aiBtn.style.background = "#4CAF50";
        isAiOn = true;
    } else {
        brightness = prevB; pixels = prevP;
        aiBtn.innerText = "✨ AI Enhance: OFF";
        aiBtn.style.background = "rgba(20, 20, 20, 0.8)";
        isAiOn = false;
    }
    render();
};

document.getElementById('close-btn').onclick = () => {
    viewer.classList.add('viewer-hidden');
    imgObj = new Image();
    brightness = 100;
    pixels = 0;
    isAiOn = false;
    fileInput.value = ""; 
    aiBtn.innerText = "✨ AI Enhance: OFF";
    aiBtn.style.background = "rgba(20, 20, 20, 0.8)";
    bValLabel.innerText = "100%";
    pValLabel.innerText = "0";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// اسپلائن واٹرمارک ریموور لوپ
setInterval(() => {
    const viewer = document.getElementById('robotViewer');
    if (viewer && viewer.shadowRoot) {
        const logo = viewer.shadowRoot.querySelector('#logo') || viewer.shadowRoot.querySelector('.logo') || viewer.shadowRoot.querySelector('a[href*="spline.design"]');
        if (logo) logo.remove();
    }
}, 50);

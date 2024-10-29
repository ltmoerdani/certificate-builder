import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const placeholders = [
    { 
        id: 'name',
        input: 'nameInput',
        text: 'nameText',
        toggle: 'nameToggle',
        defaultText: 'Your Name',
        config: {
            align: 'nameAlignInput',
            fontFamily: 'nameFontFamilyInput',
            fontWeight: 'nameFontWeightInput',
            fontSize: 'nameFontSizeInput',
            fontColor: 'nameFontColorInput'
        }
    },
    { 
        id: 'category',
        input: 'categoryInput',
        text: 'categoryText',
        toggle: 'categoryToggle',
        defaultText: 'Category',
        config: {
            align: 'categoryAlignInput',
            fontFamily: 'categoryFontFamilyInput',
            fontWeight: 'categoryFontWeightInput',
            fontSize: 'categoryFontSizeInput',
            fontColor: 'categoryFontColorInput'
        }
    },
    { 
        id: 'club',
        input: 'clubInput',
        text: 'clubText',
        toggle: 'clubToggle',
        defaultText: 'Club Name',
        config: {
            align: 'clubAlignInput',
            fontFamily: 'clubFontFamilyInput',
            fontWeight: 'clubFontWeightInput',
            fontSize: 'clubFontSizeInput',
            fontColor: 'clubFontColorInput'
        }
    }
];

let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;
let activeDraggable = null;

const PAPER_SIZES = {
    a4: { width: 210, height: 297 },
    a5: { width: 148, height: 210 },
    letter: { width: 216, height: 279 }
};

const MM_TO_PX = 3.7795275591;

const canvas = document.getElementById('certificateCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvas-container');
const placeholder = document.getElementById('placeholder');
const downloadBtn = document.getElementById('downloadBtn');

// Store positions for each draggable element
const positions = {
    nameText: { x: 0, y: 0 },
    categoryText: { x: 0, y: 50 },
    clubText: { x: 0, y: 100 }
};

let certificateImage = null;

function getPaperSizeInPixels() {
    const size = PAPER_SIZES[paperSizeInput.value];
    const isLandscape = orientationInput.value === 'landscape';
    
    return {
        width: (isLandscape ? size.height : size.width) * MM_TO_PX,
        height: (isLandscape ? size.width : size.height) * MM_TO_PX
    };
}

function updateCanvasSize() {
    if (!certificateImage) return;
    
    const paperSize = getPaperSizeInPixels();
    canvas.width = paperSize.width;
    canvas.height = paperSize.height;
    
    drawCanvas();
}

function drawCanvas() {
    if (!certificateImage) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(certificateImage, 0, 0, canvas.width, canvas.height);

    placeholders.forEach(({ id, input, text, toggle, config }) => {
        const textElement = document.getElementById(text);
        const inputElement = document.getElementById(input);
        const toggleElement = document.getElementById(toggle);
        
        if (toggleElement.checked) {
            const content = inputElement.value || textElement.dataset.defaultText;
            textElement.textContent = content;
            textElement.style.display = 'block';
            
            // Apply individual styling for each placeholder
            const fontWeight = document.getElementById(config.fontWeight).value;
            const fontSize = document.getElementById(config.fontSize).value;
            const fontFamily = document.getElementById(config.fontFamily).value;
            const textAlign = document.getElementById(config.align).value;
            const fontColor = document.getElementById(config.fontColor).value;
            
            textElement.style.fontSize = `${fontSize}px`;
            textElement.style.fontFamily = fontFamily;
            textElement.style.fontWeight = fontWeight;
            textElement.style.color = fontColor;
            textElement.style.textAlign = textAlign;
            
            if (textAlign === 'center') {
                textElement.style.width = '100%';
            } else {
                textElement.style.width = 'auto';
            }
            
            const pos = positions[text];
            textElement.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        } else {
            textElement.style.display = 'none';
        }
    });
}

document.getElementById('certificateImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            certificateImage = new Image();
            certificateImage.onload = () => {
                updateCanvasSize();
                placeholder.style.display = 'none';
                downloadBtn.disabled = false;
                
                // Initialize draggable elements
                placeholders.forEach(({ text }) => {
                    const element = document.getElementById(text);
                    element.style.display = 'block';
                });
            };
            certificateImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function setTranslate(xPos, yPos, el) {
    positions[el.id] = { x: xPos, y: yPos };
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

function dragStart(e) {
    if (e.target.classList.contains('draggable-text')) {
        activeDraggable = e.target;
        const pos = positions[activeDraggable.id];
        
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - pos.x;
            initialY = e.touches[0].clientY - pos.y;
        } else {
            initialX = e.clientX - pos.x;
            initialY = e.clientY - pos.y;
        }
        
        isDragging = true;
    }
}

function dragEnd() {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
    activeDraggable = null;
}

function drag(e) {
    if (isDragging && activeDraggable) {
        e.preventDefault();

        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        setTranslate(currentX, currentY, activeDraggable);
    }
}

// Initialize draggable elements
placeholders.forEach(({ text, defaultText }) => {
    const element = document.getElementById(text);
    element.dataset.defaultText = defaultText;
});

container.addEventListener("touchstart", dragStart, false);
container.addEventListener("touchend", dragEnd, false);
container.addEventListener("touchmove", drag, false);
container.addEventListener("mousedown", dragStart, false);
container.addEventListener("mouseup", dragEnd, false);
container.addEventListener("mousemove", drag, false);

// Event listeners for all inputs and toggles
placeholders.forEach(({ input, toggle, config }) => {
    document.getElementById(input).addEventListener('input', drawCanvas);
    document.getElementById(toggle).addEventListener('change', drawCanvas);
    
    // Add listeners for configuration inputs
    Object.values(config).forEach(configId => {
        document.getElementById(configId).addEventListener('change', drawCanvas);
        document.getElementById(configId).addEventListener('input', drawCanvas);
    });
});

paperSizeInput.addEventListener('change', updateCanvasSize);
orientationInput.addEventListener('change', updateCanvasSize);

downloadBtn.addEventListener('click', async () => {
    const paperSize = getPaperSizeInPixels();
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = paperSize.width;
    tempCanvas.height = paperSize.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.drawImage(certificateImage, 0, 0, paperSize.width, paperSize.height);

    const containerRect = container.getBoundingClientRect();
    const scale = paperSize.width / containerRect.width;
    
    placeholders.forEach(({ text, toggle, config }) => {
        const element = document.getElementById(text);
        const toggleElement = document.getElementById(toggle);
        
        if (toggleElement.checked) {
            const rect = element.getBoundingClientRect();
            const pos = positions[text];
            
            const textAlign = document.getElementById(config.align).value;
            let x;
            if (textAlign === 'left') {
                x = pos.x * scale;
            } else if (textAlign === 'right') {
                x = (pos.x + rect.width) * scale;
            } else {
                x = (pos.x + rect.width / 2) * scale;
            }
            
            const y = (pos.y + rect.height / 2) * scale;

            const fontWeight = document.getElementById(config.fontWeight).value;
            const fontSize = document.getElementById(config.fontSize).value;
            const fontFamily = document.getElementById(config.fontFamily).value;
            const fontColor = document.getElementById(config.fontColor).value;

            tempCtx.font = `${fontWeight} ${fontSize * scale}px "${fontFamily}"`;
            tempCtx.fillStyle = fontColor;
            tempCtx.textAlign = textAlign;
            tempCtx.textBaseline = 'middle';
            tempCtx.fillText(element.textContent, x, y);
        }
    });

    const imgData = tempCanvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
        orientation: orientationInput.value,
        unit: 'mm',
        format: paperSizeInput.value
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    pdf.save('certificate.pdf');
});
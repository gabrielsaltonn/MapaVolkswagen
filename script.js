// Seletores principais
const mapWrap = document.getElementById('mapWrap');
const floor = document.getElementById('floor');
const pinsDiv = document.getElementById('pins');
const toggleHelper = document.getElementById('toggleHelper');
const helper = document.querySelector('.helper');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closemodal');
const mTitle = document.getElementById('mTitle');
const mDesc = document.getElementById('mDesc');
const mModel = document.getElementById('mModel');
const mSerial = document.getElementById('mSerial');
const mLoc = document.getElementById('mLoc');
const mNotes = document.getElementById('mNotes');
const mImg = document.getElementById('mImg');
const printers = [];

//Recuperar pins salvos

let printer = JSON.parse(localStorage.getItem("printers")) || [];

let captureMode = false;
let currentPrinterIndex = null;

// ====== PANZOOM ======
const panzoomArea = document.getElementById('panzoom-area');
const panzoomInstance = Panzoom(panzoomArea, {
    maxScale: 10,
    minScale: 1,
    contain: 'outside'
});

// Permitir zoom com a rodinha do mouse
panzoomArea.parentElement.addEventListener('wheel', panzoomInstance.zoomWithWheel);

//Salvar no localStorage
function savePrinters(){
    localStorage.setItem("printers", JSON.stringify(printers));
}

//Atualizar contador

function updateCounter(){
    const counterE1 = document.getElementById("printerCounter");
    if (counterE1) {
        counterE1.textContent = `${printers.length} impressoras`;
    }
}

// Função para criar pins
function renderPins(showCheckboxes = false) {
    pinsDiv.innerHTML = '';
    printers.forEach((printer, index) => {
        const wrapper = document.createElement('div');
        wrapper.style.position = "absolute";
        wrapper.style.left = printer.x + '%';
        wrapper.style.top = printer.y + '%';
        wrapper.style.transform = "translate(-50%, -50%)";
        
        const pin = document.createElement('div');
        pin.classList.add('pin');
        pin.title = printer.title;
        pin.addEventListener('click', () => showModal(printer, index));
        wrapper.appendChild(pin);

        if (showCheckboxes) {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("pin-checkbox");
            checkbox.dataset.index = index;
            wrapper.appendChild(checkbox);
        }
    });

    // Ajusta imediatamente para o zoom atual
    const currentScale = panzoomInstance.getScale();
    adjustPins(currentScale);
}

// Alternar modo de adição de impressora
toggleHelper.addEventListener('click', () => {
    captureMode = !captureMode;
    toggleHelper.textContent = captureMode ? 'Cliqe no mapa 2x para adicionar' : 'Adicionar impressora';
});

// Adicionar impressoras após dois cliques
panzoomArea.addEventListener('dblclick', (e) => {
    if (!captureMode) return;

    const rect = panzoomArea.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    printers.push({
        title: "Nova Impressora",
        desc: "Adicionada manualmente",
        model: "Modelo X",
        serial: "000000",
        loc: "Novo setor",
        notes: "Sem observações",
        img: "./img/printer.png",
        x: x,
        y: y
    });
    renderPins();
});

// Atualizar pins conforme o zoom
panzoomArea.addEventListener('panzoomchange', (e) => {
    const scale = e.detail.scale;
    adjustPins(scale);
});

function adjustPins(scale) {
    const pins = document.querySelectorAll('.pin');

    const minSize = 1;
    const maxSize = 10;
    const minBorder = 0;
    const maxBorder = 5;

    const maxScale = panzoomInstance.getOptions().maxScale;

    pins.forEach(pin => {
        const size = maxSize - (scale - 1) * (maxSize - minSize) / (maxScale - 1);
        const border = maxBorder - (scale - 1) * (maxBorder - minBorder) / (maxScale - 1);

        pin.style.width = `${Math.max(minSize, size)}px`;
        pin.style.height = `${Math.max(minSize, size)}px`;
        pin.style.border = `${Math.max(minBorder, border)}px solid white`;
        pin.style.boxShadow = `0 0 ${Math.max(1, border)}px rgba(0,0,0,0.5)`;
    });
}

// Inicializar pins
renderPins();

// Mostrar modal com dados da impressora
function showModal(printer, index) {
    currentPrinterIndex = index;
    mTitle.textContent = printer.title;
    mDesc.textContent = printer.desc;
    mModel.textContent = printer.model;
    mSerial.textContent = printer.serial;
    mLoc.textContent = printer.loc;
    mNotes.textContent = printer.notes;
    mImg.src = printer.img;
    modal.style.display = 'flex';
}

// Fechar modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Fechar modal clicando fora
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Botão de deletar impressora dentro do modal e na sidebar
function deletePrinter() {
    if (currentPrinterIndex !== null) {
        printers.splice(currentPrinterIndex, 1);
        renderPins();
        modal.style.display = 'none';
        currentPrinterIndex = null;
    }
}

document.getElementById("deletePrinterSidebarBtn").addEventListener("click", deletePrinter);
document.getElementById("deletePrinterBtn").addEventListener("click", deletePrinter);

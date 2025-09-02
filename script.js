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

let captureMode = false;

// Dados simulados das impressoras
const printers = [
    {
        title: "Impressora 01",
        desc: "Impressora do setor A",
        model: "HP LaserJet 1020",
        serial: "123456",
        loc: "Setor A",
        notes: "Trocar toner em 15 dias",
        img: "./img/printer.png",
        x: 20, // Percentual
        y: 30
    },
    {
        title: "Impressora 02",
        desc: "Impressora do setor B",
        model: "Canon LBP 2900",
        serial: "654321",
        loc: "Setor B",
        notes: "Funciona bem",
        img: "./img/printer.png",
        x: 60,
        y: 50
    }
];

// Função para criar pins
function renderPins() {
    pinsDiv.innerHTML = '';
    printers.forEach((printer, index) => {
        const pin = document.createElement('div');
        pin.classList.add('pin');
        pin.style.left = printer.x + '%';
        pin.style.top = printer.y + '%';
        pin.title = printer.title;
        pin.addEventListener('click', () => showModal(printer));
        pinsDiv.appendChild(pin);
    });
}

// Mostrar modal com dados da impressora
function showModal(printer) {
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

// Alternar modo de captura de coordenadas
toggleHelper.addEventListener('click', () => {
    captureMode = !captureMode;
    helper.style.display = captureMode ? 'block' : 'none';
    toggleHelper.textContent = captureMode ? 'Clique na planta para capturar' : 'Capturar coordenadas';
});

// Captura de coordenadas ao clicar na planta
mapWrap.addEventListener('click', (e) => {
    if (!captureMode) return;
    const rect = mapWrap.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    alert(`Coordenadas capturadas:\nX: ${x.toFixed(1)}%\nY: ${y.toFixed(1)}%`);
});

// Inicializar pins
renderPins();

// ====== PANZOOM ======
// Ativar Panzoom apenas na imagem da planta
const panzoomInstance = Panzoom(floor, {
    maxScale: 10,   // zoom máximo (3x)
    minScale: 1,   // zoom mínimo (1x)
    contain: 'outside' // mantém dentro da tela
});

// Permitir zoom com a rodinha do mouse
floor.parentElement.addEventListener('wheel', panzoomInstance.zoomWithWheel);

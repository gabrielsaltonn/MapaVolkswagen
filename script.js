// Seletores principais
const mapWrap = document.getElementById('mapWrap');
const floor = document.getElementById('floor');
const pinsDiv = document.getElementById('pins');
const toggleHelper = document.getElementById('toggleHelper');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const deletePrinterSidebarBtn = document.getElementById('deletePrinterSidebarBtn');

// Formulário do modal
const mModel = document.getElementById('mModel');
const mSerial = document.getElementById('mSerial');
const mIP = document.getElementById('mIP');
const mLoc = document.getElementById('mLocal');
const mCol = document.getElementById('mCol');
const mNotes = document.getElementById('mNotes');
const mBackup = document.getElementById('mBckp');
const savePrinterBtn = document.getElementById('salvarImpressora');

// Fotos
const photoPreview = document.getElementById('previewFoto');
const prevPhotoBtn = document.getElementById('fotoAnterior');
const nextPhotoBtn = document.getElementById('proxFoto');
const addPhotoBtn = document.getElementById('addFotoBtn');
const removePhotoBtn = document.getElementById('removerFoto');
const photoInput = document.getElementById('adFoto');

// Dados
let printers = JSON.parse(localStorage.getItem("printers")) || [];
let captureMode = false;
let currentPrinterIndex = null;
let currentPhotoIndex = 0;
let selectedPins = new Set();

// Panzoom
const panzoomArea = document.getElementById('panzoom-area');
const panzoomInstance = Panzoom(panzoomArea, {
    maxScale: 10,
    minScale: 1,
    contain: 'outside'
});
panzoomArea.parentElement.addEventListener('wheel', panzoomInstance.zoomWithWheel);

// Salvar no localStorage
function savePrinters() {
    localStorage.setItem("printers", JSON.stringify(printers));
}

// Atualizar contadores
function updateCounters() {
    document.getElementById("printerCounter").textContent = `${printers.length} ${printers.length === 1 ? 'impressora' : 'impressoras'}`;
    const backups = printers.filter(p => p.backup).length;
    document.getElementById("bkpCounter").textContent = ` | ${backups} backups ativos`;
}

// Ajustar tamanho dos pins conforme o zoom
function adjustPins(scale) {
    const minSize = 1;   // ponto mínimo
    const maxSize = 10;  // bolinha grande
    const zoomMax = panzoomInstance.getOptions().maxScale;
    const zoomMin = panzoomInstance.getOptions().minScale;

    // cálculo proporcional inverso
    const size = Math.max(minSize, maxSize - ((scale - zoomMin) / (zoomMax - zoomMin)) * (maxSize - minSize));

    document.querySelectorAll(".pin-circle").forEach(pin => {
        pin.style.width = `${size}px`;
        pin.style.height = `${size}px`;

        // No zoom máximo, vira só um ponto sólido
        if (size <= 1.5) {
            pin.style.border = "none";
            pin.style.boxShadow = "none";
        } else {
            pin.style.border = "1px solid white";
            pin.style.boxShadow = "0 0 3px rgba(0,0,0,0.45)";
        }
    });

    document.querySelectorAll(".pin-tip").forEach(tip => {
        if (size <= 1.5) {
            tip.style.display = "none"; // 🔴 ponta some no zoom máximo
        } else {
            tip.style.display = "block";
            tip.style.width = `${size * 0.8}px`;
            tip.style.height = `${size * 1.2}px`;
        }
    });
}

// Renderizar pins
function renderPins(selectMode = false) {
    pinsDiv.innerHTML = "";
    printers.forEach((printer, index) => {
        const pinWrapper = document.createElement("div");
        pinWrapper.className = "pin-wrapper";
        pinWrapper.style.left = `${printer.x}%`;
        pinWrapper.style.top = `${printer.y}%`;

        const circle = document.createElement("div");
        circle.className = "pin-circle";
        circle.style.background = printer.backup ? "green" : "red";

        const tip = document.createElement("div");
        tip.className = "pin-tip";
        tip.style.background = printer.backup ? "green" : "red";

        pinWrapper.appendChild(circle);
        pinWrapper.appendChild(tip);

        pinWrapper.addEventListener("click", () => {
            if (selectMode) {
                if (selectedPins.has(index)) {
                    selectedPins.delete(index);
                    pinWrapper.classList.remove("selected-pin");
                } else {
                    selectedPins.add(index);
                    pinWrapper.classList.add("selected-pin");
                }
            } else {
                showModal(printer, index);
            }
        });

        pinsDiv.appendChild(pinWrapper);
    });

    updateCounters();
    adjustPins(panzoomInstance.getScale());
}

// Mostrar modal
function showModal(printer, index) {
    currentPrinterIndex = index;
    currentPhotoIndex = 0;
    if (!printer.photos || printer.photos.length === 0) printer.photos = ["./img/printer.png"];
    photoPreview.src = printer.photos[currentPhotoIndex];

    mModel.value = printer.model;
    mSerial.value = printer.serial;
    mIP.value = printer.ip;
    mLoc.value = printer.loc;
    mCol.value = printer.col;
    mNotes.value = printer.notes;
    mBackup.checked = printer.backup;

    modal.style.display = 'flex';
}

// Navegação de fotos
prevPhotoBtn.addEventListener("click", () => {
    const printer = printers[currentPrinterIndex];
    if (!printer.photos) return;
    currentPhotoIndex = (currentPhotoIndex - 1 + printer.photos.length) % printer.photos.length;
    photoPreview.src = printer.photos[currentPhotoIndex];
});
nextPhotoBtn.addEventListener("click", () => {
    const printer = printers[currentPrinterIndex];
    if (!printer.photos) return;
    currentPhotoIndex = (currentPhotoIndex + 1) % printer.photos.length;
    photoPreview.src = printer.photos[currentPhotoIndex];
});

// Adicionar foto
addPhotoBtn.addEventListener("click", () => photoInput.click());
photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        printers[currentPrinterIndex].photos.push(reader.result);
        savePrinters();
        currentPhotoIndex = printers[currentPrinterIndex].photos.length - 1;
        photoPreview.src = printers[currentPrinterIndex].photos[currentPhotoIndex];
    };
    reader.readAsDataURL(file);
});

// Remover foto
removePhotoBtn.addEventListener("click", () => {
    const printer = printers[currentPrinterIndex];
    if (printer.photos.length > 1) {
        printer.photos.splice(currentPhotoIndex, 1);
        currentPhotoIndex = Math.max(0, currentPhotoIndex - 1);
        photoPreview.src = printer.photos[currentPhotoIndex];
        savePrinters();
    }
});

// Salvar impressora
savePrinterBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const printer = printers[currentPrinterIndex];
    printer.model = mModel.value;
    printer.serial = mSerial.value;
    printer.ip = mIP.value;
    printer.loc = mLoc.value;
    printer.col = mCol.value;
    printer.notes = mNotes.value;
    printer.backup = mBackup.checked;
    savePrinters();
    renderPins();
    modal.style.display = 'none';
});

// Fechar modal
closeModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// Adicionar impressora com duplo clique
panzoomArea.addEventListener('dblclick', (e) => {
    if (!captureMode) return;
    const rect = panzoomArea.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    printers.push({
        model: " ",
        serial: " ",
        ip: " ",
        loc: " ",
        col: " ",
        notes: " ",
        backup: false,
        photos: ["./img/printer.png"],
        x, y
    });
    savePrinters();
    renderPins();
});

// Zoom altera pins
panzoomArea.addEventListener('panzoomchange', (e) => adjustPins(e.detail.scale));

// Alternar modo de captura
toggleHelper.addEventListener('click', () => {
    captureMode = !captureMode;
    toggleHelper.textContent = captureMode ? 'Clique no mapa 2x para adicionar' : 'Adicionar impressoras';
});

// Excluir impressora individual
function deletePrinter() {
    if (currentPrinterIndex !== null) {
        printers.splice(currentPrinterIndex, 1);
        savePrinters();
        renderPins();
        modal.style.display = 'none';
        currentPrinterIndex = null;
    }
}
document.getElementById("deletePrinterBtn").addEventListener("click", deletePrinter);

// Excluir múltiplas impressoras
function enableMultiDelete() {
    selectedPins.clear();
    renderPins(true);
    const sidebar = document.querySelector(".sidebar-buttons");
    if (document.getElementById("confirmDeleteBtn")) return;

    const confirmBtn = document.createElement("button");
    confirmBtn.id = "confirmDeleteBtn";
    confirmBtn.textContent = "Confirmar exclusão";
    confirmBtn.style.background = "red";
    confirmBtn.style.color = "white";
    confirmBtn.style.marginTop = "10px";
    sidebar.appendChild(confirmBtn);

    const cancelBtn = document.createElement("button");
    cancelBtn.id = "cancelDeleteBtn";
    cancelBtn.textContent = "Cancelar exclusão";
    cancelBtn.style.background = "red";
    cancelBtn.style.color = "white";
    cancelBtn.style.marginTop = "5px";
    sidebar.appendChild(cancelBtn);

    confirmBtn.addEventListener("click", () => {
        printers = printers.filter((_, i) => !selectedPins.has(i));
        savePrinters();
        selectedPins.clear();
        renderPins();
        confirmBtn.remove();
        cancelBtn.remove();
    });

    cancelBtn.addEventListener("click", () => {
        selectedPins.clear();
        renderPins();
        confirmBtn.remove();
        cancelBtn.remove();
    });
}
document.getElementById("deletePrinterSidebarBtn").addEventListener("click", enableMultiDelete);

// Inicializar pins
renderPins();

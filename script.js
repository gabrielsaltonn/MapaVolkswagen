// Seletores principais
const mapWrap = document.getElementById('mapWrap');
const floor = document.getElementById('floor');
const pinsDiv = document.getElementById('pins');
const toggleHelper = document.getElementById('toggleHelper');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closemodal');
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
 
// Renderizar pins
function renderPins(multiDeleteMode = false) {
    pinsDiv.innerHTML = '';
    printers.forEach((printer, index) => {
        const wrapper = document.createElement('div');
        wrapper.style.position = "absolute";
        wrapper.style.left = printer.x + '%';
        wrapper.style.top = printer.y + '%';
        wrapper.style.transform = "translate(-50%, -50%)";
 
        const pin = document.createElement('div');
        pin.classList.add('pin');
        pin.title = printer.model;
        if (printer.backup) pin.style.background = "green";
 
        if (multiDeleteMode) {
            pin.addEventListener('click', () => {
                if (selectedPins.has(index)) {
                    selectedPins.delete(index);
                    pin.classList.remove("selected-pin");
                } else {
                    selectedPins.add(index);
                    pin.classList.add("selected-pin");
                }
            });
        } else {
            pin.addEventListener('click', () => showModal(printer, index));
        }
 
        if (selectedPins.has(index)) pin.classList.add("selected-pin");
 
        wrapper.appendChild(pin);
        pinsDiv.appendChild(wrapper);
    });
 
    adjustPins(panzoomInstance.getScale());
    updateCounters();
}
 
// Ajustar tamanho dos pins conforme zoom
function adjustPins(scale) {
    const pins = document.querySelectorAll('.pin');
    const minSize = 1, maxSize = 10, minBorder = 0, maxBorder = 5;
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
        model: "",
        serial: "",
        ip: "",
        loc: "",
        col: "",
        notes: "Sem observações.",
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
    toggleHelper.textContent = captureMode ? 'Clique no mapa 2x para adicionar\nou clique aqui para cancelar' : 'Adicionar impressoras';
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
document.getElementById("deletePrinterBtn").addEventListener("click", deletePrinter);
 
// Inicializar pins
renderPins();
 
 
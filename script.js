// Seletores principais
const mapWrap = document.getElementById('mapWrap');
const floor = document.getElementById('floor');
const pinsDiv = document.getElementById('pins');
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
let printers = [];
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

// ================== API ==================
const API_URL = "http://localhost:3000/api/impressoras";

// Buscar impressoras do servidor
async function carregarImpressorasDoServidor() {
    try {
        const resp = await fetch(API_URL);
        if (!resp.ok) throw new Error("Erro ao buscar impressoras");
        printers = await resp.json();
        renderPins();
    } catch (err) {
        console.error("⚠️ Backend não respondeu, usando localStorage:", err);
        printers = JSON.parse(localStorage.getItem("printers")) || [];
        renderPins();
    }
}

// Criar impressora
async function criarImpressoraNoServidor(printer) {
    try {
        const resp = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(printer)
        });
        if (!resp.ok) throw new Error("Erro ao criar impressora");
        return await resp.json();
    } catch (err) {
        console.error("Erro ao criar:", err);
    }
}

// Atualizar impressora
async function atualizarImpressoraNoServidor(id, partial) {
    try {
        const resp = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(partial)
        });
        if (!resp.ok) throw new Error("Erro ao atualizar");
        return await resp.json();
    } catch (err) {
        console.error("Erro ao atualizar:", err);
    }
}

// Deletar impressora
async function deletarImpressoraNoServidor(id) {
    try {
        const resp = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!resp.ok) throw new Error("Erro ao deletar");
        return await resp.json();
    } catch (err) {
        console.error("Erro ao deletar:", err);
    }
}

// ================== FUNÇÕES EXISTENTES ==================

// Atualizar contadores
function updateCounters(filteredCount = null) {
    const total = printers.length;
    const backups = printers.filter(p => p.backup).length;

    if (filteredCount !== null && filteredCount !== total) {
        document.getElementById("printerCounter").textContent =
            `${filteredCount} de ${total} impressoras`;
    } else {
        document.getElementById("printerCounter").textContent =
            `${total} ${total === 1 ? 'impressora' : 'impressoras'}`;
    }

    document.getElementById("bkpCounter").textContent =
        ` | ${backups} backups ativos`;
}

// Ajustar tamanho dos pins conforme o zoom
function adjustPins(scale) {
    const minSize = 1;
    const maxSize = 10;
    const zoomMax = panzoomInstance.getOptions().maxScale;
    const zoomMin = panzoomInstance.getOptions().minScale;

    const size = Math.max(minSize, maxSize - ((scale - zoomMin) / (zoomMax - zoomMin)) * (maxSize - minSize));

    document.querySelectorAll(".pin-circle").forEach(pin => {
        pin.style.width = `${size}px`;
        pin.style.height = `${size}px`;
        if (size <= 1.5) {
            pin.style.border = "none";
            pin.style.boxShadow = "none";
        } else {
            pin.style.border = "1px solid white";
            pin.style.boxShadow = "0 0 3px rgba(0,0,0,0.45)";
        }
    });

    document.querySelectorAll(".pin-tip").forEach(tip => {
        tip.style.display = size <= 1.5 ? "none" : "block";
        if (size > 1.5) {
            tip.style.width = `${size * 0.8}px`;
            tip.style.height = `${size * 1.2}px`;
        }
    });
}

// Renderizar pins
function renderPins(data = printers, selectMode = false) {
    pinsDiv.innerHTML = "";
    data.forEach((printer, index) => {
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
                if (selectedPins.has(printer.id)) {
                    selectedPins.delete(printer.id);
                    pinWrapper.classList.remove("selected-pin");
                } else {
                    selectedPins.add(printer.id);
                    pinWrapper.classList.add("selected-pin");
                }
            } else {
                const realIndex = data.findIndex(p => p.id === printer.id);
                showModal(printer, realIndex);
            }
        });

        pinsDiv.appendChild(pinWrapper);
    });

    updateCounters(data.length);
    adjustPins(panzoomInstance.getScale());
}

// Mostrar modal
function showModal(printer, index) {
    currentPrinterIndex = index;
    currentPhotoIndex = 0;
    if (!printer.photos || printer.photos.length === 0) printer.photos = ["./img/printer.png"];
    photoPreview.src = printer.photos[currentPhotoIndex];

    mModel.value = printer.model || "";
    mSerial.value = printer.serial || "";
    mIP.value = printer.ip || "";
    mLoc.value = printer.loc || "";
    mCol.value = printer.col || "";
    mNotes.value = printer.notes || "";
    mBackup.checked = printer.backup || false;

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
    reader.onload = async () => {
        printers[currentPrinterIndex].photos.push(reader.result);
        await atualizarImpressoraNoServidor(printers[currentPrinterIndex].id, { photos: printers[currentPrinterIndex].photos });
        photoPreview.src = printers[currentPrinterIndex].photos[currentPhotoIndex];
    };
    reader.readAsDataURL(file);
});

// Remover foto
removePhotoBtn.addEventListener("click", async () => {
    const printer = printers[currentPrinterIndex];
    if (printer.photos.length > 1) {
        printer.photos.splice(currentPhotoIndex, 1);
        currentPhotoIndex = Math.max(0, currentPhotoIndex - 1);
        photoPreview.src = printer.photos[currentPhotoIndex];
        await atualizarImpressoraNoServidor(printer.id, { photos: printer.photos });
    }
});

// Salvar impressora
savePrinterBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const printer = printers[currentPrinterIndex];
    const updated = {
        model: mModel.value,
        serial: mSerial.value,
        ip: mIP.value,
        loc: mLoc.value,
        col: mCol.value,
        notes: mNotes.value,
        backup: mBackup.checked
    };
    await atualizarImpressoraNoServidor(printer.id, updated);
    await carregarImpressorasDoServidor();
    modal.style.display = 'none';
});

// Fechar modal
closeModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// Adicionar impressora com duplo clique (novo fluxo direto)
panzoomArea.addEventListener('dblclick', async (e) => {
    const rect = panzoomArea.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const nova = {
        model: "",
        serial: "",
        ip: "",
        loc: "",
        col: "",
        notes: "",
        backup: false,
        photos: ["./img/printer.png"],
        x, y
    };

    const criada = await criarImpressoraNoServidor(nova);
    await carregarImpressorasDoServidor();

    const idx = printers.findIndex(p => p.id === criada.id);
    if (idx !== -1) {
        showModal(printers[idx], idx);
    }
});

// Zoom altera pins
panzoomArea.addEventListener('panzoomchange', (e) => adjustPins(e.detail.scale));

// Excluir impressora individual
document.getElementById("deletePrinterBtn").addEventListener("click", async () => {
    const printer = printers[currentPrinterIndex];
    await deletarImpressoraNoServidor(printer.id);
    await carregarImpressorasDoServidor();
    modal.style.display = 'none';
    currentPrinterIndex = null;
});

// Excluir múltiplas impressoras
function enableMultiDelete() {
    selectedPins.clear();
    renderPins(printers, true);
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

    confirmBtn.addEventListener("click", async () => {
        await fetch(`${API_URL}/bulk-delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: Array.from(selectedPins) })
        });
        selectedPins.clear();
        await carregarImpressorasDoServidor();
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
deletePrinterSidebarBtn.addEventListener("click", enableMultiDelete);

// Inicializar
carregarImpressorasDoServidor();

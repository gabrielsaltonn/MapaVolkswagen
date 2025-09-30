// Seletores principais
const mapWrap = document.getElementById('mapWrap');
const floor = document.getElementById('floor');
const pinsDiv = document.getElementById('pins');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const deletePrinterSidebarBtn = document.getElementById('deletePrinterSidebarBtn');
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

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

// Botões adicionais
const addPrinterBtn = document.getElementById("addPrinterSidebarBtn");
const deletePrinterBtn = document.getElementById("deletePrinterBtn");

// Dados
let printers = [];
let currentPrinterIndex = null;
let currentPhotoIndex = 0;
let selectedPins = new Set();

// Estados
let selectMode = false;
let addMode = false;
let addModeTimer = null;

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

// ================== FILTRO DE BUSCA ======
const searchInput = document.getElementById("search");

searchInput.addEventListener("input", () => {
    const termo = searchInput.value.toLowerCase().trim();

    if (!termo) {
        renderPins(printers);
        return;
    }

    const filtradas = printers.filter(p =>
        (p.model && p.model.toLowerCase().includes(termo)) ||
        (p.serial && p.serial.toLowerCase().includes(termo)) ||
        (p.ip && p.ip.toLowerCase().includes(termo)) ||
        (p.loc && p.loc.toLowerCase().includes(termo)) ||
        (p.col && p.col.toLowerCase().includes(termo)) ||
        (p.notes && p.notes.toLowerCase().includes(termo))
    );

    renderPins(filtradas);
});

// Buscar impressoras do servidor
async function carregarImpressorasDoServidor() {
    try {
        const resp = await fetch(API_URL);
        if (!resp.ok) throw new Error("Erro ao buscar impressoras");
        printers = await resp.json();
        console.log("Impressoras carregadas:", printers);
        renderPins();
    } catch (err) {
        console.error("Backend não respondeu, usando localStorage:", err);
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
        ` | ${backups} Backups ativos`;
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
function renderPins(data = printers) {
    pinsDiv.innerHTML = "";
    console.log("Renderizando pins:", data);

    data.forEach((printer) => {
        if (printer.x === undefined || printer.y === undefined) {
            console.warn("Impressora sem coordenadas:", printer);
            return;
        }

        const pinWrapper = document.createElement("div");
        pinWrapper.className = "pin-wrapper";
        pinWrapper.style.left = printer.x + "%";
        pinWrapper.style.top = printer.y + "%";

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
    photoPreview.src = printer.photos[0];
    mModel.value = printer.model || "";
    mSerial.value = printer.serial || "";
    mIP.value = printer.ip || "";
    mLoc.value = printer.loc || "";
    mCol.value = printer.col || "";
    mNotes.value = printer.notes || "";
    mBackup.checked = printer.backup ? true : false;
    modal.style.display = "flex";
}

// Fechar modal
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

// Salvar impressora
savePrinterBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (currentPrinterIndex === null) return;

    const printer = printers[currentPrinterIndex];
    const atualizado = {
        model: mModel.value,
        serial: mSerial.value,
        ip: mIP.value,
        loc: mLoc.value,
        col: mCol.value,
        notes: mNotes.value,
        backup: mBackup.checked,
        photos: printer.photos
    };

    await atualizarImpressoraNoServidor(printer.id, atualizado);
    if (updatedPrinter) {
        printers[currentPrinterIndex] = { ...printer, ...updatedPrinter };
        renderPins();
        modal.style.display="none";
    }
});

// ================== ADICIONAR IMPRESSORA ==================
function disableAddMode() {
    addMode = false;
    addPrinterBtn.textContent = "Adicionar Impressora";
    addPrinterBtn.style.backgroundColor = "";
    if (addModeTimer) {
        clearTimeout(addModeTimer);
        addModeTimer = null;
    }
}

addPrinterBtn.addEventListener("click", () => {
    addMode = !addMode;
    if (addMode) {
        addPrinterBtn.textContent = "Clique 2x no mapa para adicionar";
        addPrinterBtn.style.backgroundColor = "#4CAF50";

        if (addModeTimer) clearTimeout(addModeTimer);
        addModeTimer = setTimeout(disableAddMode, 60000);
    } else {
        disableAddMode();
    }
});

panzoomArea.addEventListener("dblclick", async (e) => {
    if (!addMode) return;

    const rect = panzoomArea.getBoundingClientRect();
    const x = Number(((e.clientX - rect.left) / rect.width) * 100);
    const y = Number(((e.clientY - rect.top) / rect.height) * 100);

    const novaImpressora = {
        model: "",
        serial: "",
        ip: "",
        loc: "",
        col: "",
        notes: "",
        backup: false,
        photos: [],
        x,
        y
    };

    console.log("Criando impressora:", novaImpressora);

    const criada = await criarImpressoraNoServidor(novaImpressora);

    if (criada) {
        printers.push(criada);
        renderPins();
        showModal(criada, printers.length - 1);

        if (addModeTimer) clearTimeout(addModeTimer);
        addModeTimer = setTimeout(disableAddMode, 60000);
    }

    printers.push(novaImpressora)
    renderPins(printers);
});

// ================== INICIALIZAÇÃO ==================
carregarImpressorasDoServidor();

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
    const printers =  [];

    let captureMode = false;

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

    // ====== PANZOOM ======
    const panzoomArea = document.getElementById('panzoom-area');
    const panzoomInstance = Panzoom(panzoomArea, {
        maxScale: 10,   // zoom máximo (3x)
        minScale: 1,   // zoom mínimo (1x)
        contain: 'outside' // mantém dentro da tela
    });

    // Permitir zoom com a rodinha do mouse
    panzoomArea.parentElement.addEventListener('wheel', panzoomInstance.zoomWithWheel);

    // Captura de coordenadas ao clicar DOIS cliques na planta
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

    // Inicializar pins
    renderPins();

    //Botão de deletar impressora dentro do modal
    document.getElementById("deletePrinterBtn").addEventListener("click", function () {
        const printerId = currentPrinter.id; // Supondo que você tenha essa referência
        removePrinterFromMap(printerId);
        closePrinterModal();
    });

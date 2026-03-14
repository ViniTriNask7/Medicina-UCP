// ==========================================================
// MEDICINA PY - SCRIPT PRINCIPAL (VERSÃO FINAL CORRIGIDA)
// ==========================================================

// ===== CONFIGURAÇÕES GLOBAIS =====
const APP_VERSION = '2.0.0';
const USER_KEY = 'medicina_py_user';
const THEME_KEY = 'medicina_py_theme';

// ===== BANCO DE DADOS (CURRÍCULO em ESPANHOL) =====
const CURRICULO = {
    1: ["Anatomía I", "Histología I", "Embriología", "Biología", "Historia de la Medicina", "Lengua Castellana"],
    2: ["Anatomía II", "Histología II", "Metodología", "Bioestadística", "Medicina Comunitaria", "Psicología", "Guaraní"],
    3: ["Fisiología I", "Bioquímica I", "Biofísica", "Inmunología", "Genética", "Microbiología I"],
    4: ["Fisiología II", "Microbiología II", "Bioquímica II", "Bioética", "Nutrición", "Epidemiología"],
    5: ["Fisiopatología I", "Farmacología I", "Semiología Médica I", "Anatomía Patológica I", "Gestion en Salud"],
    6: ["Fisiopatología II", "Farmacología II", "Semiología Médica II", "Anatomía Patológica II", "Primeros Auxilios", "Imagenología"],
    7: ["Oftalmología", "Ortopedia", "Toxicología", "Dermatología", "Neumología", "Medicina Legal"],
    8: ["Medicina Interna I", "Gineco-Obstetricia I", "Psiquiatría", "Cirugía I"],
    9: ["Medicina Interna II", "Pediatría I", "Cirugía II", "Gineco-Obstetricia II", "Urología"],
    10: ["Pediatría II", "Cirugía III", "Medicina Interna III", "Oncología", "Rehabilitación"],
    11: ["Medicina Interna", "Pediatría", "Cirugía", "Anfiteatro"],
    12: ["Gineco-Obstetricia", "Atención Primaria", "Emergentología"]
};

// ===== IMAGENS DOS SEMESTRES =====
const IMAGENS_SEMESTRES = {
    1: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?q=80&w=800",
    2: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800",
    3: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=800",
    4: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=800",
    5: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?q=80&w=800",
    6: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800",
    7: "https://images.unsplash.com/photo-1576671081837-49000212a370?q=80&w=800",
    8: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800",
    9: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=800",
    10: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=800",
    11: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800",
    12: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800"
};

// ===== VARIÁVEIS GLOBAIS =====
let appData = JSON.parse(localStorage.getItem('med_v7')) || { 
    time: 0, 
    lastDate: new Date().toLocaleDateString(), 
    currentSem: 1, 
    currentSub: "" 
};

let mainTimerInterval = null;
let isMainTimerRunning = false;
let sessionSeconds = 0;
let pomodoroInterval = null;
let pomodoroTime = 25 * 60;
let isPomodoroRunning = false;

let currentView = 'home';
let currentSubject = null;
let currentSemester = '1';

// ===== INDEXED DB (Arquivos) =====
let db;
const request = indexedDB.open("MedicinaFilesDB", 2);

request.onupgradeneeded = function(e) { 
    db = e.target.result; 
    if (!db.objectStoreNames.contains("files")) {
        const store = db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
        store.createIndex("subject", "subject", { unique: false });
    }
};

request.onsuccess = function(e) { 
    db = e.target.result; 
    console.log('✅ IndexedDB pronto');
};

request.onerror = function(e) {
    console.error('❌ Erro no IndexedDB:', e);
};

// ===== FUNÇÃO PARA PARAR TODOS OS TIMERS =====
function stopAllTimers() {
    if (mainTimerInterval) {
        clearInterval(mainTimerInterval);
        mainTimerInterval = null;
    }
    if (pomodoroInterval) {
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
    }
    isMainTimerRunning = false;
    isPomodoroRunning = false;
    
    const mainIcon = document.querySelector('#main-timer-status-icon i');
    if (mainIcon) mainIcon.className = 'fa-solid fa-play';
    
    const pomoIcon = document.getElementById('pomo-icon');
    if (pomoIcon) pomoIcon.className = 'fa-solid fa-play';
}

// ===== GERENCIAMENTO DE TEMAS =====
function setTheme(themeName) {
    document.body.classList.remove('theme-default', 'theme-white', 'theme-dark', 'theme-ucp');
    if (themeName !== 'default') {
        document.body.classList.add('theme-' + themeName);
    }
    localStorage.setItem(THEME_KEY, themeName);
    updateThemeIndicators(themeName);
}

function updateThemeIndicators(themeName) {
    const dots = document.querySelectorAll('.theme-dot');
    dots.forEach(dot => {
        dot.classList.remove('active');
        dot.style.border = '2px solid var(--border)';
        if (dot.getAttribute('onclick')?.includes(themeName)) {
            dot.style.border = '2px solid var(--primary)';
            dot.classList.add('active');
        }
    });
}

// ===== INICIALIZAÇÃO PRINCIPAL =====
function init() {
    const hoje = new Date().toLocaleDateString();
    if(appData.lastDate !== hoje){
        appData.time = 0;
        appData.lastDate = hoje;
        save();
    }
    
    const savedTheme = localStorage.getItem(THEME_KEY) || 'default';
    setTheme(savedTheme);
    
    updateUserInterface();
    renderHomeStats();
    renderSemestres();
    MedCalendar.init();
    
    if (document.getElementById('note-editor')) {
        autoSaveNotes();
    }
    
    updatePomoDisplay();
    switchView('home');
    restoreTimer();
    
    console.log(`✅ Medicina PY v${APP_VERSION} inicializado`);
}

function updateUserInterface() {
    const userName = localStorage.getItem(USER_KEY) || 'Usuário';
    const welcomeEl = document.getElementById('welcome-message');
    if(welcomeEl) welcomeEl.innerHTML = 'Olá, ' + userName.split(' ')[0] + '! 👋';
    
    const profileName = document.getElementById('user-name-display');
    if(profileName) profileName.textContent = userName;
    
    const avatar = document.getElementById('user-avatar');
    if(avatar) {
        const parts = userName.trim().split(' ');
        if (parts.length >= 2) {
            avatar.textContent = (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
        } else {
            avatar.textContent = userName.substring(0,2).toUpperCase();
        }
    }
}

function restoreTimer() {
    const savedTimer = JSON.parse(localStorage.getItem('medicina_timer'));
    if (savedTimer && savedTimer.running) {
        sessionSeconds = savedTimer.seconds || 0;
        updateMainTimerDisplay();
    }
}

// ===== NAVEGAÇÃO =====
function switchView(viewName) {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar?.classList.remove('active');
    overlay?.classList.remove('active');
    
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    const targetView = document.getElementById('view-' + viewName);
    if(targetView) targetView.classList.add('active');
    
    const btnMap = { 
        home: 'btn-home', 
        semestres: 'btn-semestres', 
        calendario: 'btn-calendario',
        focus: 'btn-semestres' 
    };
    
    const btnId = btnMap[viewName]; 
    if(btnId) document.getElementById(btnId)?.classList.add('active');
    
    currentView = viewName;
    
    if (viewName === 'calendario') {
        MedCalendar.renderizarAgenda();
        MedCalendar.popularSelectMaterias();
    } else if (viewName === 'focus' && currentSubject) {
        renderVideosList();
        renderTasks();
        renderFilesList();
    }
}

// ===== TIMER PRINCIPAL =====
function toggleMainTimer() {
    const icon = document.querySelector('#main-timer-status-icon i');
    if(isMainTimerRunning){
        clearInterval(mainTimerInterval);
        icon.className = 'fa-solid fa-play';
        isMainTimerRunning = false;
        localStorage.setItem('medicina_timer', JSON.stringify({
            running: false,
            seconds: sessionSeconds
        }));
    } else{
        icon.className = 'fa-solid fa-pause';
        isMainTimerRunning = true;
        mainTimerInterval = setInterval(() => {
            sessionSeconds++; 
            appData.time++;
            updateMainTimerDisplay();
            if(sessionSeconds % 10 === 0) save();
        }, 1000);
        
        localStorage.setItem('medicina_timer', JSON.stringify({
            running: true,
            seconds: sessionSeconds
        }));
    }
}

function updateMainTimerDisplay() {
    const h = Math.floor(sessionSeconds / 3600);
    const m = Math.floor((sessionSeconds % 3600) / 60);
    const s = sessionSeconds % 60;
    
    const display = document.getElementById('display-main-timer');
    if(display) {
        display.innerText = h.toString().padStart(2,'0') + ':' + 
                           m.toString().padStart(2,'0') + ':' + 
                           s.toString().padStart(2,'0');
    }
}

function stopAndGoHome() {
    if(confirm('Finalizar sessão de estudo?')) {
        clearInterval(mainTimerInterval); 
        isMainTimerRunning = false; 
        
        if (sessionSeconds > 60) {
            saveStudySession();
        }
        
        sessionSeconds = 0;
        const icon = document.querySelector('#main-timer-status-icon i');
        if(icon) icon.className = 'fa-solid fa-play';
        updateMainTimerDisplay();
        save(); 
        renderHomeStats(); 
        switchView('home');
        localStorage.removeItem('medicina_timer');
        showToast('Sessão de estudo finalizada!', 'success');
    }
}

function renderHomeStats() {
    const h = Math.floor(appData.time / 3600);
    const m = Math.floor((appData.time % 3600) / 60);
    
    const statTime = document.getElementById('stat-time');
    const statSem = document.getElementById('stat-sem');
    const statSub = document.getElementById('stat-last-sub');
    
    if(statTime) statTime.innerText = h + 'h ' + m + 'm';
    if(statSem) statSem.innerText = appData.currentSem + 'º';
    if(statSub) statSub.innerText = appData.currentSub || 'Nenhuma';
}

// ===== POMODORO =====
function togglePomodoro() {
    const icon = document.getElementById('pomo-icon');
    if(isPomodoroRunning){
        clearInterval(pomodoroInterval); 
        icon.className = 'fa-solid fa-play';
        isPomodoroRunning = false;
    } else{
        icon.className = 'fa-solid fa-pause';
        isPomodoroRunning = true;
        pomodoroInterval = setInterval(() => {
            if(pomodoroTime > 0){ 
                pomodoroTime--; 
                appData.time++; 
                sessionSeconds++; 
                updatePomoDisplay(); 
                updateMainTimerDisplay(); 
                renderHomeStats(); 
            } else{ 
                clearInterval(pomodoroInterval); 
                showToast('Pomodoro finalizado! Faça uma pausa de 5 minutos.', 'success');
                playNotification();
                resetPomodoro(); 
            }
        }, 1000);
    }
}

function updatePomoDisplay() {
    const m = Math.floor(pomodoroTime / 60);
    const s = pomodoroTime % 60;
    const pDisplay = document.getElementById('pomo-timer'); 
    if(pDisplay) pDisplay.innerText = m + ':' + s.toString().padStart(2,'0');
}

function resetPomodoro() { 
    clearInterval(pomodoroInterval); 
    isPomodoroRunning = false; 
    pomodoroTime = 25 * 60; 
    updatePomoDisplay(); 
    const icon = document.getElementById('pomo-icon'); 
    if(icon) icon.className = 'fa-solid fa-play'; 
}

function saveStudySession() {
    const session = {
        id: Date.now(),
        date: new Date().toISOString(),
        duration: sessionSeconds,
        subject: currentSubject || appData.currentSub || 'Geral',
        semester: currentSemester
    };
    
    let sessions = JSON.parse(localStorage.getItem('medicina_sessions')) || [];
    sessions.push(session);
    localStorage.setItem('medicina_sessions', JSON.stringify(sessions));
}

// ===== SEMESTRES E FOCO =====
function renderSemestres() {
    const container = document.getElementById('container-semestres'); 
    if(!container) return;
    
    container.innerHTML = '';
    for(let i = 1; i <= 12; i++) {
        const card = document.createElement('div');
        card.className = 'sem-card';
        card.style.backgroundImage = 'url("' + IMAGENS_SEMESTRES[i] + '")';
        card.onclick = () => openSemester(i);
        card.innerHTML = '<div class="overlay"><h3>' + i + 'º Semestre</h3><p>' + CURRICULO[i].length + ' Matérias</p></div>';
        container.appendChild(card);
    }
}

function openSemester(semNum) {
    appData.currentSem = semNum; 
    currentSemester = semNum.toString();
    save();
    switchView('focus');
    
    const titleEl = document.getElementById('focus-sem-title');
    if(titleEl) titleEl.innerText = semNum + 'º Semestre';
    
    const listContainer = document.getElementById('focus-subjects-list');
    if(!listContainer) return;
    
    listContainer.innerHTML = '';
    
    CURRICULO[semNum].forEach(materia => {
        const item = document.createElement('div');
        item.className = 'subject-item';
        if (appData.currentSub === materia) {
            item.classList.add('active');
        }
        item.innerHTML = '<i class="fa-solid fa-book-medical"></i> ' + materia;
        item.onclick = () => selectSubject(materia);
        listContainer.appendChild(item);
    });
    
    if(appData.currentSub && CURRICULO[semNum].includes(appData.currentSub)) {
        selectSubject(appData.currentSub);
    } else if (CURRICULO[semNum].length > 0) {
        selectSubject(CURRICULO[semNum][0]);
    }
}

function selectSubject(materia) {
    appData.currentSub = materia; 
    currentSubject = materia;
    save(); 
    renderHomeStats();
    
    const activeSubjectEl = document.getElementById('focus-active-subject');
    if(activeSubjectEl) activeSubjectEl.innerText = materia;
    
    document.querySelectorAll('.subject-item').forEach(el => {
        if (el.innerText.includes(materia)) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
    
    const noteEditor = document.getElementById('note-editor');
    if(noteEditor) {
        noteEditor.value = localStorage.getItem('notes_' + materia) || "";
    }
    
    renderVideosList();
    renderTasks();
    renderFilesList();
}

function resumeStudy() { 
    if(appData.currentSub) {
        openSemester(appData.currentSem);
    } else {
        switchView('semestres');
    }
}

// ===== VÍDEOS =====
function addYouTubeVideo() {
    const input = document.getElementById('youtube-url');
    if (!input) return;
    
    const url = input.value.trim();
    
    if (!url || !appData.currentSub) {
        showToast('Cole um link e selecione uma matéria primeiro', 'warning');
        return;
    }
    
    const videoId = extractVideoId(url);
    if (!videoId) {
        showToast('Link do YouTube inválido!', 'error');
        return;
    }
    
    const key = 'videos_' + appData.currentSub;
    let videos = JSON.parse(localStorage.getItem(key)) || [];
    if (!videos.includes(videoId)) {
        videos.push(videoId);
        localStorage.setItem(key, JSON.stringify(videos));
        input.value = '';
        renderVideosList();
        showToast('Vídeo adicionado!', 'success');
    } else {
        showToast('Este vídeo já foi adicionado', 'info');
    }
}

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
}

function removeVideo(id) {
    if(confirm('Remover este vídeo?')) {
        const key = 'videos_' + appData.currentSub;
        let videos = JSON.parse(localStorage.getItem(key)) || [];
        videos = videos.filter(v => v !== id);
        localStorage.setItem(key, JSON.stringify(videos));
        renderVideosList();
        showToast('Vídeo removido', 'info');
    }
}

function renderVideosList() {
    const grid = document.getElementById('video-grid');
    const placeholder = document.getElementById('video-placeholder-empty');
    
    if (!grid || !placeholder) return;
    
    if (!appData.currentSub) {
        grid.innerHTML = '';
        placeholder.style.display = 'block';
        return;
    }
    
    const videos = JSON.parse(localStorage.getItem('videos_' + appData.currentSub)) || [];

    grid.innerHTML = '';
    placeholder.style.display = videos.length ? 'none' : 'block';

    videos.forEach(id => {
        const videoDiv = document.createElement('div');
        videoDiv.style.position = 'relative';
        videoDiv.style.background = '#000';
        videoDiv.style.borderRadius = '10px';
        videoDiv.style.overflow = 'hidden';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.right = '5px';
        deleteBtn.style.top = '5px';
        deleteBtn.style.zIndex = '10';
        deleteBtn.style.background = 'rgba(239, 68, 68, 0.9)';
        deleteBtn.style.color = 'white';
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = '5px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.width = '30px';
        deleteBtn.style.height = '30px';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            removeVideo(id);
        };
        
        const iframeDiv = document.createElement('div');
        iframeDiv.style.paddingBottom = '56.25%';
        iframeDiv.style.position = 'relative';
        
        const iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube.com/embed/' + id;
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.allowFullscreen = true;
        
        iframeDiv.appendChild(iframe);
        videoDiv.appendChild(deleteBtn);
        videoDiv.appendChild(iframeDiv);
        grid.appendChild(videoDiv);
    });
}

// ===== ANOTAÇÕES =====
function autoSaveNotes() {
    const area = document.getElementById('note-editor'); 
    if(!area) return;
    
    area.addEventListener('input', () => { 
        if(appData.currentSub) {
            localStorage.setItem('notes_' + appData.currentSub, area.value);
            clearTimeout(window.noteSaveTimeout);
            window.noteSaveTimeout = setTimeout(() => {
                showToast('Anotações salvas!', 'success', 1500);
            }, 1000);
        }
    });
}

// ===== TAREFAS =====
function addTask() {
    const input = document.getElementById('task-input'); 
    if (!input) return;
    
    const taskText = input.value.trim();
    
    if(!taskText || !appData.currentSub) {
        showToast('Digite uma tarefa e selecione uma matéria', 'warning');
        return;
    }
    
    const key = 'tasks_' + appData.currentSub;
    const tasks = JSON.parse(localStorage.getItem(key)) || [];
    tasks.push({ text: taskText, done: false });
    localStorage.setItem(key, JSON.stringify(tasks));
    input.value = ''; 
    renderTasks();
    showToast('Tarefa adicionada!', 'success');
}

function renderTasks() {
    const list = document.getElementById('tasks-list'); 
    if(!list) return;
    
    if (!appData.currentSub) {
        list.innerHTML = '<p class="text-muted text-center" style="padding: 20px;">Selecione uma matéria</p>';
        return;
    }
    
    list.innerHTML = '';
    const tasks = JSON.parse(localStorage.getItem('tasks_' + appData.currentSub)) || [];
    
    if (tasks.length === 0) {
        list.innerHTML = '<p class="text-muted text-center" style="padding: 20px;">Nenhuma tarefa pendente</p>';
        return;
    }
    
    tasks.forEach((task, index) => {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.innerHTML = '<div class="task-check ' + (task.done ? 'checked' : '') + '" onclick="toggleTask(' + index + ')">' + 
                        (task.done ? '<i class="fa-solid fa-check"></i>' : '') + '</div>' +
                        '<span class="task-text ' + (task.done ? 'done' : '') + '">' + task.text + '</span>' +
                        '<i class="fa-solid fa-trash task-delete" onclick="deleteTask(' + index + ')"></i>';
        list.appendChild(item);
    });
}

function toggleTask(index) {
    const key = 'tasks_' + appData.currentSub;
    const tasks = JSON.parse(localStorage.getItem(key));
    tasks[index].done = !tasks[index].done;
    localStorage.setItem(key, JSON.stringify(tasks));
    renderTasks();
}

function deleteTask(index) {
    if(confirm('Remover esta tarefa?')) {
        const key = 'tasks_' + appData.currentSub;
        const tasks = JSON.parse(localStorage.getItem(key));
        tasks.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(tasks));
        renderTasks();
        showToast('Tarefa removida', 'info');
    }
}

// ===== ARQUIVOS =====
function initDropZone() {
    const zone = document.getElementById('drop-zone'); 
    const input = document.getElementById('file-input');
    if(!zone || !input) return;
    
    zone.onclick = () => input.click();
    
    input.onchange = e => handleFiles(e.target.files);
    
    zone.ondragover = e => { 
        e.preventDefault(); 
        zone.classList.add('dragover'); 
    };
    
    zone.ondragleave = () => zone.classList.remove('dragover');
    
    zone.ondrop = e => { 
        e.preventDefault(); 
        zone.classList.remove('dragover'); 
        handleFiles(e.dataTransfer.files); 
    };
}

function handleFiles(files) {
    if(!appData.currentSub) {
        showToast("Selecione uma matéria primeiro!", 'warning');
        return;
    }
    
    if (!db) {
        showToast("Banco de dados não inicializado", 'error');
        return;
    }
    
    Array.from(files).forEach(file => {
        if (file.size > 1024 * 1024 * 1024) {
            showToast('Arquivo muito grande (máx 1GB)', 'error');
            return;
        }
        
        const transaction = db.transaction(["files"], "readwrite");
        const store = transaction.objectStore("files");
        
        const fileData = {
            subject: appData.currentSub,
            name: file.name,
            size: file.size,
            type: file.type,
            data: file
        };
        
        const request = store.add(fileData);
        
        request.onsuccess = () => {
            renderFilesList();
            showToast('Arquivo adicionado: ' + file.name, 'success');
        };
        
        request.onerror = () => {
            showToast('Erro ao salvar arquivo', 'error');
        };
    });
}

function renderFilesList() {
    const list = document.getElementById('file-list'); 
    if(!list || !db) return;
    
    list.innerHTML = '';
    
    if (!appData.currentSub) {
        list.innerHTML = '<p class="text-muted text-center" style="padding: 20px;">Selecione uma matéria</p>';
        return;
    }
    
    const transaction = db.transaction(["files"], "readonly");
    const index = transaction.objectStore("files").index("subject");
    const request = index.openCursor(IDBKeyRange.only(appData.currentSub));
    
    let hasFiles = false;
    
    request.onsuccess = e => {
        const cursor = e.target.result;
        if(cursor) {
            hasFiles = true;
            const file = cursor.value;
            const item = document.createElement('div');
            item.className = 'file-item';
            
            let icon = 'fa-file';
            if (file.type.includes('pdf')) icon = 'fa-file-pdf';
            else if (file.type.includes('image')) icon = 'fa-file-image';
            else if (file.type.includes('word')) icon = 'fa-file-word';
            else if (file.type.includes('excel')) icon = 'fa-file-excel';
            
            item.innerHTML = '<i class="fa-solid ' + icon + '" style="font-size:1.5rem;color:var(--primary)"></i>' +
                '<div class="file-info">' +
                '<p><strong>' + file.name + '</strong></p>' +
                '<span>' + (file.size / (1024 * 1024)).toFixed(2) + ' MB</span>' +
                '</div>' +
                '<div class="file-actions">' +
                '<button class="file-btn" onclick="downloadFile(' + file.id + ')"><i class="fa-solid fa-download"></i></button>' +
                '<button class="file-btn delete" onclick="deleteFile(' + file.id + ')"><i class="fa-solid fa-trash"></i></button>' +
                '</div>';
            
            list.appendChild(item);
            cursor.continue();
        } else {
            if (!hasFiles) {
                list.innerHTML = '<p class="text-muted text-center" style="padding: 20px;">Nenhum arquivo para esta matéria</p>';
            }
        }
    };
}

function downloadFile(id) {
    const transaction = db.transaction(["files"], "readonly");
    const request = transaction.objectStore("files").get(id);
    
    request.onsuccess = e => {
        const file = e.target.result;
        const blob = file.data;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); 
        a.href = url; 
        a.download = file.name; 
        a.click();
        URL.revokeObjectURL(url);
        showToast('Download iniciado: ' + file.name, 'success');
    };
}

function deleteFile(id) {
    if(confirm("Excluir este arquivo?")) {
        const transaction = db.transaction(["files"], "readwrite");
        const request = transaction.objectStore("files").delete(id);
        
        request.onsuccess = () => {
            renderFilesList();
            showToast('Arquivo removido', 'info');
        };
    }
}

// ===== CALENDÁRIO CORRIGIDO =====
const MedCalendar = {
    storageKey: 'med_agenda_v1',
    
    init() {
        this.popularSelectMaterias(); 
        this.renderizarAgenda(); 
        this.atualizarHome();
        
        const inputData = document.getElementById('cal-data'); 
        if(inputData) {
            inputData.value = new Date().toISOString().split('T')[0];
        }
        
        const inputHoras = document.getElementById('cal-horas');
        if(inputHoras) {
            inputHoras.value = '1';
        }
    },
    
    mostrarFormulario() {
        const formBox = document.getElementById('form-agenda-box');
        if (formBox) {
            formBox.style.display = 'block';
            this.popularSelectMaterias();
            const inputData = document.getElementById('cal-data');
            if(inputData) inputData.value = new Date().toISOString().split('T')[0];
            const inputHoras = document.getElementById('cal-horas');
            if(inputHoras) inputHoras.value = '1';
            
            setTimeout(() => {
                formBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    },
    
    esconderFormulario() {
        const formBox = document.getElementById('form-agenda-box');
        if (formBox) formBox.style.display = 'none';
    },
    
    getEventos() { 
        return JSON.parse(localStorage.getItem(this.storageKey)) || []; 
    },
    
    popularSelectMaterias() {
        const select = document.getElementById('cal-materia'); 
        if(!select) return;
        
        let todasMaterias = [];
        Object.values(CURRICULO).forEach(lista => {
            todasMaterias = todasMaterias.concat(lista);
        });
        
        const materiasUnicas = [...new Set(todasMaterias)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
        
        select.innerHTML = '<option value="">📋 Selecione uma matéria</option>' + 
            materiasUnicas.map(m => '<option value="' + m + '">' + m + '</option>').join('');
    },
    
    adicionarEvento() {
        const select = document.getElementById('cal-materia');
        const materia = select ? select.value : '';
        const data = document.getElementById('cal-data')?.value;
        const horas = document.getElementById('cal-horas')?.value;
        const tipo = document.getElementById('cal-tipo')?.value;
        
        if(!materia || materia === "") { 
            showToast("Selecione uma matéria!", 'warning'); 
            return; 
        }
        
        if(!data) { 
            showToast("Selecione uma data!", 'warning'); 
            return; 
        }
        
        if(!horas || parseFloat(horas) <= 0) { 
            showToast("Digite uma duração válida (em horas)!", 'warning'); 
            return; 
        }
        
        const novoEvento = { 
            id: Date.now(), 
            materia, 
            data, 
            horas: parseFloat(horas), 
            tipo: tipo || 'Teórica'
        };
        
        const eventos = this.getEventos(); 
        eventos.push(novoEvento);
        
        eventos.sort((a, b) => {
            if (a.data < b.data) return -1;
            if (a.data > b.data) return 1;
            return 0;
        });
        
        localStorage.setItem(this.storageKey, JSON.stringify(eventos));
        
        this.esconderFormulario();
        this.renderizarAgenda(); 
        this.atualizarHome();
        
        showToast('Evento adicionado à agenda!', 'success');
    },
    
    removerEvento(id) {
        if(confirm('Remover este compromisso?')) {
            const eventos = this.getEventos().filter(e => e.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(eventos));
            this.renderizarAgenda(); 
            this.atualizarHome();
            showToast('Compromisso removido', 'info');
        }
    },
    
    formatarDataBR(dataStr) {
        if (!dataStr) return '';
        const partes = dataStr.split('-'); 
        if (partes.length === 3) {
            return partes[2] + '/' + partes[1] + '/' + partes[0];
        }
        return dataStr;
    },
    
    atualizarHome() {
        const hoje = new Date();
        const hojeStr = hoje.toISOString().split('T')[0];
        
        const amanhaObj = new Date(hoje);
        amanhaObj.setDate(amanhaObj.getDate() + 1); 
        const amanhaStr = amanhaObj.toISOString().split('T')[0];
        
        const eventos = this.getEventos();
        const hojeEventos = eventos.filter(e => e.data === hojeStr);
        const amanhaEventos = eventos.filter(e => e.data === amanhaStr);
        
        const divHoje = document.getElementById('aula-hoje');
        const divAmanha = document.getElementById('aula-amanha');
        
        if(divHoje){
            if(hojeEventos.length > 0) {
                divHoje.innerHTML = hojeEventos.map(e => 
                    '<div style="margin-bottom:5px;border-left:3px solid var(--primary);padding-left:10px;">' +
                    '<b>' + e.materia + '</b><br>' +
                    '<small>' + (e.tipo || 'Aula') + ' • ' + e.horas + 'h</small>' +
                    '</div>'
                ).join('');
            } else {
                divHoje.innerHTML = '<span style="color: var(--text-muted);">Nenhum compromisso hoje 📚</span>';
            }
        }
        
        if(divAmanha){
            if(amanhaEventos.length > 0) {
                divAmanha.innerHTML = '<i class="fa-regular fa-calendar"></i> Amanhã: ' + 
                    amanhaEventos.map(e => e.materia + ' (' + e.horas + 'h)').join(', ');
            } else {
                divAmanha.innerHTML = '<i class="fa-regular fa-calendar"></i> Amanhã: Nenhum compromisso';
            }
        }
    },
    
    renderizarAgenda() {
        const container = document.getElementById('calendario-grid'); 
        if(!container) return;
        
        const eventos = this.getEventos(); 
        
        if(eventos.length === 0) { 
            container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);background:var(--bg-card);border-radius:16px;border:1px solid var(--border);">' +
                '<i class="fa-solid fa-calendar-xmark" style="font-size:3rem;opacity:0.2;margin-bottom:15px;"></i>' +
                '<p style="margin-bottom:20px;">Sua agenda está vazia. Adicione aulas para começar!</p>' +
                '<button class="btn-primary-big" onclick="MedCalendar.mostrarFormulario()">' +
                '<i class="fa-solid fa-plus"></i> Adicionar Aula</button>' +
                '</div>'; 
            return; 
        }
        
        const grupos = {};
        eventos.forEach(evento => {
            if (!grupos[evento.data]) {
                grupos[evento.data] = [];
            }
            grupos[evento.data].push(evento);
        });
        
        const datasOrdenadas = Object.keys(grupos).sort((a, b) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });
        
        container.innerHTML = datasOrdenadas.map(data => 
            '<div style="background:var(--bg-card);border-radius:16px;border:1px solid var(--border);overflow:hidden;margin-bottom:15px;">' +
            '<div style="background:var(--bg-main);padding:12px 15px;border-bottom:1px solid var(--border);font-weight:bold;color:var(--primary);display:flex;align-items:center;gap:10px;">' +
            '<i class="fa-regular fa-calendar-check"></i> ' + this.formatarDataBR(data) +
            '</div>' +
            '<div style="padding:10px 15px;">' +
            grupos[data].map(e => 
                '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">' +
                '<div>' +
                '<strong style="color:var(--text-main);">' + e.materia + '</strong>' +
                '<div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;">' + 
                    (e.tipo || 'Aula') + ' • ' + e.horas + ' horas' +
                '</div>' +
                '</div>' +
                '<button onclick="MedCalendar.removerEvento(' + e.id + ')" style="background:none;border:none;color:var(--danger);cursor:pointer;padding:8px;border-radius:8px;" title="Remover">' +
                '<i class="fa-solid fa-trash-can"></i>' +
                '</button>' +
                '</div>'
            ).join('') +
            '</div>' +
            '</div>'
        ).join('') + 
        '<div style="text-align:center;margin-top:20px;">' +
        '<button class="btn-primary-big" onclick="MedCalendar.mostrarFormulario()">' +
        '<i class="fa-solid fa-plus"></i> Adicionar Novo Evento</button>' +
        '</div>';
    }
};

// ===== TABS =====
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const tab = document.getElementById('tab-' + tabName); 
    if(tab) tab.classList.add('active');
    
    const buttons = document.querySelectorAll('.tab-btn');
    for(let btn of buttons) {
        if(btn.textContent.toLowerCase().includes(tabName)) {
            btn.classList.add('active');
            break;
        }
    }
    
    if (tabName === 'files') {
        setTimeout(() => {
            initDropZone();
            renderFilesList();
        }, 100);
    } else if (tabName === 'video') {
        renderVideosList();
    } else if (tabName === 'tasks') {
        renderTasks();
    }
}

// ===== UTILITÁRIOS =====
function save() { 
    localStorage.setItem('med_v7', JSON.stringify(appData));
}

function showToast(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    toast.innerHTML = '<i class="fa-solid ' + icon + '"></i><span>' + message + '</span>';
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function playNotification() {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAAA8');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Notificação sonora não reproduzida'));
    } catch (e) {
        console.log('Notificação sonora não suportada');
    }
}

// ===== EXPORTAÇÃO E LIMPEZA =====
function exportData() {
    const data = {
        version: APP_VERSION,
        exportDate: new Date().toISOString(),
        user: localStorage.getItem(USER_KEY) || 'Usuário',
        appData: appData,
        calendar: MedCalendar.getEventos(),
        sessions: JSON.parse(localStorage.getItem('medicina_sessions')) || []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medicina-py-backup-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Dados exportados com sucesso!', 'success');
}

// ===== SIDEBAR MOBILE =====
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar?.classList.toggle('active');
    if (overlay) {
        overlay.classList.toggle('active');
    }
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(init, 100);
    
    const taskInput = document.getElementById('task-input');
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
    }
    
    const videoInput = document.getElementById('youtube-url');
    if (videoInput) {
        videoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addYouTubeVideo();
        });
    }
    
    window.addEventListener('beforeunload', () => {
        if (isMainTimerRunning) {
            localStorage.setItem('medicina_timer', JSON.stringify({
                running: true,
                seconds: sessionSeconds
            }));
        }
    });
});

// ===== EXPOR FUNÇÕES PARA O ESCOPO GLOBAL =====
window.switchView = switchView;
window.setTheme = setTheme;
window.toggleMainTimer = toggleMainTimer;
window.stopAndGoHome = stopAndGoHome;
window.togglePomodoro = togglePomodoro;
window.resetPomodoro = resetPomodoro;
window.switchTab = switchTab;
window.addTask = addTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.addYouTubeVideo = addYouTubeVideo;
window.removeVideo = removeVideo;
window.openSemester = openSemester;
window.selectSubject = selectSubject;
window.resumeStudy = resumeStudy;
window.toggleSidebar = toggleSidebar;
window.exportData = exportData;
window.downloadFile = downloadFile;
window.deleteFile = deleteFile;

// FUNÇÕES CRÍTICAS DO CALENDÁRIO - AGORA FUNCIONAM!
window.adicionarEvento = function() {
    MedCalendar.adicionarEvento();
};
window.MedCalendar = MedCalendar;

console.log('✅ Medicina PY script carregado com sucesso!');

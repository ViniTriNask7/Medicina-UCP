// ==========================================================
// FUNÇÃO DE LOGOUT SIMPLES E DIRETA
// ==========================================================

// Sobrescrever a função logout existente
window.logout = function() {
    console.log('Logout clicado'); // Para debug
    
    // 🔥 SINCRONIZAÇÃO AUTOMÁTICA POR USUÁRIO
const originalGet = localStorage.getItem.bind(localStorage);
const originalSet = localStorage.setItem.bind(localStorage);

const syncStorage = {
    getItem(key) {
        const user = originalGet(USER_KEY);
        return user ? originalGet(SYNC_PREFIX + user + '_' + key) : null;
    },
    setItem(key, value) {
        const user = originalGet(USER_KEY);
        if (user) originalSet(SYNC_PREFIX + user + '_' + key, value);
        else originalSet(key, value);
    }
};

localStorage.getItem = syncStorage.getItem.bind(syncStorage);
localStorage.setItem = syncStorage.setItem.bind(syncStorage);
    // Confirmar logout
    if (confirm('Tem certeza que deseja sair?')) {
        // Parar timers se existirem
        if (typeof stopAllTimers === 'function') {
            stopAllTimers();
        }
        
        // Remover usuário do localStorage
        localStorage.removeItem('medicina_py_user');
        
        // Redirecionar para index.html
        window.location.href = 'index.html';
    }
};

// Também garantir que a função está disponível globalmente
function logout() {
    window.logout();
}

// ==========================================================
// MEDICINA PY - SCRIPT PRINCIPAL (VERSÃO CORRIGIDA)
// ==========================================================

// ===== CONFIGURAÇÕES GLOBAIS =====
const APP_VERSION = '2.0.0';
const USER_KEY = 'medicina_py_user';
const SYNC_PREFIX = 'sync_' + btoa(location.hostname) + '_'; // ← ADICIONE

const THEME_KEY = 'medicina_py_theme';
const ACCESS_PASSWORD = "med2026"; // Senha padrão

// ===== SISTEMA DE AUTENTICAÇÃO CORRIGIDO =====
const Auth = {
    isLoggedIn() {
        return localStorage.getItem(USER_KEY) !== null;
    },
    
    getUserName() {
        return localStorage.getItem(USER_KEY) || 'Usuário';
    },
    
    getUserInitials() {
        const name = this.getUserName();
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
        return name.substring(0,2).toUpperCase();
    },
    
    logout() {
        // Parar todos os timers
        stopAllTimers();
        
        // Limpar dados da sessão atual
        sessionSeconds = 0;
        if (typeof updateMainTimerDisplay === 'function') {
            updateMainTimerDisplay();
        }
        
        // IMPORTANTE: Manter o tema, remover apenas o usuário
        localStorage.removeItem(USER_KEY);
        
        // Redirecionar para a página de login
        window.location.href = 'index.html';
    },
    
    updateUserInterface() {
        const userName = this.getUserName();
        const welcomeEl = document.getElementById('welcome-message');
        if(welcomeEl) welcomeEl.innerHTML = 'Olá, ' + userName.split(' ')[0] + '! 👋';
        
        const profileName = document.getElementById('user-name-display');
        if(profileName) profileName.textContent = userName;
        
        const avatar = document.getElementById('user-avatar');
        if(avatar) avatar.textContent = this.getUserInitials();
    },
    
    protectPage() {
        // Se não estiver logado e não estiver na página de login, redirecionar
        if(!this.isLoggedIn() && !window.location.pathname.includes('index.html')) { 
            window.location.href = 'index.html'; 
            return false; 
        }
        return true;
    }
};

// ===== FUNÇÃO DE LOGOUT GLOBAL =====
function logout() {
    // Usar o modal de confirmação melhorado
    showConfirmation('Deseja realmente sair do sistema?', () => {
        // Mostrar toast de saída
        showToast('Saindo...', 'info', 1000);
        
        // Executar logout após pequeno delay
        setTimeout(() => {
            Auth.logout();
        }, 500);
    });
}

// ===== VERIFICAÇÃO DE LOGIN NA INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se está na página de login
    if (window.location.pathname.includes('index.html')) {
        // Se já estiver logado, redirecionar para dashboard
        if (Auth.isLoggedIn()) {
            window.location.href = 'dashboard.html';
        }
        return;
    }
    
    // Se estiver no dashboard, proteger a página
    if (window.location.pathname.includes('dashboard.html')) {
        if (!Auth.protectPage()) return;
        // Inicializar o app
        setTimeout(() => {
            if (typeof init === 'function') {
                init();
            }
        }, 100);
    }
});

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

// ===== IMAGENS DOS SEMESTRES (UNSPLASH) =====
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

let mainTimerInterval = null, 
    isMainTimerRunning = false, 
    sessionSeconds = 0, 
    pomodoroInterval = null, 
    pomodoroTime = 25 * 60, 
    isPomodoroRunning = false;

let currentView = 'home';
let currentSubject = null;
let currentSemester = '1';

// ===== INDEXED DB (Arquivos) =====
let db;
const request = indexedDB.open("MedicinaFilesDB", 1);
request.onupgradeneeded = function(e) { 
    db = e.target.result; 
    db.createObjectStore("files", { keyPath: "id", autoIncrement: true })
      .createIndex("subject", "subject", { unique: false }); 
};
request.onsuccess = function(e) { 
    db = e.target.result; 
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
    
    // Resetar ícones
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

function setThemePreview(themeName) {
    setTheme(themeName);
}

function updateThemeIndicators(themeName) {
    const dots = document.querySelectorAll('.theme-dot, .theme-preview-dot');
    dots.forEach(dot => {
        dot.classList.remove('active', 'selected');
        if (dot.getAttribute('onclick')?.includes(themeName)) {
            dot.classList.add('active');
        }
    });
}

// ===== INICIALIZAÇÃO =====
function init() {
    if(!Auth.protectPage()) return;
    
    // Resetar contagem diária se necessário
    if(appData.lastDate !== new Date().toLocaleDateString()){
        appData.time = 0;
        appData.lastDate = new Date().toLocaleDateString();
        save();
    }
    
    // Carregar tema salvo
    const savedTheme = localStorage.getItem(THEME_KEY) || 'default';
    setTheme(savedTheme);
    
    // Atualizar interface do usuário
    Auth.updateUserInterface();
    
    // Renderizar componentes
    renderHomeStats();
    renderSemestres();
    MedCalendar.init();
    
    // Inicializar funcionalidades
    autoSaveNotes();
    updatePomoDisplay();
    initDropZone();
    
    // Mostrar view inicial
    switchView('home');
    
    // Adicionar listeners
    addEventListeners();
    
    console.log(`✅ Medicina PY v${APP_VERSION} inicializado`);
}

// ===== Navegação =====
function switchView(viewName) {
    // Fechar sidebar mobile
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar?.classList.remove('active');
    overlay?.classList.remove('active');
    
    // Esconder todas as views
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    // Mostrar view selecionada
    const targetView = document.getElementById('view-' + viewName);
    if(targetView) targetView.classList.add('active');
    
    // Atualizar botão ativo
    const btnMap = { home: 'btn-home', semestres: 'btn-semestres', focus: 'btn-semestres', calendario: 'btn-calendario' };
    const btnId = btnMap[viewName]; 
    if(btnId) document.getElementById(btnId)?.classList.add('active');
    
    currentView = viewName;
    
    // Atualizar conteúdo específico
    if (viewName === 'calendario') {
        MedCalendar.renderizarAgenda();
        MedCalendar.popularSelectMaterias();
    }
}

// ===== TIMER PRINCIPAL =====
function toggleMainTimer() {
    const icon = document.querySelector('#main-timer-status-icon i');
    if(isMainTimerRunning){
        clearInterval(mainTimerInterval);
        icon.className = 'fa-solid fa-play';
        isMainTimerRunning = false;
    } else{
        icon.className = 'fa-solid fa-pause';
        isMainTimerRunning = true;
        mainTimerInterval = setInterval(() => {
            sessionSeconds++; 
            appData.time++;
            updateMainTimerDisplay();
            if(sessionSeconds % 10 === 0) save();
        }, 1000);
    }
}

function updateMainTimerDisplay() {
    const h = Math.floor(sessionSeconds / 3600), 
          m = Math.floor((sessionSeconds % 3600) / 60), 
          s = sessionSeconds % 60;
    const display = document.getElementById('display-main-timer');
    if(display) display.innerText = h.toString().padStart(2,'0') + ':' + 
                                     m.toString().padStart(2,'0') + ':' + 
                                     s.toString().padStart(2,'0');
}

function stopAndGoHome() {
    clearInterval(mainTimerInterval); 
    isMainTimerRunning = false; 
    
    // Salvar sessão se tiver mais de 1 minuto
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
    showToast('Sessão de estudo finalizada!', 'success');
}

function renderHomeStats() {
    const h = Math.floor(appData.time / 3600), 
          m = Math.floor((appData.time % 3600) / 60);
    const statTime = document.getElementById('stat-time'), 
          statSem = document.getElementById('stat-sem'), 
          statSub = document.getElementById('stat-last-sub');
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
    } else{
        icon.className = 'fa-solid fa-pause';
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
    isPomodoroRunning = !isPomodoroRunning;
}

function updatePomoDisplay() {
    const m = Math.floor(pomodoroTime / 60), 
          s = pomodoroTime % 60;
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
        subject: currentSubject || 'Geral',
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
    save();
    switchView('focus');
    
    document.getElementById('focus-sem-title').innerText = semNum + 'º Semestre';
    
    const listContainer = document.getElementById('focus-subjects-list');
    listContainer.innerHTML = '';
    
    CURRICULO[semNum].forEach(materia => {
        const item = document.createElement('div');
        item.className = 'subject-item ' + (appData.currentSub === materia ? 'active' : '');
        item.innerHTML = '<i class="fa-solid fa-book-medical"></i> ' + materia;
        item.onclick = () => selectSubject(materia);
        listContainer.appendChild(item);
    });
    
    if(appData.currentSub && CURRICULO[semNum].includes(appData.currentSub)) {
        selectSubject(appData.currentSub);
    } else {
        selectSubject(CURRICULO[semNum][0]);
    }
}

function selectSubject(materia) {
    appData.currentSub = materia; 
    currentSubject = materia;
    save(); 
    renderHomeStats();
    
    document.getElementById('focus-active-subject').innerText = materia;
    
    document.querySelectorAll('.subject-item').forEach(el => 
        el.classList.toggle('active', el.innerText.includes(materia))
    );
    
    // Carregar dados da matéria
    document.getElementById('note-editor').value = localStorage.getItem('notes_' + materia) || "";
    
    renderVideosList();
    renderTasks();
    renderFilesList();
}

// ===== VÍDEOS =====
function addYouTubeVideo() {
    const input = document.getElementById('youtube-url');
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
    showConfirmation('Remover este vídeo?', () => {
        const key = 'videos_' + appData.currentSub;
        let videos = JSON.parse(localStorage.getItem(key)) || [];
        videos = videos.filter(v => v !== id);
        localStorage.setItem(key, JSON.stringify(videos));
        renderVideosList();
        showToast('Vídeo removido', 'info');
    });
}

function renderVideosList() {
    const grid = document.getElementById('video-grid');
    const placeholder = document.getElementById('video-placeholder-empty');
    
    if (!grid || !placeholder) return;
    
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
            // Debounce para não mostrar toast a cada caractere
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
    showConfirmation('Remover esta tarefa?', () => {
        const key = 'tasks_' + appData.currentSub;
        const tasks = JSON.parse(localStorage.getItem(key));
        tasks.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(tasks));
        renderTasks();
        showToast('Tarefa removida', 'info');
    });
}

// ===== ARQUIVOS (INDEXED DB) =====
function initDropZone() {
    const zone = document.getElementById('drop-zone'); 
    const input = document.getElementById('file-input');
    if(!zone || !input || !db) return;
    
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
    
    Array.from(files).forEach(file => {
        // Verificar tamanho (max 1GB)
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
            
            // Ícone baseado no tipo
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
    showConfirmation("Excluir este arquivo?", () => {
        const transaction = db.transaction(["files"], "readwrite");
        const request = transaction.objectStore("files").delete(id);
        
        request.onsuccess = () => {
            renderFilesList();
            showToast('Arquivo removido', 'info');
        };
    });
}

// ===== CALENDÁRIO =====
const MedCalendar = {
    storageKey: 'med_agenda_v1',
    
    init() {
        this.popularSelectMaterias(); 
        this.renderizarAgenda(); 
        this.atualizarHome();
        const inputData = document.getElementById('cal-data'); 
        if(inputData) inputData.value = new Date().toISOString().split('T')[0];
    },
    
    getEventos() { 
        return JSON.parse(localStorage.getItem(this.storageKey)) || []; 
    },
    
    popularSelectMaterias() {
        const select = document.getElementById('cal-materia'); 
        if(!select) return;
        
        let todasMaterias = [];
        Object.values(CURRICULO).forEach(lista => todasMaterias = todasMaterias.concat(lista));
        const materiasUnicas = [...new Set(todasMaterias)].sort();
        select.innerHTML = materiasUnicas.map(m => '<option value="' + m + '">' + m + '</option>').join('');
    },
    
    adicionarEvento() {
        const materia = document.getElementById('cal-materia').value;
        const data = document.getElementById('cal-data').value;
        const horas = document.getElementById('cal-horas').value;
        const tipo = document.getElementById('cal-tipo').value;
        
        if(!data || !horas) { 
            showToast("Preencha a data e a duração!", 'warning'); 
            return; 
        }
        
        const novoEvento = { id: Date.now(), materia, data, horas, tipo };
        const eventos = this.getEventos(); 
        eventos.push(novoEvento);
        eventos.sort((a, b) => new Date(a.data) - new Date(b.data));
        localStorage.setItem(this.storageKey, JSON.stringify(eventos));
        
        document.getElementById('form-agenda-box').style.display = 'none';
        this.renderizarAgenda(); 
        this.atualizarHome();
        showToast('Evento adicionado à agenda!', 'success');
    },
    
    removerEvento(id) {
        showConfirmation('Remover este compromisso?', () => {
            const eventos = this.getEventos().filter(e => e.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(eventos));
            this.renderizarAgenda(); 
            this.atualizarHome();
            showToast('Compromisso removido', 'info');
        });
    },
    
    formatarDataBR(dataStr) {
        const partes = dataStr.split('-'); 
        return partes[2] + '/' + partes[1] + '/' + partes[0];
    },
    
    atualizarHome() {
        const hojeStr = new Date().toISOString().split('T')[0];
        const amanhaObj = new Date(); 
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
                    '<small>' + e.tipo + ' • ' + e.horas + 'h</small>' +
                    '</div>'
                ).join('');
            } else {
                divHoje.innerHTML = '<span style="color: var(--text-muted);">Nenhum compromisso hoje 📚</span>';
            }
        }
        
        if(divAmanha){
            if(amanhaEventos.length > 0) {
                divAmanha.innerHTML = '<b>Amanhã:</b> ' + amanhaEventos[0].materia + ' (' + amanhaEventos[0].horas + 'h)';
            } else {
                divAmanha.innerHTML = '<b>Amanhã:</b> Nenhum compromisso';
            }
        }
    },
    
    renderizarAgenda() {
        const container = document.getElementById('calendario-grid'); 
        if(!container) return;
        
        const eventos = this.getEventos(); 
        
        if(eventos.length === 0) { 
            container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">' +
                '<i class="fa-solid fa-calendar-xmark" style="font-size:3rem;opacity:0.2;margin-bottom:15px;"></i>' +
                '<p>Sua agenda está vazia. Adicione aulas para começar!</p>' +
                '</div>'; 
            return; 
        }
        
        // Agrupar por data
        const grupos = eventos.reduce((acc, obj) => { 
            const data = obj.data; 
            if(!acc[data]) acc[data] = []; 
            acc[data].push(obj); 
            return acc; 
        }, {});
        
        container.innerHTML = Object.keys(grupos).map(data => 
            '<div style="background:var(--bg-card);border-radius:12px;border:1px solid var(--border);overflow:hidden;margin-bottom:15px;">' +
            '<div style="background:var(--bg-main);padding:10px 15px;border-bottom:1px solid var(--border);font-weight:bold;color:var(--primary);display:flex;align-items:center;gap:10px;">' +
            '<i class="fa-regular fa-calendar-check"></i> ' + this.formatarDataBR(data) +
            '</div>' +
            '<div style="padding:10px 15px;">' +
            grupos[data].map(e => 
                '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">' +
                '<div>' +
                '<strong style="color:var(--text-main);">' + e.materia + '</strong>' +
                '<div style="font-size:0.8rem;color:var(--text-muted);">' + e.tipo + ' • ' + e.horas + ' horas</div>' +
                '</div>' +
                '<button onclick="MedCalendar.removerEvento(' + e.id + ')" style="background:none;border:none;color:var(--danger);cursor:pointer;padding:5px;">' +
                '<i class="fa-solid fa-trash-can"></i>' +
                '</button>' +
                '</div>'
            ).join('') +
            '</div>' +
            '</div>'
        ).join('');
    }
};

// ===== TABS =====
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const tab = document.getElementById('tab-' + tabName); 
    if(tab) tab.classList.add('active');
    
    // Encontrar e ativar o botão correto
    const buttons = document.querySelectorAll('.tab-btn');
    for(let btn of buttons) {
        if(btn.textContent.toLowerCase().includes(tabName)) {
            btn.classList.add('active');
            break;
        }
    }
    
    // Inicializar funcionalidades específicas
    if (tabName === 'files') {
        initDropZone();
        renderFilesList();
    } else if (tabName === 'video') {
        renderVideosList();
    } else if (tabName === 'tasks') {
        renderTasks();
    }
}

// ===== UTILITÁRIOS =====
function save() { 
    localStorage.setItem('med_v7', JSON.stringify(appData)); // Já sincroniza!
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

function showConfirmation(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    
    const confirmHandler = () => {
        overlay.remove();
        onConfirm();
    };
    
    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">Confirmar</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                <button class="btn-primary-big" onclick="(${confirmHandler})()">Confirmar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
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

function addEventListeners() {
    // Tecla Enter para adicionar tarefa
    const taskInput = document.getElementById('task-input');
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
    }
    
    // Tecla Enter para adicionar vídeo
    const videoInput = document.getElementById('youtube-url');
    if (videoInput) {
        videoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addYouTubeVideo();
        });
    }
    
    // Salvar timer ao sair da página
    window.addEventListener('beforeunload', () => {
        if (isMainTimerRunning) {
            localStorage.setItem('medicina_timer', JSON.stringify({
                running: true,
                seconds: sessionSeconds
            }));
        } else {
            localStorage.removeItem('medicina_timer');
        }
    });
    
    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            switchView('home');
        }
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            switchView('semestres');
        }
        if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            switchView('calendario');
        }
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.remove();
            });
        }
    });
}

function resumeStudy() { 
    if(appData.currentSub) {
        openSemester(appData.currentSem);
    } else {
        switchView('semestres');
    }
}

function exportData() {
    const data = {
        version: APP_VERSION,
        exportDate: new Date().toISOString(),
        user: Auth.getUserName(),
        appData: appData,
        notes: getAllNotes(),
        tasks: getAllTasks(),
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

function getAllNotes() {
    const notes = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('notes_')) {
            notes[key.replace('notes_', '')] = localStorage.getItem(key);
        }
    }
    return notes;
}

function getAllTasks() {
    const allTasks = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tasks_')) {
            allTasks[key.replace('tasks_', '')] = JSON.parse(localStorage.getItem(key));
        }
    }
    return allTasks;
}

function clearAllData() {
    showConfirmation('Tem certeza? Todos os dados serão permanentemente apagados.', () => {
        // Limpar localStorage
        localStorage.clear();
        
        // Limpar IndexedDB
        if (db) {
            const transaction = db.transaction(["files"], "readwrite");
            const store = transaction.objectStore("files");
            store.clear();
        }
        
        showToast('Todos os dados foram apagados', 'warning');
        
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    });
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

// ===== EXPOR FUNÇÕES PARA O ESCOPO GLOBAL =====
window.switchView = switchView;
window.setTheme = setTheme;
window.setThemePreview = setThemePreview;
window.toggleMainTimer = toggleMainTimer;
window.stopAndGoHome = stopAndGoHome;
window.togglePomodoro = togglePomodoro;
window.resetPomodoro = resetPomodoro;
window.switchTab = switchTab;
window.addTask = addTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.addYouTubeVideo = addYouTubeVideo;
window.adicionarEvento = MedCalendar.adicionarEvento;
window.MedCalendar = MedCalendar;
window.openSemester = openSemester;
window.selectSubject = selectSubject;
window.resumeStudy = resumeStudy;
window.logout = logout;
window.downloadFile = downloadFile;
window.deleteFile = deleteFile;
window.toggleSidebar = toggleSidebar;
window.exportData = exportData;
window.clearAllData = clearAllData;
window.showConfirmation = showConfirmation;
window.removeVideo = removeVideo;

// ===== INICIALIZAÇÃO (já feita no DOMContentLoaded) =====

console.log('✅ Medicina PY script carregado com sucesso!');

// public/script_student.js

let wsStudent, ctxStudent;
let currentTool = 'pencil';
let drawing = false;

const nameInput   = document.getElementById('nameInput');
const startBtn    = document.getElementById('startBtn');
const pencilBtn   = document.getElementById('pencilBtn');
const eraserBtn   = document.getElementById('eraserBtn');
const loginDiv    = document.getElementById('login');
const canvasArea  = document.getElementById('canvasArea');
const canvas      = document.getElementById('studentCanvas');
const errorMsg    = document.getElementById('errorMsg');

startBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  
  // Validation: nom ne contenant que des lettres
  if (!name) {
    showError("Veuillez entrer votre nom");
    return;
  }
  
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(name)) {
    showError("Le nom doit contenir uniquement des lettres");
    return;
  }

  // 1) Connexion WS(S)
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  wsStudent = new WebSocket(`${proto}//${location.host}/liveboard`);

  wsStudent.addEventListener('open', () => {
    wsStudent.send(JSON.stringify({ type: 'register', role: 'student', name }));
  });

  wsStudent.addEventListener('message', ({ data }) => {
    const msg = JSON.parse(data);
    switch (msg.type) {
      case 'startPath':
        ctxStudent.beginPath();
        ctxStudent.strokeStyle = msg.data.color || 'black';
        ctxStudent.moveTo(msg.data.x, msg.data.y);
        break;
      case 'draw':
        ctxStudent.strokeStyle = msg.data.color || 'black';
        ctxStudent.lineTo(msg.data.x, msg.data.y);
        ctxStudent.stroke();
        break;
      case 'endPath':
        ctxStudent.beginPath(); // Réinitialiser le tracé
        break;
      case 'erase':
        const { x, y, size } = msg.data;
        ctxStudent.clearRect(x - size/2, y - size/2, size, size);
        break;
      case 'clear':
        ctxStudent.clearRect(0, 0, canvas.width, canvas.height);
        ctxStudent.beginPath();
        break;
    }
  });

  // 2) Basculer l'IHM
  loginDiv.style.display   = 'none';
  canvasArea.style.display = 'block';

  // 3) Init canvas
  ctxStudent = canvas.getContext('2d');
  canvas.classList.add('pencil');
  canvas.style.touchAction = 'none';
  canvas.width  = 400;
  canvas.height = 400;

  ;['pointerdown','pointermove','pointerup','pointerleave'].forEach(evt =>
    canvas.addEventListener(evt, handlePointer)
  );
  
  // Passage en mode plein écran
  requestFullscreen();
  
  // Définir le crayon comme outil actif par défaut
  pencilBtn.click();
});

// Afficher un message d'erreur
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.display = 'block';
  setTimeout(() => {
    errorMsg.style.opacity = '0';
    setTimeout(() => {
      errorMsg.style.display = 'none';
      errorMsg.style.opacity = '1';
    }, 500); // Temps de la transition
  }, 3000);
}

// 4) Gestion des outils
pencilBtn.addEventListener('click', () => {
  currentTool = 'pencil';
  ctxStudent.strokeStyle = 'black';
  ctxStudent.lineWidth   = 2;
  pencilBtn.classList.add('active');
  eraserBtn.classList.remove('active');
  canvas.classList.replace('eraser','pencil');
});

eraserBtn.addEventListener('click', () => {
  currentTool = 'eraser';
  eraserBtn.classList.add('active');
  pencilBtn.classList.remove('active');
  canvas.classList.replace('pencil','eraser');
});

// 5) Fonction de dessin/gomme
function handlePointer(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (e.type === 'pointerdown') {
    drawing = true;
    ctxStudent.beginPath();
    ctxStudent.moveTo(x, y);
    
    // Indiquer le début du tracé
    wsStudent.send(JSON.stringify({
      type: 'startPath',
      data: { x, y }
    }));
  }
  else if (e.type === 'pointermove' && drawing) {
    if (currentTool === 'eraser') {
      const size = 40;  // gomme plus grande
      ctxStudent.clearRect(x - size/2, y - size/2, size, size);
      wsStudent.send(JSON.stringify({
        type: 'erase',
        data: { x, y, size }
      }));
    } else {
      ctxStudent.lineTo(x, y);
      ctxStudent.stroke();
      wsStudent.send(JSON.stringify({
        type: 'draw',
        data: { x, y }
      }));
    }
  }
  else if (e.type === 'pointerup' || e.type === 'pointerleave') {
    if (drawing) {
      drawing = false;
      wsStudent.send(JSON.stringify({
        type: 'endPath'
      }));
    }
  }
}

// Gestion du plein écran
function requestFullscreen() {
  const elem = document.documentElement;
  
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

// Redimensionnement du canvas pour s'adapter à la taille de l'écran
function resizeCanvas() {
  const containerWidth = Math.min(window.innerWidth - 40, 600);
  canvas.style.width = `${containerWidth}px`;
  canvas.style.height = `${containerWidth}px`;
}

// Redimensionner le canvas au chargement et au redimensionnement de la fenêtre
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);
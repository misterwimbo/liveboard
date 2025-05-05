// public/script_teacher.js

// 1) Connexion WS(S)
const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsTeacher = new WebSocket(`${proto}//${location.host}/liveboard`);

const grid = document.getElementById('grid');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const contexts = {}; // nom → 2D context

// Gérer le plein écran
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fullscreenBtn.innerHTML = '❌ Quitter plein écran';
  } else {
    document.exitFullscreen();
    fullscreenBtn.innerHTML = '🔍 Plein écran';
  }
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    fullscreenBtn.innerHTML = '🔍 Plein écran';
  }
});

wsTeacher.addEventListener('open', () => {
  wsTeacher.send(JSON.stringify({ type: 'register', role: 'teacher' }));
});

// 2) Réception des messages
wsTeacher.addEventListener('message', ({ data }) => {
  const msg = JSON.parse(data);
  const name = msg.from || msg.name;
  const ctx = contexts[name];

  switch (msg.type) {
    case 'new_student':
      createCanvasFor(msg.name);
      break;
    case 'draw':
      ctx.lineTo(msg.data.x, msg.data.y);
      ctx.stroke();
      break;
    case 'erase':
      const { x, y, size } = msg.data;
      ctx.clearRect(x - size/2, y - size/2, size, size);
      break;
    case 'clear':
      const cvs = ctx.canvas;
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      ctx.beginPath();
      break;
  }
});

// 3) Création dynamique du canvas + contrôles
function createCanvasFor(name) {
  const container = document.createElement('div');
  container.className = 'student-container';

  // Nom
  const label = document.createElement('h2');
  label.innerText = name;
  container.appendChild(label);

  // Choix de couleur
  const colorBar = document.createElement('div');
  colorBar.className = 'color-buttons';
  
  const blackBtn = document.createElement('button');
  blackBtn.innerText = '🖊️ Noir';
  blackBtn.classList.add('color-btn', 'active');
  blackBtn.addEventListener('click', () => {
    contexts[name].strokeStyle = 'black';
    // surligner
    colorBar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    blackBtn.classList.add('active');
  });
  
  const redBtn = document.createElement('button');
  redBtn.innerText = '🖊️ Rouge';
  redBtn.classList.add('color-btn');
  redBtn.addEventListener('click', () => {
    contexts[name].strokeStyle = 'red';
    // surligner
    colorBar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    redBtn.classList.add('active');
  });
  
  colorBar.appendChild(blackBtn);
  colorBar.appendChild(redBtn);
  container.appendChild(colorBar);

  // Canvas 👩‍🏫
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  canvas.classList.add('teacher');
  container.appendChild(canvas);

  // Bouton "Tout effacer"
  const clearBtn = document.createElement('button');
  clearBtn.innerText = 'Tout effacer';
  clearBtn.classList.add('clear-btn');
  clearBtn.addEventListener('click', () => {
    const ctx = contexts[name];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    wsTeacher.send(JSON.stringify({ type: 'clear', to: name }));
  });
  container.appendChild(clearBtn);

  grid.appendChild(container);

  // Initialisation du contexte
  const ctx = canvas.getContext('2d');
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'black'; // défaut
  contexts[name] = ctx;

  // Event drawing pour annotations (si besoin)
  let drawing = false;
  let lastPoint = null;
  
  canvas.addEventListener('pointerdown', (e) => {
    drawing = true;
    ctx.beginPath();
    canvas.setPointerCapture(e.pointerId);
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    ctx.moveTo(x, y);
    lastPoint = { x, y };
    
    // Envoyer la position initiale à l'élève
    wsTeacher.send(JSON.stringify({
      type: 'startPath',
      to: name,
      data: { x, y, color: ctx.strokeStyle }
    }));
  });
  
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPoint = { x, y };
    
    // retransmission à l'élève
    wsTeacher.send(JSON.stringify({
      type: 'draw',
      to: name,
      data: { x, y, color: ctx.strokeStyle }
    }));
  });
  
  canvas.addEventListener('pointerup', (e) => {
    drawing = false;
    lastPoint = null;
    canvas.releasePointerCapture(e.pointerId);
    
    // Indiquer la fin du tracé
    wsTeacher.send(JSON.stringify({
      type: 'endPath',
      to: name
    }));
  });
  
  // Gestion de la sortie du canvas
  canvas.addEventListener('pointerleave', () => {
    if (drawing) {
      drawing = false;
      lastPoint = null;
      
      // Indiquer la fin du tracé
      wsTeacher.send(JSON.stringify({
        type: 'endPath',
        to: name
      }));
    }
  });
}

// Redimensionnement des canvas pour s'adapter à la taille de l'écran
function resizeCanvases() {
  const containerWidth = Math.min(window.innerWidth - 40, 600);
  document.querySelectorAll('canvas').forEach(canvas => {
    const ratio = canvas.height / canvas.width;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerWidth * ratio}px`;
  });
}

// Redimensionner les canvas au chargement et au redimensionnement de la fenêtre
window.addEventListener('load', resizeCanvases);
window.addEventListener('resize', resizeCanvases);
// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Stockage des connexions
const students = {};    // { nomÉtudiant: ws }
let teacher = null;     // ws de la maîtresse

// Lorsqu'une socket se connecte
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch (err) {
      console.error('Message JSON invalide :', message);
      return;
    }

    switch (msg.type) {

      // 1) Enregistrement de l'élève ou de la maîtresse
      case 'register':
        if (msg.role === 'student' && msg.name) {
          ws.role = 'student';
          ws.name = msg.name;
          students[msg.name] = ws;
          console.log(`👧 Élève inscrit : ${msg.name}`);
          // On prévient la maîtresse
          if (teacher && teacher.readyState === WebSocket.OPEN) {
            teacher.send(JSON.stringify({ type: 'new_student', name: msg.name }));
          }
        }
        else if (msg.role === 'teacher') {
          ws.role = 'teacher';
          teacher = ws;
          console.log('👩‍🏫 Maîtresse connectée');
        }
        break;
  
      // Nouveau - Début du tracé
      case 'startPath': {
        const payload = {
          type: 'startPath',
          from: ws.role === 'student' ? ws.name : undefined,
          to: ws.role === 'teacher' ? msg.to : undefined,
          data: msg.data
        };
        if (ws.role === 'student' && teacher?.readyState === WebSocket.OPEN) {
          teacher.send(JSON.stringify(payload));
        }
        else if (ws.role === 'teacher' && msg.to) {
          const target = students[msg.to];
          if (target?.readyState === WebSocket.OPEN) {
            delete payload.from;
            target.send(JSON.stringify(payload));
          }
        }
        break;
      }
  
      // 2) Tracé (crayon) de l'élève → maîtresse, ou maîtresse → élève
      case 'draw': {
        const payload = {
          type: 'draw',
          from: ws.role === 'student' ? ws.name : undefined,
          to: ws.role === 'teacher' ? msg.to : undefined,
          data: msg.data
        };
        if (ws.role === 'student' && teacher?.readyState === WebSocket.OPEN) {
          teacher.send(JSON.stringify(payload));
        }
        else if (ws.role === 'teacher' && msg.to) {
          const target = students[msg.to];
          if (target?.readyState === WebSocket.OPEN) {
            // côté élève on n'a pas besoin de "from"
            delete payload.from;
            target.send(JSON.stringify(payload));
          }
        }
        break;
      }
      
      // Nouveau - Fin du tracé
      case 'endPath': {
        const payload = {
          type: 'endPath',
          from: ws.role === 'student' ? ws.name : undefined,
          to: ws.role === 'teacher' ? msg.to : undefined
        };
        if (ws.role === 'student' && teacher?.readyState === WebSocket.OPEN) {
          teacher.send(JSON.stringify(payload));
        }
        else if (ws.role === 'teacher' && msg.to) {
          const target = students[msg.to];
          if (target?.readyState === WebSocket.OPEN) {
            delete payload.from;
            target.send(JSON.stringify(payload));
          }
        }
        break;
      }
  
      // 3) Gomme partielle (élève → maîtresse, maîtresse → élève)
      case 'erase': {
        const payload = {
          type: 'erase',
          from: ws.role === 'student' ? ws.name : undefined,
          to: ws.role === 'teacher' ? msg.to : undefined,
          data: msg.data   // { x, y, size }
        };
        if (ws.role === 'student' && teacher?.readyState === WebSocket.OPEN) {
          teacher.send(JSON.stringify(payload));
        }
        else if (ws.role === 'teacher' && msg.to) {
          const target = students[msg.to];
          if (target?.readyState === WebSocket.OPEN) {
            delete payload.from;
            target.send(JSON.stringify(payload));
          }
        }
        break;
      }
  
      // 4) Tout effacer (uniquement maîtresse → élève)
      case 'clear':
        if (ws.role === 'teacher' && msg.to) {
          const target = students[msg.to];
          if (target?.readyState === WebSocket.OPEN) {
            target.send(JSON.stringify({ type: 'clear' }));
          }
        }
        break;
  
      // 5) Cas non prévu
      default:
        console.warn('Type de message inconnu :', msg.type);
    }
  });

  ws.on('close', () => {
    if (ws.role === 'student' && ws.name) {
      delete students[ws.name];
      console.log(`❌ Élève déconnecté : ${ws.name}`);
    } else if (ws.role === 'teacher') {
      teacher = null;
      console.log('❌ Maîtresse déconnectée');
    }
  });
});

// Rediriger la racine vers teacher.html
app.get('/', (_req, res) => {
  res.redirect('/teacher.html');
});

// Servir les fichiers statiques depuis ./public
app.use(express.static(path.join(__dirname, 'public')));

// Démarrage
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Liveboard démarré sur le port ${PORT}`);
});
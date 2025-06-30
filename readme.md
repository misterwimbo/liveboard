# 🧠 misterwimbo-liveboard — Le tableau virtuel interactif (en live!)

Bienvenue dans **misterwimbo-liveboard**, un système de tableau collaboratif temps réel entre enseignants et élèves. Pensé pour l’éducation moderne, cet outil permet à une enseignante de suivre et d’interagir **en direct** avec les productions graphiques de chaque élève connecté — le tout via WebSocket.  
✨ Simple. Réactif. Magique.

---

## 🧩 Fonctionnalités principales

👧 **Interface Élève**  
- Connexion avec nom personnalisé (prénom/nom).
- Outils : crayon ✏️ et gomme 🧽.
- Tracés envoyés automatiquement à l’enseignant.
- Interface tactile-friendly, responsive et intuitive.

👩‍🏫 **Interface Enseignant**  
- Visualisation en temps réel des dessins de chaque élève.
- Interaction directe : dessin sur le canevas de l’élève.
- Sélection de la couleur (noir ou rouge).
- Effacement total d’un canevas.
- Mode plein écran intégré.

🌐 **Communication WebSocket en temps réel**  
- Fluide, rapide, sans rechargement.
- Fonctionne sur réseau local ou distant.

---

## 🚀 Lancement rapide

### 1. Installation
```bash
git clone https://github.com/votre-utilisateur/misterwimbo-liveboard.git
cd misterwimbo-liveboard
npm install
```

### 2. Démarrage du serveur
```bash
node server.js
```

### 3. Accès aux interfaces
- Interface enseignant : http://localhost:3000/
- Interface élève : http://localhost:3000/student.html

---

## 🛠 Technologies utilisées

- **Node.js** + **Express** — serveur HTTP
- **WebSocket (`ws`)** — communication temps réel
- **HTML5 Canvas** — dessin fluide
- **CSS3** — design responsive & propre
- **Vanilla JavaScript** — pas de framework ici, juste du fun natif

---

## ⚠️ État actuel du projet

🧪 Ce projet est **en cours de développement actif**.

### 🐞 Bugs et limites connues :
- Pas de reconnexion automatique si un élève recharge la page.
- Les élèves ne sont pas listés dynamiquement si la page enseignant est rechargée.
- Pas de persistance des dessins (tout est perdu à la fermeture).
- Sécurité encore minimale (aucune authentification).

👉 Malgré tout cela, le système fonctionne **déjà très bien en démonstration** et peut être utilisé pour des ateliers, des tests pédagogiques, ou comme base pour un projet plus vaste.

---

## 🎯 Idées d’amélioration

- Ajouter une base de données pour stocker les sessions.
- Système de groupes/classes.
- Authentification simple pour élèves/enseignants.
- Outils supplémentaires : surlignage, formes, texte, etc.
- Export des dessins au format image.

---

## 👨‍🎨 Auteur

**Wimbo** — explorateur de canevas et alchimiste JavaScript.  
Projet conçu pour faciliter le dessin interactif entre enseignants et élèves.  
Pensé avec passion. Codé avec soin. Documenté avec amour (et un soupçon d’absurde ✨).

---

## 📜 Licence

Ce projet est distribué sous licence **MIT**.  
Fais-en bon usage. Forke, adapte, améliore… et surtout, **crée**.

---

> _"Tout enseignant a besoin de ses craies… mais à l’ère moderne, un pinceau WebSocket, c’est quand même plus chic."_  
> — Un vieux sorcier de la salle des profs.

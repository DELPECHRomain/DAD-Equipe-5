# DAD-Equipe-5

cd server : npm  run dev 
(PORT 3000)


cd client : npm run start
(PORT 8080)
# 🐦 DAD-Equipe-5 – Réseau Social en Microservices

Ce projet est un réseau social inspirée de Twitter/X, développée dans le cadre d’un projet académique.  
L’architecture repose sur des **microservices conteneurisés avec Docker**, avec une **application front-end React/Next.js** et des **API back-end Node.js/Express** connectées à une base MongoDB.

---

## 🚀 Fonctionnalités principales

- ✅ Création de compte avec validation d’e-mail  
- ✅ Authentification sécurisée via JWT  
- ✅ Publication de messages courts (≤ 280 caractères)  
- ✅ Affichage des messages sur profil  
- ✅ Fil d’actualités des utilisateurs suivis  
- ✅ Like, commentaire et réponse (profondeur 2 max)  
- ✅ Suivi / désabonnement d’utilisateurs  
- ✅ Page de profil avec photo, bio, bannière  

---

## 🧱 Architecture

    +-------------+      +------------------+      +--------------------------+
    |  Frontend   | ---> |   API Gateway    | ---> |  Microservices (Docker)  |
    |  (Next.js)  |      |     (NGINX)      |      |   Auth / Post / Profile  |
    +-------------+      +------------------+      +--------------------------+

- **auth-service** : gestion des comptes, login, JWT  
- **post-service** : création, like, commentaire, fil  
- **profile-service** : profils utilisateurs, follow  
- **client** : app Next.js (React + Tailwind CSS)  
- **mongo** : base de données MongoDB unique  

---

## 🛠️ Technologies utilisées

| Domaine          | Technologies                                           |
|------------------|--------------------------------------------------------|
| Backend          | Node.js · Express.js · Mongoose · JWT · Bcrypt         |
| Base de données  | MongoDB                                                |
| Frontend         | React.js · Next.js · Tailwind CSS · Axios              |
| Conteneurisation | Docker · Docker Compose                                |
| Reverse Proxy    | NGINX                                                  |

---

## 📦 Prérequis

- [Docker](https://www.docker.com/)  
- [Docker Compose](https://docs.docker.com/compose/)

---

## ⚙️ Lancement du projet

```bash
git clone https://github.com/DELPECHRomain/DAD-Equipe-5.git
cd DAD-Equipe-5
docker-compose up --build
```

## 🌙 Activer le Dark Mode

1. Allez sur votre **page Profil**  
2. Cliquez sur **Modifier**  
3. Cliquez sur l’icône 🌓 pour basculer en **Dark Mode**  


# 📊 Architecture de CV Dynamique Pilotée par la Donnée

[![GitHub Pages](https://shields.io🚀%20Live%20Demo-2f81f7?style=for-the-badge)](https://azzouzmezlini.github.io/mon-cv/)

Ce dépôt héberge mon CV de **Data Engineer / Développeur SQL**. Fidèle aux bonnes pratiques d'architecture logicielle, ce projet applique le principe de **séparation des responsabilités (SoC)** : les données métiers sont totalement isolées du code de rendu visuel.

---

## 🛠️ Stack Technique

* **Data Engine (Variables) :** `JSON` (Stockage structuré clé-valeur pour une mise à jour instantanée)
* **Logique de rendu :** `JavaScript ES6` (Fetch API asynchrone & manipulation dynamique du DOM)
* **Design & Structure :** `HTML5` / `CSS3` (Architecture asymétrique CSS Grid, Flexbox & Responsive Mobile-first)
* **Hébergement :** `GitHub Pages` (Déploiement et intégration continue gratuits)

---

## 🏗️ Architecture du Projet

```text
📁 mon-cv-data/
├── 📄 index.html      # Squelette sémantique et gabarit de réception
├── 📄 style.css       # Design moderne, responsive et optimisé pour l'impression PDF
├── 📄 script.js      # Moteur logique (Fetch asynchrone du JSON et injection DOM)
├── 📄 cv-data.json    # L'unique source de vérité (Données de mon parcours)
└── 📄 README.md       # Documentation du dépôt
```

---

## ⚙️ Comment faire évoluer ce CV ?

L'avantage de cette approche "Data-driven" est qu'**il n'est jamais nécessaire de toucher au code HTML ou CSS** pour mettre à jour le parcours professionnel.

Pour ajouter une expérience ou modifier une compétence :
1. Ouvrez le fichier `cv-data.json`.
2. Modifiez ou ajoutez un bloc dans le tableau correspondant (`experiences`, `competences` ou `formations`).
3. Effectuez votre `git commit` et `git push`.
4. **GitHub Pages met à jour le site automatiquement en moins de 30 secondes.**

---

## 📈 Fonctionnalités clefs du Rendu

* **Responsive Design :** La mise en page bascule automatiquement d'une grille à deux colonnes (desktop) à un affichage vertical unifié sur smartphone.
* **Optimisé pour l'impression :** Le fichier CSS inclut un bloc `@media print` spécifique. Un simple `Ctrl + P` (ou *Imprimer*) depuis le navigateur génère un CV PDF parfaitement cadré, propre et prêt à être envoyé aux recruteurs.

---

## 🔗 Liens et Contact

* **Démo en ligne :** [Consulter mon CV sur GitHub Pages](https://azzouzmezlini.github.io/mon-cv/)
* **LinkedIn :** [://linkedin.com](https://www.linkedin.com/in/azzouz-mezlini)

document.addEventListener("DOMContentLoaded", () => {
    // Récupération asynchrone des variables de données
    fetch('./cv-data.json')
        .then(response => {
            if (!response.ok) throw new Error("Erreur de chargement du fichier JSON");
            return response.json();
        })
        .then(data => populateCV(data))
        .catch(error => console.error("Erreur d'injection des données :", error));
});

function populateCV(data) {
    // 1. En-tête & Résumé de profil
    document.getElementById("user-name").innerText = data.coordonnees.nom;
    document.getElementById("user-title").innerText = data.statut;
    document.getElementById("profile-text").innerText = data.profil;

    // 2. Coordonnées de contact
    const contactList = document.getElementById("contact-list");
    const coords = data.coordonnees;
    const contactItems = [
        `📍 ${coords.adresse}`,
        `✉️ <a href="mailto:${coords.email}">${coords.email}</a>`,
        `🚗 ${coords.permis}`,
        `🔗 <a href="https://${coords.linkedin}" target="_blank">LinkedIn</a>`,
        `💻 <a href="https://${coords.github}" target="_blank">GitHub</a>`
    ];
    contactList.innerHTML = contactItems.map(item => `<li>${item}</li>`).join('');

    // 3. Section Compétences
    const skillsContainer = document.getElementById("skills-container");
    skillsContainer.innerHTML = data.competences.map(cat => `
        <div class="skill-group">
            <h4>${cat.categorie}</h4>
            <p>${cat.liste.join(', ')}</p>
        </div>
    `).join('');

    // 4. Section Expériences Professionnelles
    const expContainer = document.getElementById("experience-container");
    expContainer.innerHTML = data.experiences.map(exp => `
        <div class="job-card">
            <div class="job-header">
                <span class="job-title">${exp.poste}</span>
                <span class="job-date">${exp.periode}</span>
            </div>
            <div class="job-company">${exp.entreprise}</div>
            <ul class="job-missions">
                ${exp.missions.map(m => `<li>\${m}</li>`).join('')}
            </ul>
        </div>
    `).join('');

    // 5. Section Formations
    const eduContainer = document.getElementById("education-container");
    eduContainer.innerHTML = data.formations.map(edu => `
        <div class="edu-card">
            <div class="job-header">
                <span class="edu-title">${edu.diplome}</span>
                <span class="job-date">${edu.annee}</span>
            </div>
            <div class="job-company">${edu.institution}</div>
        </div>
    `).join('');
}

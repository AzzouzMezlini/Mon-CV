let cvData = null; // Stockage global des données JSON

document.addEventListener("DOMContentLoaded", () => {
    fetch('./cv-data.json')
        .then(response => {
            if (!response.ok) throw new Error("Erreur de chargement du JSON");
            return response.json();
        })
        .then(data => {
            cvData = data;
            populateCV(data);
            renderExperiences(); // Premier rendu des expériences selon l'option radio cochée
        })
        .catch(error => console.error("Erreur d'injection :", error));
});

function populateCV(data) {
    // 1. Header & Titre
    document.getElementById("user-name").innerText = data.coordonnees.nom;
    document.getElementById("user-title").innerText = `> ${data.statut}`;
    document.getElementById("profile-text").innerText = data.profil;

    // 2. Coordonnées de contact
    const coords = data.coordonnees;
    document.getElementById("contact-list").innerHTML = `
        <div class="contact-item">📍 <strong>${coords.adresse}</strong></div>
        <div class="contact-item">✉ <strong>${coords.email}</strong></div>
        <div class="contact-item">🚗 <strong>${coords.permis}</strong></div>
        <a class="contact-item" href="https://${coords.linkedin}" target="_blank"><strong>/in/azzouz-mezlini</strong></a>
        <a class="contact-item" href="https://${coords.github}" target="_blank"><strong>github.com/AzzouzMezlini</strong></a>
    `;

    // 3. Compétences
    document.getElementById("skills-container").innerHTML = data.competences.map(cat => {
        const tags = cat.liste.map(t => '<span class="skill-tag">' + t + '</span>').join('');
        return `
            <div class="skill-group-title">${cat.categorie}</div>
            <div class="skill-tag-group">${tags}</div>
        `;
    }).join('');

    // 4. Portfolio de projets
    document.getElementById("projects-container").innerHTML = data.projets.map(proj => `
        <div class="project-card">
            <div class="project-title">
                <span>${proj.titre}</span>
                <span class="project-badge">${proj.badge}</span>
            </div>
            <div class="project-desc">${proj.desc}</div>
        </div>
    `).join('');

    // 5. Formations
    document.getElementById("education-container").innerHTML = data.formations.map(edu => `
        <div class="edu-block">
            <div class="edu-title">${edu.diplome}</div>
            <div class="edu-sub">
                <span>${edu.institution}</span>
                <span class="edu-year">${edu.annee}</span>
            </div>
        </div>
    `).join('');
}

// Fonction appelée lors du changement de radio ou au chargement
function renderExperiences() {
    if (!cvData) return;

    // Récupération de l'option sélectionnée ("compact" ou "full")
    const mode = document.querySelector('input[name="viewMode"]:checked')?.value || 'compact';

    // Si mode compact : on prend les 7 premières expériences (ou celles marquées featured), sinon tout
    const experiencesToDisplay = (mode === 'compact')
        ? cvData.experiences.slice(0, 7)
        : cvData.experiences;

    // Injection dans le conteneur
    document.getElementById("experience-container").innerHTML = experiencesToDisplay.map(exp => {
        const bullets = exp.missions.map(m => '<li>' + m + '</li>').join('');
        const featuredClass = exp.featured ? 'featured-exp' : '';

        return `
            <div class="exp-card ${featuredClass}">
                <div class="exp-header">
                    <div class="exp-role-company">
                        <span class="exp-role">${exp.poste}</span> —
                        <span class="exp-company">${exp.entreprise}</span>
                    </div>
                    <span class="exp-date">${exp.periode}</span>
                </div>
                <ul class="exp-list">${bullets}</ul>
            </div>
        `;
    }).join('');
}

import { state } from './app.js';
import {
    toggleSkillFilter,
    handleExperienceHover,
    handleProjectHover,
    handleEducationHover,
    updateVisualHighlighting
} from './interactivity.js';

export function renderHeader() {
    if (!state.cvData) return;
    document.getElementById('user-name').textContent = state.cvData.coordonnees.nom;
    document.getElementById('user-title').textContent = state.cvData.statut;

    const contactList = document.getElementById('contact-list');
    if (contactList) {
        contactList.innerHTML = `
            <span class="contact-item">${state.cvData.coordonnees.adresse}</span>
            <span class="contact-item">${state.cvData.coordonnees.email}</span>
            <span class="contact-item">${state.cvData.coordonnees.permis}</span>
            <a class="contact-item" href="https://${state.cvData.coordonnees.linkedin}" target="_blank">LinkedIn</a>
            <a class="contact-item" href="https://${state.cvData.coordonnees.github}" target="_blank">GitHub</a>
        `;
    }
}

export function renderProfile() {
    const profileContainer = document.getElementById('profile-text');
    if (profileContainer && state.cvData) {
        profileContainer.textContent = state.cvData.profil;
    }
}

export function renderSkills() {
    if (!state.cvData) return;

    const containers = [
        document.getElementById('skills-container-top'),
        document.getElementById('skills-container-side')
    ];

    containers.forEach(container => {
        if (!container) return;
        container.innerHTML = '';

        state.cvData.competences.forEach(cat => {
            const groupTitle = document.createElement('div');
            groupTitle.className = 'skill-group-title';
            groupTitle.textContent = cat.categorie;
            container.appendChild(groupTitle);

            const tagGroup = document.createElement('div');
            tagGroup.className = 'skill-tag-group';

            cat.liste.forEach(item => {
                const tag = document.createElement('span');
                tag.className = 'skill-tag';
                tag.dataset.skill = item.nom;
                tag.dataset.defaultFeatured = item.featured ? "true" : "false";
                tag.textContent = item.nom;

                tag.addEventListener('click', () => toggleSkillFilter(item.nom));
                tagGroup.appendChild(tag);
            });

            container.appendChild(tagGroup);
        });
    });

    updateVisualHighlighting();
}

export function renderExperiences() {
    const timelineContainer = document.getElementById('experience-container');
    if (!timelineContainer || !state.cvData) return;
    timelineContainer.innerHTML = '';

    const viewMode = document.querySelector('input[name="viewMode"]:checked')?.value || 'compact';

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('view', viewMode);
    window.history.replaceState({}, '', newUrl);

    const pageElement = document.querySelector('.page');
    if (pageElement) {
        pageElement.classList.toggle('compact-view', viewMode === 'compact');
    }

    const experiencesToDisplay = (viewMode === 'compact')
        ? state.cvData.experiences.slice(0, 7)
        : state.cvData.experiences;

    experiencesToDisplay.forEach((exp) => {
        const originalIndex = state.cvData.experiences.indexOf(exp);

        const expDiv = document.createElement('div');
        expDiv.className = 'exp-card';
        expDiv.dataset.expIdx = originalIndex;
        expDiv.dataset.defaultFeatured = exp.featured ? "true" : "false";

        const companyLabel = exp.prestataire ? `${exp.entreprise} (via ${exp.prestataire})` : exp.entreprise;

        expDiv.innerHTML = `
            <div class="exp-header">
                <div>
                    <div class="exp-role">${exp.poste}</div>
                    <div class="exp-company">${companyLabel}</div>
                </div>
                <div class="exp-date">${exp.periode}</div>
            </div>
        `;

        const missionsList = document.createElement('ul');
        missionsList.className = 'exp-list';
        exp.missions.forEach((m, idx) => {
            if (viewMode === 'compact' && idx >= 2) return;
            const li = document.createElement('li');
            li.textContent = m;
            missionsList.appendChild(li);
        });
        expDiv.appendChild(missionsList);

        expDiv.addEventListener('mouseenter', () => handleExperienceHover(originalIndex));
        expDiv.addEventListener('mouseleave', () => handleExperienceHover(null));

        timelineContainer.appendChild(expDiv);
    });

    updateVisualHighlighting();
}

export function renderProjects() {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer || !state.cvData) return;
    projectsContainer.innerHTML = '';

    state.cvData.projets.forEach((proj, idx) => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.projIdx = idx;

        card.innerHTML = `
            <div class="project-title">
                <span>${proj.titre}</span>
                <span class="project-badge ${proj.type_badge}">${proj.badge}</span>
            </div>
            <div class="project-desc">${proj.desc}</div>
        `;

        card.addEventListener('mouseenter', () => handleProjectHover(idx));
        card.addEventListener('mouseleave', () => handleProjectHover(null));

        projectsContainer.appendChild(card);
    });
}

export function renderEducation() {
    const eduContainer = document.getElementById('education-container');
    if (!eduContainer || !state.cvData) return;
    eduContainer.innerHTML = '';

    state.cvData.formations.forEach((f, idx) => {
        const div = document.createElement('div');
        div.className = 'edu-block';
        div.dataset.eduIdx = idx;

        div.innerHTML = `
            <div class="edu-title">${f.diplome}</div>
            <div class="edu-sub">
                <span>${f.institution}</span>
                <span class="edu-year">${f.annee}</span>
            </div>
        `;

        div.addEventListener('mouseenter', () => handleEducationHover(idx));
        div.addEventListener('mouseleave', () => handleEducationHover(null));

        eduContainer.appendChild(div);
    });
}

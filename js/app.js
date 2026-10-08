import { validateAndCleanCVData } from './config.js';
import { initTheme } from './theme.js';
import {
    renderHeader,
    renderProfile,
    renderSkills,
    renderExperiences,
    renderProjects,
    renderEducation
} from './renderers.js';

// État global centralisé
export const state = {
    cvData: null,
    activeFilterSkill: null,
    hoveredSkill: null,
    hoveredExperienceIdx: null,
    hoveredProjectIdx: null,
    hoveredEduIdx: null
};

function autoDetectSkills() {
    if (!state.cvData) return;
    const allSkillsList = state.cvData.competences.flatMap(cat => cat.liste.map(s => s.nom));

    state.cvData.experiences.forEach(exp => {
        if (!exp.skills || exp.skills.length === 0) {
            const fullText = (exp.poste + ' ' + exp.entreprise + ' ' + exp.missions.join(' '));

            exp.skills = allSkillsList.filter(skill => {
                const cleanSkill = skill.split('(')[0].trim();
                const escapedSkill = cleanSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                try {
                    const regex = new RegExp(`(?<!\\p{L})${escapedSkill}(?!\\p{L})`, 'iu');
                    return regex.test(fullText);
                } catch (e) {
                    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
                    return regex.test(fullText);
                }
            });
        }
    });
}

function initViewModeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('view');

    if (modeParam === 'full' || modeParam === 'compact') {
        const radio = document.querySelector(`input[name="viewMode"][value="${modeParam}"]`);
        if (radio) radio.checked = true;
    }
}

async function loadCVData() {
    try {
        const response = await fetch('cv-data.json');
        if (!response.ok) throw new Error(`Erreur réseau (${response.status})`);

        const rawData = await response.json();

        // Sécurisation & validation
        state.cvData = validateAndCleanCVData(rawData);

        initViewModeFromURL();
        autoDetectSkills();

        renderHeader();
        renderProfile();
        renderSkills();
        renderExperiences();
        renderProjects();
        renderEducation();

    } catch (error) {
        console.error("Erreur critique lors du chargement des données :", error);
    }
}

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadCVData();

    // Exposition globale pour l'événement onchange du HTML
    window.renderExperiences = renderExperiences;
});

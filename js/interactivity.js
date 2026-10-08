import { state } from './app.js';

export function handleSkillHover(skillName) {
    state.hoveredSkill = skillName;
    updateVisualHighlighting();
}

export function handleExperienceHover(expIdx) {
    state.hoveredExperienceIdx = expIdx;
    updateVisualHighlighting();
}

export function handleProjectHover(projIdx) {
    state.hoveredProjectIdx = projIdx;
    updateVisualHighlighting();
}

export function handleEducationHover(eduIdx) {
    state.hoveredEduIdx = eduIdx;
    updateVisualHighlighting();
}

export function toggleSkillFilter(skillName) {
    state.activeFilterSkill = (state.activeFilterSkill === skillName) ? null : skillName;
    updateVisualHighlighting();
}

function isSameSkill(skillA, skillB) {
    if (!skillA || !skillB) return false;
    return skillA.trim().toLowerCase() === skillB.trim().toLowerCase();
}

export function updateVisualHighlighting() {
    const allSkillTags = document.querySelectorAll('.skill-tag');
    const allExpCards = document.querySelectorAll('.exp-card');
    const allProjCards = document.querySelectorAll('.project-card');
    const allEduBlocks = document.querySelectorAll('.edu-block');

    const isInteracting = state.activeFilterSkill ||
                          state.hoveredSkill ||
                          state.hoveredExperienceIdx !== null ||
                          state.hoveredProjectIdx !== null ||
                          state.hoveredEduIdx !== null;

    // --- A. ÉTAT PAR DÉFAUT ---
    if (!isInteracting) {
        allSkillTags.forEach(tag => {
            tag.classList.remove('highlighted', 'dimmed', 'active-filter');
            if (tag.dataset.defaultFeatured === "true") tag.classList.add('featured');
        });

        allExpCards.forEach(card => {
            card.classList.remove('highlighted', 'dimmed');
            if (card.dataset.defaultFeatured === "true") card.classList.add('featured-exp');
        });

        allProjCards.forEach(card => card.classList.remove('highlighted', 'dimmed'));
        allEduBlocks.forEach(block => block.classList.remove('highlighted', 'dimmed'));
        return;
    }

    // --- B. SURVOL PROJET ---
    if (state.hoveredProjectIdx !== null && !state.hoveredSkill) {
        const targetProj = state.cvData.projets[state.hoveredProjectIdx];
        const projSkills = targetProj?.skills || [];

        allSkillTags.forEach(tag => {
            const isAssociated = projSkills.some(s => isSameSkill(s, tag.dataset.skill));
            tag.classList.toggle('highlighted', isAssociated);
            tag.classList.toggle('dimmed', !isAssociated);
        });

        allProjCards.forEach(card => {
            const isTarget = parseInt(card.dataset.projIdx, 10) === state.hoveredProjectIdx;
            card.classList.toggle('highlighted', isTarget);
            card.classList.toggle('dimmed', !isTarget);
        });

        allEduBlocks.forEach(block => block.classList.add('dimmed'));
        return;
    }

    // --- C. SURVOL FORMATION ---
    if (state.hoveredEduIdx !== null && !state.hoveredSkill) {
        const targetEdu = state.cvData.formations[state.hoveredEduIdx];
        const eduSkills = targetEdu?.skills || [];

        allSkillTags.forEach(tag => {
            const isAssociated = eduSkills.some(s => isSameSkill(s, tag.dataset.skill));
            tag.classList.toggle('highlighted', isAssociated);
            tag.classList.toggle('dimmed', !isAssociated);
        });

        allEduBlocks.forEach(block => {
            const isTarget = parseInt(block.dataset.eduIdx, 10) === state.hoveredEduIdx;
            block.classList.toggle('highlighted', isTarget);
            block.classList.toggle('dimmed', !isTarget);
        });

        allProjCards.forEach(card => card.classList.add('dimmed'));
        return;
    }

    // --- D. SURVOL EXPÉRIENCES ---
    if (state.hoveredExperienceIdx !== null && !state.hoveredSkill) {
        const targetExpData = state.cvData.experiences[state.hoveredExperienceIdx];

        if (targetExpData) {
            const expSkills = targetExpData.skills || [];

            allSkillTags.forEach(tag => {
                tag.classList.remove('featured');
                const isAssociated = expSkills.some(s => isSameSkill(s, tag.dataset.skill));
                tag.classList.toggle('highlighted', isAssociated);
                tag.classList.toggle('dimmed', !isAssociated);
            });

            allExpCards.forEach(card => {
                card.classList.remove('featured-exp');
                const isTarget = parseInt(card.dataset.expIdx, 10) === state.hoveredExperienceIdx;
                card.classList.toggle('highlighted', isTarget);
                card.classList.toggle('dimmed', !isTarget);
            });
        }
    }
}

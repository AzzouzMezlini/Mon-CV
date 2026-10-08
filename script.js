// Variable globale pour stocker les données du JSON
let cvData = null;

let activeFilterSkill = null;
let hoveredSkill = null;
let hoveredExperienceIdx = null;
let hoveredProjectIdx = null;
let hoveredEduIdx = null;

// Éléments du DOM
const timelineContainer = document.getElementById('experience-container');
const projectsContainer = document.getElementById('projects-container');
const profileContainer = document.getElementById('profile-text');
const eduContainer = document.getElementById('education-container');

// 1. Chargement initial des données

document.addEventListener('DOMContentLoaded', () => {
    const themeCheckbox = document.getElementById('theme-toggle');
    const storageKey = 'cv_theme_preference';

    const getPreferredTheme = () => {
        const savedTheme = localStorage.getItem(storageKey);
        if (savedTheme) return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeCheckbox) {
            themeCheckbox.checked = (theme === 'dark');
        }
    };

    // 1. Initialisation
    const initialTheme = getPreferredTheme();
    applyTheme(initialTheme);

    // 2. Activation des transitions après premier rendu
    requestAnimationFrame(() => {
        document.body.classList.add('theme-transition');
    });

    // 3. Écoute du changement d'état du switch
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', () => {
            const newTheme = themeCheckbox.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(storageKey, newTheme);
        });
    }
});

function initViewModeFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get('view'); // Récupère la valeur de ?view=...

  if (modeParam === 'full' || modeParam === 'compact') {
    const radio = document.querySelector(`input[name="viewMode"][value="${modeParam}"]`);
    if (radio) {
      radio.checked = true;
    }
  }
}

async function loadCVData() {
  try {
    const response = await fetch('cv-data.json');
    cvData = await response.json();

    initViewModeFromURL();

    autoDetectSkills();

    renderHeader();
    renderProfile();
    renderSkills();
    renderExperiences();
    renderProjects();
    renderEducation();

  } catch (error) {
    console.error("Erreur lors du chargement des données CV :", error);
  }
}

// 2. Détection automatique des compétences
function autoDetectSkills() {
  const allSkillsList = cvData.competences.flatMap(cat => cat.liste.map(s => s.nom));

  cvData.experiences.forEach(exp => {
    if (!exp.skills || exp.skills.length === 0) {
      const fullText = (exp.poste + ' ' + exp.entreprise + ' ' + exp.missions.join(' '));

      console.log(`--- Analyse Auto-Detect pour : "${exp.poste} (${exp.entreprise})"`);

      exp.skills = allSkillsList.filter(skill => {
        const cleanSkill = skill.split('(')[0].trim();
        const escapedSkill = cleanSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        let isMatch = false;
        try {
          // Lookbehind/Lookahead Unicode : vérifie que le skill n'est ni précédé ni suivi d'une lettre (y compris accentuée)
          const regex = new RegExp(`(?<!\\p{L})${escapedSkill}(?!\\p{L})`, 'iu');
          isMatch = regex.test(fullText);
        } catch (e) {
          // Fallback simple si la syntaxe Unicode n'est pas supportée
          const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
          isMatch = regex.test(fullText);
        }

        if (isMatch) {
          console.log(`  [MATCH] Compétence détectée : "${skill}" (Clean: "${cleanSkill}")`);
        }

        return isMatch;
      });

      if (exp.skills.length === 0) {
        console.warn(`  [AUCUN MATCH] Aucune compétence détectée dans le texte.`);
      }
    }
  });

}

// 3. En-tête et Profil
function renderHeader() {
  if (!cvData) return;
  document.getElementById('user-name').textContent = cvData.coordonnees.nom;
  document.getElementById('user-title').textContent = cvData.statut;

  const contactList = document.getElementById('contact-list');
  contactList.innerHTML = `
    <span class="contact-item">${cvData.coordonnees.adresse}</span>
    <span class="contact-item">${cvData.coordonnees.email}</span>
    <span class="contact-item">${cvData.coordonnees.permis}</span>
    <a class="contact-item" href="https://${cvData.coordonnees.linkedin}" target="_blank">LinkedIn</a>
    <a class="contact-item" href="https://${cvData.coordonnees.github}" target="_blank">GitHub</a>
  `;
}

function renderProfile() {
  if (!profileContainer || !cvData) return;
  profileContainer.textContent = cvData.profil;
}

// 4. Compétences (Alimente les 2 conteneurs : Top & Side)
function renderSkills() {
  if (!cvData) return;

  const containers = [
    document.getElementById('skills-container-top'),
    document.getElementById('skills-container-side')
  ];

  containers.forEach(container => {
    if (!container) return;
    container.innerHTML = '';

    cvData.competences.forEach(cat => {
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

// 5. Expériences Professionnelles
function renderExperiences() {
  if (!timelineContainer || !cvData) return;
  timelineContainer.innerHTML = '';

  const viewMode = document.querySelector('input[name="viewMode"]:checked')?.value || 'compact';

  // Mise à jour discrète de l'URL dans la barre d'adresse
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set('view', viewMode);
  window.history.replaceState({}, '', newUrl);

  // Gestion de la classe CSS compact sur .page
  const pageElement = document.querySelector('.page');
  if (pageElement) {
    pageElement.classList.toggle('compact-view', viewMode === 'compact');
  }

  // Filtrage des expériences
  const experiencesToDisplay = (viewMode === 'compact')
    ? cvData.experiences.slice(0, 7)
    : cvData.experiences;

  experiencesToDisplay.forEach((exp) => {
    const originalIndex = cvData.experiences.indexOf(exp);

    const expDiv = document.createElement('div');
    expDiv.className = 'exp-card';
    expDiv.dataset.expIdx = originalIndex;
    expDiv.dataset.defaultFeatured = exp.featured ? "true" : "false";
    expDiv.dataset.skills = JSON.stringify(exp.skills || []);

    const companyLabel = exp.prestataire ? `${exp.entreprise} (via ${exp.prestataire})` : exp.entreprise;

    const header = document.createElement('div');
    header.className = 'exp-header';
    header.innerHTML = `
      <div>
        <div class="exp-role">${exp.poste}</div>
        <div class="exp-company">${companyLabel}</div>
      </div>
      <div class="exp-date">${exp.periode}</div>
    `;
    expDiv.appendChild(header);

    const missionsList = document.createElement('ul');
    missionsList.className = 'exp-list';
    // Dans renderExperiences()
    exp.missions.forEach((m, idx) => {
        // En mode compact, conserve uniquement les 2 premières puces
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

// 6. Projets
function renderProjects() {
  if (!projectsContainer || !cvData) return;
  projectsContainer.innerHTML = '';

  cvData.projets.forEach((proj, idx) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.projIdx = idx;
    card.dataset.skills = JSON.stringify(proj.skills || []);

    card.innerHTML = `
      <div class="project-title">
        <span>${proj.titre}</span>
        <span class="project-badge ${proj.type_badge}">${proj.badge}</span>
      </div>
      <div class="project-desc">${proj.desc}</div>
    `;

    // Interactivité au survol du projet
    card.addEventListener('mouseenter', () => handleProjectHover(idx));
    card.addEventListener('mouseleave', () => handleProjectHover(null));

    projectsContainer.appendChild(card);
  });
}

// 7. Formations
function renderEducation() {
  if (!eduContainer || !cvData) return;
  eduContainer.innerHTML = '';

  cvData.formations.forEach((f, idx) => {
    const div = document.createElement('div');
    div.className = 'edu-block';
    div.dataset.eduIdx = idx;
    div.dataset.skills = JSON.stringify(f.skills || []);

    div.innerHTML = `
      <div class="edu-title">${f.diplome}</div>
      <div class="edu-sub">
        <span>${f.institution}</span>
        <span class="edu-year">${f.annee}</span>
      </div>
    `;

    // Interactivité au survol de la formation
    div.addEventListener('mouseenter', () => handleEducationHover(idx));
    div.addEventListener('mouseleave', () => handleEducationHover(null));

    eduContainer.appendChild(div);
  });
}

// 8. Gestion de l'interactivité et de la surbrillance
function handleSkillHover(skillName) {
  hoveredSkill = skillName;
  updateVisualHighlighting();
}

function handleExperienceHover(expIdx) {
  hoveredExperienceIdx = expIdx;
  updateVisualHighlighting();
}

function handleProjectHover(projIdx) {
  hoveredProjectIdx = projIdx;
  updateVisualHighlighting();
}

function handleEducationHover(eduIdx) {
  hoveredEduIdx = eduIdx;
  updateVisualHighlighting();
}

function toggleSkillFilter(skillName) {
  document.querySelector('.page').classList.toggle('compact-view', viewMode === 'compact');
  activeFilterSkill = (activeFilterSkill === skillName) ? null : skillName;
  updateVisualHighlighting();
}

function isSameSkill(skillA, skillB) {
  if (!skillA || !skillB) return false;
  return skillA.trim().toLowerCase() === skillB.trim().toLowerCase();
}

function updateVisualHighlighting() {
  const allSkillTags = document.querySelectorAll('.skill-tag');
    const allExpCards = document.querySelectorAll('.exp-card');
    const allProjCards = document.querySelectorAll('.project-card');
    const allEduBlocks = document.querySelectorAll('.edu-block');

    const isInteracting = activeFilterSkill ||
                          hoveredSkill ||
                          hoveredExperienceIdx !== null ||
                          hoveredProjectIdx !== null ||
                          hoveredEduIdx !== null;

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
    if (hoveredProjectIdx !== null && !hoveredSkill) {
      const targetProj = cvData.projets[hoveredProjectIdx];
      const projSkills = targetProj?.skills || [];

      allSkillTags.forEach(tag => {
        const isAssociated = projSkills.some(s => isSameSkill(s, tag.dataset.skill));
        tag.classList.toggle('highlighted', isAssociated);
        tag.classList.toggle('dimmed', !isAssociated);
      });

      allProjCards.forEach(card => {
        const isTarget = parseInt(card.dataset.projIdx, 10) === hoveredProjectIdx;
        card.classList.toggle('highlighted', isTarget);
        card.classList.toggle('dimmed', !isTarget);
      });

      //allExpCards.forEach(card => card.classList.add('dimmed'));
      allEduBlocks.forEach(block => block.classList.add('dimmed'));
      return;
    }

    // --- C. SURVOL FORMATION ---
    if (hoveredEduIdx !== null && !hoveredSkill) {
      const targetEdu = cvData.formations[hoveredEduIdx];
      const eduSkills = targetEdu?.skills || [];

      allSkillTags.forEach(tag => {
        const isAssociated = eduSkills.some(s => isSameSkill(s, tag.dataset.skill));
        tag.classList.toggle('highlighted', isAssociated);
        tag.classList.toggle('dimmed', !isAssociated);
      });

      allEduBlocks.forEach(block => {
        const isTarget = parseInt(block.dataset.eduIdx, 10) === hoveredEduIdx;
        block.classList.toggle('highlighted', isTarget);
        block.classList.toggle('dimmed', !isTarget);
      });

      //allExpCards.forEach(card => card.classList.add('dimmed'));
      allProjCards.forEach(card => card.classList.add('dimmed'));
      return;
    }

  // --- C. SURVOL EXPERIENCES ---
  if (hoveredExperienceIdx !== null && !hoveredSkill) {
    const targetExpData = cvData.experiences[hoveredExperienceIdx];

    if (targetExpData) {
      const expSkills = targetExpData.skills || [];

      allSkillTags.forEach(tag => {
        tag.classList.remove('featured');
        const isAssociated = expSkills.some(s => isSameSkill(s, tag.dataset.skill));

        if (isAssociated) {
          tag.classList.add('highlighted');
        } else {
          tag.classList.add('dimmed');
        }
      });

      allExpCards.forEach(card => {
        card.classList.remove('featured-exp');
        if (parseInt(card.dataset.expIdx, 10) === hoveredExperienceIdx) {
          card.classList.add('highlighted');
        } else {
          card.classList.add('dimmed');
        }
      });
    }
  }
}

window.onload = loadCVData;

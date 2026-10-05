// Variable globale pour stocker les données du JSON
let cvData = null;

let activeFilterSkill = null;
let hoveredSkill = null;
let hoveredExperienceIdx = null;

// Éléments du DOM (alignés avec index.html)
const skillsContainer = document.getElementById('skills-container');
const timelineContainer = document.getElementById('experience-container');
const projectsContainer = document.getElementById('projects-container');
const profileContainer = document.getElementById('profile-text');
const eduContainer = document.getElementById('education-container');

// 1. Chargement initial des données
async function loadCVData() {
  try {
    const response = await fetch('cv-data.json'); // Assure-toi que ton fichier s'appelle bien cv-data.json
    cvData = await response.json();

    // Enrichissement automatique des compétences dans les cartes
    autoDetectSkills();

    // Rendu complet du CV
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
      const fullText = (exp.poste + ' ' + exp.entreprise + ' ' + exp.missions.join(' ')).toLowerCase();
      exp.skills = allSkillsList.filter(skill => {
        const cleanSkill = skill.toLowerCase().split('(')[0].trim();
        return fullText.includes(cleanSkill);
      });
    }
  });

  cvData.projets.forEach(proj => {
    if (!proj.skills || proj.skills.length === 0) {
      const fullText = (proj.titre + ' ' + proj.desc).toLowerCase();
      proj.skills = allSkillsList.filter(skill => {
        const cleanSkill = skill.toLowerCase().split('(')[0].trim();
        return fullText.includes(cleanSkill);
      });
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

// 4. Compétences
function renderSkills() {
  if (!skillsContainer || !cvData) return;
  skillsContainer.innerHTML = '';

  cvData.competences.forEach(cat => {
    const groupTitle = document.createElement('div');
    groupTitle.className = 'skill-group-title';
    groupTitle.textContent = cat.categorie;
    skillsContainer.appendChild(groupTitle);

    const tagGroup = document.createElement('div');
    tagGroup.className = 'skill-tag-group';

    cat.liste.forEach(item => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.dataset.skill = item.nom;
      tag.dataset.defaultFeatured = item.featured ? "true" : "false";
      tag.textContent = item.nom;

      tag.addEventListener('mouseenter', () => handleSkillHover(item.nom));
      tag.addEventListener('mouseleave', () => handleSkillHover(null));
      tag.addEventListener('click', () => toggleSkillFilter(item.nom));

      tagGroup.appendChild(tag);
    });

    skillsContainer.appendChild(tagGroup);
  });

  updateVisualHighlighting();
}

// 5. Expériences Professionnelles
function renderExperiences() {
  if (!timelineContainer || !cvData) return;
  timelineContainer.innerHTML = '';

  // Mode d'affichage compact/complet via boutons radio
  const viewMode = document.querySelector('input[name="viewMode"]:checked')?.value || 'compact';
  const expsToRender = (viewMode === 'compact')
    ? cvData.experiences.filter(e => e.featured)
    : cvData.experiences;

  expsToRender.forEach((exp, index) => {
    const expDiv = document.createElement('div');
    expDiv.className = 'exp-card';
    expDiv.dataset.expIdx = index;
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
    exp.missions.forEach(m => {
      const li = document.createElement('li');
      li.textContent = m;
      missionsList.appendChild(li);
    });
    expDiv.appendChild(missionsList);

    expDiv.addEventListener('mouseenter', () => handleExperienceHover(index));
    expDiv.addEventListener('mouseleave', () => handleExperienceHover(null));

    timelineContainer.appendChild(expDiv);
  });

  updateVisualHighlighting();
}

// 6. Projets
function renderProjects() {
  if (!projectsContainer || !cvData) return;
  projectsContainer.innerHTML = '';

  cvData.projets.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.skills = JSON.stringify(proj.skills || []);

    card.innerHTML = `
      <div class="project-title">
        <span>${proj.titre}</span>
        <span class="project-badge ${proj.type_badge}">${proj.badge}</span>
      </div>
      <div class="project-desc">${proj.desc}</div>
    `;

    projectsContainer.appendChild(card);
  });
}

// 7. Formations
function renderEducation() {
  if (!eduContainer || !cvData) return;
  eduContainer.innerHTML = '';

  cvData.formations.forEach(f => {
    const div = document.createElement('div');
    div.className = 'edu-block';
    div.innerHTML = `
      <div class="edu-title">${f.diplome}</div>
      <div class="edu-sub">
        <span>${f.institution}</span>
        <span class="edu-year">${f.annee}</span>
      </div>
    `;
    eduContainer.appendChild(div);
  });
}

// 8. Gestion de l'interactivité et basculement (Toggle) "Featured"
function handleSkillHover(skillName) {
  hoveredSkill = skillName;
  updateVisualHighlighting();
}

function handleExperienceHover(expIdx) {
  hoveredExperienceIdx = expIdx;
  updateVisualHighlighting();
}

function toggleSkillFilter(skillName) {
  activeFilterSkill = (activeFilterSkill === skillName) ? null : skillName;
  updateVisualHighlighting();
}

function updateVisualHighlighting() {
  const allSkillTags = document.querySelectorAll('.skill-tag');
  const allExpCards = document.querySelectorAll('.exp-card');
  const allProjCards = document.querySelectorAll('.project-card');

  const isInteracting = activeFilterSkill || hoveredSkill || hoveredExperienceIdx !== null;

  // --- A. ÉTAT PAR DÉFAUT (Aucune interaction) ---
  if (!isInteracting) {
    allSkillTags.forEach(tag => {
      tag.classList.remove('highlighted', 'dimmed', 'active-filter');
      if (tag.dataset.defaultFeatured === "true") {
        tag.classList.add('featured');
      } else {
        tag.classList.remove('featured');
      }
    });

    allExpCards.forEach(card => {
      card.classList.remove('highlighted', 'dimmed');
      if (card.dataset.defaultFeatured === "true") {
        card.classList.add('featured-exp');
      } else {
        card.classList.remove('featured-exp');
      }
    });

    allProjCards.forEach(card => card.classList.remove('highlighted', 'dimmed'));
    return;
  }

  // --- B. ÉTAT INTERACTIF (Filtre ou Survol) ---
  allSkillTags.forEach(tag => {
    tag.classList.remove('featured', 'highlighted', 'dimmed', 'active-filter');
    if (activeFilterSkill && tag.dataset.skill === activeFilterSkill) {
      tag.classList.add('active-filter');
    }
  });

  allExpCards.forEach(card => card.classList.remove('featured-exp', 'highlighted', 'dimmed'));
  allProjCards.forEach(card => card.classList.remove('highlighted', 'dimmed'));

  // Application du filtrage / survol des compétences
  if (hoveredSkill || activeFilterSkill) {
    const targetSkill = hoveredSkill || activeFilterSkill;

    allSkillTags.forEach(tag => {
      if (tag.dataset.skill === targetSkill) {
        tag.classList.add('highlighted');
      } else {
        tag.classList.add('dimmed');
      }
    });

    allExpCards.forEach(card => {
      const skills = JSON.parse(card.dataset.skills || '[]');
      if (skills.includes(targetSkill)) {
        card.classList.add('highlighted');
      } else {
        card.classList.add('dimmed');
      }
    });

    allProjCards.forEach(card => {
      const skills = JSON.parse(card.dataset.skills || '[]');
      if (skills.includes(targetSkill)) {
        card.classList.add('highlighted');
      } else {
        card.classList.add('dimmed');
      }
    });
  }

  // Application du survol d'une carte d'expérience
  if (hoveredExperienceIdx !== null && !hoveredSkill) {
    const expCardsArray = Array.from(allExpCards);
    const targetCard = expCardsArray[hoveredExperienceIdx];

    if (targetCard) {
      const skills = JSON.parse(targetCard.dataset.skills || '[]');

      allSkillTags.forEach(tag => {
        if (skills.includes(tag.dataset.skill)) {
          tag.classList.add('highlighted');
        } else {
          tag.classList.add('dimmed');
        }
      });

      allExpCards.forEach((card, idx) => {
        if (idx === hoveredExperienceIdx) {
          card.classList.add('highlighted');
        } else {
          card.classList.add('dimmed');
        }
      });
    }
  }
}

// Chargement initial au démarrage
window.onload = loadCVData;

// Variable globale qui contiendra les données du JSON
let cvData = null;

let activeFilterSkill = null;
let hoveredSkill = null;
let hoveredExperienceIdx = null;

// Éléments du DOM
const skillsContainer = document.getElementById('skillsSidebarContainer');
const timelineContainer = document.getElementById('experienceTimeline');
const projectsContainer = document.getElementById('projectsGrid');
const filterBanner = document.getElementById('filterBanner');
const filterSkillName = document.getElementById('filterSkillName');
const resetFilterBtn = document.getElementById('resetFilterBtn');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');

// 1. Chargement initial des données
async function loadCVData() {
  try {
    const response = await fetch('cv-data.json');
    cvData = await response.json();

    // Enrichissement automatique des tableaux skills s'ils sont vides dans le JSON
    autoDetectSkills();

    // Rendu
    renderSkills();
    renderExperiences();
    renderProjects();
  } catch (error) {
    console.error("Erreur lors du chargement des données CV :", error);
  }
}

// 2. Détection automatique des compétences citées dans les missions/projets
function autoDetectSkills() {
  // Extrait la liste à plat de tous les noms de compétences du JSON
  const allSkillsList = cvData.competences.flatMap(cat => cat.liste.map(s => s.nom));

  // Auto-population pour les expériences
  cvData.experiences.forEach(exp => {
    if (!exp.skills || exp.skills.length === 0) {
      const fullText = (exp.poste + ' ' + exp.entreprise + ' ' + exp.missions.join(' ')).toLowerCase();
      exp.skills = allSkillsList.filter(skill => {
        // Recherche insensible à la casse
        const cleanSkill = skill.toLowerCase().split('(')[0].trim(); // Nettoie ex: "Méthode MERISE (MCD/MLD)" -> "méthode merise"
        return fullText.includes(cleanSkill);
      });
    }
  });

  // Auto-population pour les projets
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

// 3. Rendu de la barre des Compétences
function renderSkills() {
  if (!skillsContainer || !cvData) return;
  skillsContainer.innerHTML = '';

  cvData.competences.forEach(cat => {
    const catDiv = document.createElement('div');
    catDiv.className = 'skill-category';

    const title = document.createElement('div');
    title.className = 'skill-category-title';
    title.textContent = cat.categorie;
    catDiv.appendChild(title);

    const flex = document.createElement('div');
    flex.className = 'skills-flex';

    cat.liste.forEach(item => {
      const tag = document.createElement('span');
      tag.className = `skill-tag ${item.featured ? 'featured' : ''}`;
      tag.dataset.skill = item.nom;
      tag.textContent = item.nom;

      tag.addEventListener('mouseenter', () => handleSkillHover(item.nom));
      tag.addEventListener('mouseleave', () => handleSkillHover(null));
      tag.addEventListener('click', () => toggleSkillFilter(item.nom));

      flex.appendChild(tag);
    });

    catDiv.appendChild(flex);
    skillsContainer.appendChild(catDiv);
  });
}

// 4. Rendu des Expériences
function renderExperiences() {
  if (!timelineContainer || !cvData) return;
  timelineContainer.innerHTML = '';

  cvData.experiences.forEach((exp, index) => {
    const expDiv = document.createElement('div');
    expDiv.className = `exp-card ${exp.featured ? 'featured-exp' : ''}`;
    expDiv.dataset.expIdx = index;
    expDiv.dataset.skills = JSON.stringify(exp.skills || []);

    const inner = document.createElement('div');
    inner.className = 'exp-inner';

    const header = document.createElement('div');
    header.className = 'exp-header';

    const companyLabel = exp.prestataire ? `${exp.entreprise} (via ${exp.prestataire})` : exp.entreprise;
    header.innerHTML = `
      <div>
        <div class="exp-role">${exp.poste}</div>
        <div class="exp-company">${companyLabel}</div>
      </div>
      <div class="exp-period">${exp.periode}</div>
    `;

    const loc = document.createElement('div');
    loc.className = 'exp-location';
    loc.textContent = exp.ville;

    const missionsList = document.createElement('ul');
    missionsList.className = 'exp-missions';
    exp.missions.forEach(m => {
      const li = document.createElement('li');
      li.className = 'mission-item';
      li.textContent = m;
      missionsList.appendChild(li);
    });

    const expSkillsDiv = document.createElement('div');
    expSkillsDiv.className = 'exp-skills';
    (exp.skills || []).forEach(s => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.dataset.skill = s;
      tag.textContent = s;
      tag.addEventListener('mouseenter', (e) => { e.stopPropagation(); handleSkillHover(s); });
      tag.addEventListener('mouseleave', (e) => { e.stopPropagation(); handleSkillHover(null); });
      tag.addEventListener('click', (e) => { e.stopPropagation(); toggleSkillFilter(s); });
      expSkillsDiv.appendChild(tag);
    });

    inner.appendChild(header);
    if (exp.ville) inner.appendChild(loc);
    inner.appendChild(missionsList);
    if (exp.skills.length > 0) inner.appendChild(expSkillsDiv);
    expDiv.appendChild(inner);

    expDiv.addEventListener('mouseenter', () => handleExperienceHover(index));
    expDiv.addEventListener('mouseleave', () => handleExperienceHover(null));

    timelineContainer.appendChild(expDiv);
  });
}

// 5. Rendu des Projets
function renderProjects() {
  if (!projectsContainer || !cvData) return;
  projectsContainer.innerHTML = '';

  cvData.projets.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.skills = JSON.stringify(proj.skills || []);

    const top = document.createElement('div');
    top.innerHTML = `
      <div class="project-header">
        <span class="project-title">${proj.titre}</span>
        <span class="badge badge-${proj.type_badge}">${proj.badge}</span>
      </div>
      <div class="project-desc">${proj.desc}</div>
    `;

    const skillsDiv = document.createElement('div');
    skillsDiv.className = 'exp-skills';
    skillsDiv.style.borderTop = 'none';
    skillsDiv.style.paddingTop = '0';

    (proj.skills || []).forEach(s => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.dataset.skill = s;
      tag.textContent = s;
      tag.addEventListener('mouseenter', (e) => { e.stopPropagation(); handleSkillHover(s); });
      tag.addEventListener('mouseleave', (e) => { e.stopPropagation(); handleSkillHover(null); });
      tag.addEventListener('click', (e) => { e.stopPropagation(); toggleSkillFilter(s); });
      skillsDiv.appendChild(tag);
    });

    card.appendChild(top);
    if (proj.skills.length > 0) card.appendChild(skillsDiv);
    projectsContainer.appendChild(card);
  });
}

// 6. Gestion du Survol et du Filtrage
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
  updateFilterState();
  updateVisualHighlighting();
}

function updateFilterState() {
  if (!filterBanner) return;
  if (activeFilterSkill) {
    filterBanner.classList.add('active');
    if (filterSkillName) filterSkillName.textContent = activeFilterSkill;
  } else {
    filterBanner.classList.remove('active');
  }
}

function updateVisualHighlighting() {
  const allSkillTags = document.querySelectorAll('.skill-tag');
  const allExpCards = document.querySelectorAll('.exp-card');
  const allProjCards = document.querySelectorAll('.project-card');

  // Reset & Filtre actif
  allSkillTags.forEach(tag => {
    tag.classList.remove('highlighted', 'dimmed', 'active-filter');
    if (activeFilterSkill && tag.dataset.skill === activeFilterSkill) {
      tag.classList.add('active-filter');
    }
  });

  allExpCards.forEach(card => card.classList.remove('highlighted', 'dimmed'));
  allProjCards.forEach(card => card.classList.remove('highlighted', 'dimmed'));

  // Application du filtre de clic
  if (activeFilterSkill) {
    allExpCards.forEach(card => {
      const skills = JSON.parse(card.dataset.skills || '[]');
      if (!skills.includes(activeFilterSkill)) card.classList.add('dimmed');
    });
    allProjCards.forEach(card => {
      const skills = JSON.parse(card.dataset.skills || '[]');
      if (!skills.includes(activeFilterSkill)) card.classList.add('dimmed');
    });
  }

  // Application du survol d'une compétence
  if (hoveredSkill) {
    allSkillTags.forEach(tag => {
      if (tag.dataset.skill === hoveredSkill) {
        tag.classList.add('highlighted');
      } else if (!activeFilterSkill) {
        tag.classList.add('dimmed');
      }
    });

    allExpCards.forEach(card => {
      const skills = JSON.parse(card.dataset.skills || '[]');
      if (skills.includes(hoveredSkill)) {
        card.classList.add('highlighted');
        card.classList.remove('dimmed');
      } else {
        card.classList.add('dimmed');
      }
    });

    allProjCards.forEach(card => {
      const skills = JSON.parse(card.dataset.skills || '[]');
      if (skills.includes(hoveredSkill)) {
        card.classList.add('highlighted');
        card.classList.remove('dimmed');
      } else {
        card.classList.add('dimmed');
      }
    });
  }

  // Application du survol d'une carte d'expérience
  if (hoveredExperienceIdx !== null && !hoveredSkill && cvData) {
    const targetExp = cvData.experiences[hoveredExperienceIdx];
    if (targetExp) {
      allSkillTags.forEach(tag => {
        if ((targetExp.skills || []).includes(tag.dataset.skill)) {
          tag.classList.add('highlighted');
        } else if (!activeFilterSkill) {
          tag.classList.add('dimmed');
        }
      });

      allExpCards.forEach((card, idx) => {
        if (idx === hoveredExperienceIdx) {
          card.classList.add('highlighted');
        } else if (!activeFilterSkill) {
          card.classList.add('dimmed');
        }
      });
    }
  }
}

// 7. Barre de recherche contextuelle
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const allExpCards = document.querySelectorAll('.exp-card');
    const allProjCards = document.querySelectorAll('.project-card');

    if (!query) {
      allExpCards.forEach(c => c.style.display = 'block');
      allProjCards.forEach(c => c.style.display = 'flex');
      return;
    }

    allExpCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(query) ? 'block' : 'none';
    });

    allProjCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(query) ? 'flex' : 'none';
    });
  });
}

// 8. Réinitialisation des filtres et Mode sombre
if (resetFilterBtn) {
  resetFilterBtn.addEventListener('click', () => {
    activeFilterSkill = null;
    updateFilterState();
    updateVisualHighlighting();
  });
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
  });
}

// Lancement au chargement de la page
window.onload = loadCVData;

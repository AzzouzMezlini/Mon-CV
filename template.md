<!-- Styles CSS embarqués pour la mise en page du CV sur GitHub -->
<style>
  .cv-wrapper {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: #24292e;
    margin: 20px 0;
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    overflow: hidden;
  }
  .cv-grid {
    display: grid;
    grid-template-columns: 1fr 2.5fr;
    min-height: 500px;
  }
  .cv-sidebar {
    background-color: #1f2328;
    color: #f0f6fc;
    padding: 25px 20px;
  }
  .cv-sidebar h1 { color: #ffffff; font-size: 22px; margin: 0 0 5px 0; border: none; padding: 0; }
  .cv-sidebar h2 { color: #2f81f7; font-size: 14px; margin: 0 0 25px 0; border: none; padding: 0; font-weight: 400; }
  .cv-sidebar h3 { color: #ffffff; font-size: 14px; border-bottom: 1px solid #30363d; padding-bottom: 5px; margin-top: 20px; text-transform: uppercase; }
  .cv-sidebar ul { list-style: none; padding: 0; margin: 0; }
  .cv-sidebar ul li { margin-bottom: 8px; font-size: 13px; }
  .cv-sidebar a { color: #f0f6fc; text-decoration: none; }
  .cv-sidebar a:hover { text-decoration: underline; }
  .cv-skill-group h4 { margin: 12px 0 4px 0; font-size: 13px; color: #2f81f7; }
  .cv-skill-group p { margin: 0; font-size: 12px; opacity: 0.85; }
  
  .cv-main {
    background-color: #ffffff;
    padding: 30px 25px;
  }
  .cv-main h3 { color: #1f2328; border-bottom: 2px solid #f6f8fa; padding-bottom: 6px; font-size: 15px; text-transform: uppercase; margin-top: 25px; }
  .cv-main h3:first-child { margin-top: 0; }
  .cv-profile { font-size: 13.5px; line-height: 1.5; color: #57606a; margin-bottom: 20px; }
  .cv-item { margin-bottom: 20px; }
  .cv-item-header { display: flex; justify-content: space-between; font-weight: 600; font-size: 14px; }
  .cv-item-title { color: #1f2328; }
  .cv-item-date { color: #2f81f7; }
  .cv-item-sub { font-style: italic; color: #57606a; font-size: 13px; margin: 2px 0 6px 0; }
  .cv-item-bullets { padding-left: 20px; margin: 5px 0; }
  .cv-item-bullets li { font-size: 13px; color: #24292e; margin-bottom: 4px; line-height: 1.4; }
</style>

<!-- Structure HTML du CV (les IDs vont être ciblés par le JavaScript) -->
<div class="cv-wrapper">
  <div class="cv-grid">
    <aside class="cv-sidebar">
      <h1 id="gh-name">Chargement...</h1>
      <h2 id="gh-title"></h2>
      <h3>Contact</h3>
      <ul id="gh-contact"></ul>
      <h3>Compétences</h3>
      <div id="gh-skills"></div>
    </aside>
    <main class="cv-main">
      <h3>Profil Professionnel</h3>
      <p class="cv-profile" id="gh-profile"></p>
      <h3>Parcours Professionnel</h3>
      <div id="gh-experience"></div>
      <h3>Formations</h3>
      <div id="gh-education"></div>
    </main>
  </div>
</div>

<!-- Logique JavaScript : Récupère le JSON local et injecte les données dans le README -->
<script type="text/javascript">
  document.addEventListener("DOMContentLoaded", () => {
    // Lecture du fichier JSON situé dans la racine du dépôt GitHub
    fetch('./cv-data.json')
      .then(response => {
        if (!response.ok) throw new Error("Impossible de charger le fichier JSON");
        return response.json();
      })
      .then(data => {
        // En-tête principal
        document.getElementById("gh-name").innerText = data.coordonnees.nom;
        document.getElementById("gh-title").innerText = data.statut;
        document.getElementById("gh-profile").innerText = data.profil;

        // Bloc Coordonnées
        const coords = data.coordonnees;
        document.getElementById("gh-contact").innerHTML = `
          <li>📍 ${coords.adresse}</li>
          <li>✉️ <a href="mailto:${coords.email}">${coords.email}</a></li>
          <li>🚗 ${coords.permis}</li>
          <li>🔗 <a href="https://${coords.linkedin}" target="_blank">LinkedIn</a></li>
          <li>💻 <a href="https://${coords.github}" target="_blank">GitHub</a></li>
        `;

        // Bloc Compétences
        document.getElementById("gh-skills").innerHTML = data.competences.map(cat => `
          <div class="cv-skill-group">
            <h4>${cat.categorie}</h4>
            <p>${cat.liste.join(', ')}</p>
          </div>
        `).join('');

        // Bloc Expériences
        document.getElementById("gh-experience").innerHTML = data.experiences.map(exp => `
          <div class="cv-item">
            <div class="cv-item-header">
              <span class="cv-item-title">${exp.poste}</span>
              <span class="cv-item-date">${exp.periode}</span>
            </div>
            <div class="cv-item-sub">${exp.entreprise}</div>
            <ul class="cv-item-bullets">
              ${exp.missions.map(m => `<li>\${m}</li>`).join('')}
            </ul>
          </div>
        `).join('');

        // Bloc Formations
        document.getElementById("gh-education").innerHTML = data.formations.map(edu => `
          <div class="cv-item">
            <div class="cv-item-header">
              <span class="cv-item-title">${edu.diplome}</span>
              <span class="cv-item-date">${edu.annee}</span>
            </div>
            <div class="cv-item-sub">${edu.institution}</div>
          </div>
        `).join('');
      })
      .catch(err => {
        console.error(err);
        document.getElementById("gh-name").innerText = "Azzouz Mezlini";
        document.getElementById("gh-title").innerText = "Data Engineer / Développeur SQL";
      });
  });
</script>

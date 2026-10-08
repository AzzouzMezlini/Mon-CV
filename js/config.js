// Structure par défaut pour éviter tout crash si un champ manque dans le JSON
export const DEFAULT_CV_DATA = {
    coordonnees: { nom: "Candidat", statut: "", adresse: "", email: "", permis: "", linkedin: "", github: "" },
    profil: "",
    competences: [],
    experiences: [],
    projets: [],
    formations: []
};

export function validateAndCleanCVData(data) {
    if (!data || typeof data !== 'object') {
        throw new Error("Format JSON invalide : l'élément racine doit être un objet.");
    }

    return {
        coordonnees: { ...DEFAULT_CV_DATA.coordonnees, ...(data.coordonnees || {}) },
        statut: data.statut || "",
        profil: data.profil || "",
        competences: Array.isArray(data.competences) ? data.competences : [],
        experiences: Array.isArray(data.experiences) ? data.experiences : [],
        projets: Array.isArray(data.projets) ? data.projets : [],
        formations: Array.isArray(data.formations) ? data.formations : []
    };
}

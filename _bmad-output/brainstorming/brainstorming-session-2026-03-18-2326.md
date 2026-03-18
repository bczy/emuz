---
stepsCompleted: [1, 2, 3]
inputDocuments: []
session_topic: 'Surmonter l inexpérience avec BMAD pour finir le projet EmuZ'
session_goals: 'Trouver des approches concrètes pour terminer EmuZ malgré la courbe d apprentissage BMAD'
selected_approach: 'AI-Recommended Techniques'
techniques_used: ['Five Whys']
ideas_generated: ['software romType', 'design system gap']
context_file: '_bmad/bmm/data/project-context-template.md'
---

# Brainstorming Session Results

**Facilitateur:** trambz
**Date:** 2026-03-18

## Session Overview

**Topic:** Surmonter l'inexpérience avec BMAD pour finir le projet EmuZ
**Goals:** Trouver des approches concrètes pour terminer EmuZ malgré la courbe d'apprentissage BMAD

### Context Guidance

Focus sur le développement logiciel et produit : problèmes utilisateurs, fonctionnalités, approches techniques, UX, différenciation, risques et métriques de succès. Les résultats alimenteront potentiellement les stories BMAD restantes et le plan de sprint.

### Session Setup

Approche choisie : **Recommandations IA** — techniques personnalisées selon les objectifs et le contexte EmuZ connu.

---

## Technique Execution Results

**Five Whys — Analyse des blocages :**

| #   | Question                                                   | Réponse                                                               |
| --- | ---------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | Pourquoi tu n'avances pas ?                                | J'avance, mais les ambitions me paraissent trop ambitieuses           |
| 2   | Pourquoi trop ambitieuses ?                                | Pas assez de ressources humaines                                      |
| 3   | Pourquoi pas assez de ressources ?                         | C'est un projet perso (solo dev)                                      |
| 4   | Pourquoi le scope est dimensionné pour une équipe ?        | Première fois que je me pose la question                              |
| 5   | Pourquoi jamais questionné l'adéquation scope/ressources ? | _(Révélation en cours de session → émergence d'une idée d'évolution)_ |

**Breakthrough :** La vraie contrainte n'est pas BMAD ni l'inexpérience — c'est un scope généré pour une équipe, jamais recalibré pour un solo dev enthousiaste.

---

## Idées Générées

**[Catégorie #1]** : ROM Type — Software
_Concept :_ Étendre `romType` au-delà de `'game' | 'homebrew'` pour inclure `'software'` — couvrant démos, outils, applications non-ludiques tournant sur émulateurs (ex : logiciels Amiga, applications TI-89, utilitaires GBA). L'utilisateur installe lui-même ses émulateurs.
_Nouveauté :_ Distingue trois intentions utilisateur radicalement différentes — ludique, créatif/communautaire, utilitaire. Plateformes les plus riches : Amiga, Atari ST, MS-DOS, Apple II, MSX, C64, ZX Spectrum.
_Statut :_ `homebrew` déjà en cours (ADR-014, commit f5fb0d7). `software` est la nouveauté de cette session.

**[Catégorie #2]** : Gap Design System
_Concept :_ Créer une story dédiée "Design Tokens & System" dans Epic 3 avant d'implémenter les composants — couleurs, typographie, spacing, icônes par romType. Story 3.1 existe mais ne couvre pas les tokens formellement. Design system à définir en code (TailwindCSS tokens dans `libs/ui/`). Figma gratuit envisageable mais MCP limité en écriture.
_Nouveauté :_ Bloquer les stories 3.2–3.11 derrière une fondation design explicite évite la dette visuelle accumulée composant par composant.
_Statut :_ **Gap confirmé** — aucune issue GitHub existante sur ce sujet.

---

## Prochaines Étapes Recommandées

| Action                                                | Agent               |
| ----------------------------------------------------- | ------------------- |
| Mettre à jour le PRD : ajouter `software` à `romType` | `/bmad-pm`          |
| Créer story "Design Tokens & System" dans Epic 3      | `/bmad-sm`          |
| Créer story Epic 7 pour `romType: software`           | `/bmad-sm`          |
| Spécifier le design system UI                         | `/bmad-ux-designer` |

---

## Note Facilitatrice

Session express (< 10 min). Le Five Whys a révélé que le vrai blocage n'était pas technique mais de calibrage scope/ressources. L'enthousiasme de trambz pour la catégorie `software` est un signal fort — c'est une idée qui élargit la vision du produit de manière naturelle et motivante.

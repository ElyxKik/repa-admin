# Feature: Problèmes Récurrents

## Description
Nouvelle fonctionnalité permettant de gérer une liste de problèmes récurrents pour les réparations. Cette liste peut être utilisée pour faciliter la saisie des demandes de réparation en proposant des problèmes fréquents.

## Accès
- **URL**: `/repairs/common-issues`
- **Bouton**: Accessible depuis la page "Gestion des Réparations" via le bouton "Problèmes récurrents"

## Fonctionnalités

### 1. Liste des problèmes récurrents
- Affichage dans un tableau avec tri par ordre
- Colonnes: Ordre, Titre, Catégories, Actions
- Chaque problème affiche ses catégories sous forme de badges colorés

### 2. Ajout de nouveaux problèmes
Formulaire permettant de créer un nouveau problème avec:
- **Titre**: Description du problème (ex: "Écran cassé")
- **Ordre**: Numéro d'ordre pour le tri (auto-incrémenté)
- **Catégories**: Sélection multiple parmi:
  - Téléphone (PHONE)
  - Ordinateur Portable (LAPTOP)
  - Tablette (TABLET)
  - Tous (ALL)

### 3. Suppression
- Bouton de suppression pour chaque problème
- Confirmation avant suppression

## Structure de données

### Collection Firestore: `common_issues`

```typescript
interface CommonIssue {
  id: string
  title: string          // Titre du problème
  category: string[]     // Tableau des catégories concernées
  order: number          // Ordre d'affichage
}
```

### Exemple de document:
```json
{
  "title": "Écran cassé",
  "category": ["PHONE", "LAPTOP", "TABLET", "ALL"],
  "order": 1
}
```

## Catégories disponibles
- `PHONE` - Téléphone
- `LAPTOP` - Ordinateur Portable
- `TABLET` - Tablette
- `ALL` - Tous les appareils

## Fichiers créés/modifiés

### Nouveaux fichiers:
- `/src/app/repairs/common-issues/page.tsx` - Page de gestion des problèmes récurrents

### Fichiers modifiés:
- `/src/app/repairs/page.tsx` - Ajout du bouton "Problèmes récurrents"

## Interface utilisateur

### Page principale
- **Layout**: Grille responsive (1 colonne mobile, 3 colonnes desktop)
- **Colonne gauche**: Formulaire d'ajout (sticky)
- **Colonne droite**: Tableau de liste (2 colonnes)

### Design
- Bouton retour vers `/repairs`
- Formulaire avec validation
- Checkboxes pour sélection multiple des catégories
- Badges colorés pour afficher les catégories
- États de chargement et messages d'erreur

## Validation
- Le titre est requis
- Au moins une catégorie doit être sélectionnée
- L'ordre doit être un nombre

## Messages utilisateur
- ✅ "Problème ajouté avec succès"
- ✅ "Problème supprimé"
- ❌ "Le titre est requis"
- ❌ "Au moins une catégorie est requise"
- ❌ "Erreur lors du chargement des problèmes"
- ❌ "Erreur lors de l'ajout"
- ❌ "Erreur lors de la suppression"

## Utilisation future
Cette liste de problèmes récurrents peut être utilisée pour:
1. Proposer des suggestions lors de la création d'une demande de réparation
2. Analyser les problèmes les plus fréquents
3. Créer des statistiques sur les types de pannes
4. Faciliter la saisie pour les clients

## Date de création
19 novembre 2025

# Gestion des périmés — Pharmacie

Application **100 % hors-ligne** (PWA) pour suivre les dates de péremption des produits en pharmacie :
scan des boîtes (Datamatrix), compte à rebours en mois, alerte mensuelle des produits qui périment.

Fonctionne sur **Android**, **iOS** et sur le **PDA Honeywell EDA51**. Aucune donnée n'est envoyée : tout reste sur l'appareil (IndexedDB).

---

## 1. Mettre en ligne sur GitHub Pages

### Option A — par le site GitHub (le plus simple)

1. Sur https://github.com, cliquez **New** pour créer un dépôt, par exemple `perimes-pharmacie`. Laissez-le **Public**.
2. Dans le dépôt : **Add file → Upload files**, puis glissez **tout le contenu de ce dossier** (le fichier `index.html`, `manifest.webmanifest`, `sw.js`, `.nojekyll` et le dossier `icons/`). **Ne glissez pas le dossier parent**, mais bien les fichiers qui sont dedans.
3. **Commit changes**.
4. Onglet **Settings → Pages**. Sous *Build and deployment* → *Source*, choisissez **Deploy from a branch**, branche **main**, dossier **/ (root)**, puis **Save**.
5. Après une minute, l'adresse s'affiche, du type :
   `https://VOTRE-COMPTE.github.io/perimes-pharmacie/`

> ⚠️ Le service worker (mode hors-ligne) n'est actif qu'en **HTTPS**. GitHub Pages est en HTTPS : c'est parfait. Il ne fonctionne pas en ouvrant le fichier directement depuis le disque (`file://`).

### Option B — en ligne de commande

```bash
git init
git add .
git commit -m "PWA gestion des périmés"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/perimes-pharmacie.git
git push -u origin main
```
Puis activez **Settings → Pages** comme ci-dessus.

---

## 2. Installer l'application

Ouvrez l'adresse GitHub Pages sur l'appareil, puis :

- **Android / PDA (Chrome)** : menu **⋮ → Installer l'application** (ou « Ajouter à l'écran d'accueil »). Un raccourci apparaît, l'app s'ouvre en plein écran.
- **iPhone / iPad (Safari)** : icône **Partager** (carré + flèche ↑) → **Sur l'écran d'accueil**.

Un bouton **« Installer sur cet appareil »** est aussi proposé dans l'onglet **Réglages** de l'app.

---

## 3. Le scan sur le PDA Honeywell EDA51

Le PDA a un lecteur intégré. Pour qu'il « tape » le code dans l'app, il doit être en mode **clavier (keyboard wedge)** :

- Ouvrez **Réglages → Test du scanner** dans l'app, placez le curseur dans le champ, appuyez sur la gâchette et scannez une boîte.
- Si le code s'inscrit : tout est bon.
- Sinon : activez le mode clavier dans l'application **Honeywell Scan Settings** du PDA (profil par défaut → *Data Processing / Keyboard wedge*). Si l'appareil est verrouillé par l'entreprise (MDM) et que ce réglage est bloqué, utilisez le scan **caméra** (Android) ou la **saisie manuelle**.

Sur les boîtes de médicaments françaises, le **Datamatrix** contient déjà le code CIP13, la **date de péremption** et le **lot** : le scan les remplit automatiquement.

---

## 4. La base produits intégrée — `data/produits.csv`

Le dépôt contient un fichier **`data/produits.csv`** qui sert de base de données CIP → nom. L'application le **charge automatiquement** au premier lancement (et à chaque changement de version), sur chaque appareil, sans import manuel.

Le fichier livré ne contient que **3 lignes d'exemple** : remplacez-le par votre propre liste.

**Format attendu** (séparateur `;`, une ligne d'en-tête) :

```
cip;nom;emplacement
3400930000000;Doliprane 1000 mg comprimé;Tiroir A1
3400930000017;Efferalgan 500 mg comprimé;Rayon 3
```

- Seules **deux colonnes sont obligatoires** : le **code CIP** et le **nom**. La colonne `emplacement` est facultative.
- Les noms de colonnes et l'ordre sont libres : l'app repère seule « cip / gencod / ean / code produit » et « nom / libellé / désignation… ». Un export brut de votre LGO fonctionne tel quel, même avec des colonnes en plus (stock, prix, TVA…) qui seront ignorées.
- Le CIP peut être en 13 chiffres (CIP13) ou 14 (GTIN) : la correspondance est faite automatiquement.

**Pour mettre votre liste :**

1. Exportez votre fichier produits depuis **Smart Rx** (extraction de l'état de stock / inventaire, ou Smart Rx Perf → export CSV). Si c'est un Excel, faites *Enregistrer sous → CSV (séparateur ;)*.
2. Renommez-le **`produits.csv`** et placez-le dans le dossier **`data/`** du dépôt (remplacez celui d'exemple).
3. Dans `index.html`, incrémentez `const SEED_VERSION='v1';` (→ `'v2'`, etc.) pour que les appareils déjà installés rechargent la nouvelle liste.
4. Dans `sw.js`, incrémentez aussi `const CACHE = 'perimes-v3';`.
5. Poussez sur GitHub. Au prochain lancement, chaque appareil récupère la base à jour.

> À défaut d'export Smart Rx, vous pouvez aussi utiliser la **Base de données publique des médicaments** (ANSM, open data) comme source. Demandez-moi si vous voulez que je vous prépare ce fichier.

On peut aussi importer une liste ponctuellement, sans passer par le dépôt, via **Réglages → Catalogue produits**.

---

## 5. Mettre à jour l'application plus tard

1. Modifiez `index.html` (ou un autre fichier) et ré-uploadez-le sur GitHub.
2. Dans `sw.js`, changez la ligne `const CACHE = 'perimes-v3';` en `'perimes-v4'`, etc. Cela force les appareils à récupérer la nouvelle version au prochain lancement.

---

## 6. Sauvegarde des données

Les données restent sur chaque appareil. Depuis **Réglages → Sauvegarde**, exportez un fichier `.json` régulièrement (surtout sur iOS, où le navigateur peut effacer les données en cas de manque de place). Le même fichier permet de tout réimporter, ou de transférer le suivi d'un appareil à un autre.

---

## Contenu du dépôt

```
index.html               L'application (un seul fichier)
manifest.webmanifest     Métadonnées d'installation (nom, icônes, couleurs)
sw.js                    Service worker (fonctionnement hors-ligne)
.nojekyll                Sert les fichiers tels quels sur GitHub Pages
data/produits.csv        Base produits CIP -> nom (à remplacer par votre export)
icons/                   Icônes de l'application
```

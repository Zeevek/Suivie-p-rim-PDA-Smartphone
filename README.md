# Gestion des périmés — Pharmacie

Application **100 % hors-ligne** (PWA) pour suivre les dates de péremption des produits en pharmacie :
scan des boîtes (Datamatrix), compte à rebours en mois, alerte mensuelle des produits qui périment.

Fonctionne sur **Android**, **iOS** et sur le **PDA Honeywell EDA51**. Aucune donnée n'est envoyée : tout reste sur l'appareil (IndexedDB).

---

## 1. Installer l'application

Ouvrez l'adresse GitHub Pages sur l'appareil, puis :

- **Android / PDA (Chrome)** : menu **⋮ → Installer l'application** (ou « Ajouter à l'écran d'accueil »). Un raccourci apparaît, l'app s'ouvre en plein écran.
- **iPhone / iPad (Safari)** : icône **Partager** (carré + flèche ↑) → **Sur l'écran d'accueil**.

Un bouton **« Installer sur cet appareil »** est aussi proposé dans l'onglet **Réglages** de l'app.

---

## 2. Le scan sur le PDA Honeywell EDA51

Le PDA a un lecteur intégré. Pour qu'il « tape » le code dans l'app, il doit être en mode **clavier (keyboard wedge)** :

- Ouvrez **Réglages → Test du scanner** dans l'app, placez le curseur dans le champ, appuyez sur la gâchette et scannez une boîte.
- Si le code s'inscrit : tout est bon.
- Sinon : activez le mode clavier dans l'application **Honeywell Scan Settings** du PDA (profil par défaut → *Data Processing / Keyboard wedge*). Si l'appareil est verrouillé par l'entreprise (MDM) et que ce réglage est bloqué, utilisez le scan **caméra** (Android) ou la **saisie manuelle**.

Sur les boîtes de médicaments françaises, le **Datamatrix** contient déjà le code CIP13, la **date de péremption** et le **lot** : le scan les remplit automatiquement.

### Scan par appareil photo (Android **et** iOS)

L'app propose un bouton **« Scanner avec la caméra »** qui lit le **Datamatrix** et les codes-barres classiques :

- **Android / Chrome** : utilise le moteur de décodage intégré au navigateur (rapide, rien à télécharger).
- **iPhone / iPad (Safari)** et autres cas : Safari n'a pas de moteur intégré, l'app charge alors la librairie open-source **ZXing**, **fournie directement dans le dépôt** (`vendor/zxing.min.js`). Aucun service externe n'est contacté et la caméra fonctionne hors-ligne.
- Il faut **autoriser l'accès à la caméra** à la première utilisation, et le site doit être en **HTTPS** (GitHub Pages l'est).

> ZXing (`@zxing/library` 0.19.1) est déjà inclus dans `vendor/zxing.min.js` : rien à télécharger. Si vous supprimez ce fichier, l'app bascule automatiquement sur un CDN (voir `vendor/LISEZMOI.txt`).

---

## 3. La base produits intégrée — `data/produits.json`

Le dépôt contient **`data/produits.json`**, la base **CIP → nom** générée depuis votre inventaire Smart Rx : **~118 500 produits** (catalogue complet). L'application la **charge en mémoire au démarrage** (chargement non bloquant), puis remplit le nom automatiquement à chaque scan.

- Le fichier n'est **pas recopié dans la mémoire du téléphone** : il *est* la base, mise en cache hors-ligne par le service worker. C'est ce qui permet de gérer 118 000 produits sans ralentir l'appareil.
- Les noms saisis ou corrigés à la main (via **Réglages → Catalogue produits**, ou l'édition d'une fiche) ont la **priorité** sur la base intégrée.

**Mettre à jour la liste plus tard :** ré-exportez l'inventaire depuis Smart Rx et régénérez `data/produits.json` (format : un objet JSON `{"cip13":"nom", …}`, en UTF-8). L'export brut Smart Rx est en jeu de caractères DOS (cp850) avec des CIP espacés : il doit être converti avant. Le plus simple est de me renvoyer le nouvel export, je régénère le fichier. Pensez ensuite à incrémenter `const CACHE` dans `sw.js` pour que les appareils déjà installés rechargent la base.

Pour des **ajouts ou corrections ponctuels**, l'onglet **Réglages → Catalogue produits** accepte aussi un CSV/JSON (colonnes CIP + nom repérées automatiquement) qui vient compléter la base intégrée.

---

## 4. Mettre à jour l'application plus tard

1. Modifiez `index.html` (ou un autre fichier) et ré-uploadez-le sur GitHub.
2. Dans `sw.js`, changez la ligne `const CACHE = 'perimes-v4';` en `'perimes-v5'`, etc. Cela force les appareils à récupérer la nouvelle version au prochain lancement.

---

## 5. Sauvegarde des données

Les données restent sur chaque appareil. Depuis **Réglages → Sauvegarde**, exportez un fichier `.json` régulièrement (surtout sur iOS, où le navigateur peut effacer les données en cas de manque de place). Le même fichier permet de tout réimporter, ou de transférer le suivi d'un appareil à un autre.

---

## Contenu du dépôt

```
index.html               L'application (un seul fichier)
manifest.webmanifest     Métadonnées d'installation (nom, icônes, couleurs)
sw.js                    Service worker (fonctionnement hors-ligne)
.nojekyll                Sert les fichiers tels quels sur GitHub Pages
data/produits.json       Base produits CIP -> nom (~118 500 réf., depuis Smart Rx)
vendor/zxing.min.js      Lecteur caméra ZXing (auto-hébergé, iOS + Android)
vendor/LISEZMOI.txt      Note sur le lecteur ZXing / mise à jour
icons/                   Icônes de l'application
```

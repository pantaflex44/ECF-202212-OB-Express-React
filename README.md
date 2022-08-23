# ECF-202212-OB-Express-React

## Présentation de l'examen

**Activité** – *Type 1* : Développer la partie front-end d’une application web ou
web mobile en intégrant les recommandations de sécurité
- Maquetter une application.
- Réaliser une interface utilisateur web statique et adaptable.
- Développer une interface utilisateur web dynamique.
- Réaliser une interface utilisateur avec une solution de gestion de contenu ou e-commerce.

**Activité** – *Type 2* : Développer la partie back-end d’une application web ou
web mobile en intégrant les recommandations de sécurité
- Créer une base de données.
- Développer les composants d’accès aux données.
- Développer la partie back-end d’une application web ou web mobile.
- Élaborer et mettre en œuvre des composants dans une application de gestion de contenu ou e-commerce.

Avec les informations du cahier des charges et vos propres connaissances, vous
allez réaliser la partie Front et Back du site web ainsi qu’un maquettage complet.

**Les objectifs**: Réaliser une interface web sécurisée et son administration
- Développer l’interface web présentée ci-dessous ainsi que son interface d’administration.
- Élaborer un dossier d’analyse des besoins qui documente, entre autres, les choix des technologies, UML (Use case, Sequence et Classe), les choix d’architecture logicielle et de configuration, les bonnes pratiques de sécurité implémentées, etc.
- Élaborer un document spécifique sur les mesures et bonnes pratiques de sécurité mises en place et la justification de chacune d’entre elles ainsi que leurs tests unitaires.

## Livrables

Le code de l’application sur un dépôt Github. Le dépôt doit également contenir un guide de déploiement et un manuel d’utilisation au format Readme.md pour l’administrateur. Le document « questions et réflexions » rempli et exporté au format pdf.
Une version en ligne de l’application pour la présentation déployée grâce à Heroku. Pour connaître la marche à suivre, n’hésitez pas à reprendre votre module « Déployer son application web avec Heroku ».
Un lien vers, par exemple, un trello (ou autre système de gestion des tâches).

**Contraintes techniques**:
- Les contraintes techniques sont liées au serveur et à sa configuration, aussi les technologies choisies pour développer le projet respectent l’architecture du serveur.
- Les contraintes de temps vont nécessiter une épuration du design de façon à offrir une vraie expérience utilisateur et un contenu simplifié et clair afin d’accélérer la phase de développement.

**Les annexes**:

Vous retrouverez dans les annexes les éléments suivants qui vous serviront
d’exemples. Vous pouvez vous en servir ou bien les adapter à vos propres
compétences de développeur :
- Analyses des besoins
- Quelques diagrammes UML
- Un début de charte graphique
- Un wireframe
- FAQ

---

## LE PROJET API SALLE DE SPORT

**Objectifs**:

L’objectif du projet est de mener une étude (Analyse des besoins) et développer l’application web présentée ci-dessous. Il convient également d’élaborer un dossier d’architecture web qui documente entre autres les choix des technologies, les choix d’architecture web et de configuration, les bonnes pratiques de sécurité́ implémentées, etc.
Il est également demandé d’élaborer un document spécifique sur les mesures et bonnes pratiques de sécurité́ mises en place et la justification de chacune d’entre elles. Les bases de données et tout autre composant nécessaire pour faire fonctionner le projet sont également accompagnés d’un manuel de configuration et d’utilisation.

1. **Exigences**

    Notre client est une grande marque de salle de sport et souhaite la création d’une interface simple à destination de ses équipes qui gèrent les droits d'accès à ses applications web de ses franchisés et partenaires qui possèdent des salles de sport. Ainsi, lorsqu'une salle de sport ouvre et prend la franchise de cette marque, on lui donne accès à un outil de gestion en ligne.
    En fonction de ce qu’il va reverser à la marque et de son contrat, il a droit à des options ou modules supplémentaires. Par exemple, un onglet “faire son mailing” ou encore "gérer le planning équipe" ou bien “promotion de la salle" ou encore “vendre des boissons” peut être
    activé ou désactivé.
    Le projet a donc pour but la création et la construction d’une interface cohérente et ergonomique afin d’aider leurs équipes à ouvrir des accès aux modules de leur API auprès des franchisés/partenaires.
    L’interface devra permettre de donner de la visibilité́ sur les partenaires/franchisés utilisant l’API et quels modules sont accessibles par ces partenaires. Elle doit faciliter l'ajout, la modification ou la suppression des permissions aux modules de chaque partenaire/franchisé.
    
2. **Cible**

    L’interface sera utilisée par l’équipe technique de développement de la marque.

3. **Périmètre du projet**

    L’interface devra avoir un design responsive et être rédigée en Français. Liste des fonctionnalités :
        - Afficher la liste des partenaires actifs,
        - Afficher la liste des partenaires désactivés,
        - Consulter les différentes structures des partenaires (activées et désactivées),
        - Modifier les permissions des structures,
        - Ajouter une nouvelle structure à un partenaire avec des permissions prédéfinies entre un technicien du client et le partenaire concerné,
        - Envoyer automatiquement un email après l’ajout d’une structure au partenaire concerné,
        - Possibilité de confirmation d’accès aux données de la structure par le partenaire,
        - Afficher le contenu du mail dans un nouvel onglet.

    Pour finir, elle devra être intégrée à l’outil interne et la base de données existante. Vous êtes donc libre d’adapter d'éventuelles données entrantes.

---

## Analyses et Choix techniques

Après analyse de l'énoncé, je fais le choix de partir sur **une dissociation de la partie backend et de la partie frontend**. Ce choix est principalement motivé par la capacité de la future application a être facilement rattachée au système existant. N'ayant que peu d'informations à ce sujet, la séparation de la partie backend permettra par ailleurs de créer un frontend parfaitement autonome et extensible.

Malgré une spécialité Symfony associée à ma formation, et un attachement particulier à PHP depuis sa version 3, je decide d'utiliser le **javascript**, plus particulierement via **NodeJs**. Le besoin de hautes performances pour le projet n'étant pas un prérequis notifié comme important, je fais le choix d'utiliser l'outil **ExpressJs**. Ce choix est aussi motivé par une relative facilité et par conscéquent une relative rapidité de développement propre à ExpressJs. Les notions de sécurité même avancées sont parfaitement bien gérées par ExpressJs. Un certains nombres de packages sont disponibles à ce sujet.

La gestion des données sera confiée à un moteur SQL, plus particulièrement celui de **SQLite**. Encore une fois, par soucis de simplicité, et répondant parfaitement aux besoins de l'énoncé, je fais le choix de passer outre l'installation, la configuration et l'exploitation d'un service tiers supplémentaire (Serveur, MySql / PostgresSql / MariaDB / etc.). Un fichier .sql sera disponible, un fichier .db contiendra les datas, et le package NPM sqlite3, sera utilisé. La gestion de cette base sera menée par les outils *sqlite3* (ligne de commandes) et *DB Browser for SQLite (DB4S)* (outil graphique).

La partie Frontend sera quand à elle confiée à une technologie que j'aime beaucoup, **ReactJs**. Pour ce faire, je vais m'appuyer sur un projet que j'ai conçu par le passé, [QuickParcelProject](https://github.com/pantaflex44/QuickParcelProject) dans sa version 3.1.1. Les paquets NPM seront mis à jour pour l'occasion. Ce projet me fourni l'éco-système nécessaire au développement d'applications ReactJs. Aucune notion de pre-rendering ne sera développée car l'application n'a pas pour vocation d'être SEO Friendly. Idem pour les balises Metas HTML qui ne seront peuplées que d'informations améliorant l'ergonomie de l'interface. L'interface sera **MobileFirst** et devra être parfaitement complète et fonctionnelle sur tous les types d'écrans.

Le développement se fera sous Ubuntu 22.04 LTS, NodeJs 18, NPM 8, SQLite 3, ExpressJs et ReactJs dernières versions en cours. L'éditeur sera VSCode pour Linux et quelques extensions améliorant le travail de codage.

> Voir la rubrique Annexes / Schmas

> Voir la rubrique Annexes / Wireframes et Charte graphique

### Un mot sur la sécurité

La sécurité sur le web est primordiale c'est pourquoi l'application emploie différents mécanismes pour se protéger et protéger l'utilisateur.

Son architecture découpée permet de sécuriser chaque partie de manière optimale.

La partie Backend, l'API Credible, usera des mécanismes habituels, tel la gestion du **partage des ressources entre origines multiples (CORS)**, la **limitation des requètes dans un temps donné (Rate Limiter)**, les **jetons web au format JSON (JWT)** pour la sécuriation des échanges, sans oublier le protocole **HTTPS**.

La partie Frontend, s'appuiera sur les jetons web au format JSON (JWT) largement requis par l'API, s'appuiera aussi sur le mode de fonctionnement de la librairie React, et utilisera aussi le protocole HTTPS.

La base de donnée SqLite ne sera pas cryptée, ou sécurisée par mot de passe. Mais son accès ne sera pas non plus rendu publique et partagé à l'extérieur de l'enceinte de fonctionnement de l'API. Ce qui limitera les risques liés à sa manipulation. L'incorporation de données extérieures sera soumise aux procédure de protections contre les attaques de type **injections HTML (XSS)**. Protection principalement fournie par la librairie sqlite3 et ses fonctions dédiées.

La gestion **SSL** (protocole HTTPS) est soumis à 2 types de certificats. Pour le développement local, un **certificat auto-signé** sera généré lors de la procédure d'installation (cf chapitre plus bas), mais pour la mise en production il ser très vivement recommandé d'utiliser le **certificat fourni par votre hébergeur** (un exemple d'utilisation dans ce même chapitre).

## Les tests

Malgré un délai confortable pour la réalisation de ce projet, étant en reconversion, donc ayant peu de temps pour travailler, j'ai du faire quelques choix compliqués.

Les tests en font partis. Ils seront, au moins partiellement, disponibles pour le dossier final. L'ECF n'en profitera donc pas.

---

## Initialisation du projet

### Répertoire local de travail

Avant toute chose, je créé l'**espace local** où sera hébergé le futur projet et créé le fichier **README.md**, base de toutes documentations:

```bash
$ mkdir ECF-202212-OB-Express-React
$ cd ECF-202212-OB-Express-React
$ echo '# ECF-202212-OB-Express-React' >> README.md
```

### Git et Github

Pour commencer, j'ouvre **un nouveau "Repository"** dans mon espace **Github** que je nomme **ECF-202212-OB-Express-React**.
Une fois celui-ci configuré, j'**initialise Git** en utilisant les commandes ci-dessous:

```bash
$ git init
$ git add .
$ git commit -m "first commit"
$ git branch -M main
$ git remote add origin https://github.com/pantaflex44/ECF-202212-OB-Express-React.git
$ git push -u origin main
```

### NPM

Une fois fait, Git et Github main dans la main, j'**initialise NPM** pour ce projet:

```bash
$ echo '"use strict";' >> index.js
$ npm init
```

Une fois les informations complétées, je passe à la création/modification des différents documents nécessaires, tels **README.md**, et **LICENSE**.
A ce sujet, la licence choisie pour ce projet est la **licence MIT**.

## Ajout des premières technologies

Je ne préciserai pas chaque entrée dans le fichier **.gitignore**, mais, par exemple, les répertoires *node_modules* en feront partie.

### Backend : API - ExpressJs à la rescousse

Ajout d'ExpressJs et différents paquets NPM au projet:

```bash
$ npm install https --save
$ npm install express --save
$ npm install express-rate-limit --save
$ npm install cookie-parser --save
$ npm install body-parser --save
$ npm install blueimp-md5 --save
$ npm install cors --save
$ npm install dotenv --save
$ npm install fs --save
$ npm install helmet --save
$ npm install html-react-parser --save
$ npm install jsdom --save
$ npm install jsonwebtoken --save
$ npm install nodemailer --save
$ npm install nodemailer-html-to-text --save
$ npm install nodemailer-plugin-inline-base64 --save
$ npm install path --save
$ npm install sqlite3 --save
...
```

L'API sera développée en utilisant l'outil **Postman**.

L'API ne sera accessible que par l'utilisation du **protocole HTTPS**. Pour ce faire, dans le dossier *certs*, je compose la ligne de commande suivante:

```bash
$ cd certs
$ sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./server.key -out server.crt
$ sudo chmod 644 server.crt
$ sudo chmod 644 server.key
$ cd ..
```

Une fois le certificat provisoire créé, j'écris les première ligne de code permettant de lancer un serveur ExpressJs faisant fonctionner l'ensemble de mon API:

```javascript
const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");

if (process.env.NODE_ENV === "development") console.warn("\x1b[33m%s\x1b[0m", "API start in developement mode!\n");

let envFile = `./.env.${process.env.NODE_ENV}`;
try {
    if (!fs.existsSync(envFile)) {
        console.log(`Dotenv ${envFile} not found. .env used.`);
        envFile = "./.env";
    }
} catch {
    console.error(`Unable to know if ${envFile} exists. .env used.`);
    envFile = "./.env";
}
require("dotenv").config({ path: envFile });
console.log(`Dotenv ${envFile} loaded.\n`);

const app = express();

app.use(
    rateLimit({
        windowMs: process.env.RATE_LIMIT_DELAY,
        max: process.env.RATE_LIMIT_COUNTER,
        standardHeaders: true,
        legacyHeaders: false
    })
);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Les routes utilisées par l'API seront définies ici.

const port = process.env.PORT || 3001;

if (process.env.NODE_ENV === "development") {
    console.warn("\x1b[33m%s\x1b[0m", "Local HTTPS protocol used only in development mode...");

    const privateKey = fs.readFileSync("./certs/server.key", "utf8");
    const certificate = fs.readFileSync("./certs/server.crt", "utf8");
    const credentials = { key: privateKey, cert: certificate };

    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(port, () => {
        console.log("\x1b[36m%s\x1b[0m", `API server started and listening on https://localhost:${port}`);
    });
} else {
    app.listen(port, () => console.log("\x1b[36m%s\x1b[0m", `API server started and listening on port ${port}`));
}
```

### Frontend : Un peu de réactivité

Installation de *QuickParcelProject*:

```bash
$ mkdir ui
$ cd ui
$ git clone https://github.com/pantaflex44/QuickParcelProject .
$ rm -rf .git
$ cd ..
```

Puis, mise à jour des packages inclus:

```bash
$ sudo npm install -g npm-check-updates
$ ncu -u
```

Pour finir, installation des packages du projet basé sur QPP:

```bash
$ npm install
$ npm install parcel --save-dev
```

### Package.json de l'API (package.json principal)

Une fois les techonologies principales installées et configurées, je modifie le fichier **package.json** pour ajouter des scripts utiles au fonctionnement de l'application.

Pour les besoins de la modification, j'installe le paquet NPM *cross-env*:

```bash
$ npm install cross-env --save
$ npm install concurrently --save-dev
```

La section **scripts** modifiée du fichier package.json:

```json
{
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "start": "cross-env NODE_ENV=production node index",
        "server:dev": "cross-env NODE_ENV=development nodemon",
        "server": "cross-env NODE_ENV=production nodemon",
        "client": "cross-env NODE_ENV=development npm run dev --prefix ui",
        "dev": "cross-env NODE_ENV=development concurrently \"npm run server:dev\" \"npm run client\"",
        "build": "cross-env NODE_ENV=production npm run build --prefix ui"
    },
}
```

> Le script permettant de lancer les tests sur l'application sera modifié ultérieurement.

### Mise en production et déploiement

*EN COURS*
- vps ionos
- p2m

---

## Installation et Utilisation de l'application

Pour télécharger l'application **Credible**:

```bash
$ mkdir credible
$ cd credible
$ git clone https://github.com/pantaflex44/ECF-202212-OB-Express-React .
$ rm -rf .git
```

Puis, effectuer l'installation des paquets NPM:

```bash
$ cd ui
$ npm install
$ cd ..
$ npm install
$ sudo npm install -g nodemon
```

Prochaine étape, création des certificats locaux pour utiliser le protocole HTTPS:

```bash
$ cd certs
$ sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./server.key -out server.crt
$ sudo chmod 644 server.crt
$ sudo chmod 644 server.key
$ cd ..
```

Pour finir, il faut créer la base de données. L'application utilise ```sqlite3```.

Sous linux:

```bash
$ sudo apt install sqlite3
```

puis (pour tout le monde):


```bash
$ cd data
$ sqlite3 app.db

sqlite> .read app.sql
Ok.
sqlite> exit

$ cd ..
```

### Configuration de l'application

Pour configurer l'application vous avez accès aux fichiers ```.env``` , ```.env.development``` , ```.env.production```

Le fichier ```.env``` fourni avec le projet servira de modèle et de configuration par défaut de l'application. 

Pour le développement, certains paramètres sont parfois adaptés aux outils utilisés, c'est pourquoi, vous avez la liberté de cloner le fichier .env avec le nom ```.env.development```

Il en est de même pour le déploiement sur un serveur de production. Un clone nommé ```.env.production``` pourra contenir les données utilisées par le projet une fois construit (build).

> Les fichiers ```.env.development``` et ```.env.production``` sont prioritaires sur le fichier par défaut ```.env```


### Les commandes NPM

**Démarrer le serveur (la partie backend de l'application):**

> Configurations utilisées: ```.env.production``` / ```.env```

```bash
$ npm run server
```

**Lancer le client (la partie frontend de l'application):**

> Configurations utilisées: ```.env.developement``` / ```.env```

```bash
$ npm run client
```

**Lancer le projet en mode développement:**

##### Projet global

> Configurations utilisées: ```.env.developement``` / ```.env```

```bash
$ npm run dev
```

##### Développement de l'API

> Configurations utilisées: ```.env.developement``` / ```.env```

```bash
$ npm run server:dev
```

**Compiler le projet:**

> Configurations utilisées: ```.env.production``` / ```.env```

```bash
$ npm run build
```
---

## Annexes

### Compte démo

Administrateur:
- *adresse email*: admin@credible.fr
- *mot de passe*: Qz1GeA9dZdiecsim

L'interface d'administration est accessible via ces identifiants. De cette interface, vous êtes libre de créer autant de comptes que vous le souhaitez.

> Attention toutefois, cette adresse email n'existe pas, vous n'aurez donc aucun retour par mail de certaines fonctions de l'application. Je vous invite à créer vos propres comptes avec une adresse email valide pour profiter de toute l'interraction proposée par Credible.

### Schémas

- **Connexion d'un utilisateur**

![Connexion](https://github.com/pantaflex44/ECF-202212-OB-Express-React/raw/main/ecf-files/diagrams/login.png)

- **Création d'un nouveau compte**

![Nouveau compte](https://github.com/pantaflex44/ECF-202212-OB-Express-React/raw/main/ecf-files/diagrams/create-account.png)

- **Diagramme de classes**

![Diagramme de classes](https://github.com/pantaflex44/ECF-202212-OB-Express-React/raw/main/ecf-files/diagrams/class-diagram.png)

![Tables](https://github.com/pantaflex44/ECF-202212-OB-Express-React/raw/main/ecf-files/diagrams/class-diagram-tables.png)

- **Diagrammes de séquences** 

![Administrateurs](https://github.com/pantaflex44/ECF-202212-OB-Express-React/raw/main/ecf-files/diagrams/sequence-diagram-administrateur.png)

![Partenaires et Structures](https://github.com/pantaflex44/ECF-202212-OB-Express-React/raw/main/ecf-files/diagrams/sequence-diagram-partenaire-ou-structure.png)

- **Cas d'utilisations** 

![Cas d'utilisations](https://github.com/pantaflex44/ECF-202212-OB-Express-React/raw/main/ecf-files/diagrams/use-case.png)

### Wireframes et Charte graphique

*EN COURS*
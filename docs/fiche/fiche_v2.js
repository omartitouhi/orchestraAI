const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Footer,
  AlignmentType, LevelFormat, WidthType, ShadingType, BorderStyle, PageNumber,
} = require('docx');

const NAVY = '1F3864';
const BLUE = '2E74B5';
const CELL = 'F2F5FA';
const LINE = 'B4BFD0';
const FULL = 9638;

// "**gras**" -> runs ; espaces insécables autour des guillemets français
function runs(text, opts = {}) {
  text = text.replace(/« /g, '« ').replace(/ »/g, ' »');
  return text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(part =>
    part.startsWith('**')
      ? new TextRun({ ...opts, text: part.slice(2, -2), bold: true })
      : new TextRun({ ...opts, text: part }));
}

const p = (text, after = 100) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED, spacing: { after }, children: runs(text),
});
const h1 = text => new Paragraph({ heading: 'Heading1', children: [new TextRun(text)] });
const h2 = text => new Paragraph({ heading: 'Heading2', children: [new TextRun(text)] });
const bullet = text => new Paragraph({
  numbering: { reference: 'bullets', level: 0 }, spacing: { after: 50 }, children: runs(text),
});
const step = text => new Paragraph({
  numbering: { reference: 'steps', level: 0 }, spacing: { after: 50 }, children: runs(text),
});

const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: border, bottom: border, left: border, right: border };
const margins = { top: 50, bottom: 50, left: 90, right: 90 };

function cell(text, width, { header = false, fill = header ? NAVY : CELL, bold = false, color } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders, margins,
    shading: { fill, type: ShadingType.CLEAR, color: 'auto' },
    children: [new Paragraph({
      children: runs(text, { size: 19, bold: header || bold || undefined, color: header ? 'FFFFFF' : color }),
    })],
  });
}

function table(widths, header, rows, styleCell = () => ({})) {
  const all = [];
  if (header) all.push(new TableRow({ tableHeader: true, cantSplit: true, children: header.map((t, i) => cell(t, widths[i], { header: true })) }));
  rows.forEach((r, ri) => all.push(new TableRow({
    cantSplit: true,
    children: r.map((t, i) => cell(t, widths[i], styleCell(ri, i, t))),
  })));
  return new Table({ width: { size: FULL, type: WidthType.DXA }, columnWidths: widths, rows: all });
}
const spacer = () => new Paragraph({ spacing: { after: 60 }, children: [] });

// ---------- Contenu ----------
const children = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 },
    children: [new TextRun({ text: "FICHE DE PROPOSITION DE SUJET — PROJET DE FIN D'ÉTUDES", bold: true, color: '595959', size: 20 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
    children: [new TextRun({ text: 'ORCHESTRA AI', bold: true, color: NAVY, size: 48 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 8 } },
    children: [new TextRun({ text: "Plateforme d'automatisation multi-modèles : workflows IA créés manuellement ou par prompt, exécutés sous contrôle", color: '404040', size: 24 })] }),

  table([1900, 2700, 2300, 2738], null, [
    ['**Étudiant**', 'Omar Titouhi', '**Formation**', 'Cycle ingénieur — Génie logiciel et SI'],
    ['**Année**', '2026–2027', "**Organisme d'accueil**", '[à compléter]'],
    ['**Encadrant académique**', '[à compléter]', '**Encadrant professionnel**', '[à compléter]'],
  ]),
  spacer(),

  h1('1. Contexte'),
  p("Les plateformes d'automatisation (n8n, Power Automate, Langflow, Dify…) permettent aujourd'hui de construire des workflows intégrant l'IA, soit en assemblant des blocs dans un éditeur visuel, soit en décrivant un besoin en langage naturel. Les utilisateurs veulent désormais combiner plusieurs modèles dans un même workflow (GPT, Claude, modèle local) et brancher leurs outils via le standard MCP (Model Context Protocol)."),
  p('Cette évolution pose trois problèmes :'),
  bullet("**Demandes incomplètes** : la période, la source de données, les destinataires ou le niveau d'autonomie manquent souvent. L'IA devine alors ces informations, ce qui produit des workflows incorrects."),
  bullet('**Actions risquées** : un workflow peut envoyer, modifier ou supprimer des données sans que l\'utilisateur ait vu ce qui allait réellement se passer.'),
  bullet("**Confidentialité et coût mal maîtrisés** : des données sensibles peuvent partir vers une API externe, et le coût d'une exécution est difficile à prévoir."),
  p("La supervision humaine des systèmes d'IA est par ailleurs une exigence mise en avant par le règlement européen sur l'IA (AI Act), ce qui renforce l'intérêt d'une exécution contrôlée."),

  h1('2. Problématique'),
  p("Comment permettre à un utilisateur de concevoir, manuellement ou en langage naturel, un workflow combinant plusieurs modèles IA et outils externes, puis de l'exécuter de façon **correcte, sûre et maîtrisée en coût**, en ne lui posant que les questions réellement utiles ?"),

  h1('3. Solution proposée'),
  p("ORCHESTRA AI est une plateforme web d'automatisation dans laquelle l'utilisateur :"),
  bullet("**crée un workflow de deux façons** : à la main dans un éditeur visuel, ou en décrivant son objectif, par exemple « Analyse les incidents de la semaine, prépare un rapport et préviens les responsables » ;"),
  bullet("**répond uniquement aux questions importantes** : celles qui changent le workflow ou concernent une action sensible ; le reste reçoit des valeurs par défaut visibles ;"),
  bullet('**combine plusieurs modèles IA** dans le même workflow : chaque nœud choisit son fournisseur et son modèle (OpenAI, Anthropic, modèle local via Ollama) ;'),
  bullet('**branche des serveurs MCP** dont les outils sont découverts automatiquement et deviennent des nœuds du workflow ;'),
  bullet('**réutilise des skills** : des compétences packagées (instructions, documents de référence, outils autorisés) ;'),
  bullet("**vérifie et simule** le workflow avant de l'exécuter : structure, paramètres, coût estimé et aperçu de ce qui serait fait ;"),
  bullet('**exécute sous contrôle** : les permissions, le budget et les approbations humaines sont appliqués par un moteur de règles indépendant de l\'IA ;'),
  bullet('**consulte la trace complète** de chaque exécution : questions posées, modifications, actions exécutées ou bloquées, coût par nœud.'),
  p("Principe directeur : **l'IA propose, un moteur de règles décide de ce qui peut être exécuté.**"),

  h1('4. Points forts du projet'),
  p("La génération de workflows par IA, les éditeurs visuels et l'appel de plusieurs modèles existent déjà ; ils constituent le socle de la plateforme, pas son innovation. Le projet se distingue par quatre points :"),
  h2('4.1 Clarification sélective tenant compte du risque'),
  p("La plateforme détecte les informations manquantes et choisit les questions selon leur impact sur le workflow et sur la sécurité des actions. Grâce à MCP, chaque outil déclare ses paramètres obligatoires, ce qui permet une détection déterministe des manques. C'est l'**apport scientifique** du projet, mesuré expérimentalement (section 7)."),
  h2('4.2 Simulation avant exécution (dry-run)'),
  p("Le workflow peut être exécuté « à blanc » : les outils de lecture s'exécutent réellement, les outils d'écriture (envoi, création, suppression) sont simulés. L'utilisateur voit exactement **ce qui serait fait** avant de valider, par exemple « enverrait 1 message à 3 personnes »."),
  h2('4.3 Routage des modèles selon la confidentialité et le coût'),
  bullet("Une donnée marquée **sensible** ne quitte jamais la machine : le moteur de règles impose un modèle local aux nœuds qui la traitent."),
  bullet("Le **coût est estimé avant l'exécution**, avec un plafond de budget par workflow et un suivi des tokens par nœud."),
  bullet("Ces contraintes sont appliquées par le moteur de règles, pas laissées au choix de l'IA."),
  h2('4.4 Passerelle MCP sécurisée'),
  bullet("**Classification des outils par niveau de risque** (lecture, écriture, destructif). Les annotations MCP comme destructiveHint servent d'indice, la décision finale appartient au moteur de règles."),
  bullet("**Épinglage des descriptions d'outils** : si un serveur modifie la description d'un outil après son approbation, l'outil est bloqué jusqu'à une nouvelle validation."),
  bullet("**Sorties des outils traitées comme non fiables** : elles sont transmises à l'IA comme données, jamais comme instructions (protection contre l'injection de prompt)."),

  h1('5. Fonctionnalités'),
  p('Les fonctionnalités sont classées en deux niveaux : **MVP** (indispensables à la démonstration et à l\'évaluation) et **Bonus** (réalisées si le temps le permet).'),
  table([2100, 6338, 1200], ['Module', 'Fonctionnalités', 'Priorité'], [
    ['Création par prompt', 'Analyse de la demande, détection des informations manquantes, questions sélectives, valeurs par défaut visibles, génération du graphe', 'MVP'],
    ['Éditeur visuel', 'Ajout, suppression et connexion de nœuds, édition des paramètres, sauvegarde', 'MVP'],
    ['', 'Modification du workflow par prompt avec diff visuel', 'Bonus'],
    ['Multi-modèles', 'Configuration d\'OpenAI, d\'Anthropic et d\'Ollama, choix du modèle par nœud, test de connexion, routage local des données sensibles', 'MVP'],
    ['Serveurs MCP', 'Ajout d\'un serveur (local ou HTTP), découverte automatique des outils, classification par risque, épinglage des descriptions', 'MVP'],
    ['Skills', 'Création d\'une skill (instructions, outils autorisés, niveau de risque) et utilisation comme nœud', 'Bonus'],
    ['Moteur de règles', 'Règles du type « action destructive → approbation obligatoire », « budget maximal par workflow », « donnée sensible → modèle local »', 'MVP'],
    ['Vérification et simulation', 'Validation de la structure et des paramètres, estimation du coût, dry-run', 'MVP'],
    ['Exécution', 'Exécution pas à pas, état des nœuds en temps réel, pause sur approbation, gestion des erreurs', 'MVP'],
    ['Déclencheurs', 'Manuel', 'MVP'],
    ['', 'Planifié (cron) et webhook', 'Bonus'],
    ['Traçabilité', 'Journal complet, suivi des tokens et du coût par nœud', 'MVP'],
    ['', 'Rejeu d\'une exécution, versionnement des workflows', 'Bonus'],
    ['Modèles de workflows', 'Enregistrement d\'un workflow comme modèle réutilisable', 'Bonus'],
    ['Évaluation', 'Benchmark des quatre stratégies et analyse statistique (hors interface)', 'MVP'],
  ], (ri, i, t) => i === 2 ? (t === 'MVP' ? { bold: true, color: NAVY } : { color: '595959' }) : (i === 0 ? { bold: true } : {})),
  new Paragraph({ spacing: { before: 140, after: 60 }, children: runs('**Types de nœuds disponibles dans l\'éditeur :**') }),
  bullet('**Déclencheur** : manuel, planifié ou webhook ;'),
  bullet('**LLM** : fournisseur, modèle, prompt et format de sortie JSON attendu ;'),
  bullet('**Outil MCP** : un outil découvert sur un serveur connecté ;'),
  bullet('**Skill** : une compétence réutilisable ;'),
  bullet('**Condition** et **Transformation** : branchement et mise en forme des données ;'),
  bullet("**Approbation humaine** : met l'exécution en pause ;"),
  bullet('**Sortie** : rapport, fichier ou message.'),
  p("Une skill est définie comme un paquet d'instructions, de documents de référence et d'outils MCP autorisés, avec un niveau de risque. **Elle n'exécute pas de code arbitraire**, conformément à l'exclusion des plugins tiers.", 100),

  h1('6. Scénario de démonstration'),
  p("Analyse d'incidents informatiques sur des données synthétiques, avec deux à trois serveurs MCP (incidents simulés, fichiers, et un service réel comme GitHub ou Slack si le temps le permet) :"),
  step("L'utilisateur écrit : « Analyse les incidents de la semaine, prépare un rapport et préviens les responsables »."),
  step('La plateforme pose seulement deux questions (canal de notification et destinataires, car l\'envoi est une action sensible) et affiche les valeurs par défaut, comme « période : 7 derniers jours ».'),
  step('Elle génère le graphe : déclencheur → récupération des incidents (MCP) → analyse (Claude) → rédaction du rapport (GPT) → approbation → envoi du message (MCP).'),
  step("L'utilisateur ajuste un nœud dans l'éditeur, par exemple en remplaçant GPT par le modèle local."),
  step('La vérification affiche le coût estimé ; la simulation indique « enverrait 1 message à 3 personnes ».'),
  step("L'exécution se met en pause sur l'approbation ; après validation, le message est envoyé et toutes les étapes apparaissent dans les traces."),

  h1('7. Apport scientifique et évaluation'),
  p("L'apport visé est la **clarification sélective tenant compte du risque**. Son intérêt sera mesuré en comparant quatre stratégies sur un jeu de demandes de test : génération directe, questions systématiques, questions choisies par l'IA seule, et approche hybride proposée."),
  bullet('**Jeu de test** : demandes annotées avec leur workflow attendu, de complexité et de niveau de risque variés.'),
  bullet("**Utilisateur simulé** : un modèle IA qui connaît l'intention complète cachée et répond aux questions de clarification, pour rendre l'expérience reproductible."),
  bullet('**Métriques** : taux de workflows corrects, nombre de questions posées, actions risquées exécutées à tort ou bloquées, coût et latence.'),
  bullet('**Analyse** : comparaison statistique des stratégies (Python : pandas, SciPy, statsmodels).'),
  p("Des travaux récents traitent la clarification pour des appels d'outils isolés (par ex. SAGE-Agent, ACL 2026) ; ce projet l'applique à la génération de workflows complets multi-modèles et à leur exécution contrôlée. Ce positionnement, ainsi que la comparaison avec les fonctionnalités actuelles de n8n, Langflow et Dify, sera confirmé par l'état de l'art."),

  h1('8. Périmètre'),
  table([4819, 4819], ['Inclus', 'Exclu'], [
    ['Création manuelle et par prompt, questions de clarification', 'Gestion multi-utilisateurs / SaaS complet'],
    ['Éditeur visuel du workflow', 'Agents entièrement autonomes'],
    ['Plusieurs modèles IA par workflow (API et local)', 'Déploiement à grande échelle'],
    ['Connexion de serveurs MCP et skills sans code', 'Système de plugins exécutant du code tiers'],
    ['Moteur de règles, simulation, approbation humaine', 'Nombreux connecteurs développés sur mesure'],
    ['Traçabilité et évaluation comparative', 'Marketplace de workflows ou de skills'],
  ]),
  spacer(),

  h1('9. Stack technique retenu'),
  p("L'architecture est découpée en deux services : un service Java qui décide et exécute, et un service Python qui propose et exécute les nœuds LLM. Le service IA n'a aucun accès direct aux outils : la frontière de sécurité entre l'IA et les actions correspond ainsi à une frontière entre services."),
  table([1900, 3000, 4738], ['Composant', 'Technologies', 'Rôle'], [
    ['Interface web', 'React, TypeScript, React Flow', 'Création par prompt, éditeur de graphes, simulation, approbations, traces'],
    ['Backend principal', 'Java 21, Spring Boot 3', 'API, validation, moteur de règles, exécution, déclencheurs, passerelle MCP (SDK Java officiel)'],
    ['Service IA', 'Python, FastAPI, Pydantic, LiteLLM', 'Analyse de la demande, clarification, génération du workflow, exécution des nœuds LLM (sorties JSON validées)'],
    ['Modèles IA', 'OpenAI, Anthropic (API) + Ollama (local)', 'Choisis par nœud, interchangeables via un adaptateur unique'],
    ['Données', 'PostgreSQL', 'Workflows, règles, skills, exécutions, traces'],
    ['Évaluation', 'Python (pandas, SciPy, statsmodels)', 'Benchmark et analyse statistique'],
    ['Déploiement', 'Docker Compose', "Lancement de l'ensemble en local"],
  ], (ri, i) => i === 0 ? { bold: true } : {}),
  spacer(),

  h1('10. Démarche et livrables'),
  p('**Étape 1** — État de l\'art (plateformes existantes, clarification, sécurité MCP) et cadrage technique.', 60),
  p('**Étape 2** — Noyau de la plateforme : éditeur visuel, moteur d\'exécution, nœuds LLM multi-fournisseurs, traces.', 60),
  p('**Étape 3** — Passerelle MCP, moteur de règles, simulation et approbation humaine.', 60),
  p('**Étape 4** — Création par prompt et clarification sélective.', 60),
  p('**Étape 5** — Évaluation comparative des stratégies et analyse des résultats.', 60),
  p('**Étape 6** — Fonctionnalités bonus selon le temps restant, rapport et soutenance.'),
  p('**Livrables** : plateforme fonctionnelle et démontrable, jeu de test, résultats expérimentaux, rapport de PFE.'),

  h1("11. Points à valider avec l'encadrant"),
  bullet("Validation du sujet et des points forts retenus, en particulier l'apport scientifique (clarification sélective tenant compte du risque)."),
  bullet('Périmètre au regard de la durée du stage, et répartition MVP / Bonus.'),
  bullet('Définition des skills sans exécution de code arbitraire.'),
  bullet('Intégration MCP et stack technique proposés (Spring Boot + Python).'),
  bullet('Accès aux modèles IA : modèle local et budget pour les API OpenAI et Anthropic.'),
];

const doc = new Document({
  creator: 'Omar Titouhi',
  title: 'ORCHESTRA AI — Fiche sujet PFE (v2)',
  styles: {
    default: { document: { run: { font: 'Calibri', size: 21 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, color: BLUE }, paragraph: { spacing: { before: 280, after: 100 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, color: BLUE, bold: true }, paragraph: { spacing: { before: 160, after: 60 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [
    { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '●', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } }, run: { size: 14 } } }] },
    { reference: 'steps', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 850, right: 1134, bottom: 850, left: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: 'ORCHESTRA AI — Proposition de sujet PFE (v2)    |    ', color: '808080', size: 16 }),
      new TextRun({ children: [PageNumber.CURRENT], color: '808080', size: 16 }),
    ] })] }) },
    children,
  }],
});

const out = path.resolve(process.argv[2]);
Packer.toBuffer(doc).then(buf => { fs.writeFileSync(out, buf); console.log('écrit :', out); });

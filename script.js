const mapTemplates = {
  'lfb-fournisseur': {
    name: 'LFB Fournisseur',
    columns: [
      { key: 'objective', label: 'Objectif', color: 'objective', placeholder: 'Nouvel objectif' },
      { key: 'tier', label: 'Tiers', color: 'tier', placeholder: 'Nouveau tiers' },
      { key: 'comportement', label: 'Comportement', color: 'comportement', placeholder: 'Nouveau comportement' },
      { key: 'moyen', label: 'Moyen', color: 'moyen', placeholder: 'Nouveau moyen' },
      { key: 'controle', label: 'Contrôle', color: 'controle', placeholder: 'Nouveau contrôle' },
      { key: 'limite', label: 'Limite', color: 'limite', placeholder: 'Nouvelle limite' },
      { key: 'proba', label: 'Crédibilité', color: 'proba', placeholder: 'Nouvelle crédibilité' },
    ],
    synthese: {
      tierKey: 'tier',
      comportementKey: 'comportement',
      moyenKey: 'moyen',
      tierConnector: 'de',
    },
  },
  'lfb-client': {
    name: 'LFB Client',
    columns: [
      { key: 'tier', label: 'Tiers', color: 'tier', placeholder: 'Nouveau tiers' },
      { key: 'objective', label: 'Objectif', color: 'objective', placeholder: 'Nouvel objectif' },
      { key: 'comportement', label: 'Comportement', color: 'comportement', placeholder: 'Nouveau comportement' },
      { key: 'moyen', label: 'Moyens', color: 'moyen', placeholder: 'Nouveau moyen' },
      { key: 'controle', label: 'Contrôle', color: 'controle', placeholder: 'Nouveau contrôle' },
      { key: 'contournement', label: 'Contournement', color: 'limite', placeholder: 'Nouveau contournement' },
      { key: 'proba', label: 'Crédibilité', color: 'proba', placeholder: 'Nouvelle crédibilité' },
    ],
    synthese: {
      tierKey: 'tier',
      comportementKey: 'comportement',
      moyenKey: 'moyen',
      tierConnector: 'par',
    },
  },
  'lfb-controleur': {
    name: 'LFB contrôleur',
    columns: [
      { key: 'controle', label: 'Contrôle', color: 'controle', placeholder: 'Nouveau contrôle' },
      { key: 'description', label: 'Description', color: 'objective', placeholder: 'Nouvelle description' },
      { key: 'difficultes', label: 'Difficultés', color: 'tier', placeholder: 'Nouvelles difficultés' },
      { key: 'efficacite', label: 'Efficacité', color: 'comportement', placeholder: 'Nouvelle efficacité' },
      { key: 'indicateurs', label: 'Indicateurs', color: 'moyen', placeholder: 'Nouveaux indicateurs' },
      { key: 'non-conformite', label: 'Non-conformité', color: 'limite', placeholder: 'Nouvelle non-conformité' },
      { key: 'rex', label: 'REX', color: 'proba', placeholder: 'Nouveau REX' },
      { key: 'faiblesses', label: 'Faiblesses', color: 'objective', placeholder: 'Nouvelles faiblesses' },
    ],
    synthese: null,
  },
};

const templateOrder = ['lfb-fournisseur', 'lfb-client', 'lfb-controleur'];
let activeTemplateKey = templateOrder[0];
let columns = mapTemplates[activeTemplateKey].columns;
const questionConfigByTemplate = Object.fromEntries(
  Object.entries(mapTemplates).map(([key, template]) => {
    const config = {};
    template.columns.forEach((column) => {
      config[column.key] = '';
    });
    return [key, config];
  })
);
questionConfigByTemplate['lfb-fournisseur'] = {
  objective: `**Quels sont vos objectifs métier qui peuvent être influencés par un tiers ?**
- Objectifs opérationnels (gagner un AO, obtenir une autorisation, négocier un prix…) 
  - A quelle fréquence ?
- Objectifs relationnels (maintenir une relation clé)
- Objectifs temps (accélérer, sécuriser, débloquer)
- Objectifs indirectement influencés par un tiers ? Du fait de validation, autorisation, influence, … (Administration / Politique / Influenceurs / Prestataires / …)
- Pensez-vous à d’autres activités où vous êtes en contact avec des tiers ? (directement ou indirectement)
- Quelles activités sont les plus risquées, ou demanderaient le plus de précautions ?`,
  tier: `**Qui sont les tiers qui ont un impact sur ces objectifs ?**
- Administration / Client / Prestataires / …
- Agent public ? Privé ?
- Influenceurs ?
- Faites-vous appel à des intermédiaires / Prestataires / Apporteurs d’affaires ?
- Objectif porté par un distributeur / JV / Consultant (délégation du risque) ?`,
  comportement: `**Quels comportements rêvés pourriez vous espérer de ces tiers ?**
- Décision plus rapide ?
- Interprétation favorable ?
- Souplesse sur une règle ?
- Priorisation de votre dossier ?`,
  moyen: `**Quels avantages indus pourraient être proposés pour obtenir ces comportements ?** (Pas “ce que vous feriez”, mais ce qui pourrait exister)
- Avantages financiers : commission, rétrocommission, surfacturation, prestation (fictive ou non)
  - Disposez-vous d’une marge de manoeuvre ? Possibilité de paiement en espèce ?
- Avantages en nature : cadeaux, invitations, hospitalité
  - Disposez-vous d’un tel budget ?
- Avantages indirects : dons, sponsoring, emploi, stage, recommandation
  - Fréquence ? Bénéficiaires ? critères ?
- Avantages différés : promesse future, relation entretenue`,
  controle: `**Quelles règles ou procédures sont censées empêcher ce scénario ?**
- Procédure formelle ou pratique informelle ? Critères objectifs ?
- Comment cela se passe concrètement ?
- Qui contrôle ? à quel moment ? systématique ?
- Est-ce réellement appliqué ? Est-ce réellement efficace ?
- Comment identifiez-vous les tiers avec lesquels vous collaborez ? Critères ?
- Comment déterminez-vous le montant de sa rémunération ?
- Comment documentez-vous la réalité de la prestation fournie ?`,
  limite: `**Comment un acteur malintentionné pourrait-il contourner ces contrôles ?**
- Via un tiers ?
- Détournement des procédures ? Fractionnement des prestations ?
- Prestations fictives ?
- Possibilité de réaliser des opérations non tracées ? (en cash)
- Possibilité de réaliser des paiements dans d’autres pays que celui d’implémentation ?`,
  proba: `**Ce scénario vous paraît il crédible dans votre environnement ?**
- Déjà vu dans le secteur ?
- Avez-vous déjà eu connaissance de sollicitations de quelconque nature ?
- Quel est le niveau de pression à l’atteinte de l’objectif ? Pourrait-il amener à des pratiques non-respectueuses des process ?
- Quel lien entre rémunération et atteinte de l’objectif (bonus, success fee, commission …) ?`,
};
questionConfigByTemplate['lfb-client'] = {
  tier: `**Avec quels tiers êtes-vous en contact ? (directement ou indirectement)**
- Est-ce que certains tiers ont une influence considérable pour le LFB ?
- Avez-vous recours à des intermédiaires (agents, consultants, apporteurs d’affaires) ?`,
  objective: `**Quels sont leurs attentes vis-à-vis de vous ?**`,
  comportement: `**Quels comportements rêvés ?**
Exemples: 
- Être sélectionné ou reconduit sans mise en concurrence
- Obtenir une souplesse contractuelle
- Être payé plus ou plus vite
- Voir certaines non-conformités ignorées
- Être recommandé en interne
- Tirer un avantage personnel de leur influence sur vous`,
  moyen: `**Quels types d’avantages indus (direct ou indirect) certains pourraient-ils être tentés d’offrir pour obtenir ces comportements ?**
- Cadeaux / invitations : Recevez-vous des cadeaux, invitations ou proposition d’avantage de la part de ce tiers ?
- Avantages indirects : Un interlocuteur vous a-t-il déjà demandé de prendre une personne en stage ou d’offrir un emploi ?
- Financiers : Avez-vous déjà entendu parler de rétro-commission ?`,
  controle: `**Quelles règles ou procédures sont censées empêcher ce scénario ?**
- Procédure formelle ou pratique informelle ? Critères objectifs ?
- Comment cela se passe concrètement ?
- Qui contrôle ? à quel moment ? systématique ?
- Est-ce réellement appliqué ? Est-ce réellement efficace ?
- Comment identifiez-vous les tiers avec lesquels vous collaborez ? Critères ? Décisions collectives ?
- Comment déterminez-vous le montant de sa rémunération ?
- Comment documentez-vous la réalité de la prestation fournie ?`,
  contournement: `**À votre avis, comment un acteur malintentionné pourrait-il contourner les contrôles existants ?**`,
  proba: `**In fine, quelle est selon vous la probabilité qu’un risque de corruption survienne dans votre périmètre d’activité ?**
- Déjà vu dans le secteur ?
- Avez-vous déjà eu connaissance de sollicitations de quelconque nature ?
- Avez-vous déjà été victime ou témoin d’une tentative de fraude ?`,
};
let activeQuestionCategoryKey = null;
let activeQuestionNodeId = null;

let nodes = [];

const templateStates = {};
let selectedId = null;
let collapsed = new Set();
let tagOptions = [
  'Corruption active',
  'corruption passive',
  "trafic d'influence actif",
  'favoritisme',
  "prise illégale d'intérêt",
];
const credibilityOptions = ['Haute', 'Moyenne', 'Faible'];
let tierCategoryOptions = [
  'Professionnel de santé',
  'Administratif',
  'Politique',
  'Prestataire',
  'Client',
];
let history = [];
let isRestoring = false;
let linkingFromId = null;
let linkPreviewPath = null;
let currentLinkTargetId = null;
let zoom = 1.0;
let hasCenteredInitialObjective = false;
let editingId = null;
const NODE_WIDTH = 300;
const MAX_NODE_TEXT_LENGTH = 145;
const TRUNCATED_NODE_TEXT_LENGTH = 140;
const columnSpacing = NODE_WIDTH + 60;
const rowSpacing = 170;
const mapWrapper = document.getElementById('map-wrapper');
const nodesContainer = document.getElementById('nodes');
const connectionsSvg = document.getElementById('connections');
const workspace = document.getElementById('workspace');
const zoomRange = document.getElementById('zoom-range');
const zoomValue = document.getElementById('zoom-value');
const zoomOutBtn = document.getElementById('zoom-out');
const zoomInBtn = document.getElementById('zoom-in');
const fitBtn = document.getElementById('fit-map');
const selectionLabel = document.getElementById('current-selection');
const addSiblingBtn = document.getElementById('add-sibling');
const addChildBtn = document.getElementById('add-child');
const deleteBranchBtn = document.getElementById('delete-branch');
const tagListEl = document.getElementById('tag-list');
const addTagBtn = document.getElementById('add-tag');
const newTagInput = document.getElementById('new-tag');
const tierCategoryListEl = document.getElementById('tier-category-list');
const addTierCategoryBtn = document.getElementById('add-tier-category');
const newTierCategoryInput = document.getElementById('new-tier-category');
const mentionListEl = document.getElementById('mention-list');
const syntheseListEl = document.getElementById('synthese-list');
const copyAllSyntheseBtn = document.getElementById('copy-all-synthese');
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');
const expandedNodes = new Set();
const legendContainer = document.querySelector('.legend');
const mapSelector = document.getElementById('map-selector');
const questionPanelEl = document.getElementById('question-panel');
const questionPanelTitleEl = document.getElementById('question-panel-title');
const questionPanelBodyEl = document.getElementById('question-panel-body');
const questionConfigListEl = document.getElementById('question-config-list');
const syntheseDescEl = document.getElementById('synthese-desc');

function snapshotState() {
  return {
    nodes: nodes.map((n) => ({ ...n })),
    selectedId,
    collapsed: Array.from(collapsed),
    tagOptions: [...tagOptions],
    tierCategoryOptions: [...tierCategoryOptions],
  };
}

function buildInitialNodes(templateKey) {
  const templateColumns = mapTemplates[templateKey].columns;
  const firstColumn = templateColumns[0];
  return [
    {
      id: 'n1',
      column: 0,
      text: `${firstColumn.label} principal`,
      parentId: null,
      extraParentIds: [],
      color: firstColumn.color,
      sortOrder: 0,
    },
  ];
}

function storeActiveTemplateState() {
  templateStates[activeTemplateKey] = {
    nodes: nodes.map((n) => ({ ...n })),
    selectedId,
    collapsed: Array.from(collapsed),
    history: history.map((entry) => ({
      ...entry,
      nodes: entry.nodes.map((n) => ({ ...n })),
      collapsed: Array.from(entry.collapsed),
    })),
    expandedNodes: Array.from(expandedNodes),
  };
}

function loadTemplateState(templateKey) {
  const saved = templateStates[templateKey];
  if (saved) {
    nodes = saved.nodes.map((n) => ({ ...n }));
    selectedId = saved.selectedId;
    collapsed = new Set(saved.collapsed);
    history = saved.history.map((entry) => ({
      ...entry,
      nodes: entry.nodes.map((n) => ({ ...n })),
      collapsed: Array.from(entry.collapsed),
    }));
    expandedNodes.clear();
    saved.expandedNodes.forEach((id) => expandedNodes.add(id));
    return;
  }
  nodes = buildInitialNodes(templateKey);
  selectedId = nodes[0]?.id ?? null;
  collapsed = new Set();
  history = [];
  expandedNodes.clear();
}

function setActiveTemplate(templateKey) {
  if (!mapTemplates[templateKey] || templateKey === activeTemplateKey) return;
  storeActiveTemplateState();
  activeTemplateKey = templateKey;
  columns = mapTemplates[activeTemplateKey].columns;
  hasCenteredInitialObjective = false;
  activeQuestionCategoryKey = null;
  activeQuestionNodeId = null;
  loadTemplateState(templateKey);
  renderLegend();
  renderQuestionConfigManager();
  renderQuestionPanel();
  updateSyntheseDescription();
  render();
  if (!history.length) {
    recordHistory();
  }
  ensureFirstObjectiveVisible();
}

function renderLegend() {
  if (!legendContainer) return;
  legendContainer.innerHTML = '';
  columns.forEach((column) => {
    const item = document.createElement('span');
    item.className = `legend-item ${column.color}`;
    item.textContent = column.label;
    legendContainer.appendChild(item);
  });
}

function recordHistory() {
  if (isRestoring) return;
  history.push(snapshotState());
  if (history.length > 200) {
    history.shift();
  }
}

function restoreState(state) {
  isRestoring = true;
  nodes = state.nodes.map((n) => ({ ...n }));
  selectedId = state.selectedId;
  collapsed = new Set(state.collapsed);
  tagOptions = [...state.tagOptions];
  tierCategoryOptions = [...(state.tierCategoryOptions ?? tierCategoryOptions)];
  renderTagManager();
  renderTierCategoryManager();
  render();
  isRestoring = false;
}

function undo() {
  if (history.length <= 1) return;
  history.pop();
  const previous = history[history.length - 1];
  restoreState(previous);
}

let positions = new Map();
let groupBounds = new Map();

function ensureArrowDefs() {
  let defs = connectionsSvg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    connectionsSvg.appendChild(defs);
  }

  let marker = defs.querySelector('#arrowhead');
  if (!marker) {
    marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('viewBox', '0 0 24 24');
    marker.setAttribute('refX', '20');
    marker.setAttribute('refY', '12');
    marker.setAttribute('markerWidth', '16');
    marker.setAttribute('markerHeight', '16');
    marker.setAttribute('markerUnits', 'userSpaceOnUse');
    marker.setAttribute('orient', 'auto');

    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M 0 0 L 24 12 L 0 24 z');
    arrowPath.setAttribute('fill', '#91a4c1');
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
  }
}

function switchTab(targetId) {
  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.tabTarget === targetId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === targetId);
  });
  if (targetId === 'tab-map' && selectedId) {
    requestAnimationFrame(() => centerOnNode(selectedId));
  }
}

function sortValue(node, fallback) {
  return node.sortOrder ?? fallback;
}

function hasChildren(nodeId) {
  return nodes.some((n) => n.parentId === nodeId);
}

function isAncestorCollapsed(node) {
  let parentId = node.parentId;
  while (parentId) {
    if (collapsed.has(parentId)) return true;
    parentId = nodes.find((n) => n.id === parentId)?.parentId ?? null;
  }
  return false;
}

function getVisibleNodes() {
  return nodes.filter((n) => !isAncestorCollapsed(n));
}

function isNodeVisible(id) {
  const node = nodes.find((n) => n.id === id);
  if (!node) return false;
  return !isAncestorCollapsed(node);
}

function extractMentions(text) {
  if (!text) return [];
  const mentions = [];
  const mentionRegex = /@([A-Za-zÀ-ÖØ-öø-ÿ0-9_-]+)/g;
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
}

function getMentionGroups() {
  const groups = new Map();
  nodes.forEach((node) => {
    const mentions = extractMentions(node.text);
    mentions.forEach((mention) => {
      if (!groups.has(mention)) {
        groups.set(mention, []);
      }
      groups.get(mention).push(node);
    });
  });
  return groups;
}

function computeInsertionOrder(column, parentId, afterId) {
  const siblings = nodes
    .filter((n) => n.column === column && n.parentId === parentId)
    .sort((a, b) => sortValue(a, 0) - sortValue(b, 0) || a.id.localeCompare(b.id));

  if (!siblings.length) return 0;

  if (!afterId) {
    return sortValue(siblings[siblings.length - 1], siblings.length - 1) + 1;
  }

  const index = siblings.findIndex((s) => s.id === afterId);
  if (index === -1) {
    return sortValue(siblings[siblings.length - 1], siblings.length - 1) + 1;
  }

  const currentOrder = sortValue(siblings[index], index);
  const nextOrder = siblings[index + 1] ? sortValue(siblings[index + 1], index + 1) : currentOrder + 1;
  if (nextOrder === currentOrder) {
    return currentOrder + 1;
  }
  return (currentOrder + nextOrder) / 2;
}

function getRootId(node) {
  let current = node;
  while (current?.parentId) {
    const parent = nodes.find((n) => n.id === current.parentId);
    if (!parent) break;
    current = parent;
  }
  return current?.id ?? node.id;
}

function computeLayout() {
  positions = new Map();
  groupBounds = new Map();
  const visibleNodes = getVisibleNodes();
  if (!visibleNodes.length) return;

  const byColumn = columns.map(() => []);
  const groupMap = new Map();
  const rootOrder = [];
  const rootsById = new Map();

  visibleNodes.forEach((node) => {
    byColumn[node.column]?.push(node);
    const rootId = getRootId(node);
    if (!groupMap.has(rootId)) {
      groupMap.set(rootId, columns.map(() => []));
    }
    groupMap.get(rootId)[node.column].push(node);
  });

  const visibleRoots = visibleNodes.filter((n) => !n.parentId || n.column === 0);
  visibleRoots
    .sort((a, b) => sortValue(a, 0) - sortValue(b, 0) || a.id.localeCompare(b.id))
    .forEach((root) => {
      const rootId = getRootId(root);
      if (!rootsById.has(rootId)) {
        rootsById.set(rootId, root);
        rootOrder.push(rootId);
      }
    });

  Array.from(groupMap.keys()).forEach((rootId) => {
    if (!rootsById.has(rootId)) {
      rootOrder.push(rootId);
    }
  });

  groupMap.forEach((columnsByGroup) => {
    columnsByGroup.forEach((colNodes) =>
      colNodes.sort((a, b) => sortValue(a, 0) - sortValue(b, 0) || a.id.localeCompare(b.id))
    );
  });

  let currentY = 140;
  const groupGap = 80;
  rootOrder.forEach((rootId) => {
    const columnsByGroup = groupMap.get(rootId);
    if (!columnsByGroup) return;
    const maxCount = Math.max(1, ...columnsByGroup.map((colNodes) => colNodes.length || 0));
    const contentHeight = maxCount * rowSpacing;
    const groupHeight = contentHeight + 120;
    const groupTop = currentY;
    const contentTop = groupTop + (groupHeight - contentHeight) / 2;
    groupBounds.set(rootId, { top: groupTop, bottom: groupTop + groupHeight });

    columnsByGroup.forEach((colNodes, columnIndex) => {
      const offset = ((maxCount - colNodes.length) * rowSpacing) / 2;
      colNodes.forEach((node, index) => {
        const x = 120 + columnIndex * columnSpacing;
        const y = contentTop + offset + index * rowSpacing;
        positions.set(node.id, { x, y });
      });
    });

    currentY += groupHeight + groupGap;
  });
}

function appendCategorySelect(container, node, options, key) {
  const tagRow = document.createElement('div');
  tagRow.className = 'tag-row';
  const select = document.createElement('select');
  select.className = 'tag-select';
  select.innerHTML = `<option value="">Catégorie</option>`;
  options.forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
  select.value = node[key] || '';
  select.addEventListener('change', () => {
    if (node[key] === select.value) return;
    node[key] = select.value;
    recordHistory();
    renderSynthese();
  });
  tagRow.append(select);
  container.appendChild(tagRow);
}

function handleBadgeClick(node, titleEl) {
  const columnKey = columns[node.column]?.key;
  if (!columnKey) return;
  const isSameBadge =
    activeQuestionCategoryKey === columnKey &&
    activeQuestionNodeId === node.id &&
    questionPanelEl &&
    !questionPanelEl.hidden;
  if (isSameBadge) {
    activeQuestionCategoryKey = null;
    activeQuestionNodeId = null;
    renderQuestionPanel();
    return;
  }
  activeQuestionCategoryKey = columnKey;
  activeQuestionNodeId = node.id;
  selectedId = node.id;
  updateSelection();
  renderQuestionPanel();
  centerOnNode(node.id);
  titleEl?.focus({ preventScroll: true });
}

function renderNodes() {
  nodesContainer.innerHTML = '';
  const visibleNodes = getVisibleNodes();
  visibleNodes.forEach((node) => {
    const position = positions.get(node.id);
    if (!position) return;
    const { x, y } = position;
    const el = document.createElement('div');
    el.className = `node ${node.color} ${selectedId === node.id ? 'selected' : ''}`;
    if (editingId === node.id) {
      el.classList.add('editing');
    }
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.dataset.id = node.id;

    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.innerHTML = `<span class="dot" aria-hidden="true"></span>${columns[node.column].label}`;
    badge.setAttribute('role', 'button');
    badge.tabIndex = 0;
    el.appendChild(badge);

    const title = document.createElement('div');
    title.className = 'node-text';
    title.contentEditable = 'true';
    title.dataset.placeholder = columns[node.column].placeholder;
    title.textContent = getNodeDisplayText(node);
    title.addEventListener('focus', () => {
      setEditingNode(node.id);
      selectedId = node.id;
      updateSelection();
      title.textContent = node.text;
    });
    title.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.altKey || e.shiftKey)) {
        e.preventDefault();
        document.execCommand('insertLineBreak');
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        title.blur();
      }
    });
    title.addEventListener('blur', () => {
      const sanitized = title.textContent || '';
      updateNodeText(node.id, sanitized);
      if (editingId === node.id) {
        setEditingNode(null);
      }
      if (!sanitized.trim()) {
        title.textContent = '';
        expandedNodes.delete(node.id);
        return;
      }
      title.textContent = getNodeDisplayText(node);
      const nodeEl = title.closest('.node');
      const expandBtn = nodeEl?.querySelector('.node-expand');
      if (shouldShowExpandToggle(node)) {
        if (!expandBtn && nodeEl) {
          const newExpandBtn = document.createElement('button');
          newExpandBtn.type = 'button';
          newExpandBtn.className = 'node-expand';
          updateExpandButton(newExpandBtn, node);
          newExpandBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleNodeExpanded(node.id);
            updateExpandButton(newExpandBtn, node);
            title.textContent = getNodeDisplayText(node);
          });
          newExpandBtn.addEventListener('mousedown', (event) => {
            event.stopPropagation();
          });
          nodeEl.appendChild(newExpandBtn);
        } else if (expandBtn) {
          updateExpandButton(expandBtn, node);
        }
      } else if (expandBtn) {
        expandBtn.remove();
      }
    });

    badge.addEventListener('click', (event) => {
      event.stopPropagation();
      handleBadgeClick(node, title);
    });
    badge.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleBadgeClick(node, title);
      }
    });

    el.appendChild(title);

    if (shouldShowExpandToggle(node)) {
      const expandBtn = document.createElement('button');
      expandBtn.type = 'button';
      expandBtn.className = 'node-expand';
      updateExpandButton(expandBtn, node);
      expandBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleNodeExpanded(node.id);
        updateExpandButton(expandBtn, node);
        title.textContent = getNodeDisplayText(node);
      });
      expandBtn.addEventListener('mousedown', (event) => {
        event.stopPropagation();
      });
      el.appendChild(expandBtn);
    }

    if (columns[node.column]?.key === 'tier') {
      appendCategorySelect(el, node, tierCategoryOptions, 'tierCategory');
    }

    if (columns[node.column]?.key === 'moyen') {
      appendCategorySelect(el, node, tagOptions, 'tag');
    }

    if (columns[node.column]?.key === 'proba') {
      appendCategorySelect(el, node, credibilityOptions, 'credibilityTag');
    }

    if (hasChildren(node.id)) {
      const toggle = document.createElement('button');
      toggle.className = `collapse-toggle ${collapsed.has(node.id) ? 'collapsed' : ''}`;
      toggle.type = 'button';
      toggle.title = collapsed.has(node.id) ? 'Déplier la branche' : 'Replier la branche';
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleBranch(node.id);
      });
      el.appendChild(toggle);
    }

    el.addEventListener('click', (event) => {
      if (event.target.closest('select')) return;
      selectedId = node.id;
      updateSelection();
      centerOnNode(node.id);
      title.focus({ preventScroll: true });
    });

    el.addEventListener('mousedown', (event) => {
      if (event.button !== 0) return;
      if (event.target.isContentEditable || event.target.closest('select') || event.target.classList.contains('collapse-toggle')) return;
      startLinking(node.id, event);
    });

    nodesContainer.appendChild(el);
  });

  renderObjectiveAddButton();
}

function preventNodeOverlap() {
  const visibleNodes = getVisibleNodes();
  const nodesByGroupAndColumn = new Map();
  const rootOrder = [];

  visibleNodes.forEach((node) => {
    const el = nodesContainer.querySelector(`.node[data-id="${node.id}"]`);
    if (!el) return;
    const rootId = getRootId(node);
    if (!nodesByGroupAndColumn.has(rootId)) {
      nodesByGroupAndColumn.set(rootId, columns.map(() => []));
      rootOrder.push(rootId);
    }
    nodesByGroupAndColumn.get(rootId)[node.column].push({ node, el });
  });

  const gap = 32;
  rootOrder.forEach((rootId) => {
    const columnsByGroup = nodesByGroupAndColumn.get(rootId);
    const bounds = groupBounds.get(rootId);
    columnsByGroup?.forEach((items) => {
      items.sort((a, b) => {
        const posA = positions.get(a.node.id)?.y ?? 0;
        const posB = positions.get(b.node.id)?.y ?? 0;
        return posA - posB;
      });

      let lastBottom = bounds?.top ?? -Infinity;
      items.forEach(({ node, el }) => {
        const pos = positions.get(node.id);
        if (!pos) return;
        const height = el.offsetHeight || el.getBoundingClientRect().height || 0;
        let adjustedY = Math.max(pos.y, lastBottom + gap);
        if (bounds?.bottom) {
          adjustedY = Math.min(adjustedY, bounds.bottom - height);
        }
        if (adjustedY !== pos.y) {
          positions.set(node.id, { ...pos, y: adjustedY });
        }
        el.style.top = `${positions.get(node.id)?.y ?? adjustedY}px`;
        lastBottom = (positions.get(node.id)?.y ?? adjustedY) + height;
      });
    });
  });

  const addButton = nodesContainer.querySelector('.objective-add');
  if (addButton) {
    const objectiveNodes = getVisibleNodes().filter((n) => n.column === 0);
    const referenceId = objectiveNodes[0]?.id ?? nodes.find((n) => n.column === 0)?.id ?? null;
    const referencePos = referenceId ? positions.get(referenceId) : null;
    const baseX = referencePos?.x ?? 120;
    const maxObjectiveY = objectiveNodes.reduce((max, node) => {
      const pos = positions.get(node.id);
      return pos ? Math.max(max, pos.y) : max;
    }, referencePos?.y ?? 120);

    addButton.style.top = `${maxObjectiveY + rowSpacing}px`;
    addButton.style.left = `${baseX + 74}px`;
  }
}

function renderObjectiveAddButton() {
  const objectiveNodes = getVisibleNodes().filter((n) => n.column === 0);
  const referenceId = objectiveNodes[0]?.id ?? nodes.find((n) => n.column === 0)?.id ?? null;
  const referencePos = referenceId ? positions.get(referenceId) : null;
  const baseX = referencePos?.x ?? 120;
  const maxObjectiveY = objectiveNodes.reduce((max, node) => {
    const pos = positions.get(node.id);
    return pos ? Math.max(max, pos.y) : max;
  }, referencePos?.y ?? 120);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'objective-add';
  button.style.top = `${maxObjectiveY + rowSpacing}px`;
  button.style.left = `${baseX + 74}px`;
  button.title = 'Ajouter un objectif';
  button.setAttribute('aria-label', 'Ajouter un nouvel objectif');
  button.innerHTML = '+';
  button.addEventListener('click', () => {
    createNode({ column: 0, parentId: null });
  });

  nodesContainer.appendChild(button);
}

function updateSelection() {
  document.querySelectorAll('.node').forEach((n) => n.classList.remove('selected'));
  const selectedEl = document.querySelector(`.node[data-id="${selectedId}"]`);
  if (selectedEl) {
    selectedEl.classList.add('selected');
    requestAnimationFrame(() => centerOnNode(selectedId));
  }
  updateHelperPanel();
}

function setEditingNode(nodeId) {
  if (editingId === nodeId) return;
  if (editingId) {
    const previousEl = nodesContainer.querySelector(`.node[data-id="${editingId}"]`);
    previousEl?.classList.remove('editing');
  }
  editingId = nodeId;
  if (editingId) {
    const currentEl = nodesContainer.querySelector(`.node[data-id="${editingId}"]`);
    currentEl?.classList.add('editing');
  }
}

function elbowPath(from, to) {
  const startX = from.x + NODE_WIDTH - 60;
  const startY = from.y + 32;
  const endX = to.x - 16;
  const endY = to.y + 32;
  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.hypot(dx, dy);
  const handle = Math.min(220, distance / 2);
  const angle = Math.atan2(dy, dx);
  const control1 = {
    x: startX + Math.cos(angle) * handle,
    y: startY,
  };
  const control2 = {
    x: endX - Math.cos(angle) * handle,
    y: endY - Math.sin(angle) * handle,
  };
  return `M ${startX} ${startY} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${endX} ${endY}`;
}

function renderConnections() {
  connectionsSvg.replaceChildren();
  ensureArrowDefs();
  if (!positions.size) return;
  const maxX = Math.max(...Array.from(positions.values()).map((p) => p.x)) + 500;
  const maxY = Math.max(...Array.from(positions.values()).map((p) => p.y)) + 400;
  connectionsSvg.setAttribute('width', maxX);
  connectionsSvg.setAttribute('height', maxY);
  getVisibleNodes().forEach((node) => {
    const parentIds = [node.parentId, ...(node.extraParentIds ?? [])].filter(Boolean);
    parentIds.forEach((parentId) => {
      if (!isNodeVisible(parentId)) return;
      const from = positions.get(parentId);
      const to = positions.get(node.id);
      if (!from || !to) return;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', elbowPath(from, to));
      path.setAttribute('class', 'path');
      path.setAttribute('marker-end', 'url(#arrowhead)');
      connectionsSvg.appendChild(path);
    });
  });
  if (linkPreviewPath) {
    connectionsSvg.appendChild(linkPreviewPath);
  }
}

function render() {
  computeLayout();
  renderNodes();
  preventNodeOverlap();
  renderConnections();
  renderMentionBackoffice();
  renderSynthese();
  applyZoom();
  if (selectedId && !isNodeVisible(selectedId)) {
    const parentId = nodes.find((n) => n.id === selectedId)?.parentId;
    selectedId = parentId ?? nodes[0]?.id ?? null;
  }
  updateSelection();
}

function commitEditingNodeText() {
  if (!editingId) return;
  const editingEl = nodesContainer.querySelector(`.node[data-id="${editingId}"] .node-text`);
  if (!editingEl) return;
  const currentText = editingEl.textContent || '';
  updateNodeText(editingId, currentText);
  const node = nodes.find((n) => n.id === editingId);
  if (node) {
    editingEl.textContent = getNodeDisplayText(node);
  }
  setEditingNode(null);
}

function updateHelperPanel() {
  const current = nodes.find((n) => n.id === selectedId);
  const hasSelection = Boolean(current);
  const canCreateChild = hasSelection && current.column + 1 < columns.length;
  const displayText = hasSelection ? current.text || columns[current.column].placeholder : 'Aucune';
  selectionLabel.textContent = `Sélection : ${displayText}`;
  addSiblingBtn.disabled = !hasSelection;
  addChildBtn.disabled = !canCreateChild;
  deleteBranchBtn.disabled = !hasSelection;
}

function createNode({ column, parentId, afterId }) {
  commitEditingNodeText();
  const newId = `n${Date.now()}`;
  const columnMeta = columns[column];
  const text = '';
  const sortOrder = computeInsertionOrder(column, parentId ?? null, afterId);
  const node = { id: newId, column, parentId: parentId ?? null, extraParentIds: [], text, color: columnMeta.color, sortOrder };
  nodes.push(node);
  selectedId = newId;
  render();
  recordHistory();
  centerOnNode(newId);
  requestAnimationFrame(() => {
    const titleEl = nodesContainer.querySelector(`[data-id="${newId}"] .node-text`);
    titleEl?.focus({ preventScroll: true });
  });
}

function handleKeydown(e) {
  const active = document.activeElement;
  const isEditing = active?.isContentEditable;
  const isFormField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(active?.tagName);
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    undo();
    return;
  }
  if ((isEditing && e.key !== 'Tab' && e.key !== 'Delete') || isFormField) {
    return;
  }
  if (!selectedId) return;
  const current = nodes.find((n) => n.id === selectedId);
  if (!current) return;

  if (e.key === 'Enter') {
    e.preventDefault();
    createNode({ column: current.column, parentId: current.parentId, afterId: current.id });
  } else if (e.key === 'Tab') {
    e.preventDefault();
    const nextColumn = current.column + 1;
    if (nextColumn < columns.length) {
      createNode({ column: nextColumn, parentId: current.id });
    }
  } else if (e.key === 'Delete') {
    e.preventDefault();
    deleteNodeTree(current.id);
  }
}

document.addEventListener('keydown', handleKeydown);

function addSiblingNode() {
  const current = nodes.find((n) => n.id === selectedId);
  if (!current) return;
  createNode({ column: current.column, parentId: current.parentId, afterId: current.id });
}

function addChildNode() {
  const current = nodes.find((n) => n.id === selectedId);
  if (!current) return;
  const nextColumn = current.column + 1;
  if (nextColumn >= columns.length) return;
  createNode({ column: nextColumn, parentId: current.id });
}

function deleteSelectedBranch() {
  const current = nodes.find((n) => n.id === selectedId);
  if (!current) return;
  deleteNodeTree(current.id);
}

addSiblingBtn.addEventListener('click', addSiblingNode);
addChildBtn.addEventListener('click', addChildNode);
deleteBranchBtn.addEventListener('click', deleteSelectedBranch);
addTagBtn?.addEventListener('click', addTagFromInput);
newTagInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addTagFromInput();
  }
});
addTierCategoryBtn?.addEventListener('click', addTierCategoryFromInput);
newTierCategoryInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addTierCategoryFromInput();
  }
});

copyAllSyntheseBtn?.addEventListener('click', () => {
  const entries = buildSyntheseEntries();
  if (!entries.length) return;
  const fullText = entries.map((entry) => entry.phrase).join('\n');
  copyToClipboard(fullText, copyAllSyntheseBtn);
});

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tabTarget));
});
switchTab('tab-map');

if (mapSelector) {
  mapSelector.value = activeTemplateKey;
  mapSelector.addEventListener('change', (event) => {
    setActiveTemplate(event.target.value);
  });
}

function applyZoom() {
  mapWrapper.style.transform = `scale(${zoom})`;
  zoomRange.value = Math.round(zoom * 100);
  zoomValue.textContent = `${Math.round(zoom * 100)}%`;
}

function setZoom(value) {
  zoom = Math.min(1.5, Math.max(0.4, value));
  applyZoom();
  if (selectedId) {
    requestAnimationFrame(() => centerOnNode(selectedId));
  }
}

zoomRange.addEventListener('input', (e) => {
  setZoom(Number(e.target.value) / 100);
});

zoomOutBtn.addEventListener('click', () => setZoom(zoom - 0.1));
zoomInBtn.addEventListener('click', () => setZoom(zoom + 0.1));

function centerOnNode(id) {
  const element = nodesContainer.querySelector(`[data-id="${id}"]`);
  if (!element) return;
  element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
}

function updateNodeText(id, text) {
  const node = nodes.find((n) => n.id === id);
  if (!node) return;
  const trimmed = text.trim();
  if (trimmed === node.text) return;
  node.text = trimmed;
  if (node.text.length <= MAX_NODE_TEXT_LENGTH) {
    expandedNodes.delete(node.id);
  }
  updateHelperPanel();
  renderMentionBackoffice();
  renderSynthese();
  recordHistory();
}

function deleteNodeTree(id) {
  const idsToRemove = new Set();
  const targetNode = nodes.find((n) => n.id === id);
  function collect(targetId) {
    idsToRemove.add(targetId);
    nodes.filter((n) => n.parentId === targetId).forEach((child) => collect(child.id));
  }
  collect(id);
  nodes = nodes.filter((n) => !idsToRemove.has(n.id));
  idsToRemove.forEach((removedId) => collapsed.delete(removedId));
  nodes.forEach((node) => {
    if (!node.extraParentIds?.length) return;
    node.extraParentIds = node.extraParentIds.filter((parentId) => !idsToRemove.has(parentId));
  });
  if (!nodes.length) {
    selectedId = null;
  } else {
    const parentId = targetNode?.parentId || null;
    selectedId = nodes.find((n) => n.id === parentId)?.id || nodes[0].id;
  }
  render();
  recordHistory();
  if (selectedId) {
    centerOnNode(selectedId);
  }
}

function toggleBranch(id) {
  if (!hasChildren(id)) return;
  if (collapsed.has(id)) {
    collapsed.delete(id);
  } else {
    collapsed.add(id);
    if (selectedId && !isNodeVisible(selectedId)) {
      selectedId = id;
    }
  }
  render();
  recordHistory();
}

function mapCoordinates(clientX, clientY) {
  const rect = mapWrapper.getBoundingClientRect();
  const x = (clientX - rect.left) / zoom;
  const y = (clientY - rect.top) / zoom;
  return { x, y };
}

function resetLinkingState() {
  linkingFromId = null;
  currentLinkTargetId = null;
  if (linkPreviewPath?.parentNode) {
    linkPreviewPath.parentNode.removeChild(linkPreviewPath);
  }
  linkPreviewPath = null;
  document.querySelectorAll('.node').forEach((node) => node.classList.remove('link-target'));
  document.removeEventListener('mousemove', handleLinkingMove);
  document.removeEventListener('mouseup', handleLinkingEnd);
}

function startLinking(sourceId, event) {
  linkingFromId = sourceId;
  linkPreviewPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  linkPreviewPath.setAttribute('class', 'path preview');
  handleLinkingMove(event);
  document.addEventListener('mousemove', handleLinkingMove);
  document.addEventListener('mouseup', handleLinkingEnd);
}

function handleLinkingMove(event) {
  if (!linkingFromId || !linkPreviewPath) return;
  const fromPos = positions.get(linkingFromId);
  const pointerPos = mapCoordinates(event.clientX, event.clientY);
  const hovered = document.elementFromPoint(event.clientX, event.clientY)?.closest('.node');
  const hoveredId = hovered?.dataset.id;

  if (currentLinkTargetId && currentLinkTargetId !== hoveredId) {
    document.querySelector(`.node[data-id="${currentLinkTargetId}"]`)?.classList.remove('link-target');
    currentLinkTargetId = null;
  }

  const sourceNode = nodes.find((n) => n.id === linkingFromId);
  const hoveredNode = nodes.find((n) => n.id === hoveredId);

  if (hoveredId && hoveredId !== linkingFromId && hoveredNode && sourceNode && hoveredNode.column > sourceNode.column) {
    currentLinkTargetId = hoveredId;
    hovered.classList.add('link-target');
  }

  const toPos = currentLinkTargetId ? positions.get(currentLinkTargetId) : pointerPos;
  if (!fromPos || !toPos) return;
  if (currentLinkTargetId) {
    linkPreviewPath.setAttribute('d', elbowPath(fromPos, toPos));
    linkPreviewPath.setAttribute('marker-end', 'url(#arrowhead)');
  } else {
    const startX = fromPos.x + NODE_WIDTH - 60;
    const startY = fromPos.y + 32;
    linkPreviewPath.setAttribute('d', `M ${startX} ${startY} L ${pointerPos.x} ${pointerPos.y}`);
    linkPreviewPath.removeAttribute('marker-end');
  }
  renderConnections();
}

function shiftBranchColumn(nodeId, delta) {
  const queue = [nodeId];
  while (queue.length) {
    const currentId = queue.shift();
    const node = nodes.find((n) => n.id === currentId);
    if (!node) continue;
    node.column = Math.min(columns.length - 1, Math.max(0, node.column + delta));
    nodes
      .filter((n) => n.parentId === currentId)
      .forEach((child) => {
        queue.push(child.id);
      });
  }
}

function reparentNode(targetId, newParentId) {
  const target = nodes.find((n) => n.id === targetId);
  const parent = nodes.find((n) => n.id === newParentId);
  if (!target || !parent) return;
  let ancestor = parent.parentId;
  while (ancestor) {
    if (ancestor === targetId) return;
    ancestor = nodes.find((n) => n.id === ancestor)?.parentId ?? null;
  }
  const newColumn = Math.min(columns.length - 1, parent.column + 1);
  const delta = newColumn - target.column;
  target.parentId = newParentId;
  target.sortOrder = computeInsertionOrder(newColumn, newParentId, null);
  if (delta !== 0) {
    shiftBranchColumn(targetId, delta);
  } else {
    target.column = newColumn;
  }
  selectedId = targetId;
  render();
  recordHistory();
}

function canLinkNodes(parentId, childId) {
  let ancestor = parentId;
  while (ancestor) {
    if (ancestor === childId) return false;
    ancestor = nodes.find((n) => n.id === ancestor)?.parentId ?? null;
  }
  return true;
}

function linkNodeToParent(childId, parentId) {
  const child = nodes.find((n) => n.id === childId);
  const parent = nodes.find((n) => n.id === parentId);
  if (!child || !parent) return;
  if (!canLinkNodes(parentId, childId)) return;
  if (!child.parentId) {
    reparentNode(childId, parentId);
    return;
  }
  if (child.parentId === parentId || child.extraParentIds?.includes(parentId)) return;
  child.extraParentIds = [...(child.extraParentIds ?? []), parentId];
  render();
  recordHistory();
}

function handleLinkingEnd() {
  if (linkingFromId && currentLinkTargetId) {
    const fromNode = nodes.find((n) => n.id === linkingFromId);
    const toNode = nodes.find((n) => n.id === currentLinkTargetId);
    if (fromNode && toNode && toNode.column > fromNode.column) {
      linkNodeToParent(currentLinkTargetId, linkingFromId);
    }
  }
  resetLinkingState();
}

function renderTagManager() {
  if (!tagListEl) return;
  tagListEl.innerHTML = '';
  tagOptions.forEach((tag) => {
    const item = document.createElement('div');
    item.className = 'tag-item';
    const label = document.createElement('span');
    label.textContent = tag;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Retirer';
    removeBtn.addEventListener('click', () => {
      tagOptions = tagOptions.filter((t) => t !== tag);
      nodes.forEach((n) => {
        if (columns[n.column]?.key === 'moyen' && n.tag === tag) {
          n.tag = '';
        }
      });
      renderTagManager();
      render();
      recordHistory();
    });
    item.append(label, removeBtn);
    tagListEl.appendChild(item);
  });
}

function renderTierCategoryManager() {
  if (!tierCategoryListEl) return;
  tierCategoryListEl.innerHTML = '';
  tierCategoryOptions.forEach((category) => {
    const item = document.createElement('div');
    item.className = 'tag-item';
    const label = document.createElement('span');
    label.textContent = category;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Retirer';
    removeBtn.addEventListener('click', () => {
      tierCategoryOptions = tierCategoryOptions.filter((t) => t !== category);
      nodes.forEach((n) => {
        if (columns[n.column]?.key === 'tier' && n.tierCategory === category) {
          n.tierCategory = '';
        }
      });
      renderTierCategoryManager();
      render();
      recordHistory();
    });
    item.append(label, removeBtn);
    tierCategoryListEl.appendChild(item);
  });
}

function renderQuestionConfigManager() {
  if (!questionConfigListEl) return;
  questionConfigListEl.innerHTML = '';
  const config = questionConfigByTemplate[activeTemplateKey] ?? {};
  columns.forEach((column) => {
    const item = document.createElement('div');
    item.className = 'question-config-item';
    const label = document.createElement('label');
    label.textContent = `Questions pour ${column.label}`;
    const textarea = document.createElement('textarea');
    textarea.rows = 4;
    textarea.placeholder = 'Une question par ligne, listes en Markdown (-, *, +) acceptées';
    textarea.value = config[column.key] || '';
    textarea.addEventListener('input', () => {
      config[column.key] = textarea.value;
      if (activeQuestionCategoryKey === column.key) {
        renderQuestionPanel();
      }
    });
    item.append(label, textarea);
    questionConfigListEl.appendChild(item);
  });
}

function getQuestionsForCategory(categoryKey) {
  const config = questionConfigByTemplate[activeTemplateKey] ?? {};
  return config[categoryKey] || '';
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatQuestionMarkup(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function buildQuestionList(raw) {
  const root = document.createElement('ul');
  const listStack = [root];
  const lines = raw.split('\n');

  lines.forEach((line) => {
    if (!line.trim()) return;
    const match = line.match(/^(\s*)([-*+])\s+(.+)$/);
    let level = 0;
    let content = line.trim();

    if (match) {
      const indent = match[1].replace(/\t/g, '  ').length;
      level = Math.floor(indent / 2);
      content = match[3].trim();
    }

    if (level > 0 && !listStack[listStack.length - 1].lastElementChild) {
      level = 0;
    }

    while (level + 1 < listStack.length) {
      listStack.pop();
    }

    while (level + 1 > listStack.length) {
      const parentList = listStack[listStack.length - 1];
      const lastItem = parentList.lastElementChild;
      if (!lastItem) break;
      const nested = document.createElement('ul');
      lastItem.appendChild(nested);
      listStack.push(nested);
    }

    const targetList = listStack[listStack.length - 1];
    const item = document.createElement('li');
    item.innerHTML = formatQuestionMarkup(content);
    targetList.appendChild(item);
  });

  return root;
}

function renderQuestionPanel() {
  if (!questionPanelEl || !questionPanelTitleEl || !questionPanelBodyEl) return;
  if (!activeQuestionCategoryKey) {
    questionPanelEl.hidden = true;
    return;
  }
  const column = columns.find((col) => col.key === activeQuestionCategoryKey);
  questionPanelTitleEl.textContent = column ? `Questions à poser • ${column.label}` : 'Questions à poser';
  questionPanelBodyEl.innerHTML = '';
  const rawQuestions = getQuestionsForCategory(activeQuestionCategoryKey);
  if (!rawQuestions.trim()) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'Aucune question configurée pour cette catégorie.';
    questionPanelBodyEl.appendChild(empty);
  } else {
    questionPanelBodyEl.appendChild(buildQuestionList(rawQuestions));
  }
  questionPanelEl.hidden = false;
}

function updateSyntheseDescription() {
  if (!syntheseDescEl) return;
  const syntheseConfig = mapTemplates[activeTemplateKey]?.synthese;
  if (!syntheseConfig) {
    syntheseDescEl.textContent = 'Synthèse indisponible pour cette carte.';
    return;
  }
  const connector = syntheseConfig.tierConnector ?? 'de';
  syntheseDescEl.textContent = `Générez automatiquement les phrases « Catégorie du moyen ${connector} Catégorie du tiers afin de Comportement » pour chaque chaîne.`;
}

function renderMentionBackoffice() {
  if (!mentionListEl) return;
  mentionListEl.innerHTML = '';
  const groups = getMentionGroups();

  if (!groups.size) {
    const empty = document.createElement('div');
    empty.className = 'mention-admin-desc';
    empty.textContent = 'Aucune mention @ détectée pour le moment.';
    mentionListEl.appendChild(empty);
    return;
  }

  const sortedGroups = Array.from(groups.entries()).sort((a, b) =>
    a[0].localeCompare(b[0], 'fr', { sensitivity: 'base' })
  );

  sortedGroups.forEach(([mention, nodesWithMention]) => {
    const groupEl = document.createElement('div');
    groupEl.className = 'mention-group';

    const header = document.createElement('div');
    header.className = 'mention-group-header';
    header.innerHTML = `<span>@${mention}</span><span class="count">${nodesWithMention.length} bulle${
      nodesWithMention.length > 1 ? 's' : ''
    }</span>`;

    const list = document.createElement('div');
    list.className = 'mention-node-list';

    const orderedNodes = [...nodesWithMention].sort((a, b) => {
      const textDiff = (a.text || '').localeCompare(b.text || '', 'fr', { sensitivity: 'base' });
      if (textDiff !== 0) return textDiff;
      const columnDiff = a.column - b.column;
      if (columnDiff !== 0) return columnDiff;
      return a.id.localeCompare(b.id, 'fr', { sensitivity: 'base' });
    });

    orderedNodes.forEach((node) => {
      const item = document.createElement('div');
      item.className = 'mention-node';
      const text = document.createElement('div');
      text.textContent = node.text || '[Sans titre]';
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = `${columns[node.column]?.label ?? 'Inconnu'} • ${node.id}`;
      item.append(text, meta);
      list.appendChild(item);
    });

    groupEl.append(header, list);
    mentionListEl.appendChild(groupEl);
  });
}

function buildSyntheseEntries() {
  function findAncestorWithColumn(startNode, targetColumn) {
    let currentId = startNode?.parentId;
    while (currentId) {
      const ancestor = nodes.find((n) => n.id === currentId);
      if (!ancestor) break;
      if (ancestor.column === targetColumn) return ancestor;
      currentId = ancestor.parentId;
    }
    return null;
  }

  const syntheseConfig = mapTemplates[activeTemplateKey]?.synthese;
  if (!syntheseConfig) {
    return [];
  }
  const tierColumn = columns.findIndex((col) => col.key === syntheseConfig.tierKey);
  const comportementColumn = columns.findIndex((col) => col.key === syntheseConfig.comportementKey);
  const moyenColumn = columns.findIndex((col) => col.key === syntheseConfig.moyenKey);
  const tierConnector = syntheseConfig.tierConnector ?? 'de';
  if (tierColumn === -1 || comportementColumn === -1 || moyenColumn === -1) {
    return [];
  }

  return nodes
    .filter((n) => n.column === moyenColumn)
    .map((moyen) => {
      const comportement = findAncestorWithColumn(moyen, comportementColumn);
      const tier = comportement ? findAncestorWithColumn(comportement, tierColumn) : null;
      if (!comportement || !tier) return null;

      const moyenCategory = (moyen.tag || moyen.text || '').trim() || 'Moyen non catégorisé';
      const tierCategory = (tier.tierCategory || tier.text || '').trim() || 'Tiers non catégorisé';
      const comportementText = (comportement.text || '').trim() || 'Comportement non renseigné';

      return {
        id: moyen.id,
        phrase: `${moyenCategory} ${tierConnector} ${tierCategory} afin de ${comportementText}`,
        meta: {
          moyenCategory,
          tierCategory,
          comportementText,
        },
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.meta.moyenCategory.localeCompare(b.meta.moyenCategory, 'fr', { sensitivity: 'base' }));
}

function showCopyFeedback(button, label = 'Copié !') {
  if (!button) return;
  const original = button.textContent;
  button.textContent = label;
  button.disabled = true;
  setTimeout(() => {
    button.textContent = original;
    button.disabled = false;
  }, 1200);
}

function copyToClipboard(text, button) {
  if (!text) return;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => showCopyFeedback(button)).catch(() => {});
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  showCopyFeedback(button);
}

function renderSynthese() {
  if (!syntheseListEl) return;
  const syntheseConfig = mapTemplates[activeTemplateKey]?.synthese;
  if (!syntheseConfig) {
    syntheseListEl.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'mention-admin-desc';
    empty.textContent = 'Synthèse indisponible pour cette carte.';
    syntheseListEl.appendChild(empty);
    if (copyAllSyntheseBtn) {
      copyAllSyntheseBtn.disabled = true;
    }
    return;
  }
  const entries = buildSyntheseEntries();
  syntheseListEl.innerHTML = '';

  if (copyAllSyntheseBtn) {
    copyAllSyntheseBtn.disabled = entries.length === 0;
  }

  if (!entries.length) {
    const empty = document.createElement('div');
    empty.className = 'mention-admin-desc';
    empty.textContent = 'Aucune chaîne complète Tier → Comportement → Moyen n\'est disponible pour le moment.';
    syntheseListEl.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    const card = document.createElement('div');
    card.className = 'synthese-card';

    const text = document.createElement('p');
    text.className = 'synthese-text';
    text.textContent = entry.phrase;

    const meta = document.createElement('div');
    meta.className = 'synthese-meta';
    meta.textContent = `Moyen : ${entry.meta.moyenCategory} • Tiers : ${entry.meta.tierCategory}`;

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.alignItems = 'center';
    actions.style.gap = '8px';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'ghost';
    copyBtn.textContent = 'Copier';
    copyBtn.addEventListener('click', () => copyToClipboard(entry.phrase, copyBtn));

    actions.appendChild(copyBtn);
    card.append(text, meta, actions);
    syntheseListEl.appendChild(card);
  });
}

function addTagFromInput() {
  const value = newTagInput?.value.trim();
  if (!value) return;
  if (!tagOptions.includes(value)) {
    tagOptions.push(value);
    renderTagManager();
    render();
    recordHistory();
  }
  newTagInput.value = '';
}

function addTierCategoryFromInput() {
  const value = newTierCategoryInput?.value.trim();
  if (!value) return;
  if (!tierCategoryOptions.includes(value)) {
    tierCategoryOptions.push(value);
    renderTierCategoryManager();
    render();
    recordHistory();
  }
  newTierCategoryInput.value = '';
}

function fitToScreen() {
  const xs = Array.from(positions.values()).map((p) => p.x);
  const ys = Array.from(positions.values()).map((p) => p.y);
  if (!xs.length || !ys.length) return;
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs) + 220;
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys) + 120;
  const availableW = workspace.clientWidth - 120;
  const availableH = workspace.clientHeight - 160;
  const scaleX = availableW / (maxX - minX);
  const scaleY = availableH / (maxY - minY);
  setZoom(Math.min(1.2, Math.max(0.4, Math.min(scaleX, scaleY))));
  if (selectedId) {
    requestAnimationFrame(() => centerOnNode(selectedId));
  }
}

fitBtn.addEventListener('click', fitToScreen);

loadTemplateState(activeTemplateKey);
renderLegend();
renderTagManager();
renderTierCategoryManager();
renderQuestionConfigManager();
renderQuestionPanel();
updateSyntheseDescription();
render();
recordHistory();
ensureFirstObjectiveVisible();

function getNodeDisplayText(node) {
  const text = node.text || '';
  if (text.length <= MAX_NODE_TEXT_LENGTH) {
    return text;
  }
  if (expandedNodes.has(node.id)) {
    return text;
  }
  return `${text.slice(0, TRUNCATED_NODE_TEXT_LENGTH)}(...)`;
}

function shouldShowExpandToggle(node) {
  return (node.text || '').length > MAX_NODE_TEXT_LENGTH;
}

function toggleNodeExpanded(nodeId) {
  if (expandedNodes.has(nodeId)) {
    expandedNodes.delete(nodeId);
  } else {
    expandedNodes.add(nodeId);
  }
}

function updateExpandButton(button, node) {
  const isExpanded = expandedNodes.has(node.id);
  button.textContent = isExpanded ? '–' : '+';
  button.setAttribute('aria-label', isExpanded ? 'Réduire le texte' : 'Afficher tout le texte');
  button.title = isExpanded ? 'Réduire le texte' : 'Afficher tout le texte';
}

function ensureFirstObjectiveVisible() {
  if (hasCenteredInitialObjective) return;
  const firstObjective = nodes.find((node) => node.column === 0);
  if (!firstObjective) return;
  hasCenteredInitialObjective = true;
  selectedId = firstObjective.id;
  updateSelection();
  requestAnimationFrame(() => centerOnNode(firstObjective.id));
}

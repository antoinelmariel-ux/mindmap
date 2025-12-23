const columns = [
  { key: 'objective', label: 'Objectif', color: 'objective', placeholder: 'Nouvel objectif' },
  { key: 'tier', label: 'Tiers', color: 'tier', placeholder: 'Nouveau tiers' },
  { key: 'comportement', label: 'Comportement', color: 'comportement', placeholder: 'Nouveau comportement' },
  { key: 'moyen', label: 'Moyen', color: 'moyen', placeholder: 'Nouveau moyen' },
  { key: 'controle', label: 'Contrôle', color: 'controle', placeholder: 'Nouveau contrôle' },
  { key: 'limite', label: 'Limite', color: 'limite', placeholder: 'Nouvelle limite' },
  { key: 'proba', label: 'Proba', color: 'proba', placeholder: 'Nouvelle probabilité' },
];

let nodes = [{ id: 'n1', column: 0, text: 'Objectif principal', parentId: null, color: 'objective', sortOrder: 0 }];

let selectedId = nodes[0].id;
let collapsed = new Set();
let tagOptions = [
  'Corruption active',
  'corruption passive',
  "trafic d'influence actif",
  'favoritisme',
  "prise illégale d'intérêt",
];
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
const NODE_WIDTH = 300;
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

function snapshotState() {
  return {
    nodes: nodes.map((n) => ({ ...n })),
    selectedId,
    collapsed: Array.from(collapsed),
    tagOptions: [...tagOptions],
    tierCategoryOptions: [...tierCategoryOptions],
  };
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

function computeLayout() {
  positions = new Map();
  const visibleNodes = getVisibleNodes();
  const byColumn = columns.map(() => []);
  visibleNodes.forEach((n) => byColumn[n.column]?.push(n));

  const heights = columns.map((_, idx) => {
    const count = byColumn[idx].length || 1;
    return Math.max(mapWrapper.clientHeight, count * rowSpacing + 400);
  });

  byColumn.forEach((colNodes) => colNodes.sort((a, b) => sortValue(a, 0) - sortValue(b, 0) || a.id.localeCompare(b.id)));

  // Position first column
  const firstCol = byColumn[0];
  const baseHeight = heights[0];
  const offsetY = baseHeight / 2 - ((firstCol.length - 1) * rowSpacing) / 2;
  firstCol.forEach((node, i) => {
    const x = 120;
    const y = offsetY + i * rowSpacing;
    positions.set(node.id, { x, y });
  });

  // Subsequent columns
  for (let c = 1; c < columns.length; c++) {
    const colNodes = byColumn[c];
    colNodes.sort((a, b) => {
      const ay = positions.get(a.parentId)?.y ?? 0;
      const by = positions.get(b.parentId)?.y ?? 0;
      if (ay === by && a.parentId === b.parentId) {
        return sortValue(a, 0) - sortValue(b, 0) || a.id.localeCompare(b.id);
      }
      return ay - by;
    });
    let currentY = 140;
    colNodes.forEach((node) => {
      const parentPos = positions.get(node.parentId);
      const desiredY = parentPos ? parentPos.y : currentY;
      const y = Math.max(currentY, desiredY - rowSpacing / 2);
      const x = 120 + c * columnSpacing;
      positions.set(node.id, { x, y });
      currentY = y + rowSpacing;
    });
  }
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

function renderNodes() {
  nodesContainer.innerHTML = '';
  const visibleNodes = getVisibleNodes();
  visibleNodes.forEach((node) => {
    const position = positions.get(node.id);
    if (!position) return;
    const { x, y } = position;
    const el = document.createElement('div');
    el.className = `node ${node.color} ${selectedId === node.id ? 'selected' : ''}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.dataset.id = node.id;

    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.innerHTML = `<span class="dot" aria-hidden="true"></span>${columns[node.column].label}`;
    el.appendChild(badge);

    const title = document.createElement('div');
    title.className = 'node-text';
    title.contentEditable = 'true';
    title.dataset.placeholder = columns[node.column].placeholder;
    title.textContent = node.text;
    title.addEventListener('focus', () => {
      selectedId = node.id;
      updateSelection();
    });
    title.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.altKey) {
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
      if (!sanitized.trim()) {
        title.textContent = '';
      }
    });

    el.appendChild(title);

    if (node.column === 1) {
      appendCategorySelect(el, node, tierCategoryOptions, 'tierCategory');
    }

    if (node.column === 3) {
      appendCategorySelect(el, node, tagOptions, 'tag');
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
  const nodesByColumn = columns.map(() => []);

  visibleNodes.forEach((node) => {
    const el = nodesContainer.querySelector(`.node[data-id="${node.id}"]`);
    if (el) {
      nodesByColumn[node.column].push({ node, el });
    }
  });

  nodesByColumn.forEach((items) => {
    items.sort((a, b) => {
      const posA = positions.get(a.node.id)?.y ?? 0;
      const posB = positions.get(b.node.id)?.y ?? 0;
      return posA - posB;
    });

    let lastBottom = -Infinity;
    const gap = 32;

    items.forEach(({ node, el }) => {
      const pos = positions.get(node.id);
      if (!pos) return;
      const height = el.offsetHeight || el.getBoundingClientRect().height || 0;
      const adjustedY = Math.max(pos.y, lastBottom + gap);
      if (adjustedY !== pos.y) {
        positions.set(node.id, { ...pos, y: adjustedY });
      }
      el.style.top = `${positions.get(node.id)?.y ?? adjustedY}px`;
      lastBottom = (positions.get(node.id)?.y ?? adjustedY) + height;
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
    if (!node.parentId) return;
    const from = positions.get(node.parentId);
    const to = positions.get(node.id);
    if (!from || !to) return;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', elbowPath(from, to));
    path.setAttribute('class', 'path');
    path.setAttribute('marker-end', 'url(#arrowhead)');
    connectionsSvg.appendChild(path);
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
  const newId = `n${Date.now()}`;
  const columnMeta = columns[column];
  const text = '';
  const sortOrder = computeInsertionOrder(column, parentId ?? null, afterId);
  const node = { id: newId, column, parentId: parentId ?? null, text, color: columnMeta.color, sortOrder };
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
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    undo();
    return;
  }
  if (isEditing && e.key !== 'Tab' && e.key !== 'Delete') {
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
  const workspaceRect = workspace.getBoundingClientRect();
  const nodeRect = element.getBoundingClientRect();
  const targetX = workspace.scrollLeft + (nodeRect.left - workspaceRect.left) - workspace.clientWidth / 2 + nodeRect.width / 2;
  const targetY = workspace.scrollTop + (nodeRect.top - workspaceRect.top) - workspace.clientHeight / 2 + nodeRect.height / 2;
  workspace.scrollTo({ left: targetX, top: targetY, behavior: 'smooth' });
}

function updateNodeText(id, text) {
  const node = nodes.find((n) => n.id === id);
  if (!node) return;
  const trimmed = text.trim();
  if (trimmed === node.text) return;
  node.text = trimmed;
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

function handleLinkingEnd() {
  if (linkingFromId && currentLinkTargetId) {
    const fromNode = nodes.find((n) => n.id === linkingFromId);
    const toNode = nodes.find((n) => n.id === currentLinkTargetId);
    if (fromNode && toNode && toNode.column > fromNode.column) {
      reparentNode(currentLinkTargetId, linkingFromId);
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
        if (n.column === 3 && n.tag === tag) {
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
        if (n.column === 1 && n.tierCategory === category) {
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
      const columnDiff = a.column - b.column;
      if (columnDiff !== 0) return columnDiff;
      return (a.text || '').localeCompare(b.text || '', 'fr', { sensitivity: 'base' });
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
  return nodes
    .filter((n) => n.column === 3)
    .map((moyen) => {
      const comportement = nodes.find((n) => n.id === moyen.parentId && n.column === 2);
      const tier = comportement ? nodes.find((n) => n.id === comportement.parentId && n.column === 1) : null;
      if (!comportement || !tier) return null;

      const moyenCategory = (moyen.tag || moyen.text || '').trim() || 'Moyen non catégorisé';
      const tierCategory = (tier.tierCategory || tier.text || '').trim() || 'Tiers non catégorisé';
      const comportementText = (comportement.text || '').trim() || 'Comportement non renseigné';

      return {
        id: moyen.id,
        phrase: `${moyenCategory} de ${tierCategory} afin de ${comportementText}`,
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

renderTagManager();
renderTierCategoryManager();
render();
recordHistory();

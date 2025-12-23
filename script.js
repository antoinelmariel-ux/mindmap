const columns = [
  { key: 'objective', label: 'Objectif', color: 'objective', placeholder: 'Nouvel objectif' },
  { key: 'tier', label: 'Tiers', color: 'tier', placeholder: 'Nouveau tiers' },
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
let history = [];
let isRestoring = false;
let linkingFromId = null;
let linkPreviewPath = null;
let currentLinkTargetId = null;
let zoom = 0.8;
const columnSpacing = 260;
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

function snapshotState() {
  return {
    nodes: nodes.map((n) => ({ ...n })),
    selectedId,
    collapsed: Array.from(collapsed),
    tagOptions: [...tagOptions],
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
  renderTagManager();
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
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '9');
    marker.setAttribute('markerHeight', '9');
    marker.setAttribute('orient', 'auto-start-reverse');

    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    arrowPath.setAttribute('fill', '#91a4c1');
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
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

    if (node.column === 2) {
      const tagRow = document.createElement('div');
      tagRow.className = 'tag-row';
      const label = document.createElement('span');
      label.textContent = 'Tag :';
      label.className = 'tag-label';
      const select = document.createElement('select');
      select.className = 'tag-select';
      select.innerHTML = `<option value="">Sélectionner un tag</option>`;
      tagOptions.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
      });
      select.value = node.tag || '';
      select.addEventListener('change', () => {
        if (node.tag === select.value) return;
        node.tag = select.value;
        recordHistory();
      });
      tagRow.append(label, select);
      el.appendChild(tagRow);
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
  }
  updateHelperPanel();
}

function elbowPath(from, to) {
  const startX = from.x + 180;
  const startY = from.y + 32;
  const endX = to.x - 12;
  const endY = to.y + 32;
  const midX = (startX + endX) / 2;
  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
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
  renderConnections();
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

function applyZoom() {
  mapWrapper.style.transform = `scale(${zoom})`;
  zoomRange.value = Math.round(zoom * 100);
  zoomValue.textContent = `${Math.round(zoom * 100)}%`;
}

function setZoom(value) {
  zoom = Math.min(1.5, Math.max(0.4, value));
  applyZoom();
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
    const startX = fromPos.x + 180;
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
        if (n.column === 2 && n.tag === tag) {
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
  workspace.scrollTo({ left: 0, top: 0 });
}

fitBtn.addEventListener('click', fitToScreen);

renderTagManager();
render();
fitToScreen();
recordHistory();

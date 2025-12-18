const columns = [
  { key: 'objective', label: 'Objectif', color: 'objective', placeholder: 'Nouvel objectif' },
  { key: 'tier', label: 'Tiers', color: 'tier', placeholder: 'Nouveau tiers' },
  { key: 'moyen', label: 'Moyen', color: 'moyen', placeholder: 'Nouveau moyen' },
  { key: 'controle', label: 'Contrôle', color: 'controle', placeholder: 'Nouveau contrôle' },
  { key: 'limite', label: 'Limite', color: 'limite', placeholder: 'Nouvelle limite' },
  { key: 'proba', label: 'Proba', color: 'proba', placeholder: 'Nouvelle probabilité' },
];

let nodes = [
  { id: 'n1', column: 0, text: 'Gagner des marchés publics', parentId: null, color: 'objective' },
  { id: 'n2', column: 1, text: "Acteur/tiers : Définit les marchés publics d'achats 'drogue' pour nous", parentId: 'n1', color: 'tier' },
  { id: 'n3', column: 1, text: 'Tiers: Concurrent; Propose des prestations moins bonnes que le LFB', parentId: 'n1', color: 'tier' },
  { id: 'n4', column: 2, text: 'Moyen: Faire une offre plus compétitive', parentId: 'n3', color: 'moyen' },
  { id: 'n5', column: 2, text: "Contrat dépays avec l'acheteur public pour une prestation fictive", parentId: 'n2', color: 'moyen' },
  { id: 'n6', column: 2, text: "Embauche d'un proche de l'acheteur", parentId: 'n2', color: 'moyen' },
  { id: 'n7', column: 3, text: 'Contrôle: des fournisseurs post board', parentId: 'n5', color: 'controle' },
  { id: 'n8', column: 4, text: 'Limite : Flous juridiques', parentId: 'n7', color: 'limite' },
  { id: 'n9', column: 4, text: 'Limite : Juste et délicat?', parentId: 'n7', color: 'limite' },
  { id: 'n10', column: 5, text: 'Proba: Probabilité faible', parentId: 'n8', color: 'proba' },
];

let selectedId = nodes[0].id;
let zoom = 0.8;
const columnSpacing = 260;
const rowSpacing = 140;
const mapWrapper = document.getElementById('map-wrapper');
const nodesContainer = document.getElementById('nodes');
const connectionsSvg = document.getElementById('connections');
const workspace = document.getElementById('workspace');
const zoomRange = document.getElementById('zoom-range');
const zoomValue = document.getElementById('zoom-value');
const zoomOutBtn = document.getElementById('zoom-out');
const zoomInBtn = document.getElementById('zoom-in');
const fitBtn = document.getElementById('fit-map');

let positions = new Map();

function computeLayout() {
  positions = new Map();
  const byColumn = columns.map(() => []);
  nodes.forEach((n) => byColumn[n.column]?.push(n));

  const heights = columns.map((_, idx) => {
    const count = byColumn[idx].length || 1;
    return Math.max(mapWrapper.clientHeight, count * rowSpacing + 400);
  });

  byColumn.forEach((colNodes) => colNodes.sort((a, b) => a.id.localeCompare(b.id)));

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
  nodes.forEach((node) => {
    const { x, y } = positions.get(node.id);
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
    title.textContent = node.text;
    title.addEventListener('focus', () => {
      selectedId = node.id;
      updateSelection();
    });
    title.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (e.altKey) {
          e.preventDefault();
          document.execCommand('insertLineBreak');
          return;
        }
        e.preventDefault();
        title.blur();
      }
    });
    title.addEventListener('blur', () => {
      updateNodeText(node.id, title.textContent || '');
    });

    el.appendChild(title);

    el.addEventListener('click', () => {
      selectedId = node.id;
      updateSelection();
      centerOnNode(node.id);
      title.focus({ preventScroll: true });
    });

    nodesContainer.appendChild(el);
  });
}

function updateSelection() {
  document.querySelectorAll('.node').forEach((n) => n.classList.remove('selected'));
  const selectedEl = document.querySelector(`.node[data-id="${selectedId}"]`);
  if (selectedEl) {
    selectedEl.classList.add('selected');
  }
}

function elbowPath(from, to) {
  const startX = from.x + 180;
  const startY = from.y + 32;
  const endX = to.x - 12;
  const endY = to.y + 32;
  return `M ${startX} ${startY} L ${endX} ${startY} L ${endX} ${endY}`;
}

function renderConnections() {
  connectionsSvg.innerHTML = '';
  const maxX = Math.max(...Array.from(positions.values()).map((p) => p.x)) + 500;
  const maxY = Math.max(...Array.from(positions.values()).map((p) => p.y)) + 400;
  connectionsSvg.setAttribute('width', maxX);
  connectionsSvg.setAttribute('height', maxY);
  nodes.forEach((node) => {
    if (!node.parentId) return;
    const from = positions.get(node.parentId);
    const to = positions.get(node.id);
    if (!from || !to) return;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', elbowPath(from, to));
    path.setAttribute('class', 'path');
    connectionsSvg.appendChild(path);
  });
}

function render() {
  computeLayout();
  renderNodes();
  renderConnections();
  applyZoom();
  updateSelection();
}

function createNode({ column, parentId }) {
  const newId = `n${Date.now()}`;
  const columnMeta = columns[column];
  const text = `${columnMeta.label} ${Math.floor(Math.random() * 90 + 10)}`;
  const node = { id: newId, column, parentId: parentId ?? null, text, color: columnMeta.color };
  nodes.push(node);
  selectedId = newId;
  render();
  centerOnNode(newId);
}

function handleKeydown(e) {
  const active = document.activeElement;
  if (active?.isContentEditable) {
    return;
  }
  if (!selectedId) return;
  const current = nodes.find((n) => n.id === selectedId);
  if (!current) return;

  if (e.key === 'Enter') {
    e.preventDefault();
    createNode({ column: current.column, parentId: current.parentId });
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
  node.text = text.trim() || columns[node.column].placeholder;
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
  if (!nodes.length) {
    selectedId = null;
  } else {
    const parentId = targetNode?.parentId || null;
    selectedId = nodes.find((n) => n.id === parentId)?.id || nodes[0].id;
  }
  render();
  if (selectedId) {
    centerOnNode(selectedId);
  }
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

render();
fitToScreen();

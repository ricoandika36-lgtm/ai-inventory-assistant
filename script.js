/* ═══════════════════════════════════════════════════════════
   INVENTORY MANAGEMENT + AI ASSISTANT
═══════════════════════════════════════════════════════════ */

/* ── Constants ──────────────────────────────────────────────── */
const STORAGE_KEY    = 'inventory_items_v2';
const DEFAULT_MIN    = 10;   // fallback minimum stock level

/* ── Seed data ──────────────────────────────────────────────── */
const SEED_DATA = [
  { id: uid(), name: 'Wireless Mouse',      category: 'Electronics', quantity: 42,  price: 29.99, minStock: 15 },
  { id: uid(), name: 'Notebook A5',         category: 'Stationery',  quantity: 8,   price:  3.49, minStock: 20 },
  { id: uid(), name: 'USB-C Hub',           category: 'Electronics', quantity: 5,   price: 44.00, minStock: 10 },
  { id: uid(), name: 'Ballpoint Pens x10',  category: 'Stationery',  quantity: 0,   price:  2.10, minStock: 30 },
  { id: uid(), name: 'Desk Lamp',           category: 'Furniture',   quantity: 17,  price: 34.95, minStock: 10 },
  { id: uid(), name: 'Sticky Notes Pack',   category: 'Stationery',  quantity: 3,   price:  1.75, minStock: 25 },
  { id: uid(), name: 'Standing Desk',       category: 'Furniture',   quantity: 11,  price:349.00, minStock: 5  },
  { id: uid(), name: 'Keyboard Cleaner',    category: 'Electronics', quantity: 0,   price:  8.50, minStock: 10 },
];

/* ── Helpers ────────────────────────────────────────────────── */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveItems(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function stockStatus(qty, min) {
  const threshold = (typeof min === 'number' && min >= 0) ? min : DEFAULT_MIN;
  if (qty === 0)           return { label: 'Out of Stock', cls: 'badge-out', rowCls: 'out-of-stock' };
  if (qty <= threshold)    return { label: 'Low Stock',    cls: 'badge-low', rowCls: 'low-stock'    };
  return                          { label: 'In Stock',     cls: 'badge-ok',  rowCls: ''             };
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── State ──────────────────────────────────────────────────── */
let items = loadItems() ?? SEED_DATA.map(i => ({ ...i }));
let query = '';
if (!loadItems()) saveItems(items);

/* ── DOM refs — Inventory ───────────────────────────────────── */
const form           = document.getElementById('add-form');
const nameInput      = document.getElementById('item-name');
const categoryInput  = document.getElementById('item-category');
const quantityInput  = document.getElementById('item-quantity');
const priceInput     = document.getElementById('item-price');
const minStockInput  = document.getElementById('item-minstock');
const searchInput    = document.getElementById('search-input');
const tbody          = document.getElementById('inventory-body');
const emptyMsg       = document.getElementById('empty-msg');
const resultCount    = document.getElementById('result-count');
const statTotal      = document.getElementById('stat-total');
const statQuantity   = document.getElementById('stat-quantity');
const statLowStock   = document.getElementById('stat-lowstock');
const statCategories = document.getElementById('stat-categories');

/* ── DOM refs — Chat ────────────────────────────────────────── */
const chatPanel      = document.getElementById('chat-panel');
const chatToggle     = document.getElementById('chat-toggle');
const chatClose      = document.getElementById('chat-close');
const chatMessages   = document.getElementById('chat-messages');
const chatForm       = document.getElementById('chat-form');
const chatInput      = document.getElementById('chat-input');
const suggestionBtns = document.querySelectorAll('.suggestion-btn');

/* ═══════════════════════════════════════════════════════════
   INVENTORY RENDERING
═══════════════════════════════════════════════════════════ */
function render() {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? items.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
    : items;

  updateStats();

  resultCount.textContent = q
    ? `— ${filtered.length} result${filtered.length !== 1 ? 's' : ''}`
    : '';

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    emptyMsg.classList.remove('hidden');
    return;
  }
  emptyMsg.classList.add('hidden');

  filtered.forEach(item => {
    const status = stockStatus(item.quantity, item.minStock);
    const tr = document.createElement('tr');
    if (status.rowCls) tr.classList.add(status.rowCls);

    tr.innerHTML = `
      <td>${escHtml(item.name)}</td>
      <td>${escHtml(item.category)}</td>
      <td>${item.quantity}</td>
      <td>${item.minStock ?? DEFAULT_MIN}</td>
      <td>$${Number(item.price).toFixed(2)}</td>
      <td><span class="badge ${status.cls}">${status.label}</span></td>
      <td>
        <button class="btn-delete" data-id="${escHtml(item.id)}" aria-label="Delete ${escHtml(item.name)}">
          Delete
        </button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function updateStats() {
  const totalQty      = items.reduce((s, i) => s + Number(i.quantity), 0);
  const lowCount      = items.filter(i => i.quantity <= (i.minStock ?? DEFAULT_MIN)).length;
  const categories    = new Set(items.map(i => i.category.trim())).size;
  statTotal.textContent      = items.length;
  statQuantity.textContent   = totalQty;
  statLowStock.textContent   = lowCount;
  statCategories.textContent = categories;
}

/* ── Add item ───────────────────────────────────────────────── */
form.addEventListener('submit', e => {
  e.preventDefault();
  const name     = nameInput.value.trim();
  const category = categoryInput.value.trim();
  const quantity = parseInt(quantityInput.value, 10);
  const price    = parseFloat(priceInput.value);
  const minStock = parseInt(minStockInput.value, 10);

  if (!name || !category || isNaN(quantity) || isNaN(price)) return;

  items.unshift({ id: uid(), name, category, quantity, price, minStock: isNaN(minStock) ? DEFAULT_MIN : minStock });
  saveItems(items);
  form.reset();
  minStockInput.value = DEFAULT_MIN;
  nameInput.focus();
  render();
});

/* ── Delete item ────────────────────────────────────────────── */
tbody.addEventListener('click', e => {
  const btn = e.target.closest('.btn-delete');
  if (!btn) return;
  items = items.filter(i => i.id !== btn.dataset.id);
  saveItems(items);
  render();
});

/* ── Search ─────────────────────────────────────────────────── */
searchInput.addEventListener('input', e => {
  query = e.target.value;
  render();
});

/* ═══════════════════════════════════════════════════════════
   AI ASSISTANT ENGINE
═══════════════════════════════════════════════════════════ */

/**
 * Returns a data snapshot used by every AI function.
 * Always works from the live `items` array — never invents data.
 */
function getSnapshot() {
  const outOfStock = items.filter(i => i.quantity === 0);
  const lowStock   = items.filter(i => i.quantity > 0 && i.quantity <= (i.minStock ?? DEFAULT_MIN));
  const inStock    = items.filter(i => i.quantity > (i.minStock ?? DEFAULT_MIN));

  const totalQty     = items.reduce((s, i) => s + Number(i.quantity), 0);
  const totalValue   = items.reduce((s, i) => s + Number(i.quantity) * Number(i.price), 0);
  const categories   = [...new Set(items.map(i => i.category.trim()))];

  // Sorted by deficit (minStock - qty) for restock priority
  const restockList = [...outOfStock, ...lowStock].sort((a, b) => {
    const defA = (a.minStock ?? DEFAULT_MIN) - a.quantity;
    const defB = (b.minStock ?? DEFAULT_MIN) - b.quantity;
    return defB - defA;
  });

  return { outOfStock, lowStock, inStock, totalQty, totalValue, categories, restockList };
}

/** Format a list of items as a compact readable string. */
function formatItemList(list, showQty = true) {
  if (list.length === 0) return '(none)';
  return list.map(i => {
    const qty   = showQty ? ` — Qty: ${i.quantity}` : '';
    const min   = showQty ? `, Min: ${i.minStock ?? DEFAULT_MIN}` : '';
    return `• ${i.name} [${i.category}]${qty}${min}`;
  }).join('\n');
}

/** Core AI intent router — maps natural language to structured responses. */
function aiRespond(text) {
  const q = text.trim().toLowerCase();

  // Guard: empty inventory
  if (items.length === 0) {
    return 'Your inventory is currently empty. Add some items and I can help you analyse them.';
  }

  const snap = getSnapshot();

  /* ── Summary ─────────────────────────────────────── */
  if (/\b(summary|overview|report|status|dashboard)\b/.test(q)) {
    return buildSummary(snap);
  }

  /* ── Low stock / out of stock ─────────────────────── */
  if (/\bout.?of.?stock\b/.test(q)) {
    return buildOutOfStock(snap);
  }

  if (/\b(low|running low|almost out|critical|shortage|short)\b/.test(q)) {
    return buildLowStock(snap);
  }

  /* ── Restock / replenish ──────────────────────────── */
  if (/\b(restock|replenish|order|purchase|buy|refill|top.?up|priority)\b/.test(q)) {
    return buildRestockAdvice(snap);
  }

  /* ── Categories ───────────────────────────────────── */
  if (/\b(categor|group|type|section|department)\b/.test(q)) {
    return buildCategories(snap);
  }

  /* ── Total value / cost ───────────────────────────── */
  if (/\b(value|worth|cost|total value|stock value|inventory value)\b/.test(q)) {
    return buildValue(snap);
  }

  /* ── Highest / lowest quantity ────────────────────── */
  if (/\b(most|highest|maximum|most stock|top)\b/.test(q)) {
    return buildTop(snap);
  }

  if (/\b(least|lowest|minimum|fewest|bottom)\b/.test(q)) {
    return buildBottom(snap);
  }

  /* ── How many items / total count ────────────────── */
  if (/\b(how many|count|number of|total items?)\b/.test(q)) {
    return `You currently have **${items.length} item${items.length !== 1 ? 's' : ''}** in your inventory across ${snap.categories.length} categor${snap.categories.length !== 1 ? 'ies' : 'y'}.`;
  }

  /* ── Search for a specific item ───────────────────── */
  const searchMatch = findItemByQuery(q);
  if (searchMatch.length > 0) {
    return buildItemDetail(searchMatch);
  }

  /* ── Fallback ─────────────────────────────────────── */
  return buildHelp();
}

/* ── AI response builders ───────────────────────────────────── */

function buildSummary(snap) {
  const lines = [
    `📦 Inventory Summary`,
    `─────────────────────────`,
    `Total items:     ${items.length}`,
    `Total quantity:  ${snap.totalQty} units`,
    `Inventory value: $${snap.totalValue.toFixed(2)}`,
    `Categories:      ${snap.categories.join(', ')}`,
    ``,
    `Stock health:`,
    `  ✅ In stock:      ${snap.inStock.length} item(s)`,
    `  ⚠️  Low stock:     ${snap.lowStock.length} item(s)`,
    `  🔴 Out of stock:  ${snap.outOfStock.length} item(s)`,
  ];

  if (snap.restockList.length > 0) {
    lines.push(`\nItems needing attention:\n${formatItemList(snap.restockList)}`);
  }

  return lines.join('\n');
}

function buildOutOfStock(snap) {
  if (snap.outOfStock.length === 0) {
    return '✅ No items are currently out of stock. All products have at least some quantity available.';
  }
  return `🔴 Out of Stock (${snap.outOfStock.length} item${snap.outOfStock.length !== 1 ? 's' : ''})\n\n${formatItemList(snap.outOfStock, false)}\n\nThese items have zero quantity and cannot be sold until restocked.`;
}

function buildLowStock(snap) {
  const critical = [...snap.outOfStock, ...snap.lowStock];
  if (critical.length === 0) {
    return '✅ All items are above their minimum stock levels. Your inventory looks healthy!';
  }

  const parts = [];
  if (snap.outOfStock.length > 0) {
    parts.push(`🔴 Out of Stock (${snap.outOfStock.length}):\n${formatItemList(snap.outOfStock)}`);
  }
  if (snap.lowStock.length > 0) {
    parts.push(`⚠️ Low Stock (${snap.lowStock.length}):\n${formatItemList(snap.lowStock)}`);
  }
  return parts.join('\n\n');
}

function buildRestockAdvice(snap) {
  if (snap.restockList.length === 0) {
    return '✅ All items are above their minimum stock levels. No restocking is needed at this time.';
  }

  const lines = [
    `🛒 Restock Recommendations`,
    `(ordered by urgency — largest deficit first)`,
    ``
  ];

  snap.restockList.forEach((item, idx) => {
    const min     = item.minStock ?? DEFAULT_MIN;
    const deficit = min - item.quantity;
    const suggest = Math.max(deficit, min); // suggest at least restoring to minimum
    lines.push(`${idx + 1}. ${item.name} [${item.category}]`);
    lines.push(`   Current: ${item.quantity} | Min: ${min} | Deficit: ${deficit} units`);
    lines.push(`   → Suggested order: at least ${suggest} units`);
    lines.push('');
  });

  lines.push('Note: These recommendations are based solely on your current inventory data and minimum stock levels.');
  return lines.join('\n').trimEnd();
}

function buildCategories(snap) {
  const lines = [`📂 Categories (${snap.categories.length} total)\n`];
  snap.categories.forEach(cat => {
    const catItems = items.filter(i => i.category.trim() === cat);
    const totalQty = catItems.reduce((s, i) => s + i.quantity, 0);
    const needsAttn = catItems.filter(i => i.quantity <= (i.minStock ?? DEFAULT_MIN));
    const flag = needsAttn.length > 0 ? ` ⚠️ (${needsAttn.length} need attention)` : ' ✅';
    lines.push(`• ${cat}: ${catItems.length} item(s), ${totalQty} total units${flag}`);
  });
  return lines.join('\n');
}

function buildValue(snap) {
  const lines = [`💰 Inventory Value: $${snap.totalValue.toFixed(2)}\n`];
  const sorted = [...items].sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price));
  lines.push('By item (highest value first):');
  sorted.slice(0, 8).forEach(i => {
    const val = (i.quantity * i.price).toFixed(2);
    lines.push(`• ${i.name}: $${val} (${i.quantity} × $${Number(i.price).toFixed(2)})`);
  });
  if (sorted.length > 8) lines.push(`  … and ${sorted.length - 8} more item(s)`);
  return lines.join('\n');
}

function buildTop(snap) {
  const sorted = [...items].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  const lines = [`📈 Highest Stock Items\n`];
  sorted.forEach((i, idx) => {
    lines.push(`${idx + 1}. ${i.name} [${i.category}] — ${i.quantity} units`);
  });
  return lines.join('\n');
}

function buildBottom(snap) {
  const sorted = [...items].sort((a, b) => a.quantity - b.quantity).slice(0, 5);
  const lines = [`📉 Lowest Stock Items\n`];
  sorted.forEach((i, idx) => {
    lines.push(`${idx + 1}. ${i.name} [${i.category}] — ${i.quantity} units`);
  });
  return lines.join('\n');
}

function findItemByQuery(q) {
  return items.filter(i =>
    i.name.toLowerCase().includes(q) ||
    i.category.toLowerCase().includes(q)
  );
}

function buildItemDetail(found) {
  const lines = [`🔍 Found ${found.length} matching item(s):\n`];
  found.slice(0, 6).forEach(i => {
    const status = stockStatus(i.quantity, i.minStock);
    lines.push(`• ${i.name}`);
    lines.push(`  Category: ${i.category}`);
    lines.push(`  Quantity: ${i.quantity} | Min: ${i.minStock ?? DEFAULT_MIN}`);
    lines.push(`  Price: $${Number(i.price).toFixed(2)}`);
    lines.push(`  Status: ${status.label}`);
    lines.push('');
  });
  if (found.length > 6) lines.push(`… and ${found.length - 6} more result(s).`);
  return lines.join('\n').trimEnd();
}

function buildHelp() {
  return [
    `I can help you with your inventory. Try asking:`,
    ``,
    `• "Give me an inventory summary"`,
    `• "Which items are low on stock?"`,
    `• "What should I restock first?"`,
    `• "Show items out of stock"`,
    `• "What is the total inventory value?"`,
    `• "How many categories do I have?"`,
    `• "Show me Electronics items"`,
    `• "Which items have the highest quantity?"`,
    ``,
    `I only use your actual inventory data — I will never invent or assume product information.`,
  ].join('\n');
}

/* ═══════════════════════════════════════════════════════════
   CHAT UI
═══════════════════════════════════════════════════════════ */

function appendMessage(role, text) {
  const wrapper = document.createElement('div');
  wrapper.className = `chat-msg ${role}`;

  const label = document.createElement('div');
  label.className = 'msg-label';
  label.textContent = role === 'user' ? 'You' : 'AI Assistant';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;   // safe: textContent never executes HTML

  wrapper.appendChild(label);
  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return wrapper;
}

function showTyping() {
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-msg ai typing-bubble';
  wrapper.id = 'typing-indicator';

  const label = document.createElement('div');
  label.className = 'msg-label';
  label.textContent = 'AI Assistant';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';

  wrapper.appendChild(label);
  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function handleUserMessage(text) {
  if (!text.trim()) return;
  appendMessage('user', text);
  showTyping();

  // Simulate a brief "thinking" delay for natural feel
  setTimeout(() => {
    removeTyping();
    const response = aiRespond(text);
    appendMessage('ai', response);
  }, 420);
}

/* Chat form submit */
chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  handleUserMessage(text);
});

/* Suggestion chips */
suggestionBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    handleUserMessage(btn.dataset.q);
  });
});

/* ── Chat panel toggle ──────────────────────────────────────── */
chatToggle.addEventListener('click', () => {
  chatPanel.classList.toggle('chat-hidden');
});

chatClose.addEventListener('click', () => {
  chatPanel.classList.add('chat-hidden');
});

/* ═══════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════ */
render();

// Welcome message
appendMessage('ai',
  `Hello! I'm your AI Inventory Assistant.\n\nI can answer questions about your ${items.length} inventory item(s), identify low-stock products, and suggest what to restock.\n\nTry the quick buttons below, or just ask me anything about your inventory.`
);

// ========== 工具函数 ==========
function escapeHTML(s) {
    const d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
}

function countAllDescendants(node) {
    if (!node) return 0;
    if (node.url) return 1;
    let c = 0;
    if (node.children) node.children.forEach(n => c += countAllDescendants(n));
    return c;
}

function showToast(msg) {
    const toastEl = document.getElementById('toast');
    if (window._toastTimer) clearTimeout(window._toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    window._toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1600);
}

function getLevelBorderStyle(level) {
    const style = getComputedStyle(document.body);
    const raw = style.getPropertyValue('--level-color').trim();
    const parts = raw.split(',').map(s => parseInt(s.trim(), 10));
    if (parts.length < 3) return '1px solid rgba(0,113,227,0.7)';
    const alpha = level === 0 ? 1 : level === 1 ? 0.9 : level === 2 ? 0.8 : 0.7;
    const width = level === 0 ? 4 : level === 1 ? 3 : level === 2 ? 2 : 1;
    return `${width}px solid rgba(${parts[0]},${parts[1]},${parts[2]},${alpha})`;
}
(function () {
    'use strict';

    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const filterArea = document.getElementById('filterArea');
    const toastEl = document.getElementById('toast');
    const themeSwitcher = document.getElementById('themeSwitcher');
    const toggleDualBtn = document.getElementById('toggleDualBtn');
    const panel1El = document.getElementById('panel1');
    const panel2El = document.getElementById('panel2');
    const panelDivider = document.getElementById('panelDivider');
    const panelBody1 = document.getElementById('panelBody1');
    const panelBody2 = document.getElementById('panelBody2');
    const panel1Title = document.getElementById('panel1Title');
    const panel2Title = document.getElementById('panel2Title');
    const clearPanel1Btn = document.getElementById('clearPanel1Btn');
    const clearPanel2Btn = document.getElementById('clearPanel2Btn');
    const toolbar = document.getElementById('toolbar');
    const dragHint = toolbar.querySelector('.drag-hint');
    const clearCacheBtn = document.getElementById('clearCacheBtn');

    let bookmarkTreeRoot, bookmarksBarNode, workspaceFolders = [];
    let isSearchMode = false, allBookmarksFlat = [];
    let dualMode = false;
    let panel1Path = [], panel2Path = [];
    let activePanelId = 'panel1';
    const panelScales = { panel1: 1, panel2: 1 };
    const MIN_SCALE = 0.6, MAX_SCALE = 1.8, STEP = 0.1;

    function escapeHTML(s) { const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }
    function countAllDescendants(node) {
        if (!node) return 0;
        if (node.url) return 1;
        let c = 0; if (node.children) node.children.forEach(n => c += countAllDescendants(n));
        return c;
    }
    function showToast(msg) {
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

    function findBookmarksBar(root) {
        if (!root?.children) return null;
        const byId = root.children.find(c => c.id === '1');
        if (byId?.children) return byId;
        const byTitle = root.children.find(c => {
            const t = (c.title || '').toLowerCase();
            return t.includes('书签栏') || t.includes('bookmarks bar');
        });
        if (byTitle?.children) return byTitle;
        const fallback = root.children.find(c => {
            const t = (c.title || '').toLowerCase();
            return c.children && !t.includes('其他书签') && !t.includes('other bookmarks') && !t.includes('mobile');
        });
        if (fallback) return fallback;
        return root.children.find(c => c.children && !c.url) || null;
    }

    function flattenBookmarks(node, path, result) {
        if (!node) return;
        const cur = [...path];
        if (node.title && path.length > 0) cur.push(node.title);
        if (node.url) result.push({ id: node.id, title: node.title, url: node.url, path: cur, pathStr: cur.join(' ▸ '), node });
        if (node.children) node.children.forEach(c => flattenBookmarks(c, cur, result));
    }

    function setActivePanel(panelId) {
        activePanelId = panelId;
        panel1El.classList.toggle('panel-active', panelId === 'panel1');
        panel2El.classList.toggle('panel-active', panelId === 'panel2');
    }
    panel1El.addEventListener('mouseenter', () => setActivePanel('panel1'));
    panel1El.addEventListener('click', () => setActivePanel('panel1'));
    panel2El.addEventListener('mouseenter', () => setActivePanel('panel2'));
    panel2El.addEventListener('click', () => setActivePanel('panel2'));

    // 清空面板
    function clearPanel(panelId) {
        if (panelId === 'panel1') {
            panel1Path = [];
            panelBody1.innerHTML = '<div class="empty-state"><span>📭 暂无内容</span></div>';
            panel1Title.textContent = '📂 工作区 1';
        } else {
            panel2Path = [];
            panelBody2.innerHTML = '<div class="empty-state"><span>📭 暂无内容</span></div>';
            panel2Title.textContent = '📂 工作区 2';
        }
        saveState();
        showToast('面板已清空');
    }
    clearPanel1Btn.addEventListener('click', () => clearPanel('panel1'));
    clearPanel2Btn.addEventListener('click', () => clearPanel('panel2'));

    function renderPanel(bodyEl, pathArray, titleEl, titleName) {
        bodyEl.innerHTML = '';
        if (!pathArray || !pathArray.length) {
            bodyEl.innerHTML = '<div class="empty-state"><span>📭 暂无内容</span></div>';
            return;
        }
        pathArray.forEach((colData, i) => {
            const col = createColumn(colData, i, bodyEl);
            bodyEl.appendChild(col);
        });
        if (titleEl) titleEl.textContent = `📂 ${titleName || pathArray[0]?.title || '工作区'}`;
        requestAnimationFrame(() => {
            const last = bodyEl.lastElementChild;
            if (last) last.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
        });
    }

    function createColumn(colData, colIndex, currentBodyEl) {
        const div = document.createElement('div');
        div.className = 'column';
        div.style.borderLeft = getLevelBorderStyle(colIndex);
        const header = document.createElement('div');
        header.className = 'column-header';
        header.textContent = colData.title;
        div.appendChild(header);
        const body = document.createElement('div');
        body.className = 'column-body';
        const children = colData.children || [];
        if (!children.length) {
            const empty = document.createElement('div');
            empty.className = 'item';
            empty.style.color = 'var(--text-secondary)';
            empty.textContent = '（空文件夹）';
            body.appendChild(empty);
        } else {
            const folders = children.filter(c => !c.url && c.children).sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
            const bms = children.filter(c => c.url).sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
            [...folders, ...bms].forEach(child => body.appendChild(createItemElement(child, colIndex, currentBodyEl)));
        }
        div.appendChild(body);
        return div;
    }

    function createItemElement(node, colIndex, bodyEl) {
        const isFolder = !node.url && node.children;
        const item = document.createElement('div');
        item.className = 'item';
        item.classList.add(isFolder ? 'folder-item' : 'bookmark-item');
        const isPanel1 = bodyEl === panelBody1 || panelBody1.contains(bodyEl);
        const pathRef = isPanel1 ? panel1Path : panel2Path;
        if (isFolder && colIndex + 1 < pathRef.length && pathRef[colIndex + 1].id === node.id) {
            item.classList.add('expanded');
        }
        const icon = document.createElement('span');
        icon.className = 'item-icon';
        icon.textContent = isFolder ? '📁' : '🔗';
        item.appendChild(icon);
        const text = document.createElement('span');
        text.className = 'item-text';
        text.textContent = node.title || '（无标题）';
        text.title = node.title || '';
        item.appendChild(text);
        if (isFolder && node.children) {
            const cnt = document.createElement('span');
            cnt.className = 'item-count';
            cnt.textContent = countAllDescendants(node);
            item.appendChild(cnt);
        }
        if (isFolder) {
            const arrow = document.createElement('span');
            arrow.className = 'item-arrow';
            arrow.textContent = '›';
            item.appendChild(arrow);
        }
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isFolder) handleFolderClick(node, colIndex, bodyEl);
            else handleBookmarkClick(node);
        });
        return item;
    }

    function handleFolderClick(folderNode, colIndex, bodyEl) {
        const isPanel1 = bodyEl === panelBody1 || panelBody1.contains(bodyEl);
        let path = isPanel1 ? [...panel1Path] : [...panel2Path];
        if (colIndex + 1 < path.length && path[colIndex + 1].id === folderNode.id) {
            path = path.slice(0, colIndex + 1);
        } else {
            path = path.slice(0, colIndex + 1);
            path.push({ id: folderNode.id, title: folderNode.title, children: folderNode.children || [] });
        }
        if (isPanel1) panel1Path = path; else panel2Path = path;
        const titleEl = isPanel1 ? panel1Title : panel2Title;
        renderPanel(bodyEl, path, titleEl, path[0]?.title || '');
        saveState();
    }

    function handleBookmarkClick(node) {
        if (node.url) {
            chrome.tabs.create({ url: node.url, active: true });
            showToast('已打开');
        }
    }

    async function loadWorkspaceIntoPanel(workspaceId, bodyEl, pathVarName, titleEl, titleName) {
        let newPath = [];
        if (workspaceId === '__all__') {
            newPath.push({ id: '__all_root__', title: '全部工作区', children: workspaceFolders.map(f => ({ ...f })), _isVirtual: true });
        } else {
            const ws = workspaceFolders.find(f => f.id === workspaceId);
            if (!ws) return;
            newPath.push({ id: ws.id, title: ws.title, children: ws.children || [] });
        }
        if (pathVarName === 'panel1Path') panel1Path = newPath; else panel2Path = newPath;
        renderPanel(bodyEl, newPath, titleEl, titleName);
        saveState();
    }

    function renderFilterButtons() {
        filterArea.innerHTML = '';
        if (!workspaceFolders.length) {
            filterArea.innerHTML = '<span style="color:var(--text-secondary)">暂无工作区</span>';
            return;
        }
        const total = workspaceFolders.reduce((s, f) => s + countAllDescendants(f), 0);
        filterArea.appendChild(addFilterBtn('__all__', '🌐 全部', total, true));
        workspaceFolders.forEach(f => filterArea.appendChild(addFilterBtn(f.id, f.title, countAllDescendants(f), false)));
    }

    function addFilterBtn(id, title, count, isAll = false) {
        const btn = document.createElement('button');
        btn.className = `filter-btn${isAll ? ' all-btn' : ''}`;
        btn.draggable = true;
        btn.dataset.workspaceId = id;
        btn.innerHTML = `${escapeHTML(title)}<span class="count-badge">${count}</span>`;
        btn.addEventListener('click', async () => {
            if (isSearchMode) exitSearchMode();
            const targetBody = activePanelId === 'panel1' ? panelBody1 : panelBody2;
            const targetPathVar = activePanelId === 'panel1' ? 'panel1Path' : 'panel2Path';
            const targetTitle = activePanelId === 'panel1' ? panel1Title : panel2Title;
            await loadWorkspaceIntoPanel(id, targetBody, targetPathVar, targetTitle, title);
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
        btn.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', id);
            e.dataTransfer.effectAllowed = 'move';
            btn.classList.add('dragging');
        });
        btn.addEventListener('dragend', () => btn.classList.remove('dragging'));
        return btn;
    }

    function performSearch(query) {
        if (!query || !query.trim()) { exitSearchMode(); return; }
        isSearchMode = true;
        if (dualMode) {
            panel2El.style.display = 'none';
            panelDivider.style.display = 'none';
        }
        const q = query.trim().toLowerCase();
        const results = allBookmarksFlat.filter(item =>
            item.title.toLowerCase().includes(q) || item.url.toLowerCase().includes(q) || item.pathStr.toLowerCase().includes(q)
        ).slice(0, 80);
        panelBody1.innerHTML = '';
        if (!results.length) {
            panelBody1.innerHTML = '<div class="empty-state"><span>🔍 无匹配结果</span></div>';
            panel1Title.textContent = '🔎 搜索结果';
            return;
        }
        const container = document.createElement('div');
        container.className = 'search-results';
        results.forEach(r => {
            const el = document.createElement('div');
            el.className = 'search-result-item';
            el.innerHTML = `<span class="result-icon">🔗</span><div class="result-info"><div class="result-title">${highlightMatch(escapeHTML(r.title), query)}</div><div class="result-path">${highlightMatch(escapeHTML(r.pathStr), query)}</div><div class="result-url">${escapeHTML(r.url || '')}</div></div>`;
            el.addEventListener('click', () => { chrome.tabs.create({ url: r.url, active: true }); });
            container.appendChild(el);
        });
        panelBody1.appendChild(container);
        panel1Title.textContent = '🔎 搜索结果';
    }

    function exitSearchMode() {
        if (!isSearchMode) return;
        isSearchMode = false;
        searchInput.value = '';
        searchClear.classList.remove('visible');
        document.documentElement.style.setProperty('--panel-wrap', dualMode ? 'nowrap' : 'wrap');
        if (!panel1Path.length) {
            panelBody1.innerHTML = '<div class="empty-state"><span>📭 暂无内容</span></div>';
        } else {
            renderPanel(panelBody1, panel1Path, panel1Title, panel1Path[0]?.title || '');
        }
        if (dualMode) {
            panel2El.style.display = 'flex';
            panelDivider.style.display = 'block';
        }
    }

    function highlightMatch(text, query) {
        const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return text.replace(new RegExp(`(${esc})`, 'gi'), '<mark>$1</mark>');
    }

    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('workspace_theme', theme);
        document.querySelectorAll('.theme-dot').forEach(d => d.classList.toggle('active', d.dataset.theme === theme));
        if (panel1Path.length) renderPanel(panelBody1, panel1Path, panel1Title, panel1Path[0]?.title || '');
        if (dualMode && panel2Path.length) renderPanel(panelBody2, panel2Path, panel2Title, panel2Path[0]?.title || '');
    }

    function initTheme() {
        const saved = localStorage.getItem('workspace_theme') || 'dark-gold';
        applyTheme(saved);
    }

    themeSwitcher.addEventListener('click', (e) => {
        const dot = e.target.closest('.theme-dot');
        if (dot) applyTheme(dot.dataset.theme);
    });

    function setPanelScale(panelId, scale) {
        panelScales[panelId] = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
        const bodyEl = panelId === 'panel1' ? panelBody1 : panelBody2;
        bodyEl.style.setProperty('--panel-scale', panelScales[panelId]);
        const valueEl = document.querySelector(`.scale-group[data-panel="${panelId}"] .scale-value`);
        if (valueEl) valueEl.textContent = Math.round(panelScales[panelId] * 100) + '%';
        localStorage.setItem(`workspace_scale_${panelId}`, panelScales[panelId]);
    }

    function initScales() {
        ['panel1', 'panel2'].forEach(p => {
            const saved = parseFloat(localStorage.getItem(`workspace_scale_${p}`)) || 1;
            setPanelScale(p, saved);
        });
    }

    document.querySelectorAll('.scale-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const panelId = btn.closest('.scale-group').dataset.panel;
            if (btn.classList.contains('zoom-in')) setPanelScale(panelId, panelScales[panelId] + STEP);
            else if (btn.classList.contains('zoom-out')) setPanelScale(panelId, panelScales[panelId] - STEP);
        });
    });

    toolbar.addEventListener('mouseenter', () => { dragHint.style.display = 'block'; });
    toolbar.addEventListener('mousemove', (e) => {
        dragHint.style.left = (e.clientX + 12) + 'px';
        dragHint.style.top = (e.clientY + 12) + 'px';
    });
    toolbar.addEventListener('mouseleave', () => { dragHint.style.display = 'none'; });

    toggleDualBtn.addEventListener('click', () => {
        dualMode = !dualMode;
        panel2El.style.display = dualMode ? 'flex' : 'none';
        panelDivider.style.display = dualMode ? 'block' : 'none';
        toggleDualBtn.classList.toggle('active', dualMode);
        document.documentElement.style.setProperty('--panel-wrap', dualMode ? 'nowrap' : 'wrap');
        if (dualMode) {
            panel1El.style.flex = '2';
            panel2El.style.flex = '1';
            // 如果面板2为空，打开时默认显示空
            if (!panel2Path.length) {
                panelBody2.innerHTML = '<div class="empty-state"><span>📭 暂无内容</span></div>';
            }
        } else {
            panel1El.style.flex = '1';
            if (activePanelId === 'panel2') setActivePanel('panel1');
        }
        saveState();
    });

    let isResizing = false;
    panelDivider.addEventListener('mousedown', (e) => { isResizing = true; e.preventDefault(); });
    window.addEventListener('mousemove', (e) => {
        if (!isResizing || !dualMode) return;
        const container = document.getElementById('panelsContainer');
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const total = rect.width;
        if (total <= 0) return;
        let leftPercent = x / total;
        leftPercent = Math.max(0.2, Math.min(0.8, leftPercent));
        panel1El.style.flex = `0 0 ${leftPercent * 100}%`;
        panel2El.style.flex = `0 0 ${(1 - leftPercent) * 100}%`;
    });
    window.addEventListener('mouseup', () => { isResizing = false; });

    function saveState() {
        localStorage.setItem('workspace_panel1Path', JSON.stringify(panel1Path));
        localStorage.setItem('workspace_panel2Path', JSON.stringify(panel2Path));
        localStorage.setItem('workspace_panel1Scale', panelScales.panel1);
        localStorage.setItem('workspace_panel2Scale', panelScales.panel2);
    }

    function restoreState() {
        const savedActive = localStorage.getItem('workspace_activePanel');
        if (savedActive) activePanelId = savedActive;
        const savedPath1 = localStorage.getItem('workspace_panel1Path');
        if (savedPath1) try { panel1Path = JSON.parse(savedPath1); } catch (e) { }
        const savedPath2 = localStorage.getItem('workspace_panel2Path');
        if (savedPath2) try { panel2Path = JSON.parse(savedPath2); } catch (e) { }
        
        dualMode = false;
        toggleDualBtn.classList.remove('active');
        panel2El.style.display = 'none';
        panelDivider.style.display = 'none';
        document.documentElement.style.setProperty('--panel-wrap', 'wrap');
        panel1El.style.flex = '1';
        setActivePanel(activePanelId);
        
        if (panel1Path.length) {
            renderPanel(panelBody1, panel1Path, panel1Title, panel1Path[0]?.title || '');
        } else {
            panelBody1.innerHTML = '<div class="empty-state"><span>📭 暂无内容</span></div>';
        }
        panelBody2.innerHTML = '';
    }

    function clearAllCache() {
        localStorage.removeItem('workspace_theme');
        localStorage.removeItem('workspace_dualMode');
        localStorage.removeItem('workspace_activePanel');
        localStorage.removeItem('workspace_panel1Path');
        localStorage.removeItem('workspace_panel2Path');
        localStorage.removeItem('workspace_panel1Scale');
        localStorage.removeItem('workspace_panel2Scale');
        
        applyTheme('dark-gold');
        setPanelScale('panel1', 1);
        setPanelScale('panel2', 1);
        dualMode = false;
        activePanelId = 'panel1';
        panel2El.style.display = 'none';
        panelDivider.style.display = 'none';
        panel1El.style.flex = '1';
        toggleDualBtn.classList.remove('active');
        panel1Path = [];
        panel2Path = [];
        panelBody1.innerHTML = '<div class="empty-state"><span>📭 暂无内容</span></div>';
        panelBody2.innerHTML = '';
        panel1Title.textContent = '📂 工作区 1';
        panel2Title.textContent = '📂 工作区 2';
        showToast('缓存已清除');
    }

    clearCacheBtn.addEventListener('click', clearAllCache);

    function setupDropTargets() {
        [panelBody1, panelBody2].forEach(body => {
            body.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; body.classList.add('drag-over'); });
            body.addEventListener('dragleave', () => body.classList.remove('drag-over'));
            body.addEventListener('drop', async (e) => {
                e.preventDefault(); body.classList.remove('drag-over');
                const workspaceId = e.dataTransfer.getData('text/plain');
                if (!workspaceId) return;
                const isP1 = body === panelBody1;
                const targetBody = isP1 ? panelBody1 : panelBody2;
                const targetPathVar = isP1 ? 'panel1Path' : 'panel2Path';
                const targetTitle = isP1 ? panel1Title : panel2Title;
                const ws = workspaceId === '__all__' ? { title: '全部' } : workspaceFolders.find(f => f.id === workspaceId);
                if (!ws) return;
                await loadWorkspaceIntoPanel(workspaceId, targetBody, targetPathVar, targetTitle, ws.title);
                setActivePanel(isP1 ? 'panel1' : 'panel2');
            });
        });
    }

    function bindEvents() {
        let debounce;
        searchInput.addEventListener('input', () => {
            const val = searchInput.value.trim();
            searchClear.classList.toggle('visible', val.length > 0);
            clearTimeout(debounce);
            if (!val) { exitSearchMode(); return; }
            debounce = setTimeout(() => performSearch(val), 200);
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { clearTimeout(debounce); performSearch(searchInput.value.trim()); }
            if (e.key === 'Escape') { exitSearchMode(); searchInput.blur(); }
        });
        searchClear.addEventListener('click', () => { exitSearchMode(); searchInput.focus(); });
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault(); searchInput.focus(); searchInput.select();
            }
        });
    }

    async function init() {
        initTheme();
        initScales();
        panel2El.style.display = 'none';
        panelDivider.style.display = 'none';
        panel1El.style.flex = '1';
        document.documentElement.style.setProperty('--panel-wrap', 'wrap');
        setActivePanel('panel1');

        panelBody1.innerHTML = '<div class="empty-state"><span>⏳ 加载书签中...</span></div>';
        panelBody2.innerHTML = '';

        try {
            const tree = await chrome.bookmarks.getTree();
            bookmarkTreeRoot = tree[0];
            bookmarksBarNode = findBookmarksBar(bookmarkTreeRoot);
            if (!bookmarksBarNode) {
                panelBody1.innerHTML = '<div class="empty-state"><span>❌ 未找到书签栏</span></div>';
                return;
            }
            workspaceFolders = (bookmarksBarNode.children || []).filter(c => !c.url && c.children);
            allBookmarksFlat = [];
            flattenBookmarks(bookmarkTreeRoot, [], allBookmarksFlat);
            renderFilterButtons();
            setupDropTargets();

            const hasSaved = localStorage.getItem('workspace_panel1Path');
            if (hasSaved) {
                restoreState();
            } else {
                // 默认无内容，只显示空状态
                panelBody1.innerHTML = '<div class="empty-state"><span>📭 暂无内容</span></div>';
            }
            bindEvents();
        } catch (e) {
            console.error(e);
            panelBody1.innerHTML = '<div class="empty-state"><span>❌ 加载失败</span></div>';
        }
    }

    init();
})();
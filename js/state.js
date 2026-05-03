// ========== 版本号设置（动态读取 manifest） ==========
(function setVersion() {
    try {
        const manifest = chrome.runtime.getManifest();
        document.getElementById('appVersion').textContent = 'v' + manifest.version;
    } catch (e) {
            document.getElementById('appVersion').textContent = 'v2.5';
    }
})();

// ========== 全局状态变量 ==========
var bookmarkTreeRoot, bookmarksBarNode, workspaceFolders = [];
var isSearchMode = false, allBookmarksFlat = [];
var dualMode = false;
var panel1Path = [], panel2Path = [];
var activePanelId = 'panel1';
var panelScales = { panel1: 1, panel2: 1 };
var MIN_SCALE = 0.6, MAX_SCALE = 1.8, STEP = 0.1;

// ========== DOM 引用（由 initDOM() 初始化） ==========
var searchInput, searchClear, filterArea, toastEl, themeSwitcher, toggleDualBtn;
var panel1El, panel2El, panelDivider, panelBody1, panelBody2, panel1Title, panel2Title;
var clearPanel1Btn, clearPanel2Btn, toolbar, dragHint, clearCacheBtn;

function initDOM() {
    searchInput = document.getElementById('searchInput');
    searchClear = document.getElementById('searchClear');
    filterArea = document.getElementById('filterArea');
    toastEl = document.getElementById('toast');
    themeSwitcher = document.getElementById('themeSwitcher');
    toggleDualBtn = document.getElementById('toggleDualBtn');
    panel1El = document.getElementById('panel1');
    panel2El = document.getElementById('panel2');
    panelDivider = document.getElementById('panelDivider');
    panelBody1 = document.getElementById('panelBody1');
    panelBody2 = document.getElementById('panelBody2');
    panel1Title = document.getElementById('panel1Title');
    panel2Title = document.getElementById('panel2Title');
    clearPanel1Btn = document.getElementById('clearPanel1Btn');
    clearPanel2Btn = document.getElementById('clearPanel2Btn');
    toolbar = document.getElementById('toolbar');
    dragHint = toolbar ? toolbar.querySelector('.drag-hint') : null;
    clearCacheBtn = document.getElementById('clearCacheBtn');
}
try {
    const manifest = chrome.runtime.getManifest();
    document.getElementById('aboutVersion').textContent = 'v' + manifest.version;
} catch (e) {
    document.getElementById('aboutVersion').textContent = 'v2.7';
}

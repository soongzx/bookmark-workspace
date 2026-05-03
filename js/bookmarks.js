// ========== 书签栏识别与扁平化 ==========
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
# AGENTS.md

## Project Type

Chrome Extension (Manifest V3), plain vanilla JS/CSS. No build step, no package manager, no tests.

## Key Files

- `manifest.json` — extension config, version 2.3
- `background.js` — service worker; on icon click opens `popup.html` in a new tab
- `popup.html` — main UI, loads CSS then JS in strict order
- `js/controller.js` — main logic, event binding, initialization

## Script Load Order (do not change)

`utils.js` → `bookmarks.js` → `state.js` → `ui.js` → `controller.js`

All use `var` (no modules/Bundler). `state.js` declares globals, `controller.js` consumes them.

## CSS Load Order

`base.css` → `layout.css` → `components.css`

## State Persistence

All state stored in `localStorage` with keys prefixed `workspace_`:
- `workspace_theme` — one of: `dark-gold`, `dark-crimson`, `ocean-blue`, `warm-light`
- `workspace_panel1Path` / `workspace_panel2Path` — JSON arrays of bookmark node paths
- `workspace_panel1Scale` / `workspace_panel2Scale` — float (0.6–1.8)
- `workspace_activePanel` — `"panel1"` or `"panel2"`

Clear button removes all of these.

## How to Develop / Test

1. Edit files in place
2. Open `chrome://extensions`, find the extension, click the reload icon
3. Click the extension toolbar icon to open the popup in a new tab

No dev server, no hot reload. Icons (`icons/icon*.png`) must exist to load the extension.

## Conventions

- All JS files use plain `function` declarations, no ES modules
- Comments and UI text are in Chinese (zh-CN)
- `popup.html` has `lang="zh-CN"`

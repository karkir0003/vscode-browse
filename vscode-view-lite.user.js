// ==UserScript==
// @name         GitHub VSCode View Lite
// @namespace    https://github.com/karkir0003/vscode-browse
// @author       karkir0003
// @version      0.1
// @description  Intercept GitHub file clicks and show inline VSCode-style viewer
// @match        https://github.com/*/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/karkir0003/vscode-browse/main/vscode-view-lite.user.js
// @downloadURL  https://raw.githubusercontent.com/karkir0003/vscode-browse/main/vscode-view-lite.user.js
// ==/UserScript==

(function () {
  'use strict';

  console.log('[gh-vscode-view-lite] script running...');

  // Create editor panel
  const editor = document.createElement('div');
  editor.id = 'gh-vscode-editor';
  editor.style.cssText = `
    position: fixed;
    top: 0;
    left: 250px;
    width: calc(100% - 250px);
    height: 100%;
    background: #1e1e1e;
    color: #ccc;
    font-family: monospace;
    overflow: auto;
    z-index: 9999;
    padding: 20px;
    display: none;
  `;
  document.body.appendChild(editor);

  // Observe sidebar file tree
  const observer = new MutationObserver(() => {
    const links = document.querySelectorAll('a.js-navigation-open');
    links.forEach(link => {
      if (link.getAttribute('data-gh-vscode-bound')) return;
      link.setAttribute('data-gh-vscode-bound', 'true');

      if (link.href.includes('/blob/')) {
        link.addEventListener('click', async (e) => {
          e.preventDefault();
          const fileUrl = link.href;
          console.log('[gh-vscode] loading file:', fileUrl);

          const res = await fetch(fileUrl);
          const text = await res.text();
          const doc = new DOMParser().parseFromString(text, 'text/html');
          const code = doc.querySelector('table.highlight');

          if (code) {
            editor.innerHTML = `<div style="color: #fff; margin-bottom: 10px;">📄 ${link.textContent}</div>`;
            editor.appendChild(code.cloneNode(true));
            editor.style.display = 'block';
          } else {
            editor.innerHTML = `<div style="color: red;">Failed to load file content.</div>`;
            editor.style.display = 'block';
          }
        });
      }
    });
  });

  const sidebar = document.querySelector('[data-target="tree-finder.files"]') || document.body;
  observer.observe(sidebar, { childList: true, subtree: true });

})();

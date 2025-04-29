// ==UserScript==
// @name         GitHub VSCode Browse
// @namespace    https://github.com/karkir0003/vscode-browse
// @version      0.2
// @description  Adds a VSCode-style file explorer sidebar to GitHub repos
// @author       karkir0003
// @match        https://github.com/*/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/karkir0003/vscode-browse/main/vscode-browse.user.js
// @downloadURL  https://raw.githubusercontent.com/karkir0003/vscode-browse/main/vscode-browse.user.js
// ==/UserScript==

(function () {
  'use strict';
  console.log('[gh-vscode] script loaded');
  const waitForElement = (selector, timeout = 5000) =>
    new Promise((resolve, reject) => {
      const start = Date.now();
      const interval = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(interval);
          resolve(el);
        } else if (Date.now() - start > timeout) {
          clearInterval(interval);
          reject(`Timeout waiting for ${selector}`);
        }
      }, 100);
    });

  async function initSidebar() {
    if (document.querySelector('#vscode-sidebar')) return;

    // Add the sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = 'vscode-sidebar';
    sidebar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 250px;
      background: #1e1e1e;
      color: #ccc;
      overflow: auto;
      z-index: 9999;
      font-family: monospace;
      padding: 10px;
    `;
    document.body.appendChild(sidebar);

    document.body.style.marginLeft = '250px';

    const fileTree = document.createElement('ul');
    fileTree.style.listStyle = 'none';
    fileTree.style.paddingLeft = '0';
    sidebar.appendChild(fileTree);

    // Get current repo context
    const [_, user, repo] = location.pathname.split('/');
    const branchSelector = await waitForElement('summary[title="Switch branches or tags"]');
    const branch = branchSelector.innerText.trim();

    // Load root folder contents
    loadFolderContents(`/${user}/${repo}/tree/${branch}`, fileTree);
  }

  async function loadFolderContents(path, container) {
    const res = await fetch(path);
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');

    const items = doc.querySelectorAll('.js-navigation-container .Box-row');

    for (const item of items) {
      const link = item.querySelector('a.js-navigation-open');
      const type = item.querySelector('svg[aria-label="Directory"]') ? 'folder' : 'file';
      const name = link?.textContent.trim();
      const href = link?.getAttribute('href');

      if (!name || !href) continue;

      const li = document.createElement('li');
      li.textContent = (type === 'folder' ? '📁 ' : '📄 ') + name;
      li.style.cursor = 'pointer';
      li.style.paddingLeft = '10px';

      if (type === 'folder') {
        li.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (li.loaded) {
            li.children[1]?.classList.toggle('hidden');
            return;
          }
          const nestedUl = document.createElement('ul');
          nestedUl.style.listStyle = 'none';
          nestedUl.style.paddingLeft = '10px';
          li.appendChild(nestedUl);
          li.loaded = true;
          await loadFolderContents(href, nestedUl);
        });
      }

      container.appendChild(li);
    }
  }

  // Run when GitHub page loads
  window.addEventListener('DOMContentLoaded', initSidebar);
})();

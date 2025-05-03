// ==UserScript==
// @name         GitHub VSCode View Lite
// @namespace    https://github.com/karkir0003/vscode-browse
// @author       karkir0003
// @version      0.16
// @description  Intercept GitHub file clicks and show inline VSCode-style viewer
// @match        https://github.com/*/*/blob/*
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
    font-size: 14px;
    white-space: pre-wrap; /* Keep whitespace and newlines */
    border-right: 2px solid #ccc;
  `;
  document.body.appendChild(editor);
  const base_url=  'https://raw.githubusercontent.com'
  // Observe sidebar file tree
  const observer = new MutationObserver(() => {
    const file_container = document.querySelector('[aria-label="File Tree Navigation"]')
    const files = file_container.querySelector('[aria-label="Files"]')
    console.log("File Tree Container ", file_container);
    console.log("File Tree ", files);

    document.querySelector('ul[role="tree"]').addEventListener('click', (e) => {
      const item = e.target.closest('li[role="treeitem"]');
      if (!item) return;
    
      const isFile = item.querySelector('.octicon-file');
      const isFolder = item.querySelector('.octicon-file-directory-fill');
    
      if (isFile && !isFolder) {
        let str = item.id
        const page_path = window.location.pathname;
        console.log("page_path: ", base_url.concat("", page_path));



      }
    });

    // link_list.forEach(link => {
    //   console.log("iterating over link: ", link);
    //   if (link.getAttribute('data-gh-vscode-bound')) return;
    //   link.setAttribute('data-gh-vscode-bound', 'true');

    //   // if (link.href.includes('/blob/')) {
        // link.addEventListener('click', async (e) => {

    //   //     e.preventDefault();

    //   //     // Convert GitHub blob URL to raw file URL
    //   //     const rawUrl = link.href.replace('/blob/', '/raw/'); 
    //   //     console.log('[gh-vscode] loading raw file:', rawUrl);

    //   //     try {
    //   //       const res = await fetch(rawUrl);
    //   //       const text = await res.text();

    //   //       // Display the file content
    //   //       editor.innerHTML = `
    //   //         <div style="color: #fff; margin-bottom: 10px;">📄 ${link.textContent}</div>
    //   //         <pre style="white-space: pre-wrap; word-wrap: break-word;">${text}</pre>
    //   //       `;
    //   //       editor.style.display = 'block';
    //   //     } catch (error) {
    //   //       console.error('[gh-vscode] Error loading file:', error);
    //   //       editor.innerHTML = `<div style="color: red;">Error fetching file content.</div>`;
    //   //       editor.style.display = 'block';
    //   //     }
        // });
      // }
    //  });
  });

  const fileObserver = new MutationObserver(() => {

  });

  const sidebar = document.querySelector('[data-target="tree-finder.files"]') || document.body;
  const files = document.querySelector('[aria-label="Files"]')
  observer.observe(sidebar, { childList: true, subtree: true });
  // fileObserver.observe()
})();

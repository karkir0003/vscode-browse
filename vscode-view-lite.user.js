// ==UserScript==
// @name         GitHub VSCode View Lite
// @namespace    https://github.com/karkir0003/vscode-browse
// @author       karkir0003
// @version      0.62
// @description  Intercept GitHub file clicks and show inline VSCode-style viewer
// @match        https://github.com/*/*/blob/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/karkir0003/vscode-browse/main/vscode-view-lite.user.js
// @downloadURL  https://raw.githubusercontent.com/karkir0003/vscode-browse/main/vscode-view-lite.user.js
// ==/UserScript==

(function () {
  'use strict';



  function getTextArea(raw_text) {
    const textarea = document.createElement("textarea");

    textarea.id = "read-only-cursor-text-area";
    textarea.setAttribute("data-testid", "read-only-cursor-text-area");
    textarea.setAttribute("aria-label", "file content");
    textarea.setAttribute("aria-readonly", "true");
    textarea.setAttribute("inputmode", "none");
    textarea.setAttribute("tabindex", "0");
    textarea.setAttribute("aria-multiline", "true");
    textarea.setAttribute("aria-haspopup", "false");
    textarea.setAttribute("data-gramm", "false");
    textarea.setAttribute("data-gramm_editor", "false");
    textarea.setAttribute("data-enable-grammarly", "false");
    textarea.setAttribute("spellcheck", "false");
    textarea.setAttribute("autocorrect", "off");
    textarea.setAttribute("autocapitalize", "off");
    textarea.setAttribute("autocomplete", "off");
    textarea.setAttribute("data-ms-editor", "false");
    textarea.className = "react-blob-textarea react-blob-print-hide";

    textarea.style.resize = "none";
    textarea.style.marginTop = "-2px";
    textarea.style.paddingLeft = "92px";
    textarea.style.paddingRight = "70px";
    textarea.style.width = "100%";
    textarea.style.backgroundColor = "unset";
    textarea.style.boxSizing = "border-box";
    textarea.style.color = "transparent";
    textarea.style.position = "absolute";
    textarea.style.border = "none";
    textarea.style.tabSize = "8";
    textarea.style.outline = "none";
    textarea.style.overflow = "auto hidden";
    textarea.style.height = "2220px";
    textarea.style.fontSize = "12px";
    textarea.style.lineHeight = "20px";
    textarea.style.overflowWrap = "normal";
    textarea.style.overscrollBehaviorX = "none";
    textarea.style.whiteSpace = "pre";
    textarea.style.zIndex = "1";

    // Inject raw text
    textarea.value = raw_text;

    // Append to DOM
    return textarea
  }
  

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
  const base_url=  'https://raw.githubusercontent.com';

  // Escape HTML to show raw safely
  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
  }

  // Observe sidebar file tree
  const observer = new MutationObserver(() => {
    const file_container = document.querySelector('[aria-label="File Tree Navigation"]');
    const files = file_container.querySelector('[aria-label="Files"]');

    document.querySelector('ul[role="tree"]').addEventListener('click', async (e) => {
      const item = e.target.closest('li[role="treeitem"]');
      if (!item) return;
    
      const isFile = item.querySelector('.octicon-file');
      const isFolder = item.querySelector('[class*="octicon-file-directory"]');
      console.log('is file: ', isFile);
      console.log('is folder: ', isFolder);

      if (isFolder !== null) return;

      // stitch the raw github user content url
      const page_path = window.location.pathname;
      const raw_page_path = page_path.replace('/blob/', '/refs/heads/');
      const raw_url = base_url.concat("", raw_page_path);
      console.log("page_path: ", raw_url);

      //get the raw file data from the raw url
      const raw_text = await fetch(raw_url).then((response) => response.text());
      const new_text_area = getTextArea(raw_text);

      const section = document.querySelector('[aria-labelledby^="file-name-id-wide"]');
      if (!section) {
        console.log('here');
      }

      const section_clone = section.cloneNode(true);
      console.log('section_clone', section_clone);

      const section_parent = section_clone.parentNode();
      section_parent.appendChild(section_clone);
      // // get text container children copy and append to text_parent
      // const text_parent = document.querySelector('#copilot-button-positioner');
      // const button_container = text_parent.querySelector('#copilot-button-container');

      // const text_box_children = text_parent.children[0];
      // const new_text_box = text_box_children.cloneNode(true);

      // console.log("text_parent_children", text_parent.children);
      // console.log("text_box_children", text_box_children);

      // // horizontal display test
      // text_parent.style.display = 'flex';

      // text_parent.insertBefore(new_text_box, button_container);
      // //@todo: test without const 
      // const firstTwoChildren = Array.from(text_parent.children).slice(0, 2);

      // firstTwoChildren.forEach(child => {
      //   child.style.overflow = 'scroll';
      //   console.log("child", child)
      // });


      // Replace the children with the first two and the button container
      // text_parent.replaceChildren(...firstTwoChildren, button_container);

    });

  });
  // file-name-id-wide
  const sidebar = document.querySelector('[data-target="tree-finder.files"]') || document.body;
  const files = document.querySelector('[aria-label="Files"]');
  observer.observe(sidebar, { childList: true, subtree: true });
})();

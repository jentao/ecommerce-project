/*
 * Jennifer Tao
 * 12 03 2021
 * Section AE, Tim Mandzyuk, Nikola Bojanic
 *
 * This is the JS to implement the UI for my data structures.
 * It implements the push, pop, and peek functions for stack and queue.
 */
"use strict";
(function() {

  window.addEventListener("load", init);

  /**
   * sets up necessary functionality when page loads
   */
  function init() {
    toggleButton();
  }

  /**
   * Toggle btn
   */
  function toggleButton() {
    let btn = id("buy-btn");
    if (Math.random() < 0.5) {
      btn.disabled = false;
      btn.textContent = "Buy";
    } else {
      btn.disabled = true;
      btn.textContent = "Currently Unavailable";
    }
  }

  /** ------------------------------ Helper Functions  ------------------------------ */
  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

})();

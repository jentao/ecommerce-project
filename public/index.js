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
    showHome();
    id("home-btn").addEventListener("click", showHome);
    let cards = qsa(".product");
    for (let i = 0; i < cards.length; i++) {
      cards[i].addEventListener("click", showItem);
    }
  }

  /**
   * show home page
   */
  function showHome() {
    id("products").classList.remove("hidden");
    id("itemview").classList.add("hidden");
  }

  /**
   * show item page
   */
  function showItem() {
    id("products").classList.add("hidden");
    id("itemview").classList.remove("hidden");
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

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} selector - CSS query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();

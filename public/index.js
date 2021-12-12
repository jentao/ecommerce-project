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
    id("orders-btn").addEventListener("click", showOrders);
    id("login-btn").addEventListener("click", showLogin);
    id("home-btn").addEventListener("click", showHome);
    let cards = qsa(".product");
    for (let i = 0; i < cards.length; i++) {
      cards[i].addEventListener("click", showItem);
    }
    initForms();

  }

  /**
   * initial forms to register and login
   */
  function initForms() {
    const newuser = "/darksouls/newuser";
    const loginuser = "/darksouls/login";
    qs("#login-form").addEventListener("submit", function(event) {
      event.preventDefault();
      let params = new FormData(this);
      postRequest(loginuser, params, login, false);
    });
    qs("#newuser-form").addEventListener("submit", function(event) {
      event.preventDefault();
      let params = new FormData(this);
      postRequest(newuser, params, login, false);
    });
  }

  /**
   * update the website with the user's information
   */
  function login() {
    const switchTime = 2000;
    checkUser();
    setTimeout(showHome, switchTime);
  }

  /**
   * checks if user is loged in, and initialize navbar accordingly
   */
  function checkUser() {
    let sid = idFromCookie();
    if (sid) {
      id("orders-btn").classList.remove("hidden");
      id("logout-btn").classList.remove("hidden");
      id("login-btn").classList.add("hidden");
    } else {
      id("orders-btn").classList.add("hidden");
      id("logout-btn").classList.add("hidden");
      id("login-btn").classList.remove("hidden");
    }
  }

  /**
   * show home page
   */
  function showHome() {
    checkUser();
    getRequest("/darksouls/items", populateProducts);
    qs(".home").classList.remove("hidden");
    qs(".itemview").classList.add("hidden");
    qs(".login-view").classList.add("hidden");
    qs(".confirm-view").classList.add("hidden");
    qs(".order-view").classList.add("hidden");
    qs(".error-view").classList.add("hidden");
  }

  /**
   * Populate home page with all items
   * @param {object} data result data of fetching all Items
   */
  function populateProducts(data) {
    let container = qs(".products");
    container.innerHTML = "";
    container.classList.remove("list");
    container.classList.add("grid");
    for (let i = 0; i < data.length; i++) {
      container.appendChild(buildProduct(data[i]));
    }
  }

  /**
   * Returns the DOM container that represents a product card based on the given information
   * @param {object} item the object that contains all the informaion about a product
   * @returns {object} - a DOM <article> object that represents a product card
   */
  function buildProduct(item) {
    let container = gen("article");
    container.classList.add("product");
    container.id = item.itemid;
    if (item.capacity === 0) {
      container.classList.add("out-of-stock");
    } else {
      container.classList.add("in-stock");
    }

    let img = gen("img");
    img.src = "https://static.wikia.nocookie.net/darksouls/images/9/99/Divine_Blessing_%28DSIII%29.png/revision/latest?cb=20160613233850";
    img.alt = item.itemName;
    img.classList.add("productimg");
    container.appendChild(img);

    let body = gen("div");
    body.classList.add("item-info");
    let name = gen("h3");
    name.textContent = item.itemName;
    let price = gen("p");
    price.textContent = item.price + " souls";
    price.classList.add("price");
    let desc = gen("p");
    desc.textContent = item.lore;
    desc.classList.add("item-desc");
    body.appendChild(name);
    body.appendChild(price);
    body.appendChild(desc);
    container.appendChild(body);
    return container;
  }

  /**
   * show login page
   */
  function showLogin() {
    checkUser();
    qs(".home").classList.add("hidden");
    qs(".itemview").classList.add("hidden");
    qs(".login-view").classList.remove("hidden");
    qs(".confirm-view").classList.add("hidden");
    qs(".order-view").classList.add("hidden");
    qs(".error-view").classList.add("hidden");
  }

  /**
   * show login page
   */
  function showOrders() {
    checkUser();
    qs(".home").classList.add("hidden");
    qs(".itemview").classList.add("hidden");
    qs(".login-view").classList.add("hidden");
    qs(".confirm-view").classList.add("hidden");
    qs(".order-view").classList.remove("hidden");
    qs(".error-view").classList.add("hidden");
  }

  /**
   * show confirm page
   */
  function showConfirm() {
    checkUser();
    qs(".home").classList.add("hidden");
    qs(".itemview").classList.add("hidden");
    qs(".login-view").classList.add("hidden");
    qs(".confirm-view").classList.remove("hidden");
    qs(".order-view").classList.add("hidden");
    qs(".error-view").classList.add("hidden");
  }

  /**
   * show item page
   */
  function showItem() {
    checkUser();
    toggleButton();
    qs(".login-view").classList.add("hidden");
    qs(".home").classList.add("hidden");
    qs(".itemview").classList.remove("hidden");
    qs(".confirm-view").classList.add("hidden");
    qs(".order-view").classList.add("hidden");
    qs(".error-view").classList.add("hidden");
  }

  /**
   * show error page
   * @param {string} error error message
   */
  function showError(error) {
    checkUser();
    qs(".login-view").classList.add("hidden");
    qs(".home").classList.add("hidden");
    qs(".itemview").classList.add("hidden");
    qs(".confirm-view").classList.add("hidden");
    qs(".order-view").classList.add("hidden");
    qs(".error-view").classList.remove("hidden");
    id("error").textContent = error;
  }

  /**
   * Toggle item purchase button
   */
  function toggleButton() {
    let btn = id("buy-btn");
    if (Math.random() < 1) {
      btn.disabled = false;
      btn.textContent = "Purchase";
      btn.addEventListener("click", showConfirm);
    } else {
      btn.disabled = true;
      btn.textContent = "Currently Unavailable";
    }
  }

  /**
   * Helper function that extracts sessionid from the cookie
   * @returns {int} sessionid
   */
  function idFromCookie() {
    let list = document.cookie
      .split('; ')
      .find(row => row.startsWith('sessionid'));

    return list ? list.split('=')[1] : list;
  }

  /**
   * helper function used to POST data from the given url
   * @param {string} url the url to fatch data from
   * @param {object} params the parameters for the POST request
   * @param {function} processData the function that processes fetched data
   * @param {boolean} isJson true if the fetched data is Json, false otherwise
   */
  function postRequest(url, params, processData, isJson) {
    fetch(url, {method: "POST", body: params})
      .then(statusCheck)
      .then(resp => isJson ? resp.json() : resp.text())
      .then(processData)
      .catch(handleError);
  }

  /**
   * fatch data with GET from the given url and process the result data
   * @param {string} url the url to fatch data from
   * @param {object} process the function that processes data
   */
  function getRequest(url, process) {
    fetch(url)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(process)
      .catch(handleError);
  }

  /**
   * checks if the given promise is rejected
   * @param {promise} response the promise to check
   * @returns {promise} a promise that is not rejected
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response;
  }

  /**
   * displays an error message based on the input error
   * @param {string} error the eror text to be displayed
   */
  function handleError(error) {
    showError(error);
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

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
    id("logout-btn").addEventListener("click", logout);
    id("home-btn").addEventListener("click", showHome);
    initForms();
    id("switch").addEventListener("click", toggleView);
    id("filter-type").addEventListener("change", filterItems);
    id("search-btn").addEventListener("click", search);
  }

  /**
   * Filter the Itemss on the homepage based on the input from search bar
   */
  function search() {
    let tvalue = id("search-mode").value;
    let keyword = id("search-term").value.trim();
    let url = "/darksouls/items/?" + tvalue + "=" + keyword;
    id("search-term").value = "";
    getRequest(url, populateProducts);
  }

  /**
   * Filters the home page items based on their stock status
   */
  function filterItems() {
    let fvalue = id("filter-type").value;
    let hitems = [];
    let items = [];
    let items2 = [];
    if (fvalue === "outofstock") {
      hitems = qsa(".in-stock");
      items = qsa(".out-of-stock");
    } else if (fvalue === "instock") {
      items = qsa(".in-stock");
      hitems = qsa(".out-of-stock");
    } else {
      items = qsa(".in-stock");
      items2 = qsa(".out-of-stock");
    }
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove("hidden");
    }
    for (let i = 0; i < items2.length; i++) {
      items2[i].classList.remove("hidden");
    }
    for (let i = 0; i < hitems.length; i++) {
      hitems[i].classList.add("hidden");
    }
  }

  /**
   * Toggles between grid and list view for home page
   */
  function toggleView() {
    let isList = id("switch").checked;
    if (!isList) {
      qs(".products").classList.remove("list");
      qs(".products").classList.add("grid");
    } else {
      qs(".products").classList.add("list");
      qs(".products").classList.remove("grid");
    }
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
      postRequest(newuser, params, () => register(params), false);
    });
  }

  /**
   * update the website with the user's information
   */
  function login() {
    showHome();
  }

  /**
   * register the user and login
   * @param {object} params user's register data
   */
  function register(params) {
    const loginuser = "/darksouls/login";
    postRequest(loginuser, params, login, false);
  }

  /**
   * update the website with the user's information
   */
  function logout() {
    let logouturl = "/darksouls/logout";
    postRequest(logouturl, null, () => {
      showHome();
    }, false);
  }

  /**
   * checks if user is loged in, and update navbar accordingly
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
    container.classList.add(item.capacity === 0 ? "out-of-stock" : "in-stock");
    container.addEventListener("click", () => showItem(item.itemid));

    let img = gen("img");
    img.src = item.imagePath;
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
   * update the order page with corresponding orders of a user
   * @param {array} orders a list of orders
   */
  function buildOrders(orders) {
    id("orders").innerHTML = "";
    for (let i = 0; i < orders.length; i++) {
      id("orders").appendChild(buildOrder(orders[i]));
    }
  }

  /**
   * Returns the DOM container that represents an order card based on the given information
   * @param {object} order the object that contains all the informaion about an order
   * @returns {object} - a DOM <article> object that represents a product card
   */
  function buildOrder(order) {
    let url = "/darksouls/item/" + order.itemid;
    let container = gen("div");
    container.classList.add("order");

    let img = gen("img");
    img.classList.add("item-img");
    container.appendChild(img);

    let body = gen("div");
    body.classList.add("order-info");
    let name = gen("p");
    let price = gen("p");
    price.classList.add("price");
    let time = gen("p");
    time.classList.add("time");
    time.textContent = (new Date(order.orderDate)).toLocaleString();
    body.appendChild(name);
    body.appendChild(price);
    body.appendChild(time);
    container.appendChild(body);
    getRequest(url, (data) => buildOrderItem(data, container));

    if (order.rated === 0) {
      buildReviewForm(order, container);
    }
    return container;
  }

  /**
   * builds the review form for an order
   * @param {object} order contains all the informaion about an order
   * @param {object} container the DOM object to modify
   */
  function buildReviewForm(order, container) {
    let form = gen("form");
    form.classList.add("review-form");
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      submitReview(order, new FormData(this));
    });

    let nlabel = gen("label");
    nlabel.for = "num-review";
    nlabel.textContent = "Rate this item";
    let numInput = gen("input");
    numInput.required = true;
    numInput.type = "number";
    numInput.id = "num-review";
    numInput.name = "stars";
    numInput.min = "1";
    numInput.max = "5";

    let comment = gen("textarea");
    comment.name = "comment";
    comment.rows = "5";
    comment.cols = "30";

    let btn = gen("button");
    btn.textContent = "Submit";
    form.appendChild(nlabel);
    form.appendChild(numInput);
    form.appendChild(comment);
    form.appendChild(comment);
    form.appendChild(btn);
    container.appendChild(form);
  }

  /**
   * submits a review
   * @param {object} order contains all the informaion about an order
   * @param {object} formdata data from the review form
   */
  function submitReview(order, formdata) {
    let url = "/darksouls/rate";
    formdata.set("itemid", order.itemid);
    formdata.set("orderid", order.orderid);
    postRequest(url, formdata, showOrders, false);
  }

  /**
   * Modifies the DOM container that represents the order with item information
   * @param {object} item the object that contains all the informaion about an order
   * @param {object} container the DOM object to modify
   */
  function buildOrderItem(item, container) {
    let img = container.querySelector(".item-img");
    img.src = item.imagePath;
    img.alt = item.itemName;

    let name = container.querySelector("p");
    name.textContent = item.itemName;
    let price = container.querySelector(".price");
    price.textContent = item.price + " souls";
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
    let url = "/darksouls/history";
    postRequest(url, null, buildOrders, true);
  }

  /**
   * show confirm page
   * @param {string} num confirm num of an order
   */
  function showConfirm(num) {
    checkUser();
    qs(".home").classList.add("hidden");
    qs(".itemview").classList.add("hidden");
    qs(".login-view").classList.add("hidden");
    qs(".confirm-view").classList.remove("hidden");
    qs(".order-view").classList.add("hidden");
    qs(".error-view").classList.add("hidden");
    let wrapper = qs(".confirm-view b");
    wrapper.textContent = num;
  }

  /**
   * show item page with gien item id
   * @param {string} iid of the item to display
   */
  function showItem(iid) {
    checkUser();
    qs(".login-view").classList.add("hidden");
    qs(".home").classList.add("hidden");
    qs(".itemview").classList.remove("hidden");
    qs(".confirm-view").classList.add("hidden");
    qs(".order-view").classList.add("hidden");
    qs(".error-view").classList.add("hidden");
    let itemurl = "/darksouls/item/" + iid;
    let reviewurl = "/darksouls/ratings/" + iid;
    getRequest(itemurl, buildItem);
    getRequest(reviewurl, buildReviews);
  }

  /**
   * builds the item page for an item
   * @param {object} data contains all the informaion about an item
   */
  function buildItem(data) {
    let container = qs(".iteminfo");
    let img = qs(".iteminfo img");
    img.src = data.imagePath;

    let body = qs(".iteminfo section");
    let name = body.querySelector(".item-name");
    name.textContent = data.itemName;

    let type = body.querySelector(".item-type");
    type.textContent = data.itemType;

    let price = body.querySelector(".item-price span");
    price.textContent = data.price + " souls";

    let desc = body.querySelector(".item-desc");
    desc.textContent = data.lore;

    // reference https://stackoverflow.com/questions/9251837/how-to-remove-all-listeners-in-an-element
    let oldBtn = id("buy-btn");
    let newBtn = oldBtn.cloneNode(true);
    newBtn.disabled = (data.capacity === 0);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    toggleButton(data.capacity !== 0, data.itemid);
    container.appendChild(body);
  }

  /**
   * builds the review section for an item
   * @param {object} data contains all the informaion about an item
   */
  function buildReviews(data) {
    let container = qs(".iteminfo .rating");
    buildRating(data.avg["avg(stars)"], container);
    let reviews = id("review-list");
    reviews.innerHTML = "";
    for (let i = 0; i < data.ratings.length; i++) {
      reviews.appendChild(buildReview(data.ratings[i]));
    }
  }

  /**
   * builds one review card for an item
   * @param {object} data contains all the review information for one review
   * @returns {object} the DOM object that represents one review card
   */
  function buildReview(data) {
    let container = gen("div");
    container.classList.add("review");
    let name = gen("p");
    name.classList.add("username");
    name.textContent = data.username;
    let rating = gen("p");
    rating.classList.add("user-rating");
    rating.textContent = data.stars;
    let time = gen("p");
    time.classList.add("time");
    time.textContent = (new Date(data.ratingDate)).toLocaleString();
    let comment = gen("p");
    comment.classList.add("comment");
    comment.textContent = data.comment;
    container.appendChild(name);
    container.appendChild(rating);
    container.appendChild(time);
    container.appendChild(comment);
    return container;
  }

  /**
   * updates the average rating section for an item
   * @param {float} rating the avg rating
   * @param {object} container the container to populate
   */
  function buildRating(rating, container) {
    const max = 5;
    rating = rating ? rating : max;
    container.innerHTML = "";
    let stars = gen("p");
    stars.classList.add("rating-num");
    stars.textContent = "Price: ";
    let num = gen("b");
    num.textContent = rating;
    stars.appendChild(num);
    container.appendChild(stars);

    const tokenWidtth = 32;
    let token = gen("div");
    token.classList.add("token");
    let i = 1;
    while (i <= rating) {
      let tokenCopy = token.cloneNode(true);
      container.appendChild(tokenCopy);
      i += 1;
    }
    if (rating - i + 1 > 0) {
      let tokenCopy = token.cloneNode(true);
      tokenCopy.style.width = tokenWidtth * (rating - i + 1) + "px";
      container.appendChild(tokenCopy);
    }
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
   * Toggle item purchase button based on stock status
   * @param {boolean} inStock true is in stock, false otherwise
   * @param {string} iid tid of the item
   */
  function toggleButton(inStock, iid) {
    let btn = id("buy-btn");
    if (inStock) {
      btn.disabled = false;
      btn.textContent = "Purchase";
      btn.addEventListener("click", () => confirm(iid));
    } else {
      btn.disabled = true;
      btn.textContent = "Currently Unavailable";
    }
  }

  /**
   * confirm before purchase an item
   * @param {string} iid tid of the item
   */
  function confirm(iid) {
    let btn = id("buy-btn");
    btn.textContent = "Confirm";
    btn.addEventListener("click", () => purchase(iid));
  }

  /**
   * Purchase an item
   * @param {string} iid tid of the item
   */
  function purchase(iid) {
    let url = "/darksouls/buy";
    let data = new FormData();
    data.append("itemid", iid);
    postRequest(url, data, (num) => showConfirm(num), false);
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

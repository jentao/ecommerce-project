/**
 * Jennifer Tao Eric Yu
 * 12 03 2021
 * Section AE, Tim Mandzyuk, Nikola Bojanic
 *
 * This is the JS to implement the Dark Souls Shop API.
 * It implements the end points that retrieves data from database,
 * filters items by type, handles user login requests
 */
'use strict';
const PORT_NUM = 8000;
const CLIENT_ERROR = 400;
const SERVER_ERROR = 500;
const SERVER_ERROR_MSG = "An error occurred on the server. Try again later.";
const COOKIE_EXPIRATION = 10800000;

const express = require("express");
const app = express();

const multer = require("multer");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const types = ['melee', 'ranged', 'consumable', 'miracle', 'pyromancy', 'sorcery'];
const max = 5;

/**
 * Return all item types
 */
app.get('/darksouls/types', function(req, res) {
  res.json(types);
});

/**
 * Get all the items data or items data matching a given search term (name/desc/type)
 */
app.get('/darksouls/items', async function(req, res) {
  let name = req.query.name ? req.query.name : "";
  let desc = req.query.desc ? req.query.desc : "";
  let type = req.query.type ? req.query.type : "";
  if (!(types.includes(type) || type === '')) {
    res.type('text');
    res.status(CLIENT_ERROR).send('Invalid type');
  } else {
    try {
      name = '%' + name + '%';
      desc = '%' + desc + '%';
      type = '%' + type + '%';
      let db = await getDBConnection();
      let qry = 'SELECT * FROM items WHERE itemName LIKE ? ' +
      'AND lore LIKE ? ' +
      'AND itemType LIKE ? ' +
      ' ORDER BY itemid;';
      let items = await db.all(qry, [name, desc, type]);
      await db.close();
      res.json(items);
    } catch (err) {
      res.type('text');
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  }
});

// Logs the user into the webservice, setting a login cookie that expires in 3 hours.
app.post('/darksouls/login', async function(req, res) {
  res.type('text');
  let email = req.body.email;
  let pass = req.body.passcode;
  if (!email || !pass) {
    res.status(CLIENT_ERROR).send('Missing required parameters username and password!');
  } else {
    try {
      if (!(await checkCredentials(email, pass))) {
        res.status(CLIENT_ERROR).send('Invalid credentials.');
      } else {
        let id = await getSessionId();
        await setSessionId(id, email);
        res.cookie('sessionid', id, {expires: new Date(Date.now() + COOKIE_EXPIRATION)});
        res.send('Successfully logged in!');
      }
    } catch (err) {
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  }
});

// Logs a user out by expiring their cookie.
app.post('/darksouls/logout', function(req, res) {
  res.type('text');
  let id = req.cookies['sessionid'];
  if (id) {
    res.clearCookie('sessionid');
    res.send('Successfully logged out!');
  } else {
    res.send('Already logged out.');
  }
});

/**
 * Get information of a specific item
 */
app.get('/darksouls/item/:id', async function(req, res) {
  let id = req.params.id;
  try {
    let db = await getDBConnection();
    let q1 = 'SELECT * FROM items WHERE itemid = ? ;';
    let items = await db.get(q1, [id]);
    await db.close();
    if (items.length === 0) {
      res.type('text');
      res.status(CLIENT_ERROR).send("Yikes. ID does not exist.");
    }
    res.json(items);
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * Process a purchase of an item
 */
app.post("/darksouls/buy", async function(req, res) {
  let sessionid = req.cookies['sessionid'];
  try {
    let db = await getDBConnection();
    let itemid = req.body.itemid;
    let q1 = 'SELECT price, capacity FROM items WHERE itemid = ? ;';
    let item = await db.get(q1, [itemid]);
    let err = await checkBuy(itemid, sessionid, item.capacity);
    if (err !== '') {
      res.status(CLIENT_ERROR).send(err);
    } else {
      let q2 = 'SELECT userid, balance FROM users WHERE sessionid = ? ;';
      let user = await db.get(q2, [sessionid]);
      if (user.balance < item.price) {
        res.type('text');
        res.status(CLIENT_ERROR).send('User does not have enough souls.');
      } else {
        await db.close();
        let oid = await order(itemid, item, user);
        res.type('text');
        res.send(oid);
      }
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(err);
  }
});

/**
 * Get transaction history for the user
 */
app.post("/darksouls/history", async function(req, res) {
  let sessionid = req.cookies['sessionid'];
  if (sessionid) {
    try {
      let db = await getDBConnection();
      let q1 = 'SELECT userid FROM users WHERE sessionid = ? ;';
      let user = await db.get(q1, [sessionid]);
      let q2 = 'SELECT * FROM orders WHERE userid = ? ORDER BY DATETIME(orderdate) DESC;';
      let orders = await db.all(q2, [user.userid]);
      res.json(orders);
    } catch (err) {
      res.type('text');
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  } else {
    res.type('text');
    res.status(CLIENT_ERROR).send("User not logged in.");
  }
});

/**
 * Adds a new rating for a product
 */
app.post("/darksouls/rate", async function(req, res) {
  let sessionid = req.cookies['sessionid'];
  if (sessionid && req.body.itemid && req.body.stars && req.body.stars <= max &&
    req.body.stars >= 1 && req.body.orderid) {
    try {
      let db = await getDBConnection();
      let q3 = 'SELECT rated FROM orders WHERE orderid = ? ;';
      let rated = await db.get(q3, [req.body.orderid]);
      if (rated.rated !== 0) {
        res.type('text');
        res.status(CLIENT_ERROR).send('Already commented');
      } else {
        let comment = req.body.comment ? req.body.comment : "";
        let q1 = 'SELECT userid FROM users WHERE sessionid = ? ;';
        let user = await db.get(q1, [sessionid]);
        let q2 = 'INSERT INTO ratings (userid, itemid,comment,stars) VALUES( ?, ?, ?, ? );';
        await db.run(q2, [user.userid, req.body.itemid, comment, req.body.stars]);
        let q4 = 'UPDATE orders SET rated=rated+1 WHERE orderid= ? ;';
        db.run(q4, [req.body.orderid]);
        res.send('rate success');
      }
    } catch (err) {
      res.type('text');
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  } else {
    res.type('text');
    res.status(CLIENT_ERROR).send("Invalid Params.");
  }
});

/**
 * get all the ratings and the average stars of the specified items
 */
app.get('/darksouls/ratings/:id', async function(req, res) {
  let itemid = req.params.id;
  let isValid = await checkid(itemid);
  if (!isValid) {
    res.type('text');
    res.status(CLIENT_ERROR).send('itemid does not exist');
  } else {
    try {
      let db = await getDBConnection();
      let q1 = 'SELECT u.username, r.ratingDate, r.stars, r.comment FROM ratings r, users u ' +
      'WHERE r.itemid = ? AND r.userid = u.userid ORDER BY DATETIME(r.ratingdate) DESC;';
      let ratings = await db.all(q1, [itemid]);
      let q2 = 'SELECT avg(stars) FROM ratings WHERE itemid = ? ;';
      let avg = await db.get(q2, [itemid]);
      await db.close();
      res.json({ratings, avg});
    } catch (err) {
      res.type('text');
      res.status(SERVER_ERROR).send(err);
    }
  }
});

/**
 * Add a new new user
 */
app.post("/darksouls/newuser", async function(req, res) {
  if (!req.body.email || !req.body.passcode || !req.body.username) {
    res.type('text');
    res.status(CLIENT_ERROR).send("Missing one or more of the required params.");
  } else if (await checkEmail(req.body.email)) {
    res.type('text');
    res.status(CLIENT_ERROR).send("Email already exist.");
  } else {
    const startingSouls = 35000;
    let db = await getDBConnection();
    let q2 = 'INSERT INTO users (username,email,passcode,balance) VALUES( ?, ?, ?, ? );';
    await db.run(q2, [req.body.username, req.body.email, req.body.passcode, startingSouls]);
    await db.close();
    res.type('text');
    res.send('registered');
  }
});

/**
 * Establishes a database connection to a database and returns the database object.
 * Any errors that occur during connection should be caught in the function
 * that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'shop.db',
    driver: sqlite3.Database
  });
  return db;
}

/**
 * Generates an unused sessionid and returns it to the user.
 * @returns {string} - The random session id.
 */
async function getSessionId() {
  let query = 'SELECT sessionid FROM users WHERE sessionid = ?';
  let id;
  let db = await getDBConnection();
  const BASE = 36;
  const LAST_DIGIT = 15;
  do {
    // This wizardry comes from https://gist.github.com/6174/6062387
    id = Math.random().toString(BASE)
      .substring(2, LAST_DIGIT) + Math.random().toString(BASE)
      .substring(2, LAST_DIGIT);
  } while (((await db.all(query, id)).length) > 0);
  await db.close();
  return id;
}

/**
 * Checks Credentials
 * @param {string} email - The email to check
 * @param {string} pass - The password to check
 * @returns {boolean} - True if the credentials match for a user, false otherwise.
 */
async function checkCredentials(email, pass) {
  let query = 'SELECT email FROM users WHERE email = ? AND passcode = ?;';
  let db = await getDBConnection();
  let results = await db.all(query, [email, pass]);
  await db.close();
  return (results.length > 0);
}

/**
 * Sets the session id in the database to the given one for the given user.
 * @param {string} id - The Session id to set
 * @param {string} email - The email of the person to set the id for
 */
async function setSessionId(id, email) {
  let query = 'UPDATE users SET sessionid = ? WHERE email = ?';
  let db = await getDBConnection();
  await db.all(query, [id, email]);
  await db.close();
}

/**
 * Checks if itemid exist in items
 * @param {string} itemid - The id to check
 * @returns {boolean} - True if the itemid exist in items, false otherwise.
 */
async function checkid(itemid) {
  let query = 'SELECT itemid FROM items WHERE itemid = ? ;';
  let db = await getDBConnection();
  let results = await db.all(query, [itemid]);
  await db.close();
  return (results.length > 0);
}

/**
 * Returns true if the user is logged in and false otherwise
 * @param {string} sessionid the sessionid of the current user
 * @returns {array} - an array of 2 strings: [yip, hashtag]
 */
async function checkUser(sessionid) {
  let query = 'SELECT username FROM users WHERE sessionid = ? ;';
  let db = await getDBConnection();
  let results = await db.all(query, [sessionid]);
  await db.close();
  return (results.length > 0);
}

/**
 * checks the prereqs of before buying an item
 * @param {int} itemid id of the item
 * @param {string} sessionid sessionid of the user
 * @param {int} capacity stocks left for the product
 * @returns {string} the error message, returns '' if no error
 */
async function checkBuy(itemid, sessionid, capacity) {
  if (!itemid) {
    return ("Missing one or more of the required params.");
  } else if (!(await checkUser(sessionid))) {
    return ("User not logged in.");
  } else if (!(await checkid(itemid))) {
    return ("itemid does not exist");
  } else if (capacity === 0) {
    return ("Item out of stock");
  }
  return '';
}

/**
 * process the transaction and update the database on the data provided
 * @param {int} itemid id of the item
 * @param {object} item an object cotaining information about the item
 * @param {object} user the user that is making this transaction
 * @returns {string} the order confirmation number
 */
async function order(itemid, item, user) {
  let db = await getDBConnection();
  let q3 = 'UPDATE items SET capacity=capacity-1 WHERE itemid= ? ;';
  await db.run(q3, [itemid]);
  let q4 = 'UPDATE users SET balance=balance- ? WHERE userid= ? ;';
  await db.run(q4, [item.price, user.userid]);
  let q5 = 'INSERT INTO orders (userid,itemid,rated) VALUES( ?, ?, ? );';
  let insert = await db.run(q5, [user.userid, itemid, 0]);
  let oid = insert['lastID'];
  await db.close();
  return oid.toString();
}

/**
 * check if the email already exist in the database
 * @param {string} email email to check
 */
async function checkEmail(email) {
  let query = 'SELECT email FROM users WHERE email = ? ;';
  let db = await getDBConnection();
  let results = await db.all(query, [email]);
  await db.close();
  return (results.length > 0);
}

app.use(express.static('public'));
const PORT = process.env.PORT || PORT_NUM;
app.listen(PORT);

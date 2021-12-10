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
const SERVER_ERROR = 400;
const SERVER_ERROR_MSG = "An error occurred on the server. Try again later.";
const COOKIE_EXPIRATION = 1000 * 60 * 60 * 3;

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

/**
 * Get all the items data or items data matching a given search term (name/desc/type)
 * /darksouls/items/?search=big&type=sword&min=0&max=100
 */
app.get('/darksouls/items', async function(req, res) {
  // let keyword = req.query.search ? req.query.search : "";
  try {
    let yips;
    let db = await getDBConnection();
    if (req.query.search) {
      let keyword = req.query.search;
      yips = await db
        .all('SELECT id FROM yips WHERE yip LIKE \'%' +
          keyword + '%\' ORDER BY id;');
    } else {
      yips = await db.all('SELECT * FROM yips ORDER BY DATETIME(date) DESC;');
    }
    await db.close();
    res.json({"yips": yips});
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

// Logs the user into the webservice, setting a login cookie that expires in 3 hours.
app.post('/darksouls/login', async function(req, res) {
  res.type('text');
  let user = req.body.username;
  let pass = req.body.password;
  if (!user || !pass) {
    res.status(CLIENT_ERROR).send('Missing required parameters username and password!');
  } else {
    try {
      if (!(await checkCredentials(user, pass))) {
        res.status(CLIENT_ERROR).send('Invalid credentials.');
      } else {
        let id = await getSessionId();
        await setSessionId(id, user);
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
  let user = req.params.id;
  try {
    let db = await getDBConnection();
    let yips = await db
      .all('SELECT name, yip, hashtag, date FROM yips WHERE name=\'' +
      user + '\' ORDER BY DATETIME(date) DESC;');
    await db.close();
    if (yips.length === 0) {
      res.type('text');
      res.status(CLIENT_ERROR).send("Yikes. User does not exist.");
    }
    res.json(yips);
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * Process a purchase of an item
 */
app.post("/darksouls/buy", async function(req, res) {
  // req.body.id, req.body.cookies[]
  if (req.body.id) {
    try {
      let db = await getDBConnection();
      let id = req.body.id;
      let row = await db.get('SELECT id FROM yips WHERE id=\'' + id + '\'');
      if (row) {
        await db.run('UPDATE yips SET likes=likes+1 WHERE id=' + id);
        let result = await db.get('SELECT likes FROM yips WHERE id=' + id);
        await db.close();
        res.type('text');
        res.send(result.likes.toString());
      } else {
        res.type('text');
        res.status(CLIENT_ERROR).send("Yikes. ID does not exist.");
      }
    } catch (err) {
      res.type('text');
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  } else {
    res.type('text');
    res.status(CLIENT_ERROR).send("Missing one or more of the required params.");
  }
});

/**
 * Get transaction history for the user
 */
app.post("/darksouls/history", async function(req, res) {
  // req.body.cookies[]
  if (req.body.id) {
    try {
      let db = await getDBConnection();
      let id = req.body.id;
      let row = await db.get('SELECT id FROM yips WHERE id=\'' + id + '\'');
      if (row) {
        await db.run('UPDATE yips SET likes=likes+1 WHERE id=' + id);
        let result = await db.get('SELECT likes FROM yips WHERE id=' + id);
        await db.close();
        res.type('text');
        res.send(result.likes.toString());
      } else {
        res.type('text');
        res.status(CLIENT_ERROR).send("Yikes. ID does not exist.");
      }
    } catch (err) {
      res.type('text');
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  } else {
    res.type('text');
    res.status(CLIENT_ERROR).send("Missing one or more of the required params.");
  }
});

/**
 * Update rating of a product
 */
app.post("/darksouls/rating", async function(req, res) {
  // req.body.cookies[], req.body.item, req.body.rating, req.body.comment

  // return JSON {avg rating, new comment}
  if (req.body.id) {
    try {
      let db = await getDBConnection();
      let id = req.body.id;
      let row = await db.get('SELECT id FROM yips WHERE id=\'' + id + '\'');
      if (row) {
        await db.run('UPDATE yips SET likes=likes+1 WHERE id=' + id);
        let result = await db.get('SELECT likes FROM yips WHERE id=' + id);
        await db.close();
        res.type('text');
        res.send(result.likes.toString());
      } else {
        res.type('text');
        res.status(CLIENT_ERROR).send("Yikes. ID does not exist.");
      }
    } catch (err) {
      res.type('text');
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  } else {
    res.type('text');
    res.status(CLIENT_ERROR).send("Missing one or more of the required params.");
  }
});

/**
 * Add a new new user
 */
app.post("/darksouls/newuser", async function(req, res) {
  // req.body.email, req.body.password, req.body.username
  if (req.body.name && req.body.full) {
    try {
      let name = req.body.name;
      let db = await getDBConnection();
      let row = await db.get('SELECT id FROM yips WHERE name=\'' + name + '\'');
      try {
        let processed = processYip(req.body.full, row);
        let qry = 'INSERT INTO yips (name, yip, hashtag, likes) VALUES (?, ?, ?, ?)';
        let inserted = await db.run(qry, [name, processed[0], processed[1], 0]);
        let result = await db.get('SELECT * FROM yips WHERE id=' + inserted.lastID);
        await db.close();
        res.json(result);
      } catch (error) {
        res.type('text');
        res.status(CLIENT_ERROR).send(error.message);
      }
    } catch (err) {
      res.type('text');
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  } else {
    res.type('text');
    res.status(CLIENT_ERROR).send("Missing one or more of the required params.");
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
 * @param {string} user - The username to check
 * @param {string} pass - The password to check
 * @returns {boolean} - True if the credentials match for a user, false otherwise.
 */
async function checkCredentials(user, pass) {
  let query = 'SELECT username FROM users WHERE username = ? AND password = ?;';
  let db = await getDBConnection();
  let results = await db.all(query, [user, pass]);
  await db.close();
  return (results.length > 0);
}

/**
 * Sets the session id in the database to the given one for the given user.
 * @param {string} id - The Session id to set
 * @param {string} user - The username of the person to set the id for
 */
async function setSessionId(id, user) {
  let query = 'UPDATE users SET sessionid = ? WHERE username = ?';
  let db = await getDBConnection();
  await db.all(query, [id, user]);
  await db.close();
}

/**
 * Returns the processed yip and hashtag based on the input text and user name
 * @param {string} full the full text of an yip post
 * @param {array} row the row that contains the user name from database
 * @returns {array} - an array of 2 strings: [yip, hashtag]
 * @throws "Yikes. Yip format is invalid." if the input string does not match yip format
 * @throws "Yikes. User does not exist." if the input username does not exist in the database
 */
function processYip(full, row) {
  if (!row) {
    throw new Error("Yikes. User does not exist.");
  }
  let parts = full.split("#");
  if (parts.length !== 2 ||
    parts[0].match(/[^a-zA-Z0-9_\s.!?]+/) ||
    parts[1].match(/[^a-zA-Z0-9]+/)) {
    throw new Error("Yikes. Yip format is invalid.");
  }
  return [parts[0].trim(), parts[1]];
}

app.use(express.static('public'));
const PORT = process.env.PORT || PORT_NUM;
app.listen(PORT);

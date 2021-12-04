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

const express = require("express");
const app = express();

const multer = require("multer");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

/**
 * Get all the yip data or yip data matching a given search term
 */
app.get('/yipper/yips', async function(req, res) {
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

/**
 * Get yip data for a designated user
 */
app.get('/yipper/user/:user', async function(req, res) {
  let user = req.params.user;
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
 * Update the likes for a designated yip
 */
app.post("/yipper/likes", async function(req, res) {
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
 * Add a new yip with given name and the full yip text
 */
app.post("/yipper/new", async function(req, res) {
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

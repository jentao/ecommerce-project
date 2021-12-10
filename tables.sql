CREATE TABLE items (
  itemid INTEGER PRIMARY KEY,
  itemName TEXT,
  imagePath TEXT,
  lore TEXT,
  price INTEGER,
  capacity INTEGER,
  itemType TEXT
);

CREATE TABLE users (
  userid INTEGER PRIMARY KEY,
  username TEXT,
  email TEXT,
  passcode TEXT,
  balance INTEGER,
  sessionid TEXT
);

CREATE TABLE orders (
  orderid INTEGER PRIMARY KEY,
  userid INTEGER,
  itemid INTEGER,
  orderDate datetime default current_timestamp,
  foreign key (userid) references users(userid),
  foreign key (itemid) references items(itemid)
);

CREATE TABLE ratings (
  ratingid INTEGER PRIMARY KEY,
  userid INTEGER,
  itemid INTEGER,
  ratingDate datetime default current_timestamp,
  comment TEXT,
  foreign key (userid) references users(userid),
  foreign key (itemid) references items(itemid)
);

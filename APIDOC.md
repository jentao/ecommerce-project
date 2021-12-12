# DarksoulsShop API Documentation
The DarksoulsShop API provides methods for the user to retrieve data from the API

## Endpoint 1: Get all the items data or items data matching a given search term (name/desc/type)
**Request Format:** `/darksouls/items`

**Query Parameters:** `name` (optional), `desc` (optional), `type` (optional)

**Request Type (all requests):** `GET`

**Returned Data Format:** JSON

**Description 1:** If any of the parameter is not included that that category won't be searched by the endpoint.

**Example Request 1:** `/darksouls/items`

**Example Output 1:** (abbreviated)
```json
{
		"itemid": 2,
		"itemName": "Dragonslayer Greatbow",
		"imagePath": "https://static.wikia.nocookie.net/darksouls/images/9/94/Dragonslayer_Greatbow_%28DSIII%29.png/revision/latest?cb=20160613022347",
		"lore": "Greatbow used by the Dragonslayers during the age of gods. Far greater in size than any normal bow, and far more devastating.\r\nThe bow must be anchored to the ground when fired, a time-consuming operation that leaves the user vulnerable. Only specialized great arrows can be fired from the bow.",
		"price": 6999,
		"capacity": 8,
}
```

**Error Handling:**
- Possible 500 (SERVER_ERROR)
 - If something went wrong on the server: `An error occurred on the server. Try again later.`

## Endpoint 2:  Logs the user into the webservice, setting a login cookie that expires in 3 hours.
**Request Format:** `/darksouls/login`

**Query Parameters:** `email, passcode, cookies`

**Request Type:** `POST`

**Returned Data Format:** TEXT, Cookie

**Description:** Logs the user into the webservice, setting a login cookie that expires in 3 hours.
**Example Request:** `/darksouls/login`
**Example Output:**
```TEXT
'Successfully logged in!'
```
**Error Handling:**
- Possible 400 (invalid request)
 - If missing params: `'Missing required parameters username and password!'`
- Possible 500 (Server Error)
 - If something went wrong on the server: `An error occurred on the server. Try again later.`

## Endpoint 3: Logs a user out by expiring their cookie.

**Request Format:** `/darksouls/logout`

**Body Parameters:** `cookies`

**Request Type:** `POST`

**Returned Data Format:** `cookie`

**Description:** Logs a user out by expiring their cookie.

**Example Request:** `/darksouls/logout`

**Example Output:**
```
Successfully logged out!
```
**Or id the user is already logged out:**
```
Already logged out.
```

#### Endpoint 4: Get information of a specific item
**Request Format:** `/darksouls/item/:id`

**Parameters:** `id`

**Request Type:** `get`

**Returned Data Format:** JSON

**Description:** return the json of a specific item base on the itemid provided.

**Example Request:** `/darksouls/item/1`
**Example Output:**
```json
{
	"itemid": 1,
	"itemName": "Brigand Twindaggers",
	"imagePath": "https://static.wikia.nocookie.net/darksouls/images/f/f3/Brigand_Twindaggers.png/revision/latest?cb=20160613015635",
	"lore": "These paired daggers are the preferred weapons of the brigands of a distant land.\r\nWhen two-handed, the wielder holds a blade in each hand, allowing for divergent attacks that include left handed moves.",
	"price": 8999,
	"capacity": 0,
	"itemType": "melee"
}
```
**Error Handling:**
- Possible 400 (invalid request)
 - If the id given does not exist: `Yikes. ID does not exist.`
- Possible 500 (Server Error)
 - If something went wrong on the server: `An error occurred on the server. Try again later.`

#### Endpoint 5: Process a purchase of an item
**Request Format:** `/darksouls/buy`

**Body Parameters:** `sessionid`, `itemid`

**Request Type:** `POST`

**Returned Data Format:** TEXT

**Description:** return the order number if the purchese is succesful.

**Example Request:** `/darksouls/buy`
**Example Output:**
```TEXT
64
```
**Error Handling:**
- Possible 400 (invalid request)
  - If missing params: `Missing one or more of the required params.`
  - If sessionid not exist: `User not logged in.`
  - If itemid not exist: `itemid does not exist`
  - If item out of stock: `Item out of stock`
- Possible 500 (Server Error)
  - If something went wrong on the server: `An error occurred on the server. Try again later.`

#### Endpoint 6: Get transaction history for the user
**Request Format:** `/darksouls/history`

**Body Parameters:** `sessionid`

**Request Type:** `POST`

**Returned Data Format:** json

**Description:** return all the orders from a specific user in json format.

**Example Request:** `/darksouls/history`
**Example Output:**
```json
[
	{
		"orderid": 10,
		"userid": 1,
		"itemid": 6,
		"orderDate": "2021-12-10 21:22:40"
	},
	{
		"orderid": 9,
		"userid": 1,
		"itemid": 6,
		"orderDate": "2021-12-10 21:21:58"
	},
	{
		"orderid": 8,
		"userid": 1,
		"itemid": 6,
		"orderDate": "2021-12-10 21:20:22"
	},
	{
		"orderid": 2,
		"userid": 1,
		"itemid": 1,
		"orderDate": "2021-12-10 20:42:57"
	},
	{
		"orderid": 1,
		"userid": 1,
		"itemid": 1,
		"orderDate": "2021-12-10 20:41:17"
	}
]
```
**Error Handling:**
- Possible 400 (invalid request)
  - If sessionid not exist: `User not logged in.`
- Possible 500 (Server Error)
  - If something went wrong on the server: `An error occurred on the server. Try again later.`

#### Endpoint 7: Adds a new rating for a product
**Request Format:** `/darksouls/rate`

**Body Parameters:** `sessionid`, `itemid`, `stars`, `orderid`, `comment`(optional)

**Request Type:** `POST`

**Returned Data Format:** TEXT

**Description:** return `rate success` if successfully rated the item.

**Example Request:** `/darksouls/rate`
**Example Output:**
```TEXT
rate success
```
**Error Handling:**
- Possible 400 (invalid request)
  - If missing params: `Invalid Params.`
  - If the order has alredy been commented: `Already commented.`
- Possible 500 (Server Error)
  - If something went wrong on the server: `An error occurred on the server. Try again later.`

#### Endpoint 8: get all the ratings and the average stars of the specified items
**Request Format:** `/darksouls/ratings/:id`

**Body Parameters:** `id`

**Request Type:** `GET`

**Returned Data Format:** json

**Description:** Will return all the reviews of a specific product and its average rating in a json.

**Example Request:** `/darksouls/ratings/1`
**Example Output:**
```json
{
	"ratings": [
		{
			"ratingid": 3,
			"userid": 1,
			"itemid": 1,
			"ratingDate": "2021-12-10 22:57:47",
			"stars": 4,
			"comment": "second buy, overall quality is still solid but the price is a bit expensive."
		},
		{
			"ratingid": 1,
			"userid": 1,
			"itemid": 1,
			"ratingDate": "2021-12-10 22:31:16",
			"stars": 5,
			"comment": "Solid Daggers, will definitely buy another! "
		}
	],
	"avg": {
		"avg(stars)": 4.5
	}
}
```
**Error Handling:**
- Possible 400 (invalid request)
  - If itemid does not exist: `itemid does not exist`
- Possible 500 (Server Error)
  - If something went wrong on the server: `An error occurred on the server. Try again later.`

#### Endpoint 9: Add a new new user
**Request Format:** `/darksouls/newuser`

**Body Parameters:** `email`, `passcode`, `username`

**Request Type:** `POST`

**Returned Data Format:** text

**Description:** Will register a new user and enter it in the database if the email address in not already registered.

**Example Request:** `/darksouls/newuser`
**Example Output:**
```text
registered
```
**Error Handling:**
- Possible 400 (invalid request)
  - If missing params: `Missing one or more of the required params`
  - if email already registered: `Email already exist.`
- Possible 500 (Server Error)
  - If something went wrong on the server: `An error occurred on the server. Try again later.`
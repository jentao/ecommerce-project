### Yipper API Documentation
The Yipper API provides endpoints to retrieve, update and insert functionalities for the yipper database.

#### Endpoint 1: Get all yip data or yip data matching a given search term
**Request Format:** `/yipper/yips`\
**Query Parameters:** `search` (optional)\
**Request Type (both requests):** `GET`\
**Returned Data Format:** JSON\
**Description 1:** If the `search` parameter is not included in the request, get the `id`, `name`, `yip`, `hashtag`, `likes` and `date` from the `yips` table and outputs JSON containing the information in the order of `date`s in descending order.\
**Example Request 1:** `/yipper/yips`\
**Example Output 1:** (abbreviated)
```json
{
  "yips":[
    {
      "id": 25,
      "name": "Mister Fluffers",
      "yip": "It is sooooo fluffy I am gonna die",
      "hashtag": "fluff",
      "likes": 6,
      "date": "2020-07-07 03:48:28"
    },
    {
      "id": 24,
      "name": "Sir Barks a Lot",
      "yip": "Imagine if my name was sir barks a lot and I was meowing all day haha",
      "hashtag": "clown",
      "likes": 6,
      "date": "2020-07-06 00:55:08"
    },
    ...
  ]
}
```
**Description 2:** If the `search` parameter is included in the request, respond with all the `id`s of the `yip`s matching the term passed in the `search` query parameter (ordered by the `id`s). A "match" would be any `yip` that has the `search` term in _any_ position meaning that the term "if" should match any  `yip` containing the words "if", "iframe" or "sniff".\
**Example Request 2:** `/yipper/yips?search=if`\
**Example Output 2:**
```json
{
  "yips" : [
    {
      "id": 8
    },
    {
      "id": 24
    }
  ]
}
```
**Error Handling:**
- Possible 500 (server error) errors (all plain text):
  - If something went wrong on the server, returns an error with the message: `An error occurred on the server. Try again later.`

#### Endpoint 2: Get yip data for a designated user
**Request Format:** `/yipper/user/:user`\
**Query Parameters:** none.\
**Request Type:** `GET`\
**Returned Data Format:** JSON\
**Description:** Get the `name`, `yip`, `hashtag` and `date` for all the yips for a designated `user` ordered by the `date` in descending order. The `user` will be taken exactly as passed in the request.\
**Example Request:** `/yipper/user/Chewbarka`\
**Example Output:**
```json
[
  {
    "name": "Chewbarka",
    "yip": "chewy or soft cookies. I chew them all",
    "hashtag": "largebrain",
    "date": "2020-07-09 22:26:38",
  },
  {
    "name": "Chewbarka",
    "yip": "Every snack you make every meal you bake every bite you take... I will be watching you.",
    "hashtag": "foodie",
    "date": "2019-06-28 23:22:21"
  }
]
```
**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If the user parameter does not exist in database, returns an error with the message: `Yikes. User does not exist.`
- Possible 500 (server error) errors (all plain text):
  - If something went wrong on the server, returns an error with the message: `An error occurred on the server. Try again later.`


#### Endpoint 3: Update the likes for a designated yip
**Request Format:** `/yipper/likes`\
**Body Parameters:** `id`\
**Request Type:** `POST`\
**Returned Data Format:** plain text\
**Description:** Update the `likes` for a yip (the yip is updating is determined by the `id` passed through the body) by incrementing the current value by 1 and responding with the new value.\
**Example Request:** `/yipper/likes`\
**Example Output:**
```
8
```
**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If the provided id does not exist in database, returns an error with the message: `Yikes. ID does not exist.`
  - If one or more parameters are not provided, returns an error with the message: `Missing one or more of the required params.`
- Possible 500 (server error) errors (all plain text):
  - If something went wrong on the server, returns an error with the message: `An error occurred on the server. Try again later.`

#### Endpoint 4: Add a new yip
**Request Format:** `/yipper/new`\
**Body Parameters:** `name` and `full`\
**Request Type:** `POST`\
**Returned Data Format:** JSON\
**Description:** Add the new Yip information to the database and send back and output the JSON with the `id`, `name`, `yip`, `hashtag`, `likes` and `date`. The `id` should correspond with the auto-incremented `id` generated from inserting into the database. The `name` of the is grabbed from the `name` body parameter. The `likes` will be set to 0, and the `yip` and `hashtag` information will be obtained from the `full` body parameter. The `date` should be the current date.\
A valid full yip is described below:
* The text of a Yip can be made up of any combination of any word character (letter, number, underscore), any whitespace character, a period (`.`), an exclamation point (`!`) and/or a question mark (`?`). At _minimum_ the Yip text should be a single one of the characters mentioned above but there is no restriction on how long the text of a Yip can be.
* The text of a Yip should be separated by a single whitespace character and then a pound sign (`#`).
* Following the pound sign (`#`) is the hashtag which is is any combination of one or more of lowercase letters, capital letters and/or numbers.

**Example Request:** `/yipper/new`\
**Example Output:**
```json
{
  "id": 528,
  "name": "Chewbarka",
  "yip": "love to yip allllll day long",
  "hashtag": "coolkids",
  "likes": 0,
  "date": "2020-09-09 18:16:18"
}
```
**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If the provided user does not exist in database, returns an error with the message: `Yikes. User does not exist.`
  - If the provided full yip is not in valid format, returns an error with the message: `Yikes. Yip format is invalid.`
  - If one or more parameters are not provided, returns an error with the message: `Missing one or more of the required params.`
- Possible 500 (server error) errors (all plain text):
  - If something went wrong on the server, returns an error with the message: `An error occurred on the server. Try again later.`

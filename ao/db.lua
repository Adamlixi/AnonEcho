sqlite3 = require("lsqlite3")
json = require("json")

DB = DB or sqlite3.open_memory()

-- DB = DB or sqlite3.open_memory()
DB:exec [[ 
  DROP TABLE IF EXISTS x_talk; 
]]
print("x_talk drop:" .. DB:errmsg())

DB:exec [[
  CREATE TABLE IF NOT EXISTS x_talk (
    id INT PRIMARY KEY,
    textid TEXT,
    owner TEXT COLLATE NOCASE,
    likes INT,
    dislikes INT,
    twitter_id TEXT,
    message TEXT,
    parent TEXT,
    time INT
  );
]]
XTalkId = 0
print("x_talk" .. DB:errmsg())
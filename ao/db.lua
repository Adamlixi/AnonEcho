sqlite3 = require("lsqlite3")
json = require("json")

DB = DB or sqlite3.open_memory()

DB:exec [[
  CREATE TABLE IF NOT EXISTS x_talk (
    id INT PRIMARY KEY,
    owner TEXT COLLATE NOCASE,
    likes INT,
    dislikes INT,
    time INT,
    twitter_id TEXT,
    message TEXT
  );
]]
XTalkId = 0
print("x_talk" .. DB:errmsg())
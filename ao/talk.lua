Handlers.add(
    "CreateComment",
    Handlers.utils.hasMatchingTag("Action", "CreateComment"),
    function (msg)
        print(msg.Message)
        local parent = msg.Parent
        if parent == nil or parent == "" then
            parent = "comment"
        end
        createComment(msg.From, msg.TwitterId, msg.Message, parent, msg.Timestamp)
        msg.reply({Data ="Success"})
    end
)



function createComment(owner, twitter_id, message, parent, time)
    local textid = twitter_id .. "_" ..  tostring(XTalkId) .. "_" .. "ao"
    local stmt = DB:prepare [[
        REPLACE INTO x_talk (id, textid, owner, likes, dislikes, twitter_id, message, parent, time) VALUES (:id, :textid, :owner, :likes, :dislikes, :twitter_id, :message, :parent, :time);
    ]]

    if not stmt then
      error("Failed to prepare SQL statement: " .. DB:errmsg())
    end
    stmt:bind_names({
        id = XTalkId,
        textid = textid,
        owner = owner,
        likes = 0,
        dislikes = 0,
        twitter_id = twitter_id,
        message = message,
        parent = parent,
        time = time
    })
    stmt:step()
    stmt:reset()
    XTalkId = XTalkId + 1
end

Handlers.add(
    "GetComment",
    Handlers.utils.hasMatchingTag("Action", "GetComment"),
    function (msg)
        local resp = getComments(msg.TwitterId)
        msg.reply({Data = json.encode(resp)})
    end
)


function getComments(twitter_id)
    local stmt = DB:prepare [[
        select * from x_talk WHERE (twitter_id = :twitter_id);
    ]]
    if not stmt then
        error("Failed to prepare SQL statement: " .. DB:errmsg())
    end
    stmt:bind_names({
        twitter_id = twitter_id,
    })
    return query(stmt)
end

function query(stmt)
    local rows = {}
    for row in stmt:nrows() do
        table.insert(rows, row)
    end
    stmt:reset()
    return rows
end
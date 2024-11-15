Handlers.add(
  "SayHello",
  Handlers.utils.hasMatchingTag("Action", "SayHello"),
  function(msg)
    print("SayHello");
    Handlers.utils.reply("registered")(msg)
  end
)
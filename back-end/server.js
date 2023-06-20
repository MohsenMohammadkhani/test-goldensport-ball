var http = require("http");
var sockjs = require("sockjs");

var echo = sockjs.createServer({ sockjs_url: "" });
var clients = {};

function broadcast(message, currentDeviceConnectionID) {
  for (var connectionID in clients) {
    if (connectionID != currentDeviceConnectionID) {
      clients[connectionID].write(message);
    }
  }
}

echo.on("connection", function (conn) {
  clients[conn.id] = conn;
  conn.on("data", function (message) {
    broadcast(message, conn.id);
  });
  conn.on("close", function () {
    delete clients[conn.id];
  });
});

var server = http.createServer(function (req, res) {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write("Hello World!");
  res.end();
});
echo.installHandlers(server, { prefix: "/move-ball" });
server.listen(8000);

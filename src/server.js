const http = require("http");
const app = require("./app");
const config = require("./config");

// Separate HTTP server so Socket.IO can attach later without changing Express.
const server = http.createServer(app);


server.listen(config.port, () => {
  console.log(`Anchor backend listening on http://localhost:${config.port}`);
});

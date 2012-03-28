var util = require("util"),
    http = require("http");

http.createServer(function(request, response) {
  response.statusCode = 200;
  response.setHeader("Content-Type", "text/html");
  response.write("Hello World!");
  response.end();
}).listen(8080);

util.puts("Server running at http://localhost:8080/");

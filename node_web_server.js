// Simple node.js web server
// Code from:
// http://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http
// See also https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework

var http = require("http");
var fs = require("fs");
var path = require("path");

http
  .createServer(function(request, response) {
    console.log("request starting...");

    var filePath = "." + request.url;
    if (filePath == "./") filePath = "./src/index.html";

    var extname = path.extname(filePath);
    extname = extname.split("?")[0];
    var contentType = "text/html";
    console.log(extname);
    switch (extname) {
      case ".html":
        contentType = "text/html";
        break;
      case ".js":
        contentType = "text/javascript";
        break;
      case ".css":
        contentType = "text/css";
        break;
      case ".json":
        contentType = "application/json";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".jpg":
        contentType = "image/jpg";
        break;
      case ".wav":
        contentType = "audio/wav";
        break;
      case ".svg":
        contentType = "image/svg+xml";
        break;
      case ".woff":
        contentType = "application/font-woff";
      case "":
        break;
      default:
        contentType = "application/octet-stream";
        break;
    }

    fs.readFile(filePath, function(error, content) {
      if (error) {
        if (error.code == "ENOENT") {
          fs.readFile("./src/index.html", function(error, content) {
            response.writeHead(200, { "Content-Type": contentType });
            response.end(content, "utf-8");
          });
        } else {
          response.writeHead(500);
          response.end(
            "Sorry, check with the site admin for error: " +
              error.code +
              " ..\n"
          );
          response.end();
        }
      } else {
        response.writeHead(200, { "Content-Type": contentType });
        response.end(content, "utf-8");
      }
    });
  })
  .listen(8080);
console.log("Server running at http://127.0.0.1:8080/");

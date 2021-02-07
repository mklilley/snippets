// Simple node.js server for receiving JSON requsts
// Code from:
// https://blog.risingstack.com/your-first-node-js-http-server/
// https://nodejs.dev/get-http-request-body-data-using-nodejs

const http = require("http");
const port = 3000;

const requestHandler = (request, response) => {
  let data = [];

  request.on("data", chunk => {
    data.push(chunk);
  });

  request.on("end", () => {
    try {
      console.log(JSON.parse(data));
    } catch (error) {
      console.log("ERROR: Request body not JSON");
    }
  });

  response.end("Success");
};

const server = http.createServer(requestHandler);

server.listen(port, err => {
  if (err) {
    return console.log("something bad happened", err);
  }

  console.log(`server is listening on ${port}`);
});


const readSession = require("./readSession");
const {readFile} =require("./fsReadFile")
const generateAuthLinks = require("./LoginLink.js");
const connection =require('./db.js')
const {generateLinks} = require("./fs.js");
function handleRootRequest(req, res, sessionId) {
    readSession(sessionId, (err, sessionData) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      readFile("index.html", "utf8", (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
          return;
        }
        const { loginLink, signupLink } = generateAuthLinks(sessionData);
        const query = "SELECT id, title, date FROM submissions ORDER BY date DESC LIMIT 3";
        connection.query(query, [], (err, results) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
            return;
          }
          const linksHTML = generateLinks(results);
          data = data.replace("%LOGIN_LINK%", loginLink);
          data = data.replace("%signup_Link%", signupLink);
          data = data.replace("%a%", linksHTML);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        });
      });
    });
  }
  module.exports={
    handleRootRequest
  }
const { readFile } = require("./fsReadFile");
const generateAuthLinks = require("./LoginLink.js");
const connection = require('./db.js');
const { generateLinks } = require("./fs.js");

function handleBoardListRequest(req, res) {
  fetchRecentSubmissions((err, results) => {
    if (err) {
      sendErrorResponse(res, "Internal Server Error");
      return;
    }
    readFile("./public/html/BoardList.html", "utf8", (err, data) => {
      if (err) {
        sendErrorResponse(res, "Internal Server Error");
        return;
      }
      const { loginLink, signupLink } = generateAuthLinks();
      const linksHTML = generateLinks(results);
      const responseData = populateTemplate(data, loginLink, signupLink, linksHTML);
      sendHtmlResponse(res, responseData);
    });
  });
}

function fetchRecentSubmissions(callback) {
  const query = "SELECT id, title, date FROM submissions";
  connection.query(query, [], callback);
}

function populateTemplate(templateData, loginLink, signupLink, linksHTML) {
  let data = templateData.replace("%LOGIN_LINK%", loginLink);
  data = data.replace("%signup_Link%", signupLink);
  data = data.replace("%a%", linksHTML);
  return data;
}

function sendHtmlResponse(res, data) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(data);
}

function sendErrorResponse(res, message) {
  res.writeHead(500, { "Content-Type": "text/plain" });
  res.end(message);
}

module.exports = {
  handleBoardListRequest
};

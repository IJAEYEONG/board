const { readFile } = require("./fsReadFile.js");
const generateAuthLinks = require("./LoginLink.js");
const connection = require('./db.js');
const { generateLinks } = require("./fs.js");
<<<<<<< HEAD
=======
const {populateTemplate}=require('./DataTemplate.js')
const{sendErrorResponse}=require('./ErrorResponse.js')
const {sendHtmlResponse}=require('./HtmlResponse.js')
const {fetchRecentSubmissions}=require('./SearchSubmiss.js')
>>>>>>> fsTest
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
<<<<<<< HEAD
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
=======
>>>>>>> fsTest
module.exports = {
  handleBoardListRequest
};

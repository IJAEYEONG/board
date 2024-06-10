const {fetchRecentSubmissions}=require('./FindSubmission.js')
const { readFile } = require("./fsReadFile.js");
const generateAuthLinks = require("./LoginLink.js");
<<<<<<< HEAD
const { generateLinks } = require("./fs.js");
const {populateTemplate}=require('./LinkData.js')
const{sendErrorResponse}=require('./ErrorResponse.js')
function handleRootRequest( req,res, sessionId) {
=======
const {fetchRecentSubmissions}=require('./boardLimit.js')
const { generateLinks } = require("./fs.js");
const {populateTemplate}=require('./DataTemplate.js')
const{sendErrorResponse}=require('./ErrorResponse.js')
const {sendHtmlResponse}=require('./HtmlResponse.js')
function handleRootRequest(req, res, sessionId) {
  readSession(sessionId, (err, sessionData) => {
    if (err) {
      sendErrorResponse(res, "Internal Server Error");
      return;
    }
>>>>>>> fsTest
    readFile("./public/html/index.html", "utf8", (err, data) => {
      if (err) {
        sendErrorResponse(res, "Internal Server Error");
        return;
      }
      fetchRecentSubmissions((err, results) => {
        if (err) {
          sendErrorResponse(res, "Internal Server Error");
          return;
          }
        const { loginLink, signupLink } = generateAuthLinks(sessionId);
        const linksHTML = generateLinks(results);
        const responseData = populateTemplate(data, loginLink, signupLink, linksHTML);
        sendHtmlResponse(res, responseData);
      });
    });
<<<<<<< HEAD
}

function sendHtmlResponse(res, data) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(data);
}
=======
  });
}


>>>>>>> fsTest
module.exports = {
  handleRootRequest
};

const readSession = require("./readSession.js");
const { readFile } = require("./fsReadFile.js");
const generateAuthLinks = require("./LoginLink.js");
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
    readFile("./public/html/index.html", "utf8", (err, data) => {
      if (err) {
        sendErrorResponse(res, "Internal Server Error");
        return;
      }
      const { loginLink, signupLink } = generateAuthLinks(sessionData);
      fetchRecentSubmissions((err, results) => {
        if (err) {
          sendErrorResponse(res, "Internal Server Error");
          return;
        }
        const linksHTML = generateLinks(results);
        const responseData = populateTemplate(data, loginLink, signupLink, linksHTML);
        sendHtmlResponse(res, responseData);
      });
    });
  });
}


module.exports = {
  handleRootRequest
};

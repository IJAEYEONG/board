const {fetchRecentSubmissions}=require('./FindSubmission.js')
const { readFile } = require("./fsReadFile.js");
const generateAuthLinks = require("./LoginLink.js");
const { generateLinks } = require("./fs.js");
const {populateTemplate}=require('./LinkData.js')
const{sendErrorResponse}=require('./ErrorResponse.js')
function handleRootRequest( req,res, sessionId) {
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
}

function sendHtmlResponse(res, data) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(data);
}
module.exports = {
  handleRootRequest
};

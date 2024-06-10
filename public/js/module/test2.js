const { readFile } = require("./fsReadFile.js");
const generateAuthLinks = require("./LoginLink.js");
const connection = require('./db.js');
const { generateLinks } = require("./fs.js");
const {populateTemplate}=require('./DataTemplate.js')
const{sendErrorResponse}=require('./ErrorResponse.js')
const {sendHtmlResponse}=require('./HtmlResponse.js')
const {fetchRecentSubmissions}=require('./SearchSubmiss.js')
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
module.exports = {
  handleBoardListRequest
};

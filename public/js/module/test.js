const { fetchRecentSubmissions } = require("./boardLimit.js");
const { readFile } = require("./fsReadFile.js");
const generateAuthLinks = require("./LoginLink.js");
const { generateLinks } = require("./fs.js");
const { populateTemplate } = require("./DataTemplate.js");
const { sendErrorResponse } = require("./ErrorResponse.js");
const { sendHtmlResponse } = require("./HtmlResponse.js");
const readSession = require("./readSession.js");

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

      fetchRecentSubmissions((err, results) => {
        if (err) {
          sendErrorResponse(res, "Internal Server Error");
          return;
        }

        const { loginLink, signupLink } = generateAuthLinks(sessionId);
        const linksHTML = generateLinks(results);
        const responseData = populateTemplate(
          data,
          loginLink,
          signupLink,
          linksHTML
        );

        sendHtmlResponse(res, responseData);
      });
    });
  });
}

module.exports = {
  handleRootRequest,
};

const fs = require("fs");

function serveHtmlFile(filePath, res) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(`${filePath} 읽기 오류:`, err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
}

module.exports = { serveHtmlFile };

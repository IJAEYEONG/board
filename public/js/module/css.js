const fs = require("fs");
const cssFiles = {
  "/styles.css": "public/css/styles.css",
  "/edit.css": "public/css/edit.css",
  "/board.css": "public/css/board.css",
  "/submission.css": "public/css/submission.css",
  "/signup.css": "public/css/signup.css",
  "/login.css": "public/css/login.css"
};
function serveCssFile(req, res) {
  const filePath = cssFiles[req.url];
  if (filePath) {
    fs.readFile(filePath, "utf8", (err, css) => {
      if (err) {
        console.error(`${filePath} 읽기 오류:`, err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end("Internal Server Error");
      } else {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/css; charset=utf-8");
        res.write(css);
        res.end();
      }
    });
    return true;
  }
  return false;
}
module.exports = { serveCssFile };

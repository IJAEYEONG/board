const fs =require('fs')
function readFile(filePath, encoding, callback) {
    fs.readFile(filePath, encoding, (err, data) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, data);
      }
    });
  }
  module.exports={readFile}
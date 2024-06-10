// handlers.js
const { qs, bcrypt, connection, createSession } = require('../../../modules.js');
const {handleSignupRequest}=require('./SinupRequest.js');
const {handleLoginRequest}=require('./LoginRequest.js');


function test(req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const postData = qs.parse(body);
    const title = postData.title;
    const content = postData.content;
    const date = new Date().toLocaleString();
    const query =
      'INSERT INTO submissions (title, content, date) VALUES (?, ?, ?)';
    connection.query(query, [title, content, date], (err, results) => {
      if (err) {
        console.error('데이터베이스에 제출물 삽입 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(302, { Location: '/' });
      res.end();
    });
  });
}

module.exports = {
  test
};

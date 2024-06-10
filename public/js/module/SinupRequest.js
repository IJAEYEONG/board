const connection=require('./db.js')
const qs=require('querystring')
function handleSignupRequest(req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    const postData = qs.parse(body);
    const name = postData.name;
    const Email = postData.Email;
    const username = postData.username;
    const password = postData.password;
    if (name && Email && username && password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query =
        'INSERT INTO site_user (name, Email, username, password) VALUES (?, ?, ?, ?)';
      connection.query(
        query,
        [name, Email, username, hashedPassword],
        (err, results) => {
          if (err) {
            console.error('데이터베이스에 사용자 삽입 오류:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
          }
          res.writeHead(302, { Location: '/login' });
          res.end();
        }
      );
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request');
    }
  });
}
module.exports={
  handleSignupRequest
}
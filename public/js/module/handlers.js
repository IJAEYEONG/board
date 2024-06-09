// handlers.js
const { qs, bcrypt, connection, createSession } = require('../../../modules.js');

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

function handleLoginRequest(req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const postData = qs.parse(body);
    const username = postData.username;
    const password = postData.password;

    if (username && password) {
      const query = 'SELECT * FROM site_user WHERE username = ?';
      connection.query(query, [username], async (err, results) => {
        if (err) {
          console.error('데이터베이스에서 사용자 조회 오류:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }

        if (results.length > 0) {
          const user = results[0];
          try {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
              const sessionData = { loggedIn: true, userId: user.id };
              createSession(sessionData, (err, sessionId) => {
                if (err) {
                  console.error('세션 생성 오류:', err);
                  res.writeHead(500, { 'Content-Type': 'text/plain' });
                  res.end('Internal Server Error');
                  return;
                }
                res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly`);
                res.writeHead(302, { Location: '/' });
                res.end();
              });
            } else {
              res.writeHead(401, { 'Content-Type': 'text/plain' });
              res.end('Unauthorized');
            }
          } catch (err) {
            console.error('비밀번호 비교 오류:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
          }
        } else {
          res.writeHead(401, { 'Content-Type': 'text/plain' });
          res.end('Unauthorized');
        }
      });
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request');
    }
  });
}

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
  handleSignupRequest,
  handleLoginRequest,
  test
};

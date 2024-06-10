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
module.exports={
  handleLoginRequest
}
if (req.method === 'GET' && req.url === '/BoardLlist') {
  readSession(sessionId, (err, sessionData) => {
    if (err) {
      console.error('세션 읽기 오류:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }

    fs.readFile('index.html', 'utf8', (err, data) => {
      if (err) {
        console.error('index.html 읽기 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      let loginLink = '';
      let signupLink = '';
      if (sessionData && sessionData.loggedIn) {
        loginLink = '<a href="/logout">로그아웃</a>';
      } else {
        loginLink = '<a href="/login">로그인</a>';
        signupLink = '<a href="/signup">회원가입</a>';
      }

      data = data.replace('%LOGIN_LINK%', loginLink);
      data = data.replace('%signup_Link%', signupLink);
      
      const query = 'SELECT id, title, date FROM submissions ORDER BY date DESC LIMIT 3';
      connection.query(query, (err, results) => {
        if (err) {
          console.error('데이터베이스에서 제출물 조회 오류:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }

        const links = results.map(submission => `
        <div class="post">
          <a href="/submission/${submission.id}" class="post-title">${submission.title}</a>
          <p class="post-date">${submission.date}</p>
          <div class="post-actions">
            <a href="/delete/${submission.id}" class="btn small">삭제</a>
            <a href="/edit/${submission.id}" class="btn small">수정</a>
          </div>
        </div>
      `).join('');
      data = data.replace('%a%', links);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
    });
  });
}
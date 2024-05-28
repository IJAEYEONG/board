//모듈을 가져오는 부분.
const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const bcrypt = require('bcrypt');
const connection = require('./db.js');

//http모듈로 서버생성
const server = http.createServer((req, res) => {//req,res 매개변수로 요청과 응답을 받는 부분
  if (req.method === 'GET' && req.url === '/') {//만약 매서드가get이면서 url이/이면 실행되는 부분
    fs.readFile('index.html', 'utf8', (err, data) => {//fs모듈로 index.html을 읽는다.data라는 매개변수를 받는다.
      if (err) {//만약 에러가 나오면 콘솔에 index.html읽기 오류라고 뜨고 res.end로 문서에 Internal Server Error이라는 글이 뜬다.
        console.error('index.html 읽기 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;// 리턴을 사용해서 오류가 나게되면 서버가 끝난다.
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });//정상코드 200에 텍스트/html이나오게 한다고 알려주고
      res.end(data);//data라는 매개변수로 html안에있는 데이터를 읽어서 문서(html)에 나타나게 한다.
    });
  }else if(req.url === "/styles.css") {
    const css = fs.readFileSync("styles.css");
    res.statusCode=200;
    res.setHeader('Content-Type','text/css; charset=utf-8');
    res.write(css)
    res.end();
} else if (req.method === 'GET' && req.url === '/signup') {//그밖에 method가 GET이면서 url이 sinup이면 실행되는 부분
    fs.readFile('signup.html', 'utf8', (err, data) => {//signup.html 읽는 부분이고 data라는 매개변수로 html안에있는 데이터를 읽는다.
      if (err) {// 만약 오류라면, 콘솔에 오류라고 나타나면서 res.end로 Internal Server Error 이라고 오류가 문서(html)에 나타나게 한다.
        console.error('signup.html 읽기 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }//오류가 나오면 return으로 서버가 끝난다.
      res.writeHead(200, { 'Content-Type': 'text/html' });//200 상태 코드와 함께 html 데이터를 반환
      res.end(data);//signup.html안에있는 데이터를 읽어서 res.end로 data를 나타나게 한다.
    });
  } else if (req.method === 'GET' && req.url === '/login') {//매서드가GET이고 url이 login이면 실행되는 부분이고
    fs.readFile('login.html', 'utf8', (err, data) => {//login.html이란걸 읽고 매개변수data로 html안에있는 데이터를 읽는다.
      if (err) {//오류면 콘솔에 오류라고 나오고 문서에Internal Server Error이라고 글을 나타내고 return으로 서버를 종료
        console.error('login.html 읽기 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });//코드 200에 html데이터를 반환 한다고 알려주고 res.end로 위에서 받은 매개변수 data를 문서에 나타나게 한다.
  } else if (req.method === 'POST' && req.url === '/signup') {//매서드가 POST이고 url이 /signup이면 실행하는 부분
    let body = '';//데이터를 저장할 빈 문자열 변수를 초기화.
    req.on('data', chunk => {//
      body += chunk.toString();//위에서 만든 비워놓은body에 chunk를 사용하여 body에 데이터를 저장.
    });
    req.on('end', async () => {
      const postData = qs.parse(body);
      const name = postData.name;
      const Email = postData.Email;
      const username = postData.username;
      const password = postData.password;
      if (username && password) {
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          const query = 'INSERT INTO users (name, Email, username, password) VALUES (?, ?, ?, ?)';
          connection.query(query, [name, Email, username, hashedPassword], (err, results) => {
            if (err) {
              console.error('데이터베이스에 사용자 삽입 오류:', err);
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Internal Server Error');
              return;
            }
            res.writeHead(302, { 'Location': '/' });
            res.end();
          });
        } catch (err) {
          console.error('비밀번호 해싱 오류:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
      }
    });
  } else if (req.method === 'POST' && req.url === '/login') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const postData = qs.parse(body);
      const username = postData.username;
      const password = postData.password;
      if (username && password) {
        const query = 'SELECT * FROM users WHERE username = ?';
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
                res.writeHead(302, { 'Location': '/' });
                res.end();
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
  } else if (req.method === 'POST' && req.url === '/submit') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const postData = qs.parse(body);
      const title = postData.title;
      const content = postData.content;
      const date = new Date().toLocaleString();
      const query = 'INSERT INTO submissions (title, content, date) VALUES (?, ?, ?)';
      connection.query(query, [title, content, date], (err, results) => {
        if (err) {
          console.error('데이터베이스에 제출물 삽입 오류:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(302, { 'Location': '/board' });
        res.end();
      });
    });
  } else if (req.method === 'GET' && req.url === '/board') {
    fs.readFile('board.html', 'utf8', (err, data) => {
      if (err) {
        console.error('board.html 읽기 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      const query = 'SELECT id, title, date FROM submissions';
      connection.query(query, (err, results) => {
        if (err) {
          console.error('데이터베이스에서 제출물 조회 오류:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        const links = results.map(submission => `
          <a href="/submission/${submission.id}">${submission.title}</a> - ${submission.date}
        `).join('<br>');

        data = data.replace('%DATA%', links);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
    });
  } else if (req.method === 'GET' && req.url.startsWith('/submission/')) {
    const id = req.url.split('/').pop();
    const query = 'SELECT title, content, date FROM submissions WHERE id = ?';
    connection.query(query, [id], (err, results) => {
      if (err) {
        console.error('데이터베이스에서 제출물 조회 오류:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      if (results.length > 0) {
        const submission = results[0];
        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        res.end(`
          <h1>제출된 데이터</h1>
          <p><strong>제목:</strong> ${submission.title}</p>
          <p><strong>내용:</strong> ${submission.content}</p>
          <p><strong>날짜:</strong> ${submission.date}</p>
          <a href="/board">뒤로가기</a>
        `);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});
server.listen(3000, () => {
  console.log('서버가 3000번 포트에서 실행 중입니다');
});
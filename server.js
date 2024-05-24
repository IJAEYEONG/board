const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const connection = require('./db.js');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile('index.html', 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.method === 'GET' && req.url === '/signup') {
    fs.readFile('singup.html', 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.method === 'POST' && req.url === '/signup') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const postData = qs.parse(body);
      const username = postData.username;
      const password = postData.password;

      if (username && password) {
        const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
        connection.query(query, [username, password], (err, results) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
          }
          res.writeHead(302, { 'Location': '/' });
          res.end();
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
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      const query = 'SELECT id, title, date FROM submissions';
      connection.query(query, (err, results) => {
        if (err) {
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
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }

      if (results.length > 0) {
        const submission = results[0];
        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        res.end(`
          <h1>Submitted Data</h1>
          <p><strong>Title:</strong> ${submission.title}</p>
          <p><strong>Content:</strong> ${submission.content}</p>
          <p><strong>Date:</strong> ${submission.date}</p>
          <a href="/board">Go Back</a>
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
  console.log('Server is listening on port 3000');
});

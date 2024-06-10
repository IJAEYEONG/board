const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/api/generate-html', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Generated HTML</title>
      </head>
      <body>
        <h1>Hello, World!</h1>
        <p>test</p>
      </body>
    </html>
  `;
  res.send(html);
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000.');
});

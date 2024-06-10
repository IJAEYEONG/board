function sendHtmlResponse(res, data) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(data);
}
module.exports={
  sendHtmlResponse
}
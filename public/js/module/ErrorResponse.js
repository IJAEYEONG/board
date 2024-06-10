function sendErrorResponse(res, message) {
  res.writeHead(500, { "Content-Type": "text/plain" });
  res.end(message);
}
module.exports={
  sendErrorResponse
}
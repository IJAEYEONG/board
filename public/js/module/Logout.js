const parseCookies=require('./parseCookies.js')
const deleteSession =require('./deleteSession.js')
function handleLogoutRequest(req, res) {
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies.sessionId; // 쿠키에서 세션 ID를 가져오는 함수가 있다고 가정
    
    deleteSession(sessionId, (err) => {
      if (err) {
        console.error("세션 삭제 오류:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      
      res.setHeader("Set-Cookie", "sessionId=; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
      res.writeHead(302, { Location: "/" });
      res.end();
    });
  }
  module.exports={
    handleLogoutRequest
  }

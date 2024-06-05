const crypto = require("crypto");
const connection = require("./db.js");
function createSession(sessionData, callback) {
  const sessionId = crypto.randomBytes(16).toString("hex");
  //세션 id를 16바이트의 랜덤 스트링을 hex형태로 바꿈
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  //세션 만료시간 부분 현재시간+24한것을 만듬
  console.log(typeof sessionData);
  console.log(sessionData);
  const query =
    "INSERT INTO sessions (session_id, session_data, expires_at) VALUES (?, ?, ?)";
  //session테이블에 id,data,시간을 삽입하는 쿼리
  connection.query(
    query,
    [sessionId, JSON.stringify(sessionData), expiresAt],
    (err) => {
      if (err) {
        return callback(err);
      }
      callback(null, sessionId);
    }
  );
  //위에있는 쿼리문을 실행하고 id, 데이터 ,시간을 받아서 쿼리에 저장 오류가없으면 null과 id를 콜백해서 저장 후 함수 종료.
}
module.exports=createSession
const connection = require("./db.js");
function updateSession(sessionId, sessionData, callback) {
  const query =
    "UPDATE sessions SET session_data = ?, expires_at = ? WHERE session_id = ?";
  //세션 테이블을 업데이트한다고 선언 id와같은 세션 데이터와 시간을 업데이트하는 부분
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  // 시간만료시간은 현재시간+24
  connection.query(
    query,
    [JSON.stringify(sessionData), expiresAt, sessionId],
    (err) => {
      // 위에 쿼리문을 실행하고 받은 데이터를 json화 시키고 시간, id를 세션 테이블에 저장
      if (err) {
        // 오류가 났으면 콜백으로 에러를 반환하고 종료
        return callback(err);
      }
      callback(null);
      // 오류가없으면 콜백으로 null을 반환시켜준다.
    }
  );
}
module.exports=updateSession
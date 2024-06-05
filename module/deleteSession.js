const connection = require("./db.js");
function deleteSession(sessionId, callback) {
  const query = "DELETE FROM sessions WHERE session_id = ?";
  // id에 맞는 세션 테이블 찾는 부분
  connection.query(query, [sessionId], (err) => {
    // 쿼리문을 실행해서 id를 삭제한후 저장.

    if (err) {
      return callback(err);
    }
    //오류 나면 콜백으로 오류 보내주고 return으로 함수 종류
    callback(null);
  });
  //오류없으면 null반환
}
module.exports=deleteSession
const connection = require("./db.js");
function readSession(sessionId, callback) {
  const query =
    "SELECT session_data FROM sessions WHERE session_id = ? AND expires_at > NOW()"; //id와 같은 데이터와 시간을 선택
  connection.query(query, [sessionId], (err, results) => {
    if (err) {
      //만약 에러가 발생했다면 콜백으로 에러를 말해주고 return 으로 함수종료
      return callback(err);
    }
    if (results.length === 0) {
      //만약 results안에 값이 없다면 값이없다고null반환하고 함수종료
      return callback(null, null);
    }
    const sessionData = JSON.parse(results[0].session_data);
    //세션데이터 첫번째를 js객체형태로 바꿔서 sessionData에 저장
    console.log(sessionData);
    callback(null, sessionData);
    //에러가 없으면 null과 데이터를 반환해서 저장
  }); //
}
module.exports=readSession
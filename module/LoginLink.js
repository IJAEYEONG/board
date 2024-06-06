// let loginLink = "";
// let signupLink = "";
// if (sessionData && sessionData.loggedIn) {
//   loginLink = '<a href="/logout">로그아웃</a>';
// } else {
//   loginLink = '<a href="/login">로그인</a>';
//   signupLink = '<a href="/signup">회원가입</a>';
// }
function generateAuthLinks(sessionData) {
    let loginLink = "";
    let signupLink = "";
    if (sessionData && sessionData.loggedIn) {
      loginLink = '<a href="/logout">로그아웃</a>';
    } else {
      loginLink = '<a href="/login">로그인</a>';
      signupLink = '<a href="/signup">회원가입</a>';
    }
    return { loginLink, signupLink };
  }
  module.exports=generateAuthLinks
  
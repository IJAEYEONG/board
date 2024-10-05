function generateAuthLinks(sessionId) {
  if (sessionId) {
    return {
      loginLink: "",
      signupLink: '<a href="/logout">로그아웃</a>',
      mypage: '<a href="/mypage">마이페이지</a>',
    };
  } else {
    return {
      loginLink: '<a href="/login">로그인</a>',
      signupLink: '<a href="/signup">회원가입</a>',
    };
  }
}

module.exports = generateAuthLinks;

function generateAuthLinks(sessionId) {
  if (sessionId) {
    return {
      loginLink: '',
      signupLink: '<a href="/logout">로그아웃</a>',
    };
  } else {
    return {
      loginLink: '<a href="/login">로그인</a>',
      signupLink: '<a href="/signup">회원가임</a>',
    };
  }
}

module.exports = generateAuthLinks;

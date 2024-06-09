const parseCookies = (cookie = "") =>
  //빈 문자열로 설정.
  cookie
    .split(";")
    //쿠키 문자열을 세미콜론 기준으로 분할해서 배열로 넣음
    .map((v) => v.split("="))
    //위에서 분할된 쿠키 항목을 다시 =를 기준으로 키와 값으로 나누는 부분
    .reduce((acc, [key, value]) => {
      //acc는 누적값을 의미
      acc[key.trim()] = decodeURIComponent(value);
      //key.trim()은 키에서 공백을 제거 하고 decodeURIComponent(value);이 url 인코딩된 경우 디코딩 해버림
      return acc;
      //누적된 값을 종료
    }, {});
    module.exports=parseCookies
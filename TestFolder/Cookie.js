const cookieString = "name=John Doe; age=30; city=New York";
const cookiesArray = cookieString.split(";");
const splitCookies = cookiesArray.map((v) => v.split("="));
const test =splitCookies.reduce((acc,[key,value])=>{
  acc[key.trim()]=decodeURIComponent(value);
  return acc;
},{});
// splitCookies = [["name", "John Doe"], [" age", "30"], [" city", "New York"]]
console.log(cookieString)
console.log(cookiesArray)
console.log(splitCookies)
console.log(test)
// cookiesArray = ["name=John Doe", " age=30", " city=New York"]
function populateTemplate(templateData, loginLink, signupLink, linksHTML) {
  let data = templateData.replace("%LOGIN_LINK%", loginLink);
  data = data.replace("%signup_Link%", signupLink);
  data = data.replace("%a%", linksHTML);
  return data;
}
module.exports={
  populateTemplate
}
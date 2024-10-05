function populateTemplate(templateData, loginLink, signupLink, linksHTML) {
  let data = templateData.replace("%LOGIN_LINK%", loginLink);
  data = data.replace("%SIGNUP_LINK%", signupLink);
  data = data.replace("%LINKS_HTML%", linksHTML);
  return data;
}

module.exports = { populateTemplate };

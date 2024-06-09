// modules.js
const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const connection = require('./public/js/module/db.js');
const {handleGetBoardRequest} = require('./public/js/module/Request.js')
const createSession = require('./public/js/module/CreateSession.js');
const readSession = require('./public/js/module/readSession.js');
const updateSession = require('./public/js/module/updateSession.js');
const deleteSession = require('./public/js/module/deleteSession.js');
const parseCookies = require('./public/js/module/parseCookies.js');
const linksModule = require('./public/js/module/fs.js');
const generateAuthLinks = require('./public/js/module/LoginLink.js');
const fsReadFile = require('./public/js/module/fsReadFile.js');
const { serveCssFile } = require('./public/js/module/css.js');
const { serveHtmlFile } = require('./public/js/module/FsRead.js');
const { handleRootRequest } = require('./public/js/module/test.js');
const { handleBoardListRequest } = require('./public/js/module/test2.js');
const { edit } = require('./public/js/module/edit.js');

module.exports = {
  http,
  fs,
  qs,
  bcrypt,
  crypto,
  connection,
  createSession,
  readSession,
  handleGetBoardRequest,
  updateSession,
  deleteSession,
  parseCookies,
  linksModule,
  generateAuthLinks,
  fsReadFile,
  serveCssFile,
  serveHtmlFile,
  handleRootRequest,
  handleBoardListRequest,
  edit
};

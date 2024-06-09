// modules.js
const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const connection = require('./module/db.js');
const createSession = require('./module/CreateSession.js');
const readSession = require('./module/readSession.js');
const updateSession = require('./module/updateSession.js');
const deleteSession = require('./module/deleteSession.js');
const parseCookies = require('./module/parseCookies.js');
const linksModule = require('./module/fs.js');
const generateAuthLinks = require('./module/LoginLink.js');
const fsReadFile = require('./module/fsReadFile.js');
const { serveCssFile } = require('./module/css.js');
const { serveHtmlFile } = require('./module/FsRead.js');
const { handleRootRequest } = require('./module/test.js');
const { handleBoardListRequest } = require('./module/test2.js');
const { edit } = require('./module/edit.js');

module.exports = {
  http,
  fs,
  qs,
  bcrypt,
  crypto,
  connection,
  createSession,
  readSession,
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

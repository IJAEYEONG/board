// app.js
const createSession = require('./session');

const sessionData = {
  userId: 1,
  username: 'testUser'
};

createSession(sessionData, (err, sessionId) => {
  if (err) {
    console.error('Error creating session:', err);
  } else {
    console.log('Session created successfully with ID:', sessionId);
  }
});

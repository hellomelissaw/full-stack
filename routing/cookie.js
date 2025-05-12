const {
    getSessionId
} = require('../dataservice/session')

async function buildCookie(conn, uid) {
    const sessionId = await getSessionId(conn, uid);
    let sessionCook = '';
    if (sessionId) {
        console.log("Session id in build cookie: ", sessionId);
        let sessionDate = new Date();
        sessionDate = sessionDate.setDate(sessionDate.getDate() + 3);
        sessionCook = 'session=' + sessionId + '; Expires=' + sessionDate + '; HttpOnly';
    } else {
        console.log("No sessionID to build cookie")
        return null;
    }
    return sessionCook;
}

module.exports = { 
    buildCookie
 }

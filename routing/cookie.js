const {
    getSessionId
} = require('../dataservice/session')

async function buildCookie(conn, uid) {
    const sessionId = await getSessionId(conn, uid);
    let sessionCook = '';
    if (sessionId) {
        let sessionDate = new Date();
        sessionDate = sessionDate.setDate(sessionDate.getDate() + 3);
        sessionCook = 'session=' + sessionId + '; Expires=' + sessionDate + '; HttpOnly ';
    } else {
        return null;
    }
    return sessionCook;
}

module.exports = { 
    buildCookie
 }

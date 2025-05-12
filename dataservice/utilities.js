const {
    getSessionId
} = require('../dataservice/session');

////////////////////////////////////////////////////////////
// QUERIES
////////////////////////////////////////////////////////////

const update_password = `UPDATE user
                        SET password = ?
                        WHERE uid = ?`;

////////////////////////////////////////////////////////////
// GENERAL QUERYING
////////////////////////////////////////////////////////////

async function findOne(conn, table, whereclause, value) {  // TODO return error if more than one row
    const rows = await conn.query(`SELECT *           
                                  FROM \`${table}\` 
                                  WHERE \`${whereclause}\` = ?
                                `, [value]);
    return rows[0] || null;
}


async function buildCookie(conn, uid) {
    const sessionId = await getSessionId(conn, uid);
    let sessionCook = '';
    if (sessionId) {
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
                    findOne,
                    buildCookie
                 }

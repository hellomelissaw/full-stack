const { randomBytes } = require('node:crypto');
const { findOne } = require("./utilities");

// Variable for exporting new session ID
let sessionUUID = '';

////////////////////////////////////////////////////////////
// QUERIES
////////////////////////////////////////////////////////////

const add_pid_to_session = 'UPDATE session SET pid = ? WHERE uid = ?';
const username_exists = 'SELECT 1 FROM user WHERE username = ? LIMIT 1';
const modify_session_id = 'UPDATE session SET session_id = ? WHERE uid = ?';
const insert_session_id = 'INSERT INTO session (session_id, uid) values (?, ?)'

////////////////////////////////////////////////////////////
// SESSION-SPECIFIC INFO
////////////////////////////////////////////////////////////

async function userIsActive(conn, uid) {
    const active = await conn.query('SELECT * FROM session WHERE uid = ?', [uid]);
    return active.length > 0;
}

async function createSession(conn, sessionID, uid) {
    // let sessionUUID;
    // if (!sessionID) {
    //     sessionUUID = randomBytes(8).toString('hex');
    
    // } else {
    //     sessionUUID = sessionID
    // }
    const sessionUUID = randomBytes(8).toString('hex');

    if (await userIsActive(conn, uid)) {
        try {
            await conn.query(modify_session_id, [uid]);
            return { success: true, sessionID: sessionUUID };

        } catch (err) {
            return { success: false, error: err.message };

        }

    } else {
        try {  
            await conn.query(insert_session_id, [sessionUUID, uid]);
            return { success: true, sessionID: sessionUUID };
    
        } catch(err) {
            return { success: false, error: err.message };
    
        }

    }

}

async function usernameExists(conn, username) {
    let exists;
    try {
        exists = await conn.query(username_exists, [username]);
        
    } catch(err) {
        console.log(err);
        return true;
    }


    if (exists.length >= 1) {
        return true;

    } else {
        return false;
    }
}

async function createNewAccount (conn, username, password) {
    try {
        const result = await conn.query('INSERT INTO user (username, password) values (?, ?)', [username, password]);
        return { success: true, uid: result.insertId };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

async function getSessionUser(conn, sessionID) {
    console.log(`sessionUD in getSessionUser: ${sessionID}`);
    const session = await findOne(conn, 'session', 'session_id', sessionID);
    if (session) {
        return await findOne(conn, 'user', 'uid', session.uid);
    }
    return null;
}

async function deleteSession(conn, sessionID) {
    try {
        await conn.query("DELETE FROM session WHERE session_id = ?", [sessionID]);

    } catch (err) {
        console.log(err.message);
    }
}

async function getSessionStatus(conn, sessionID) {
    const result = await conn.query("SELECT * FROM session WHERE session_id = ?", [sessionID]);
    return result.length > 0;
}

async function addPidToSession(conn, pid, uid) {
    try {
        const result = await conn.query(add_pid_to_session, [pid, uid]);
        return true;

    } catch (err) {
        console.log(err.message);
        return false;
    }
}

async function getSessionPid(conn, sessionID) {
    console.log(`sessionID in getSessionPid: ${sessionID}`);
    const result = await conn.query("SELECT pid FROM session WHERE session_id = ?", [sessionID]);
    if(result.length === 0) {
        return null;
    }

    return result[0].pid;
}

async function getSessionId(conn, uid) {
    console.log("uid in getSessionId", uid);
    const session = await findOne(conn, 'session', 'uid', uid);

    if (session) {
        return session[0].session_id;
    
    } else {
        return null;
    }
}


module.exports = { 
                    createSession,
                    getSessionUser,
                    deleteSession,
                    getSessionStatus,
                    addPidToSession,
                    getSessionPid,
                    createNewAccount,
                    usernameExists,
                    getSessionId
                 }

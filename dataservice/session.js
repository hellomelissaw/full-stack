const { create_session, findOne, add_pid_to_session } = require("./utilities");

////////////////////////////////////////////////////////////
// SESSION-SPECIFIC INFO
////////////////////////////////////////////////////////////

async function userIsActive(conn, uid) {
    const active = await conn.query('SELECT * FROM session WHERE uid = ?', [uid]);
    return active.length > 0;
}

async function createSession(conn, sessionID, uid) {
    console.log(`sessionID: ${sessionID}, uid: ${uid}`);
    if (await userIsActive(conn, uid)) {
        try {
            await conn.query('DELETE FROM session WHERE uid = ?', [uid]);

        } catch (err) {
            return { success: false, error: err.message };

        }
    }

    try {
        await conn.query(create_session, [sessionID, uid]);
        return { success: true };

    } catch {
        return { success: false, error: err.message };

    }


}

async function getSessionUser(conn, sessionID) {
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
    const result = await conn.query("SELECT pid FROM session WHERE session_id = ?", [sessionID]);
    if(result.length === 0) {
        return null;
    }

    return result[0].pid;
}


module.exports = { 
                    createSession,
                    getSessionUser,
                    deleteSession,
                    getSessionStatus,
                    addPidToSession,
                    getSessionPid
                 }
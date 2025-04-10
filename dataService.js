////////////////////////////////////////////////////////////
// PREPARED QUERIES
////////////////////////////////////////////////////////////

const sql_conn = `SELECT
                location_connection.loc_id,
                location_connection.conn_id,
                location.name AS conn_name
            FROM
                location_connection
            JOIN 
                location
            ON 
                location_connection.conn_id = location.loc_id
            WHERE
                location_connection.loc_id = ?`;

const update_player_loc_id = 'UPDATE player SET loc_id = ? WHERE pid = ?';

const create_player = 'INSERT INTO player (uid, name, loc_id) values (?, ?, ?)';

const create_session = 'INSERT INTO session (session_id, uid) values (?, ?)';

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

async function userIsActive(conn, uid) {
    const active = await conn.query('SELECT * FROM session WHERE uid = ?', [uid]);
    return active.length > 0;
}

async function createSession(conn, sessionID, uid) {
    console.log(`sessionID: ${sessionID}, uid: ${uid}`);
    if (await userIsActive()) {
        try {
            await conn.query('DELETE FROM session WHERE uid = ?', [uid]);

        } catch(err) {
            return { success: false, error: err.message }

        }
    } 

    try {
        await conn.query('INSERT INTO session (session_id, uid) VALUES (?, ?)', [sessionID, uid]);
        return { success: true }
        
    } catch {
        return { success: false, error: err.message }

    }
   

}

async function getSessionUser(conn, sessionID) {
    const session = await findOne(conn, 'session', 'session_id', sessionID);
    if (session) {
        return session.uid;
    
    } else {
        return null;
    }
}

////////////////////////////////////////////////////////////
// USER AND PLAYER DATA QUERIES
////////////////////////////////////////////////////////////

async function getUserData(conn, username) { // should refactor to reuse code
    try {
        const ud = await findOne(conn, 'user', 'username', username);
        
        if (ud) {
            return { success: true, user_data: ud}
        
        } else {
            console.log(`User with username ${username} not found.`);
            return {success: false, error: "User not found" }

        }
    } catch(err) {
        return { success: false, error: err.message }

    }

}

async function getPlayerData(conn, pid) {
    try {
        const pd = await findOne(conn, 'player', 'pid', pid);
        
        if (pd) {
            return { success: true, player_data: pd}
        
        } else {
            console.log(`Player with pid ${pid} not found.`);
            return {success: false, error: "Player not found" }

        }
    } catch(err) {
        return { success: false, error: err.message }

    }
}

async function getUserPlayers(conn, uid) {
    let player_ids = await conn.query("SELECT * FROM player WHERE uid = ?", [uid])
    return player_ids
}

async function createNewPlayer(conn, uid, name) {
    try {
        const newPlayer = await conn.query(create_player, [uid, name, 0])
        return { success: true, pid: newPlayer.insertId };
    
    } catch(err) {
        return { success: false, error: err.message };

    }
    
}


////////////////////////////////////////////////////////////
// LOCATION DATA QUERIES
////////////////////////////////////////////////////////////

async function getLocationPageData(conn, id) {
    const loc =  await findOne(conn, 'location', 'loc_id', id);  // TODO Handle if null
    const connections = await conn.query(sql_conn, [id]);
   
    const locationData = {
        loc_id: loc.loc_id,
        name: loc.name,
        connections: Object.keys(connections).map(key => ({
          conn_id: connections[key].conn_id,
          conn_name: connections[key].conn_name
        }))
      };

    return locationData;
}

async function updatePlayerLocation(conn, id, pid) {
    await conn.query(update_player_loc_id, [id, pid]);
}

async function insertLocation(conn, name, emojis, connections) {
    try{
        const result = await conn.query("INSERT INTO location (name, emojis) VALUES (?, ?)", [name, emojis]);
        const loc_id = result.insertId;
        if (connections) {
            const connectionIds = connections.split(',').map(id => id.trim());
            for (const connId of connectionIds) {
                await conn.query("INSERT INTO location_connection (loc_id, conn_id) VALUES (?, ?)", [loc_id, connId]);
            }
        }
        return 'Location inserted successfully!';
    
    } catch(err) {
         return err.message;
    }
   
}

async function getSessionStatus(conn, sessionID) {
    const result = await conn.query("SELECT * FROM session WHERE session_id = ?", [sessionID]);
    return result.length > 0;
}

module.exports = { getLocationPageData, 
                   getPlayerData: getPlayerData,
                   updatePlayerLocation: updatePlayerLocation,
                   insertLocation,
                   getUserPlayers,
                   createNewPlayer,
                   createSession,
                   getUserData,
                   getSessionUser,
                   getSessionStatus
                 }

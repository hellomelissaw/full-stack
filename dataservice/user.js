
const { findOne, 
        create_player, 
        get_user_players,
        update_password, 
        create_account
      } = require("./utilities");

////////////////////////////////////////////////////////////
// USER DATA QUERIES
////////////////////////////////////////////////////////////

async function getUserData(conn, username) {
    try {
        const ud = await findOne(conn, 'user', 'username', username);

        if (ud) {
            return { success: true, user_data: ud };

        } else {
            console.log(`User with username ${username} not found.`);
            return { success: false, error: "User not found" };

        }
    } catch (err) {
        return { success: false, error: err.message };

    }

}

async function getUserPlayers(conn, uid) {
    let player_ids = await conn.query("SELECT * FROM player WHERE uid = ?", [uid]);
    return player_ids;
}

async function createAccount(conn, uid, name) {
    try {
        const newAccount = await conn.query(create_account, [uid, name]);
        return {success: true, uid: newAccount.insertId};
    } catch (err) {
        return { success: false, error: err.message};
    }
}

async function updatePassword(conn, hash, uid) {
    try {
        //console.log(`conn: ${conn}, hash: ${hash} , uid: ${uid}`);
        const result = await conn.query("UPDATE user SET password = ? WHERE uid = ?", [hash, uid]);
	    return { success: true }
    
    } catch (err) {
        console.table(err);
        return { success: false, error: err.message };
    }
}


async function loadGames(conn, uid) {
    const games = await conn.query(get_user_players, [uid]);
    return games;
}

////////////////////////////////////////////////////////////
// PLAYER DATA QUERIES
////////////////////////////////////////////////////////////

async function getPlayerData(conn, pid) {
    try {
        const pd = await findOne(conn, 'player', 'pid', pid);

        if (pd) {
            return { success: true, player_data: pd };

        } else {
            console.log(`Player with pid ${pid} not found.`);
            return { success: false, error: "Player not found" };

        }
    } catch (err) {
        return { success: false, error: err.message };

    }
}

async function createNewPlayer(conn, uid, name) {
    try {
        const newPlayer = await conn.query(create_player, [uid, name, 0]);
        return { success: true, pid: newPlayer.insertId };

    } catch (err) {
        return { success: false, error: err.message };

    }

}

async function getPlayerStats(conn, pid) {
    try {
        const player = await findOne(conn, 'player', 'pid', pid);
        if (player) {
            stats = { 
                HP: player.health,
                XP: player.experience,
                level: player.level
            }
            return { success: true, player_stats: stats};
        
        } else {
            return { success: false, message: "Error getting player stats."}
        }
    } catch (err) {
        return { success: false, error: err.message };
    }

}

module.exports = { 
                    getUserData,
                    getPlayerData,
                    getUserPlayers,
                    createNewPlayer,
                    loadGames,
                    updatePassword,
                    createAccount,
                    getPlayerStats
                 }

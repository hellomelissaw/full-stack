const { findOne, create_player, get_user_players } = require("./utilities");

////////////////////////////////////////////////////////////
// USER AND PLAYER DATA QUERIES
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

async function getUserPlayers(conn, uid) {
    let player_ids = await conn.query("SELECT * FROM player WHERE uid = ?", [uid]);
    return player_ids;
}

async function createNewPlayer(conn, uid, name) {
    try {
        const newPlayer = await conn.query(create_player, [uid, name, 0]);
        return { success: true, pid: newPlayer.insertId };

    } catch (err) {
        return { success: false, error: err.message };

    }

}

async function loadGames(conn, uid) {
    const games = await conn.query(get_user_players, [uid]);
    return games;
}


module.exports = { 
                    getUserData,
                    getPlayerData,
                    getUserPlayers,
                    createNewPlayer,
                    loadGames
                 }
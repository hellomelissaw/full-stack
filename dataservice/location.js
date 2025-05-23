const { findOne } = require("./utilities");

const { updateXP } = require("./action");

////////////////////////////////////////////////////////////
// QUERIES
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

const update_player_loc_id = `UPDATE player 
                              SET loc_id = ? 
                              WHERE pid = ?`;

const sql_actions = `
                    SELECT
                        location_action.loc_id,
                        location_action.act_id,
                        action.name AS act_name
                    FROM
                        location_action
                    JOIN
                        action ON location_action.act_id = action.act_id
                    WHERE
                        location_action.loc_id = ?
                        AND NOT EXISTS (
                            SELECT 1
                            FROM player_action
                            WHERE
                                player_action.loc_id = location_action.loc_id
                                AND player_action.act_id = location_action.act_id
                                AND player_action.pid = ?
                        )
                    `;


const location_effect = `SELECT * FROM location_effect where loc_id = ?`

////////////////////////////////////////////////////////////
// LOCATION DATA QUERIES
////////////////////////////////////////////////////////////

async function getLocationPageData(conn, id, pid) {
    const loc = await findOne(conn, 'location', 'loc_id', id); // TODO Handle if null
    const connections = await conn.query(sql_conn, [id]);
    const actions = await conn.query(sql_actions, [id, pid]);

    const locationData = {
        loc_id: loc.loc_id,
        name: loc.name,
        image_file_name: loc.name.toLowerCase().replace(/\s+/g, '-'),
        description: loc.description,
        connections: Object.keys(connections).map(key => ({
            conn_id: connections[key].conn_id,
            conn_name: connections[key].conn_name
        })),
        actions: Object.keys(actions).map(key => ({
            act_id: actions[key].act_id,
            act_name: actions[key].act_name
        }))
    };

    const playerData = await findOne(conn, 'player', 'pid', pid); // TODO Handle if null

    return { loc: locationData, player: playerData };
}

async function updatePlayerLocation(conn, id, pid) {
    await conn.query(update_player_loc_id, [id, pid]);
}


async function insertLocation(conn, name, emojis, connections) {
    try {
        const result = await conn.query("INSERT INTO location (name, emojis) VALUES (?, ?)", [name, emojis]);
        const loc_id = Number(result.insertId);
        if (connections) {
            const connectionIds = connections.split(',').map(id => parseInt(id.trim(), 10));
            for (const connId of connectionIds) {
                if(connId !== loc_id) {
                    await conn.query("INSERT INTO location_connection (loc_id, conn_id) VALUES (?, ?)", [loc_id, connId]);
                    await conn.query("INSERT INTO location_connection (loc_id, conn_id) VALUES (?, ?)", [connId, loc_id]);
                }
            }
        }
        return 'Location inserted successfully!';

    } catch (err) {
        return err.message;
    }

}

async function applyLocationEffect(conn, locID, pid) {
    try {
        const effect = await conn.query(location_effect, [locID]);
        if (effect.length > 0) {
            switch(effect[0].effect_type) {
                case 'game_over':
                    return await updateXP(conn, 0, pid);     
                case 'heal':
                    // TODO: add healing effect 
                default: return { success: false, error: "Effect not valid." };
            }
        }
        return { success: true, error: null };
        
    } catch(err) {
        return { success: false, error: err.message }

    }

}


module.exports = { 
                    getLocationPageData,
                    updatePlayerLocation,
                    insertLocation,
                    applyLocationEffect
                 }

const { findOne, sql_conn, update_player_loc_id } = require("./utilities");


////////////////////////////////////////////////////////////
// LOCATION DATA QUERIES
////////////////////////////////////////////////////////////

async function getLocationPageData(conn, id) {
    const loc = await findOne(conn, 'location', 'loc_id', id); // TODO Handle if null
    const connections = await conn.query(sql_conn, [id]);
    
    const locationData = {
        loc_id: loc.loc_id,
        name: loc.name,
        description: loc.description,
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
    try {
        const result = await conn.query("INSERT INTO location (name, emojis) VALUES (?, ?)", [name, emojis]);
        const loc_id = result.insertId;
        if (connections) {
            const connectionIds = connections.split(',').map(id => id.trim());
            for (const connId of connectionIds) {
                await conn.query("INSERT INTO location_connection (loc_id, conn_id) VALUES (?, ?)", [loc_id, connId]);
            }
        }
        return 'Location inserted successfully!';

    } catch (err) {
        return err.message;
    }

}


module.exports = { 
                    getLocationPageData,
                    updatePlayerLocation,
                    insertLocation
                 }

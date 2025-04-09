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


////////////////////////////////////////////////////////////
// QUERYING
////////////////////////////////////////////////////////////

async function findOne(conn, table, whereclause, value) {  // TODO return error if more than one row
    const rows = await conn.query(`SELECT *           
                                  FROM \`${table}\` 
                                  WHERE \`${whereclause}\` = ?
                                `, [value]);
    return rows[0] || null;
}

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

async function getPlayerData(conn, pid) {
    let player_data = await findOne(conn, 'player', 'pid', pid);  // TODO Handle if null
    return player_data;
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

module.exports = { getLocationPageData, 
                   getPlayerData: getPlayerData,
                   updatePlayerLocation: updatePlayerLocation,
                   insertLocation
                 }

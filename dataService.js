const { LocationPageInfo } = require('./PageInfo');

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

const update_user_location = 'UPDATE user SET loc_id = ? WHERE uid = ?';


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
    const loc = await findOne(conn, 'location', 'loc_id', id);  // TODO Handle if null
    const connections = await conn.query(sql_conn, [id]);
    return new LocationPageInfo(loc.name, loc, connections);
}

async function getUserData(conn, uid) {
    let user_data = await findOne(conn, 'user', 'uid', uid);  // TODO Handle if null
    return user_data;
}

async function updateUserLocation(conn, id, uid) {
    await conn.query(update_user_location, [id, uid]);
}

async function insertLocation(name, emojis) {
    try{
        await conn.query("INSERT INTO location (name, emojis) VALUES (?, ?)", [name, emojis]);
        console.log("inserted location");
        return 'Location inserted successfully!';
    
    } catch(err) {
        return err.message;
    }
   
}

module.exports = { getLocationPageData, 
                   getUserData, 
                   updateUserLocation,
                   insertLocation
                 }

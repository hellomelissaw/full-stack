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
    const loc =  await findOne(conn, 'location', 'loc_id', id);  // TODO Handle if null
    const connections = await conn.query(sql_conn, [id]);
    console.table(loc);
    console.table(connections); 
    Object.keys(connections).map(key => {
      console.log(connections[key]);
    });
   
    const locationData = {
        loc_id: loc.loc_id,
        name: loc.name,
        connections: Object.keys(connections).map(key => ({
          conn_id: connections[key].conn_id,
          conn_name: connections[key].conn_name
        }))
      };
      
    console.table(locationData);
    return locationData;
    // const loc = await findOne(conn, 'location', 'loc_id', id);  // TODO Handle if null
    // const connections = await conn.query(sql_conn, [id]);
    // return new LocationPageInfo(loc.name, loc, connections);
}

async function getUserData(conn, uid) {
    let user_data = await findOne(conn, 'user', 'uid', uid);  // TODO Handle if null
    return user_data;
}

async function updateUserLocation(conn, id, uid) {
    await conn.query(update_user_location, [id, uid]);
}

async function insertLocation(conn, name, emojis) {
    try{
        await conn.query("INSERT INTO location (name, emojis) VALUES (?, ?)", [name, emojis]);
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

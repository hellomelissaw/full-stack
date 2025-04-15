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
exports.sql_conn = sql_conn;

const update_player_loc_id = 'UPDATE player SET loc_id = ? WHERE pid = ?';
exports.update_player_loc_id = update_player_loc_id;

const create_player = 'INSERT INTO player (uid, name, loc_id) values (?, ?, ?)';
exports.create_player = create_player;

const create_session = 'INSERT INTO session (session_id, uid) values (?, ?)';
exports.create_session = create_session;

const add_pid_to_session = 'UPDATE session SET pid = ? WHERE uid = ?';
exports.add_pid_to_session = add_pid_to_session;

const get_user_players = `SELECT 
                            player.pid, 
                            player.name, 
                            location.name AS loc_name 
                        FROM 
                            location JOIN player
                        ON 
                            location.loc_id = player.loc_id
                        WHERE 
                            player.uid = ?
                        ORDER BY 
                            player.pid`;
exports.get_user_players = get_user_players;

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
exports.findOne = findOne;


module.exports = { findOne }

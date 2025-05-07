////////////////////////////////////////////////////////////
// QUERIES
////////////////////////////////////////////////////////////

const update_password = `UPDATE user
                        SET password = ?
                        WHERE uid = ?`;

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


module.exports = { 
                    findOne,
                 }

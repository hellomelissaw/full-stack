const uid = 1;
const hostname = 'localhost';
const port = 3000;

const http = require('http');
const url = require('url');
const mariadb = require('mariadb');

var pool;
let conn;

////////////////////////////////////////////////////////////
// CREATE DB POOL
////////////////////////////////////////////////////////////

// const pool = mariadb.createPool({
//     host: '127.0.0.1',
//     port: 3306,
//     user: 'admin',
//     password: 'your_password',
//     database: 'game',
//     connectionLimit: 5
// });

// Since we depend on the DB, it needs to be online
try {
    pool = mariadb.createPool({
        host: '127.0.0.1',         // Force usage of IPv4 on localhost
        port: '3306',              // Default port number used
        user: 'admin',             // This might be worth changing
        password: 'your_password', // This is
        database: 'game',
        connectionLimit: 5
    })
} catch (err) {
    console.log("DB Pool creation error: ", err);
    // Non-zero exit code indicates error
    process.exit(1);
}

////////////////////////////////////////////////////////////
// INITIALIZE DB CONNECTION
////////////////////////////////////////////////////////////

// NOT USING FOR NOW, MAYBE NEVER
// async function initDbConnection() {
//     try {
//        console.log("Awaiting connection from pool.");
//      let conn = await pool.getConnection();
//         console.log("Database connected.");
//     } catch (err) {
//         console.error("Database connection failed:", err);
//         process.exit(1); 
//     }
// 	return conn;
// }

////////////////////////////////////////////////////////////
// PREPARED QUERIES
////////////////////////////////////////////////////////////

sql_loc = 'SELECT * from location WHERE loc_id = ?';

sql_conn = `SELECT
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

sql_user = 'SELECT loc_id FROM user WHERE uid = ?';

update_user_location = 'UPDATE user SET loc_id = ? WHERE uid = ?';

////////////////////////////////////////////////////////////
// HELPER FUNCTIONS
////////////////////////////////////////////////////////////
function locationIsValid(connection_rows, user_loc_id, loc) {
    if(user_loc_id == loc) { return true; }

    let isValid = false;
    for(const row of connection_rows) {
        console.log(`conn_id: ${row.conn_id}, user_loc_id: ${user_loc_id}`)
        if(row.conn_id == user_loc_id) {
            isValid = true;
        }
    }
    return isValid;
}


async function findOne(conn, table, whereclause, value) {  // TODO return error if more than one row
    const rows = await conn.query(`SELECT *           
                                  FROM ? 
                                  WHERE ? = ?
                                `, [table, whereclause, value]);
    return rows[0] || null;
}


////////////////////////////////////////////////////////////
// REQUEST HANDLING
////////////////////////////////////////////////////////////

async function requestHandler(req, res) {
    try {
        conn = await pool.getConnection();
        if(!conn) {
            console.error("Database connection is missing!");
            throw new Error("Database connection is unavailable");
        }

        let html;
        const parsed = url.parse(req.url, true);
        //const user_loc = await conn.query(sql_user, [uid]);
        const user_info = await findOne(conn, 'loc_id', 'uid', uid);
        console.table(`user_info: ${user_info}`);

        if(parsed.pathname == '/location') {
            const id = parsed.query.locID;
            //const rows = await conn.query(sql_loc, [id]); // TODO: select single row
            const loc = await findOne(conn, 'location', 'loc_id', id);
            console.table(loc);

            const connection_rows = await conn.query(sql_conn, [id]);

            if(locationIsValid(connection_rows, user_info.loc_id, id)) {
                await conn.query(update_user_location, [id, uid]);

                html = `
                    <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <title>Currently adventuring...</title>
                        </head>
                        <body>
                            <h1>Welcome to the ${loc.name}. ${loc.emojis ? loc.emojis : ''}</h1>`;

                for (const row of connection_rows) {
                    html += `<button onclick="window.location.href='/location?locID=${row.conn_id}'">${row.conn_name}</button>`
                };
                            
                html += `
                    </body>
                    </html>
                `;
            } else {
                html = `
                <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>Game start!</title>
                    </head>
                    <body>
                        <h1>Invalid location! Go back to where you wehre!</h1>
                        <button onclick="window.location.href='/location?locID=${user_loc[0].loc_id}'">start</button>
                    </body>
                    </html>
    
                `;
            }
        
        } else {
            html = `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Game start!</title>
                </head>
                <body>
                    <h1>Welcome to the game, click start to start!</h1>
                    <button onclick="window.location.href='/location?locID=${user_loc[0].loc_id}'">start</button>
                </body>
                </html>

            `;
        }

       res.statusCode = 200;
       res.setHeader('Content-Type', 'text/html');
       res.setHeader('Cache-Control', 'no-cache');
       //console.log(html);
       res.end(html);
    
    } catch (err) {
        throw err;
    
    } finally {
        if(conn) conn.end();
    }

}


////////////////////////////////////////////////////////////
// SERVER STUFF
////////////////////////////////////////////////////////////

const server = http.createServer(requestHandler, () => {
    console.log("Creating server...");
});



server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
}).on("error", (err) => {
   console.error("Failed to start server", err);
});


process.on('SIGINT', async () => {
    try {
	
     if(server) {
         console.log("Closing server...");
         await new Promise(resolve => server.close(resolve));
         console.log("Server closed.");
    }
    if(conn) {
        await conn.end();
        console.log("Database connection closed.");
    }

    if(pool) {
        await pool.end();
        console.log("Connection pool closed. Summer is over.");
    }
    } catch (err) {
        console.error("Error during shutdown ", err);
  } finally {
        console.log("Bye.");
        process.exit(0); 
  }
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception: ', err);
    server.close(() => {
        console.log('HTTP server closed due to uncaught exception');
        pool.end();  // Close database pool
        process.exit(1);  // Exit the process with error code
    });
});

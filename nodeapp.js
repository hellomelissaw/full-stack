const uid = 1;
const hostname = 'localhost';
const port = 3000;

// Needed external packages
const http = require('http');
const url = require('url');
const mariadb = require('mariadb');

// Process variables
let conn;
let debug = false;

// Collect command line arguments
process.argv.forEach(function (value, index) {
    if (value === "debug" || value === "--debug") {
        debug = true;
    }
})

////////////////////////////////////////////////////////////
// PREPARED QUERIES
////////////////////////////////////////////////////////////

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
                                  FROM \`${table}\` 
                                  WHERE \`${whereclause}\` = ?
                                `, [value]);
    return rows[0] || null;
}


////////////////////////////////////////////////////////////
// REQUEST HANDLING
////////////////////////////////////////////////////////////

async function requestHandler(req, res) {
    // The main event loop will try to send out an HTML page or terminate gracefully if uncaught errors arise
    try {
        // Obtain a connection to the database or send out an HTTP 500 error page
        try {
            conn = await mariadb.createConnection({
                host: '127.0.0.1',         // Force usage of IPv4 on localhost
                port: 3306,                // Default port number
                user: 'admin',             // TODO - This might be worth changing
                password: 'your_password', // TODO - This is
                database: 'game'
            });
        } catch (err) {
            console.error("Database connection failed: ", err)
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(`<!DOCTYPE html><head><title>Error</title><body><h2>Database error:</h2><p>${err}</p></body></html>`);
        }
        if (debug) {
            console.log("Database object: ", conn);
        }
        // if (!conn) {
        //     console.error("Database connection is missing, exiting");
        //     process.exit(1);
        // }
        // Fetch empty set to test the database
        // try {
        //     await conn.query('SELECT 1 FROM dual WHERE FALSE')
        //     if (debug) {
        //         console.log("Database ping successful");
        //     }
        // } catch (err) {
        //     console.error("Database ping failed: ", err)
        //     res.statusCode = 500;
        //     res.setHeader('Content-Type', 'text/html');
        //     res.setHeader('Cache-Control', 'no-cache');
        //     res.end('<!DOCTYPE html><head><title>Error</title><body><p>Database error: ${err}</p></body></html>');
        // }

        let html;
        const parsed = url.parse(req.url, true);
        const user_info = await findOne(conn, 'user', 'uid', uid); // TODO Handle if null
        console.table(user_info);
        if(parsed.pathname == '/location') {
            const id = parsed.query.locID;
            const loc = await findOne(conn, 'location', 'loc_id', id);  // TODO Handle if null
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
                }
                            
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
                        <title>Dead end!</title>
                    </head>
                    <body>
                        <h1>Invalid location! Go back to where you were!</h1>
                        <button onclick="window.location.href='/location?locID=${user_info.loc_id}'">Go!</button>
                    </body>
                    </html>
    
                `;
            }
        
        } else if(parsed.pathname == '/insert-location') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                const params = new URLSearchParams(body);
                const name = params.get('name');
                const emojis = params.get('emojis');
                try {
                        await conn.query("INSERT INTO location (name, emojis) VALUES (?, ?)", [name, emojis]);
                        res.statusCode = 200;
                        if (!res.headersSent) {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'text/plain');
                            res.end('Location inserted successfully!');
                        }
                } catch (err) {
                    if (!res.headersSent) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end('Database error: ' + err.message);
                        }
                    }
            });
        } else if (parsed.pathname === '/insert-location-form') {
            html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Insert Location</title>
                </head>
                <body>
                    <h1>Insert New Location</h1>
                    <form action="/insert-location" method="post">
                        <label for="name">Name:</label>
                        <input type="text" id="name" name="name" required><br>
                        <label for="emojis">Emojis:</label>
                        <input type="text" id="emojis" name="emojis"><br>
                        <button type="submit">Insert</button>
                    </form>
                </body>
                </html>
            `;
                if(!res.headersSent) {
                    res.statusCode = 200;
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
                    <button onclick="window.location.href='/location?locID=${user_info.loc_id}'">start</button>
                    <button onclick="window.location.href='/insert-location-form'">Insert</button>
                </body>
                </html>

            `;
        }

       res.statusCode = 200;
        if(!res.headersSent) {
           res.setHeader('Content-Type', 'text/html');
           res.setHeader('Cache-Control', 'no-cache');
            }
       // console.log(html);
       res.end(html);
    
    } catch (err) {
        console.error(err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Database error: ' + err.message);
        throw err;
    } finally {
        if (conn) {
            conn.end();
        }
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

    // if(pool) {
    //   await pool.end();
    //   console.log("Connection pool closed. Summer is over.");
    // }
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
        // pool.end();  // Close database pool
        process.exit(1);  // Exit the process with error code
    });
});

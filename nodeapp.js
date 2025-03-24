const uid = 1;
const hostname = 'localhost';
const port = 3000;

// Needed external packages
const http = require('http');
const url = require('url');
const mariadb = require('mariadb');
const { requestRoute } = require('./routing.js');
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
       const result = await requestRoute(conn, req);
       res.statusCode = 200;
       res.setHeader('Content-Type', 'text/html');
       res.setHeader('Cache-Control', 'no-cache');
       res.end(result);
    
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

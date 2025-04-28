const hostname = 'localhost';
const port = 3000;

// Needed external packages
const http = require('http');
const url = require('url');
const mariadb = require('mariadb');
const { requestRoute } = require('./routing/router.js');
// Process variables
let conn;
let debug = false;

// Create testing session cookie
let sessionDate = new Date();
sessionDate = sessionDate.setDate(sessionDate.getDate() + 3)
let sessionCook = 'session=' + 'eqctlv3u' + '; Expires=' + sessionDate + '; HttpOnly';

// Collect command line arguments
process.argv.forEach(function (value, index) {
    if (value === "debug" || value === "--debug") {
        debug = true;
    }
})


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

       const result = await requestRoute(conn, req);
       res.statusCode = 200;
       res.setHeader('Content-Type', 'text/html');
       res.setHeader('Cache-Control', 'no-cache');
       res.setHeader('Set-Cookie', sessionCook);
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

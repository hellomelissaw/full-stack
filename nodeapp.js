const uid = 1;
const hostname = 'localhost';
const port = 3000;

const http = require('http');
const url = require('url');
const mariadb = require('mariadb');
const { requestRoute } = require('./routing.js');
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
// REQUEST HANDLING
////////////////////////////////////////////////////////////

async function requestHandler(req, res) {
    try {
        conn = await pool.getConnection();
        if(!conn) {
            console.error("Database connection is missing!");
            throw new Error("Database connection is unavailable");
        }

       const result = await requestRoute(conn, req);

       res.statusCode = 200;
       res.setHeader('Content-Type', 'text/html');
       res.setHeader('Cache-Control', 'no-cache');
       res.end(result);
    
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

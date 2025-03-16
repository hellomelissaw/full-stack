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
        console.log('print parsed url');
        console.table(parsed);
        //console.log(`parsed url query locID: ${parsed.query.locID}`);
        //console.log(`req.url.query.locID: ${req.query.locID}`);
        if(parsed.query.locID == '1') {
        const rows = await conn.query("SELECT * from Locations WHERE LocID=1");
        //console.table(rows);
        html = `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Page Navigation</title>
                </head>
                <body>
                    <h1>Welcome to the ${rows[0].name}. ${rows[0].emojis}</h1>
                    <button onclick="window.location.href='/home'">Go Home</button>
                </body>
                </html>

            `;
        
        } else if (req.url === '/page2') {

            const rows = await conn.query("SELECT * from Locations WHERE LocID=2");
            html = `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Page Navigation</title>
                </head>
                <body>
                    <h1>Welcome to the ${rows[0].name}. ${rows[0].emojis}</h1>
                    <button onclick="window.location.href='/home'">Go Home</button>
                </body>
                </html>

            `;

       
        } else {
            html = `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Page Navigation</title>
                </head>
                <body>
                    <h1>Welcome</h1>
                    <button onclick="window.location.href='/location?locID=1'">Go to the forest</button>
                    <button onclick="window.location.href='/page2'">Go to the discotheque</button>
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

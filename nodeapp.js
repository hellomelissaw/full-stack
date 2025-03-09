const hostname = 'localhost';
const port = 3000;

const http = require('http');
const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'admin',
    password: 'your_password',
    database: 'game',
    connectionLimit: 5 // limit shown in the mariadb docs
});

// initialize db connection
let conn;

async function initDbConnection() {
    try {
        conn = await pool.getConnection();
        console.log("Database connected.");
    } catch (err) {
        console.error("Database connection failed:", err);
        process.exit(1); 
    }
}

initDbConnection();
//async function asyncFunction() {
const server = http.createServer(async(req, res) => { 
    console.log("Creating server...");

    try {

        if(!conn) {
            console.error("Database connection is missing!");
            throw new Error("Database connection is unavailable");
        }

        let html;
        if(req.url === '/page1') {
   
        const rows = await conn.query("SELECT * from Locations WHERE name='Forest'");
        html = `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Page Navigation</title>
                </head>
                <body>
                    <h1>Welcome to the forest. &#x1F332</h1>
                    <button onclick="window.location.href='/home'">Go Home</button>
                </body>
                </html>

            `;
        
        } else if (req.url === '/page2') {
            const rows = await conn.query("SELECT * from Locations WHERE name='Discotheque'");
            html = `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Page Navigation</title>
                </head>
                <body>
                    <h1>Welcome to the discotheque. &#x1F57A &#x1F483 &#x1FAA9</h1>
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
                    <button onclick="window.location.href='/page1'">Go to the forest</button>
                    <button onclick="window.location.href='/page2'">Go to the discotheque</button>
                </body>
                </html>

            `;
        }
       res.statusCode = 200;
       res.setHeader('Content-Type', 'text/html');
       res.setHeader('Cache-Control', 'no-cache');
       res.end(html);
    
    } catch (err) {
        throw err;
    
    } finally {
     console.log("Ending db connections.");
        if (conn) conn.end();
    }

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

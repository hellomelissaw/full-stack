const hostname = '127.0.0.1';
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


//async function asyncFunction() {
const server = http.createServer(async(req, res) => { 
    let conn;
    console.log("Creating server...");
    try {
        conn = await pool.getConnection();

        const rows = await conn.query("SELECT * from Locations");
        console.log(rows);
        // make html page with table data
        let html = `
        <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Page Navigation</title>
            </head>
            <body>
                <h1>Welcome</h1>
                <button onclick="window.location.href='/page1'">Go to Page 1</button>
                <button onclick="window.location.href='/page2'">Go to Page 2</button>
            </body>
            </html>

        `;

       res.statusCode = 200;
       res.setHeader('Content-Type', 'text/html');
       res.setHeader('Cache-Control', 'no-cache');
       res.end(html);
    
    } catch (err) {
        throw err;
    
    } finally {
        if (conn) conn.end();
    }
//}

});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});



process.on('uncaughtException', (err) => {
    console.error('Uncaught exception: ', err);
    server.close(() => {
        console.log('HTTP server closed due to uncaught exception');
        pool.end();  // Close database pool
        process.exit(1);  // Exit the process with error code
    });
});
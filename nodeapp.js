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
        // conn = pool.getConnection();
        // const rows = await conn.query("SELECT * from Locations");
        const rows = await conn.query("SELECT * from Locations");
        console.log(rows);
        // make html page with table data
        let html = `
            <html>
                <head>
                    <title> Users </title>
                </head>

                <body>
                    <h1> User List </h1>
                     <table>
                        <tr><th>ID</th><th>Name</th></tr>
                        ${rows.map(row => `<tr><td>${row.LocID}</td><td>${row.name}</td></tr>`).join('')}
                    </table>
                </body>
            </html>
        `;
       console.log(html);
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

process.on('SIGINT', () => {
    console.log('Received SIGINT. Closing server and freeing port...');
    server.close(() => {
        console.log('HTTP server closed');
        pool.end();  // Close database pool
        process.exit(0);  // Exit the process
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception: ', err);
    server.close(() => {
        console.log('HTTP server closed due to uncaught exception');
        pool.end();  // Close database pool
        process.exit(1);  // Exit the process with error code
    });
});

// asyncFunction().then(() => {
//     pool.end();
// });



// const http = require('http');
// const sqlite3 = require('sqlite3').verbose();

// const hostname = 'localhost';
// const port = 3000;

// const database = new sqlite3.Database('game.db');

// const server = http.createServer((req, res) => {
//     // query database
//     database.all('SELECT * FROM user', (err, rows) => {
//         if (err) {
//             res.statusCode = 500;
//             res.setHeader('Content-Type', 'text/plain');
//             res.end('Hov! Database error: ' + err.message);
//             return;
//         }

//         // make html page with table data
//         let html = `
//             <html>
//                 <head>
//                     <title> Users </title>
//                 </head>

//                 <body>
//                     <h1> User List </h1>
//                      <table>
//                         <tr><th>ID</th><th>Name</th></tr>
//                         ${rows.map(row => `<tr><td>${row.userid}</td><td>${row.name}</td></tr>`).join('')}
//                     </table>
//                 </body>
//             </html>
//         `;
        
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'text/plain');
//         res.setHeader('Cache-Control', 'no-cache');
//         res.end(html);
//     })

// });

// server.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`);
// });

// // database.close();

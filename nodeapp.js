const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    port: '3306',
    user: 'admin',
    password: 'your_password',
    connectionLimit: 5 // limit shown in the mariadb docs
});

async function asyncFunction() {
    let conn;
    try {
        conn = await pool.getConnection();
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

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(html);

    
    } catch (err) {
        throw err;
    
    } finally {
        if (conn) conn.end();
    }
}

asyncFunction().then(() => {
    pool.end();
});
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

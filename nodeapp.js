const http = require('http');
const sqlite3 = require('sqlite3').verbose();

const hostname = 'localhost';
const port = 3000;

const database = new sqlite3.Database('game.db');

const server = http.createServer((req, res) => {
    // query database
    database.all('SELECT * FROM user', (err, rows) => {
        if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Hov! Database error: ' + err.message);
            return;
        }

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
                        ${rows.map(row => `<tr><td>${row.userid}</td><td>${row.name}</td></tr>`).join('')}
                    </table>
                </body>
            </html>
        `       
    })

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.end(html);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

// database.close();

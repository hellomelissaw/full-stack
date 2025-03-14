const http = require('http');
const sqlite3 = require('sqlite3').verbose();

const hostname = 'localhost';
const port = 3000;

const database = new sqlite3.Database('game.db');

const server = http.createServer((req, res) => {
        if (req.method === 'POST' && req.url === '/insert') {
        // Handle the insertion into the database
        database.run("INSERT INTO user (name) VALUES ('John Doe')", (err) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Database error: ' + err.message);
                return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Inserted to SQL!');
        });
    } else {
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
                        <h1>SQL Insert</h1>
                        <button onclick="insert()">Insert!</button>
                        
                        <h2> User List &#x1F92A; </h2>
                         <table>
                            <tr><th>ID</th><th>Name</th></tr>
                            ${rows.map(row => `<tr><td>${row.userid}</td><td>${row.name}</td></tr>`).join('')}
                        </table>
                        <script>
                            function insert() {
                                fetch('/insert', { method: 'POST' })
                                        .then(response => response.text())
                                        .then(data => {
                                            alert(data);
                                            location.reload(); // Refresh the page
                                        });
                            }
                        </script>
                    </body>
                </html>
            `;

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(html);
        })
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

// database.close();

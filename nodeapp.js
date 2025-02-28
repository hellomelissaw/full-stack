import sqlite3 from "sqlite3";

const db = new sqlite3.Database(game.db);

const url = require('node:url');
const http = require('http');
const hostname = 'localhost';
const port = 3000;

sql = "SELECT * FROM user";
params = [];

db.all(sql, params, function(err, rows) {
    if (err) {
      console.error(err);
    } else {
      console.log(rows);
    }
  });

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.end('Welcome to da Game! hihi\n');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

db.close();

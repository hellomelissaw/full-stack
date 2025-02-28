const url = require('node:url');
const http = require('http');
const hostname = 'localhost';
const port = 3000;

const sqlite = require('node:sqlite');
const { DatabaseSync } = require('node:sqlite');
const database = new DatabaseSync('game.db');

const query = database.prepare('SELECT * from user');

console.log(query.all());

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

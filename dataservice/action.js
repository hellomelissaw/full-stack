const {
    select_random_enemy
} = require('./utilities')

async function getRandomEnemy(conn) {
    console.log("I'm in getRandomEnemy");
    console.log(`conn type in random enemy: ${typeof(conn)}`);
    return await conn.query(select_random_enemy);
}

module.exports = {
    getRandomEnemy
}

const {
    select_random_enemy
} = require('./utilities')

async function getRandomEnemy(conn) {
    return await conn.query(select_random_enemy);
}

module.exports = {
    getRandomEnemy
}
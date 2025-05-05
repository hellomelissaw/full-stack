const {
    select_random_enemy
} = require('./utilities')

async function getRandomEnemy(conn) {
    const enemy = await conn.query(select_random_enemy);
    return enemy[0] || null;
}

module.exports = {
    getRandomEnemy
}

const {
    select_random_enemy,
    update_stats
} = require('./utilities')

async function getRandomEnemy(conn) {
    const enemy = await conn.query(select_random_enemy);
    return enemy[0] || null;
}

async function updateStats(conn, hp, xp, level, pid) {
    const stats = [hp, xp, level, pid];
    const result = await conn.query(update_stats, stats);
    return result;
}

module.exports = {
    getRandomEnemy,
    updateStats
}


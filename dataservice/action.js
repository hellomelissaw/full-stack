const {
    select_random_enemy,
    update_stats
} = require('./utilities')

const action_stats = `SELECT xp_base_reward, hp_base_cost
                      FROM action
                      WHERE act_id = ?
                      `;

async function getRandomEnemy(conn) {
    const enemy = await conn.query(select_random_enemy);
    return enemy[0] || null;
}

async function updateStats(conn, hp, xp, level, pid) {
    const stats = [hp, xp, level, pid];
    const result = await conn.query(update_stats, stats);
    return result;
}

async function getActionStats(conn, actionType) {
    const stats = conn.query(action_stats, actionType);
    if (stats) {
        return stats[0];
    }
    return null;
}

module.exports = {
    getRandomEnemy,
    updateStats
}


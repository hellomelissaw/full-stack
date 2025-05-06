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
    // const stats = conn.query(action_stats, actionType);
    // if (stats) {
    //     return stats[0];
    // }
    // return null;
    try {
        console.log(`actionType: ${actionType}, type: ${typeof(actionType)}`);
        const stats = conn.query(action_stats, [actionType]);
        console.table(stats);
        const int_stats = {
            xp_base_reward: parseInt(stats.xp_base_reward),
            hp_base_cost: parseInt(stats.hp_base_cost)
        }
        return int_stats;
    
    } catch (err) {
        throw new Error (err);
    }
}

module.exports = {
    getRandomEnemy,
    updateStats,
    getActionStats
}


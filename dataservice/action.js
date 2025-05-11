////////////////////////////////////////////////////////////
// QUERIES
////////////////////////////////////////////////////////////

// TODO optimize for performance if future table becomes larger
const select_random_enemy = `SELECT * FROM enemy
                            ORDER BY RAND()
                            LIMIT 1;
                            `

const update_stats = `UPDATE player
                      SET health = ?, experience = ?, level = ?
                      WHERE pid = ?`;

const update_hp = `UPDATE player
                    SET health = ?
                    WHERE pid = ?`;


const update_xp = `UPDATE player
                    SET experience = ?
                    WHERE pid = ?`;

const action_stats = `SELECT xp_base_reward, hp_base_cost, random_action
                      FROM action
                      JOIN location_action
                      WHERE act_id = ?
                      `;

const log_action = `INSERT INTO player_action
                    (pid, loc_id, act_id) values
                    (?, ?, ?)`;

const get_enemy = `SELECT name, descripton 
                    FROM enemy
                    JOIN location_action
                    ON enemy.object_id = location_action.action_object_id
                    WHERE loc_id = ? 
                    `;


////////////////////////////////////////////////////////////
// ACTION QUERYING
////////////////////////////////////////////////////////////

async function getRandomEnemy(conn) {
    const enemy = await conn.query(select_random_enemy);
    return enemy[0] || null;
}

async function updateStats(conn, hp, xp, level, pid) {
    try {
        const stats = [hp, xp, level, pid];
        const result = await conn.query(update_stats, stats);
        return { success: true, error: null };
    
    } catch (err) {
        return { success: false, error: err.message };
    }
   
}

async function updateHP(conn, hp, pid) {
    try {
        await conn.query(update_hp, [hp, pid]);
        return { success: true, error: null};
    
    } catch (err) {
        return { success: false, error: err.message };
    }
}

async function updateXP(conn, xp, pid) {
    try {
        await conn.query(update_xp, [xp, pid]);
        return { success: true, error: null};
    
    } catch (err) {
        return { success: false, error: err.message };
    }
}

async function getActionStats(conn, actionType) {
    // const stats = conn.query(action_stats, actionType);
    // if (stats) {
    //     return stats[0];
    // }
    // return null;
    try {
        const stats = await conn.query(action_stats, [actionType]);
        const int_stats = {
            xp_base_reward: parseInt(stats[0].xp_base_reward),
            hp_base_cost: parseInt(stats[0].hp_base_cost),
            isRandom: parseInt(stats[0].random_action)
        }
        return int_stats;
    
    } catch (err) {
        throw new Error (err);
    }
}

async function logAction(conn, pid, locID, actID) {
    try {
        const result = await conn.query(log_action, [pid, locID, actID]);
        return { success: true, error: null }
    
    } catch (err) {
        if (err.no === 1062) {
            console.log("Action already in DB. Skipping insert.");
            return { success: true, error: null } 
        } else {
            return { success: false, error: err.message }
        }  
    }   
}

async function getEnemy(conn, locID) {
    try {
        const enemy = await conn.query(get_enemy, [locID]);
        console.log("Enemy found...");
        return enemy[0];
    
    } catch (err) {
        console.log(err.message);
        return null;
    }
}

module.exports = {
    getRandomEnemy,
    updateStats,
    getActionStats,
    logAction,
    updateHP,
    updateXP,
    getEnemy
}


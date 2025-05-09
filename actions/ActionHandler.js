// const temp_token = "temp-sesh-12345"; 

const {
    FightAction,
    GatherAction
} = require('./Action')

const { 
    getActionStats,
    logAction
} = require('../dataservice/action')

const {
    getPlayerData
} = require('../dataservice/user')

const {
    getSessionPid
} = require('../dataservice/session')


// Map action types to the right class extension
const actionStrategies = {
    "1": FightAction,
    "2": GatherAction
};

async function performAction(conn, actionType, sessionId) {
    const ActionClass = actionStrategies[actionType.trim()];
    if(!ActionClass) {
        // maybe return an error message to display in message.pug??
        throw new Error(`Action type "${actionType}" not found.`); 
    }
    const stats = await getActionStats(conn, actionType);
    const pid = await getSessionPid(conn, sessionId);

    if (stats && pid) {
        const result = await getPlayerData(conn, pid);  

        if(result.success) {
            const action = new ActionClass(stats.xp_base_reward, stats.hp_base_cost); 
            const output = await action.execute(conn, result.player_data);
            const log = await logAction(conn, result.player_data.pid, result.player_data.loc_id, actionType);
            if (log.success) {
                return output;
            
            } else {
                throw new Error(log.error);
            }
            
        } else {
            throw new Error(result.error);
        }
    } else {
        throw new Error("Missing stats or pid");
    }
}

module.exports = { performAction }

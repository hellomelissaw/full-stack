const temp_token = "temp-sesh-12345"; 

const {
    FightAction,
    GatherAction
} = require('./Action')

const { 
    getActionStats
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

async function performAction(conn, actionType) {
    console.log(`actionType data type in performAction: ${typeof(actionType)}`)
    console.log("Available keys:", Object.keys(actionStrategies));
    console.log("Does key exist?", "1" in actionStrategies); // should be true
    const ActionClass = actionStrategies[actionType.trim()];
    if(!ActionClass) {
        // maybe return an error message to display in message.pug??
        throw new Error(`Action type "${actionType}" not found.`); 
    }
    const stats = await getActionStats(conn, actionType);
    const pid = await getSessionPid(conn, temp_token);
    console.table(stats);
    console.log(`pid: ${pid}`);
    if (stats && pid) {
        const result = await getPlayerData(conn, pid);  

        if(result.success) {
            const action = new ActionClass(stats.base_xp_reward, stats.base_hp_cost); // HARD-CODED FOR TESTING
            const output = await action.execute(conn, result.player_data);
            console.log(`return value action.execute: ${output}`)
            return output;
    
        } else {
            throw new Error(result.error);
        }
    } else {
        throw new Error("Missing stats or pid");
    }
 
  

}

module.exports = { performAction }

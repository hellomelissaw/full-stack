const {
    FightAction,
    GatherAction
} = require('./Action')

const {
    getPlayerData
} = require('../dataservice/user')


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
    // TODO get action stats from DB
    // TODO get pid from DB
    // const result = getPlayerData(conn, "22");  // HARD-CODED FOR TESTING
    const player = {
        pid: 22,
        uid: 1,
        name: 'Aragorn',
        loc_id: 3,
        health: 85,
        experience: 10,
        level: 1
      };
    const result = {success: true, player_data: player };  
    if(result.success) {
        const action = new ActionClass(5, 2); // HARD-CODED FOR TESTING
        const output = await action.execute(result.player_data);
        console.log(`return value action.execute: ${output}`)
        return output;

    } else {
        throw new Error(result.error);
    }
  

}

module.exports = { performAction }

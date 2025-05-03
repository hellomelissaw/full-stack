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

function performAction(conn, actionType) {
    console.log(`actionType data type in performAction: ${typeof(actionType)}`)
    console.log("Available keys:", Object.keys(actionStrategies));
    console.log("Does key exist?", "1" in actionStrategies); // should be true
    console.log(`ActionClass: ${actionStrategies[actionType]}, type: ${typeof(actionStrategies[actionType])}`);
    console.log(`Hardcoded access: ${actionStrategies["2"]}`);
    const ActionClass = actionStrategies[actionType.trim()];
    if(!ActionClass) {
        // maybe return an error message to display in message.pug??
        throw new Error(`Action type "${actionType}" not found.`); 
    }
    // TODO get action stats from DB
    // TODO get pid from DB
    const result = getPlayerData(conn, 22)  // HARD-CODED FOR TESTING
    if(result.success) {
        const action = ActionClass(5, 2); // HARD-CODED FOR TESTING
        return action.excecute(result.player_data);
    } else {
        throw new Error("Player not found.");
    }
  

}

module.exports = { performAction }

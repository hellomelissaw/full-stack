const {
    FightAction,
    GatherAction
} = require('./Action')

const {
    getPlayerData
} = require('../dataservice/user')


// Map action types to the right class extension
const actionStrategies = {
    1: FightAction,
    2: GatherAction
};

function performAction(conn, actionType) {
    const ActionClass = actionStrategies[actionType];

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
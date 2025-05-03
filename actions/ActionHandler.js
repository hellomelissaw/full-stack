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

}

module.exports = { performAction }
const XP_CAP = 100;
const MAX_REDUCTION = 0.5;
const {
    getRandomEnemy
} = require('../dataservice/action');

class Action {
    constructor(name, xpBaseReward, hpBaseCost) {
        this.name = name;
        this.xpBaseReward = xpBaseReward;
        this.hpBaseCost = hpBaseCost;
    }

    // Simulate a generic method
    async execute(player) {
        throw new Error("execute method must be implemented");
    }
}

class FightAction extends Action {
    constructor(xpBaseReward, hpBaseCost) {
        super("fight", xpBaseReward, hpBaseCost);
    }

    async execute(conn, player) {
        console.log(`conn in execute: ${conn}`);
        const enemy = await getRandomEnemy(conn);
        console.table(enemy);
        const totalXP = enemy.xpReward 
                        + this.xpBaseReward
                        + player.XP;

        const reductionRate = Math.min(player.experience / XP_CAP, MAX_REDUCTION); // return xp as percentage or 0.5
        const totalHP = (enemy.xpCost + this.hpBaseCost)
                        * (1 - reductionRate);

        return JSON.stringify({
            stats: `<p>HP: ${totalHP}</p> <p>XP: ${totalXP}</p> <p>Level: 1</p>`,
            description: `You fought the ${enemy.name}! ${enemy.description}
                          <br><br>
                          Your current stats are: HP: ${totalHP}, XP: ${totalXP}`
        })
    }
}


class GatherAction extends Action {
    constructor(xpBaseReward, hpBaseCost) {
        super("fight", xpBaseReward, hpBaseCost);
    }

    async execute(player) {
        // Do a thing
    }
}

module.exports = {
        FightAction,
        GatherAction
}

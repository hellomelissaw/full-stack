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
        if(enemy){
            const totalXP = enemy.xp_reward 
            + this.xpBaseReward
            + player.experience;
     
            const reductionRate = Math.min(player.experience / XP_CAP, MAX_REDUCTION); // return xp as percentage or 0.5
            const totalCostHP = Math.round((enemy.hp_cost + this.hpBaseCost)
                        * (1 - reductionRate));
            const updatedHP = player.health - totalCostHP;
            
            return JSON.stringify({
            stats: `<p>HP: ${updatedHP}</p> <p>XP: ${totalXP}</p> <p>Level: 1</p>`,
            description: `You fought the ${enemy.name}! ${enemy.description || ' '}
                        <br><br>
                        Your current stats are: HP: ${updatedHP}, XP: ${totalXP}`
            })
        } else {
            return "Error fetching enemy.";
        }
     
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

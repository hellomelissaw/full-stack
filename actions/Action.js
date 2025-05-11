const XP_CAP = 100;
const MAX_REDUCTION = 0.5;
const {
    getRandomEnemy,
    updateStats,
    getEnemy
} = require('../dataservice/action');

class Action {
    constructor(name, xpBaseReward, hpBaseCost, isRandom) {
        this.name = name;
        this.xpBaseReward = xpBaseReward;
        this.hpBaseCost = hpBaseCost;
        this.isRandom = isRandom;
    }

    // Simulate a generic method
    async execute(player) {
        throw new Error("execute method must be implemented");
    }
}

class FightAction extends Action {
    constructor(xpBaseReward, hpBaseCost, isRandom) {
        super("fight", xpBaseReward, hpBaseCost, isRandom);
    }

    async execute(conn, player) {
        let enemy;
        if (this.isRandom) {
            enemy = await getRandomEnemy(conn);
        
        } else {
            const locID = player.locID;
            enemy = await getEnemy(conn, locID);
            console.table(enemy);
        }
        

        if (enemy){
            const totalXP = enemy.xp_reward 
            + this.xpBaseReward
            + player.experience;
            
            const reductionRate = Math.min(player.experience / XP_CAP, MAX_REDUCTION); // return xp as percentage or 0.5

            const totalCostHP = Math.round((enemy.hp_cost + this.hpBaseCost)
                        * (1 - reductionRate));

            const updatedHP = player.health - totalCostHP;

            const update = updateStats(conn, updatedHP, totalXP, 1, player.pid);

            if (update.success) {
                try {
                    const json = JSON.stringify({
                                 stats: `<p>HP: ${updatedHP}</p> <p>XP: ${totalXP}</p> <p>Level: 1</p>`,
                                 description: `You fought the ${enemy.name}! ${enemy.description || ' '}
                                            <br><br>
                                            Your current stats are: HP: ${updatedHP}, XP: ${totalXP}`
                                });

                return json;

                } catch (err) {
                    return JSON.stringify( {error: err.message} );
                }
                
            } else {
                return "Error updating player stats.";
            }
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

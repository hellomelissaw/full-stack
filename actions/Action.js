class Action {
    constructor(name, xpBaseReward, hpBaseCost) {
        this.name = name;
        this.xpBaseReward = xpBaseReward;
        this.hpBaseCost = hpBaseCost;
    }

    // Simulate a generic method
    execute(pid) {
        throw new Error("execute method must be implemented");
    }
}

class FightAction extends Action {
    constructor(xpBaseReward, hpBaseCost) {
        super("fight", xpBaseReward, hpBaseCost);
    }

    execute(pid) {
        const enemy = getRandomEnemy();
        const totalXP = enemy.xpReward + this.xpBaseReward;
        const totalHP = enemy.xpCost + this.hpBaseCost;


    }
}


class GatherAction extends Action {
    constructor(xpBaseReward, hpBaseCost) {
        super("fight", xpBaseReward, hpBaseCost);
    }

    execute(pid) {
        // Do a thing
    }
}
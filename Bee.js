const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class Bee {
    constructor() {
        this.position = {x: -100 + 200 * Math.random(), y: -100 + 200 * Math.random()};
        this.result = -1e9;
    }
    
    calcfitness() {
        this.result = -(Math.pow(this.position.x, 2) + Math.pow(this.position.x, 2));
    }
    
    goTo(pos, span) {
        this.position = {x: (pos.x - span.x) + 2 * span.x * Math.random(), y: (pos.y - span.y) + 2 * span.y * Math.random()};
    }
    
    goToRandom() {
        this.position = {x: -100 + 200 * Math.random(), y: -100 + 200 * Math.random()};
    }
    
    get fitness() {
        this.calcfitness();
        return this.result;
    }
    
    get current_position() {
        return this.position;
    }
}

class Hive {
    constructor(scoutbeecount, selectedbeecount, bestbeecount, selsitescount, bestsitescount, range_list) {
        this.scoutbeecount = scoutbeecount;
        this.selectedbeecount = selectedbeecount;
        this.bestbeecount = bestbeecount;
        this.selsitescount = selsitescount;
        this.bestsitescount = bestsitescount;
        this.range_list = range_list;
        
        this.scoutBees = [];
        this.employedBees = [];
        this._id = uuidv4();
        
        this.results = 'x,y,val\n';
        this.best_results = 'x,y,val,iter\n';
        this.iter = 0;
        
        for (let i of new Array(this.scoutbeecount)) {
            let scout = new Bee();
            this.scoutBees.push(scout);
        }
    }
    
    iteration() {
        let res = [];
        
        for (let scout of this.scoutBees) {
            res.push({bee: scout, fitness: scout.fitness, scout: true});
        }
        
        for (let scout of this.employedBees) {
            res.push({bee: scout, fitness: scout.fitness, scout: false});
        }
        
        res.sort((rec1, rec2) => rec2.fitness - rec1.fitness);
        
        for (let i = 0; i < res.length; i++) {
            if (i < this.bestsitescount) {
                res[i].type = 2;
            } else if (i < this.bestsitescount + this.selsitescount) {
                res[i].type = 1;
            } else {
                res[i].type = 0;
            }
        }
        
        let bestsites = res.filter(el => el.type === 2);
        let selsites = res.filter(el => el.type === 1);
        let badsites = res.filter(el => el.type === 0);
        let badscoutsites = res.filter(el => el.scout && el.type === 0);
        
        bestsites.forEach(el => {
            for (let j = 0; j < this.bestbeecount; j++) {
                if (badsites[badsites.length - 1]) {
                    badsites[badsites.length - 1].bee.goTo(el.bee.current_position, {x: 10, y: 10});
                    badsites.pop();
                } else {
                    let emlpoyedBee = new Bee();
                    emlpoyedBee.goTo(el.bee.current_position, {x: 10, y: 10});
                    this.employedBees.push(emlpoyedBee);
                }
            }
        });
        
        selsites.forEach(el => {
            for (let j = 0; j < this.selectedbeecount; j++) {
                if (badsites[badsites.length - 1]) {
                    badsites[badsites.length - 1].bee.goTo(el.bee.current_position, {x: 10, y: 10});
                    badsites.pop();
                } else {
                    let emlpoyedBee = new Bee();
                    emlpoyedBee.goTo(el.bee.current_position, {x: 10, y: 10});
                    this.employedBees.push(emlpoyedBee);
                }
            }
        });
        
        badscoutsites.forEach(el => {
            el.bee.goToRandom();
        });
        
        
        for (let i = 0; i < res.length; i++) {
            this.results += `${res[i].bee.position.x},${res[i].bee.position.y},${res[i].fitness}\n`;
            if (i === 0) {
                this.best_results += `${res[i].bee.position.x},${res[i].bee.position.y},${res[i].fitness},${this.iter}\n`;
            }
        }
        
        let dir = __dirname + '/' + this._id;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        
        fs.writeFileSync(`./${this._id}/iter${this.iter}.csv`, this.results);
        this.results = 'x,y,val\n';
        
        if (Math.abs(res[0].fitness - 0) > 0.01) {
            this.iter++;
            return this.iteration();
        } else {
            fs.writeFileSync(`./${this._id}/best.csv`, this.best_results);
            return this.iter;
        }
    }
    
    get id() {
        return this._id;
    }
}

module.exports = Hive;
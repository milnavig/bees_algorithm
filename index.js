const fs = require('fs');
const express = require('express');
const PORT = 5000;

const Hive = require('./Bee.js');

const app = express();

app.use(express.static('public'));
app.use(express.json());

app.listen(PORT, () => console.log('Hello!'));

app.get(/^\/iter\d{0,2}.csv/, (req, res) => {
    try {
        var file = fs.readFileSync(__dirname + req.path, 'binary');
    } catch (err) {
        console.log('No such file');
    }

    res.setHeader('Content-Length', file.length);
    res.write(file, 'binary');
    res.end();
});

app.get("/folder/:id", (req, res) => {
    const iter = req.query.iter;
    const best = req.query.best;
    const id = req.params.id;
    
    let filepath;
    if (best === 'true') {
        filepath = '/best.csv';
    } else {
        filepath = `/iter${iter}.csv`;
    }
    
    try {
        var file = fs.readFileSync(__dirname + '/' + id + filepath, 'binary');
    } catch (err) {
        //res.text('No such file');
        res.status(404).json({
            message: "No such file"
        });
        return;
    }

    res.setHeader('Content-Length', file.length);
    res.write(file, 'binary');
    res.end();
})

app.post('/process', (req, res) => {
    const body = req.body;
    // const hive = new Hive(10, 3, 5, 5, 2, {x: 10, y: 10});
    const hive = new Hive(body.scoutbees, body.selectedbees, body.bestbees, body.selsites, body.bestsites, {x: 10, y: 10});
    const num_iter = hive.iteration();
    
    res.json({id: hive.id, num_iter});
});

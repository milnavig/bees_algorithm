document.getElementById('submit').addEventListener('click', e => {
    e.preventDefault();
    let data = {
        scoutbees: Number(document.getElementById('scoutbees').value),
        selectedbees: Number(document.getElementById('selectedbees').value),
        bestbees: Number(document.getElementById('bestbees').value),
        selsites: Number(document.getElementById('selsites').value),
        bestsites: Number(document.getElementById('bestsites').value)
    }
    
    fetch('/process', {
        method: 'POST', 
        
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    }).then(res => res.json()).then(res => {
        console.log(res);
        iterate(res.id, 0, res.num_iter);
        bestResults(res.id, res.num_iter)
    });
});

function drawGraph(src, iter) {
    
    d3.select("svg").remove();
    d3.select(".tooltip").remove();
    
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 660 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv(`http://localhost:5000/folder/${src}?iter=${iter}`, function(data) {
    
    console.log(data)
    // Add X axis
    var x = d3.scaleLinear()
        .domain([-5, 5])
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([-5, 5])
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
    // Its opacity is set to 0: we don't see it by default.
    var tooltip = d3.select("#my_dataviz")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")

    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    var mouseover = function(d) {
    tooltip
        .style("opacity", 1)
    }

    var mousemove = function(d) {
    tooltip
        .html("The exact value is: " + d.val)
        .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", (d3.mouse(this)[1]) + "px")
    }

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    var mouseleave = function(d) {
    tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
    }

    // Add dots
    svg.append('g')
    .selectAll("dot")
    .data(data.filter(function(d,i){return i<50})) // the .filter part is just to keep a few dots on the chart, not all of them
    .enter()
    .append("circle")
        .attr("cx", function (d) { return x(d.x); } )
        .attr("cy", function (d) { return y(d.y); } )
        .attr("r", 7)
        .style("fill", "#69b3a2")
        .style("opacity", 0.3)
        .style("stroke", "white")
    .on("mouseover", mouseover )
    .on("mousemove", mousemove )
    .on("mouseleave", mouseleave )

    })
}
    
function iterate(src, i, num_iter) {
    if (i > num_iter) return;
    drawGraph(src, i);
    document.getElementById('iteration').innerHTML = 'Iteration ' + i;
    setTimeout(() => iterate(src, i + 1, num_iter), 1000)
}

function bestResults(src, num_iter) {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 860 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_graph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv(`http://localhost:5000/folder/${src}?best=true`,
        function(data) {
            // Add X axis --> it is a date format
            var x = d3.scaleLinear()
                .domain( [0, num_iter])
                .range([ 0, width ]);
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));
            // Add Y axis
            var y = d3.scaleLinear()
                .domain( [-20, 20])
                .range([ height, 0 ]);
            svg.append("g")
                .call(d3.axisLeft(y));
            // Add the line
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "#69b3a2")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function(d) { return x(d.iter) })
                    .y(function(d) { return y(d.val) })
                )
            // Add the points
            svg
                .append("g")
                .selectAll("dot")
                .data(data)
                .enter()
                    .append("circle")
                    .attr("cx", function(d) { return x(d.iter) } )
                    .attr("cy", function(d) { return y(d.val) } )
                    .attr("r", 5)
                    .attr("fill", "#69b3a2")
        })
}
// @TODO: YOUR CODE HERE!
let chart = parseInt(d3.select(`#scatter`).style(".chart"));

let svgWidth = 960;
let svgHeight = 500;
let textsize = parseInt(svgWidth * 0.00855);
let margin = {
    top: 25,
    right: 50,
    bottom: 90,
    left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// creating an SVG wrapper, appending SVG group that will hold the chart,
// and shift the latter by left and top margins.
let svg = d3
    .select('#scatter')
    .append('svg')
    .attr('width', svgWidth)
    .attr('class', 'chart')
    .attr('height', svgHeight);
// console.log(margin.top)
// console.log(margin.left)
// appending an SVG group
let chartgroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);


//initial paramaters
let chosenXaxis = 'poverty';
let chosenYaxis = 'healthcare';
// function for updating x-scale var when clicked on axis label
function xScale(data, chosenXaxis) {
    // create the scale
    let xLinear_Scale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXaxis]) * 0.8,
        d3.max(data, d => d[chosenXaxis]) * 1.2
        ])
        .range([0, width]);
    return xLinear_Scale;

}

function yScale(data, chosenYaxis) {
    let yLinear_Scale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYaxis]) * 0.8,
        d3.max(data, d => d[chosenYaxis]) * 1.2
        ])
        .range([height, 0]);
    return yLinear_Scale;
}
// function we use for updating Xaxis variable when clicked on the axis label
function renderxAxes(newXScale, XAxis) {
    let BAxis = d3.axisBottom(newXScale);
    XAxis.transition()
        .duration(1500)
        .call(BAxis);
    return XAxis;
}

// function we use for updating Yaxis variable when clicked on the axis label
function renderyAxes(newYScale, YAxis) {
    let LAxis = d3.axisLeft(newYScale);
    YAxis.transition()
        .duration(1500)
        .call(LAxis)
    return YAxis;
}

// function used for updating circles group with a transition to
// new circles as per classwork
function renderCircles(circlesGroup, newXScale, newYScale, chosenXaxis, chosenYaxis) {
    circlesGroup.transition()
        .duration(1500)
        .attr('cx', d => newXScale(d[chosenXaxis]))
        .attr('cy', d => newYScale(d[chosenYaxis]));
    return circlesGroup;
}

// function for updating text group for x and y axis
function renderText(textgroup, newXScale, newYScale, chosenXaxis, chosenYaxis) {
    textgroup.transition()
        .duration(1500)
        .attr('x', d => newXScale(d[chosenXaxis]))
        .attr('y', d => newYScale(d[chosenYaxis]));
    return textgroup;
}

//updating the circles group with new tooltips
function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup) {
    if (chosenXaxis === 'poverty') {
        var label = 'POVERTY:';
    }
    else {
        var label = 'Age Median:';
    }
    let toolTIP = d3.tip()
        .attr('class', 'tooltip')
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state},${d.abbr}<br>${label}${d[chosenXaxis]}<br>${chosenYaxis}: ${d[chosenYaxis]}%`);

        });
    circlesGroup.call(toolTIP);
    // console.log(call(toolTIP))

    console.log(toolTIP)
    circlesGroup.on('mouseover', function (data) {
        toolTIP.show(data, this);
    })
        // during mouse event 
        .on('mouseout', function (data, index) {
            toolTIP.hide(data);
        });
    return circlesGroup;
}
// obtaining our csv to execute our d3 code below
d3.csv('assets/data/data.csv').then(function (data, err) {
    if (err) throw err;

    //parse our data
    data.forEach(function (data) {
        data.poverty = +data.poverty;
        data.obesity = +data.obesity;
        data.age = +data.age;
        data.smokes = +data.smokes;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.abbr = data.abbr;
    });
    // xLinear_Scale function for the above csv import
    let xLinear_Scale = xScale(data, chosenXaxis);
    // y scale function
    let yLinear_Scale = yScale(data, chosenYaxis);
    //create our initial axis function
    let BAxis = d3.axisBottom(xLinear_Scale);
    let LAxis = d3.axisLeft(yLinear_Scale);
    console.log(height)
    //append the x axis 
    let XAxis = chartgroup.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0, ${height})`)
        .call(BAxis);
    // append thr y axis
    //console.log()
    chartgroup.append('g')
        .classed('y-axis', true)
        .call(LAxis);
    //append the initial circle 
    let circlesGroup = chartgroup.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xLinear_Scale(d[chosenXaxis]))
        .attr('cy', d => yLinear_Scale(d[chosenYaxis]))
        .attr('r', 12)
        .attr('fill', 'yellow')
        .attr('opacity', '0.5');

    let textgroup = chartgroup.selectAll('text')
        .exit()
        .data(data)
        .enter()
        .append('text')
        .text(d => d.abbr)
        .attr('x', d => xLinear_Scale(d[chosenXaxis]))
        .attr('y', d => yLinear_Scale(d[chosenYaxis]))
        .attr("font-size", textsize + "px")
        .attr("text-anchor", "middle")
        .style("fill", "blue")
        .attr("class", "text");

    circlesGroup = updateToolTip(chosenYaxis, chosenXaxis, circlesGroup);


    //create groups for 3 xAxis labels
    let LGroup = chartgroup.append('g')
        .attr('transform', `translate(${width / 2},${height + 20})`);
    let povertyLabel = LGroup.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'poverty')//here is our value to grab for use for event listener.
        .classed('active', true)
        .text('In Poverty (%)');

    let ageLabel = LGroup.append('text')
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'age')//here is our value to grab for event listener.
        .classed('inactive', true)
        .text('Age (Median)');

    let incomeLabel = LGroup.append('text')
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'income')//here is our value to grab for event listener.
        .classed('inactive', true)
        .text('Household Income (Median)');

    // append thr 3 yaxis        
    let Hgroup = chartgroup.append('g')
        .attr('transform', 'rotate(-90)');

    let obeseLabel = Hgroup.append('text')
        .attr('y', 0 - margin.left)
        // .attr('transform', `translate(-40,${height / 2})rotate(-90)`)
        .attr("x", 0 - (height / 2))
        .attr('dy', '1em')
        .classed('axis-text', true)
        .classed("active", true)
        .attr('value', 'obesity')
        .text('Obese (%)');

    let smokesLabel = Hgroup.append('text')
        .attr('y', 0 - margin.left)
        // .attr('transform',`translate(-60,${height / 2})rotate(-90)`)
        .attr("x", 0 - (height / 2))
        .attr('dy', '1em')
        .classed('axis-text', true)
        .classed("inactive", true)
        .attr('value', 'smokes')
        .text('Smokes (%)');

    let healthcareLabel = Hgroup.append('text')
        .attr('y', 0 - margin.left)
        // .attr('transform', `translate(-80,${height / 2})rotate(-90)`)
        .attr("x", 0 - (height / 2))
        .attr('dy', '1em')
        .classed('axis-text', true)
        .classed("inactive", true)
        .attr('value', 'healthcare')
        .text('Lacks Healthcare (%)');


    // set event listeners for both x and y axis.
    //x axis:
    LGroup.selectAll('text')
        .on('click', function () {
            var value = d3.select(this).attr('value');//to get value of the selection.
            if (value !== chosenXaxis) {
                chosenXaxis = value;//this replaces our chosenXaxis with values.
                xLinear_Scale = xScale(data, chosenXaxis);//updating x scale for a new data
                yLinear_Scale = yScale(data, chosenYaxis);//updating y scale for a new data
                XAxis = renderxAxes(xLinear_Scale, XAxis);//updating xaxis with transitions
                circlesGroup = renderCircles(circlesGroup, xLinear_Scale, chosenXaxis, yLinear_Scale, chosenYaxis);//updating circles with new x values.
                textgroup = renderText(textgroup, xLinear_Scale, yLinear_Scale, chosenXaxis, chosenYaxis);//updating textgroup with new values.
                circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);//updating tooltip with new information.

                //switching classes to change to bold text when clicked
                if (chosenXaxis === 'poverty') {
                    povertyLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    ageLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    incomeLabel
                        .classed('active', false)
                        .classes('inactive', true);
                }
                else {
                    povertyLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    ageLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    incomeLabel
                        .classed('active', true)
                        .classes('inactive', false);

                }
            }
        });
    Hgroup.selectAll('text')
        .on('click', function () {
            let value = d3.select(this).attr('value');//to get value of the selection.
            if (value !== chosenYaxis) {
                chosenYaxis = value;//this replaces our chosenXaxis with values.
                xLinear_Scale = xScale(data, chosenXaxis);//updating x scale for a new data
                yLinear_Scale = yScale(data, chosenYaxis);//updating y scale for a new data
                YAxis = renderyAxes(yLinear_Scale, YAxis);//updating xaxis with transitions
                circlesGroup = renderCircles(circlesGroup, xLinear_Scale, chosenXaxis, yLinear_Scale, chosenYaxis);//updating circles with new x values.
                textgroup = renderText(textgroup, xLinear_Scale, yLinear_Scale, chosenXaxis, chosenYaxis);//updating textgroup with new values.
                circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);//updating tooltip with new information.

                //switching classes to change to bold text when clicked
                if (chosenXaxis === 'obesity') {
                    obeseLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    smokesLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    healthcareLabel
                        .classed('active', false)
                        .classes('inactive', true);
                }
                else {
                    obeseLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    smokesLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    healthcareLabel
                        .classed('active', true)
                        .classes('inactive', false);

                }
            }
        });

}).catch(function (error) {
    console.log(error);
})

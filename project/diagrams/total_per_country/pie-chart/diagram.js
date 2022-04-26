const svg = d3.select('#mainFrame')
    .attr('height', innerHeight)
    .attr('width', innerWidth);

const render = data => {
    const xValue = d => d.refugees;
    const yValue = d => d.country;
    const margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 118
    }
    const innerWidth = this.innerWidth - margin.left - margin.right
    const innerHeight = this.innerHeight - margin.top - margin.bottom

    const radiusScale = d3.scaleLinear()
        .domain([0, d3.max(data, xValue)])  // Original range of values
        .range([0, 360])             // Range to map to
        .nice();

    console.log(data.map(yValue))
    const yScale = d3.scaleOrdinal()
        .domain(data.map(yValue))
        .range(['gold', "blue", "green", "yellow", "black", "grey", "darkgreen", "pink", "brown", "slateblue", "grey1", "orange"]);


    const g = svg.append('g')                                           // Adds a (g)roup element to the svg
        .attr('transform', `translate(${margin.left},${margin.top})`);  // and adds a transform attribute


    g.selectAll('path').data(data)                          // select all rects and link to data
        .enter().append('path')                             // when new data points enter, add a rect
        .attr('d', d3.arc()({
            innerRadius : 100,
            outerRadius: 200,
            startAngle: 0,
            endAngle: 90
        }))
        .transition()                                   // Adds a transition/animation
        .duration(2000)                             // which takes 2 seconds
        ;     // changing the width value to whatever is appropriate for that data point
};

const dataPath = '../total_refugees_per_country_condensed.csv';

// .csv creates a promise, when it resolves .then do something else
d3.csv(dataPath).then(data => {
    data.forEach(d => {                         // Foreach data-point in data
        d.refugees = +d.refugees;           // Cast value to float and take times 1000
        d.country = `${d.country}`;             // Kind of unnecessary, but fixed webstorm complaining
    });
    console.log(data);
    render(data);
})

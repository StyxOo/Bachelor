const svg = d3.select('#mainFrame');

const height = parseFloat(svg.attr('height'));
const width = +svg.attr('width'); // Shorthand for parseFloat


const render = data => {
    const xValue = d => d.population;
    const yValue = d => d.country;
    const margin = {
        top:20,
        right: 50,
        bottom: 50,
        left: 80
    }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, xValue)])
        .range([0, innerWidth]);

    const yScale = d3.scaleBand()
        .domain(data.map(yValue))
        .range([0, innerHeight])
        .padding(0.2);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xAxisTickFormat = number =>
        d3.format('.3s')(number)
            .replace('G', 'B');

    const xAxis = d3.axisBottom(xScale)
        .tickFormat(xAxisTickFormat)
        .tickSize(-innerHeight);

    g.append('g')
        .call(d3.axisLeft(yScale))
        .selectAll('.domain, .tick line')
            .remove();

    const xAxisGroup = g.append('g').call(xAxis)
        .attr('transform', `translate(0,${innerHeight})`);

    xAxisGroup
        .select('.domain')
            .remove();

    xAxisGroup.append('text')
        .attr('id', 'axis-label')
        .attr('fill', 'black')
        .attr('x', innerWidth / 2)
        .attr('y', 40)
        .text('Population')

    g.selectAll('rect').data(data)
        .enter().append('rect')
            .attr('width', d => xScale(xValue(d)))
            .attr('height', yScale.bandwidth())
            .attr('y', d => yScale(yValue(d)));

    g.append('text')
        .text('Country Population')
};

// .csv creates a promise, when it resolves .then do something else
d3.csv('data.csv').then(data => {
    data.forEach(d => { // Foreach datapoint in data
        d.population = +d.population * 1000; // Cast value to float and take times 1000
        d.country = `${d.country}`; // Kind of redundant, but fixed webstorm complaining
    });
    console.log(data);
    render(data);
})

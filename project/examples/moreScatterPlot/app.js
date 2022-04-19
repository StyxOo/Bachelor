const svg = d3.select('#mainFrame');

const height = parseFloat(svg.attr('height'));  // Converts string of number to float
const width = +svg.attr('width');               // Shorthand for parseFloat


const render = data => {
    const title = 'Horsepower to MpG ratio';

    const xValue = d => d.mpg;
    const xAxisLabel = 'MpG';
    const yValue = d => d.horsepower;
    const yAxisLabel = 'Horsepower';

    const circleRadius = 10;

    const margin = {
        top:40,
        right: 50,
        bottom: 50,
        left: 80
    };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
        // .domain([d3.min(data, xValue), d3.max(data, xValue)])
        .domain(d3.extent(data, xValue))
        .range([0, innerWidth])
        .nice();

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, yValue))
        .range([0, innerHeight])
        .nice();

    const g = svg.append('g')                                           // Adds a (g)roup element to the svg
        .attr('transform', `translate(${margin.left},${margin.top})`);  // and adds a transform attribute

    const yAxis = d3.axisLeft(yScale)
        .tickSize(-innerWidth);

    const yAxisGroup = g.append('g')
        .call(yAxis);

    yAxisGroup.select('.domain')
        .remove();

    yAxisGroup.append('text')
        .attr('id', 'axis-label')
        .attr('fill', 'black')
        .attr('x', -innerHeight/2)
        .attr('y', -40)
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
        .text(yAxisLabel);

    const xAxis = d3.axisBottom(xScale) // Pass a scale function as axis
        .tickSize(-innerHeight)
        .tickPadding(10);

    const xAxisGroup = g.append('g').call(xAxis)
        .attr('transform', `translate(0,${innerHeight})`);

    xAxisGroup.select('.domain')
            .remove();

    xAxisGroup.append('text')
        .attr('id', 'axis-label')
        .attr('fill', 'black')
        .attr('x', innerWidth / 2)
        .attr('y', 30)
        .text(xAxisLabel);

    g.selectAll('circle').data(data)
        .enter().append('circle')
            .attr('cx', d => xScale(xValue(d)))
            .attr('cy', d => yScale(yValue(d)))
            .attr('r', circleRadius);

    g.append('text')
        .text(title)
        .attr('text-anchor', 'middle')
        .attr('x', innerWidth/2)
        .attr('y', -10);
};


d3.csv('https://vizhub.com/curran/datasets/auto-mpg.csv')
    .then(data => {
        data.forEach(d => {
            d.mpg = +d.mpg;
            d.cylinders = +d.cylinders;
            d.displacement = +d.displacement;
            d.horsepower = +d.horsepower;
            d.weight = +d.weight;
            d.acceleration = +d.acceleration;
            d.year = +d.year;
            d.origin = `${d.origin}`
            d.name = `${d.name}`
    });
    console.log(data);
    render(data);
})

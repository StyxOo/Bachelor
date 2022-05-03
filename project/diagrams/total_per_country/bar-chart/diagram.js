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

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, xValue)])  // Original range of values
        .range([0, innerWidth])             // Range to map to
        .nice();

    const yScale = d3.scaleBand()
        .domain(data.map(yValue))
        .range([0, innerHeight])
        .padding(0.2);

    const colors = d3.scaleOrdinal(d3.schemeDark2);
    // console.log(colors)

    const g = svg.append('g')                                           // Adds a (g)roup element to the svg
        .attr('transform', `translate(${margin.left},${margin.top})`);  // and adds a transform attribute

    g.append('g')
        .call(d3.axisLeft(yScale))          // Call axisLeft as function on the g element
        .selectAll('.domain, .tick line')   // and select all lines in tick class tags
            .remove();                      // and remove them

    const xAxisTickFormat = number =>   // For an input number
        d3.format('.2s')(number)        // format the number to have three significant digits
            .replace('0.0', '0');         // and replace the SI-unit G with B

    const xAxis = d3.axisBottom(xScale) // Pass a scale function as axis
        .tickFormat(xAxisTickFormat)    // and pass a formatting function to format the string
        .tickSize(-innerHeight);

    const xAxisGroup = g.append('g').call(xAxis)
        .attr('transform', `translate(0,${innerHeight})`);

    xAxisGroup
        .select('.domain')
            .remove();

    const rectEnterGroup = g.selectAll('rect').data(data)                          // select all rects and link to data
        .enter().append('rect')                             // when new data points enter, add a rect
            // .attr('width', d => xScale(xValue(d)))          // with width depending on the x-value
            .attr('width', 0)                               // or 0 to start, when we want to animate.
            .attr('height', yScale.bandwidth())             // Set appropriate height.
            .attr('y', d => yScale(yValue(d)))              // and y offset, so rects don't overlap.
            .attr('fill', d => colors(d))

    rectEnterGroup.transition()                                   // Adds a transition/animation
        .duration(2000)                             // which takes 2 seconds
        .attr('width', d => xScale(xValue(d)));     // changing the width value to whatever is appropriate for that data point
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

const svg = d3.select('#mainFrame')
    .attr('height', innerHeight)
    .attr('width', innerWidth);

const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 118
}
const ourWidth = innerWidth - margin.left - margin.right
const ourHeight = innerHeight - margin.top - margin.bottom

const diagramGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const xAxisParentGroup = diagramGroup.append('g')
    .attr('id', 'xAxis')

const yAxisParentGroup = diagramGroup.append('g')
    .attr('id', 'yAxis')

const contentParentGroup = diagramGroup.append('g')
    .attr('id', 'content')


const colors = d3.scaleOrdinal(d3.schemeDark2);


const render = data => {
    console.log('Rendering bar chart')

    const t = svg.transition()
        .duration(1500);

    const xValue = d => d.refugees;
    const yValue = d => d.country;

    /**
     * Here we set up all the required scales. One for the x-axis, one for the y-axis and one for the color-coding
     */
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, xValue)])  // Original range of values
        .range([0, ourWidth])             // Range to map to
        .nice();

    const yScale = d3.scaleBand()
        .domain(data.map(yValue))
        .range([0, ourHeight])
        .padding(0.2);


    /**
     * Here we set up the y and x axes.
     */
    yAxisParentGroup.call(d3.axisLeft(yScale))          // Call axisLeft as function on the g element
        .selectAll('.domain, .tick line')   // and select all lines in tick class tags
            .remove();                      // and remove them

    const xAxisTickFormat = number =>   // For an input number
        d3.format('.2s')(number)        // format the number to have three significant digits
            .replace('0.0', '0');         // and replace the SI-unit G with B

    const xAxis = d3.axisBottom(xScale) // Pass a scale function as axis
        .tickFormat(xAxisTickFormat)    // and pass a formatting function to format the string
        .tickSize(-ourHeight);

    xAxisParentGroup.call(xAxis)
        .attr('transform', `translate(0,${ourHeight})`)
        .select('.domain')
            .remove();

    /**
     * This is where the actual content of the diagram is drawn.
     */
    contentParentGroup.selectAll('g .bar').data(data, d => {return d.country})
        .join(
            enter => {
                const bar = enter.append('g')
                    .attr('class', 'bar')

                bar.append('rect')
                    .attr('width', 0)
                    .attr('height', yScale.bandwidth())
                    .attr('y', d => yScale(yValue(d)))
                    .attr('fill', d => colors(d))
                    .call(enter => enter.transition(t)
                        .attr('width', d => xScale(xValue(d))))

                bar.append('text')
                    .text(d => xValue(d))
                    .attr('class', 'barText')
                    .attr('text-anchor', 'end')
                    .attr('dy', '0.32em')
                    .attr('y', d => yScale(yValue(d)) + yScale.bandwidth()/2)
                    .attr('x', 0)
                    .call(enter => enter.transition(t)
                        .attr('x', d => {
                            const scaleValue = xScale(xValue(d));
                            return (scaleValue - 60 > 0) ? scaleValue - 10 : 60;
                        }))
            },
            update => {
                update.select('rect')
                    .call(update => update.transition(t)
                        .attr('width', d => xScale(xValue(d)))
                        .attr('height', yScale.bandwidth())
                        .attr('y', d => yScale(yValue(d))))
                update.select('text')
                    .text(d => xValue(d))
                    .call(update => update.transition(t)
                        .attr('y', d => yScale(yValue(d)) + yScale.bandwidth()/2)
                        .attr('x', d => {
                            const scaleValue = xScale(xValue(d));
                            return (scaleValue - 60 > 0) ? scaleValue - 10 : 60;
                        }))
            },
            exit => exit.remove()
        )
};

/**
 * This section is only relevant for the implementation of the diagram within the iframe.
 * It tries to subscribe to the parent window for data.
 * If there is no data providing parent, it'll load its own data.
 */
try {
    parent.registerCountryDiagramRenderCallback(render)
    console.log('Could successfully subscribe to parent for data updates')
} catch (e) {
    console.log('Data is not provided externally. Loading data directly')
    const dataPath = '../total_refugees_per_country_condensed.csv';

// .csv creates a promise, when it resolves .then do something else
    d3.csv(dataPath).then(data => {
        data.forEach(d => {                         // Foreach data-point in data
            d.refugees = +d.refugees;           // Cast value to float and take times 1000
            d.country = `${d.country}`;             // Kind of unnecessary, but fixed webstorm complaining
        });
        render(data);
    })
}

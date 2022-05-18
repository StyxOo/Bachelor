const svg = d3.select('#mainFrame')
    .attr('height', innerHeight)
    .attr('width', innerWidth);

const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
}
const ourWidth = innerWidth - margin.left - margin.right
const ourHeight = innerHeight - margin.top - margin.bottom

const diagramGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const contentParentGroup = diagramGroup.append('g')
    .attr('id', 'content')



const render = (data, time01 = 0) => {
    console.log('Rendering circle chart')

    const t = svg.transition()
        .duration(1500);


    /**
     * Here we set up all the required scales. One for the x-axis, one for the y-axis and one for the color-coding
     */
    const timeScale = d3.scaleLinear()
        .domain([0, 1])  // Original range of values
        .range([d3.min(data, d => d.date), d3.max(data, d => d.date)])


    const radiusScale = d3.scaleSqrt()
        .domain([d3.min(data, d => d.date), d3.max(data, d => d.date)])
        .range([50, ourHeight/2])

    const unixTime = timeScale(time01)
    console.log('Day: ' + new Date(unixTime))
    console.log('Radius: ' + radiusScale(unixTime))


    /**
     * Here we set up the y and x axes.
     */


    /**
     * This is where the actual content of the diagram is drawn.
     */
    contentParentGroup.selectAll('circle').data([time01], () => [0])
        .join(
            enter => enter.append('circle')
                .attr('cx', ourWidth/2)
                .attr('cy', ourHeight/2)
                .attr('r', 0)
                .attr('fill', 'red')
                .call(enter => enter.transition(t)
                    .attr('r', () => radiusScale(timeScale(time01)))
                ),
            update => update.call(update => update.transition(t)
                .attr('r', () => radiusScale(timeScale(time01))))
        )


    // contentParentGroup.selectAll('g .bar').data(data, d => {return d.country})
    //     .join(
    //         enter => {
    //             const bar = enter.append('g')
    //                 .attr('class', 'bar')
    //
    //             bar.append('rect')
    //                 .attr('width', 0)
    //                 .attr('height', yScale.bandwidth())
    //                 .attr('y', d => yScale(yValue(d)))
    //                 .attr('fill', d => colors(d))
    //                 .call(enter => enter.transition(t)
    //                     .attr('width', d => xScale(xValue(d))))
    //
    //             bar.append('text')
    //                 .text(d => xValue(d))
    //                 .attr('class', 'barText')
    //                 .attr('text-anchor', 'end')
    //                 .attr('dy', '0.32em')
    //                 .attr('y', d => yScale(yValue(d)) + yScale.bandwidth()/2)
    //                 .attr('x', 0)
    //                 .call(enter => enter.transition(t)
    //                     .attr('x', d => {
    //                         const scaleValue = xScale(xValue(d));
    //                         return (scaleValue - 60 > 0) ? scaleValue - 10 : 60;
    //                     }))
    //         },
    //         update => {
    //             update.select('rect')
    //                 .call(update => update.transition(t)
    //                     .attr('width', d => xScale(xValue(d)))
    //                     .attr('height', yScale.bandwidth())
    //                     .attr('y', d => yScale(yValue(d))))
    //             update.select('text')
    //                 .text(d => xValue(d))
    //                 .call(update => update.transition(t)
    //                 .attr('y', d => yScale(yValue(d)) + yScale.bandwidth()/2)
    //                 .attr('x', d => {
    //                     const scaleValue = xScale(xValue(d));
    //                     return (scaleValue - 60 > 0) ? scaleValue - 10 : 60;
    //                 }))
    //         },
    //         exit => exit.remove()
    //     )
};

/**
 * This section is only relevant for the implementation of the diagram within the iframe.
 * It tries to subscribe to the parent window for data.
 * If there is no data providing parent, it'll load its own data.
 */
try {
    parent.registerDiagramRenderCallback(render)
    console.log('Could successfully subscribe to parent for data updates')
} catch (e) {
    console.log('Data is not provided externally. Loading data directly')
    const dataPath = '../total_refugees_daily_condensed.csv';

// .csv creates a promise, when it resolves .then do something else
    d3.csv(dataPath).then(data => {
        data.forEach(d => {                         // Foreach data-point in data
            d.refugees = +d.refugees;           // Cast value to float and take times 1000
            d.date = new Date(d.date);             // Kind of unnecessary, but fixed webstorm complaining
        });
        render(data);
    })
}

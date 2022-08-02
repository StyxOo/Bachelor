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

const axisGroup = diagramGroup.append('g')
    .attr('id', 'axis')

const contentParentGroup = diagramGroup.append('g')
    .attr('id', 'content')


const render = data => {
    console.log('Rendering stacked bar chart')

    const totalRefugees = d3.sum(data, d => d.refugees)

    const t = svg.transition()
        .duration(1500);


    /**
     * Here we set up all the required scales. One for the x-axis, one for the y-axis and one for the color-coding
     */
    const widthScale = d3.scaleLinear()
        .domain([0, totalRefugees])  // Original range of values
        .range([0, ourWidth])             // Range to map to

    const colors = d3.scaleOrdinal(d3.schemeDark2);




    /**
     * This is where the actual content of the diagram is drawn.
     */
    contentParentGroup.selectAll('rect').data(data, d => {return d.country})
        .join(
            enter => {
                const bar = enter.append('rect')
                    .attr('width', 0)
                    .attr('height', 60)
                    .attr('fill', d => colors(d))
                    .attr('x', 0)
                    .call(enter => {
                        let widthSoFar = 0
                        enter.transition(t)
                            .attr('width', d => widthScale(d.refugees))
                            .attr('x', d => {
                                const currentX = widthSoFar
                                widthSoFar += widthScale(d.refugees)
                                return currentX
                            })
                    })
            },
            update => {
                update
                    .call(update => {
                        let widthSoFar = 0
                        update.transition(t)
                            .attr('width', d => widthScale(d.refugees))
                            .attr('x', d => {
                                const currentX = widthSoFar
                                widthSoFar += widthScale(d.refugees)
                                return currentX
                            })
                    })
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

const svg = d3.select('#mainFrame')
    .attr('height', innerHeight)
    .attr('width', innerWidth);

const margin = {
    top: 10,
    right: 20,
    bottom: -10,
    left: 20
}
const ourWidth = innerWidth - margin.left - margin.right
const ourHeight = innerHeight - margin.top - margin.bottom

const diagramGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const legendParentGroup = diagramGroup.append('g')
    .attr('id', 'legend')
    // .attr('transform', `translate(${2 * radius + 60}, ${ourHeight/2 + 20})`)

const colors = d3.scaleOrdinal(d3.schemeDark2);


const render = data => {
    console.log('Rendering legend')


    const t = svg.transition()
        .duration(1500);


    const legendScale = d3.scaleBand()
        .domain(data.map(d => d.country))
        .range([0, ourHeight])
        .padding(0.3);


    legendParentGroup.selectAll('g .entry')
        .data(data, d => {return d.country})
        .join(
            enter => {
                const entry = enter.append('g')
                    .attr('class', 'entry')
                    .attr('transform', `translate(0, ${ourHeight})`)
                    .call(enter => enter.transition(t)
                        .attr('transform', d => {
                            return `translate(0, ${legendScale(d.country)})`
                        }))

                entry.append('circle')
                    .attr('cx', 0)
                    .attr('cy', 0)
                    .attr('r', 0)
                    .attr('fill', d => colors(d))
                    .call(
                        enter => enter.transition(t)
                        .attr('r', legendScale.bandwidth()/2))

                entry.append('text')
                    .text(d => d.country)
                    .attr('x', legendScale.bandwidth() * 1.3)
                    .attr('dy', '0.32em')
            },
            update => {
                update.call(update => update.transition(t)
                        .attr('transform', d => {
                            return `translate(0, ${legendScale(d.country)})`
                        }))
                update.select('text').call(
                    update => update.transition(t)
                        .attr('x', legendScale.bandwidth() * 1.3)
                )
                update.select('circle').call(
                    update => update.transition(t)
                        .attr('r', legendScale.bandwidth() / 2)
                )
            }
        )
};


/**
 * This section is only relevant for the implementation of the diagram within the iframe.
 * It tries to subscribe to the parent window for data.
 * If there is no data providing parent, it'll load it's own data.
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

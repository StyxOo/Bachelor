const svg = d3.select('#mainFrame')
    .attr('height', innerHeight)
    .attr('width', innerWidth);

const margin = {
    top: 10,
    right: 20,
    bottom: -10,
    left: 20
}

const contentHeight = innerHeight - margin.top - margin.bottom

const diagramGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const legendParentGroup = diagramGroup.append('g')
    .attr('id', 'legend')
    // .attr('transform', `translate(${2 * radius + 60}, ${contentHeight/2 + 20})`)

const colors = d3.scaleOrdinal(d3.schemeDark2);


const render = data => {
    console.log('Rendering legend')


    const t = svg.transition()
        .duration(1500);


    const legendScale = d3.scaleBand()
        .domain(data.map(d => d.country))
        .range([0, contentHeight])
        .padding(0.3);


    legendParentGroup.selectAll('g .entry')
        .data(data, d => {return d.country})
        .join(
            enter => {
                const entry = enter.append('g')
                    .attr('class', 'entry')
                    .attr('transform', `translate(0, ${contentHeight})`)
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
 * This section tries to subscribe to the country-data-service for data updates.
 * The diagram will not work without the country-data-service.
 */
try {
    parent.registerCountryDiagramRenderCallback(render);
    console.log('Could successfully subscribe to the country-data-service for data updates.');
} catch (e) {
    console.log('Could not subscribe to the country-data-service for data updates. ' +
        'Data is loaded directly.');

    loadCountryData(render)
}

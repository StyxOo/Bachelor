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

const countriesParentGroup = contentParentGroup.append('g')
    .attr('id', 'countries')

const linksParentGroup = contentParentGroup.append('g')
    .attr('id', 'links')


const colors = d3.scaleOrdinal(d3.schemeDark2)


const render = data => {
    console.log('Rendering sankey')

    const t = svg.transition()
        .duration(1500);

    const parent = {
        "country": "Ukraine"
    }

    let nodes = [{name: parent.country}]
    let links = []
    for (const d of data) {
        nodes.push({name: d.country})
        links.push({source: 'Ukraine', target: d.country, value: d.refugees})
    }

    const graph = d3.sankey()
        .nodeId(d => d.name)
        .nodeAlign(d3.sankeyJustify)
        .size([ourWidth, ourHeight])
        ({nodes, links})


    /**
     * Here we set up all the required scales. One for the x-axis, one for the y-axis and one for the color-coding
     */


    /**
     * This is where the actual content of the diagram is drawn.
     */
    countriesParentGroup.selectAll('g .country').data(nodes, d => {return d.name})
        .join(
            enter => {
                const country = enter.append('g')
                    .attr('class', 'country')

                country.append('rect')
                    .attr('x', 0)
                    .attr('y', d => d.y0)
                    .attr('width', 0)
                    .attr('height', d => d.y1 - d.y0)
                    .attr('fill', d => {
                        if (d.name == 'Ukraine') {
                            return '#0057B8'
                        } else {
                            return colors(d)
                        }
                    })
                    .call(enter => enter.transition(t)
                        .attr('x', d => d.x0)
                        .attr('width', d => d.x1 - d.x0))
                
                country.append('text')
                    .text(d => `${d.name}: ${d.value}`)
                    .attr('x', 0)
                    .attr('y', d => (d.y0 + d.y1)/2 + 5)
                    .attr('text-anchor', d => d.x0 < ourWidth/2? 'start' : 'end')
                    .attr('opacity', '0%')
                    .call(enter => enter.transition(t)
                        .attr('x', d => d.x0 < ourWidth/2? d.x1+10 : d.x0-10))
                    .call(enter => enter.transition(t).delay(100)
                        .attr('opacity', '100%'))
            },
            update => {
                update.select('rect').call(update => update.transition(t)
                    .attr('height', d => d.y1 - d.y0)
                    .attr('y', d => d.y0))

                update.select('text').call(update => update.transition(t)
                    .attr('y', d => (d.y0 + d.y1)/2 + 5))
                    .text(d => `${d.name}: ${d.value}`)
            }
        )

    linksParentGroup.selectAll('path').data(links, d => {return [d.source.name, d.target.name]})
        .join(
            enter => {
                enter.append('path')
                    .attr('d', d3.sankeyLinkHorizontal())
                    .attr('stroke', d => colors(d.target))
                    .attr('stroke-width', ({width}) => Math.max(1, width))
                    .attr('fill', d => colors(d.target))
                    .attr('opacity', 0)
                    .call(enter => enter.transition(t).delay(500)
                        .attr('opacity', '50%'))
            },
            update => {
                update.call(update => update.transition(t)
                    .attr('d', d3.sankeyLinkHorizontal())
                    .attr('stroke-width', ({width}) => Math.max(1, width)))
            }
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

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

const contentBackground = contentParentGroup.append('rect')
    .attr('id', 'contentBackground')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', ourWidth)
    .attr('height', ourHeight)
    .attr('fill', 'none')

const treemapParentGroup = contentParentGroup.append('g')
    .attr('id', 'treeMapParent')


const tooltip = d3.select("body")
    .append('svg')
    .attr('height', 50)
    .attr('width', 400)
    .attr('id', 'tooltip')
    .style('position', 'absolute')
    .style('z-index', 10)
    .classed('hidden', true)

const background = tooltip.append('rect')
    .attr('height', 50)
    .attr('width', 100)
    .attr('rx', 10)
    .attr('ry', 10)

const tooltipText = tooltip.append('text')
    .attr('y', 20)
    .attr('x', 5)
    .text('Some text')


const colors = d3.scaleOrdinal(d3.schemeDark2)


const render = data => {
    console.log('Rendering tree map')

    const t = svg.transition()
        .duration(1500);

    const parent = {
        "country": "Dummy Parent",
        "refugees": 0
    }

    data.push(parent)

    const root = d3.stratify()
        .id(d => {return d.country})
        .parentId((d) => {
            if (d.country === 'Dummy Parent')
                return undefined
            else
                return 'Dummy Parent'
        })
        (data)

    data.pop()

    root.sum(d => {return d.refugees})


    const treemap = d3.treemap()
        .size([ourWidth, ourHeight])
        .padding(4)(root)


    /**
     * Here we set up all the required scales. One for the x-axis, one for the y-axis and one for the color-coding
     */



    /**
     * This is where the actual content of the diagram is drawn.
     */
    treemapParentGroup.selectAll('rect').data(root.leaves(), d => {return d.data.country})
        .join(
            enter => {
                const bar = enter.append('rect')
                    .attr('x', 0)
                    .attr('y', `${ourHeight}`)
                    .attr('width', 0)
                    .attr('height', 0)
                    .attr('fill', d => colors(d.data))
                    .call(enter => enter.transition(t)
                        .attr('x', d => { return d.x0; })
                        .attr('y', d => { return d.y0; })
                        .attr('width', d => { return d.x1 - d.x0; })
                        .attr('height', d => { return d.y1 - d.y0; }))
                    .on('mouseover', (e, d) => {
                        tooltip.classed('hidden', false)
                        tooltipText.text(`${d.data.country}\nRefugees : ${d.data.refugees}`)
                        const textWidth = tooltipText.node().getBBox().width
                        background.attr('width', textWidth + 10)
                    })
                    .on('mousemove', e => {
                        const position = d3.pointer(e)
                        tooltip.style("top", (position[1]+0)+"px");
                        if (position[0] > ourWidth/2) {
                            const rect = tooltip.select('rect')
                            const width = rect.attr('width')
                            tooltip.style("left", (position[0] - width + 10) + "px");
                        } else {
                            tooltip.style("left", (position[0] + 35) + "px");
                        }
                    })
                    .on('mouseout', () => {
                        tooltip.classed('hidden', true)
                    })

            },
            update => {
                update
                    .call(update => update.transition(t)
                        .attr('x', d => { return d.x0; })
                        .attr('y', d => { return d.y0; })
                        .attr('width', d => { return d.x1 - d.x0; })
                        .attr('height', d => { return d.y1 - d.y0; }))
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

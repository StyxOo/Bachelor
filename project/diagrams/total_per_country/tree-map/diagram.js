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
    .attr('width', ourWidth * 2 / 3,)
    .attr('height', ourHeight)
    .attr('fill', 'none')

const treemapParentGroup = contentParentGroup.append('g')
    .attr('id', 'treeMapParent')

const legendParentGroup = diagramGroup.append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${2 * ourWidth / 3 }, ${ourHeight/2 + 20})`)

const legendHeader = legendParentGroup.append('text')
    .text('Legend')
    .attr('id', 'legendHeadline')
    .attr('x', 10)
    .attr('y', -27)


// TODO: Ad some kind of tooltip to this diagram


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
        .size([ourWidth * 2 / 3, ourHeight])
        .padding(4)(root)


    /**
     * Here we set up all the required scales. One for the x-axis, one for the y-axis and one for the color-coding
     */


    const legendScale = d3.scaleBand()
        .domain(data.map(d => d.country))
        .range([0, ourHeight/2])
        .padding(0.2);



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

    legendParentGroup.selectAll('g .entry')
        .data(data, d => {return d.country})
        .join(
            enter => {
                const entry = enter.append('g')
                    .attr('class', 'entry')
                    .attr('transform', `translate(0, ${ourHeight - 30})`)
                    .call(enter => enter.transition(t)
                        .attr('transform', d => {
                            return `translate(0, ${legendScale(d.country)})`
                        }))

                entry.append('circle')
                    .attr('cx', 20)
                    .attr('cy', -legendScale.bandwidth()/4)
                    .attr('r', legendScale.bandwidth()/2)
                    .attr('fill', d => colors(d))

                entry.append('text')
                    .text(d => d.country)
                    .attr('x', legendScale.bandwidth() * 2)
            },
            update => {
                update
                    .call(update => update.transition(t)
                        .attr('transform', d => {
                            return `translate(0, ${legendScale(d.country)})`
                        }))
            }
        )
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

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
const radius = d3.min([ourHeight/2, ourWidth/2])

const diagramGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const contentParentGroup = diagramGroup.append('g')
    .attr('id', 'content')
    .attr('transform', `translate(${ourWidth/2},${ourHeight/2})`)

const diagramParentGroup = contentParentGroup.append('g')
    .attr('id', 'diagram')


const totalTextGroup = contentParentGroup.append('text')
    .attr('id', 'totalTextGroup')
    .attr('display', true)

totalTextGroup.append('tspan')
    .text('So far a total of')
    .attr('dy', '-2.3em')
    .attr('x', 0)

const totalTextSpan = totalTextGroup.append('tspan')
    .text('TotalNumberHere')
    .attr('class', 'important')
    .attr('dy', '1.3em')
    .attr('x', 0)

totalTextGroup.append('tspan')
    .text('refugees have fled')
    .attr('dy', '1.1em')
    .attr('x', 0)

totalTextGroup.append('tspan')
    .text('Ukraine')
    .attr('class', 'important')
    .attr('dy', '1.3em')
    .attr('x', 0)


const currentTextGroup = contentParentGroup.append('text')
    .attr('id', 'currentTextGroup')
    .attr('display', 'none')

const currentNumberTextSpan = currentTextGroup.append('tspan')
    .text('CurrentNumberHere')
    .attr('class', 'important')
    .attr('dy', '-0.5em')
    .attr('x', 0)

currentTextGroup.append('tspan')
    .text('refugees have fled to')
    .attr('dy', '1.1em')
    .attr('x', 0)

const currentCountryTextSpan = currentTextGroup.append('tspan')
    .text('DestinationCountryHere')
    .attr('class', 'important')
    .attr('dy', '1.3em')
    .attr('x', 0)



const colors = d3.scaleOrdinal(d3.schemeDark2);


const render = data => {
    console.log('Rendering pie chart')

    const totalRefugees = d3.sum(data, d => d.refugees)
    totalTextSpan.text(`${totalRefugees}`)

    const t = svg.transition()
        .duration(1500);


    // Generate the pie
    const pie = d3.pie()
        .value(d => d.refugees)
        .padAngle(0.015)
        (data)

    // Generate the arcs
    const arc = d3.arc()
        .innerRadius(radius * .6)
        .outerRadius(radius);


    //Generate groups
    diagramParentGroup.selectAll('g .arc')
        .data(pie, d => {return d.data.country})
        .join(
            enter => {
                enter.append('g')
                    .attr('class', 'arc')
                    .append('path')
                    .attr('fill', d => colors(d.data))
                    .call(enter => enter.transition(t)
                        .attrTween('d', (d, index, nodes) => {
                                const i = d3.interpolate(0, d.startAngle);
                                const j = d3.interpolate(0, d.endAngle);

                                nodes[index].previousStartAngle = d.startAngle;
                                nodes[index].previousEndAngle = d.endAngle;

                                return time => {
                                    d.startAngle = i(time);
                                    d.endAngle = j(time);
                                    return arc(d);
                                }}))
                    .on('mouseover', (e, d) => {
                        currentNumberTextSpan.text(d.data.refugees)
                        currentCountryTextSpan.text(d.data.country)
                        currentTextGroup.attr('display', 'true')
                        totalTextGroup.attr('display', 'none')
                    })
                    .on('mouseout', () => {
                        currentTextGroup.attr('display', 'none')
                        totalTextGroup.attr('display', 'true')
                    })
            },
            update => {
                update.select('path')
                    .call(update => update.transition(t)
                        .attrTween('d', (d, index, nodes) => {
                            const i = d3.interpolate(nodes[index].previousStartAngle, d.startAngle);
                            const j = d3.interpolate(nodes[index].previousEndAngle, d.endAngle);

                            nodes[index].previousStartAngle = d.startAngle;
                            nodes[index].previousEndAngle = d.endAngle;

                            return time => {
                                d.startAngle = i(time);
                                d.endAngle = j(time);
                                return arc(d);
                            }}))
            },
            exit => exit.remove()
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

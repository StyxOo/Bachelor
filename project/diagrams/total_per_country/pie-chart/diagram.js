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
    .attr('transform', `translate(${radius + 20},${ourHeight/2})`)

const contentLabel = contentParentGroup.append('text')
    .text('Some text here')
    .attr('id', 'contentLabel')

const legendParentGroup = diagramGroup.append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${2 * radius + 60}, ${ourHeight/2 + 20})`)

const legendHeader = legendParentGroup.append('text')
    .text('Legend')
    .attr('id', 'legendHeadline')
    .attr('x', 10)
    .attr('y', -27)


const render = data => {
    console.log('Rendering pie chart')

    const t = svg.transition()
        .duration(1500);

    const xValue = d => d.refugees;
    const yValue = d => d.country;

    const colors = d3.scaleOrdinal(d3.schemeDark2);

    const legendScale = d3.scaleBand()
        .domain(data.map(d => d.country))
        .range([0, ourHeight/2])
        .padding(0.2);


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
    contentParentGroup.selectAll('g .arc')
        .data(pie, d => {return d.data.country})
        .join(
            enter => {
                enter.append('g')
                    .attr('class', 'arc')
                    .append('path')
                    .attr('fill', d => colors(d))
                    .call(enter => enter.transition(t)
                        .attrTween('d', d => {
                                const i = d3.interpolate(0, d.startAngle);
                                const j = d3.interpolate(0, d.endAngle);

                                return time => {
                                    d.startAngle = i(time);
                                    d.endAngle = j(time);
                                    return arc(d);
                                }}))
                    .each(d => {
                        d.previousStartAngle = d.startAngle;
                        d.previousEndAngle = d.endAngle;
                    })
                    .on('mouseover', d => {
                        console.log(d)
                        contentLabel.text(d.refugees)
                    })
            },
            update => {
                update.select('path')
                    .call(update => update.transition(t)
                        .attrTween('d', d => {
                            const i = d3.interpolate(0, d.startAngle); // TODO: This should really start at the previous angles
                            const j = d3.interpolate(0, d.endAngle);

                            return time => {
                                d.startAngle = i(time);
                                d.endAngle = j(time);
                                return arc(d);
                            }}))
                    .each(d => {
                        d.previousStartAngle = d.startAngle;
                        d.previousEndAngle = d.endAngle;
                    })
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
 * If there is no data providing parent, it'll load it's own data.
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

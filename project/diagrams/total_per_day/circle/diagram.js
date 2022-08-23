const svg = d3.select('#mainFrame')
    .attr('height', innerHeight)
    .attr('width', innerWidth);

const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 20
}
const ourWidth = innerWidth - margin.left - margin.right
const ourHeight = innerHeight - margin.top - margin.bottom

const legendScaleFactor = 100000

const diagramGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);


const legendParentGroup = diagramGroup.append('g')
    .attr('id', 'legend')

const contentParentGroup = diagramGroup.append('g')
    .attr('id', 'content')

const legendDescription = legendParentGroup.append('text')
    .text('* scale in 100,000 refugees')
    .attr('class', 'description')
    .attr('x', ourWidth)
    .attr('y', ourHeight)

const dateToDisplay = date => {
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'short' });

    let dayString = day
    if (day < 10) {
        dayString = '0' + dayString
    }

    return [month, dayString].join('-')
}


const render = (data, time01 = 0) => {
    console.log('Rendering circle chart')

    const t = svg.transition()
        .duration(1500);


    /**
     * Here we set up all the required scales. One for the x-axis, one for the y-axis and one for the color-coding
     */
    const timeScale = d3.scaleQuantize()
        .domain([0, 1])  // Original range of values
        .range(data.map(d => d.date))


    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.refugees)])
        .range([0, ourHeight / 2])

    /**
     * Here we set up the y and x axes.
     */

    const ticks = radiusScale.ticks(10).filter(d => d !== 0)
    let tickData = []
    for (let i = 0; i < ticks.length; i++) {
        tickData.push({ id: i, value: ticks[i] })
    }
    legendParentGroup.selectAll('g').data(tickData, d => { return d.id })
        .join(
            enter => {
                const tick = enter.append('g')
                    .attr('opacity', '0%')
                    .call(enter => enter.transition(t)
                        .attr('opacity', '75%'))
                tick.append('circle')
                    .attr('cx', ourWidth / 2)
                    .attr('cy', d => ourHeight - radiusScale(d.value))
                    .attr('r', d => radiusScale(d.value))
                    .attr('class', 'legend')
                tick.append('text')
                    .text((d, i) => {
                        let value = d.value / legendScaleFactor
                        if (i === tickData.length - 1) {
                            value += '*'
                        }
                        return value
                    })
                    .attr('dy', '-0.1em')
                    .attr('x', ourWidth / 2)
                    .attr('y', d => ourHeight - 2 * radiusScale(d.value))
            },
            update => {
                update.call(update => update.transition(t)
                    .attr('cy', d => ourHeight - radiusScale(d.value))
                    .attr('r', d => radiusScale(d.value)))
                update.select('text')
                    .text((d, i) => {
                        let value = d.value / legendScaleFactor
                        if (i === tickData.length - 1) {
                            value += '*'
                        }
                        return value
                    })
            }
            ,
            exit => exit.call(exit => exit.transition(t)
                .attr('opacity', '0%'))
                .remove()
        )


    /**
     * This is where the actual content of the diagram is drawn.
     */
    const unixTime = timeScale(time01)
    const datum = data.find(d => d.date === unixTime)
    contentParentGroup.selectAll('g .content').data([0], () => [0])
        .join(
            enter => {
                const content = enter.append('g')
                    .attr('class', 'content')

                content.append('circle')
                    .attr('cx', ourWidth / 2)
                    .attr('cy', ourHeight)
                    .attr('r', 0)
                    .attr('fill', 'red')
                    .attr('opacity', '50%')
                    .call(enter => enter.transition(t)
                        .attr('cy', () => ourHeight - radiusScale(datum.refugees))
                        .attr('r', () => radiusScale(datum.refugees)))

                content.append('text')
                    .attr('x', ourWidth / 2)
                    .attr('y', ourHeight + 17)
                    .text(datum.refugees + ' refugees by ' + dateToDisplay(datum.date))

            }
            ,
            update => {
                update.select('circle')
                    .call(update => update.transition(t)
                        .attr('cy', () => ourHeight - radiusScale(datum.refugees))
                        .attr('r', () => radiusScale(datum.refugees)))

                update.select('text')
                    .call(update => update.transition(t)
                        .text(datum.refugees + ' refugees by ' + dateToDisplay(datum.date)))
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

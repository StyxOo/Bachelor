const svg = d3.select('#mainFrame')
    .attr('height', innerHeight)
    .attr('width', innerWidth);

const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 70
}
const ourWidth = innerWidth - margin.left - margin.right
const ourHeight = innerHeight - margin.top - margin.bottom

const diagramGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const xAxisParentGroup = diagramGroup.append('g')
    .attr('id', 'xAxis')

const yAxisParentGroup = diagramGroup.append('g')
    .attr('id', 'yAxis')

const contentParentGroup = diagramGroup.append('g')
    .attr('id', 'content')

const dateLineParentGroup = contentParentGroup.append('g')
    .attr('id', 'dateLine')



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

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.refugees)])  // Original range of values
        .range([ourHeight, 0])             // Range to map to
        .nice();

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.date))
        .range([0, ourWidth])
        .padding(0.2);

    const xScaleWithOffset = d => {
        return xScale(d) + xScale.bandwidth() / 2
    }


    /**
     * Here we set up the y and x axes.
     */

    const yAxis = d3.axisLeft(yScale)
        .tickSize(-ourWidth)

    yAxisParentGroup.call(yAxis)          // Call axisLeft as function on the g element
        .selectAll('.domain')   // and select all lines in tick class tags
        .remove();                      // and remove them

    // const xAxisTickFormat = number =>   // For an input number
    //     d3.format('.2s')(number)        // format the number to have three significant digits
    //         .replace('0.0', '0');         // and replace the SI-unit G with B

    const dateToDisplay = date => {
        const day = date.getDate()
        const month = date.toLocaleString('default', { month: 'short' });

        let dayString = day
        if (day < 10) {
            dayString = '0' + dayString
        }

        return [month, dayString].join('-')
    }


    const xAxisTickFormat = date =>
        dateToDisplay(date)

    const tickModulo = Math.floor(data.length / 15)

    const xAxis = d3.axisBottom(xScale) // Pass a scale function as axis
        .tickFormat(xAxisTickFormat)    // and pass a formatting function to format the string
        .tickSize(-ourHeight)
        .tickValues(xScale.domain().filter((d, i) => { return !(i % tickModulo) }))
    // .ticks(30);

    xAxisParentGroup.call(xAxis)
        .attr('transform', `translate(0,${ourHeight})`)
        .select('.domain')
        .remove();

    xAxisParentGroup.selectAll('text').attr('transform', `translate(0,${10})`)


    /**
     * This is where the actual content of the diagram is drawn.
     */

    const line = d3.line()
        .x(d => xScaleWithOffset(d.date))
        .y(d => yScale(d.refugees));

    const area = d3.area()
        .x(d => xScaleWithOffset(d.date))
        .y1(ourHeight)
        .y0(d => yScale(d.refugees));

    contentParentGroup.selectAll('g .areaGroup').data([0], () => [0])
        .join(
            enter => {
                const areaParent = enter.append('g')
                    .attr('class', 'areaGroup')

                areaParent.append('path')
                    .attr('class', 'topLine')
                    .attr('d', line(data))

                areaParent.append('path')
                    .attr('class', 'area')
                    .attr('d', area(data))
            },
            update => {
                update.select('.topLine')
                    .call(update => update.transition(t)
                        .attr('d', line(data)))

                update.select('.area')
                    .call(update => update.transition(t)
                        .attr('d', area(data)))
            }
        )


    const unixTime = timeScale(time01)
    const datum = data.find(d => d.date === unixTime)

    contentParentGroup.selectAll('g .dateLine').data([0], () => [0])
        .join(
            enter => {
                const dateLine = enter.append('g')
                    .attr('class', 'dateLine')
                    .attr('transform', `translate(${xScale.bandwidth() / 2},0)`)

                dateLine.append('circle')
                    .attr('class', 'dateLineDot')
                    .attr('cx', xScale(datum.date))
                    .attr('cy', yScale(datum.refugees))
                    .attr('r', 6)

                dateLine.append('line')
                    .attr('class', 'dateLineLine')
                    .attr('x1', xScale(datum.date))
                    .attr('x2', xScale(datum.date))
                    .attr('y1', yScale(datum.refugees))
                    .attr('y2', ourHeight)

                dateLine.append('text')
                    .attr('class', 'dateLineText')
                    .text(datum.refugees)
                    .attr('x', xScale(datum.date))
                    .attr('y', yScale(datum.refugees) - 10)
            },
            update => {
                update.select('circle').call(update => update.transition(t)
                    .attr('cx', xScale(datum.date))
                    .attr('cy', yScale(datum.refugees)))

                update.select('line').call(update => update.transition(t)
                    .attr('x1', xScale(datum.date))
                    .attr('x2', xScale(datum.date))
                    .attr('y1', yScale(datum.refugees)))

                update.select('text').call(update => update.transition(t)
                    .text(datum.refugees)
                    .attr('x', xScale(datum.date))
                    .attr('y', yScale(datum.refugees) - 20))
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

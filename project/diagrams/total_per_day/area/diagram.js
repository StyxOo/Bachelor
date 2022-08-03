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


    /**
     * Here we set up the y and x axes.
     */

    yAxisParentGroup.call(d3.axisLeft(yScale))          // Call axisLeft as function on the g element
        .selectAll('.domain, .tick line')   // and select all lines in tick class tags
        .remove();                      // and remove them

    // const xAxisTickFormat = number =>   // For an input number
    //     d3.format('.2s')(number)        // format the number to have three significant digits
    //         .replace('0.0', '0');         // and replace the SI-unit G with B

    const dateToDisplay = date => {
        const day = date.getDate()
        const month = date.getMonth() + 1
        const year = date.getFullYear()

        let dayString = day
        if (day < 10) {
            dayString = '0' + dayString
        }

        let monthString = month
        if (month < 10) {
            monthString = '0' + monthString
        }

        return [dayString, monthString, year].join('-')
    }


    const xAxisTickFormat = date =>
        dateToDisplay(date)

    const tickModulo = Math.floor(data.length / 10)

    const xAxis = d3.axisBottom(xScale) // Pass a scale function as axis
        .tickFormat(xAxisTickFormat)    // and pass a formatting function to format the string
        .tickSize(-ourHeight)
        .tickValues(xScale.domain().filter((d,i) => { return !(i % tickModulo)}))
        // .ticks(30);

    xAxisParentGroup.call(xAxis)
        .attr('transform', `translate(0,${ourHeight})`)
        .select('.domain')
        .remove();

    xAxisParentGroup.selectAll('text').attr('transform', `translate(0,${10})`)


    /**
     * This is where the actual content of the diagram is drawn.
     */

    const area = d3.area()
        .x(d => xScale(d.date))
        .y0(ourHeight)
        .y1(d => yScale(d.refugees));

    contentParentGroup.selectAll('path').data([0], () => [0])
        .join(
            enter => {
                enter.append('path')
                    .attr('class', 'area')
                    .attr('d', area(data))
            },

        )

    const unixTime = timeScale(time01)
    const datum = data.find(d => d.date === unixTime)

    contentParentGroup.selectAll('g .dateLine').data([0], () => [0])
        .join(
            enter => {
                const dateLine = enter.append('g')
                    .attr('class', 'dateLine')

                dateLine.append('circle')
                    .attr('cx', xScale(datum.date))
                    .attr('cy', yScale(datum.refugees))
                    .attr('fill', 'red')
                    .attr('r', 5)

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
                update.select('circle')
                    .attr('cx', xScale(datum.date))
                    .attr('cy', yScale(datum.refugees))

                update.select('line')
                    .attr('x1', xScale(datum.date))
                    .attr('x2', xScale(datum.date))
                    .attr('y1', yScale(datum.refugees))

                update.select('text')
                    .text(datum.refugees)
                    .attr('x', xScale(datum.date))
                    .attr('y', yScale(datum.refugees) - 20)
            }
        )




    // contentParentGroup.selectAll('circle').data([time01], () => [0])
    //     .join(
    //         enter => enter.append('circle')
    //             .attr('cx', ourWidth/2)
    //             .attr('cy', ourHeight)
    //             .attr('r', 0)
    //             .attr('fill', 'red')
    //             .attr('opacity', '50%')
    //             .call(enter => enter.transition(t)
    //                 .attr('cy', () => ourHeight - radiusScale(datum.refugees))
    //                 .attr('r', () => radiusScale(datum.refugees))
    //             ),
    //         update => update.call(update => update.transition(t)
    //             .attr('cy', () => ourHeight - radiusScale(datum.refugees))
    //             .attr('r', () => radiusScale(datum.refugees)))
    //     )


    // contentParentGroup.selectAll('g .bar').data(data, d => {return d.country})
    //     .join(
    //         enter => {
    //             const bar = enter.append('g')
    //                 .attr('class', 'bar')
    //
    //             bar.append('rect')
    //                 .attr('width', 0)
    //                 .attr('height', yScale.bandwidth())
    //                 .attr('y', d => yScale(yValue(d)))
    //                 .attr('fill', d => colors(d))
    //                 .call(enter => enter.transition(t)
    //                     .attr('width', d => xScale(xValue(d))))
    //
    //             bar.append('text')
    //                 .text(d => xValue(d))
    //                 .attr('class', 'barText')
    //                 .attr('text-anchor', 'end')
    //                 .attr('dy', '0.32em')
    //                 .attr('y', d => yScale(yValue(d)) + yScale.bandwidth()/2)
    //                 .attr('x', 0)
    //                 .call(enter => enter.transition(t)
    //                     .attr('x', d => {
    //                         const scaleValue = xScale(xValue(d));
    //                         return (scaleValue - 60 > 0) ? scaleValue - 10 : 60;
    //                     }))
    //         },
    //         update => {
    //             update.select('rect')
    //                 .call(update => update.transition(t)
    //                     .attr('width', d => xScale(xValue(d)))
    //                     .attr('height', yScale.bandwidth())
    //                     .attr('y', d => yScale(yValue(d))))
    //             update.select('text')
    //                 .text(d => xValue(d))
    //                 .call(update => update.transition(t)
    //                 .attr('y', d => yScale(yValue(d)) + yScale.bandwidth()/2)
    //                 .attr('x', d => {
    //                     const scaleValue = xScale(xValue(d));
    //                     return (scaleValue - 60 > 0) ? scaleValue - 10 : 60;
    //                 }))
    //         },
    //         exit => exit.remove()
    //     )
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

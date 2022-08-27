/**
 * This script was created as part of a bachelor thesis.
 * The results can be found here: https://github.com/StyxOo/styxoo.github.io
 * Author: Luis Rothenhäusler
 * Last edit: 25th August 2022
 *
 * This file contains the JavaScript implementation of the sankey-diagram.
 */

/**
 * In this first section, some data independent constants are defined.
 */
// This creates a reference to the SVG container on the HTML page. This will contain the whole diagram.
const svg = d3.select('#mainFrame')
    .attr('height', innerHeight)
    .attr('width', innerWidth);

// The margin definition for the diagram. The content is padded from the sides using the margins.
const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 70
}

// contentWidth and contentHeight store the available coordinate space for the content of the diagram.
const contentWidth = innerWidth - margin.left - margin.right
const contentHeight = innerHeight - margin.top - margin.bottom

/**
 * This section defines the hierarchy of the diagram.
 * This makes later selections and debugging in the browser inspector easier.
 */
const diagramGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const xAxisParentGroup = diagramGroup.append('g')
    .attr('id', 'xAxis')

const yAxisParentGroup = diagramGroup.append('g')
    .attr('id', 'yAxis')

const contentParentGroup = diagramGroup.append('g')
    .attr('id', 'content')

contentParentGroup.append('g')
    .attr('id', 'dateLine')

/**
 * This section defines a helper functions necessary for creating the diagram.
 */
// This function converts a JavaScript date object into a string of the style Feb-07 or Jun-15.
const dateToDisplay = date => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });

    let dayString = day;
    if (day < 10) {
        dayString = '0' + dayString;
    }
    return [month, dayString].join('-');
}

/**
 * The render function is defined here.
 * It is called to initially draw the diagram, as well every time the data changes and the diagram should update.
 */
const render = (data, time01 = 0) => {
    console.log('Rendering circle chart')

    /**
     * The following defines the transition which is used for all animations.
     */
    const t = svg.transition()
        .duration(1500);

    /**
     * Here all the required scales, which are dependent on the data, are defined.
     */
    // The time scale is used to convert between the time value of [0, 1], to the actual date.
    const timeScale = d3.scaleQuantize()
        .domain([0, 1])
        .range(data.map(d => d.date))

    // The y scale is used to calculate a y coordinate from a given refugee number.
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.refugees)])
        .range([contentHeight, 0])
        .nice();

    // The x scale is used to calculate a x coordinate from a given date.
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.date))
        .range([0, contentWidth])
        .padding(0.2);

    // this is used to offset the calculated x positions, so they align to the center of a date-line.
    // As the scale is a scaleBand, they would otherwise be offset slightly to the left.
    const xScaleWithOffset = d => {
        return xScale(d) + xScale.bandwidth() / 2
    }

    /**
     * This section is responsible for creating the x and y axes of the area-graph.
     */
    // The y-axis is created from the scale. Additionally, the tick size is specified to cover the whole background.
    const yAxis = d3.axisLeft(yScale)
        .tickSize(-contentWidth)

    // The y-axis is added to the diagram, but the domain lines are removed.
    yAxisParentGroup.call(yAxis)
        .selectAll('.domain')
        .remove();

    // This defines the function responsible for formatting the x-axis ticks.
    const xAxisTickFormat = date =>
        dateToDisplay(date)

    // This specifies the modulo value to be used, so that the resulting axis has 15 ticks.
    const tickModulo = Math.floor(data.length / 15)

    // This creates the x-axis. The values are filtered so only 15 values appear.
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(xAxisTickFormat)
        .tickSize(-contentHeight)
        .tickValues(xScale.domain().filter((d, i) => { return !(i % tickModulo) }))

    // The x-axis is added to the diagram, positioned to the bottom and has its domain line removed.
    xAxisParentGroup.call(xAxis)
        .attr('transform', `translate(0,${contentHeight})`)
        .select('.domain')
        .remove();

    // All x-axis labels are moved a small bit further towards the bottom.
    xAxisParentGroup.selectAll('text').attr('transform', `translate(0,${10})`)


    /**
     * This section defines more helper functions necessary for creating the diagram.
     * As these require the scales, they are defined here.
     */

    // This function creates a SVG line for a dataset, where each points x and y values are calculated as defined.
    const line = d3.line()
        .x(d => xScaleWithOffset(d.date))
        .y(d => yScale(d.refugees));

    // This function creates a SVG line enclosing an area for a dataset.
    // Each x, as well as the higher and lower y positions values are calculated as defined.
    const area = d3.area()
        .x(d => xScaleWithOffset(d.date))
        .y0(contentHeight)
        .y1(d => yScale(d.refugees));

    /**
     * This is where the actual content of the diagram is drawn. This consists of an area and a line atop.
     * Therefore, a data-join is created and the behavior of the general update pattern is specified.
     * The enter behavior is only executed once, as the diagram is loaded.
     */
    contentParentGroup.selectAll('g .areaGroup').data([0], () => [0])
        .join(
            // This describes the behavior of the enter sub-selection of the general update pattern.
            enter => {
                // A group is added for hierarchical purposes.
                const areaParent = enter.append('g')
                    .attr('class', 'areaGroup')

                // The area is drawn in the diagram.
                areaParent.append('path')
                    .attr('class', 'area')
                    .attr('d', area(data))

                // The top-line is drawn above the area in the diagram.
                areaParent.append('path')
                    .attr('class', 'topLine')
                    .attr('d', line(data))

            },
            // This describes the behavior of the update sub-selection of the general update pattern.
            update => {
                // The area is recreated and transitions to the new path.
                update.select('.area')
                    .call(update => update.transition(t)
                        .attr('d', area(data)))

                // The top-line is recreated and transitions to the new path.
                update.select('.topLine')
                    .call(update => update.transition(t)
                        .attr('d', line(data)))
            });

    /**
     * This section is responsible for the date-line. It is drawn and updated using a data-join.
     * The enter behavior is only executed once, as the diagram is initially drawn.
     */
    // Using the time scale, the current date is found.
    const unixTime = timeScale(time01)
    const datum = data.find(d => d.date === unixTime)

    contentParentGroup.selectAll('g .dateLine').data([0], () => [0])
        .join(
            // This describes the behavior of the enter sub-selection of the general update pattern.
            enter => {
                // A group element is added for the date-line.
                const dateLine = enter.append('g')
                    .attr('class', 'dateLine')
                    .attr('transform', `translate(${xScale.bandwidth() / 2},0)`)

                // The circle which intersects the date-line and top-line is added, positioned and sized.
                dateLine.append('circle')
                    .attr('class', 'dateLineDot')
                    .attr('cx', xScale(datum.date))
                    .attr('cy', yScale(datum.refugees))
                    .attr('r', 6)

                // The line is added to the date-line.
                dateLine.append('line')
                    .attr('class', 'dateLineLine')
                    .attr('x1', xScale(datum.date))
                    .attr('x2', xScale(datum.date))
                    .attr('y1', yScale(datum.refugees))
                    .attr('y2', contentHeight)

                // The text showing the current refugee number is added above the date-line.
                dateLine.append('text')
                    .attr('class', 'dateLineText')
                    .text(datum.refugees)
                    .attr('x', xScale(datum.date))
                    .attr('y', yScale(datum.refugees) - 10)
            },
            // This describes the behavior of the update sub-selection of the general update pattern.
            update => {
                // The circle is transitioned to its new position.
                update.select('circle').call(update => update.transition(t)
                    .attr('cx', xScale(datum.date))
                    .attr('cy', yScale(datum.refugees)))

                // The line is shifted and adjusted in length.
                update.select('line').call(update => update.transition(t)
                    .attr('x1', xScale(datum.date))
                    .attr('x2', xScale(datum.date))
                    .attr('y1', yScale(datum.refugees)))

                // The text value is updated and repositioned.
                update.select('text').call(update => update.transition(t)
                    .text(datum.refugees)
                    .attr('x', xScale(datum.date))
                    .attr('y', yScale(datum.refugees) - 20))
            }
        )
};

/**
 * This section tries to subscribe to the daily-data-service for data updates.
 * The diagram will not work without the daily-data-service.
 */
try {
    parent.registerDailyDiagramRenderCallback(render);
    console.log('Could successfully subscribe to the daily-data-service for data updates.');
} catch (e) {
    console.log('Could not subscribe to the daily-data-service for data updates. ' +
        'Data is loaded directly.');

    loadDailyData(render)
}

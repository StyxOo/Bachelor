/**
 * This script was created as part of a bachelor thesis.
 * The results can be found here: https://github.com/StyxOo/styxoo.github.io
 * Author: Luis Rothenhäusler
 * Last edit: 25th August 2022
 *
 * This file contains the JavaScript implementation of the bar-chart.
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
    bottom: 20,
    left: 118
};

// contentWidth and contentHeight store the available coordinate space for the content of the diagram.
const contentWidth = innerWidth - margin.left - margin.right;
const contentHeight = innerHeight - margin.top - margin.bottom;

/**
 * This section defines the hierarchy of the diagram.
 * This makes later selections and debugging in the browser inspector easier.
 */
const diagramGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const xAxisParentGroup = diagramGroup.append('g')
    .attr('id', 'xAxis');

const yAxisParentGroup = diagramGroup.append('g')
    .attr('id', 'yAxis');

const contentParentGroup = diagramGroup.append('g')
    .attr('id', 'content');

/**
 * This section defines the color scale used to color elements according to their country.
 * It can be defined here, as it is independent of the data
 */
const colors = d3.scaleOrdinal(d3.schemeDark2);

/**
 * The render function is defined here.
 * It is called to initially draw the diagram, as well every time the data changes and the diagram should update.
 */
const render = data => {
    console.log('Rendering bar chart');

    /**
     * The following defines the transition which is used for all animations.
     */
    const t = svg.transition()
        .duration(1500);

    /**
     * Here all the required scales, which are dependent on the data, are defined.
     */
    // The xScale is used to convert from the number of refugees to the applicable x coordinate.
    // It is also used while creating the x-axis legend.
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.refugees)])
        .range([0, contentWidth])
        .nice();

    // The yScale is used to convert country to the applicable y coordinate.
    // It is also used while creating the y-axis legend.
    const yScale = d3.scaleBand()
        .domain(data.map(d => d.country))
        .range([0, contentHeight])
        .padding(0.2);

    /**
     * This section is responsible for creating the x and y axes of the bar-chart.
     */
    // This creates the y-axis from the scale and adds it to the diagram. It also removes the domain and tick lines.
    yAxisParentGroup.call(d3.axisLeft(yScale))
        .selectAll('.domain, .tick line')
            .remove();

    // This defines the function responsible for formatting the x-axis ticks.
    const xAxisTickFormat = number =>
        d3.format('.2s')(number)
            .replace('0.0', '0');

    // This creates the x-axis taking the formatting into account. Also tick lines will be drawn over the whole diagram.
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(xAxisTickFormat)
        .tickSize(-contentHeight);

    // This adds the x-Axis to the diagram, positions it accordingly and removes the domain lines.
    xAxisParentGroup.call(xAxis)
        .attr('transform', `translate(0,${contentHeight})`)
        .select('.domain')
            .remove();

    /**
     * This is where the actual content of the diagram is drawn.
     * Therefore, a data-join is created and the behavior of the general update pattern is specified.
     */
    contentParentGroup.selectAll('g .bar').data(data, d => {return d.country})
        .join(
            // This describes the behavior of the enter sub-selection of the general update pattern.
            enter => {
                // A group element is added for a new bar
                const bar = enter.append('g')
                    .attr('class', 'bar')

                // The rectangle is added to the bar. It is styled, positioned and animated.
                bar.append('rect')
                    .attr('width', 0)
                    .attr('height', yScale.bandwidth())
                    .attr('y', d => yScale(d.country))
                    .attr('fill', d => colors(d))
                    .call(enter => enter.transition(t)
                        .attr('width', d => xScale(d.refugees)));

                // The text is added to the bar. It is provided the refugee value, as well as positioned and animated.
                bar.append('text')
                    .text(d => d.refugees)
                    .attr('class', 'barText')
                    .attr('text-anchor', 'end')
                    .attr('dy', '0.32em')
                    .attr('y', d => yScale(d.country) + yScale.bandwidth()/2)
                    .attr('x', 0)
                    .call(enter => enter.transition(t)
                        .attr('x', d => {
                            // If the rectangle is too small, the text is placed to the right of it
                            const scaleValue = xScale(d.refugees);
                            return (scaleValue - 60 > 0) ? scaleValue - 10 : 60;
                        }));
            },
            // This describes the behavior of the update sub-selection of the general update pattern.
            update => {
                // The rectangle is selected and updated in position and size.
                update.select('rect')
                    .call(update => update.transition(t)
                        .attr('width', d => xScale(d.refugees))
                        .attr('height', yScale.bandwidth())
                        .attr('y', d => yScale(d.country)));

                // The text is selected and updated in value and position
                update.select('text')
                    .text(d => d.refugees)
                    .call(update => update.transition(t)
                        .attr('y', d => yScale(d.country) + yScale.bandwidth()/2)
                        .attr('x', d => {
                            const scaleValue = xScale(d.refugees);
                            return (scaleValue - 60 > 0) ? scaleValue - 10 : 60;
                        }));
            },
            // This describes the behavior of the update sub-selection of the general update pattern.
            // Applicable elements are simply removed. This is also the default behavior and doesn't need specification.
            exit => exit.remove()
        );
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

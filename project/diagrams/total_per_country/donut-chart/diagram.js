/**
 * This script was created as part of a bachelor thesis.
 * For more information, visit: https://github.com/StyxOo/styxoo.github.io
 * Author: Luis Rothenhäusler
 * Last edit: 25th August 2022
 *
 * This file contains the JavaScript implementation of the donut-chart.
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
    left: 20
};

// contentWidth and contentHeight store the available coordinate space for the content of the diagram.
const contentWidth = innerWidth - margin.left - margin.right;
const contentHeight = innerHeight - margin.top - margin.bottom;

// The radius of the donut is set to use as much space as available.
const radius = d3.min([contentHeight/2, contentWidth/2]);

/**
 * This section defines the hierarchy of the diagram.
 * This makes later selections and debugging in the browser inspector easier.
 */
const diagramGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const contentParentGroup = diagramGroup.append('g')
    .attr('id', 'content')
    .attr('transform', `translate(${contentWidth/2},${contentHeight/2})`);

const diagramParentGroup = contentParentGroup.append('g')
    .attr('id', 'diagram');

/**
 * This section adds all the necessary text fields for showing the total refugees,
 * as well as the refugees for the currently hovered over country.
 */
// The following adds the text to display when no section is hovered over.
const totalTextGroup = contentParentGroup.append('text')
    .attr('id', 'totalTextGroup')
    .attr('display', true);

totalTextGroup.append('tspan')
    .text('So far a total of')
    .attr('dy', '-2.3em')
    .attr('x', 0);

const totalTextSpan = totalTextGroup.append('tspan')
    .text('TotalNumberHere')
    .attr('class', 'important')
    .attr('dy', '1.3em')
    .attr('x', 0);

totalTextGroup.append('tspan')
    .text('refugees have fled')
    .attr('dy', '1.1em')
    .attr('x', 0);

totalTextGroup.append('tspan')
    .text('Ukraine')
    .attr('class', 'important')
    .attr('dy', '1.3em')
    .attr('x', 0);

// The following adds the text to display if a section is hovered over.
const currentTextGroup = contentParentGroup.append('text')
    .attr('id', 'currentTextGroup')
    .attr('display', 'none');

const currentNumberTextSpan = currentTextGroup.append('tspan')
    .text('CurrentNumberHere')
    .attr('class', 'important')
    .attr('dy', '-0.5em')
    .attr('x', 0);

currentTextGroup.append('tspan')
    .text('refugees have fled to')
    .attr('dy', '1.1em')
    .attr('x', 0);

const currentCountryTextSpan = currentTextGroup.append('tspan')
    .text('DestinationCountryHere')
    .attr('class', 'important')
    .attr('dy', '1.3em')
    .attr('x', 0);

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
    console.log('Rendering pie chart');

    // The total refugees are calculated and the according center text is updated.
    const totalRefugees = d3.sum(data, d => d.refugees);
    totalTextSpan.text(`${totalRefugees}`);

    /**
     * This section defines all helper functions and constants necessary for creating the diagram.
     */
    // The pie function generate start and end angles for each data-point.
    const pie = d3.pie()
        .value(d => d.refugees)
        .padAngle(0.015)(data);

    // The arc functions is used to convert pie sections into SVG paths.
    const arc = d3.arc()
        .innerRadius(radius * .6)
        .outerRadius(radius);

    // The core of the donut animation is defined here.
    const animate = (nodes, index, d, i, j) => {
        nodes[index].previousStartAngle = d.startAngle;
        nodes[index].previousEndAngle = d.endAngle;

        return time => {
            d.startAngle = i(time);
            d.endAngle = j(time);
            return arc(d);
        };
    };

    /**
     * The following defines the transition which is used for all animations.
     */
    const t = svg.transition()
        .duration(1500);

    /**
     * This is where the actual content of the diagram is drawn.
     * Therefore, a data-join is created and the behavior of the general update pattern is specified.
     */
    diagramParentGroup.selectAll('g .arc').data(pie, d => {return d.data.country})
        .join(
            // This describes the behavior of the enter sub-selection of the general update pattern.
            enter => {
                // A group and a child path element are added and styled.
                enter.append('g')
                    .attr('class', 'arc')
                    .append('path')
                    .attr('fill', d => colors(d.data))
                    .call(enter => enter.transition(t)
                        // The initial animation for the donut pieces is specified here.
                        .attrTween('d', (section, index, nodes) => {
                            const interpolateStartAngle = d3.interpolate(0, section.startAngle);
                            const interpolateEndAngle = d3.interpolate(0, section.endAngle);

                            return animate(nodes, index, section, interpolateStartAngle, interpolateEndAngle);
                        }))
                    // The behaviour on the mouseover event is specified to update the center text accordingly.
                    .on('mouseover', (e, d) => {
                        currentNumberTextSpan.text(d.data.refugees)
                        currentCountryTextSpan.text(d.data.country)
                        currentTextGroup.attr('display', 'true')
                        totalTextGroup.attr('display', 'none')
                    })
                    // The behaviour on the mouseover event is specified to update the center text accordingly.
                    .on('mouseout', () => {
                        currentTextGroup.attr('display', 'none')
                        totalTextGroup.attr('display', 'true')
                    });
            },
            // This describes the behavior of the update sub-selection of the general update pattern.
            update => {
                update.select('path')
                    .call(update => update.transition(t)
                        // The update animation for the donut pieces is specified here.
                        .attrTween('d', (section, index, nodes) => {
                            const interpolateStartAngle = d3.interpolate(nodes[index].previousStartAngle, section.startAngle);
                            const interpolateEndAngle = d3.interpolate(nodes[index].previousEndAngle, section.endAngle);

                            return animate(nodes, index, section, interpolateStartAngle, interpolateEndAngle);
                        }));
            }
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

/**
 * This script was created as part of a bachelor thesis.
 * For more information, visit: https://github.com/StyxOo/styxoo.github.io
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
    bottom: 20,
    left: 20
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

const contentParentGroup = diagramGroup.append('g')
    .attr('id', 'content');

const linksParentGroup = contentParentGroup.append('g')
    .attr('id', 'links');

const countriesParentGroup = contentParentGroup.append('g')
    .attr('id', 'countries');


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
    console.log('Rendering sankey');

    /**
     * This section is responsible for the required preprocessing of the data,
     * as the sankey-graph is intended to work with hierarchical data.
     */
    // The nodes and links necessary for creating a sankey diagram are created from the provided data.
    const nodes = [{name: 'Ukraine'}];
    const links = [];
    for (const d of data) {
        nodes.push({name: d.country});
        links.push({source: 'Ukraine', target: d.country, value: d.refugees});
    }

    // The sankey function adds information to the data allowing the nodes and links to be drawn.
    d3.sankey()
        .nodeId(d => d.name)
        .nodeAlign(d3.sankeyJustify)
        .size([contentWidth, contentHeight])({nodes, links});

    /**
     * The following defines the transition which is used for all animations.
     */
    const t = svg.transition()
        .duration(1500);

    /**
     * This is where the actual content of the diagram is drawn.
     * Therefore, two data-joins are created and their behavior of the general update pattern is specified.
     */
    // The first data join is used to draw the nodes of the sankey graph.
    countriesParentGroup.selectAll('g .country').data(nodes, d => {return d.name})
        .join(
            // This describes the behavior of the enter sub-selection of the general update pattern.
            enter => {
                // A new group element is added for each country
                const country = enter.append('g')
                    .attr('class', 'country');

                // The rect representing the country is created, positioned, sized, styled and animated.
                country.append('rect')
                    .attr('x', 0)
                    .attr('y', d => d.y0)
                    .attr('width', 0)
                    .attr('height', d => d.y1 - d.y0)
                    .attr('fill', d => {
                        // To be consistent with the other diagrams, the Ukraine does not query the color scale.
                        if (d.name === 'Ukraine') {
                            return '#0057B8';
                        } else {
                            return colors(d);
                        }
                    })
                    .call(enter => enter.transition(t)
                        .attr('x', d => d.x0)
                        .attr('width', d => d.x1 - d.x0));

                // The label text is added, provided with the appropriate text, positioned, styled and animated.
                country.append('text')
                    .text(d => `${d.name}: ${d.value}`)
                    .attr('x', 0)
                    .attr('y', d => (d.y0 + d.y1)/2 + 5)
                    .attr('text-anchor', d => d.x0 < contentWidth/2? 'start' : 'end')
                    .attr('opacity', '0%')
                    .call(enter => enter.transition(t)
                        .attr('x', d => d.x0 < contentWidth/2? d.x1+10 : d.x0-10))
                    .call(enter => enter.transition(t).delay(100)
                        .attr('opacity', '100%'));
            },
            // This describes the behavior of the update sub-selection of the general update pattern.
            update => {
                // The countries' rectangle is animated to resize and reposition
                update.select('rect').call(update => update.transition(t)
                    .attr('height', d => d.y1 - d.y0)
                    .attr('y', d => d.y0));

                // The countries' text label is animated to reposition and update its value.
                update.select('text').call(update => update.transition(t)
                    .attr('y', d => (d.y0 + d.y1)/2 + 5))
                    .text(d => `${d.name}: ${d.value}`);
            }
        )

    // The second data-join is used to draw the links between the nodes.
    linksParentGroup.selectAll('path').data(links, d => {return [d.source.name, d.target.name]})
        .join(
            // This describes the behavior of the enter sub-selection of the general update pattern.
            enter => {
                // A path is added for each link. It is also styled and animated.
                enter.append('path')
                    // D3 constructs the appropriate SVG path from the information available in the link.
                    .attr('d', d3.sankeyLinkHorizontal())
                    .attr('stroke', d => colors(d.target))
                    // The stroke-width represents the width of the link and depends on the data.
                    .attr('stroke-width', ({width}) => Math.max(1, width))
                    .attr('fill', d => colors(d.target))
                    .attr('opacity', 0)
                    .call(enter => enter.transition(t).delay(500)
                        .attr('opacity', '50%'));
            },
            // This describes the behavior of the update sub-selection of the general update pattern.
            update => {
                // The SVG paths are recalculated and the width adjusted.
                update.call(update => update.transition(t)
                    .attr('d', d3.sankeyLinkHorizontal())
                    .attr('stroke-width', ({width}) => Math.max(1, width)));
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

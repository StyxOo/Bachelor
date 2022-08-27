/**
 * This script was created as part of a bachelor thesis.
 * The results can be found here: https://github.com/StyxOo/styxoo.github.io
 * Author: Luis Rothenhäusler
 * Last edit: 25th August 2022
 *
 * This file contains the JavaScript implementation of the tree-map.
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

const treemapParentGroup = contentParentGroup.append('g')
    .attr('id', 'treeMapParent');

/**
 * This draws a background rectangle for the tree-map.
 */
contentParentGroup.append('rect')
    .attr('id', 'contentBackground')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', contentWidth)
    .attr('height', contentHeight)
    .attr('fill', 'none');

/**
 * This section creates and hides the tooltip,
 * which is used to display information about the currently hovered over country.
 */
// A secondary small SVG created and added to the body.
const tooltip = d3.select("body")
    .append('svg')
    .attr('height', 50)
    .attr('width', 400)
    .attr('id', 'tooltip')
    .style('position', 'absolute')
    .style('z-index', 10)
    .classed('hidden', true);

// The tooltips background is styled here.
const background = tooltip.append('rect')
    .attr('height', 50)
    .attr('width', 100)
    .attr('rx', 10)
    .attr('ry', 10);

// The tooltips text field is created here.
const tooltipText = tooltip.append('text')
    .attr('y', 20)
    .attr('x', 5)
    .text('Some text');

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
    console.log('Rendering tree map');

    /**
     * This section is responsible for the required preprocessing of the data,
     * as the tree-map is intended to work with hierarchical data.
     */
    // A dummy parent object is created here. It's necessary for simulating hierarchical data.
    const parent = {
        "country": "Dummy Parent",
        "refugees": 0
    };

    // Adds the dummy parent to the data.
    data.push(parent);

    // This turns the data provided into a hierarchical data structure.
    const root = d3.stratify()
        .id(d => {return d.country})
        .parentId((d) => {
            if (d.country === 'Dummy Parent')
                return undefined
            else
                return 'Dummy Parent'
        })(data);

    // The dummy parent is removed from the data again, as it is no longer needed.
    data.pop();

    // The total amount of refugees is calculated here.
    root.sum(d => {return d.refugees});

    // The data is converted into leaves used to draw the tree-map.
    d3.treemap()
        .size([contentWidth, contentHeight])
        .padding(4)(root);

    /**
     * The following defines the transition which is used for all animations.
     */
    const t = svg.transition()
        .duration(1500);

    /**
     * This is where the actual content of the diagram is drawn.
     * Therefore, a data-join is created and the behavior of the general update pattern is specified.
     */
    treemapParentGroup.selectAll('rect').data(root.leaves(), d => {return d.data.country})
        .join(
            // This describes the behavior of the enter sub-selection of the general update pattern.
            enter => {
                // A rect is added for a leaf of the tree-map. It is positioned, styled and animated.
                enter.append('rect')
                    .attr('x', 0)
                    .attr('y', `${contentHeight}`)
                    .attr('width', 0)
                    .attr('height', 0)
                    .attr('fill', d => colors(d.data))
                    .call(enter => enter.transition(t)
                        .attr('x', d => { return d.x0; })
                        .attr('y', d => { return d.y0; })
                        .attr('width', d => { return d.x1 - d.x0; })
                        .attr('height', d => { return d.y1 - d.y0; }))
                    // The mouseover event is specified to show the tooltip and update its text accordingly.
                    .on('mouseover', (e, d) => {
                        tooltip.classed('hidden', false)
                        tooltipText.text(`${d.data.country}\nRefugees : ${d.data.refugees}`)
                        const textWidth = tooltipText.node().getBBox().width
                        background.attr('width', textWidth + 10)
                    })
                    // The mousemove event is specified to update the tooltips position accordingly.
                    .on('mousemove', e => {
                        const position = d3.pointer(e)
                        tooltip.style("top", (position[1]+0)+"px");
                        if (position[0] > contentWidth/2) {
                            const rect = tooltip.select('rect')
                            const width = rect.attr('width')
                            tooltip.style("left", (position[0] - width + 10) + "px");
                        } else {
                            tooltip.style("left", (position[0] + 35) + "px");
                        }
                    })
                    // The mouseout event is specified to hide the tooltip.
                    .on('mouseout', () => {
                        tooltip.classed('hidden', true)
                    })

            },
            // This describes the behavior of the update sub-selection of the general update pattern.
            update => {
                // The applicable rects are animated to resized and repositioned.
                update.call(update => update.transition(t)
                        .attr('x', d => { return d.x0; })
                        .attr('y', d => { return d.y0; })
                        .attr('width', d => { return d.x1 - d.x0; })
                        .attr('height', d => { return d.y1 - d.y0; }))
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

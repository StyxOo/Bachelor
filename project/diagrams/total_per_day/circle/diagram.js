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
    left: 20
};

// contentWidth and contentHeight store the available coordinate space for the content of the diagram.
const contentWidth = innerWidth - margin.left - margin.right;
const contentHeight = innerHeight - margin.top - margin.bottom;

// The factor by which the legend values should be divided for easier readability
const legendScaleFactor = 100000;

/**
 * This section defines the hierarchy of the diagram.
 * This makes later selections and debugging in the browser inspector easier.
 */
const diagramGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const legendParentGroup = diagramGroup.append('g')
    .attr('id', 'legend');

const contentParentGroup = diagramGroup.append('g')
    .attr('id', 'content');

// This text is added to inform about the scaling of the legend.
legendParentGroup.append('text')
    .text('* scale in 100,000 refugees')
    .attr('class', 'description')
    .attr('x', contentWidth)
    .attr('y', contentHeight);

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
    console.log('Rendering circle chart');

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
        .domain([0, 1])  // Original range of values
        .range(data.map(d => d.date));

    // The radius scale provides the appropriate radius for a given number of refugees.
    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.refugees)])
        .range([0, contentHeight / 2]);


    /**
     * This section is responsible for drawing the background size legend of the diagram.
     * This is achieved using a data-join and specifying the general-update-behavior.
     */
    // The ticks are extracted from the time scale.
    const ticks = radiusScale.ticks(10).filter(d => d !== 0);
    let tickData = [];
    for (let i = 0; i < ticks.length; i++) {
        tickData.push({ id: i, value: ticks[i] });
    }
    // A data-join is responsible for drawing the ticks.
    legendParentGroup.selectAll('g').data(tickData, d => { return d.id })
        .join(
            // This describes the behavior of the enter sub-selection of the general update pattern.
            enter => {
                // A group is added and styled for each tick.
                const tick = enter.append('g')
                    .attr('opacity', '0%')
                    .call(enter => enter.transition(t)
                        .attr('opacity', '75%'));

                // Each tick is provided a circle, which is positioned and sized appropriately
                tick.append('circle')
                    .attr('cx', contentWidth / 2)
                    .attr('cy', d => contentHeight - radiusScale(d.value))
                    .attr('r', d => radiusScale(d.value))
                    .attr('class', 'legend');

                // Each tick also provided with a text label to show the quantity.
                tick.append('text')
                    .text((d, i) => {
                        let value = d.value / legendScaleFactor;
                        if (i === tickData.length - 1) {
                            value += '*';
                        }
                        return value;
                    })
                    .attr('dy', '-0.1em')
                    .attr('x', contentWidth / 2)
                    .attr('y', d => contentHeight - 2 * radiusScale(d.value));
            },
            // This describes the behavior of the update sub-selection of the general update pattern.
            update => {
                // The circle for each tick is animated to change position and size accordingly.
                update.select('circle').call(update => update.transition(t)
                    .attr('cy', d => contentHeight - radiusScale(d.value))
                    .attr('r', d => radiusScale(d.value)));

                // The text label value is updated and its position change animated.
                update.select('text')
                    .text((d, i) => {
                        let value = d.value / legendScaleFactor;
                        if (i === tickData.length - 1) {
                            value += '*';
                        }
                        return value;
                    })
                    .call(update => update.transition(t)
                        .attr('y', d => contentHeight - 2 * radiusScale(d.value)));
            }
            ,
            // This describes the behavior of the exit sub-selection of the general update pattern.
            exit => {
                // Each element is faded out using animations, before being removed.
                exit.call(exit => exit.transition(t)
                    .attr('opacity', '0%'))
                    .remove();
            }
        )


    /**
     * This is where the actual content of the diagram is drawn.
     * Therefore, a data-join is created and the behavior of the general update pattern is specified.
     */
    // The current date is found using the time scale.
    const unixTime = timeScale(time01)
    const datum = data.find(d => d.date === unixTime)
    contentParentGroup.selectAll('g .content').data([0], () => [0])
        .join(
            // This describes the behavior of the enter sub-selection of the general update pattern.
            // This behavior is used only for the first time the diagram is drawn.
            enter => {
                // A group element is added
                const content = enter.append('g')
                    .attr('class', 'content')

                // A circle is added, positioned, sized, styled and animated accordingly.
                content.append('circle')
                    .attr('cx', contentWidth / 2)
                    .attr('cy', contentHeight)
                    .attr('r', 0)
                    .attr('fill', 'red')
                    .attr('opacity', '50%')
                    .call(enter => enter.transition(t)
                        .attr('cy', () => contentHeight - radiusScale(datum.refugees))
                        .attr('r', () => radiusScale(datum.refugees)))

                // A text is added to the bottom and provided with the correct value of refugees.
                content.append('text')
                    .attr('x', contentWidth / 2)
                    .attr('y', contentHeight + 17)
                    .text(datum.refugees + ' refugees by ' + dateToDisplay(datum.date));

            },
            // This describes the behavior of the update sub-selection of the general update pattern.
            update => {
                // The circle is animated to update in position and size.
                update.select('circle')
                    .call(update => update.transition(t)
                        .attr('cy', () => contentHeight - radiusScale(datum.refugees))
                        .attr('r', () => radiusScale(datum.refugees)));

                // The text value is updated
                update.select('text')
                    .text(datum.refugees + ' refugees by ' + dateToDisplay(datum.date));
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

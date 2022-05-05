import {PieChart} from "./pieChart.js";

const svg = d3.select('#mainFrame')
    .attr('height', innerHeight)
    .attr('width', innerWidth);


const render = data => {
    console.log('Rendering pie chart')

    const chart = PieChart(data, {
        name: d => d.country,
        value: d => d.refugees,
        width : innerWidth,
        height: innerHeight,
        innerRadius: 100
    });

    svg.append('g');
    svg.append(() => { return chart; });
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

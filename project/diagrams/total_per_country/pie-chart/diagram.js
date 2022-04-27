import {PieChart} from "./pieChart.js";

const svg = d3.select('#mainFrame')
    .attr('height', innerHeight)
    .attr('width', innerWidth);


const render = data => {
    const chart = PieChart(data, {
        name: d => d.country,
        value: d => d.refugees,
        width : innerWidth,
        height: innerHeight,
        innerRadius: 10
    });

    console.log(chart);

    svg.append('g');
    svg.append(() => { return chart; });
};

const dataPath = '../total_refugees_per_country_condensed.csv';

// .csv creates a promise, when it resolves .then do something else
d3.csv(dataPath).then(data => {
    data.forEach(d => {                         // Foreach data-point in data
        d.refugees = +d.refugees;           // Cast value to float and take times 1000
        d.country = `${d.country}`;             // Kind of unnecessary, but fixed webstorm complaining
    });
    console.log(data);
    render(data);
})

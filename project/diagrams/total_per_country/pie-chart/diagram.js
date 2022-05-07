// import {PieChart} from "./pieChart.js";

const svg = d3.select('#mainFrame')
    .attr('height', innerHeight)
    .attr('width', innerWidth);

const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
}
const ourWidth = innerWidth - margin.left - margin.right
const ourHeight = innerHeight - margin.top - margin.bottom
const radius = d3.min([ourHeight/2, ourWidth/2])

const diagramGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const contentParentGroup = diagramGroup.append('g')
    .attr('id', 'content')
    .attr('transform', `translate(${radius + 20},${ourHeight/2})`)


const render = data => {
    console.log('Rendering pie chart')

    const t = svg.transition()
        .duration(1500);

    const xValue = d => d.refugees;
    const yValue = d => d.country;

    const colors = d3.scaleOrdinal(d3.schemeDark2);


    // Generate the pie
    const pie = d3.pie().padAngle(0.015);

    console.log(pie(data.map(xValue)))

    // Generate the arcs
    const arc = d3.arc()
        .innerRadius(radius * .6)
        .outerRadius(radius);


    //Generate groups
    contentParentGroup.selectAll("g .arc")
        .data(pie(data.map(xValue)))
        .join(
            enter => {
                enter.append('g')
                    .attr('class', 'arc')
                    .append('path')
                    .attr('fill', d => colors(d))
                    .attr('d', '')
                    // .attr('startAngle', d => d.startAngle)
                    // .attr('endAngle', d => d.endAngle)
                    .call(enter => enter.transition(t)
                        .attrTween('d', d => {
                                const i = d3.interpolate(0, d.startAngle);
                                const j = d3.interpolate(0, d.endAngle);

                                d.previousStartAngle = d.startAngle;
                                d.previousEndAngle = d.endAngle;

                                return time => {
                                    d.startAngle = i(time);
                                    d.endAngle = j(time);
                                    return arc(d);
                                }}))
            },
            update => {
                const selection = update.selectAll('path')
                console.log(selection)
                console.log(selection.data())
                    selection
                    .call(update => update.transition(t)
                        .attrTween('d', d => {
                            console.log(d)
                            const i = d3.interpolate(d.previousStartAngle, d.startAngle);
                            const j = d3.interpolate(d.previousEndAngle, d.endAngle);

                            d.previousStartAngle = d.startAngle;
                            d.previousEndAngle = d.endAngle;

                            return time => {
                                d.startAngle = i(time);
                                d.endAngle = j(time);
                                return arc(d);
                            }}))
            },
            exit => exit.remove()
        )
};




// const render = data => {
//     console.log('Rendering pie chart')
//
//     const chart = PieChart(data, {
//         name: d => d.country,
//         value: d => d.refugees,
//         width : innerWidth,
//         height: innerHeight,
//         innerRadius: 100
//     });
//
//     svg.append(() => { return chart; });
// };

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

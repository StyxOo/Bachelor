// d3.json("./data.json").then((dataClump) => { console.log(data); });

// let data = [4, 8, 15, 16, 23, 42];
const width = 420;

function load(redraw = true) {
    d3.csv("./moreData.csv").then((data) => {
        data.forEach(d => {
            d.value = Number(d.value)
        });
        console.log(data);
        if (redraw) {
            draw(data);
        }
    });
}

function draw(data) {
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, 20 * data.length]);

    var svg = d3.select("#mainFrame")
        .attr("width", width)
        .attr("height", y.range()[1])
        .attr("font-family", "sans-serif")
        .attr("font-size", "10")
        .attr("text-anchor", "end");

    var bar = svg.selectAll("g")
        .data(data)
        .join("g")
        .attr("transform", d => `translate(0,${y(d.name)})`);

    bar.append("rect")
        .attr("fill", "steelblue")
        .attr("width", d => x(d.value))
        .attr("height", y.bandwidth() - 1);

    bar.append("text")
        .attr("fill", "white")
        .attr("x", d => x(d.value) - 3)
        .attr("y", y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .text(d => d.value);

    console.log(svg);
    return svg.node();
}

load();

let data = d3.json("./data.json");

let times = d3.scaleTime()
    .domain([d3.min(data.nodes, d => d.start), d3.max(data.nodes, d => d.end)])
    .ticks(1000)
    .filter(time => data.nodes.some(d => contains(d, time)));

let contains = ({ start, end }, time) => start <= time && time < end;

let height = 680;


function chart() {
    const simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody())
        .force("link", d3.forceLink().id(d => d.id))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", ticked);

    const svg = d3.select("#mainFrame")
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

    let link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line");

    let node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle");

    function ticked() {
        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);

        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
    }

    invalidation.then(() => simulation.stop());

    return Object.assign(svg.node(), {
        update({ nodes, links }) {

            // Make a shallow copy to protect against mutation, while
            // recycling old nodes to preserve position and velocity.
            const old = new Map(node.data().map(d => [d.id, d]));
            nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
            links = links.map(d => Object.assign({}, d));

            node = node
                .data(nodes, d => d.id)
                .join(enter => enter.append("circle")
                    .attr("r", 5)
                    .call(drag(simulation))
                    .call(node => node.append("title").text(d => d.id)));

            link = link
                .data(links, d => [d.source, d.target])
                .join("line");

            simulation.nodes(nodes);
            simulation.force("link").links(links);
            simulation.alpha(1).restart().tick();
            ticked(); // render now!
        }
    });
};

function update() {
    const nodes = data.nodes.filter(d => contains(d, time));
    const links = data.links.filter(d => contains(d, time));
    chart.update({ nodes, links });
};

drag = simulation => {

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}
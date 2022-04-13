const svg = d3.select('#mainFrame');

const height = parseFloat(svg.attr('height'));
const width = +svg.attr('width'); // Shorthand for parseFloat

const smileyGroup = svg
    .append('g')
        .attr('transform', `translate(${width/2}, ${height/2})`);

const circle = smileyGroup
    .append('circle')
        .attr('r', width/2)
        .attr('fill', 'yellow')
        .attr('stroke', 'black');

const eyeOffsetX = 120;
const eyeOffsetY = -90;
const eyeRadius = 38;

const eyesGroup = smileyGroup
    .append('g')
        .attr('transform', `translate(0, ${eyeOffsetY})`);

const leftEye = eyesGroup
    .append('circle')
        .attr('r', eyeRadius)
        .attr('cx', -eyeOffsetX);

const rightEye = eyesGroup
    .append('circle')
        .attr('r', eyeRadius)
        .attr('cx', eyeOffsetX);

const eyebrowWidth = 90;
const eyebrowHeight = 25;
const eyebrowYOffset = -80;

const eyebrowsGroup = eyesGroup
    .append('g')
        .attr('transform', `translate(0, ${eyebrowYOffset})`);

eyebrowsGroup
    .transition()
        .duration(2000)
        .attr('transform', `translate(0, ${eyebrowYOffset - 30})`)
    .transition()
        .duration(1800)
        .attr('transform', `translate(0, ${eyebrowYOffset})`);

const leftEyebrow = eyebrowsGroup
    .append('rect')
        .attr('width', eyebrowWidth)
        .attr('height', eyebrowHeight)
        .attr('x', -eyeOffsetX - eyebrowWidth / 2);


const rightEyebrow = eyebrowsGroup
    .append('rect')
        .attr('width', eyebrowWidth)
        .attr('height', eyebrowHeight)
        .attr('x', eyeOffsetX - eyebrowWidth / 2);

const mouth = smileyGroup
    .append('path')
        .attr('d', d3.arc()({
            innerRadius : 170,
            outerRadius: 200,
            startAngle: Math.PI * 0.6,
            endAngle: Math.PI * 1.4
        }));
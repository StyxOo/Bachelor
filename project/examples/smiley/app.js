const svg = d3.select('#mainFrame');

const height = parseFloat(svg.attr('height'));
const width = +svg.attr('width'); // Shorthand for parseFloat

const smileyGroup = svg.append('g')
    .attr('transform', `translate(${width/2}, ${height/2})`);

const circle = smileyGroup.append('circle')
    .attr('r', width/2)
    .attr('fill', 'yellow')
    .attr('stroke', 'black');

const eyeOffsetX = 120;
const eyeOffsetY = -90;
const eyeRadius = 38;

const eyeGroup = smileyGroup.append('g')
    .attr('transform', `translate(0, ${eyeOffsetY})`);

const leftEye = eyeGroup.append('circle')
    .attr('r', eyeRadius)
    .attr('cx', -eyeOffsetX);

const rightEye = eyeGroup.append('circle')
    .attr('r', eyeRadius)
    .attr('cx', eyeOffsetX);

const eyebrowWidth = 90;
const eyebrowHeight = 25;
const eyebrowYOffset = -80;

const leftEyebrow = eyeGroup.append('rect')
    .attr('width', eyebrowWidth)
    .attr('height', eyebrowHeight)
    .attr('x', -eyeOffsetX - eyebrowWidth / 2)
    .attr('y', eyebrowYOffset);

const rightEyebrow = eyeGroup.append('rect')
    .attr('width', eyebrowWidth)
    .attr('height', eyebrowHeight)
    .attr('x', eyeOffsetX - eyebrowWidth / 2)
    .attr('y', eyebrowYOffset);

const mouth = smileyGroup.append('path')
    .attr('d', d3.arc()({
        innerRadius : 170,
        outerRadius: 200,
        startAngle: Math.PI * 0.6,
        endAngle: Math.PI * 1.4
    }));
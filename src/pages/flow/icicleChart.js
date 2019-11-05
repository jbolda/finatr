import React, { useRef, useEffect } from 'react';
import {
  select as d3_select,
  format as d3_format,
  scaleLinear as d3_scaleLinear,
  scaleOrdinal as d3_scaleOrdinal,
  quantize as d3_quantize,
  interpolateRainbow as d3_interpolateRainbow,
  nest as d3_nest
} from 'd3';
import { Box } from '@theme-ui/components';

export const IcicleChart = ({ data }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (!!data && d3Container.current) draw(d3Container, data);
  }, [data, d3Container]);

  return (
    <Box>
      <svg ref={d3Container} height={500} width={500} />
    </Box>
  );
};

export default IcicleChart;

const draw = (svgRef, data) => {
  const height = svgRef.current.height.baseVal.value;
  const width = svgRef.current.width.baseVal.value / 4;
  const format = d3_format(',d');

  const dataStack = data.reduce(
    (acc, currentVal) => {
      if (currentVal.type === 'income') {
        acc.transactions = [
          ...acc.transactions,
          { ...currentVal, dailyRateRelative: acc.income }
        ];
        acc.income += Number(currentVal.dailyRate);
      } else if (currentVal.type === 'expense') {
        acc.transactions = [
          ...acc.transactions,
          { ...currentVal, dailyRateRelative: acc.expense }
        ];
        acc.expense += Number(currentVal.dailyRate);
      }
      return acc;
    },
    { income: 0, expense: 0, transactions: [] }
  );
  const scale = d3_scaleLinear()
    .domain([0, Math.max(dataStack.income, dataStack.expense)])
    .range([0, height]);

  const grouped = d3_nest()
    .key(d => d.type)
    .key(d => d.category)
    .entries(dataStack.transactions);

  const uniqueCategories = [
    ...(!!grouped[0] ? grouped[0].values.map(d => d.key) : []),
    ...(!!grouped[1] ? grouped[1].values.map(d => d.key) : [])
  ];

  const color = d3_scaleOrdinal()
    .domain(uniqueCategories)
    .range(d3_quantize(d3_interpolateRainbow, uniqueCategories.length + 1));

  const svg = d3_select(svgRef.current);

  const groupType = svg.selectAll('g').data(grouped);

  const groupCategoryEnter = groupType
    .enter()
    .append('g')
    .attr('id', d => `type-${d.key}`)
    .attr(
      'transform',
      d => `translate(${d.key === 'income' ? 0 : width * 2},0)`
    )
    .selectAll('g')
    .data(d => d.values);

  groupType.exit().remove();

  const cell = groupCategoryEnter
    .enter()
    .append('g')
    .attr('id', d => `category-${d.key}`)
    .selectAll('rect')
    .data(d => d.values);

  groupCategoryEnter.exit().remove();

  cell
    .enter()
    .append('rect')
    .transition()
    .attr('width', width)
    .attr('height', d => scale(Number(d.dailyRate)))
    .attr('fill-opacity', 0.6)
    .attr('fill', d => color(d.category))
    .attr(
      'transform',
      d =>
        `translate(${d.type === 'income' ? width : 0},${scale(
          d.dailyRateRelative
        )})`
    );

  const text = cell
    .enter()
    .append('text')
    .style('user-select', 'none')
    .attr('pointer-events', 'none')
    .attr('x', d => (d.type === 'income' ? 0 : width))
    .attr('y', d => scale(Number(d.dailyRateRelative) + Number(d.dailyRate)));

  text.append('tspan').text(d => d.description);
  text.append('tspan').text(d => ` ${format(d.value)}`);

  cell.exit().remove();

  return svg.node();
};

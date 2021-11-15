import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export const IcicleChart = ({ data }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (!!data && d3Container.current) draw(d3Container, data);
  }, [data]);

  return (
    <div class="object-none object-center m-5 p-3">
      <svg
        ref={d3Container}
        class="m-auto"
        /* sx={{ height: [500, 600, 800], width: [500, 800, 1200] }}  */
      />
    </div>
  );
};

export default IcicleChart;

const draw = (svgRef, data) => {
  let size = '300px';
  if (window) {
    if (window.innerWidth > 1400) {
      size = '600px';
    } else if (window.innerWidth > 1000) {
      size = '500px';
    }
  }
  svgRef.current.style.width = `${parseInt(size) * 1.5}px`;
  svgRef.current.style.height = size;
  const height = parseInt(svgRef.current.style.height);
  const width = parseInt(svgRef.current.style.width) / 4;
  const format = d3.format(',d');

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
  const scale = d3
    .scaleLinear()
    .domain([0, Math.max(dataStack.income, dataStack.expense)])
    .range([0, height]);

  const grouped = d3.group(
    dataStack.transactions,
    (d) => d.type,
    (d) => d.category
  );
  const uniqueCategories = [
    ...(!!grouped.income ? Object.keys(grouped.income.values) : []),
    ...(!!grouped.expense ? Object.keys(grouped.expense.values) : [])
  ];

  const color = d3.scaleOrdinal(d3.schemeCategory10).domain(uniqueCategories);

  const svg = d3.select(svgRef.current);

  const groupType = svg.selectAll('g').data(grouped);

  const groupCategoryEnter = groupType
    .enter()
    .append('g')
    .attr('id', (d) => `type-${d[0]}`)
    .attr(
      'transform',
      (d) => `translate(${d[0] === 'income' ? 0 : width * 2},0)`
    )
    .selectAll('g')
    .data((d) => d[1]);

  groupType.exit().remove();

  const cell = groupCategoryEnter
    .enter()
    .append('g')
    .attr('id', (d) => `category-${d[0]}`)
    .selectAll('rect')
    .data((d) => d[1]);

  groupCategoryEnter.exit().remove();

  cell
    .enter()
    .append('rect')
    .transition()
    .attr('width', width)
    .attr('height', (d) => scale(Number(d.dailyRate)))
    .attr('fill-opacity', 0.6)
    .attr('fill', (d) => color(d.category))
    .attr(
      'transform',
      (d) =>
        `translate(${d.type === 'income' ? width : 0},${scale(
          d.dailyRateRelative
        )})`
    );

  const text = cell
    .enter()
    .append('text')
    .style('user-select', 'none')
    .attr('pointer-events', 'none')
    .attr('x', (d) => (d.type === 'income' ? 0 : width))
    .attr('y', (d) => scale(Number(d.dailyRateRelative) + Number(d.dailyRate)));

  text.append('tspan').text((d) => d.description);
  text.append('tspan').text((d) => ` ${format(d.value)}`);

  cell.exit().remove();

  return svg.node();
};

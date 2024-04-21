import * as d3 from 'd3';
import { toDecimal } from 'dinero.js';
import React, { useRef, useEffect } from 'react';
import { useSelector } from 'starfx/react';

import { schema } from '~/src/store/schema';

export const IcicleChart = () => {
  const d3Container = useRef(null);
  const transactions = useSelector(schema.transactions.selectTableAsList);

  useEffect(() => {
    if (!!transactions && d3Container.current) draw(d3Container, transactions);
  }, [transactions]);

  return (
    <div className="object-none object-center m-5 p-3">
      <svg ref={d3Container} className="m-auto" />
    </div>
  );
};

export default IcicleChart;

const draw = async (svgRef, data) => {
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
        acc.income += Number(toDecimal(currentVal.dailyRate));
      } else if (currentVal.type === 'expense') {
        acc.transactions = [
          ...acc.transactions,
          { ...currentVal, dailyRateRelative: acc.expense }
        ];
        acc.expense += Number(toDecimal(currentVal.dailyRate));
      }
      return acc;
    },
    { income: 0, expense: 0, transactions: [] }
  );

  const scale = d3
    .scaleLinear()
    .domain([0, Math.max(dataStack.income, dataStack.expense)])
    .range([0, height]);

  const grouped = d3.groups(
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

  const groupType = svg
    .selectAll('g')
    .data(grouped, (d) => d)
    .join(
      (enter) => enter.append('g'),
      (update) => update,
      (exit) => exit.remove()
    )
    .attr('id', (d) => `type-${d[0]}`)
    .attr(
      'transform',
      (d) => `translate(${d[0] === 'income' ? 0 : width * 2},0)`
    );

  const groupCategory = groupType
    .selectAll('g')
    .data((d) => d[1])
    .join(
      (enter) => enter.append('g'),
      (update) => update,
      (exit) => exit.remove()
    )
    .attr('id', (d) => `type-${d[0].replace(/ /g, '-')}`);

  const cell = groupCategory
    .selectAll('rect')
    .data((d) => d[1])
    .join(
      (enter) => enter.append('rect').transition(),
      (update) => update,
      (exit) => exit.remove()
    )
    .attr('width', width)
    .attr('height', (d) => scale(Number(toDecimal(d.dailyRate))))
    .attr('fill-opacity', 0.6)
    .attr('fill', (d) => color(d.category))
    .attr(
      'transform',
      (d) =>
        `translate(${d.type === 'income' ? width : 0},${scale(
          d.dailyRateRelative
        )})`
    );

  const text = groupCategory
    .selectAll('text')
    .data((d) => d[1])
    .join(
      (enter) => {
        const tnode = enter.append('text');
        tnode.append('tspan').text((d) => d.description);
        tnode.append('tspan').text((d) => ` ${toDecimal(d.value)}`);
        return tnode;
      },
      (update) => update,
      (exit) => exit.remove()
    )
    .style('user-select', 'none')
    .attr('pointer-events', 'none')
    .attr('x', (d) => (d.type === 'income' ? 0 : width))
    .attr('y', (d) =>
      scale(Number(d.dailyRateRelative) + Number(toDecimal(d.dailyRate)))
    );

  return svg.node();
};

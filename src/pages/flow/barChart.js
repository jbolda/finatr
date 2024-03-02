import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
// import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { useSelector } from 'starfx/react';
import { schema } from '~/src/store/schema';

const BarChart = () => {
  const tooltipTarget = useRef();
  const data = useSelector(schema.chartBarData.selectTableAsList);
  const dateRange = useSelector(schema.chartBarRange.select);

  useEffect(() => {
    let svgBar = d3.select('g.bar-section');
    let svgLine = d3.select('g.line-section');
    drawCharts(data, dateRange, svgBar, svgLine, tooltipTarget);
  }, [data]);

  return (
    <>
      <div ref={tooltipTarget} />
      <div style={{ overflow: 'auto' }}>
        <svg className="draw-section" width="11550" height="660">
          <g
            className="bar-section"
            width="11550"
            height="330"
            transform="translate(60,10)"
          >
            <g className="blobs" transform="translate(0,10)" />
            <g className="xaxis" transform="translate(0,280)" fill="none" />
            <g className="yaxis" transform="translate(0,10)" fill="none" />
          </g>
          <g
            className="line-section"
            width="11550"
            height="330"
            transform="translate(60,340)"
          >
            <g className="lines" />
            <g className="xaxis" transform="translate(0,280)" fill="none" />
            <g className="yaxis" transform="translate(0,10)" fill="none" />
          </g>
          <line className="tooltipLine" stroke="black" pointerEvents="none" />
        </svg>
      </div>
    </>
  );
};

export default BarChart;

// const buildStacked = (transactions) => {
//   const keys = Object.keys(transactions);
//   const stack = d3
//     .stack()
//     .value((d, key) => (d?.y ? d.y.toNumber() : 0))
//     .keys(keys);

//   const tidy = keys.flatMap((key) =>
//     transactions[key].data.map((d) => ({ ...d, id: key }))
//   );
//   const indexed = d3.index(
//     tidy,
//     (d) => d.date,
//     (d) => d.id
//   );
//   const stacked = stack(tidy);
//   return stacked;
// };

const drawCharts = (data, dateRange, svgBar, svgLine, tooltipTarget) => {
  let tooltipBar = {
    target: tooltipTarget,
    render: renderTooltipBar
  };

  // const income = data.filter((d) => d.transaction.type === 'income');
  // const expense = data.filter((d) => d.transaction.type === 'expense');

  // const incomeMap = income.reduce((all, item) => {
  //   all[item.id] = item;
  //   return all;
  // }, {});
  // const incomeStacked = buildStacked(incomeMap);
  // const expenseMap = expense.reduce((all, item) => {
  //   all[item.id] = item;
  //   return all;
  // }, {});
  // const expenseStacked = buildStacked(expenseMap);
  // console.log({ data, income, expense, incomeStacked, expenseStacked });
  // const dataStacked = [].concat(incomeStacked, expenseStacked);
  // const transactionsMap = { ...incomeMap, ...expenseMap };

  const maxBar = 2000; // data.BarChartMax

  barBuild.drawBar({
    selector: svgBar.select('.blobs'),
    dateRange,
    data,
    max_domain: maxBar,
    tooltipBar
  });

  // axis bar
  barBuild.drawAxis(svgBar, dateRange, maxBar);

  const maxLine = 2000;
  // let tooltipLine = {
  //   target: tooltipTarget,
  //   render: renderTooltipLine,
  // };
  // barBuild.drawLine(
  //   data,
  //   d3.select('.line-section'),
  //   initLine.lineGroup,
  //   initLine.tooltipLine,
  //   data.AccountChart,
  //   data.LineChartMax,
  //   tooltipLine
  // );

  // axis line
  barBuild.drawAxis(svgLine, dateRange, maxLine);
};

const renderTooltipBar = (coordinates, tooltipData, tooltipTarget) => {
  let styles = {
    position: 'absolute',
    pointerEvents: 'none',
    left: `${coordinates.pageX}px`,
    top: `${coordinates.pageY}px`
  };
  const tooltipComponent = (
    <div className="notification is-primary" id="tooltipBar" style={styles}>
      <p>{`${tooltipData.type} in ${tooltipData.raccount}`}</p>
      <p>category: {tooltipData.category}</p>
      <p>
        ${tooltipData.value.toFixed(2)} | ${tooltipData.dailyRate.toFixed(2)}{' '}
        per day
      </p>
    </div>
  );

  ReactDOM.render(tooltipComponent, tooltipTarget);
};

const renderTooltipLine = (coordinates, tooltipData, tooltipTarget) => {
  let styles = {
    position: 'absolute',
    pointerEvents: 'none',
    left: `${coordinates.pageX}px`,
    top: `${coordinates.pageY}px`
  };

  const tooltipComponent = (
    <div className="notification is-primary" id="tooltipLine" style={styles}>
      {tooltipData.map((line) => (
        <p key={line.data.account.name}>
          {line.data.account.name} ${line.value}
        </p>
      ))}
    </div>
  );

  ReactDOM.render(tooltipComponent, tooltipTarget);
};

let barBuild = {
  div_width: function () {
    return 600;
  },
  daysinfuture: function () {
    return 365;
  },
  margin: function () {
    return { top: 10, right: 0, bottom: 20, left: 60 };
  },
  band: function () {
    return this.daysinfuture() * 30;
  },
  width: function () {
    let w =
      this.div_width() - this.margin().left - this.margin().right + this.band();
    return w;
  },
  height: function () {
    return d3.min([this.div_width() * 0.5, 350]);
  },
  shift: function () {
    return this.width() / this.daysinfuture();
  },
  xScale: function ({ start, end }) {
    return d3
      .scaleTime()
      .domain([start, end])
      .rangeRound([0, this.width() - this.margin().left]);
  },
  yScale: function (max_domain) {
    return (
      d3
        .scaleLinear()
        // the min and max transactions
        .domain([0, max_domain])
        // the area we have to draw the chart
        .range([this.height() - this.margin().top - this.margin().bottom, 0])
    );
  }
};

barBuild.drawAxis = function (svg, dateRange, max_domain) {
  // create axis
  let xAxis = d3
    .axisBottom(this.xScale(dateRange))
    .ticks(d3.timeDay.every(1))
    .tickFormat(d3.timeFormat('%b %d'));

  let yAxis = d3
    .axisRight(this.yScale(max_domain))
    .ticks(10)
    .tickSize(this.width());

  const drawnX = svg.select('.xaxis').transition().duration(500).call(xAxis);

  drawnX
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '-.55em')
    .attr('transform', 'rotate(-90)');

  const drawnY = svg.select('.yaxis').transition().duration(500).call(yAxis);

  drawnY
    .selectAll('.tick:not(:first-of-type) line')
    .attr('stroke', '#777')
    .attr('stroke-dasharray', '2,5')
    .attr('transform', `translate(-${this.margin().left},0)`);

  drawnY.selectAll('.tick text').attr('x', -this.margin().left).attr('dy', -4);

  drawnY.select('path').attr('stroke-width', '0');
};

barBuild.drawBar = function ({
  selector,
  dateRange,
  data,
  dataStacked,
  transactionsMap,
  max_domain,
  tooltip
}) {
  if (data.length === 0) return;
  // 100% of shift is the space between ticks
  const widthsIncome = { bar: 0.4 * this.shift(), translate: 0 };
  const widthsExpense = {
    bar: 0.4 * this.shift(),
    translate: -0.4 * this.shift()
  };

  let colors = function (d) {
    switch (d.transaction.type) {
      case 'income':
        return ['#a1d99b', '#41ab5d'];
      case 'expense':
        return ['#fb6a4a', '#cb181d'];
      case 'transfer':
        return ['#8029aa', '#d238f9'];
      default:
        return ['#0019ff'];
    }
  };

  // maybe adjust this scale?
  let color = (d) => d3.scaleLinear().domain([0, data.length]).range(colors(d));

  const groups = selector
    .selectAll('g')
    .filter((d, i) => `#${i}-${d.id}`)
    .data(data)
    .join(
      (enter) => enter.insert('g'),
      (update) => update,
      (exit) => exit.remove()
    );

  const rectGroups = groups
    .join(
      (enter) => enter.insert('g'),
      (update) => update,
      (exit) => exit.remove()
    )
    .attr('class', (d) => {
      console.log(d);
      return d.transaction.type;
    })
    .attr('id', (d, i) => `${i}-${d.id}`)
    .style('fill', (d, i) => color(d)(i))
    .attr(
      'transform',
      (d) =>
        `translate(${
          (d.transaction.type === 'income' ? widthsIncome : widthsExpense)
            .translate
        },${0})`
    )
    .on('mouseover', function (event, d) {
      console.log({ event, d });
      // tooltip.render(
      //   { pageX: event.pageX, pageY: event.pageY },
      //   d,
      //   tooltip.target
      // );
    })
    .on('mouseout', function () {
      // tooltip.unmount(tooltip.target);
    });

  let xScale = barBuild.xScale(dateRange);
  let yScale = barBuild.yScale(max_domain);
  let rects = groups
    .selectAll(`rect`)
    .data((d) => d.stacked)
    .join(
      (enter) => enter.filter((d) => d.height !== 0).append('rect'),
      (update) => update.transition(),
      (exit) => exit.transition().attr('height', 0).remove()
    )
    .attr('height', 0)
    .attr('x', (d) => xScale(d.date))
    .attr('rx', 3)
    .attr('y', (d) => yScale(d.y) - yScale(d.height))
    .attr('width', (d, i, nodes) => {
      const dataType = nodes[i].parentNode.__data__.transaction.type;
      return (dataType === 'income' ? widthsIncome : widthsExpense).bar;
    })
    .transition()
    .duration(3000)
    .ease(d3.easeBounceOut)
    .attr('height', (d) => yScale(d.height));
};

barBuild.initLine = function (svg) {
  let tooltipLine = svg
    .append('line')
    .attr('class', 'tooltipLine')
    .attr('stroke', 'black')
    .attr('pointer-events', 'none');
  tooltipLine.enter();

  let lineGroup = svg
    .append('g')
    .attr('class', 'line')
    .attr('transform', `translate(${0},${this.margin().top})`);

  return { lineGroup, tooltipLine };
};

barBuild.drawLine = function (
  props,
  svg,
  lineGroup,
  tooltipLine,
  data,
  max_domain,
  tooltip
) {
  if (!data || data.length === 0) {
    lineGroup.selectAll('path').data(data).exit().remove();
    return;
  }
  let linecolors = d3.scaleOrdinal(d3.schemeCategory10);
  let marginLeft = this.margin().left;

  const xScale = barBuild.xScale(props);
  const yScale = barBuild.yScale(max_domain);

  const line = d3
    .line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value));

  let lines = lineGroup.selectAll('path').data(data);

  lines
    // .transition()
    // .delay((d, i) => 800 + i * 150)
    // .duration(3000)
    .attr('d', (d) => line(d.values))
    .attr('stroke', (d, i) => linecolors(i))
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  lines
    .enter()
    .append('path')
    .attr('d', (d) => line(d.values))
    .attr('stroke', (d, i) => linecolors(i))
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  lines.exit().remove();

  svg
    .on('mousemove', function (event) {
      const node = event.srcElement;
      let mouse = event;
      let positionX = mouse[0] - marginLeft;
      if (
        !node?.firstChild?.childNodes ||
        node.firstChild.childNodes.length === 0
      )
        return;

      let lineGroup = Array.from(node?.firstChild?.childNodes[1].childNodes);

      let linePositions = lineGroup.map((lineNode) => {
        let beginning = 0;
        let end = lineNode.getTotalLength();
        let target, position;
        while (true) {
          target = Math.floor((beginning + end) / 2);
          position = lineNode.getPointAtLength(target);
          if (
            (target === end || target === beginning) &&
            position.x !== positionX
          ) {
            break;
          }
          if (position.x > positionX) end = target;
          else if (position.x < positionX) beginning = target;
          else break; //position found
        }
        return { node: lineNode, positionY: position.y };
      });

      tooltipLine
        .transition()
        .duration(400)
        .ease(d3.easeBackOut)
        .attr('x1', positionX)
        .attr('x2', positionX)
        .attr('y1', 0)
        .attr('y2', max_domain);

      let lineVals = linePositions
        .map((line) => {
          let scaledY = barBuild
            .yScale(max_domain)
            .invert(line.positionY)
            .toFixed(2);
          return { data: line.node.__data__, date: new Date(), value: scaledY };
        })
        .sort((a, b) => b.value - a.value);

      tooltip.render(
        { pageX: event.pageX, pageY: event.pageY },
        lineVals,
        tooltip.target
      );
    })
    .on('mouseout', function () {
      tooltip.unmount(tooltip.target);
    });
};

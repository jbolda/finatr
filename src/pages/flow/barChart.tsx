import * as d3 from 'd3';
import { closestIndexTo, eachDayOfInterval } from 'date-fns';
import React, { useEffect } from 'react';
import { useSelector } from 'starfx/react';

import { lineChartAccounts } from '~/src/store/selectors/accounts';
import { barChartTransactions } from '~/src/store/selectors/chartData';
import { toHumanCurrency } from '~/src/store/utils/dineroUtils';

const BarChart = ({ dateRange }) => {
  const transactionData = useSelector(barChartTransactions);
  const accountData = useSelector(lineChartAccounts);
  const bar = barBuild;

  useEffect(() => {
    drawCharts(dateRange, transactionData, accountData);
  }, [transactionData.data, accountData.data, dateRange.start]);

  return (
    <>
      <div className="absolute pointer-events-none">
        <div
          className="bg-slate-700 dark:bg-slate-600 border border-slate-800 dark:border-white/10 shadow-[inset_0_1px_0_0_theme(colors.gray.600)] dark:shadow-none text-white text-xs rounded-lg drop-shadow-lg will-change-transform px-3 py-1"
          id="tooltipTarget"
        />
      </div>
      <div style={{ overflow: 'auto' }}>
        <svg
          className="draw-section"
          width="11550"
          height={bar.height() * 2 + bar.margin().gap}
        >
          <g
            className="bar-section"
            width="11550"
            height={bar.height()}
            transform="translate(60,0)"
          >
            <g
              className="blobs"
              transform={`translate(${-bar.margin().left / 3},${
                bar.margin().top
              })`}
            />
            <g
              className="xaxis"
              transform={`translate(${-bar.margin().left / 3},${
                bar.height() - bar.margin().top - bar.margin().bottom
              })`}
              fill="none"
            />
            <g className="yaxis" transform="translate(0,0)" fill="none" />
          </g>
          <g
            className="line-section"
            width="11550"
            height={bar.height()}
            transform={`translate(60,${bar.height() + bar.margin().gap})`}
          >
            <g
              className="lines"
              transform={`translate(${-bar.margin().left / 3},${
                bar.margin().top
              })`}
            >
              <rect
                id="mouseArea"
                width="11550"
                fill="white"
                height={bar.height() - bar.margin().top - bar.margin().bottom}
              />
            </g>
            <g
              className="xaxis"
              transform={`translate(${-bar.margin().left / 3},${
                bar.height() - bar.margin().top - bar.margin().bottom
              })`}
              fill="none"
            />
            <g className="yaxis" transform="translate(0,0)" fill="none" />
          </g>
          <line
            id="tooltipLine"
            stroke="black"
            pointerEvents="none"
            transform={`translate(${(bar.margin().left * 2) / 3},0)`}
          />
        </svg>
      </div>
    </>
  );
};

export default BarChart;

const drawCharts = (dateRange, transactionData, accountData) => {
  const svgBar = d3.select('g.bar-section');
  const svgLine = d3.select('g.line-section');
  const tooltipTarget = d3.select('div#tooltipTarget').style('opacity', 0);
  const tooltipLine = d3.select('line#tooltipLine').style('opacity', 0);

  barBuild.drawAxis(svgBar, dateRange, transactionData.max);
  barBuild.drawAxis(svgLine, dateRange, accountData.max);

  barBuild.drawBar({
    selector: svgBar.select('.blobs'),
    dateRange,
    data: transactionData.data,
    max_domain: transactionData.max,
    tooltip: {
      target: tooltipTarget,
      render: renderTooltipBar
    }
  });

  barBuild.drawLine({
    svg: svgLine.select('rect#mouseArea'),
    selector: svgLine.select('.lines'),
    dateRange,
    data: accountData.data,
    max_domain: accountData.max,
    tooltip: {
      target: tooltipTarget,
      render: renderTooltipLine,
      line: tooltipLine
    }
  });
};

const renderTooltipBar = (coordinates, tooltipData, tooltipTarget) => {
  const transaction = tooltipData.transaction;
  const tooltipComponent = `
      <p>${transaction.type} in ${transaction.raccount}</p>
      <p>category: ${transaction.category}</p>
      <p>
        ${toHumanCurrency(transaction.value)} | ${toHumanCurrency(transaction.dailyRate)} per day
      </p>`;

  tooltipTarget
    .html(tooltipComponent)
    .style('left', coordinates.pageX + 'px')
    .style('top', coordinates.pageY + 'px');
};

const renderTooltipLine = (coordinates, tooltipData, tooltipTarget) => {
  const tooltipComponent = tooltipData
    .map(
      (line) =>
        `<p>
          ${line.name} ${
            line.valueStart === line.valueEnd
              ? line.valueStart
              : `${line.valueStart}->${line.valueEnd}`
          }
        </p>`
    )
    .join('\n');

  tooltipTarget
    .html(tooltipComponent)
    .style('left', coordinates.pageX + 'px')
    .style('top', coordinates.pageY + 'px');
};

let barBuild = {
  div_width: function () {
    return 600;
  },
  daysinfuture: function () {
    return 365;
  },
  margin: function () {
    return { top: 0, right: 0, bottom: 40, left: 60, gap: 30 };
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
    return d3.min([this.div_width() * 0.5, 330]);
  },
  shift: function () {
    return this.width() / this.daysinfuture();
  },
  xScale: function ({ start, end }) {
    return d3
      .scaleTime()
      .domain([start, end])
      .rangeRound([0, this.width() - this.margin().left - this.margin().right]);
  },
  yScale: function (max_domain) {
    return (
      d3
        .scaleLinear()
        // the min and max transactions
        .domain([0, max_domain])
        // the area we have to draw the chart
        //  the minimum is second to reverse to top left SVG coordinates
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
    .axisRight(this.yScale(d3.max([max_domain, 100])))
    // .ticks(10)
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
    .attr('class', (d) => d.transaction.type)
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
    .on('mouseenter', function () {
      tooltip.target.transition().duration(200).style('opacity', 0.9);
    })
    .on('mouseover', function (event, d) {
      tooltip.render(
        { pageX: event.pageX, pageY: event.pageY },
        d,
        tooltip.target
      );
    })
    .on('mouseout', function () {
      tooltip.target.transition().duration(500).style('opacity', 0);
    });

  let xScale = barBuild.xScale(dateRange);
  let yScale = barBuild.yScale(max_domain);
  let rects = groups
    .selectAll(`rect`)
    .data((d) => d.stacked.filter((d) => d.height !== 0))
    .join(
      (enter) => enter.append('rect'),
      (update) => update,
      (exit) => exit.remove()
    )
    .attr('x', (d) => xScale(d.date))
    .attr('y', (d) => yScale(0))
    .attr('rx', 3)
    .attr('height', (d) => 0)
    .attr('width', (d, i, nodes) => {
      const dataType = nodes[i].parentNode.__data__.transaction.type;
      return (dataType === 'income' ? widthsIncome : widthsExpense).bar;
    })
    .transition()
    .duration(1500)
    .ease(d3.easeBounceOut)
    .attr('y', (d) => yScale(d.height + d.y0))
    .attr(
      'height',
      (d) =>
        // as the scale is inversed, flip
        this.height() -
        this.margin().top -
        this.margin().bottom -
        yScale(d.height)
    );
};

barBuild.drawLine = function ({
  svg,
  selector,
  dateRange,
  data,
  max_domain,
  tooltip
}) {
  if (!data || data.length === 0) {
    selector.selectAll('path').data(data).exit().remove();
    return;
  }
  let linecolors = d3.scaleOrdinal(d3.schemeCategory10);
  let marginLeft = this.margin().left;

  const dates = eachDayOfInterval(dateRange);
  const xScale = barBuild.xScale(dateRange);
  const yScale = barBuild.yScale(max_domain);

  const line = d3
    .line()
    .x((d) => xScale(d[0]))
    .y((d) => yScale(d[1]));

  selector
    .selectAll('path')
    .data(data)
    .join(
      (enter) => enter.append('path'),
      (update) => update,
      (exit) => exit.remove()
    )
    .attr('d', (d) => line(d.data))
    .attr('stroke', (d, i) => linecolors(i))
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  svg
    .on('mouseenter', function () {
      tooltip.target.transition().duration(200).style('opacity', 0.9);
      tooltip.line.transition().duration(200).style('opacity', 0.9);
    })
    .on('mousemove', function (event) {
      let positionX = event.offsetX;
      // cause we have weird translations right now
      const dateExact = xScale.invert(positionX - (60 * 2) / 3);
      const dateIndex = closestIndexTo(dateExact, dates);
      const date = dates[dateIndex];
      const tooltipLinePositionX = xScale(date);

      tooltip.line
        .transition()
        .duration(400)
        .ease(d3.easeBackOut)
        .attr('x1', tooltipLinePositionX)
        .attr('x2', tooltipLinePositionX)
        .attr('y1', 0)
        .attr('y2', max_domain)
        .style('opacity', 0.9);

      const lineValues = data.map((d) => ({
        ...d,
        valueStart: d.data[dateIndex * 2][1],
        valueEnd: d.data[dateIndex * 2 + 1][1]
      }));
      tooltip.render(
        { pageX: event.pageX, pageY: event.pageY },
        lineValues,
        tooltip.target
      );
    })
    .on('mouseout', function () {
      tooltip.target.transition().duration(500).style('opacity', 0);
      tooltip.line.transition().duration(500).style('opacity', 0);
    });
};

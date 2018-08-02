import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import getDay from 'date-fns/fp/getDay';
import getDate from 'date-fns/fp/getDate';

export class BarChart extends Component {
  componentDidMount() {
    let svgBar = barBuild.init(350, 'bar-section');
    let svgLine = barBuild.init(350, 'line-section');
    this.drawCharts('initial', this.props.data, svgBar, svgLine);
  }

  componentDidUpdate() {
    let svgBar = d3.select('.bar-section').select('g');
    let svgLine = d3.select('.line-section').select('g');
    this.drawCharts('update', this.props.data, svgBar, svgLine);
  }

  drawCharts(phase, data, svgBar, svgLine) {
    let blobs;
    let lineGroup;
    if (phase === 'initial') {
      blobs = barBuild.initBar(svgBar);
      lineGroup = barBuild.initLine(svgLine);
    } else if (phase === 'update') {
      blobs = svgBar.select('g');
      lineGroup = svgLine.select('g');
    }

    let barExpense = barBuild.drawBar(
      blobs,
      'neg',
      data.BarChartExpense,
      data.BarChartMax
    );
    let barIncome = barBuild.drawBar(
      blobs,
      'pos',
      data.BarChartIncome,
      data.BarChartMax
    );
    let barTransfer = barBuild.drawBar(
      blobs,
      'transfer',
      data.BarChartTransfer,
      data.BarChartMax
    );
    let axisBar = barBuild.drawAxis(svgBar, data.BarChartMax, phase);

    let line = barBuild.drawLine(
      lineGroup,
      data.AccountChart,
      data.LineChartMax
    );
    let axisLine = barBuild.drawAxis(svgLine, data.LineChartMax, phase);
  }

  render() {
    return (
      <div>
        <div className="draw-section" style={{ overflow: 'auto' }} />
      </div>
    );
  }
}

export default BarChart;

BarChart.propTypes = {
  data: PropTypes.shape({
    transactions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        raccount: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['income', 'expense', 'transfer']).isRequired,
        start: PropTypes.string.isRequired,
        rtype: PropTypes.string.isRequired,
        cycle: PropTypes.number,
        value: PropTypes.number.isRequired
      })
    ).isRequired,
    BarChartIncome: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        raccount: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['income']).isRequired,
        start: PropTypes.string.isRequired,
        rtype: PropTypes.string.isRequired,
        cycle: PropTypes.number,
        value: PropTypes.number.isRequired,
        stack: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired))
          .isRequired
      })
    ).isRequired,
    BarChartExpense: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        raccount: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['expense']).isRequired,
        start: PropTypes.string.isRequired,
        rtype: PropTypes.string.isRequired,
        cycle: PropTypes.number,
        value: PropTypes.number.isRequired,
        stack: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired))
          .isRequired
      })
    ).isRequired,
    BarChartTransfer: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        raccount: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['transfer']).isRequired,
        start: PropTypes.string.isRequired,
        rtype: PropTypes.string.isRequired,
        cycle: PropTypes.number,
        value: PropTypes.number.isRequired,
        stack: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired))
          .isRequired
      })
    ).isRequired,
    accounts: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        starting: PropTypes.number,
        interest: PropTypes.number.isRequired,
        vehicle: PropTypes.oneOf(['operating', 'debt', 'investment']).isRequired
      })
    ),
    AccountChart: PropTypes.arrayOf(
      PropTypes.shape({
        account: PropTypes.string.isRequired,
        values: PropTypes.arrayOf(
          PropTypes.shape({
            date: PropTypes.instanceOf(Date).isRequired,
            value: PropTypes.number.isRequired
          })
        ),
        interest: PropTypes.number.isRequired,
        vehicle: PropTypes.oneOf(['operating', 'debt', 'investment']).isRequired
      })
    ).isRequired
  })
};

let barBuild = {
  div_width: function() {
    return 600;
  },
  daysinfuture: function() {
    if (this.div_width() > 1000) {
      return 240;
    } else {
      return 120;
    }
  },
  margin: function() {
    return { top: 10, right: 20, bottom: 40, left: 40 };
  },
  width: function() {
    let w =
      this.div_width() -
      this.margin().left -
      this.margin().right +
      this.daysinfuture() * 20;
    return w;
  },
  height: function() {
    return d3.min([
      this.div_width() * 0.5 - this.margin().top - this.margin().bottom,
      350
    ]);
  },
  shift: function() {
    return this.width() / this.daysinfuture();
  },
  today: function() {
    return new Date();
  },
  future: function() {
    let future = new Date();
    future.setDate(future.getDate() + this.daysinfuture());
    return future;
  },
  past: function() {
    let past = new Date();
    past.setDate(past.getDate() - 1);
    return past;
  },
  one_day: function() {
    return 1000 * 60 * 60 * 24;
  },
  graphrange: function() {
    return [convertdate(this.past()), convertdate(this.future())];
  },
  min_x: function() {
    return parseDate(this.graphrange()[0]);
  },
  max_x: function() {
    return parseDate(this.graphrange()[1]);
  },
  xScale: function() {
    return d3
      .scaleTime()
      .domain([this.past(), this.future()])
      .rangeRound([0, this.width() - this.margin().left]);
  },
  yScale: function(max_domain) {
    return d3
      .scaleLinear()
      .domain([0, max_domain])
      .range([this.height() - this.margin().top, 0]);
  }
};

barBuild.init = function(height, selector) {
  return d3
    .select('.draw-section')
    .append('svg')
    .attr('class', selector)
    .attr('width', this.width() + this.margin().left + this.margin().right)
    .attr(
      'height',
      d3.sum([this.height(), this.margin().top, this.margin().bottom])
    )
    .append('g')
    .attr('transform', `translate(${this.margin().left},${this.margin().top})`);
};

barBuild.drawAxis = function(svg, max_domain, phase) {
  // create axis
  let xAxis = d3
    .axisBottom(this.xScale())
    .ticks(d3.timeDay.every(1))
    .tickFormat(d3.timeFormat('%b %d'));

  let yAxis = d3.axisLeft(this.yScale(max_domain)).ticks(10);

  if (phase === 'initial') {
    let drawnX = svg
      .append('g')
      .attr('class', 'xaxis')
      .attr('transform', `translate(${this.shift() / 2},${this.height()})`)
      .call(xAxis);

    drawnX
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '-.55em')
      .attr('transform', 'rotate(-90)');

    drawnX
      .select('path')
      .attr('transform', `translate(-${this.shift() / 2},${0})`);

    let drawnY = svg
      .append('g')
      .attr('class', 'yaxis')
      .attr('transform', `translate(${0},${this.margin().top})`)
      .call(yAxis);

    drawnY
      .append('text')
      .attr('transform', `rotate(-90)`)
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Value ($)');
  } else {
    svg
      .select('.yaxis')
      .transition()
      .duration(3000)
      .call(yAxis);
  }
  return;
};

barBuild.initBar = function(svg) {
  let blobs = svg
    .append('g')
    .attr('class', 'blobs')
    .attr('transform', `translate(${this.shift() / 2},${this.margin().top})`);

  return blobs;
};

barBuild.drawBar = function(blobs, append_class, massagedData, max_domain) {
  let widths;
  if (append_class === 'transfer') {
    widths = { bar: 0.2 * this.shift(), translate: this.shift() * 0.9 };
  } else if (append_class === 'pos') {
    widths = { bar: 0.4 * this.shift(), translate: this.shift() };
  } else if (append_class === 'neg') {
    widths = { bar: 0.4 * this.shift(), translate: (1.2 * this.shift()) / 2 };
  }

  let colors = function(set) {
    if (set === 'pos') {
      return ['#a1d99b', '#41ab5d'];
    } else if (set === 'neg') {
      return ['#fb6a4a', '#cb181d'];
    } else if (set === 'transfer') {
      return ['#ba39f9', '#d238f9'];
    } else {
      return ['#000000'];
    }
  };

  let color = d3
    .scaleLinear()
    .domain([0, 1])
    .range(colors(append_class));

  // Add a group for each entry
  let groupSelection = blobs
    .selectAll('g')
    .filter(`.${append_class}`)
    .filter((d, i) => `#${i}-${d.id}`)
    .data(massagedData);

  groupSelection.exit().remove();

  groupSelection.transition().style('fill', (d, i) => color(i));

  let groups = groupSelection
    .enter()
    .insert('g')
    .attr('class', append_class)
    .attr('id', (d, i) => `${i}-${d.id}`)
    .style('fill', (d, i) => color(i))
    .merge(groupSelection);

  let rects = groups.selectAll(`rect.${append_class}`).data((d, i) => d.stack);

  rects
    .transition()
    .duration(3000)
    .attr('x', (d, i) => barBuild.xScale()(d.data.date))
    .attr('y', (d, i) => barBuild.yScale(max_domain)(d[1]))
    .attr('height', (d, i) => {
      return (
        barBuild.yScale(max_domain)(d[0]) - barBuild.yScale(max_domain)(d[1])
      );
    });

  rects
    .enter()
    .append('rect')
    .transition()
    .duration(3000)
    .attr('class', append_class)
    .attr('x', (d, i) => barBuild.xScale()(d.data.date))
    .attr('y', (d, i) => barBuild.yScale(max_domain)(d[1]))
    .attr('height', (d, i) => {
      return (
        barBuild.yScale(max_domain)(d[0]) - barBuild.yScale(max_domain)(d[1])
      );
    })
    .attr('width', widths.bar)
    .attr('transform', `translate(${widths.translate},${0})`);

  rects.exit().remove();
};

barBuild.initLine = function(svg) {
  return svg
    .append('g')
    .attr('class', 'line')
    .attr('transform', `translate(${this.shift() / 2},${this.margin().top})`);
};

barBuild.drawLine = function(lineGroup, data, max_domain) {
  let linecolors = d3.scaleOrdinal(d3.schemeCategory10);

  const line = d3
    .line()
    .x(d => barBuild.xScale()(d.date))
    .y(d => barBuild.yScale(max_domain)(d.value));

  let lines = lineGroup.selectAll('path').data(data);

  lines
    .transition()
    .duration(3000)
    .attr('d', d => line(d.values))
    .attr('stroke', (d, i) => linecolors(i))
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('transform', `translate(${this.shift()},${this.margin().top})`);

  lines
    .enter()
    .append('path')
    .attr('d', d => line(d.values))
    .attr('stroke', (d, i) => linecolors(i))
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('transform', `translate(${this.shift()},${this.margin().top})`);

  lines.exit().remove();
};

// function to convert javascript dates into a pretty format (i.e. '2014-12-03')
const convertdate = date => {
  let dd = date.getDate();
  let mm = date.getMonth() + 1; //January is 0!
  let yyyy = date.getFullYear();

  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }

  return yyyy + '-' + mm + '-' + dd;
};

const parseDate = date => {
  return d3.timeParse('%Y-%m-%d')(date);
};

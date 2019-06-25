import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

export class BarChart extends PureComponent {
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

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.tooltipTarget);
  }

  drawCharts(phase, data, svgBar, svgLine) {
    let blobs;
    let initLine;
    if (phase === 'initial') {
      blobs = barBuild.initBar(svgBar);
      initLine = barBuild.initLine(svgLine);
    } else if (phase === 'update') {
      blobs = svgBar.select('g');
      initLine = {
        lineGroup: svgLine.select('g'),
        tooltipLine: svgLine.select('line')
      };
    }

    let tooltipBar = {
      target: this.tooltipTarget,
      render: this.renderTooltipBar,
      unmount: this.unmountTooltip
    };

    // Expenses
    // only draw positive rects (ignores neg transfers)
    barBuild.drawBar(
      this.props.data,
      blobs,
      'neg',
      data.BarChartExpense,
      data.BarChartMax,
      tooltipBar
    );

    // Income
    barBuild.drawBar(
      this.props.data,
      blobs,
      'pos',
      data.BarChartIncome,
      data.BarChartMax,
      tooltipBar
    );

    // axis bar
    barBuild.drawAxis(svgBar, data, data.BarChartMax, phase);

    let tooltipLine = {
      target: this.tooltipTarget,
      render: this.renderTooltipLine,
      unmount: this.unmountTooltip
    };
    barBuild.drawLine(
      this.props.data,
      d3.select('.line-section'),
      initLine.lineGroup,
      initLine.tooltipLine,
      data.AccountChart,
      data.LineChartMax,
      tooltipLine
    );

    // axis line
    barBuild.drawAxis(svgLine, data, data.LineChartMax, phase);
  }

  renderTooltipBar(coordinates, tooltipData, tooltipTarget) {
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
  }

  renderTooltipLine(coordinates, tooltipData, tooltipTarget) {
    let styles = {
      position: 'absolute',
      pointerEvents: 'none',
      left: `${coordinates.pageX}px`,
      top: `${coordinates.pageY}px`
    };

    const tooltipComponent = (
      <div className="notification is-primary" id="tooltipLine" style={styles}>
        {tooltipData.map(line => (
          <p key={line.data.account.name}>
            {line.data.account.name} ${line.value}
          </p>
        ))}
      </div>
    );

    ReactDOM.render(tooltipComponent, tooltipTarget);
  }

  unmountTooltip(tooltipTarget) {
    ReactDOM.unmountComponentAtNode(tooltipTarget);
  }

  render() {
    return (
      <div>
        <div
          ref={elem => {
            this.tooltipTarget = elem;
          }}
        />
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
        type: PropTypes.oneOf(['income', 'transfer']).isRequired,
        start: PropTypes.string.isRequired,
        rtype: PropTypes.string.isRequired,
        cycle: PropTypes.object,
        value: PropTypes.object.isRequired,
        stack: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired))
          .isRequired
      })
    ).isRequired,
    BarChartExpense: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        raccount: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['expense', 'transfer']).isRequired,
        start: PropTypes.string.isRequired,
        rtype: PropTypes.string.isRequired,
        cycle: PropTypes.object,
        value: PropTypes.object.isRequired,
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
    return 365;
  },
  margin: function() {
    return { top: 10, right: 0, bottom: 20, left: 60 };
  },
  band: function() {
    return this.daysinfuture() * 30;
  },
  width: function() {
    let w =
      this.div_width() - this.margin().left - this.margin().right + this.band();
    return w;
  },
  height: function() {
    return d3.min([this.div_width() * 0.5, 350]);
  },
  shift: function() {
    return this.width() / this.daysinfuture();
  },
  xScale: function(props) {
    return d3
      .scaleTime()
      .domain([props.GraphRange.start, props.GraphRange.end])
      .rangeRound([0, this.width() - this.margin().left]);
  },
  yScale: function(max_domain) {
    return d3
      .scaleLinear()
      .domain([0, max_domain])
      .range([this.height() - this.margin().top - this.margin().bottom, 0]);
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

barBuild.drawAxis = function(svg, props, max_domain, phase) {
  // create axis
  let xAxis = d3
    .axisBottom(this.xScale(props))
    .ticks(d3.timeDay.every(1))
    .tickFormat(d3.timeFormat('%b %d'));

  let yAxis = d3
    .axisRight(this.yScale(max_domain))
    .ticks(10)
    .tickSize(this.width());

  if (phase === 'initial') {
    let drawnX = svg
      .append('g')
      .attr('class', 'xaxis')
      .attr(
        'transform',
        `translate(${0},${this.height() - this.margin().bottom})`
      )
      .call(xAxis);

    drawnX
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '-.55em')
      .attr('transform', 'rotate(-90)');

    let drawnY = svg
      .append('g')
      .attr('class', 'yaxis')
      .attr('transform', `translate(${0},${this.margin().top})`)
      .call(yAxis);

    drawnY
      .append('text')
      .attr('transform', `rotate(-90)`)
      .attr('y', 6)
      .attr('dy', '5.71em')
      .style('text-anchor', 'end')
      .text('Value ($)');

    drawnY
      .selectAll('.tick:not(:first-of-type) line')
      .attr('stroke', '#777')
      .attr('stroke-dasharray', '2,5')
      .attr('transform', `translate(-${this.margin().left},0)`);

    drawnY
      .selectAll('.tick text')
      .attr('x', -this.margin().left)
      .attr('dy', -4);

    // hide the left axis line, if we would instead remove it,
    // it would show up during and after a transition
    drawnY.select('path').attr('stroke-width', '0');
  } else {
    let drawnX = svg
      .select('.xaxis')
      .transition()
      .duration(3000)
      .call(xAxis);

    drawnX
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '-.55em')
      .attr('transform', 'rotate(-90)');

    let drawnY = svg
      .select('.yaxis')
      .transition()
      .duration(3000)
      .call(yAxis);

    drawnY
      .selectAll('.tick:not(:first-of-type) line')
      .attr('stroke', '#777')
      .attr('stroke-dasharray', '2,5')
      .attr('transform', `translate(-${this.margin().left},0)`);

    drawnY
      .selectAll('.tick text')
      .attr('x', -this.margin().left)
      .attr('dy', -4);
  }

  return;
};

barBuild.initBar = function(svg) {
  let blobs = svg
    .append('g')
    .attr('class', 'blobs')
    .attr('transform', `translate(${0},${this.margin().top})`);

  return blobs;
};

barBuild.drawBar = function(
  props,
  blobs,
  append_class,
  massagedData,
  max_domain,
  tooltip
) {
  if (massagedData.length === 0) return;
  let widths;
  // 100% of shift is the space between ticks
  if (append_class === 'pos') {
    widths = { bar: 0.4 * this.shift(), translate: 0 };
  } else if (append_class === 'neg') {
    widths = {
      bar: 0.4 * this.shift(),
      translate: -0.4 * this.shift()
    };
  }

  let colors = function(d) {
    if (d.type === 'income') {
      return ['#a1d99b', '#41ab5d'];
    } else if (d.type === 'expense') {
      return ['#fb6a4a', '#cb181d'];
    } else if (d.type === 'transfer') {
      return ['#8029aa', '#d238f9'];
    } else {
      return ['#0019ff'];
    }
  };

  let color = d =>
    d3
      .scaleLinear()
      .domain([0, massagedData.length])
      .range(colors(d));

  // Add a group for each entry
  let groupSelection = blobs
    .selectAll('g')
    .filter(`.${append_class}`)
    .filter((d, i) => `#${i}-${d.id}`)
    .data(massagedData);

  groupSelection.exit().remove();

  groupSelection
    .transition()
    .attr('class', append_class)
    .attr('id', (d, i) => `${i}-${d.id}`)
    .style('fill', (d, i) => color(d)(i));

  let groups = groupSelection
    .enter()
    .insert('g')
    .attr('class', append_class)
    .attr('id', (d, i) => `${i}-${d.id}`)
    .style('fill', (d, i) => color(d)(i))
    .merge(groupSelection)
    .on('mouseover', function(d, i) {
      tooltip.render(
        { pageX: d3.event.pageX, pageY: d3.event.pageY },
        d,
        tooltip.target
      );
    })
    .on('mouseout', function() {
      tooltip.unmount(tooltip.target);
    });

  let rects = groups.selectAll(`rect.${append_class}`).data((d, i) => d.stack);
  let xScale = barBuild.xScale(props);
  let yScale = barBuild.yScale(max_domain);

  rects
    .transition()
    .delay((d, i) => 800 + i * 150 - (i * i) / 4)
    .duration(3000)
    .ease(d3.easeBounceOut)
    .attr('class', append_class)
    .attr('x', d => xScale(d.data.date))
    .attr('transform', `translate(${widths.translate},${0})`)
    .attr('y', d => yScale(d[1]))
    .attr('height', d => d3.max([0, yScale(d[0]) - yScale(d[1])]));

  rects
    .enter()
    .append('rect')
    .attr('class', append_class)
    .attr('x', d => xScale(d.data.date))
    .attr('transform', `translate(${widths.translate},${0})`)
    .attr('width', widths.bar)
    .attr('y', d => yScale(d[0]))
    .transition()
    .delay((d, i) => 800 + i * 150 - (i * i) / 4)
    .duration(3000)
    .ease(d3.easeBounceOut)
    .attr('y', d => yScale(d[1]))
    .attr('height', d => d3.max([0, yScale(d[0]) - yScale(d[1])]));

  rects.exit().remove();
};

barBuild.initLine = function(svg) {
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

barBuild.drawLine = function(
  props,
  svg,
  lineGroup,
  tooltipLine,
  data,
  max_domain,
  tooltip
) {
  if (!data || data.length === 0) {
    lineGroup
      .selectAll('path')
      .data(data)
      .exit()
      .remove();
    return;
  }
  let linecolors = d3.scaleOrdinal(d3.schemeCategory10);
  let marginLeft = this.margin().left;

  const xScale = barBuild.xScale(props);
  const yScale = barBuild.yScale(max_domain);

  const line = d3
    .line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value));

  let lines = lineGroup.selectAll('path').data(data);

  lines
    .transition()
    .delay((d, i) => 800 + i * 150)
    .duration(3000)
    .attr('d', d => line(d.values))
    .attr('stroke', (d, i) => linecolors(i))
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  lines
    .enter()
    .append('path')
    .attr('d', d => line(d.values))
    .attr('stroke', (d, i) => linecolors(i))
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  lines.exit().remove();

  svg
    .on('mousemove', function(d, i, node) {
      let mouse = d3.mouse(this);
      let positionX = mouse[0] - marginLeft;
      let lineGroup = Array.from(node[0].firstChild.childNodes[1].childNodes);

      let linePositions = lineGroup.map(lineNode => {
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
        .map(line => {
          let scaledY = barBuild
            .yScale(max_domain)
            .invert(line.positionY)
            .toFixed(2);
          return { data: line.node.__data__, date: new Date(), value: scaledY };
        })
        .sort((a, b) => b.value - a.value);

      tooltip.render(
        { pageX: d3.event.pageX, pageY: d3.event.pageY },
        lineVals,
        tooltip.target
      );
    })
    .on('mouseout', function() {
      tooltip.unmount(tooltip.target);
    });
};

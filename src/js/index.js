import * as d3 from 'd3';
import '../css/index.css';

const svg = d3.select('svg');
const margin = { top: 30, right: 30, bottom: 40, left: 60 };
const width = +svg.attr('width') - margin.left - margin.right;
const height = +svg.attr('height') - margin.top - margin.bottom;

const parseTime = d3.timeParse('%Y-%m-%d');
const bisectDate = d3.bisector(d => d.year).left;

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const line = d3
  .line()
  .x(d => x(d.year))
  .y(d => y(d.value));

const g = svg
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

function calcQuarter(monthNum) {
  if (monthNum < 3) return 'Q1';
  else if (monthNum < 6) return 'Q2';
  else if (monthNum < 9) return 'Q3';
  return 'Q4';
}

d3.json(
  'https://cdn.rawgit.com/azdanov/gdp-line-chart/19384513/src/data/data.json',
  (error, json) => {
    if (error) throw error;

    const data = json.data.map(([date, quantity]) => ({
      year: parseTime(date),
      value: quantity,
    }));

    x.domain(d3.extent(data, d => d.year));
    y.domain([0, d3.max(data, d => d.value) * 1.005]);

    g
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    g
      .append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y).ticks(7, '$,.0s'));

    g
      .append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', line);

    const focus = g
      .append('g')
      .attr('class', 'focus')
      .style('display', 'none');

    focus
      .append('line')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', 0)
      .attr('y2', height);

    focus
      .append('line')
      .attr('class', 'y-hover-line hover-line')
      .attr('x1', 0)
      .attr('x2', width);

    focus.append('circle').attr('r', 5);

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('display', 'none');
    tooltip.append('p').attr('class', 'quantity');
    tooltip.append('p').attr('class', 'year');

    let tooltipsEnabled = false;

    function disableTooltips() {
      if (tooltipsEnabled) {
        focus.style('display', 'none');
        tooltip.style('display', 'none');
      } else {
        focus.style('display', null);
        tooltip.style('display', 'inline');
      }
      tooltipsEnabled = !tooltipsEnabled;
    }

    function mouseMove() {
      const x0 = x.invert(d3.mouse(this)[0]);
      const i = bisectDate(data, x0, 1);
      const d0 = data[i - 1];
      const d1 = data[i];
      const d = x0 - d0.year > d1.year - x0 ? d1 : d0;

      // Assign text
      focus.attr('transform', `translate(${x(d.year)}, ${y(d.value)})`);
      tooltip.select('.quantity').text(() => `${d.value}`);
      tooltip
        .select('.year')
        .text(
          () => `${calcQuarter(d.year.getMonth())} ${d.year.getFullYear()}`,
        );
      tooltip
        .style('left', `${d3.event.pageX - 30}px`)
        .style('top', `${d3.event.pageY - 30}px`);
      focus.select('.x-hover-line').attr('y2', height - y(d.value));
      focus.select('.y-hover-line').attr('x2', -x(d.year));
    }

    svg
      .append('rect')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .on('mousemove', mouseMove)
      .on('click', disableTooltips);
  },
);

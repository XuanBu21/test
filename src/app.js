// The codes of building the sidebar and combining text and charts are heavily based on the codes from the
// workshop "slide-show" by Andrew McNutt, the professor of the course CAPP 30239 Data Visualization for Public Policy.

// The codes of making the line chart are inspired by several D3 tutorial sources:
// 1. D3 Graph Gallery, "Line plot with dropdown to filter group in d3.js", https://www.d3-graph-gallery.com/graph/line_filter.html
// 2. D3 Graph Gallery, "Line plot with several groups", https://www.d3-graph-gallery.com/graph/line_several_group.html
// 3. Jill, Hubley’s Block, 2016, "line chart with dropdown selector", http://bl.ocks.org/jhubley/17aa30fd98eb0cc7072f
// 4. Amber, Thomas' Block, 2017, "Nesting and Accessing Data in D3v4", https://amber.rbind.io/2017/05/02/nesting/

// The raw data is from the Bureau of Labor Statistics Current Population Survey, https://www.bls.gov/cps/home.htm

const domReady = require('domready');
import {select} from 'd3-selection';
import {csv, json} from 'd3-fetch';
import './stylesheets/main.css';
import {scaleLinear} from "d3-scale";
import {axisBottom, axisLeft} from "d3-axis";
import {extent, max} from "d3-array";
// import pieChart from './pie-chart';
// import lineChart from './line-chart';


domReady(() => {
  Promise.all([
    // csv('./data/titanic3.csv'),
    csv('./data/er-test.csv'),
    // csv('./data/sex.csv'),
    // csv('./data/age.csv'),
    // csv('./data/race.csv'),
    // csv('./data/edu.csv'),
    // hi ill show you prettier
    json('./data/annotation.json'),
  ]).then(d => {
    const [data, article] = d;
    app(data, article);
  });
});



const slideChartTypeMap = {
  "Earning Ratio by Category in the US": lineChart,
  "Gender Earning Ratio accross the World": pointChart,
};

function app(data, article) {
  const state = {slideIdx: "Earning Ratio by Category in the US"};

  const buttons = select('.buttons-container')
    .selectAll('button')
    .data(["Earning Ratio by Category in the US", "Gender Earning Ratio accross the World"])
    .enter()
    .append('button')
    .text(d => d)
    .on('click', d => {
      state.slideIdx = d;
      render();
    });

  function render() {
    buttons
      .style('font-weight', d => {
        return d === state.slideIdx ? 'bolder' : 'normal';
      })
      .text(d => {
        return d === state.slideIdx ? `${d}` : 'Click';
      });
    // remove old contents
    select('.sidebar *').remove();
    select('.main-area *').remove();
    // start doing stuff
    if (state.slideIdx > 0) {
      select('.main-area')
        .append('h1')
        .text(state.slideIdx);
    }

    select('.sidebar').text(article[state.slideIdx]);
    if (slideChartTypeMap[state.slideIdx]) {
      slideChartTypeMap[state.slideIdx](data);
    } else {
      "stop!"
    }
  }
  render();
}



function lineChart(data) {
  // set up canvas
  var margin = {top: 30, bottom: 30, left: 30, right: 30}
  var width = 600 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  // var nested = d3.nest()
  //     .key(function(d){
  //       return d.cat;})
  //     .entries(data);
  // console.log(nested);

  // set up selection box
  const category = ["Sex", "Education", "Age", "Race"]
  const dropDown = select("#selectbox")
    // .append('div')
    // .attr('class', 'flex-height')
    // .append("select")
    .selectAll("options")
    .data(category)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d)
    .append("g");

  // set up svg
  const svg = select(".main-area")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate("+ margin.left +", "+ margin.top +")");

  // set up axis
    var xScale = scaleLinear()
      .domain(extent(data, function(d) {return d.year;})).range([0, width]);
    var xAxis = axisBottom(xScale);

    var yScale = scaleLinear()
      .domain([0, max(data, function(d) { return d.er; })])
      .range([ height, 0 ]);
    var yAxis = axisLeft(yScale);

    svg.append("g").attr("transform", "translate(0," + height + ")").call(xAxis);
    svg.append("g").call(yAxis);
  
    // console.log(data)
    // make line chart
    let line = svg.append('g')
        .append("path")
        .datum(data.filter(function(d){return d.cat==category[0]}))
        .attr("d", d3.line()
          .x(function(d) {return xScale(d.year);})
          .y(function(d) {return yScale(d.er);}))
        .attr("fill", "none")
        .style("stroke-width", 2)
        .style("stroke", "red")

    // update function
    function update(cat) {
      var dataFilter = data.filter(function(d){return d.cat==cat})

      line.datum(dataFilter)
          .attr("d", d3.line()
            .x(function(d) {return xScale(d.year);})
            .y(function(d) {return yScale(d.er);}))
          .attr("fill", "none")
          .style("stroke-width", 2)
          .style("stroke", "red")        
    }


    // Run update function with the selected category
    select("#selectbox").on('change', function(){

      var selectedcat = select(this)
                        .property("value")

          update(selectedcat)

    })


}


function pointChart(data) {}

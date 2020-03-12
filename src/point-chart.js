// CAPP 30239 Data Visualization for Public Policy
// HW-10
// Xuan Bu

// Reference:
// The codes of making the point chart are inspired by the following D3 tutorial sources:
// 1. D3 Graph Gallery, "Colored bubble plot in d3.js", https://www.d3-graph-gallery.com/graph/bubble_color.html
// 2. D3 Graph Gallery, "Add tooltip to bubble chart-1", https://www.d3-graph-gallery.com/graph/bubble_template.html
// 3. D3 Graph Gallery, "Add tooltip to bubble chart-2", https://www.d3-graph-gallery.com/graph/bubble_tooltip.html
// 4. AmeliaBR, 2014, "Answer to Question 'D3 - Positioning tooltip on SVG element not working'", https://stackoverflow.com/questions/21153074/d3-positioning-tooltip-on-svg-element-not-working
// 5. John, Walley, d3-simple-slider, (2019), GitHub repository, https://github.com/johnwalley/d3-simple-slider
// 6. David, Gomez, "Answer to Question 'D3.js: Import file changing with a slider'", https://stackoverflow.com/questions/54315685/d3-js-import-file-changing-with-a-slider
// 7. d3noob's Block, 2016, "Range input with v4", https://bl.ocks.org/d3noob/147791d51cf6516715914c49cb869f57

// Data source:
// 1. population, https://data.oecd.org/pop/population.htm
// 2. gross national income, https://data.oecd.org/natincome/gross-national-income.htm#indicator-chart
// 3. gender wage gap, https://data.oecd.org/earnwage/gender-wage-gap.htm#indicator-chart

import { select, event } from "d3-selection";
import { scaleLinear, scaleOrdinal, scaleSqrt } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { extent, max } from "d3-array";
import { nest } from "d3-collection";
import { format } from "d3-format";
import { transition } from "d3-transition";

export default function pointChart(data) {
  {
    // constant
    const continents = [
      "Oceania",
      "Asia",
      "Europe",
      "North Americas",
      "South Americas",
      "USA"
    ];
    const state = { year: 2000 };
    var position = 18;
    var population = [5, 50, 150, 300];

    // set up canvas
    var margin = { top: 30, bottom: 70, left: 60, right: 30 };
    var width = 700 - margin.left - margin.right;
    var height = 550 - margin.top - margin.bottom;

    // create two-level nested data
    var nested = nest()
      .key(function(d) {
        return d.year;
      })
      .key(function(d) {
        return d.continent;
      })
      .entries(data);

    // year selection array
    var years = nested.map(function(d) {
      return d.key;
    });

    // initialize graph div
    const div = select(".main-area")
      .append("div")
      .attr("class", "pointgraph");

    // set up time slider
    const slider = div
      .append("input")
      .attr("id", "slider")
      .attr("type", "range")
      .attr("max", 2018)
      .attr("min", 1979)
      .attr("step", 1)
      .on("input", function dropdownReaction(d) {
        update(this.value);
      })
      .property("value", "2000");

    // set up svg
    const svg = div
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    // set up scale
    var xScale = scaleLinear()
      .domain([3500, 70000])
      .range([0, width]);

    var yScale = scaleLinear()
      .domain([0, 70])
      .range([height, 0]);

    // color scales
    var colorScale = scaleOrdinal()
      .domain(continents)
      .range([
        "#2f4b7c",
        "#bc5090",
        "#ffa600",
        "#05dfd7",
        "#ec7373",
        "#75b79e"
      ]);

    // size scales
    var sizeScale = scaleSqrt()
      .domain(
        extent(data, function(d) {
          return d.pop;
        })
      )
      .range([2, 8]);

    // set up axis
    var xAxis = axisBottom(xScale);
    var yAxis = axisLeft(yScale);

    // x-axis
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      // add axis label
      .append("text")
      .attr("class", "xaxis")
      .attr("fill", "black")
      .attr("font-size", "15px")
      .attr("transform", "translate(320, 35)")
      .text("Gross National Income (US dollars/capita)");

    // y-axis
    svg
      .append("g")
      .call(yAxis.tickFormat(format(".0f")))
      // add axis label
      .append("text")
      .attr("class", "yaxis")
      .attr("fill", "black")
      .attr("font-size", "15px")
      .attr("transform", "translate(-30, 130) rotate(-90)")
      .text("Wage Gap (US dollars)");

    // add data source and annotation
    svg
      .append("g")
      .append("text")
      .attr("class", "source")
      .attr("fill", "grey")
      .attr("transform", "translate(-10, 515)")
      .attr("font-size", "12px")
      .text(
        "Source: OECD (2020), Gender wage gap, Gross national income, Population (indicator). (Accessed on 07 March 2020)"
      )
      .on("click", function() {
        window.open("https://data.oecd.org/");
      });

    // create tooltip
    var tooltip = div
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("background-color", "#616161")
      .style("border-radius", "5px")
      .style("color", "#F5F5F5");

    // show tooltip when mouse clicks
    var showTooltip = function(d) {
      tooltip.transition().duration(400);
      tooltip
        .style("opacity", 0.9)
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .html(d.country)
        .style("top", event.pageY - 120 + "px")
        .style("left", event.pageX - 450 + "px");
    };

    // keep showing tooltip when mouse is still on the circle
    var keepTooltip = function(d) {
      tooltip
        .style("top", event.pageY - 120 + "px")
        .style("left", event.pageX - 450 + "px");
    };

    // remove tooptip when mouse leaves
    var removeTooltip = function(d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0);
    };

    // make point chart
    // set default category
    var iniYearArray = nested.filter(function(d) {
      return d.key == state.year;
    });

    // set up initial year label
    var yearLaebl = svg
      .append("g")
      .append("text")
      .transition()
      .duration(350)
      .attr("id", "yearlabel")
      .attr("transform", "translate(185, 13)")
      .attr("font-family", "Courier")
      .attr("font-size", "14px")
      .attr("fill", "#616161")
      .text("Year: 2000");

    // initialize graph
    // first level of the nested data
    var iniYear = svg
      .selectAll(".year")
      .data(iniYearArray)
      .enter()
      .append("g")
      .attr("class", "year");

    // second level of the nested data
    var iniPerYear = iniYear
      .selectAll(".peryear")
      .data(d => d.values)
      .enter();

    var iniPerYearGroup = iniPerYear
      .selectAll(".peryeargroup")
      .data(d => d.values)
      .enter()
      .append("circle")
      .on("mouseover", showTooltip)
      .on("mousemove", keepTooltip)
      .on("mouseleave", removeTooltip)
      .transition()
      .duration(10)
      .attr("cx", d => xScale(d.income))
      .attr("cy", d => yScale(d.gap))
      .attr("r", d => sizeScale(d.pop))
      .attr("fill", d => colorScale(d.continent))
      .attr("class", d => "point " + d.continent.replace(/[\s]/g, ""))
      .style("opacity", "0.8")
      .attr("stroke", "white")
      .style("stroke-width", "2px");

    // set up the interactivty that highlights points of same group when mouse touches
    var highlight = function(d) {
      var newLabel = d.replace(/[\s]/g, "");
      d3.selectAll(".point")
        .style("opacity", 0.05)
        .attr("stroke", "white")
        .style("stroke-width", "2px");
      d3.selectAll("." + newLabel)
        .style("opacity", 0.8)
        .attr("stroke", "white")
        .style("stroke-width", "2px");
    };

    var nohighlight = function(d) {
      d3.selectAll(".point")
        .style("opacity", 0.8)
        .attr("stroke", "white")
        .style("stroke-width", "2px");
    };

    // set up legend
    var legendPop = div
      .append("div")
      .attr("class", "populationlegend")
      .append("svg");

    var legendContinent = div
      .append("div")
      .attr("class", "continentlegend")
      .append("svg");

    // set up legend title (population)
    legendPop
      .append("text")
      .style("font-size", 12)
      .transition()
      .duration(350)
      .attr("x", 10)
      .attr("y", 10)
      .text("Population (M)");

    // set up legend circle (population)
    legendPop
      .selectAll("popdots")
      .data(population)
      .enter()
      .append("circle")
      .transition()
      .duration(350)
      .attr("cx", position + 25)
      .attr("cy", function(d, i) {
        return i * position + 25;
      })
      .attr("r", d => sizeScale(d))
      .style("fill", "none")
      .attr("stroke", "black");

    // set up legend label (population)
    legendPop
      .selectAll("poplabels")
      .data(population)
      .enter()
      .append("text")
      .style("font-size", 10)
      .transition()
      .duration(350)
      .attr("x", position + 75)
      .attr("y", function(d, i) {
        return (i + 1) * position + 10;
      })
      .text(d => d);

    // set up legend circle (continent)
    legendContinent
      .selectAll("contdots")
      .data(continents)
      .enter()
      .append("circle")
      .on("mouseover", highlight)
      .on("mouseleave", nohighlight)
      .transition()
      .duration(350)
      .attr("class", "contdot")
      .attr("cx", position + 20)
      .attr("cy", function(d, i) {
        return i * position + 10;
      })
      .attr("r", 8)
      .attr("fill", d => colorScale(d));

    // set up legend label (continent)
    legendContinent
      .selectAll("contlabels")
      .data(continents)
      .enter()
      .append("text")
      .on("mouseover", highlight)
      .on("mouseleave", nohighlight)
      .transition()
      .duration(350)
      .attr("class", "contlabel")
      .attr("x", position + 35)
      .attr("y", function(d, i) {
        return (i + 1) * position - 6;
      })
      .attr("fill", d => colorScale(d))
      .text(d => d)
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");

    // update function
    function update(year) {
      // clear old graphs
      select(".year").remove();
      select(".point").remove();
      select("#yearlabel").remove();

      // firlter selected category
      var selectedYearArray = nested.filter(function(d) {
        return d.key == year;
      });

      // update year label
      var updateYearLabel = svg
        .append("g")
        .append("text")
        .attr("id", "yearlabel")
        .attr("transform", "translate(185, 13)")
        .attr("font-family", "Courier")
        .attr("font-size", "14px")
        .attr("fill", "#616161")
        .text("Year: " + year);

      // update first level of the nested data
      var updateYear = svg
        .selectAll(".year")
        .data(selectedYearArray)
        .enter()
        .append("g")
        .attr("class", "year");

      // update second level of the nested data
      var updatePerYear = updateYear
        .selectAll(".peryear")
        .data(d => d.values)
        .enter();

      var updatePerYearGroup = updatePerYear
        .selectAll(".peryeargroup")
        .data(d => d.values)
        .enter()
        .append("circle")
        .on("mouseover", showTooltip)
        .on("mousemove", keepTooltip)
        .on("mouseleave", removeTooltip)
        .transition()
        .duration(10)
        .attr("cx", d => xScale(d.income))
        .attr("cy", d => yScale(d.gap))
        .attr("r", d => sizeScale(d.pop))
        .attr("fill", d => colorScale(d.continent))
        .attr("class", d => "point " + d.continent.replace(/[\s]/g, ""))
        .style("opacity", "0.8")
        .attr("stroke", "white")
        .style("stroke-width", "2px");
    }
  }
}

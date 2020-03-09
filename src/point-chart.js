// The codes of making the point chart are inspired by the following D3 tutorial sources:
// 1. D3 Graph Gallery, "Colored bubble plot in d3.js", https://www.d3-graph-gallery.com/graph/bubble_color.html
// 2. D3 Graph Gallery, "Add tooltip to bubble chart-1", https://www.d3-graph-gallery.com/graph/bubble_template.html
// 3. D3 Graph Gallery, "Add tooltip to bubble chart-2", https://www.d3-graph-gallery.com/graph/bubble_tooltip.html
// 4. AmeliaBR, 2014, "Answer to Question 'D3 - Positioning tooltip on SVG element not working'", https://stackoverflow.com/questions/21153074/d3-positioning-tooltip-on-svg-element-not-working
// 5. John, Walley, d3-simple-slider, (2019), GitHub repository, https://github.com/johnwalley/d3-simple-slider

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
import { sliderHorizontal } from "d3-simple-slider";

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
    const state = { year: 2016 };
    var size = 18;

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

    // set up selection box
    const div = select(".main-area")
      .append("div")
      .attr("class", "pointgraph");

    // const dropDown = div
    // .append("select")
    // .attr("id", "selectbox")
    //   .on("change", function dropdownReaction(d) {
    //     console.log(this.value)
    //     state.year = this.value;
    //     update(this.value, size);
    //   });

    // dropDown
    //   .selectAll("option")
    //   .data(years)
    //   .enter()
    //   .append("option")
    //   .attr("value", d => d)
    //   .text(d => d);

    // set up time slider
    const sliderDiv = div.append("div").attr("id", "slider");

    var slider = sliderHorizontal()
      .min(1979)
      .max(2018)
      .step(1)
      .width(300)
      // .displayValue(false)
      .default(state.year)
      .on("onchange", val => {
        console.log(val);
        select("#value").text(val);
        // state.year = this.value;
        // console.log(this.value)
        // update(this.value, size);
      });

    // slider
    //   .selectAll("option")
    //   .data(years)
    //   .enter()
    //   .append("option")
    //   .attr("value", d => d)
    //   .text(d => d);

    select("#slider")
      .append("svg")
      .attr("width", 500)
      .attr("height", 100)
      .append("g")
      .attr("transform", "translate(135, 60)")
      .call(slider);

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

    // svg
    //   .append("g")
    //   .append("text")
    //   .attr("fill", "#4D5656")
    //   .attr("transform", "translate(16, 10)")
    //   .attr("font-size", "14px")
    //   .text("*Earnings Ratio = Female-to-Male Median Yearly Earning");

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

    // updateLegend(selectedCatGroup, colorSex, size);

    // set up initial description
    // var des = description[iniCatName[0].key].split("\n");
    // var desText = svg
    //   .append("g")
    //   .append("text")
    //   .attr("class", "description")
    //   .attr("transform", "translate(340, 30)")
    //   .attr("font-family", "Courier")
    //   .attr("font-size", "14px")
    //   .attr("fill", "#616161");

    // var i;
    // for (i = 0; i < des.length; i++) {
    //   desText
    //     .append("tspan")
    //     .text(des[i])
    //     .attr("x", 0)
    //     .attr("dy", "1em");
    // }

    // // create text box
    // svg
    //   .append("g")
    //   .append("rect")
    //   .attr("id", "textbox")
    //   .attr("transform", "translate(330, 25)")
    //   .attr("width", 270)
    //   .attr("height", 100)
    //   .attr("stroke", "#9E9E9E")
    //   .attr("stroke-width", 2)
    //   .attr("fill", "none");

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
      .duration(750)
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
    var legend = div
      .append("div")
      .attr("class", "pointlegend")
      .append("svg");

    // set up legend circle
    legend
      .selectAll("mydots")
      .data(continents)
      .enter()
      .append("circle")
      .on("mouseover", highlight)
      .on("mouseleave", nohighlight)
      .transition()
      .duration(750)
      .attr("class", "dot")
      .attr("cx", size + 20)
      .attr("cy", function(d, i) {
        return i * size + 10;
      })
      .attr("r", 8)
      .attr("fill", d => colorScale(d));

    // set up legend label
    legend
      .selectAll("mylabels")
      .data(continents)
      .enter()
      .append("text")
      .on("mouseover", highlight)
      .on("mouseleave", nohighlight)
      .transition()
      .duration(750)
      .attr("class", "label")
      .attr("x", size + 35)
      .attr("y", function(d, i) {
        return (i + 1) * size - 6;
      })
      .attr("fill", d => colorScale(d))
      .text(d => d)
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");

    // update function
    function update(year, size) {
      // clear old graphs
      select(".year").remove();
      select(".point").remove();
      // select(".legend").remove();
      // select(".description").remove();
      // select("#textbox").remove();

      // firlter selected category
      var selectedYearArray = nested.filter(function(d) {
        return d.key == year;
      });

      // // update description
      // var updateDes = description[selectedCat[0].key].split("\n");
      // var desText = svg
      //   .append("g")
      //   .append("text")
      //   .attr("class", "description")
      //   .attr("transform", "translate(340, 30)")
      //   .attr("font-family", "Courier")
      //   .attr("font-size", "14px")
      //   .attr("fill", "#616161");

      // var i;
      // for (i = 0; i < des.length; i++) {
      //   desText
      //     .append("tspan")
      //     .text(updateDes[i])
      //     .attr("x", 0)
      //     .attr("dy", "1em");
      // }

      // // recreate text box
      // svg
      //   .append("g")
      //   .append("rect")
      //   .attr("id", "textbox")
      //   .attr("transform", "translate(330, 25)")
      //   .attr("width", 270)
      //   .attr("height", 100)
      //   .attr("stroke", "#9E9E9E")
      //   .attr("stroke-width", 2)
      //   .attr("fill", "none");

      // console.log(selectedYearArray)
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
        .duration(750)
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

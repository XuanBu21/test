// CAPP 30239 Data Visualization for Public Policy
// HW-10
// Xuan Bu

// Reference:
// The codes of making the line chart are inspired by the following D3 tutorial sources:
// 1. D3 Graph Gallery, "Line plot with dropdown to filter group in d3.js", https://www.d3-graph-gallery.com/graph/line_filter.html
// 2. D3 Graph Gallery, "Line plot with several groups", https://www.d3-graph-gallery.com/graph/line_several_group.html
// 3. Jill, Hubley’s Block, 2016, "line chart with dropdown selector", http://bl.ocks.org/jhubley/17aa30fd98eb0cc7072f
// 4. Amber, Thomas' Block, 2017, "Nesting and Accessing Data in D3v4", https://amber.rbind.io/2017/05/02/nesting/
// 5. mgraham, 2016, “Answer to Question ‘D3.js create a dynamic color() function’”, https://stackoverflow.com/questions/35158243/d3-js-create-a-dynamic-color-function.
// 6. D3 Graph Gallery, "Building legends in d3.js", https://www.d3-graph-gallery.com/graph/custom_legend.html
// 7. Tejen, Shrestha, 2013, “Answer to Question ‘how to give href to d3js text element’”, https://stackoverflow.com/questions/18958542/how-to-give-href-to-d3js-text-element.
// 8. D3 Graph Gallery, "Add tooltip to bubble chart", https://www.d3-graph-gallery.com/graph/bubble_template.html
// 9. Ian, Johnson's Block, 2015, "d3 tspan append", http://bl.ocks.org/enjalot/1829187

// Data source:
// Bureau of Labor Statistics Current Population Survey, https://www.bls.gov/cps/home.htm

import { line } from "d3-shape";
import { select } from "d3-selection";
import { scaleLinear, scaleOrdinal } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { extent, max } from "d3-array";
import { nest } from "d3-collection";
import { format } from "d3-format";
import { transition } from "d3-transition";

export default function lineChart(data) {
  {
    // constant
    const ageGroup = [
      "16 to 19 years",
      "20 to 24 years",
      "25 to 34 years",
      "35 to 44 years",
      "45 to 54 years",
      "55 to 64 years",
      "65 years and older"
    ];

    const eduGroup = [
      "Less than high school",
      "High school graduates, no college",
      "Some college or associate degree",
      "Bachelor's degree and higher"
    ];

    const raceGroup = ["White", "Black", "Asian", "Hispanic"];

    const sexGroup = ["Gender"];

    const ageReplacegroup = {
      "16 to 19 years": "first age group",
      "20 to 24 years": "second age group",
      "25 to 34 years": "third age group",
      "35 to 44 years": "fourth age group",
      "45 to 54 years": "fifth age group",
      "55 to 64 years": "sixth age group",
      "65 years and older": "seventh age group"
    };

    var size = 15;

    var description = {
      Sex:
        "The gender earning ratio has \nbeen increasing in the past \ndecades. However, the growth \nrate has slowed since 2005 and \nhas fluctuated around 80% in \nthe past 15 years.",
      Education:
        "ER is increasing in all groups. \nGrowth rates of less-educated \ngroups are higher than the \nbetter-educated groups. 'Bach-\n-elor's degree' group has flu-\n-ctuated around 75% since 1995.",
      Age:
        "ER keeps increasing in groups \nof age 20-64 years. Overally, \nER is getting smaller as the \nage gets older. ER of the \nyoungest and oldest groups has \nbeen fluctuating since 1979.",
      Race:
        "ER is increasing among all gr-\n-oups except Asian. The relat-\n-ively low-income races (Black \nand Hispanic) has higher ER t-\n-han the relatively high-inco-\n-me races (White and Asian)."
    };

    // set up canvas
    var margin = { top: 30, bottom: 70, left: 60, right: 30 };
    var width = 700 - margin.left - margin.right;
    var height = 550 - margin.top - margin.bottom;
    const category = ["Sex", "Education", "Age", "Race"];
    const state = { category: "Sex" };

    // create two-level nested data
    var nested = nest()
      .key(function(d) {
        return d.cat;
      })
      .key(function(d) {
        return d.group;
      })
      .entries(data);

    // initialize graph div
    const div = select(".main-area")
      .append("div")
      .attr("class", "linegraph");

    // set up selection box
    const dropDown = div
      .append("select")
      .attr("id", "selectbox")
      .on("change", function dropdownReaction(d) {
        update(this.value, size);
      });

    dropDown
      .selectAll("option")
      .data(category)
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => d);

    // set up svg
    const svg = div
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    // set up scale
    var xScale = scaleLinear()
      .domain(
        extent(data, function(d) {
          return d.year;
        })
      )
      .range([0, width]);

    var yScale = scaleLinear()
      .domain([0.4, 1.2])
      .range([height, 0]);

    // color scales
    var colorAge = scaleOrdinal()
      .domain(ageGroup)
      .range([
        "#2f4b7c",
        "#bc5090",
        "#ffa600",
        "#05dfd7",
        "#ec7373",
        "#75b79e",
        "#6a8caf"
      ]);

    var colorEdu = scaleOrdinal()
      .domain(eduGroup)
      .range(["#05dfd7", "#ec7373", "#75b79e", "#6a8caf"]);

    var colorRace = scaleOrdinal()
      .domain(raceGroup)
      .range(["#05dfd7", "#ec7373", "#75b79e", "#6a8caf"]);

    var colorSex = scaleOrdinal()
      .domain(sexGroup)
      .range(["#424874"]);

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
      .text("Year");

    // y-axis
    svg
      .append("g")
      .call(yAxis.tickFormat(format(".0%")))
      // add axis label
      .append("text")
      .attr("class", "yaxis")
      .attr("fill", "black")
      .attr("font-size", "15px")
      .attr("transform", "translate(-40, 180) rotate(-90)")
      .text("Earning ratio");

    // add data source and annotation
    svg
      .append("g")
      .append("text")
      .attr("class", "source")
      .attr("fill", "grey")
      .attr("transform", "translate(140, 515)")
      .attr("font-size", "14px")
      .text("Source: Bureau of Labor Statistics Current Population Survey")
      .on("click", function() {
        window.open("https://www.bls.gov/cps/home.htm");
      });

    svg
      .append("g")
      .append("text")
      .attr("fill", "#4D5656")
      .attr("transform", "translate(16, 10)")
      .attr("font-size", "14px")
      .text("*Earnings Ratio = Female-to-Male Median Yearly Earning");

    // make line chart
    // function to create lines
    var createLine = line()
      .x(function(d) {
        return xScale(d.year);
      })
      .y(function(d) {
        return yScale(d.er);
      });

    // set default category
    var iniCatName = nested.filter(function(d) {
      return d.key == state.category;
    });

    // set up initial legend
    var selectedCatGroup = iniCatName[0].values.map(function(d) {
      return d.key;
    });

    updateLegend(selectedCatGroup, colorSex, size);

    // set up initial description
    var des = description[iniCatName[0].key].split("\n");
    var desText = svg
      .append("g")
      .append("text")
      .attr("class", "linedescription")
      .attr("transform", "translate(340, 30)")
      .attr("font-family", "Courier")
      .attr("font-size", "14px")
      .attr("fill", "#616161");

    var i;
    for (i = 0; i < des.length; i++) {
      desText
        .append("tspan")
        .text(des[i])
        .attr("x", 0)
        .attr("dy", "1em");
    }

    // create text box
    svg
      .append("g")
      .append("rect")
      .attr("id", "textbox")
      .attr("transform", "translate(330, 25)")
      .attr("width", 270)
      .attr("height", 100)
      .attr("stroke", "#9E9E9E")
      .attr("stroke-width", 2)
      .attr("fill", "none");

    // initialize graph
    // first level of the nested data
    var iniCat = svg
      .selectAll(".cat")
      .data(iniCatName)
      .enter()
      .append("g")
      .attr("class", "cat");

    // second level of the nested data
    var iniCatGroup = iniCat
      .selectAll(".group")
      .data(function(d) {
        return d.values;
      })
      .enter()
      .append("path")
      .transition()
      .duration(750)
      .attr("stroke", function(d) {
        var cat = d.values.map(function(d) {
          return d.cat;
        })[0];
        if (cat == "Age") {
          return colorAge(d.key);
        } else if (cat == "Education") {
          return colorEdu(d.key);
        } else if (cat == "Race") {
          return colorRace(d.key);
        } else if (cat == "Sex") {
          return colorSex(d.key);
        }
      })
      .attr("d", function(d) {
        return createLine(d.values);
      })
      .attr("class", function(d) {
        return createClass(d.key);
      })
      .attr("fill", "none")
      .attr("stroke-width", 5);

    // create an unique class for each group of each category
    function createClass(label) {
      if (ageGroup.indexOf(label) > -1) {
        return "group " + ageReplacegroup[label].replace(/[',\s]/g, "");
      } else {
        return "group " + label.replace(/[',\s]/g, "");
      }
    }

    // set up the interactivty that highlights a line when mouse touches
    var highlight = function(d) {
      // deal with the age group that starts with numerical value
      if (ageGroup.indexOf(d) > -1) {
        var newLabel = ageReplacegroup[d].replace(/[',\s]/g, "");
      } else {
        var newLabel = d.replace(/[',\s]/g, "");
      }

      d3.selectAll(".group").style("opacity", 0.05);
      d3.selectAll("." + newLabel).style("opacity", 1);
    };

    var nohighlight = function(d) {
      d3.selectAll(".group").style("opacity", 1);
    };

    // set up legend
    function updateLegend(data, mycolor, size) {
      var legend = div
        .append("div")
        .attr("class", "linelegend")
        .append("svg");

      // set up legend dot
      legend
        .selectAll("mydots")
        .data(data)
        .enter()
        .append("rect")
        .on("mouseover", highlight)
        .on("mouseleave", nohighlight)
        .transition()
        .duration(750)
        .attr("class", "dot")
        .attr("x", size)
        .attr("y", function(d, i) {
          return i * size;
        })
        .attr("width", size)
        .attr("height", size)
        .attr("fill", function(d) {
          return mycolor(d);
        });

      // set up legend label
      legend
        .selectAll("mylabels")
        .data(data)
        .enter()
        .append("text")
        .on("mouseover", highlight)
        .on("mouseleave", nohighlight)
        .transition()
        .duration(750)
        .attr("class", "label")
        .attr("x", size + 20)
        .attr("y", function(d, i) {
          return (i + 1) * size - 5;
        })
        .attr("fill", function(d) {
          return mycolor(d);
        })
        .text(function(d) {
          return d;
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");
    }

    // update function
    function update(cat, size) {
      // clear old graphs
      select(".cat").remove();
      select(".group").remove();
      select(".linelegend").remove();
      select(".linedescription").remove();
      select("#textbox").remove();

      // firlter selected category
      var selectedCat = nested.filter(function(d) {
        return d.key == cat;
      });

      // update legend
      var mycolor = scaleOrdinal();
      if (cat == "Age") {
        updateCatGroup = ageGroup;
        mycolor = colorAge;
      } else if (cat == "Education") {
        updateCatGroup = eduGroup;
        mycolor = colorEdu;
      } else if (cat == "Race") {
        updateCatGroup = raceGroup;
        mycolor = colorRace;
      } else if (cat == "Sex") {
        updateCatGroup = sexGroup;
        mycolor = colorSex;
      }

      updateLegend(updateCatGroup, mycolor, size);

      // update description
      var updateDes = description[selectedCat[0].key].split("\n");
      var desText = svg
        .append("g")
        .append("text")
        .attr("class", "linedescription")
        .attr("transform", "translate(340, 30)")
        .attr("font-family", "Courier")
        .attr("font-size", "14px")
        .attr("fill", "#616161");

      var i;
      for (i = 0; i < des.length; i++) {
        desText
          .append("tspan")
          .text(updateDes[i])
          .attr("x", 0)
          .attr("dy", "1em");
      }

      // recreate text box
      svg
        .append("g")
        .append("rect")
        .attr("id", "textbox")
        .attr("transform", "translate(330, 25)")
        .attr("width", 270)
        .attr("height", 100)
        .attr("stroke", "#9E9E9E")
        .attr("stroke-width", 2)
        .attr("fill", "none");

      // update first level of the nested data
      var updateCat = svg
        .selectAll(".cat")
        .data(selectedCat)
        .enter()
        .append("g")
        .attr("class", "cat");

      // update second level of the nested data
      var updateCatGroup = updateCat
        .selectAll(".group")
        .data(function(d) {
          return d.values;
        })
        .enter()
        .append("path")
        .transition()
        .duration(750)
        .attr("stroke", function(d) {
          var cat = d.values.map(function(d) {
            return d.cat;
          })[0];
          if (cat == "Age") {
            return colorAge(d.key);
          } else if (cat == "Education") {
            return colorEdu(d.key);
          } else if (cat == "Race") {
            return colorRace(d.key);
          } else if (cat == "Sex") {
            return colorSex(d.key);
          }
        })
        .attr("d", function(d) {
          return createLine(d.values);
        })
        .attr("class", function(d) {
          return createClass(d.key);
        })
        .attr("fill", "none")
        .attr("stroke-width", 4);
    }
  }
}

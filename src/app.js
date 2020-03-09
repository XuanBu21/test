// The codes of building the sidebar and combining text and charts are heavily based on the codes from the
// workshop "slide-show" by Andrew McNutt, the professor of the course CAPP 30239 Data Visualization for Public Policy.

// The references of making the line charts are in the js file "line-chart.js".
// The references of making the point charts are in the js file "point-chart.js".

const domReady = require("domready");
import { select } from "d3-selection";
import { csv, json } from "d3-fetch";
import "./stylesheets/main.css";
import pointChart from "./point-chart";
import lineChart from "./line-chart";

domReady(() => {
  Promise.all([
    csv("./data/usa.csv"),
    csv("./data/world.csv"),
    json("./data/annotation.json")
  ]).then(d => {
    const [lineData, pointdata, article] = d;
    app(lineData, pointdata, article);
  });
});

const slideChartTypeMap = {
  "Gender Earning Ratio across the USA": lineChart,
  "Gender Earning Ratio over the World": pointChart
};

function app(linedata, pointdata, article) {
  const state = { slideIdx: "Gender Earning Ratio across the USA" };
  // const state = { slideIdx: "Gender Earning Ratio over the World" };

  const buttons = select(".buttons-container")
    .selectAll("button")
    .data([
      "Gender Earning Ratio across the USA",
      "Gender Earning Ratio over the World"
    ])
    .enter()
    .append("button")
    .text(d => d)
    .on("click", d => {
      state.slideIdx = d;
      render();
    });

  function render() {
    buttons
      .style("font-weight", d => {
        return d === state.slideIdx ? "bolder" : "normal";
      })
      .text(d => {
        return d === state.slideIdx ? `${d}` : "Switch ...";
      });
    // remove old contents
    select(".sidebar *").remove();
    select(".main-area *").remove();

    if (state.slideIdx > 0) {
      select(".main-area")
        .append("h1")
        .text(state.slideIdx);
    }

    select(".sidebar").text(article[state.slideIdx]);
    if (slideChartTypeMap[state.slideIdx]) {
      if (state.slideIdx === "Gender Earning Ratio across the USA") {
        slideChartTypeMap[state.slideIdx](linedata);
      } else {
        slideChartTypeMap[state.slideIdx](pointdata);
      }
    } else {
      ("stop!");
    }
  }
  render();
}

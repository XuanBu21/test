const domReady = require('domready');
import {select} from 'd3-selection';
import {csv, json} from 'd3-fetch';
import './stylesheets/main.css';
import pieChart from './pie-chart';

domReady(() => {
  Promise.all([
    csv('./data/titanic3.csv'),
    // hi ill show you prettier
    json('./data/article.json'),
  ]).then(d => {
    const [data, article] = d;
    app(data, article);
  });
});

const slideChartTypeMap = {
  0: pieChart,
  1: barChart,
  2: lineChart,
};

function app(data, article) {
  const state = {slideIdx: 0};

  const buttons = select('.buttons-container')
    .selectAll('button')
    .data([0, 1, 2])
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
        return d === state.slideIdx ? `SELECTED SLIDE ${d}` : 'X';
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
      // TODO add a "you screwed up comment/view/whatever"
    }
  }
  render();

  // setInterval(() => {
  //   state.slideIdx = (state.slideIdx + 1) % 3;
  //   render();
  // }, 5000);
}

function barChart(data) {}

function lineChart(data) {}

// let idx = 0;
// const timer = setInterval(() => {
//   console.log('hi !', idx);
//   idx += 1;
//   if (idx > 5) {
//     clearInterval(timer);
//   }
// }, 750);
// setTimeout(() => {
//   console.log('shut up');
// }, 2000);

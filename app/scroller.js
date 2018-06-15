import 'intersection-observer';
import scrollama from "scrollama";
import * as d3 from 'd3';
import Map from './map.js';

// Doing these as constants for now because confusing ES6 "this" scoping + laziness
const map = new Map('#map-zoomer');
const scroller = scrollama();

// Other various ScrollyGraphic components
const container = d3.select('#scroll');
const graphic = container.select('.scroll__graphic');
const chart = graphic.select('.chart');
const text = container.select('.scroll__text');
const step = text.selectAll('.step');

// Should just mark these in topojson, but putting them here for now
const COMPETITIVE_DISTRICTS = [
  '2701', // Minnesota
  '2708',
  '2702',
  '2703',
  '0610', // California
  '0625',
  '0639',
  '0638',
  '0806', // Colorado
  '1226', // Florida
  '1901', // Iowa
  '1706', // Illinois
  '1712',
  '2611', // Michigan
  '3407', // New Jersey
  '3619', // New York
  '3622',
  '3912', // Ohio
  '4201', // Pennsylvania
  '4217',
  '4807', // Texas
  '5110', // Virginia
  '5308' // Washington
];

// Most ScrollyGraphic code is lightly modified boilerplate from here:
// https://pudding.cool/process/introducing-scrollama/

class ScrollyGraphic {

  constructor() {
  }

  _handleResize() {
    // 1. update height of step elements for breathing room between steps
    var stepHeight = Math.floor(window.innerHeight * 0.75);
    step.style('height', stepHeight + 'px');

    // 2. update height of graphic element
    var bodyWidth = d3.select('body').node().offsetWidth;

    graphic
      .style('height', window.innerHeight + 'px');

    // 3. update width of chart by subtracting from text width
    var chartMargin = 32;
    var textWidth = text.node().offsetWidth;
    var chartWidth = graphic.node().offsetWidth - textWidth - chartMargin;
    // make the height 1/2 of viewport
    var chartHeight = Math.floor(window.innerHeight / 2);

    chart
        .style('width', chartWidth + 'px')
        .style('height', chartHeight + 'px');

    // 4. tell scrollama to update new element dimensions
    scroller.resize();
  }

  _handleStepEnter(response) {
    // response = { element, direction, index }
    
    // fade in current step
    step.classed('is-active', function (d, i) {
        return i === response.index;
    })

    // First transition (highlight national districts)
    if (response.index == 1) {
      map._color_districts(COMPETITIVE_DISTRICTS, 'green');
    }

    // Second transition (highlight CA and MN)
    if (response.index == 3) {
      map._reset_colors();
      map._color_districts(['2701', '2708', '2702', '2703', '0610', '0625', '0639', '0638'], 'green');
    }

    // Third transition (Zoom to MN and highlight blue)
    if (response.index == 5) {
      map._reset_colors();

      // Handle zoom
      if (map.zoomed == false) {
        map._zoom_to_mn();
        map._color_districts(['2701', '2708'], '#0258A0');
      } else {
        map._zoom_out();
      }

    }

    // Final transition (highlight red MN districts)
    if (response.index == 7) {
      map._color_districts(['2702', '2703'], '#C0272D');
    }
  }

  _handleContainerEnter(response) {
    // response = { direction }

    // sticky the graphic
    graphic.classed('is-fixed', true);
    graphic.classed('is-bottom', false);
  }

  _handleContainerExit(response) {
    // response = { direction }

    // un-sticky the graphic, and pin to top/bottom of container
    graphic.classed('is-fixed', false);
    graphic.classed('is-bottom', response.direction === 'down');
  }

  init() {
    map.render();

    // 1. call a resize on load to update width/height/position of elements
    this._handleResize();

    scroller
      .setup({
        container: '#scroll', // our outermost scrollytelling element
        graphic: '.scroll__graphic', // the graphic
        text: '.scroll__text', // the step container
        step: '.scroll__text .step', // the step elements
        offset: 0.75, // set the trigger to be 1/2 way down screen
        debug: false, // display the trigger offset for testing
      })
        .onStepEnter(this._handleStepEnter)
        .onContainerEnter(this._handleContainerEnter)
        .onContainerExit(this._handleContainerExit);

    // setup resize event
    window.addEventListener('resize', this._handleResize);
  }

}

export { ScrollyGraphic as default } 
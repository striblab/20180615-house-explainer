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

    if (response.index == 0 && response.direction == 'up' ) {
      map.undo_step_1();
    }

    // First transition (highlight competitive states)
    if (response.index == 1 ) {
      if (response.direction == 'down') {
        map.do_step_1();
      } else {
        map.undo_step_2();
      }
    }

    // Second transition (highlight CA and MN)
    if (response.index == 3 ) {
      if (response.direction == 'down') {
        map.do_step_2();
      } else {
        map.undo_step_3();
      }
    }

    // Third transition (highlight D districts)
    if (response.index == 5 ) {
      if (response.direction == 'down') {
        map.do_step_3();
      } else {
        map.undo_step_4();
      }
    }

    // Final transition (highlight R districts)
    if (response.index == 7 ) {
      if (response.direction == 'down') {
        map.do_step_4();
      }
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
    var self = this;
    
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

    // Setup resize event but only in the event of width resizing. See similar
    // code in map.js
    var cachedWidth = window.innerWidth;
    d3.select(window).on("resize", function() {
      var newWidth = window.innerWidth;
      if(newWidth !== cachedWidth) {
        self._handleResize();
        cachedWidth = newWidth;
      }
    });
  }

}

export { ScrollyGraphic as default }

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

const step_offset = 1.0;

// Most ScrollyGraphic code is lightly modified boilerplate from here:
// https://pudding.cool/process/introducing-scrollama/

class ScrollyGraphic {

  constructor() {
  }

  /********** PRIVATE METHODS **********/

  _handleResize() {
    // 1. update height of step elements for breathing room between steps
    var stepHeight = Math.floor(window.innerHeight * step_offset);
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

    // if (response.direction == 'up') {
    //
    //   if (response.index == 0) {
    //     map.undo_step_1();
    //   }
    //
    // }
  }

  _handleStepExit(response) {
    if (response.direction == 'down') {

      if (response.index == 0) {
        map.do_step_1();
      }

      if (response.index == 1) {
        map.do_step_2();
      }

      if (response.index == 2) {
        map.do_step_3();
      }

      if (response.index == 3) {
        map.do_step_4();
      }

      if (response.index == 4) {
        map.do_step_5();
      }
    }

    if (response.direction == 'up') {

      if (response.index == 1) {
        map.undo_step_2();
      }

      if (response.index == 2) {
        map.undo_step_3();
      }

      if (response.index == 3) {
        map.undo_step_4();
      }

      if (response.index == 4) {
        map.undo_step_5();
      }
    }
  }

  _handleContainerEnter(response) {
    // response = { direction }

    d3.select(".scroll__graphic .byline")
      .transition()
      .style('visibility', 'hidden');

    // sticky the graphic
    graphic.classed('is-fixed', true);
    graphic.classed('is-bottom', false);
  }

  _handleContainerExit(response) {
    // response = { direction }

    d3.select(".scroll__graphic .byline")
      .transition()
      .style('visibility', 'visible');

    if (response.direction == 'up') {
      map.undo_step_1();
    }

    // un-sticky the graphic, and pin to top/bottom of container
    graphic.classed('is-fixed', false);
    graphic.classed('is-bottom', response.direction === 'down');
  }

  /********** PUBLIC METHODS **********/

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
        offset: step_offset, // set the trigger to be 1/2 way down screen
        debug: false, // display the trigger offset for testing
      })
        .onStepEnter(this._handleStepEnter)
        .onStepExit(this._handleStepExit)
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

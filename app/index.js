/**
 * Main JS file for project.
 */

import ScrollyGraphic from './scroller.js';
import BarChart from './chart_ranks.js';

const chart = new BarChart();

chart.render();

(function(){
    let s = new ScrollyGraphic();
    s.init();

   var aspect = 900 / 500;
   var mapper = $("#map-zoomer svg");

$(window).on("resize", function() {
      var targetWidth = mapper.parent().width();
      mapper.attr("width", targetWidth);
      mapper.attr("height", targetWidth / aspect);
  });

    //responsive mapping onload
    var targetWidth = mapper.parent().width();
    mapper.attr("width", targetWidth);
    mapper.attr("height", targetWidth / aspect);

})(); 



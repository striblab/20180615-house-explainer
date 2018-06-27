import * as d3 from 'd3';
import * as topojson from "topojson";
import us from '../sources/districts-albers-d3.json';

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

class Map { 

  constructor(target) {
    this.target = target;
    this.svg = d3.select(target + " svg").attr("width", $(target).width()).attr("height", $(target).height());
    this.g = this.svg.append("g");
    this.zoomed = false;
  }

  _detect_mobile() {
    var winsize = $(window).width();

    if (winsize < 520) { 
      return true; 
    } else {
      return false;
    }
  }


  _zoom_out(viewport, d, path) {
    var x, y, k;
    var centered;
    var width = this.svg.attr('width');
    var height = this.svg.attr('height');
    k = 1; 

    console.log(viewport);

    if (viewport) { 
      k = 0.4;
    }

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    centered = null;
  }

    // Zoom using transitions
    this.g.transition()
      .duration(400)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")

      this.zoomed = false;  
  }

  _zoom_to_mn(viewport, d, path) {
    // Hard-coded Minnesota zoom settings
    // if (!viewport) {
    // var x = 557.078993328558,
    //   y = 104.72218345871143,
    //   k = 4;
    // } else {
    // var x = 650,
    //   y = 125,
    //   k = 3;
    // }

    var x, y, k;
    var centered;
    var width = this.svg.attr('width');
    var height = this.svg.attr('height');

   if (d && centered !== d) {
     var centroid = path.centroid(d);
     x = centroid[0];
     y = centroid[1];
     k = 3;
     centered = d;
   } else {
     x = width / 2;
     y = height / 2;
     k = 3;
     centered = null;
   }

    // Zoom using transitions
    this.g.transition()
      .duration(300)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")

    // Make the lines skinny for consistency on zoom
    this.g.selectAll('path')
      .style("stroke-width", '0.2')

    this.zoomed = true;
  }

  // Simulate a clicky map interaction on Minnesota instead of calling the zoom functions directly
  _clickmn(district) {
      //D3 CLICKY MAP BINDINGS
      jQuery.fn.d3Click = function () {
        this.each(function (i, e) {
          var evt = document.createEvent("MouseEvents");
          evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

          e.dispatchEvent(evt);
          return false;
        });
      };

      jQuery.fn.d3Down = function () {
        this.each(function (i, e) {
          var evt = document.createEvent("MouseEvents");
          evt.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

          e.dispatchEvent(evt);
          return false;
        });
      };

      jQuery.fn.d3Up = function () {
        this.each(function (i, e) {
          var evt = document.createEvent("MouseEvents");
          evt.initMouseEvent("mouseup", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

          e.dispatchEvent(evt);
          return false;
        });
      };


      // Your mouse clicks are actually three events, which are simulated here to auto-zoom the map on a given id of a map path object
      $("[id='" + district + "']").d3Down();
      $("[id='" + district + "']").d3Up();
      $("[id='" + district + "']").d3Click();

  }


  // Simulate a clicky map interaction on the nation's center instead of calling the zoom functions directly
  _clickus(district) {
      //D3 CLICKY MAP BINDINGS
      jQuery.fn.d3Mouse = function () {
        this.each(function (i, e) {
          var evt = document.createEvent("MouseEvents");
          evt.initMouseEvent("mouseover", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

          e.dispatchEvent(evt);
          return false;
        });
      };


      // Your mouse clicks are actually three events, which are simulated here to auto-zoom the map on a given id of a map path object
      $("[id='" + district + "']").d3Mouse();

  }

  _reset_colors() {
    // Resets colors to no fill
    this.g.selectAll('.districts path')
      .transition()
      .delay(750)
      .style("fill", '#DCDCDC')
  } 

  _trigger_district_labels(opacity) {
    // Sets opacity to hide or reveal district labels
    this.g.selectAll('.district-label')
      .style("opacity", opacity)
  }

  _trigger_cpvi_labels(opacity) {
    // Sets opacity to hide or reveal district labels
    this.g.selectAll('.cpvi-label')
      .style("opacity", opacity)
  }

  _color_districts(district_list, color) {
    // Changes the colors of districts based on a list of GEOIDs and a given color
    this.g.selectAll('.districts path')
      .filter(function(d) { return district_list.indexOf(d.properties.GEOID) >= 0; })
      // .filter(function(d) { return d.properties.compete == 1; })
      .transition()
      .delay(750)
      .style("fill", color)
  }

  do_step_1() {
    var self = this;
    self._color_districts(COMPETITIVE_DISTRICTS, '#8b62a8');
  }

  undo_step_1() {
    var self = this;
    self._reset_colors();

    // Always hide labels at this step
    self._trigger_district_labels(0);
    self._trigger_cpvi_labels(0);
  }

  do_step_2() {
    var self = this;
    self._reset_colors();
    // self._zoom_to_mn(self._detect_mobile());
    self._clickmn('MN2703');
    self._color_districts(['2701', '2708', '2702', '2703'], '#8b62a8');
    self._trigger_district_labels(1);
  }

  undo_step_2() {
    var self = this;
    // self._zoom_out(self._detect_mobile());
    self._clickus('NE3101');
    self.do_step_1();
  }

  do_step_3() {
    var self = this;
    self._reset_colors();
    self._color_districts(['2701', '2708'], '#0258A0');
  }

  undo_step_3() {
    var self = this;
    self.do_step_2();
  }

  do_step_4() {
    var self = this;
    self._color_districts(['2702', '2703'], '#C0272D');
  }

  undo_step_4() {
    var self = this;
    self.do_step_3();
  }


  render() {
    var self = this;

    // var projection = d3.geoAlbers().scale(1000).translate([400, 260]);

    var path = d3.geoPath();

    //resize trigger
    d3.select(window).on("resize", sizeChange);


    // Draw the districts based on topojson in ../sources/districts-albers-d3.json
    self.g.append("g")
        .attr("class", "districts")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.districts).features)
      .enter().append("path")
        .attr("d", path)
        .attr("id", function(d) { return d.properties.statePostal + "" + d.properties.GEOID; } )
        .on("click", function(d) { 
          self._zoom_to_mn(self._detect_mobile(), d, path); 
        })
        .on("mouseover", function(d) { 
          self._zoom_out(self._detect_mobile(), d, path); 
        })
        .style("stroke-width", '0.2');

    // Draw the national boundary separately because district mesh doesn't include it
    self.g.append("path")
        .attr("class", "nation-border")
        .attr("d", path(topojson.mesh(us, us.objects.nation)));


    // Draws district labels, present but invisible
    self.g.selectAll("text")
        .data(topojson.feature(us, us.objects.districts).features)
        .enter()
        .append("svg:text")
        .text(function(d){
          if (d.properties.compete == 1 && d.properties.STATEFP == "27") { return d.properties.CD115FP; }
        })
        .attr("x", function(d){
            return path.centroid(d)[0] - 0.8;
        })
        .attr("y", function(d){
            return  path.centroid(d)[1] + 1.3;
        })
        .attr("class", "district-label")
        .attr("text-anchor", "middle")
        .style("fill", "#ffffff")
        .style("opacity", 0)
        .attr("font-size", "2pt");


    // Draws CPVI labels, present but invisible
    self.g.selectAll("text")
        .data(topojson.feature(us, us.objects.districts).features)
        .enter()
        .append("svg:text")
        .text(function(d){
          if (d.properties.compete == 1) { 
            if (d.properties.cpvi < 0) { return "D+" (d.properties.cpvi * -1); }
            else if (d.properties.cpvi > 0) { return "R+" + d.properties.cpvi; }
            else if (d.properties.cpvi == 0) { return "EVEN"; }
          }
        })
        .attr("x", function(d){
            return path.centroid(d)[0];
        })
        .attr("y", function(d){
            return  path.centroid(d)[1];
        })
        .attr("class", "cpvi-label")
        .attr("text-anchor", "middle")
        .style("fill", "#ffffff")
        .style("opacity", 0)
        .attr("font-size", "2pt");


    function sizeChange() {
        d3.select("g").attr("transform", "scale(" + $(self.target).width()/960 + ")");
        $(self.target + " svg").height($(self.target).width()*0.618);
    }

    sizeChange();

  }
}

export { Map as default }
import * as d3 from 'd3';
import * as topojson from "topojson";
import us from '../sources/districts-albers-d3.json';

class Map { 

  constructor(target) {
    this.svg = d3.select(target);
    this.g = this.svg.append("g");
    this.zoomed = false;
  }

  _zoom_out() {
    var x = 479.863109194,
      y = 249.799998,
      k = 1,
      width = this.svg.attr('width'),
      height = this.svg.attr('height');

    // Zoom using transitions
    this.g.transition()
      .duration(400)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")") 

      this.zoomed = false;  
  }

  _zoom_to_mn() {
    // Hard-coded Minnesota zoom settings
    var x = 557.078993328558,
      y = 104.72218345871143,
      k = 4,
      width = this.svg.attr('width'),
      height = this.svg.attr('height');

    // Zoom using transitions
    this.g.transition()
      .duration(400)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")

    // Make the lines skinny for consistency on zoom
    this.g.selectAll('path')
      .style("stroke-width", '0.2')

    this.zoomed = true;
  }

  _reset_colors() {
    // Resets colors to no fill
    this.g.selectAll('.districts path')
      .style("fill", 'none')
  }

  _color_districts(district_list, color) {
    // Changes the colors of districts based on a list of GEOIDs and a given color
    this.g.selectAll('.districts path')
      .filter(function(d) { return district_list.indexOf(d.properties.GEOID) >= 0; })
      .style("fill", color)
  }

  render() {
    var self = this;

    var path = d3.geoPath();

    // Draw the districts based on topojson in ../sources/districts-albers-d3.json
    self.g.append("g")
        .attr("class", "districts")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.districts).features)
      .enter().append("path")
        .attr("d", path);

    // Draw the national boundary separately because district mesh doesn't include it
    self.g.append("path")
        .attr("class", "nation-border")
        .attr("d", path(topojson.mesh(us, us.objects.nation)));
  }
}

export { Map as default }
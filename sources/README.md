# How to make Congressional district SVG

First get from [here](https://www.census.gov/geo/maps-data/data/cbf/cbf_cds.html).

Then:

```
shp2json cb_2017_us_cd115_500k.shp | \
  geoproject 'd3.geoAlbersUsa()' | \
  geoproject 'd3.geoIdentity().reflectY(false).fitSize([960, 500], d)' | \
  geo2topo districts=- | \
  topomerge states=districts -k 'd.properties.STATEFP' | \
  topomerge nation=states -k '1' | \
  toposimplify -f -p 0.5 | \
  topoquantize 1e5 > ./districts-albers-d3.json
```

## Notes and useful links

https://stackoverflow.com/questions/42430361/scaling-d3-v4-map-to-fit-svg-or-at-all
https://github.com/d3/d3-geo/issues/68
https://github.com/d3/d3-geo-projection/blob/master/README.md#geoproject
https://medium.com/@mbostock/command-line-cartography-part-1-897aa8f8ca2c
http://mapshaper.org/
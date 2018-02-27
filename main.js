"use strict";



function showVis1() {
  var worldMapSvg = d3.select("#view1Svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 600 290");

  var projection = d3.geoNaturalEarth1();
  var pathGenerator = d3.geoPath().projection(projection);

  var countries;
  var hostData;
  var rawCountryData;
  function showMap() {
    projection.fitSize([600, 290],
      countries);
    pathGenerator = d3.geoPath().projection(projection);
    var paths = worldMapSvg.selectAll("path.country")
      .data(countries.features);
    paths = paths.enter().append("path")
      .attr("class", "country").merge(paths);
    paths.attr("d", function (country) {
      return pathGenerator(country);
    }).style("fill", "#223144").style("stroke", "#111a25");
    
    console.log(countries);
    var circles = worldMapSvg.selectAll("circle.capital")
    .data(hostData);
    circles = circles.enter().append("circle")
      .attr("class", "capital")
      .attr("r", "1")
      .attr("cx", function (d) {
        var point = [d.data.coordinates.longitude,
          d.data.coordinates.latitude];
        return projection(point)[0];
      })
      .attr("cy", function (d) {
        var point = [d.data.coordinates.longitude,
          d.data.coordinates.latitude];
        return projection(point)[1];
      })
      .style("fill", function (d) {
        return "#8abfff";
      })
      .merge(circles);
    
  }

  function callback(error, data, topo) {
    rawCountryData = topo;
    console.log(topo);
    hostData = data;
    hostData = Object.keys(hostData).map(function(key) {
      return { key, data : hostData[key]};
    });
    console.log(hostData);
    countries = topojson.feature(topo, topo.objects.countries);
    showMap();
    // for (var hostCountry of Object.entries(data)) {
    //   console.log(hostCountry);
    // }
  }


  d3.queue()
  .defer(d3.json, "/map_figure_data_with_coord.json")
  .defer(d3.json, "/world-50m.json")
  .await(callback);

  

}



document.addEventListener("DOMContentLoaded", () => {
  // Put any code here

  // Part 1 Svg
  showVis1();




  // Part 2 Svg
  var wordCloudSvg = d3.select("#view2Svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 400 200");


  //Read in words figure JSON file.
  //http://learnjsdata.com/read_data.html
  d3.json("/words_figure_data.json", function(error, data) {
    console.log(data);
  });


});

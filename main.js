"use strict";
document.addEventListener("DOMContentLoaded", () => {
  // Put any code here

  // Part 1 Svg
  var worldMapSvg = d3.select("#view1Svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 600 290");

  d3.json("/map_figure_data_with_coord.json", function (error, data) {
    console.log(data);
    for (var hostCountry of Object.entries(data)) {
      console.log(hostCountry);
    }
  });



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

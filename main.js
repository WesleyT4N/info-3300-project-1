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


  //Read in words figure csv file.
  //http://learnjsdata.com/read_data.html
  d3.csv("/words_figure_data.csv", function(data) {
    data.forEach(function(d) {
      d.Avg_Daily_Visitors = +d.Avg_Daily_Visitors; //read this value as number, not string
    });
    console.log(data);
    return data;
  });


});

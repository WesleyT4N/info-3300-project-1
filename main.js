"use strict";
document.addEventListener("DOMContentLoaded", () => {
  // Put any code here

  // Part 1 Svg
  var worldMapSvg = d3.select("#view1Svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 600 290");

  // Part 2 Svg
  var wordCloudSvg = d3.select("#view2Svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 400 200");

});
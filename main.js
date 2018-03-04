"use strict";

function showVis1() {
  var worldMapSvg = d3.select("#view1Svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 600 300");

  var projection = d3.geoNaturalEarth1();
  var pathGenerator;
  
  var countries;
  var hostData;
  var USRusData;
 
  var visitorExtent;
  var visitorScale;

  // Colors for US and Russia
  var USRusColors = {
    "United States": 
      { 
        lines: "#2b7ef2",
        country: "#275084"
      },
    "Russian Federation": 
      {
        lines: "#ff6060",
        country: "#592929",
      }
  };

  // Had to manually look these up on wikipedia as the dataset for the internet data did not provide them
  var USRusCountryCodes = {
    "840": "United States",
    "643": "Russian Federation",
  };

  // Render Map
  function showMap() {
    projection.fitExtent([[0,20],[600, 300]],
      countries);
    pathGenerator = d3.geoPath().projection(projection);
    
    // Build and render paths for all the countries
    var paths = worldMapSvg.selectAll("path.country")
      .data(countries.features);
    paths = paths.enter().append("path")
      .attr("class", "country").merge(paths);
    paths.attr("d", function (country) {
      return pathGenerator(country);
    }).style("fill", function(d) {
      var results = USRusCountryCodes[d.id];
      if (results) {
        return USRusColors[results].country;
      }
      return "#223144";
    }).style("stroke", "#111a25")
    .style("stroke-width", 0.5);
    

    // display the points for each hosting location
    var circles = worldMapSvg.selectAll("circle.capital")
    .data(hostData);
    circles = circles.enter().append("circle")
      .attr("class", "capital")
      .attr("r", 1)
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
        var result = USRusData.find(function (e) {
          return e.key === d.key;
        });
        // Make the circles for USA and Russia bigger
        if (result) {
          d3.select(this).attr("r", 4).attr("class", "hub-point");
          return "#fff";
        }
        return "#8abfff";
      })
      .merge(circles);
    
    // Draw arrows connecting all the points
    drawArrows();
  }

  // Credits to vigorousnorth at for the curved connections between points 
  // https://gist.github.com/vigorousnorth/e95a867b10de1239ab3a
  function drawArrows(){
    USRusData.forEach(function (hostCountry) {
      var origin = projection([hostCountry.data.coordinates.longitude,      
        hostCountry.data.coordinates.latitude]);
      var destinations = hostCountry.data.destination;

      for (var dest in destinations) {
          worldMapSvg.append("path")
          .attr("class", "arrow")
          .style("stroke", USRusColors[hostCountry.key].lines)
          .style("stroke-width", 0.5)
          .style("fill", "none")
          .style("opacity", function () {
            return visitorScale(destinations[dest].daily_vis);
          })
          .attr("d", function () {
            var point = projection([destinations[dest].longitude, destinations  [dest].latitude]);
            var mid = [(origin[0] + point[0]) / 2, (origin[1] + point[1]) / 2]
            var curveoffset = 20,
                midcurve = [mid[0]+curveoffset, mid[1]-curveoffset];
            return "M" + origin[0] + ',' + origin[1] 
              + "S" + midcurve[0] + "," + midcurve[1]
              + "," + point[0] + "," + point[1];
          });
      }
    });
  }

  // Function to draw bottom header
  function drawHeader() {
    worldMapSvg.append("g")
    .attr("id", "mapHeader");
    
    var mapHeader = d3.select("#mapHeader")
      mapHeader
      .append("rect")
      .style("fill", "black")
      .attr("x", 0)
      .attr("y", 255)
      .attr("width", 600)
      .attr("height", 45)
      .style("opacity", ".75");
    
      mapHeader
      .append("text")
      .attr("id", "headerText")
      .text("The Online Influence of")
      .attr("text-anchor", "middle")
      .attr("x", 300)
      .attr("y", 289)
      .style("font-size", "2rem")
      .style("fill", "#fff");

      // Bottom header text
      var headerText = d3.select("#headerText");
      headerText.append("tspan").text(" USA").style("fill", USRusColors["United States"].lines).style("font-weight", 700);
      headerText.append("tspan").text(" vs");
      headerText.append("tspan").text(" Russia").style("fill", USRusColors["Russian Federation"].lines).style("font-weight", 700);
  }

  // Function to draw bottom legend
  function drawLegend() {
    worldMapSvg.append("g").attr("id", "legend");

    var legend = d3.select("#legend");
    // Background
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 235)
      .attr("width", 600)
      .attr("height", 20)
      .style("fill" ,"black")
      .style("opacity", "0.3");
    
    legend.append("line")
      .attr("x1", 10)
      .attr("x2", 30)
      .attr("y1", 246)
      .attr("y2", 246)
      .style("stroke", USRusColors["United States"].lines)
      .style("stroke-width", 2);
    legend.append("text")
      .text("Reach of US-hosted sites")
      .attr("x", 35)
      .attr("y", 248)
      .style("font-size", "6px")
      .style("fill", "#fff");

    legend.append("line")
      .attr("x1", 110)
      .attr("x2", 130)
      .attr("y1", 246)
      .attr("y2", 246)
      .style("stroke", USRusColors["Russian Federation"].lines)
      .style("stroke-width", 2);
    legend.append("text")
      .text("Reach of Russian-hosted sites")
      .attr("x", 135)
      .attr("y", 248)
      .style("font-size", "6px")
      .style("fill", "#fff");

    legend.append("circle")
      .attr("r", 1)
      .attr("cx", 225)
      .attr("cy", 246)
      .style("fill", "#8abfff");
    legend.append("text")
      .text("Capitals of other major web-hosting countries")
      .attr("x", 230)
      .attr("y", 248)
      .style("font-size", "6px")
      .style("fill", "#fff");

    legend.append("text")
      .text("Line Opacity = # of average daily users of US / RU sites from that country")
      .attr("x", 400)
      .attr("y", 248)
      .style("font-size", "6px")
      .style("fill", "#fff");

  }

  // Draw data labels on map
  function drawFeatures() {
    worldMapSvg.append("g").attr("id", "mapFeatures");

    var features = d3.select("#mapFeatures");
    // Backgrounds
    features.append("rect")
      .attr("x", 5)
      .attr("y", 5)
      .attr("width", 120)
      .attr("height", 50)
      .style("fill", "black")
      .style("opacity", 0.5);

    features.append("rect")
      .attr("x", 475)
      .attr("y", 5)
      .attr("width", 120)
      .attr("height", 50)
      .style("fill", "black")
      .style("opacity", 0.5);

    features.append("text")
      .attr("id", "usLabel1")
      .attr("x", 10)
      .attr("y", 38)
      .style("fill", "#fff")
      .style("font-size", "6px");
    features.append("text")
      .attr("id", "usLabel2")
      .attr("text-anchor", "middle")
      .attr("x", 65)
      .attr("y", 13)
      .style("fill", "#fff")
      .style("font-size", "6px");
    features.append("text")
      .attr("id", "ruLabel1")
      .attr("x", 480)
      .attr("y", 38)
      .style("fill", "#fff")
      .style("font-size", "6px");
    features.append("text")
      .attr("id", "ruLabel2")
      .attr("x", 482)
      .attr("y", 13)
      .style("fill", "#fff")
      .style("font-size", "6px");

    var usLabel1 = d3.select("#usLabel1");
    usLabel1.append("tspan")
      .text("Total Avg Daily Visitors of USA-based sites:");

    usLabel1.append("tspan")
      .text(USRusData[0].data.total_vis.toLocaleString('en'))
      .attr("text-anchor", "middle")
      .attr("x", 65)
      .attr("dy", "13px")
      .style("font-size", "12px")
      .style("fill", USRusColors["United States"].lines)
      .style("font-weight", 700);
    
    var usLabel2 = d3.select("#usLabel2");
    usLabel2.append("tspan")
      .text("Number of Countries That Use USA Sites:");
    usLabel2.append("tspan")
      .text(Object.keys(USRusData[0].data.destination).length)
      .attr("x", 65)
      .attr("dy", "13px")
      .style("font-size", "12px")
      .style("fill", USRusColors["United States"].lines)
      .style("font-weight", 700);

    console.log(USRusData);
    var ruLabel1 = d3.select("#ruLabel1");
    ruLabel1.append("tspan")
      .text("Total Avg Daily Visitors of RUS-based sites:");
    ruLabel1.append("tspan")
      .text(USRusData[1].data.total_vis.toLocaleString('en'))
      .attr("text-anchor", "middle")
      .attr("x", 535)
      .attr("dy", "13px")
      .style("font-size", "12px")
      .style("fill", USRusColors["Russian Federation"].lines)
      .style("font-weight", 700);

    var ruLabel2 = d3.select("#ruLabel2");
    ruLabel2.append("tspan")
      .text("Number of Countries That Use RUS Sites:");
    ruLabel2.append("tspan")
      .text(Object.keys(USRusData[1].data.destination).length)
      .attr("text-anchor", "middle")
      .attr("x", 535)
      .attr("dy", "13px")
      .style("font-size", "12px")
      .style("fill", USRusColors["Russian Federation"].lines)
      .style("font-weight", 700);
  }

  function callback(error, data, topo) {
    hostData = data;
    hostData = Object.keys(hostData).map(function(key) {
      return { key, data : hostData[key]};
    });

    USRusData = hostData;
    USRusData.sort(function (a,b) {
      return b.data.total_vis - a.data.total_vis;
    });
    USRusData = [USRusData[0], USRusData[3]];
    
    var USDests = USRusData[0].data.destination;
    var USDailyVisitors = Object.keys(USDests)
      .map(function (k) {
        return USDests[k].daily_vis;
      });

    var RUDests = USRusData[1].data.destination;
    var RUDailyVisitors = Object.keys(RUDests)
      .map(function (k) {
        return RUDests[k].daily_vis;
      });

    var combinedDailyVisitors = USDailyVisitors.concat(RUDailyVisitors);
    visitorExtent = d3.extent(combinedDailyVisitors);
    visitorScale = d3.scaleLog().domain(visitorExtent).range([0, .5]);

    countries = topojson.feature(topo, topo.objects.countries);
    showMap();
    drawHeader();
    drawLegend();
    drawFeatures();
  }


  // Asyncrhonously load all the data files and then call callback()
  d3.queue()
  .defer(d3.json, "/map_figure_data_with_coord.json")
  .defer(d3.json, "/world-50m.json")
  .await(callback);
}

//display ring graph below
function showVis2() {
  d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    });
  };

  var wordRingSvg = d3.select("#view2Svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 400 160");

  d3.json("us_russia_sites.json", function(error,data) {
    var us_ru_data = data;

    var circleRingScale = d3.scaleLinear()
    .domain([5082480,518108189])
    .range([1,20]);

    //draw rings for two countries
    var us_ring_center_x = 150;
    var us_ring_center_y = 65;
    var ru_ring_center_x = 266;
    var ru_ring_center_y = 65;

    for (var country in us_ru_data) {
      if (us_ru_data.hasOwnProperty(country)) {
        var ring_center_x, ring_center_y, label_distance;
        if (country === "United States"){
          ring_center_x = us_ring_center_x;
          ring_center_y = us_ring_center_y;
          label_distance = -125;
        }else{
          ring_center_x = ru_ring_center_x;
          ring_center_y = ru_ring_center_y;
          label_distance = 20;
        }

        var last = 5; // Initial radius of center filler circle (hole of donut)

        var rev = us_ru_data[country].reverse();
        rev.forEach(function (site, i) {
          wordRingSvg.append("circle")
          .attr("cx", ring_center_x)
          .attr("cy", ring_center_y)
          // Comparisons based on the thickness of the ring rather than thickness of the circle
          .attr("r", circleRingScale(site.Avg_Daily_Visitors) + last)
          .style("fill", site.Color).moveToBack();

          // Next ring will be the radius of the current one + its own ring thickness
          last += circleRingScale(site.Avg_Daily_Visitors);

          wordRingSvg.append("line")
          .attr("x1",ring_center_x)
          .attr("y1",ring_center_y)
          .attr("x2", function () {
            return (country === "United States" ? 
            ring_center_x + label_distance + 50
            : ring_center_x + label_distance);
          })
          .attr("y2", function () {
            switch (i) {
              case 0:
                return ring_center_y + 30;
              case 1: 
                return ring_center_y + 15;
              case 2:
                return ring_center_y;
              case 3: 
                return ring_center_y - 15;
              case 4: 
                return ring_center_y - 30;
            }
          })
          // .attr("y2",site.Y_coord)
          .style("stroke-width","1px")
          .style("stroke",site.Color).moveToBack();
          wordRingSvg.append("line")
          .attr("x1",ring_center_x+label_distance)
          .attr("y1", function () {
            switch (i) {
              case 0:
                return ring_center_y + 30;
              case 1: 
                return ring_center_y + 15;
              case 2:
                return ring_center_y;
              case 3: 
                return ring_center_y - 15;
              case 4: 
                return ring_center_y - 30;
            }
          })
          .attr("x2",ring_center_x+label_distance+50)
          .attr("y2", function () {
            switch (i) {
              case 0:
                return ring_center_y + 30;
              case 1: 
                return ring_center_y + 15;
              case 2:
                return ring_center_y;
              case 3: 
                return ring_center_y - 15;
              case 4: 
                return ring_center_y - 30;
            }
          })
          .style("stroke-width","1px")
          .style("stroke",site.Color).moveToBack();

          wordRingSvg.append("text")
          .text(site.Website+": "+site.Avg_Daily_Visitors.toLocaleString('en'))
          .attr("x",ring_center_x+label_distance+3)
          .attr("y", function () {
            switch (i) {
              case 0:
                return ring_center_y + 26;
              case 1: 
                return ring_center_y + 11;
              case 2:
                return ring_center_y - 4;
              case 3: 
                return ring_center_y - 19;
              case 4: 
                return ring_center_y - 34;
            }
          })
          .style("font-size", "5px")
          .style("fill", "white");

          wordRingSvg.append("circle")
          .attr("cx", ring_center_x)
          .attr("cy", ring_center_y)
          .attr("r", 5)
          .style("fill", "#182433");
        });
      }
    }

    wordRingSvg.append("rect")
      .attr("x", 155)
      .attr("y", 130)
      .attr("width", 240)
      .attr("height", 25)
      .style("fill", "#0c1116");
    wordRingSvg.append("text")
      .text("Avg Daily Visitors of Top 5 Sites Hosted by USA/Russia")
      .attr("x", 160)
      .attr("y", 140)
      .attr("alignment-baseline","hanging")
      .style("font-size", "10px")
      .style("fill", "white");
  });

}



document.addEventListener("DOMContentLoaded", () => {
  // Put any code here

  // Part 1 Svg
  showVis1();

  // Part 2 Svg
  showVis2();


});

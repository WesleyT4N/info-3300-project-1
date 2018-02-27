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
  var top5;
 
  var visitorExtent;
  var visitorScale;

  var top5Colors = {
    "United States": 
      { 
        lines: "#2b7ef2",
        country: "#275084"
      },
    // "Ireland": "#8bff5e",
    // "Netherlands": "#e8a5ff",
    "Russian Federation": 
      {
        lines: "#ff6060",
        country: "#592929",
      }
    // "United Kingdom": "#ffff75"
  };

  // Had to manually look these up on wikipedia as the dataset for the internet data did not provide them
  var top5CountryCodes = {
    "840": "United States",
    // "372": "Ireland",
    // "528": "Netherlands",
    "643": "Russian Federation",
    // "826": "United Kingdom" 
  };

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
    }).style("fill", function(d) {
      var results = top5CountryCodes[d.id];
      if (results) {
        return top5Colors[results].country;
      }
      return "#223144";
    }).style("stroke", "#111a25");
    
    // console.log(countries);
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
        var result = top5.find(function (e) {
          return e.key === d.key;
        });
        // console.log(result);
        if (result) {
          d3.select(this).attr("r", 4).attr("class", "hub-point");
          return "#fff";
        }
        return "#8abfff";
      })
      .merge(circles);
    
    drawArrows();
  }

  // Credits to vigorousnorth at for the curved connections between points 
  // https://gist.github.com/vigorousnorth/e95a867b10de1239ab3a
  function drawArrows(){
    top5.forEach(function (hostCountry) {
      // console.log(hostCountry);
      var origin = projection([hostCountry.data.coordinates.longitude,      
        hostCountry.data.coordinates.latitude]);
      var destinations = hostCountry.data.destination;
      // console.log(arrows);
      for (var dest in destinations) {
        // console.log(destinations[dest]);
          worldMapSvg.append("path")
          .attr("class", "arrow")
          .style("stroke", top5Colors[hostCountry.key].lines)
          .style("stroke-width", 0.5)
          .style("fill", "none")
          .style("opacity", function () {
            if (hostCountry.key === "Russian Federation") {
              console.log(visitorScale(destinations[dest].daily_vis));
            }
            return visitorScale(destinations[dest].daily_vis);
          })
          .attr("d", function () {
  
            var point = projection([destinations[dest].longitude, destinations[dest].latitude]);
            var mid = [(origin[0] + point[0]) / 2, (origin[1] + point[1]) / 2]
            var curveoffset = 20,
                midcurve = [mid[0]+curveoffset, mid[1]-curveoffset];
            return "M" + origin[0] + ',' + origin[1] 
            // smooth curve to offset midpoint
              + "S" + midcurve[0] + "," + midcurve[1]
            //smooth curve to destination	
              + "," + point[0] + "," + point[1];
            // console.log(point);
          });
      }
    });
  }

  function drawHeader() {
    worldMapSvg.append("g")
    .attr("id", "mapHeader");
    
    var mapHeader = d3.select("#mapHeader")
      mapHeader
      .append("rect")
      .style("fill", "black")
      .attr("x", 0)
      .attr("y", 245)
      .attr("width", 600)
      .attr("height", 45)
      .style("opacity", ".5");
    
      mapHeader
      .append("text")
      .attr("id", "headerText")
      .text("The Online Influence of")
      .attr("text-anchor", "middle")
      .attr("x", 300)
      .attr("y", 280)
      .style("font-size", "2rem")
      .style("fill", "#fff");

      var headerText = d3.select("#headerText");
      headerText.append("tspan").text(" USA").style("fill", top5Colors["United States"].lines);
      headerText.append("tspan").text(" vs");
      headerText.append("tspan").text(" Russia").style("fill", top5Colors["Russian Federation"].lines);
  }

  function drawLegend() {
    worldMapSvg.append("g").attr("id", "legend");

    var legend = d3.select("#legend");
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 225)
      .attr("width", 600)
      .attr("height", 20)
      .style("fill" ,"black")
      .style("opacity", "0.3");
    legend.append("line")
      .attr("x1", 10)
      .attr("x2", 30)
      .attr("y1", 236)
      .attr("y2", 236)
      .style("stroke", top5Colors["United States"].lines)
      .style("stroke-width", 2);
    legend.append("text")
      .text("Reach of US-hosted sites")
      .attr("x", 35)
      .attr("y", 238)
      .style("font-size", "8px")
      .style("fill", "#fff");
    legend.append("line")
      .attr("x1", 130)
      .attr("x2", 150)
      .attr("y1", 236)
      .attr("y2", 236)
      .style("stroke", top5Colors["Russian Federation"].lines)
      .style("stroke-width", 2);
    legend.append("text")
      .text("Reach of Russian-hosted sites")
      .attr("x", 155)
      .attr("y", 238)
      .style("font-size", "8px")
      .style("fill", "#fff");
    legend.append("text")
      .text("Opacity = # of average daily users of US / RU sites from that country")
      .attr("x", 350)
      .attr("y", 238)
      .style("font-size", "8px")
      .style("fill", "#fff");
  }

  function callback(error, data, topo) {
    rawCountryData = topo;
    // console.log(topo);
    hostData = data;
    hostData = Object.keys(hostData).map(function(key) {
      return { key, data : hostData[key]};
    });

    top5 = hostData;
    top5.sort(function (a,b) {
      return b.data.total_vis - a.data.total_vis;
    });
    top5 = [top5[0], top5[3]];
    console.log(top5);
    
    var USDests = top5[0].data.destination;
    var USDailyVisitors = Object.keys(USDests)
      .map(function (k) {
        return USDests[k].daily_vis;
      });

    var RUDests = top5[1].data.destination;
    var RUDailyVisitors = Object.keys(RUDests)
      .map(function (k) {
        return RUDests[k].daily_vis;
      });

    console.log(RUDests);
    console.log(RUDailyVisitors);
    console.log(d3.extent(RUDailyVisitors));
    var combinedDailyVisitors = USDailyVisitors.concat(RUDailyVisitors);

    visitorExtent = d3.extent(combinedDailyVisitors);
    visitorScale = d3.scaleLog().domain(visitorExtent).range([.3, .6]);
    console.log(visitorExtent);
    // console.log(hostData);
    countries = topojson.feature(topo, topo.objects.countries);
    showMap();
    drawHeader();
    drawLegend();
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


  //Read in words figure csv file.
  //http://learnjsdata.com/read_data.html
  d3.csv("/words_figure_data.csv", function(data) {
    data.forEach(function(d) {
      d.Avg_Daily_Visitors = +d.Avg_Daily_Visitors; //read this value as number, not string
    });
    // console.log(data);
    return data;
  });


});

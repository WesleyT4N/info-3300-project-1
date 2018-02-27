"use strict";


function showVis1() {
  var worldMapSvg = d3.select("#view1Svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 600 290");

  var projection = d3.geoEquirectangular();
  var pathGenerator;
  
  var countries;
  var hostData;
  var rawCountryData;
  var USRusData;
 
  var visitorExtent;
  var visitorScale;

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
      var results = USRusCountryCodes[d.id];
      if (results) {
        return USRusColors[results].country;
      }
      return "#223144";
    }).style("stroke", "#111a25")
    .style("stroke-width", 0.5);
    
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
        var result = USRusData.find(function (e) {
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
    USRusData.forEach(function (hostCountry) {
      // console.log(hostCountry);
      var origin = projection([hostCountry.data.coordinates.longitude,      
        hostCountry.data.coordinates.latitude]);
      var destinations = hostCountry.data.destination;
      // console.log(arrows);
      for (var dest in destinations) {
        // console.log(destinations[dest]);
          worldMapSvg.append("path")
          .attr("class", "arrow")
          .style("stroke", USRusColors[hostCountry.key].lines)
          .style("stroke-width", 0.5)
          .style("fill", "none")
          .style("opacity", function () {
            if (hostCountry.key === "Russian Federation") {
              console.log(visitorScale(destinations[dest].daily_vis));
            }
            return visitorScale(destinations[dest].daily_vis);
          })
          .attr("d", function () {
            var point = projection([destinations[dest].longitude, destinations  [dest].latitude]);
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
      .style("opacity", ".75");
    
      mapHeader
      .append("text")
      .attr("id", "headerText")
      .text("The Online Influence of")
      .attr("text-anchor", "middle")
      .attr("x", 300)
      .attr("y", 280)
      .style("font-size", "2rem")
      .style("fill", "#fff");

      // Setupt 
      var headerText = d3.select("#headerText");
      headerText.append("tspan").text(" USA").style("fill", USRusColors["United States"].lines).style("font-weight", 700);
      headerText.append("tspan").text(" vs");
      headerText.append("tspan").text(" Russia").style("fill", USRusColors["Russian Federation"].lines).style("font-weight", 700);
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
      .style("stroke", USRusColors["United States"].lines)
      .style("stroke-width", 2);
    legend.append("text")
      .text("Reach of US-hosted sites")
      .attr("x", 35)
      .attr("y", 238)
      .style("font-size", "6px")
      .style("fill", "#fff");

    legend.append("line")
      .attr("x1", 110)
      .attr("x2", 130)
      .attr("y1", 236)
      .attr("y2", 236)
      .style("stroke", USRusColors["Russian Federation"].lines)
      .style("stroke-width", 2);
    legend.append("text")
      .text("Reach of Russian-hosted sites")
      .attr("x", 135)
      .attr("y", 238)
      .style("font-size", "6px")
      .style("fill", "#fff");

    legend.append("text")
      .text("Line Opacity = # of average daily users of US / RU sites from that country")
      .attr("x", 400)
      .attr("y", 238)
      .style("font-size", "6px")
      .style("fill", "#fff");
    legend.append("circle")
      .attr("r", 1)
      .attr("cx", 225)
      .attr("cy", 236)
      .style("fill", "#8abfff");
    legend.append("text")
      .text("Capitals of other major web-hosting countries")
      .attr("x", 230)
      .attr("y", 238)
      .style("font-size", "6px")
      .style("fill", "#fff");;
  }

  function drawFeatures() {
    worldMapSvg.append("g").attr("id", "mapFeatures");

    var features = d3.select("#mapFeatures");
    features.append("rect")
      .attr("x", 50)
      .attr("y", 50)
      .attr("width", 120)
      .attr("height", 25)
      .style("fill", "black")
      .style("opacity", 0.5);
    features.append("rect")
      .attr("x", 370)
      .attr("y", 15)
      .attr("width", 120)
      .attr("height", 25)
      .style("fill", "black")
      .style("opacity", 0.5);

    features.append("text")
      .attr("id", "usLabel")
      .attr("x", 55)
      .attr("y", 58)
      .style("fill", "#fff")
      .style("font-size", "6px");
    features.append("text")
      .attr("id", "ruLabel")
      .attr("x", 375)
      .attr("y", 23)
      .style("fill", "#fff")
      .style("font-size", "6px");


    
    var usLabel = d3.select("#usLabel");
    usLabel.append("tspan")
      .text("Total Avg Daily Visitors of USA-based sites:");
      console.log(USRusData);
    usLabel.append("tspan")
      .text(USRusData[0].data.total_vis.toLocaleString('en'))
      .attr("text-anchor", "middle")
      .attr("x", 110)
      .attr("dy", "13px")
      .style("font-size", "12px")
      .style("fill", USRusColors["United States"].lines)
      .style("font-weight", 700);

    var ruLabel = d3.select("#ruLabel");
    ruLabel.append("tspan")
      .text("Total Avg Daily Visitors of RUS-based sites:");
    ruLabel.append("tspan")
      .text(USRusData[1].data.total_vis.toLocaleString('en'))
      .attr("text-anchor", "middle")
      .attr("x", 430)
      .attr("dy", "13px")
      .style("font-size", "10px")
      .style("fill", USRusColors["Russian Federation"].lines)
      .style("font-weight", 700);
  }

  function callback(error, data, topo) {
    rawCountryData = topo;
    // console.log(topo);
    hostData = data;
    hostData = Object.keys(hostData).map(function(key) {
      return { key, data : hostData[key]};
    });

    USRusData = hostData;
    USRusData.sort(function (a,b) {
      return b.data.total_vis - a.data.total_vis;
    });
    USRusData = [USRusData[0], USRusData[3]];
    console.log(USRusData);
    
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

    console.log(RUDests);
    console.log(RUDailyVisitors);
    console.log(d3.extent(RUDailyVisitors));
    var combinedDailyVisitors = USDailyVisitors.concat(RUDailyVisitors);

    visitorExtent = d3.extent(combinedDailyVisitors);
    visitorScale = d3.scaleLog().domain(visitorExtent).range([.1, .5]);
    console.log(visitorExtent);
    // console.log(hostData);
    countries = topojson.feature(topo, topo.objects.countries);
    showMap();
    drawHeader();
    drawLegend();
    drawFeatures();
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

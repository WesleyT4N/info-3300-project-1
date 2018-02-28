"use strict";


function showVis1() {
  var worldMapSvg = d3.select("#view1Svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 600 300");

  var projection = d3.geoEquirectangular();
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
    projection.fitSize([600, 310],
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
      .attr("y", 291)
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
      .attr("x", 50)
      .attr("y", 35)
      .attr("width", 120)
      .attr("height", 50)
      .style("fill", "black")
      .style("opacity", 0.5);

    features.append("rect")
      .attr("x", 365)
      .attr("y", 5)
      .attr("width", 120)
      .attr("height", 50)
      .style("fill", "black")
      .style("opacity", 0.5);

    features.append("text")
      .attr("id", "usLabel1")
      .attr("x", 55)
      .attr("y", 68)
      .style("fill", "#fff")
      .style("font-size", "6px");
    features.append("text")
      .attr("id", "usLabel2")
      .attr("text-anchor", "middle")
      .attr("x", 110)
      .attr("y", 43)
      .style("fill", "#fff")
      .style("font-size", "6px");
    features.append("text")
      .attr("id", "ruLabel1")
      .attr("x", 370)
      .attr("y", 38)
      .style("fill", "#fff")
      .style("font-size", "6px");
    features.append("text")
      .attr("id", "ruLabel2")
      .attr("x", 373)
      .attr("y", 13)
      .style("fill", "#fff")
      .style("font-size", "6px");

    var usLabel1 = d3.select("#usLabel1");
    usLabel1.append("tspan")
      .text("Total Avg Daily Visitors of USA-based sites:");

    usLabel1.append("tspan")
      .text(USRusData[0].data.total_vis.toLocaleString('en'))
      .attr("text-anchor", "middle")
      .attr("x", 110)
      .attr("dy", "13px")
      .style("font-size", "12px")
      .style("fill", USRusColors["United States"].lines)
      .style("font-weight", 700);
    
    var usLabel2 = d3.select("#usLabel2");
    usLabel2.append("tspan")
      .text("Number of Countries That Use USA Sites:");
    usLabel2.append("tspan")
      .text(Object.keys(USRusData[0].data.destination).length)
      .attr("x", 110)
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
      .attr("x", 425)
      .attr("dy", "13px")
      .style("font-size", "10px")
      .style("fill", USRusColors["Russian Federation"].lines)
      .style("font-weight", 700);

    var ruLabel2 = d3.select("#ruLabel2");
    ruLabel2.append("tspan")
      .text("Number of Countries That Use RUS Sites:");
    ruLabel2.append("tspan")
      .text(Object.keys(USRusData[1].data.destination).length)
      .attr("text-anchor", "middle")
      .attr("x", 425)
      .attr("dy", "13px")
      .style("font-size", "10px")
      .style("fill", USRusColors["Russian Federation"].lines)
      .style("font-weight", 700);
  }

  function showRings(data) {
    var wordRingSvg = worldMapSvg.append("g").attr("x",0).attr("y",400);
    var us_ru_data = data;
    var us_topsites_data = data["United States"];
    var ru_topsites_data = data["Russian Federation"];
    
    var circleAreaScale = d3.scaleSqrt()
    .domain([5082480,518108189])
    .range([20,7000]);

    // var usColorScale = d3.scaleLinear()
    // .domain([79499959,518108189])
    // .range(["#eaf4ff","#000226"]);

    // var ruColorScale = d3.scaleLinear()
    // .domain([5082480, 48174081])
    // .range(["#FFAFBD","#EB5757"]);

    //draw rings for two countries
    var us_ring_center_x = 95;
    var us_ring_center_y = 100;
    var ru_ring_center_x = 295;
    var ru_ring_center_y = 100;


    for (var country in us_ru_data){
      if (country == "United States"){
        var ring_center_x = us_ring_center_x;
        var ring_center_y = us_ring_center_y;
        var label_distance = 90;
      }else{
        var ring_center_x = ru_ring_center_x;
        var ring_center_y = ru_ring_center_y;
        label_distance = 50;
      }
      us_ru_data[country].forEach(function (site) {
        wordRingSvg.append("circle")
        .attr("cx", ring_center_x)
        .attr("cy", ring_center_y)
        .attr("r", Math.sqrt(circleAreaScale(site.Avg_Daily_Visitors)))
        .style("fill", site.Color);

        wordRingSvg.append("line")
        .attr("x1",ring_center_x)
        .attr("y1",ring_center_y)
        .attr("x2",ring_center_x+label_distance)
        .attr("y2",site.Y_coord)
        .style("stroke-width","2px")
        .style("stroke",site.Color);
        wordRingSvg.append("line")
        .attr("x1",ring_center_x+label_distance)
        .attr("y1",site.Y_coord)
        .attr("x2",ring_center_x+label_distance+50)
        .attr("y2",site.Y_coord)
        .style("stroke-width","2px")
        .style("stroke",site.Color);

        wordRingSvg.append("text")
        .text(site.Website+": "+site.Avg_Daily_Visitors.toLocaleString('en'))
        .attr("x",ring_center_x+label_distance+3)
        .attr("y",parseInt(site.Y_coord)-5)
        .style("font-size", "6px")
        .style("fill", "white");
      });
    }

    wordRingSvg.append("rect")
      .attr("x", 155)
      .attr("y", 170)
      .attr("width", 240)
      .attr("height", 25)
      .style("fill", "#0c1116");
    wordRingSvg.append("text")
      .text("Avg Daily Visitors of Top 5 Sites Hosted by USA/Russia")
      .attr("x", 160)
      .attr("y", 178)
      .attr("alignment-baseline","hanging")
      .style("font-size", "10px")
      .style("fill", "white");
  }

  function callback(error, data, topo, siteData) {
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

    var combinedDailyVisitors = USDailyVisitors.concat(RUDailyVisitors);
    visitorExtent = d3.extent(combinedDailyVisitors);
    visitorScale = d3.scaleLog().domain(visitorExtent).range([.1, .5]);

    countries = topojson.feature(topo, topo.objects.countries);
    showMap();
    drawHeader();
    drawLegend();
    drawFeatures();
    showRings(siteData);
  }


  // Asyncrhonously load all the data files and then call callback()
  d3.queue()
  .defer(d3.json, "/map_figure_data_with_coord.json")
  .defer(d3.json, "/world-50m.json")
  .defer(d3.json, "/us_russia_sites.json")
  .await(callback);
}

//display ring graph below
function showVis2() {

  var wordRingSvg = d3.select("#view2Svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 400 200");

  d3.json("us_russia_sites.json", function(error,data) {
    var us_ru_data = data;
    var us_topsites_data = data["United States"];
    var ru_topsites_data = data["Russian Federation"];
    
    var circleAreaScale = d3.scaleSqrt()
    .domain([5082480,518108189])
    .range([20,7000]);

    // var usColorScale = d3.scaleLinear()
    // .domain([79499959,518108189])
    // .range(["#eaf4ff","#000226"]);

    // var ruColorScale = d3.scaleLinear()
    // .domain([5082480, 48174081])
    // .range(["#FFAFBD","#EB5757"]);

    //draw rings for two countries
    var us_ring_center_x = 95;
    var us_ring_center_y = 100;
    var ru_ring_center_x = 295;
    var ru_ring_center_y = 100;


    for (var country in us_ru_data){
      if (country == "United States"){
        var ring_center_x = us_ring_center_x;
        var ring_center_y = us_ring_center_y;
        var label_distance = 90;
      }else{
        var ring_center_x = ru_ring_center_x;
        var ring_center_y = ru_ring_center_y;
        label_distance = 50;
      }
      us_ru_data[country].forEach(function (site) {
        wordRingSvg.append("circle")
        .attr("cx", ring_center_x)
        .attr("cy", ring_center_y)
        .attr("r", Math.sqrt(circleAreaScale(site.Avg_Daily_Visitors)))
        .style("fill", site.Color);

        wordRingSvg.append("line")
        .attr("x1",ring_center_x)
        .attr("y1",ring_center_y)
        .attr("x2",ring_center_x+label_distance)
        .attr("y2",site.Y_coord)
        .style("stroke-width","2px")
        .style("stroke",site.Color);
        wordRingSvg.append("line")
        .attr("x1",ring_center_x+label_distance)
        .attr("y1",site.Y_coord)
        .attr("x2",ring_center_x+label_distance+50)
        .attr("y2",site.Y_coord)
        .style("stroke-width","2px")
        .style("stroke",site.Color);

        wordRingSvg.append("text")
        .text(site.Website+": "+site.Avg_Daily_Visitors.toLocaleString('en'))
        .attr("x",ring_center_x+label_distance+3)
        .attr("y",parseInt(site.Y_coord)-5)
        .style("font-size", "6px")
        .style("fill", "white");
      });
    }

    wordRingSvg.append("rect")
      .attr("x", 155)
      .attr("y", 170)
      .attr("width", 240)
      .attr("height", 25)
      .style("fill", "#0c1116");
    wordRingSvg.append("text")
      .text("Avg Daily Visitors of Top 5 Sites Hosted by USA/Russia")
      .attr("x", 160)
      .attr("y", 178)
      .attr("alignment-baseline","hanging")
      .style("font-size", "10px")
      .style("fill", "white");
  });

}

document.addEventListener("DOMContentLoaded", () => {
  // Put any code here

  // Part 1 Svg
  showVis1();

  showVis2();



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

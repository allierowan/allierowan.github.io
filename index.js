var fs = require('fs');
var chicago = require('./sources/chicago_stations.json');
var sf = require('./sources/sf_stations.json');
var nyc = require('./sources/nyc_stations.json');
var got = require('got');
var base_url = "https://api.mapbox.com/directions/v5/mapbox/cycling/";

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

var sf_routes = [];
var chicago_routes = [];
var nyc_routes = [];

var markdown = '# Routes between Motivate Bike Stops\n';
markdown += '\n';
markdown += '## ⚠️ ⚠️ ⚠️ ⚠️\n';
markdown += 'Currently, you still have to set the profile to `Cycling` manually when you open the map. Sorry. \n';
markdown += '## ⚠️ ⚠️ ⚠️ ⚠️\n';

async function distanceWithinThreeMiles(stationA, stationB) {
  var coords = stationA.lon + ',' + stationA.lat + ';' + stationB.lon + ',' + stationB.lat
  var reqURL = base_url + coords + ".json";
  var queryParams = {access_token: 'pk.eyJ1IjoiMWVjNSIsImEiOiJjaWsxaHF2emwwM2E0dWdtMHo4d21uaXI5In0.LLdudT0iuSkOYb00l8eEaA', overview: 'full', geometries: 'geojson', steps: true, exclude: 'ferry'};
  var response;
  try {
    response = await got(reqURL, { json: true, query: queryParams });
  } catch (err) {
    console.log('ERROR');
    console.error(err);
    if (err.statusCode === 429) {
      console.log('too many requests');
      await delay(60000);
      return await distanceWithinThreeMiles(stationA, stationB);
    } else {
      throw err;
    }
  }
  if (response.body['routes'].length == 0) return false;
  return (response.body['routes'][0]['distance'] / 1609.34) <= 3;
}

function delay(t, val) {
   return new Promise(function(resolve) {
       setTimeout(function() {
           resolve(val);
       }, t);
   });
}

function getRandomStations(stationList) {
  var stationA = stationList.data.stations[getRandomInt(stationList.data.stations.length)];
  var stationB = stationList.data.stations[getRandomInt(stationList.data.stations.length)];
  return { A: stationA, B: stationB };
}

// pick routes randomly
async function writeMarkdown() {
  for (var i = 0; i < 33;i++){
      var stationsTooFar = true;
      var sfStations;
      while (stationsTooFar) {
        sfStations = getRandomStations(sf);
        foundCloseStations = await distanceWithinThreeMiles(sfStations.A, sfStations.B);
        console.log('distance withint three miles: ' + foundCloseStations);
        stationsTooFar = !foundCloseStations;
      }
      sf_routes.push({A: sfStations.A, B: sfStations.B});

      stationsTooFar = true;
      var chicagoStations;
      while (stationsTooFar) {
        chicagoStations = getRandomStations(chicago);
        foundCloseStations = await distanceWithinThreeMiles(chicagoStations.A, chicagoStations.B);
        stationsTooFar = !foundCloseStations;
      }
      chicago_routes.push({A: chicagoStations.A, B: chicagoStations.B});

      stationsTooFar = true;
      var nycStations;
      while (stationsTooFar) {
        nycStations = getRandomStations(nyc);
        foundCloseStations = await distanceWithinThreeMiles(nycStations.A, nycStations.B);
        stationsTooFar = !foundCloseStations;
      }
      nyc_routes.push({A: nycStations.A, B: nycStations.B});
  }


  // write markdown for SF
  markdown += '\n';
  markdown += '## San Francisco\n';
  for (var route in sf_routes) {
      var A = sf_routes[route].A;
      var B = sf_routes[route].B;

      markdown += '- [Route `'+route+'`](https://hey.mapbox.com/directions/#12/'+A.lat+'/'+A.lon+'?coordinates='+A.lon+','+A.lat+';'+B.lon+','+B.lat+')\n'
                  + '    - **From**: ' + A.name + ' (' + A.station_id +')\n'
                  + '    - **To**: ' + B.name + ' (' + B.station_id +')\n';
  }

  // write markdown for Chicago
  markdown += '\n';
  markdown += '## Chicago\n';
  for (var route in chicago_routes) {
      var A = chicago_routes[route].A;
      var B = chicago_routes[route].B;

      markdown += '- [Route `'+route+'`](https://hey.mapbox.com/directions/#12/'+A.lat+'/'+A.lon+'?coordinates='+A.lon+','+A.lat+';'+B.lon+','+B.lat+')\n'
                  + '    - **From**: ' + A.name + ' (' + A.station_id +')\n'
                  + '    - **To**: ' + B.name + ' (' + B.station_id +')\n';
  }



  // write markdown for NYC
  markdown += '\n';
  markdown += '## NYC\n';
  for (var route in nyc_routes) {
      var A = nyc_routes[route].A;
      var B = nyc_routes[route].B;

      markdown += '- [Route `'+route+'`](https://hey.mapbox.com/directions/#12/'+A.lat+'/'+A.lon+'?coordinates='+A.lon+','+A.lat+';'+B.lon+','+B.lat+')\n'
                  + '    - **From**: ' + A.name + ' (' + A.station_id +')\n'
                  + '    - **To**: ' + B.name + ' (' + B.station_id +')\n';
  }



  // write markdown to disk
  fs.writeFile("./readme.md", markdown, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("File written to `readme.md`");
  });
}

writeMarkdown();

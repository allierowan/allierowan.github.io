var fs = require('fs');



var chicago = require('./sources/chicago_stations.json');
var sf = require('./sources/sf_stations.json');
var nyc = require('./sources/nyc_stations.json');

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

// pick routes randomly
for (var i = 0; i < 33;i++){
    var SFstationA = sf.data.stations[getRandomInt(sf.data.stations.length)];
    var SFstationB = sf.data.stations[getRandomInt(sf.data.stations.length)];
    sf_routes.push({A: SFstationA, B: SFstationB});

    var ChicagoStationA = chicago.data.stations[getRandomInt(chicago.data.stations.length)];
    var ChicagoStationB = chicago.data.stations[getRandomInt(chicago.data.stations.length)];
    chicago_routes.push({A: ChicagoStationA, B: ChicagoStationB});

    var NYCstationA = nyc.data.stations[getRandomInt(nyc.data.stations.length)];
    var NYCstationB = nyc.data.stations[getRandomInt(nyc.data.stations.length)];
    nyc_routes.push({A: NYCstationA, B: NYCstationB});
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
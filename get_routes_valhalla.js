var fs = require('fs');
const https = require('https');
// var polyline = require('@mapbox/polyline');
var d3 = require('d3-queue');


var features = require('./sources/feature_collection_array.json');
var q = d3.queue(1);


// read featurecollection with v5 responses
var new_features = features.routes.map((route) => {

  var coordinates = [{ "lat":route.features[0].geometry.coordinates[1], "lon":route.features[0].geometry.coordinates[0] },
                     { "lat":route.features[1].geometry.coordinates[1], "lon":route.features[1].geometry.coordinates[0] } ];

  var routingOptions = {
    locations: coordinates,
    costing: 'bicycle',
    costing_options: {
      bicycle: {
        use_ferry: 0
      }
    }
  };


  // replace v5 routes with valhalla routes
    q.defer(getRoute, 'https://api.mapbox.com/valhalla/v1/route?json=' + escape(JSON.stringify(routingOptions)) + '&access_token=pk.eyJ1IjoiY2hhdXBvdyIsImEiOiJZX29XRnNFIn0.5eui1ITuIWOxZdPyF0kWTA',
      (linestring) => {
        console.log('replacing: ')
        console.log('  ' + route.features[2].geometry.coordinates)
        console.log('with: ')
        console.log('  ' + linestring)
        route.features[2].geometry['coordinates'] = linestring
        console.log('new: ')
        console.log('  ' + route.features[2].geometry.coordinates)
        console.log('done');
      });

  function getRoute(url, cb, d3_callback) {
    https.get(url, function(res) {
      let body = '';

      res.on('data', function(chunk) {
        body += chunk;
      });

      res.on('end', () => {
        var routeResponse = JSON.parse(body);
        // console.log('[REQUEST] ' + url + '\n' + '[RESPONSE] %O', routeResponse);
        if (routeResponse && routeResponse.trip && routeResponse.trip.legs[0]) {
          // console.log(routeResponse.trip.legs[0].shape);
          cb(decodePolyline(routeResponse.trip.legs[0].shape, 6));
          return d3_callback();
        }
        else {
          console.log('NO ROUTE FOUND')
          cb([[]]);
          return d3_callback();
        }
      });

    }).on('error', function(e) {
      console.log('Got error: ' + e.message);
    });
  }
  return route

})



q.awaitAll(function(error) {
  if (error) throw error;
  fs.writeFileSync('./sources/chau.js', JSON.stringify(new_features));
  console.log('DONE');
});

fs.writeFileSync('./sources/chau.js', JSON.stringify(new_features));




decodePolyline = function(str, precision) {
    var index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, precision || 6);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decodePolylined.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lng / factor, lat / factor]);
    }
    console.log(coordinates);

    return coordinates;
};
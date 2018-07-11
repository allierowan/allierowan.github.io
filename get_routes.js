var routes = require('./sources/lonlats');
var base_url = "https://api.mapbox.com/directions/v5/mapbox/cycling/";
var got = require('got');
var fs = require('fs');
var _ = require('lodash');

// make the api requests

var respPromises = routes.map(function(route) {
  var coords = route["coordinates"];
  console.log(coords.split(';')[0].split(',').map(coord => parseFloat(coord)));

  var reqURL = base_url + coords + ".json";
  var queryParams = {access_token: 'pk.eyJ1IjoiYWxsaWVyb3dhbiIsImEiOiJjaXdzMTQ5ZDIxMHhrMnRxb2l5dHdpcXo5In0.SjrzU9JK207wiTfbTr31Rw', overview: 'full', geometries: 'geojson', steps: true, exclude: 'ferry'};

  return got(reqURL, { json: true, query: queryParams }).then(response => {
    var routeGeoJson = response.body['routes'][0]['geometry'];
    var featureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coords.split(';')[0].split(',').map(coord => parseFloat(coord))
          },
          properties: {
            from: route['from_name'],
            id: route['from_name'] + route['to_name']
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coords.split(';')[1].split(',').map(coord => parseFloat(coord))
          },
          properties: {
            to: route['to_name'],
            id: route['from_name'] + route['to_name']
          }
        },
        {
          type: 'Feature',
          geometry: routeGeoJson,
          properties: {
            id: route['from_name'] + route['to_name']
          }
        }
      ]
    }
    return featureCollection;
  }).catch(error => {
    console.error("errored: " + error);
  });
  // get the route line from the response, output to a geojson file.

});

Promise.all(respPromises).then(responses => {
  console.log(responses.length);
  console.log(JSON.stringify(responses[0]));
  // var points = _.flatten(responses.map(response => {
  //   return response.features.filter(feature => {
  //     return feature.geometry.type == 'Point';
  //   });
  // }));
  // var lines = _.flatten(responses.map(response => {
  //   return response.features.filter(feature => {
  //     return feature.geometry.type == 'LineString';
  //   });
  // }));

  // var pointsCollection = {
  //   type: 'FeatureCollection',
  //   features: points
  // }
  //
  // var linesCollection = {
  //   type: 'FeatureCollection',
  //   features: lines
  // }
  //
  // var features = {
  //   type: 'FeatureCollection',
  //   features: points.concat(lines)
  // }

  // fs.writeFileSync('./points.json', JSON.stringify(pointsCollection, null, 4));
  // fs.writeFileSync('./lines.json', JSON.stringify(linesCollection, null, 4));
  fs.writeFileSync('./features.json', JSON.stringify(responses));

}).catch(err => {
  console.error(err);
});

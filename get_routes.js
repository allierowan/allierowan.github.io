var routes = require('./sources/lonlats');
var base_url = "https://api.mapbox.com/directions/v5/mapbox/cycling/";
var got = require('got');
var fs = require('fs');
var _ = require('lodash');

// make the api requests

var respPromises = routes.map(function(route) {
  var coords = route["coordinates"].join(';');

  var reqURL = base_url + coords + ".json";
  var queryParams = {access_token: 'pk.eyJ1IjoiMWVjNSIsImEiOiJjaWsxaHF2emwwM2E0dWdtMHo4d21uaXI5In0.LLdudT0iuSkOYb00l8eEaA', overview: 'full', geometries: 'geojson', steps: true, exclude: 'ferry'};

  return got(reqURL, { json: true, query: queryParams }).then(response => {
    var routeGeoJson = response.body['routes'][0]['geometry'];
    var featureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: route["coordinates"][0]
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
            coordinates: route["coordinates"][1]
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
  // console.log(JSON.stringify(responses[0]));
  var points = _.flatten(responses.map(response => {
    return response.features.filter(feature => {
      return feature.geometry.type == 'Point';
    });
  }));
  var lines = _.flatten(responses.map(response => {
    return response.features.filter(feature => {
      return feature.geometry.type == 'LineString';
    });
  }));

  var pointsCollection = {
    type: 'FeatureCollection',
    features: points
  }

  var linesCollection = {
    type: 'FeatureCollection',
    features: lines
  }

  var features = {
    type: 'FeatureCollection',
    features: points.concat(lines)
  }

  // fs.writeFileSync('./points.json', JSON.stringify(pointsCollection, null, 4));
  // fs.writeFileSync('./lines.json', JSON.stringify(linesCollection, null, 4));
  fs.writeFileSync('./features.json', JSON.stringify(features));

}).catch(err => {
  console.error(err);
});

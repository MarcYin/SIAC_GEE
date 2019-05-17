// // Load and display an NDVI image.
// var ndvi = ee.ImageCollection('LANDSAT/LC8_L1T_8DAY_NDVI')
//     .filterDate('2014-01-01', '2015-01-01');
// var vis = {min: 0, max: 1, palette: ['99c199', '006400']};
// Map.addLayer(ndvi.median(), vis, 'NDVI');

// // Configure the map.
// Map.setCenter(-94.84497, 39.01918, 8);
// Map.style().set('cursor', 'crosshair');

// // Create a panel and add it to the map.
// var inspector = ui.Panel([ui.Label('Click to get mean NDVI')]);
// Map.add(inspector);

// Map.onClick(function(coords) {
//   // Show the loading label.
//   inspector.widgets().set(0, ui.Label({
//     value: 'Loading...',
//     style: {color: 'gray'}
//   }));

//   // Determine the mean NDVI, a long-running server operation.
//   var point = ee.Geometry.Point(coords.lon, coords.lat);
//   var meanNdvi = ndvi.reduce('mean');
//   var sample = meanNdvi.sample(point, 30);
//   var computedValue = sample.first().get('NDVI_mean');

//   // Request the value from the server.
//   computedValue.evaluate(function(result) {
//     // When the server returns the value, show it.
//     inspector.widgets().set(0, ui.Label({
//       value: 'Mean NDVI: ' + result.toFixed(2),
//     }));
//   });
// });
var id = 'S2A_MSIL1C_20190227T030651_N0207_R075_T50SMG_20190227T074020'
var image = ee.ImageCollection('COPERNICUS/S2').filterMetadata('PRODUCT_ID', 'equals', id)
                      .first()
print(image)  
var geom = image.select('B2').geometry().getInfo()
print(image.select(['B2', 'B3', 'B4', 'B8A']).getDownloadURL({scale: 10, name: '10m_sur', region: JSON.stringify(geom)}))
  
      
          
          
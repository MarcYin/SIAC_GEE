/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = /* color: #d63000 */ee.Geometry.LineString(
        [[-16.801562500000045, 28.173425249666963],
         [-14.076953125000045, 28.173425249666963],
         [-10.649218750000045, 28.25087474251621],
         [-7.0457031250000455, 28.173425249666963],
         [-3.9695312500000455, 28.173425249666963],
         [-0.6296875000000455, 28.173425249666963],
         [2.9738281249999545, 28.173425249666963],
         [6.6652343749999545, 28.173425249666963],
         [9.389843749999955, 28.09591964321284],
         [13.608593749999955, 28.09591964321284],
         [16.860546874999955, 28.25087474251621],
         [21.255078124999955, 28.173425249666963],
         [25.122265624999955, 28.173425249666963],
         [28.637890624999955, 28.173425249666963],
         [33.120312499999955, 28.173425249666963],
         [37.075390624999955, 28.405604984727297],
         [41.030468749999955, 28.405604984727297],
         [45.249218749999955, 28.637276991995687],
         [49.116406249999955, 28.637276991995687],
         [53.510937499999955, 28.71438770356868],
         [56.938671874999955, 28.560109569336163],
         [59.751171874999955, 28.791441606166792],
         [63.354687499999955, 28.868438602384987],
         [66.25507812499995, 29.09908718595617],
         [68.71601562499995, 29.252566612415762],
         [72.31953124999995, 29.17585559226583],
         [75.04414062499995, 29.329220151898383],
         [77.32929687499995, 29.405816116688545],
         [80.49335937499995, 29.482354413243534],
         [82.86640624999995, 29.482354413243534],
         [86.64570312499995, 29.482354413243534],
         [90.24921874999995, 29.405816116688545],
         [94.11640624999995, 29.482354413243534],
         [98.07148437499995, 29.864177632240864],
         [99.74140624999995, 29.864177632240864],
         [102.11445312499995, 29.787929063131017],
         [104.57539062499995, 30.01650002217729],
         [107.47578124999995, 30.01650002217729],
         [109.58515624999995, 30.01650002217729],
         [111.07929687499995, 30.244545391025493],
         [114.33124999999995, 30.244545391025493],
         [116.17695312499995, 30.320443300965046],
         [120.13203124999995, 30.54778416299915],
         [121.53828124999995, 30.62344653838668],
         [124.61445312499995, 30.774593905405794]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var s2_data = ee.ImageCollection("COPERNICUS/S2_SR")
                .filterDate('2019-01-01', '2019-03-01')
                //.filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'not_greater_than', 50)
var elevation = ee.Image("USGS/SRTMGL1_003").select('elevation')

var s2_aot_mean = s2_data.select('AOT').reduce(ee.Reducer.mean()).divide(1000)
var s2_aot_std  = s2_data.select('AOT').reduce(ee.Reducer.stdDev()).divide(1000)
var pkg_vis  = require('users/kongdd/public:pkg_vis.js');
var aot_palette     = pkg_vis.colors.YlGnBu[9];
var terrain_palette = pkg_vis.colors.YlGnBu[9]

var aot_mean_vis = {
  min: 0,
  max: 0.5,
  bands: 'AOT_mean',
  palette: aot_palette
}

var aot_std_vis = {
  min: 0,
  max: 0.2,
  bands: 'AOT_stdDev',
  palette: aot_palette
}

var ele_vis = {
  min: 0,
  max: 6000,
  bands: 'elevation',
  palette: terrain_palette
}
var aot_legend      = pkg_vis.grad_legend(aot_mean_vis, 'AOT MEAN', false)
var aot_std_legend  = pkg_vis.grad_legend(aot_std_vis, 'AOT STD', false)
var ele_legend      = pkg_vis.grad_legend(ele_vis, 'Elevation (m)', false)
pkg_vis.add_lgds([aot_legend, aot_std_legend, ele_legend]);

Map.addLayer(s2_data.select('AOT'), {}, 'Obs', false)
Map.addLayer(s2_aot_mean, aot_mean_vis, 'AOT_MEAN')
Map.addLayer(s2_aot_std,  aot_std_vis,  'AOT_STD')
Map.addLayer(elevation,   ele_vis,      'Elevation')

var profile = geometry.buffer(10)
Map.addLayer(profile)
//print(profile.getInfo())
var ele_aot = ee.Image.cat([elevation.divide(10000.0), s2_aot_mean, s2_aot_std])
                      .updateMask(elevation.mask().and(s2_aot_mean.mask()))
                      .reproject('EPSG:4326', null, res)
var res = 60
var result = ele_aot.reduceRegion(ee.Reducer.toList(), profile, res);
var y = ee.List(result.get('AOT_mean'));
var x = ee.List(result.get('elevation'));
var z = ee.List(result.get('AOT_stdDev'));
var yValues = ee.Array.cat([y, z], 1);
// Make a band correlation chart.
var chart = ui.Chart.array.values(yValues, 0, x)
    .setSeriesNames(['AOT_MEAN', 'AOT_STD'])
    .setOptions({
      title: 'Sen2Cor AOT_MEAN vs. Elevation',
      hAxis: {'title': 'elevation (m)'},
      vAxis: {'title': 'AOT_MEAN & AOT_STD'},
      pointSize: 3,
});
// Print the chart.
//print(chart);
var res = 10
var result = ele_aot.reduceRegion(ee.Reducer.toList(), profile, res);
var feature = ee.Feature(null, result);
// Wrap the Feature in a FeatureCollection for export.
var featureCollection = ee.FeatureCollection([feature]);


// Export the FeatureCollection.
Export.table.toDrive({
  collection: featureCollection,
  description: 'AOT_STD_Elevation',
  fileFormat: 'CSV'
});
    




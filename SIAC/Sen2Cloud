// A sensor invariant Atmospheric Correction (SIAC) GEE version
// v1 -- 2019-05-06
// Author: Fengn Yin, UCL
// Email: ucfafy@ucl.ac.uk
// Github: https://github.com/MarcYin/SIAC
// DOI: https://eartharxiv.org/ps957/
// LICENSE: GNU GENERAL PUBLIC LICENSE V3
var get_3D = function(image, nb, nx, ny){
  var array   = ee.List(image.reduceRegion(ee.Reducer.toList(), image.geometry()).get('b1'))
  var sub_len = array.size().divide(nb)
  var i;
  var j;
  var ret = []
  for (j = 0; j < nb; j++){
    var list_2d = []
    for (i = 0; i < nx; i++) {
      var start = sub_len.multiply(j).add(i*ny)
      var end   = sub_len.multiply(j).add((i+1)*ny)
      var sub = array.slice(start, end)
      list_2d.push(sub)
    }
    ret.push(list_2d)
  }
  return ee.List(ret).reverse()
}

var get_2D = function(image, nb, ny){
  var array   = ee.List(image.reduceRegion(ee.Reducer.toList(), image.geometry()).get('b1'))
  var sub_len = array.size().divide(nb)
  var i;
  var j;
  var list_2d = []
  for (j = 0; j < nb; j++){
    var start = sub_len.multiply(j)
    var end   = sub_len.multiply(j).add(ny)
    var sub = array.slice(start, end)
    list_2d.push(sub)
  }
  return ee.List(list_2d).reverse()
}

// Author: Gennadii Donchyts
// License: Apache 2.0
function shadowMask(toa,cloud){

  // solar geometry (radians)
  var azimuth =ee.Number(toa.get('solar_azimuth')).multiply(Math.PI).divide(180.0).add(ee.Number(0.5).multiply(Math.PI));
  var zenith  =ee.Number(0.5).multiply(Math.PI ).subtract(ee.Number(toa.get('solar_zenith')).multiply(Math.PI).divide(180.0));

  // find where cloud shadows should be based on solar geometry
  var nominalScale = cloud.projection().nominalScale();
  var cloudHeights = ee.List.sequence(200,10000,500);
  var shadows = cloudHeights.map(function(cloudHeight){
    cloudHeight = ee.Number(cloudHeight);
    var shadowVector = zenith.tan().multiply(cloudHeight);
    var x = azimuth.cos().multiply(shadowVector).divide(nominalScale).round();
    var y = azimuth.sin().multiply(shadowVector).divide(nominalScale).round();
    return cloud.changeProj(cloud.projection(), cloud.projection().translate(x, y));
  });
  var potentialShadow = ee.ImageCollection.fromImages(shadows).max();
  
  // shadows are not clouds
  var potentialShadow = potentialShadow.and(cloud.not());
  
  // (modified by Sam Murphy) dark pixel detection 
  var darkPixels = toa.normalizedDifference(['green', 'swir2']).gt(0.25).rename(['dark_pixels']);
  
  // shadows are dark
  var shadow = potentialShadow.and(darkPixels).rename('shadows');
  
  return shadow;
}

var Sen2Cloud_H1_scale  = get_3D(ee.Image('users/marcyinfeng/Sen2Cloud_H1_scale'),  1,  10, 64).get(0)
var Sen2Cloud_H2_scale  = get_3D(ee.Image('users/marcyinfeng/Sen2Cloud_H2_scale'),  1, 64, 64).get(0)
var Sen2Cloud_Out_scale = get_3D(ee.Image('users/marcyinfeng/Sen2Cloud_Out_scale'), 1, 64, 1).get(0)

var Sen2Cloud_H1_offset  = get_2D(ee.Image('users/marcyinfeng/Sen2Cloud_H1_offset'),  1, 64).get(0)
var Sen2Cloud_H2_offset  = get_2D(ee.Image('users/marcyinfeng/Sen2Cloud_H2_offset'),  1, 64).get(0)
var Sen2Cloud_Out_offset = get_2D(ee.Image('users/marcyinfeng/Sen2Cloud_Out_offset'), 1, 1).get(0)


exports.Sen2Cloud_H1_scale  = Sen2Cloud_H1_scale
exports.Sen2Cloud_H2_scale  = Sen2Cloud_H2_scale
exports.Sen2Cloud_Out_scale = Sen2Cloud_Out_scale

exports.Sen2Cloud_H1_offset  = Sen2Cloud_H1_offset
exports.Sen2Cloud_H2_offset  = Sen2Cloud_H2_offset
exports.Sen2Cloud_Out_offset = Sen2Cloud_Out_offset

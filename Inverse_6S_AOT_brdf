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


var Inverse_6S_AOT_brdf_H1_scale  = get_3D(ee.Image('users/marcyinfeng/Inverse_6S_AOT_brdf_H1_scale'),  1, 13, 64).get(0)
var Inverse_6S_AOT_brdf_H2_scale  = get_3D(ee.Image('users/marcyinfeng/Inverse_6S_AOT_brdf_H2_scale'),  1, 64, 64).get(0)
var Inverse_6S_AOT_brdf_Out_scale = get_3D(ee.Image('users/marcyinfeng/Inverse_6S_AOT_brdf_Out_scale'), 1, 64, 1).get(0)

var Inverse_6S_AOT_brdf_H1_offset  = get_2D(ee.Image('users/marcyinfeng/Inverse_6S_AOT_brdf_H1_offset'),  1, 64).get(0)
var Inverse_6S_AOT_brdf_H2_offset  = get_2D(ee.Image('users/marcyinfeng/Inverse_6S_AOT_brdf_H2_offset'),  1, 64).get(0)
var Inverse_6S_AOT_brdf_Out_offset = get_2D(ee.Image('users/marcyinfeng/Inverse_6S_AOT_brdf_Out_offset'), 1, 1).get(0)


exports.Inverse_6S_AOT_brdf_H1_scale  = Inverse_6S_AOT_brdf_H1_scale
exports.Inverse_6S_AOT_brdf_H2_scale  = Inverse_6S_AOT_brdf_H2_scale
exports.Inverse_6S_AOT_brdf_Out_scale = Inverse_6S_AOT_brdf_Out_scale

exports.Inverse_6S_AOT_brdf_H1_offset  = Inverse_6S_AOT_brdf_H1_offset
exports.Inverse_6S_AOT_brdf_H2_offset  = Inverse_6S_AOT_brdf_H2_offset
exports.Inverse_6S_AOT_brdf_Out_offset = Inverse_6S_AOT_brdf_Out_offset


// A sensor invariant Atmospheric Correction (SIAC) GEE version
// v1 -- 2019-05-06
// Author: Fengn Yin, UCL
// Email: ucfafy@ucl.ac.uk
// Github: https://github.com/MarcYin/SIAC
// DOI: https://eartharxiv.org/ps957/
// LICENSE: GNU GENERAL PUBLIC LICENSE V3
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

var parse_out = function(image){
  var dict = ee.Dictionary(image.reduceRegion(ee.Reducer.toList(), image.geometry()))
  var ret  = ee.List([dict.get('b1'), dict.get('b2'), dict.get('b3'), dict.get('b4'),  dict.get('b5'),  dict.get('b6'), 
                      dict.get('b7'), dict.get('b8'), dict.get('b9'), dict.get('b10'), dict.get('b11')])
  return ret
}

var S2A_xap_H1_offset  = get_2D(ee.Image('users/marcyinfeng/S2A_xap_H1_offset'),  1, 128).get(0)
var S2A_xap_H2_offset  = get_2D(ee.Image('users/marcyinfeng/S2A_xap_H2_offset'),  1, 128).get(0)
var S2A_xap_Out_offset = parse_out(ee.Image('users/marcyinfeng/S2A_shared_xap_Out_offset'))


var S2A_xbp_H1_offset  = get_2D(ee.Image('users/marcyinfeng/S2A_xbp_H1_offset'),  1, 128).get(0)
var S2A_xbp_H2_offset  = get_2D(ee.Image('users/marcyinfeng/S2A_xbp_H2_offset'),  1, 128).get(0)
var S2A_xbp_Out_offset = parse_out(ee.Image('users/marcyinfeng/S2A_shared_xbp_Out_offset'))

var S2A_xcp_H1_offset  = get_2D(ee.Image('users/marcyinfeng/S2A_xcp_H1_offset'),  1, 128).get(0)
var S2A_xcp_H2_offset  = get_2D(ee.Image('users/marcyinfeng/S2A_xcp_H2_offset'),  1, 128).get(0)
var S2A_xcp_Out_offset = parse_out(ee.Image('users/marcyinfeng/S2A_shared_xcp_Out_offset'))

var S2B_xap_H1_offset  = get_2D(ee.Image('users/marcyinfeng/S2B_xap_H1_offset'),  1, 128).get(0)
var S2B_xap_H2_offset  = get_2D(ee.Image('users/marcyinfeng/S2B_xap_H2_offset'),  1, 128).get(0)
var S2B_xap_Out_offset = parse_out(ee.Image('users/marcyinfeng/S2B_shared_xap_Out_offset'))

var S2B_xbp_H1_offset  = get_2D(ee.Image('users/marcyinfeng/S2B_xbp_H1_offset'),  1, 128).get(0)
var S2B_xbp_H2_offset  = get_2D(ee.Image('users/marcyinfeng/S2B_xbp_H2_offset'),  1, 128).get(0)
var S2B_xbp_Out_offset = parse_out(ee.Image('users/marcyinfeng/S2B_shared_xbp_Out_offset'))

var S2B_xcp_H1_offset  = get_2D(ee.Image('users/marcyinfeng/S2B_xcp_H1_offset'),  1, 128).get(0)
var S2B_xcp_H2_offset  = get_2D(ee.Image('users/marcyinfeng/S2B_xcp_H2_offset'),  1, 128).get(0)
var S2B_xcp_Out_offset = parse_out(ee.Image('users/marcyinfeng/S2B_shared_xcp_Out_offset'))


exports.S2A_xap_H1_offset  =  S2A_xap_H1_offset
exports.S2A_xap_H2_offset  =  S2A_xap_H2_offset
exports.S2A_xap_Out_offset = S2A_xap_Out_offset

exports.S2A_xbp_H1_offset  =  S2A_xbp_H1_offset
exports.S2A_xbp_H2_offset  =  S2A_xbp_H2_offset
exports.S2A_xbp_Out_offset = S2A_xbp_Out_offset

exports.S2A_xcp_H1_offset  =  S2A_xcp_H1_offset
exports.S2A_xcp_H2_offset  =  S2A_xcp_H2_offset
exports.S2A_xcp_Out_offset = S2A_xcp_Out_offset

exports.S2B_xap_H1_offset  =  S2B_xap_H1_offset
exports.S2B_xap_H2_offset  =  S2B_xap_H2_offset
exports.S2B_xap_Out_offset = S2B_xap_Out_offset

exports.S2B_xbp_H1_offset  =  S2B_xbp_H1_offset
exports.S2B_xbp_H2_offset  =  S2B_xbp_H2_offset
exports.S2B_xbp_Out_offset = S2B_xbp_Out_offset

exports.S2B_xcp_H1_offset  =  S2B_xcp_H1_offset
exports.S2B_xcp_H2_offset  =  S2B_xcp_H2_offset
exports.S2B_xcp_Out_offset = S2B_xcp_Out_offset


// A sensor invariant Atmospheric Correction (SIAC) GEE version
// v1 -- 2019-05-06
// Author: Fengn Yin, UCL
// Email: ucfafy@ucl.ac.uk
// Github: https://github.com/MarcYin/SIAC
// DOI: https://eartharxiv.org/ps957/
// LICENSE: GNU GENERAL PUBLIC LICENSE V3
var predict = function(image, H1_scale, H1_offset, H2_scale, H2_offset, Out_scale, Out_offset){
  var arrayImage1D = image.toArray()
  var arrayImage2D = arrayImage1D.toArray(1);
  var imageAxis = 0;
  var bandAxis  = 1;
  var arrayLength = arrayImage2D.arrayLength(imageAxis);
  arrayImage2D    = arrayImage2D
  var h1  = arrayImage2D.arrayTranspose().matrixMultiply(ee.Image(ee.Array(H1_scale))).add(ee.Image(ee.Array(H1_offset)).toArray(1).arrayTranspose())
  var in1 = h1.max(0)
  var h2  = in1.matrixMultiply(ee.Image(ee.Array(H2_scale))).add(ee.Image(ee.Array(H2_offset)).toArray(1).arrayTranspose())
  var in2 = h2.max(0)
  var oup = in2.matrixMultiply(ee.Image(ee.Array(Out_scale)))//.toArray().toArray(1).arrayTranspose()
  var out = oup.arrayProject([0])
               .arrayFlatten([['xx']])
               .add(ee.Image(ee.Number(Out_offset)))

  return out
}
exports.predict = predict
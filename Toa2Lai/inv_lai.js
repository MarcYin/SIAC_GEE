var tnn = require('users/marcyinfeng/SIAC/:/Two_NN')
var prosail = require('users/marcyinfeng/Toa2Lai/:/Prosail')
var siac_processor = require('users/marcyinfeng/SIAC/:/AC_processor')

var inv_prosail = function(image){
  image     = ee.Image(image)
  var geom  = image.geometry()
  var image_date = image.date()
  var projection = image.select('B2').projection()
  var crs = projection.crs()
  var boa = siac_processor.get_boa(image)
  var saa  = ee.Image.constant(ee.Number(image.get('MEAN_SOLAR_AZIMUTH_ANGLE'))).rename('saa')
  var sza  = ee.Image.constant(ee.Number(image.get('MEAN_SOLAR_ZENITH_ANGLE' ))).rename('sza')
  var vaa  = ee.Image.constant(ee.Number(image.get('MEAN_INCIDENCE_AZIMUTH_ANGLE_B2'))).rename('vaa')
  var vza  = ee.Image.constant(ee.Number(image.get('MEAN_INCIDENCE_ZENITH_ANGLE_B2' ))).rename('vza')
  var raa  = vaa.subtract(saa)
  var deg2rad = ee.Number(Math.PI).divide(ee.Number(180.0))
  var cos_sza = (sza.multiply(deg2rad)).cos()
  var cos_vza = (vza.multiply(deg2rad)).cos()
  var cos_raa = (raa.multiply(deg2rad)).cos()
  var name     = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A',  'B11', 'B12']
  var new_name = ['B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08', 'B8A',  'B11', 'B12']
  var prosail_bands = ['B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B8A']
  var prosail_inputs = ee.Image.cat([boa.select(name, new_name).select(prosail_bands), 
                                     cos_sza, cos_vza, cos_raa])
                      
  var H1_scale = prosail.Prosail_H1_scale
  var H2_scale = prosail.Prosail_H2_scale
  var Out_scale = prosail.Prosail_Out_scale
                      
  var H1_offset = prosail.Prosail_H1_offset
  var H2_offset = prosail.Prosail_H2_offset
  var Out_offset = prosail.Prosail_Out_offset
                      
  var arrayImage1D = prosail_inputs.toArray()
  var arrayImage2D = arrayImage1D.toArray(1);
  var imageAxis = 0;  
  var bandAxis  = 1;  
  var arrayLength = arrayImage2D.arrayLength(imageAxis);
  arrayImage2D    = arrayImage2D
  var h1  = arrayImage2D.arrayTranspose().matrixMultiply(ee.Image(ee.Array(H1_scale))).add(ee.Image(ee.Array(H1_offset)).toArray(1).arrayTranspose())
  var in1 = h1.max(0) 
  var h2  = in1.matrixMultiply(ee.Image(ee.Array(H2_scale))).add(ee.Image(ee.Array(H2_offset)).toArray(1).arrayTranspose())
  var in2 = h2.max(0) 
  var oup = in2.matrixMultiply(ee.Image(ee.Array(Out_scale)).toArray(1))
  var out = oup.add(ee.Image(ee.Array(Out_offset.get(0))).toArray(1).arrayTranspose())
               .arrayProject([1])
               .arrayFlatten([['Lai']])
  var Lai    = out.select('Lai').log().multiply(-2).multiply(100).toInt()
  return Lai          
}                     
                      
var id = 'S2A_MSIL1C_20170607T030541_N0205_R075_T50SLG_20170607T031648'
var image = ee.ImageCollection('COPERNICUS/S2').filterMetadata('PRODUCT_ID', 'equals', id).first()
var region = JSON.stringify(image.select(0).geometry().bounds().getInfo())
//var image = get_boa(image)
var image = inv_prosail(image)
var json  = ee.Serializer.toJSON(image.select(0))
/*var fs = require("fs");
print(json)           
fs.writeFile("temp.txt", json, (err) => {
  if (err) console.log(err);
  console.log("Successfully Written to File.");
});                   
*/                    
var params = {        
  json:json,          
  type:'EXPORT_IMAGE',
  description:id + '_lai',
  region:region,      
  scale:10,           
  maxPixels: 1e13,    
  driveFileNamePrefix:id + '_lai'
}                     
var taskId = ee.data.newTaskId(1)
                      
let deasync = require('deasync')
                      
let done = false      
                      
ee.data.startProcessing(taskId, params, () => { done = true })
                      
while(!done) {        
  deasync.sleep(100)  
} 
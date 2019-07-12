// A sensor invariant Atmospheric Correction (SIAC) GEE version
// v1 -- 2019-05-06
// Author: Fengn Yin, UCL
// Email: ucfafy@ucl.ac.uk
// Github: https://github.com/MarcYin/SIAC
// DOI: https://eartharxiv.org/ps957/
// LICENSE: GNU GENERAL PUBLIC LICENSE V3
var mcd43_names = ['BRDF_Albedo_Parameters_Band1_iso', 
                   'BRDF_Albedo_Parameters_Band2_iso', 
                   'BRDF_Albedo_Parameters_Band3_iso', 
                   'BRDF_Albedo_Parameters_Band4_iso', 
                   'BRDF_Albedo_Parameters_Band6_iso', 
                   'BRDF_Albedo_Parameters_Band7_iso',
                   'BRDF_Albedo_Parameters_Band1_vol', 
                   'BRDF_Albedo_Parameters_Band2_vol', 
                   'BRDF_Albedo_Parameters_Band3_vol', 
                   'BRDF_Albedo_Parameters_Band4_vol',
                   'BRDF_Albedo_Parameters_Band6_vol', 
                   'BRDF_Albedo_Parameters_Band7_vol', 
                   'BRDF_Albedo_Parameters_Band1_geo', 
                   'BRDF_Albedo_Parameters_Band2_geo', 
                   'BRDF_Albedo_Parameters_Band3_geo', 
                   'BRDF_Albedo_Parameters_Band4_geo', 
                   'BRDF_Albedo_Parameters_Band6_geo', 
                   'BRDF_Albedo_Parameters_Band7_geo']
function interp_mcd43a1(image){
    var T_start = image.date().advance(-25, 'day')
    var T_end   = image.date().advance( 25, 'day')
    var geom    = image.geometry()
    var date    = image.date()
    var update_mask = function(image){
      // var mcd43_mask = image.select(mcd43_names.slice(18,24)).lt(3)
      //                       .toInt().reduce(ee.Reducer.allNonZero())
      image = image
              // .updateMask(mcd43_mask)
              .multiply(0.001)
              .set({'system:time_start': image.get('system:time_start')})
              .copyProperties(image)
      return image
    }
    var mcd43a1 = ee.ImageCollection('MODIS/006/MCD43A1')
                    .filterDate(T_start, T_end)
                    .select(mcd43_names)
                    .map(update_mask)
    
    var fitted_mcd43a1 = mcd43a1.median()
    // var this_mcd43a1   = ee.ImageCollection('MODIS/006/MCD43A1')
    //                       .filterDate(image.date(), image.date().advance(1, 'day'))
    //                       .select(mcd43_names)
    //                       .first()
    // var mcd43_mask    = this_mcd43a1.select(mcd43_names.slice(18,24)).lt(1)
    //                         .toInt().reduce(ee.Reducer.allNonZero())
    // var this_mask     = this_mcd43a1.mask()
    // var filled_mcd43  = this_mcd43a1.unmask().where(this_mask.eq(0).or(mcd43_mask.eq(0)), fitted_mcd43a1)
  return fitted_mcd43a1.select(mcd43_names.slice(0,18))
}
exports.interp_mcd43a1 = interp_mcd43a1
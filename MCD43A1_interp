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
                   'BRDF_Albedo_Parameters_Band7_geo',
                   'BRDF_Albedo_Band_Mandatory_Quality_Band1',
                   'BRDF_Albedo_Band_Mandatory_Quality_Band2',
                   'BRDF_Albedo_Band_Mandatory_Quality_Band3',
                   'BRDF_Albedo_Band_Mandatory_Quality_Band4',
                   'BRDF_Albedo_Band_Mandatory_Quality_Band6',
                   'BRDF_Albedo_Band_Mandatory_Quality_Band7']
function interp_mcd43a1(image){
    var T_start = image.date().advance(-15, 'day')
    var T_end   = image.date().advance( 15, 'day')
    var geom    = image.geometry()
    var date    = image.date()
    var update_mask = function(image){
      var mcd43_mask = image.select(mcd43_names.slice(18,24)).lt(3)
                            .toInt().reduce(ee.Reducer.allNonZero())
      image = image
              .updateMask(mcd43_mask)
              .multiply(0.001)
              .set({'system:time_start': image.get('system:time_start')})
              .copyProperties(image)
      return image
    }
    var mcd43a1 = ee.ImageCollection('MODIS/006/MCD43A1')
                    .filterDate(T_start, T_end)
                    .select(mcd43_names)
                    .map(update_mask)
                    
    var dependent = mcd43_names.slice(0,18)
    
    // Function to get a sequence of band names.mcd43_names.slice(0,18)
    var constructBandNames = function(base, list) {
      return ee.List(list).map(function(i) {
        return ee.String(base).cat(ee.Number(i).int());
      });
    };
    
    // Independent variables.
    var independents = ee.List(['constant', 't'])
    // Function to add a time band.
    var addDependents = function(image) {
      // Compute time in fractional days since the epoch
      var days = ee.Image(image.date().difference(date, 'day')).rename('t');
      var constant = ee.Image(1);
      return image.addBands(constant)
                  .addBands(days.float())
    };
    
    // Filter to the area of interest, mask clouds, add variables.
    //var mcd43a1 = mcd43a1.map(addDependents)
    var Trend = mcd43a1
                .select(independents.cat(dependent))
                .reduce(ee.Reducer.robustLinearRegression(independents.length(), 18));
    
    // Turn the array image into a multi-band image of coefficients.
    var harmonicTrendCoefficients = Trend.select('coefficients')
                                         .arrayFlatten([independents, dependent]);
    var simu_bands = function(image) {
        var i
        var fitted_bands = []
        var diff_bands   = []
        for (i = dependent.length - 1; i >= 0; i--) {
          var band = dependent[i];
          var simu = image.select('constant').multiply(harmonicTrendCoefficients.select('constant_' + band)).add(
                     image.select('t'       ).multiply(harmonicTrendCoefficients.select('t_'        + band)))
                     .rename('fitted_' + band)
          fitted_bands.push(simu)
        }
      return image.addBands(fitted_bands).addBands(diff_bands)
      }
    //var fitted_mcd43a1 = mcd43a1.map(simu_bands).filterDate(date.advance(-1, 'day'), date).first()
    var fitted_mcd43a1 = mcd43a1.median()
    var this_mcd43a1   = ee.ImageCollection('MODIS/006/MCD43A1')
                           .filterDate(image.date(), image.date().advance(1, 'day'))
                           .select(mcd43_names)
                           .first()
    var mcd43_mask    = this_mcd43a1.select(mcd43_names.slice(18,24)).lt(1)
                            .toInt().reduce(ee.Reducer.allNonZero())
    var this_mask     = this_mcd43a1.mask()
    var filled_mcd43  = this_mcd43a1.unmask().where(this_mask.eq(0).or(mcd43_mask.eq(0)), fitted_mcd43a1)
  return fitted_mcd43a1.select(mcd43_names.slice(0,18))
}
exports.interp_mcd43a1 = interp_mcd43a1
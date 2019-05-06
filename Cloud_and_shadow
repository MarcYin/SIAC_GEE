var s2_bands = ['B2', 'B3', 'B4', 'B8', 'B11', 'B12', 'B10', 'B8A', 'B7']
var l8_bands = ['B2', 'B3', 'B4', 'B5', 'B6',  'B7',  'B9',  'B10', 'B8']
var l7_bands = ['B1', 'B2', 'B3', 'B4', 'B5',  'B7']
var common_bands = ['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2', 'CIRRUS', 'EB1', 'EB2'] 
var elevation = ee.Image('USGS/SRTMGL1_003').select('elevation');
var slope = ee.Terrain.slope(elevation).rename('slope')
function add_dem(image){
  var ele  = elevation.clip(image.geometry())
  var slop =     slope.clip(image.geometry())
  slop = slop.where(slop.mask().eq(0), 0).unmask()
  ele  =  ele.where(  ele.mask().eq(0), 0).unmask()
  return image.addBands(ele).addBands(slop)
}

function PCP_Sentinel2(image){
  var NDSI = image.normalizedDifference(['GREEN', 'SWIR1']).rename('NDSI');
  var NDVI = image.normalizedDifference(['NIR',     'RED']).rename('NDVI');
  var basic_test = image.select('SWIR2').gt(0.03).and(NDSI.lt(0.8)).and(NDVI.lt(0.8))
  var mean_vis   = (image.select('BLUE').add(image.select('GREEN')).add(image.select('RED'))).divide(3)
  var whiteness = ((image.select('BLUE' ).subtract(mean_vis)).divide(mean_vis)).abs()
             .add(((image.select('GREEN').subtract(mean_vis)).divide(mean_vis)).abs())
             .add(((image.select('RED'  ).subtract(mean_vis)).divide(mean_vis)).abs())
             .rename('WHITENESS')
  var whiteness_test =  whiteness.lt(0.7)
  var HOT_test = (image.select('BLUE' ).subtract(image.select('RED').multiply(0.5)).subtract(0.08)).gt(0)
  var NIR_SWIR1_Test =  (image.select('NIR').divide(image.select('SWIR1'))).gt(0.75)
  var snow       = NDSI.gt(0.15).and(image.select('SWIR1').gt(0.1100))
                                .and(image.select('NIR'  ).gt(0.1000)).rename('snow')
                                
  var Water_Test = (NDVI.lt(0.01).and(image.select('NIR').lt(0.11)))
                .or(NDVI.lt( 0.1).and(image.select('NIR').lt(0.05)))
                //.and(image.select('slope').lt(10))
                .rename('WATER_TEST')
  // nomalised by reflectance and elevation
  var NIR = image.select('NIR')
  NIR = NIR.where(NIR.lt(0.12), 0.12)
  /*var CirrusCloudProbability = (image.select('CIRRUS').divide(NIR.divide(0.12))
                                                      .subtract(image.select('elevation').multiply(0.000018)))
                                                      .divide(0.04).rename('CirrusProb')
                                                      
  CirrusCloudProbability = CirrusCloudProbability.where(CirrusCloudProbability.lt(0), 0)
  var CirrusTest = CirrusCloudProbability.gt(0.25)*/
  var pcp = basic_test.and(whiteness_test).and(HOT_test).and(NIR_SWIR1_Test).rename('PCP')
  return image.addBands(pcp)
               .addBands(Water_Test)
               .addBands(whiteness)
               .addBands(NDVI)
               .addBands(NDSI)
               .addBands(snow)
               //.addBands(CirrusCloudProbability)//.updateMask(pcp.eq(0))
}
function close(image){
  return image.connectedComponents(ee.Kernel.plus(1), 256);
}

function CDI(image){
  var R_8A_8 = image.select('NIR').divide(image.select('EB1')).rename('R_8A_8'); 
  var R_8A_7 = image.select('EB2').divide(image.select('EB1')).rename('R_8A_7');
  
  var V_8A_8 = R_8A_8.reduceNeighborhood({
                      reducer: ee.Reducer.variance(),
                      //reducer: ee.Reducer.stdDev(),
                      kernel: ee.Kernel.square({radius: 7, units: 'pixels'})
    
  });
  var V_8A_7 = R_8A_7.reduceNeighborhood({
                      reducer: ee.Reducer.variance(),
                      //reducer: ee.Reducer.stdDev(),
                      kernel: ee.Kernel.square({radius: 7, units: 'pixels'}),
  });

  var cdi = (V_8A_7.subtract(V_8A_8)).divide(V_8A_7.add(V_8A_8)).rename('CDI')
  var select = image.select('PCP').and(cdi.lt(-0.25))
  //var kernel1 = ee.Kernel.circle({radius: 3, units: 'pixels'})
  //var kernel2 = ee.Kernel.circle({radius: 9, units: 'pixels'})
  var CDI_Cloud = select
                        //.focal_min({kernel: kernel1})
                        //.focal_max({kernel: kernel2})
                        //.and(cdi.lt(-0.25))
                        .rename('CDI_Cloud')
  return image.addBands([CDI_Cloud, cdi]).updateMask(CDI_Cloud.eq(0))//.select(common_bands.slice(0,7)) 
}

function s2_scale(image){
  return image.divide(10000).cast({'BLUE'  : 'float'})
                            .cast({'GREEN' : 'float'})
                            .cast({'RED'   : 'float'})
                            .cast({'NIR'   : 'float'})
                            .cast({'SWIR1' : 'float'})
                            .cast({'SWIR2' : 'float'})
                            .cast({'CIRRUS': 'float'})
                            .cast({'EB1'   : 'float'})
                            .cast({'EB2'   : 'float'})
                            .clip(image.geometry())
                            .copyProperties(image)
                            .set({'system:time_start': image.get('system:time_start')})
}

function L8_QA_clouds(image) {
  var qa = image.select('BQA');

  // Bit 4 is cloud.
  var cloudBitMask  = 1 << 4;
  var cirrusBitMask = 1 << 6;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = (qa.bitwiseAnd(cloudBitMask).eq(0)
         .and(qa.bitwiseAnd(cirrusBitMask).eq(0)))
         .eq(1)
         .rename('QA_cloud')
  return image.updateMask(mask)
}

function get_shadow(image){
  var NIR  = image.select('NIR').multiply(10000).int()
  var SWIR = image.select('SWIR1').multiply(10000).int()
  //var ClearSkyLand = image.select('ClearSkyLand')
  var NIR_backg = NIR
                //.updateMask(ClearSkyLand)
                .reduceRegion({
                reducer: ee.Reducer.percentile([17.5]),
                geometry: image.geometry(),
                scale:30, 
                maxPixels: 1e9
              }).get('NIR')
              
  var SWIR_backg = SWIR
                //.updateMask(ClearSkyLand)
                .reduceRegion({
                reducer: ee.Reducer.percentile([17.5]),
                geometry: image.geometry(),
                scale:30, 
                maxPixels: 1e9
              }).get('SWIR1')
  NIR_backg = ee.Number(ee.Algorithms.If(
              NIR_backg&1,
              NIR_backg,
              0
    ))
    
  SWIR_backg = ee.Number(ee.Algorithms.If(
              SWIR_backg&1,
              SWIR_backg,
              0
    ))
  NIR =  NIR.where( NIR.mask().eq(0),  NIR_backg)
  NIR = ee.Algorithms.FMask.fillMinima( NIR)
  NIR = NIR.subtract(image.select('NIR'))
  SWIR = SWIR.where(SWIR.mask().eq(0), SWIR_backg)
  SWIR = ee.Algorithms.FMask.fillMinima(SWIR)
  SWIR = SWIR.subtract(image.select('SWIR1'))
  var shadow_prob = NIR.min(SWIR).rename('shadow_prob')
  return image.addBands(shadow_prob)
}

var image = ee.Image('COPERNICUS/S2/20171215T110441_20171215T110516_T31UCT')
//var image = ee.Image('COPERNICUS/S2/20171123T111349_20171123T111629_T31UCT')
//var poi = ee.Geometry.Point([-0.13, 52.0941]);
var T_start = image.date().advance(-25, 'day')
var T_end   = image.date().advance( 25, 'day')
var roi = image.geometry()
/*var roi = ee.Geometry.Polygon(
        [[[-0.36904216841207926, 51.30329306201848],
          [0.15280841752542074, 51.493501914887226],
          [0.11160968705667074, 51.6761082318629],
          [-0.42122722700582926, 51.669295029013526]]]);*/
var l8_dataset = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
                  .filterDate(T_start, T_end)
                  .filterBounds(image.geometry())
                  .map(L8_QA_clouds)
                  .select(l8_bands, common_bands)

var s2_dataset = ee.ImageCollection('COPERNICUS/S2')
                  .filterDate(T_start, T_end)
                  .filterBounds(image.geometry())
                  .select(s2_bands, common_bands)
                  .map(s2_scale)
                  .map(PCP_Sentinel2)
                  .map(CDI)
//var this_image = CDI(PCP_Sentinel2(ee.Image(s2_scale(image.select(s2_bands, common_bands)))))
var this_image = s2_dataset.filterMetadata('system:index', 'equals', image.get('system:index')).first()
var NDSI      = ee.Image(this_image.select('NDSI')).unmask()
var PCP       = ee.Image(this_image.select('PCP')).unmask()
var CDI_cloud = ee.Image(this_image.select('CDI_Cloud')).unmask()
var snow      = ee.Image(this_image.select('snow')).unmask()
var CDI       = ee.Image(this_image.select('CDI')).unmask()
var merged_datasets = s2_dataset.select(common_bands.slice(0,6))
               .merge(l8_dataset.select(common_bands.slice(0,6)))
var rgbVis = {
  min: 0.0,
  max: 0.4,
  bands: ['RED', 'GREEN', 'BLUE'],
};
//print(s2_dataset.filterBounds(roi).select(common_bands.slice(0,6)))//.filterDate(img.date(), '2018-01-04'))

// The dependent variable we are modeling.
var dependent = common_bands.slice(0,6)

// Function to get a sequence of band names.
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
  var hours = image.date().difference('2015-01-01', 'hour');
  var timeRadians = ee.Image(hours).rename('t');
  var constant = ee.Image(1);
  return image.addBands(constant).addBands(timeRadians.float());
};

// Filter to the area of interest, mask clouds, add variables.
var harmonicLandsat = merged_datasets
  .filterBounds(roi)
  .map(addDependents)

// The output of the regression reduction is a 2x6 array image.
var Trend = harmonicLandsat
  .select(independents.cat(dependent))
  //.reduce(ee.Reducer.robustLinearRegression(independents.length(), 6));
  .reduce(ee.Reducer.robustLinearRegression(independents.length(), 6));

// Turn the array image into a multi-band image of coefficients.
var TrendCoefficients = Trend.select('coefficients')
  .arrayFlatten([independents, dependent]);

var simu_bands = function(image) {
    var i
    var fitted_bands = []
    var diff_bands   = []
    for (i = dependent.length - 1; i >= 0; i--) {
      var band = dependent[i];
      var simu = image.select('constant').multiply(TrendCoefficients.select('constant_' + band)).add(
                 image.select('t'       ).multiply(TrendCoefficients.select('t_'        + band)))
                      .rename('fitted_' + band)
                      .clip(image.geometry())
      diff_bands.push(image.select(band).subtract(simu).rename('diff_' + band))
      fitted_bands.push(simu)
      
    }
  return image.addBands(fitted_bands).addBands(diff_bands)
  }
var fittedHarmonic = harmonicLandsat.map(simu_bands);
// Plot the fitted model and the original data at the ROI
/*print(ui.Chart.image.series(fittedHarmonic.select(['fitted_BLUE','BLUE', 
                                                   //'fitted_GREEN','GREEN',
                                                   //'fitted_RED','RED',
                                                   //'fitted_NIR','NIR',
                                                   //'fitted_SWIR1','SWIR1',
                                                   //'fitted_SWIR2','SWIR2',
                                                   ]), poi, ee.Reducer.mean(), 30)
      .setOptions({
      title: 'Harmonic model: original and fitted values',
      lineWidth: 1,
      pointSize: 3,
  }));*/

var get_simu = function(image) {
  image =  ee.Image(
          image.select(s2_bands.slice(0,6), common_bands.slice(0,6))
          .divide(10000)
          .clip(image.geometry())
          .copyProperties(image)
          .set({'system:time_start': image.get('system:time_start')})
          )
  image = addDependents(image)
  return simu_bands(image)}
  
image = get_simu(image)
/*var fitVis = {
  min: 0.0,
  max: 0.4,
  bands: ['fitted_RED', 'fitted_GREEN', 'fitted_BLUE'],
};
var rgbVis = {
  min: 0.0,
  max: 0.4,
  bands: ['RED', 'GREEN', 'BLUE'],
};


Map.addLayer(img.select(fitVis['bands']), fitVis, 'mosaic')
Map.addLayer(img.select(rgbVis['bands']), rgbVis, 'TOA')
Map.centerObject(roi, 9)*/
var diff_bands = ['diff_RED', 'diff_GREEN', 'diff_BLUE', 'diff_NIR', 'diff_SWIR1', 'diff_SWIR2']
var diff = image.select(diff_bands)//.or(img.select(diff_bands).lt(-0.025))


/*
Export.image.toAsset({
  image: diff,
  description: fname,
  assetId: fname + '_cloud',
  scale: 30,
  region: img.geometry(),
  maxPixels: 1e10,
});*/
//print(img.select('PotentialCloud').getInfo())
//var diff = (img.select('BLUE').subtract(img.select('diff_BLUE')))//.multiply(100).toInt()
//Map.addLayer(diff.gt(0.05))

/*var diffVis = {
  min: -0.1,
  max:  0.1,
  bands: ['diff_RED', 'diff_GREEN', 'diff_BLUE'],
};

Map.addLayer(img.select(diff_bands), diffVis, 'diff')*/
var diff_mean = diff.select('diff_RED')
                   .add(diff.select('diff_GREEN'))
                   .add(diff.select('diff_BLUE' ))
                   .divide(3)
                   .rename('diff_mean')
image = image.addBands(diff_mean)                   

//var snow_thresh_1 = 0.1
//var snow = image.select('snow')
var bad_pixel = image.select('fitted_BLUE' ).lt(0.0001)
            .or(image.select('fitted_GREEN').lt(0.0001))
            .or(image.select('fitted_RED'  ).lt(0.0001))
            .or(image.select('fitted_NIR'  ).lt(0.0001))
            .or(image.select('fitted_SWIR1').lt(0.0001))
            .or(image.select('fitted_SWIR2').lt(0.0001))
            
var kernel1 = ee.Kernel.circle({radius: 60, units:  'meters'})
var kernel2 = ee.Kernel.circle({radius: 120, units: 'meters'})
var bad_pixel_cloud = bad_pixel.eq(1).and(CDI_cloud)
var land_cloud = (diff_mean.gt(0.025)).and(snow.eq(0))
                                      .and(bad_pixel.eq(0))
                                      .and(CDI.lt(0.1))
                                //.and(diff_mean.gt(0.01))
var potencial_cloud = (diff_mean.gt(0.05)).and(NDSI.lt(0.5))
                                      .and(bad_pixel.eq(0))
                                      //.and(CDI.lt(0.1))
                                      //.focal_min({kernel: kernel1})
                                      //.focal_max({kernel: kernel2})
//var snow_thresh_2 = 0.2
// snow or cloud but with change
//var land_or_snow_cloud = (diff_mean.gt(0.025)).and(NDSI.gt(snow_thresh_1).and(NDSI.lte(snow_thresh_2)))
                                //.focal_min({kernel: kernel1})
//                                .focal_max({kernel: kernel2})
//                                .and(CDI_cloud)
// definitely over snow(cloud can be darker than snow)                             
var snow_cloud = (diff_mean.gt(0.025).or(diff_mean.lt(-0.025))).and(snow.eq(1)).and(CDI_cloud)
                                
var cloud      = land_cloud.or(snow_cloud)
                           .or(potencial_cloud)
                           .or(bad_pixel_cloud)
                           .focal_min({kernel: kernel1})
                           .focal_max({kernel: kernel2})
                           .rename('cloud')
image = get_shadow(image)
var shadow = diff_mean.lt(-0.025).and(image.select('shadow_prob').gt(200)).rename('shadow')
/*var shadow = image.select('shadow_prob').gt(200).rename('shadow')

var NT = image.select('BLUE').multiply(0.0).rename('B10').divide(100.0).add(0.3)
var img = ee.Image.cat([cloud, shadow, NT])
img.set({'SUN_AZIMUTH' : image.get('MEAN_SOLAR_AZIMUTH_ANGLE'), 
        'SUN_ELEVATION': image.get('MEAN_SOLAR_ZENITH_ANGLE'),
        'ROLL_ANGLE'   : image.get('MEAN_INCIDENCE_AZIMUTH_ANGLE_B2'),
        'ORIENTATION'  : 'NORTH_UP',
        
})
shadow = ee.Algorithms.FMask.matchClouds(img, cloud, shadow, NT,
                                           0.1,
                                           0.5
                                          ).rename('shadow')*/
image = image.addBands(shadow)
/*var residuals = Trend.select('residuals')
                .arrayFlatten([dependent])
                .multiply(10)
                .clip(image.geometry())
var rgbVis = {
      min: 0.0,
      max: 0.2,
      bands: ['RED', 'GREEN', 'BLUE'],
    };

print(residuals)
Map.addLayer(residuals)*/
/*var snow_thresh = 0.1
var T_cloud = (diff_mean.gt(0.025)).and(NDSI.lte(snow_thresh))
                                //.focal_min({kernel: kernel1})
                                .focal_max({kernel: kernel2})
                                //.and(diff_mean.gt(0.01))
var snow_cloud = T_cloud.and(NDSI.gt(snow_thresh)).and(CDI_cloud)
                                
var cloud      = T_cloud.or(snow_cloud).rename('cloud').toInt()*/

//img = get_cloud(img)
image = image.addBands([cloud, snow, NDSI, CDI_cloud, CDI])
var cloudVis = {
  min: 0,
  max: 1,
  bands: ['cloud'],
  opacity: 0.4,
};
var fitVis = {
      min: 0.0,
      max: 0.2,
      bands: ['fitted_RED', 'fitted_GREEN', 'fitted_BLUE'],
    };
var rgbVis = {
      min: 0.0,
      max: 0.2,
      bands: ['RED', 'GREEN', 'BLUE'],
    };
var shadowVis = {
  min: 0,
  max: 1,
  bands: ['shadow'],
  opacity: 0.4,
};
var shadowpVis = {
  min: 0,
  max: 1,
  bands: ['shadow_prob'],
  opacity: 0.4,
};
var geom =
    ee.Geometry.Polygon(
        [[[-0.5284033061184346, 51.7242496950846],
          [-0.5284033061184346, 51.20235218017352],
          [0.26535890091281544, 51.20235218017352],
          [0.26535890091281544, 51.7242496950846]]], null, false);
print(s2_dataset.filterBounds(geom))
Map.addLayer(image.select(fitVis['bands']), fitVis, 'mosaic')
Map.addLayer(image.select(rgbVis['bands']), rgbVis, 'TOA')
Map.addLayer(image.select('cloud'), cloudVis, 'cloud')
Map.addLayer(image.select('shadow'), shadowVis, 'shadow')
Map.addLayer(image.select('shadow_prob').divide(10000), shadowpVis, 'shadowp')
Map.centerObject(image, 10)
Map.addLayer(image, {}, 'image', false)

var fname = ee.String(image.get('PRODUCT_ID')).getInfo()
var diff_bands = ['diff_RED', 'diff_GREEN', 'diff_BLUE', 
                  'diff_NIR', 'diff_SWIR1', 'diff_SWIR2', 'cloud']
/*
Export.image.toDrive({
  image: img.select(diff_bands).multiply(100).toInt(),
  description: fname + '_diff',
  scale: 30,
  fileFormat: 'GeoTIFF',
  folder:'S2_CLOUD',
  region: img.geometry(),
  maxPixels: 1e10,
  formatOptions: {
    cloudOptimized: true
  }
})*/
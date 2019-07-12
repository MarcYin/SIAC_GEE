var makeBRDFKernels = function(image) {
  /*
    Inputs:

        SolarZenith
        SensorZenith
        SensorAzimuth
        SolarAzimuth
        sur_refl_b0?

        as int. Angle in degrees = 0.01 * angle

    Outputs:
        Isotropic
        Ross
        Li
        sur_refl_b0?

  */

  
  /*
  ** linear kernel models code:
  ** after: https://github.com/profLewis/modisPriors/blob/master/python/kernels.py
  */
  var BR = 1.0;
  var HB = 2.0;
  var d2r = Math.PI / 180.0;
  var zthresh = 0.00001
  
  // interpret view and illumination angles
  var sza = image.select('sza').float().multiply(ee.Number(d2r));
  var vza = image.select('vza').float().multiply(ee.Number(d2r));
  var vaa = image.select('vaa').float().multiply(ee.Number(d2r));
  var saa = image.select('saa').float().multiply(ee.Number(d2r));
  var raa = vaa.subtract(saa)
  var raa_plus = raa.add(ee.Number(Math.PI))
  // correct bounds
  var w = vza.lt(0);
  vza = ee.Image(vza.where(w,vza.multiply(ee.Number(-1)))).rename('vza');
  raa = ee.Image(raa.where(w,raa_plus));
  w = sza.lt(0);
  sza = ee.Image(sza.where(w,sza.multiply(ee.Number(-1)))).rename('sza');
  raa = ee.Image(raa.where(w,raa_plus)); 
  raa = ee.Image(0).expression('raa % (2*pi)',{'raa': raa,'pi':Math.PI}).rename('raa');     

  // trig functions
  var cos_vza = vza.cos().rename('cos_vza')
  var sin_vza = vza.sin().rename('sin_vza')
  var cos_sza = sza.cos().rename('cos_sza')
  var sin_sza = sza.sin().rename('sin_sza')
  var cos_raa = raa.cos().rename('cos_raa')
  var sin_raa = raa.sin().rename('sin_raa')
  var tanti   = sza.tan().rename('tanti')
  var tantv   = vza.tan().rename('tantv')
  
  // trig GO corrected angles: illumination
  var tan1    = ee.Image(ee.Image(0).expression('BR*tan1',{'tan1': tanti,'BR':BR}));
  var angp1 = tan1.atan();
  var sin1 = angp1.sin();
  var cos1 = angp1.cos();
  w = cos1.lte(zthresh);
  cos1 = cos1.where(w,zthresh); 
  
  // trig GO corrected angles: view
  var tan2 = ee.Image(ee.Image(0).expression('BR*tan1',{'tan1': tantv,'BR':BR}));
  var angp2 = tan2.atan();
  var sin2 = angp2.sin();
  var cos2 = angp2.cos();
  
  // avoid cos == 0 by setting threshold zthresh
  w = cos2.lte(zthresh);
  cos2 = cos2.where(w,zthresh);   
  
  
  // phase angle
  var cdict = {'cos1': cos_vza,'sin1': sin_vza,'cos2': cos_sza,'sin2': sin_sza,'cos3':cos_raa};
  var cosphaang = ee.Image(0).expression('cos1*cos2 + sin1*sin2*cos3',cdict);   
  // make sure limited -1 to 1
  w = cosphaang.lte(-1);
  cosphaang = ee.Image(cosphaang.where(w,-1));
  w = cosphaang.gte(1);
  cosphaang = ee.Image(cosphaang.where(w,1)).rename('cos_phaang');
  var phaang = cosphaang.acos().rename('phaang');
  var sinphaang = phaang.sin().rename('sin_phaang');
  
  
  ///////////// ross kernel
  cdict = {'cosphaang': cosphaang,'sinphaang': sinphaang,'pi': Math.PI, 'phaang':phaang,
        'cos1': cos_vza, 'cos2': cos_sza};
  var ross = ee.Image(0).expression('((pi/2. - phaang)*cosphaang+sinphaang)/(cos1+cos2) - pi/4.',cdict).rename('ross');
  
  ///////////// Li kernel
  cdict = {'tan1': tan1,'tan2': tan2,'cos3':cos_raa};
  var temp = ee.Image(0).expression('tan1*tan1 + tan2*tan2 - 2*tan1*tan2*cos3',cdict);
  w = temp.lte(0);
  temp = temp.where(w,0);
  var distance = temp.sqrt();

  cdict = {'cos1': cos1,'sin1': sin1,'cos2': cos2,'sin2': sin2,'cos3':cos_raa};
  temp = ee.Image(0).expression('1./cos1 + 1./cos2',cdict);
  
  cdict = {'tan1': tan1,'tan2': tan2,'cos3':cos_raa,'HB':HB,'distance':distance,'sin3':sin_raa,'temp':temp};
  var cost = ee.Image(0).expression('HB * sqrt(distance * distance + tan1 * tan1 * tan2 * tan2 * sin3 * sin3) / temp',cdict);
  w = cost.lte(-1);
  cost = cost.where(w,-1);
  w = cost.gte(1);
  cost = cost.where(w,1);
  var tvar = cost.acos();
  var sint = tvar.sin();
  
  cdict = {'tvar': tvar,'sint': sint,'cost':cost,'pi':Math.PI, 'temp':temp};
  var overlap = ee.Image(0).expression('(1/pi) * (tvar - sint * cost) * temp',cdict);
  w = overlap.lte(0);
  overlap = overlap.where(w,0).rename('overlap');
  
  var cdict = {'cos1': cos1,'sin1': sin1,'cos2': cos2,'sin2': sin2,'cos3':cos_raa};
  var cosphaang2 = ee.Image(0).expression('cos1*cos2 + sin1*sin2*cos3',cdict); 
  cdict = {'overlap': overlap,'cosphaang2': cosphaang2,'cos1':cos1,'cos2':cos2, 'temp':temp};
  var li = ee.Image(0).expression('overlap - temp + 0.5 * (1. + cosphaang2) / cos1 / cos2',cdict).rename('li')
  var isotropic = ee.Image.constant(1.).rename('isotropic')
  

  var i
  var simu_names = ['simu_boa_b1', 'simu_boa_b2', 'simu_boa_b3', 'simu_boa_b4', 'simu_boa_b5', 'simu_boa_b6']
  var simu_boas = []
  for (i = 6 - 1; i >= 0; i--) {
    var band = i + 1;
    var simu = image.select(mcd43_names[i])
          .add(image.select(mcd43_names[i+ 6]).multiply(ross))
          .add(image.select(mcd43_names[i+12]).multiply(li))
          .rename(simu_names[i])
    simu_boas.push(simu)
  }
  return image.addBands([isotropic, ross, li, cos_sza, cos_vza, cos_raa]).addBands(simu_boas)
  
}
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
                   
exports.makeBRDFKernels = makeBRDFKernels
exports.mcd43_names = mcd43_names
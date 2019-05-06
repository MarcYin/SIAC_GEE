// A sensor invariant Atmospheric Correction (SIAC) GEE version
// v1 -- 2019-05-06
// Author: Fengn Yin, UCL
// Email: ucfafy@ucl.ac.uk
// Github: https://github.com/MarcYin/SIAC
// DOI: https://eartharxiv.org/ps957/
// LICENSE: GNU GENERAL PUBLIC LICENSE V3
var siac = require('users/marcyinfeng/SIAC:SIAC_AC_ALL')
var collection = ee.ImageCollection('COPERNICUS/S2');
// Use the start of the collection and now to bound the slider.
var app = function(){
  var start = ee.Image(collection.first()).date().get('year').format();
  Map.style().set('cursor', 'crosshair');
  var now = Date.now();
  var end = ee.Date(now).format();
  var start_date
  var end_date
  var s2_data
  var geometry
  var list_s2_data
  var cloud_cover = 100
  // Run this function on a change of the dateSlider.
  var get_fileame = function(image){
    return image.get('PRODUCT_ID')
  }
  var date_style = {fontSize: '20px', 
                      color: '#0066cc',
                      //fontWeight: 'bold',
                      fontFamily : 'serif',
                      textAlign: 'left',
                      stretch: 'both',
                      
    }
  
  var set_start = function(range) {
    start_date = range.start()
    s2_data = collection.filterDate(start_date, end_date)
                            .filterBounds(geometry)
                            .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'not_greater_than', cloud_cover)
    list_s2_data = s2_data.toList(5000, 0)
  };
  var set_end = function(range) {
    end_date = range.end()
    s2_data = collection.filterDate(start_date, end_date)
                            .filterBounds(geometry)
                            .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'not_greater_than', cloud_cover)
    list_s2_data = s2_data.toList(5000, 0)
  
  };
  
  var panel = ui.Panel({style: {width: '500px'}})
      .add(ui.Label({value      :'Please Click a point on the map to set AOI!',
                     style:{
                     color      : 'red', 
                     fontWeight : 'bold', 
                     fontSize   : '16px',
                     fontFamily : 'serif',
                     padding    : '10px'}
                     }));
  
  Map.onClick(function(coords) {
    geometry = ee.Geometry.Point(coords.lon, coords.lat);
    var location = 'lon: ' + coords.lon.toFixed(2) + ' ' +
                   'lat: ' + coords.lat.toFixed(2);
    Map.layers().set(1, ui.Map.Layer(geometry, {color: 'FF0000'}));
    panel.widgets().set(0, ui.Label(location))
    s2_data = collection.filterDate(start_date, end_date)
                            .filterBounds(geometry)
                            .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'not_greater_than', cloud_cover)
    list_s2_data = s2_data.toList(5000, 0)
  });
  
  var date_slider_style = {
    width: '80%',
    height: '80px',
    stretch: 'both',
    padding: '10px',
    fontFamily : 'serif',
  }
  
  var slider_style = {
    width: '90%',
    height: '80px',
    stretch: 'both',
    padding: '10px',
    fontFamily : 'serif',
  }
  
  var slider = ui.Slider({min:0, max:100, step : 1, value: 100, style: slider_style});
  slider.onChange(function(value) {
    cloud_cover = value
    s2_data = collection.filterDate(start_date, end_date)
                            .filterBounds(geometry)
                            .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'not_greater_than', cloud_cover)
    list_s2_data = s2_data.toList(5000, 0)
  });
  // Asynchronously compute the date range and show the slider.
  var dateRange = ee.DateRange(start, end).evaluate(function(range) {
    var dateSlider_start = ui.DateSlider({
      start: range['dates'][0],
      end: range['dates'][1],
      value: null,
      onChange: set_start,
      style: date_slider_style
    });
    var dateSlider_end = ui.DateSlider({
      start: range['dates'][0],
      end: range['dates'][1],
      value: null,
      onChange: set_end,
      style: date_slider_style
    });
    // var formted_date = ee.Date(dateSlider_start.getStart()).format('Y-M-d')
    // formted_date.evaluate(function(result){
    //   panel.remove(panel.widgets().get(1))
    //   panel.widgets().set(1, ui.Label('Start date: ' + result, date_style));
    // })
    panel.widgets().set(1, ui.Label('Start date: ', date_style))
    panel.widgets().set(2, dateSlider_start.setValue(now));
    panel.widgets().set(3, ui.Label('End date: ', date_style));
    panel.widgets().set(4, dateSlider_end.setValue(now));
    panel.widgets().set(5, ui.Label('Cloud cover: ', date_style));
    panel.widgets().set(6, slider)
    panel.widgets().set(7, button1);
    
  });
  
  var n_files
  var selected_image
  var button1 = ui.Button({
    label: 'Search',
    style: {fontFamily : 'serif'},
    onClick: function() {
    panel.remove(panel.widgets().get(8))
    panel.remove(panel.widgets().get(9))
    panel.remove(panel.widgets().get(10))
    panel.remove(panel.widgets().get(11))
    n_files = list_s2_data.size()
    n_files.evaluate(function(result){
      panel.widgets().set(8, ui.Label({value: 'Total '+ result +  ' Sentinel 2 files are found!', 
                                       style:{fontFamily : 'serif',}
      }))
    })
  
    var fnames = s2_data.aggregate_array('PRODUCT_ID')
    fnames.evaluate(function(result){
        panel.widgets().set(9, ui.Label('Results: '));
        panel.widgets().set(10, ui.Label(result.join('\n')))
      })
    fnames.evaluate(function(result){  
    var select = ui.Select({
        items: result,
        onChange: function(key) {
        var image = ee.Image(s2_data.filterMetadata('PRODUCT_ID', 'equals', key).first())
        selected_image = image
        image = image.visualize({
                                bands: ['B4', 'B3', 'B2'],
                                min: 0,
                                max: 2000,
                                gamma: [1., 1., 1]
                              });
        Map.centerObject(image)
        Map.layers().set(0, image)
        Map.layers().set(1, ui.Map.Layer(geometry, {color: 'FF0000'}))
      }})
      select.setPlaceholder('Choose a S2 file to preview and correct...')
      panel.widgets().set(12, select);
      panel.widgets().set(13, button2);
      panel.widgets().set(14, button3);
    })
    }});
  var inital    = ui.Label('Initialising...')
  var submitted = ui.Label('Jobs are submitted!')
  var button2 = ui.Button({
    label: 'Do selected!',
    onClick: function() {
      panel.remove(submitted)
      panel.widgets().set(15, inital);
      siac.siac(selected_image)
      panel.remove(inital)
      panel.widgets().set(15, submitted);
      }
    });
  
  var button3 = ui.Button({
    label: 'Do Them All!',
    onClick: function() {
      panel.remove(submitted)
      panel.widgets().set(15, inital );
      var n = list_s2_data.size();
      n.evaluate(function(value){
        for (var i = 0; i < value; i++) {
          var img = ee.Image(list_s2_data.get(i));
          siac.siac(img)
      }
      panel.remove(inital)
      panel.widgets().set(15, submitted);
      })
    }
  });
  ui.root.add(panel);
}
app()
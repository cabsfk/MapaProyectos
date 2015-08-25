var lyrTotalProyectos, lyrProyCluster;



function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
    var textTitle = "",
        nombre;
    if (seleccMapa.Escala == "Municipio") {
        textTitle = "Municipio";
        nombre = feature.properties.MPIO_CNMBR;
    } else if (seleccMapa.Escala == "Departamento") {
        textTitle = "Departamento";
        nombre = feature.properties.NOMBRE;
    }

    layer.bindLabel(
        '<h4> <p class="text-info">' + nombre + '</p></h4>'
        /*+
                   //'<h5><small>Cantidad Proyectos: </small>' + numeral(feature.properties.CANT_PROYECTOS).format('0,0') + '</h5>' +
                   '<h5><small>Beneficiados: </small>' + numeral(feature.properties.U).format('0,0') + ' (' + numeral((feature.properties.U / SumaTotales.Beneficiarios) * 100).format('0,0') + '%)</h5>' +
                   '<h5><small>Valor: </small>' + numeral(feature.properties.VPU).format('$0,0') + ' (' + numeral((feature.properties.VPU / SumaTotales.Valor) * 100).format('0,0') + '%)</h5>' +
                   '<hr>' +
                   '<h5><small>Valor Solicitado: </small>' + numeral(feature.properties.VSU ).format('$0,0') +'</h5>' +
                   '<h5><small>Valor Terceros: </small>' + numeral(feature.properties.VTU ).format('$0,0') +'</h5>' 
                   //'<h5><small>Valor Cofinanciar: </small>' + numeral(feature.properties.VCU).format('$0,0') + '</h5>'
                   //+'<h5><small>Costo: </small>' + numeral(feature.properties.CXU).format('$0,0') + '</h5>'*/
        , {
            'noHide': true
        });
}


function style(feature) {
    return {
        weight: 2,
        //opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5,
        fillColor: '#DDD4B7'
        /*,
            fillColor: getColor(feature.properties.VPU)*/
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: 'blue',
        fillOpacity: 0.7,
        fillColor: '#DDD4B7'
        /*,
            fillOpacity: 0.7*/
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

}


function resetHighlight(e) {
    lyrTotalProyectos.resetStyle(e.target);
}

function zoomToFeature(e) {
    var layer = e.target.feature;

    if (seleccMapa.Escala == "Municipio") {
        getMpio(layer.properties.MPIO_CCNCT, layer.properties.MPIO_CNMBR);
    } else if (seleccMapa.Escala == "Departamento") {

        getDpto(layer.properties.CODIGO_DEP, layer.properties.NOMBRE);
    }

}
$("#panel_superDerecho").hide();



function MapearProyectosTotal(featureCollection) {
    if (map.hasLayer(lyrTotalProyectos)) {
        map.removeLayer(lyrTotalProyectos);
    }
    lyrTotalProyectos = L.geoJson(featureCollection, {
        style: style,
        onEachFeature: onEachFeature
    });
    map.addLayer(lyrTotalProyectos);
}

function addSitioUpme(fc,origen) {
    var idsu = "";
    var filtered;
    for (var i = 0; i < fc.features.length; i++) {
        if (idsu != fc.features[i].properties.ISU) {
            idsu = fc.features[i].properties.ISU
            filtered = turf.filter(LyrSitioUpme, 'ID_CENTRO_POBLADO', fc.features[i].properties.ISU);
            fc.features[i].geometry = filtered.features[0].geometry;
            fc.features[i].properties.NOM = filtered.features[0].properties.NOMBRE_SITIO;
        } else {
            fc.features[i].geometry = filtered.features[0].geometry;
            fc.features[i].properties.NOM = filtered.features[0].properties.NOMBRE_SITIO;
        }
        fc.features[i].properties.ORI = origen;
    }
    return fc;

}

function MapearProyectosCluster(CodDepto) {
    $("#IconoCargado").show();
    var where = getParametros();
    if ($('#checkFondos').is(':checked')) {
        var queryDataProySu = L.esri.Tasks.query({
            url: dominio + urlHostDataFoSU + 'MapServer/' + '1'
        });
  
        queryDataProySu.where(where + ' AND  D=' + CodDepto).returnGeometry(false).run(function (error, featureCollectionFO, response) {
            featureCollectionFO = addSitioUpme(featureCollectionFO, 'FO');
            if ($('#checkPCR').is(':checked')) {
                var queryDataProySuPCR = L.esri.Tasks.query({
                    url: dominio + urlHostDataFoSU + 'MapServer/' + '2'
                });
                queryDataProySuPCR.where(where + ' AND  D=' + CodDepto).returnGeometry(false).run(function (error, featureCollectionPCR, response) {
                    featureCollectionPCR = addSitioUpme(featureCollectionPCR, 'PCR');
                    var fc = $.merge(featureCollectionPCR.features, featureCollectionFO.features);
                    addClusterMap(fc);
                });
            } else {
                addClusterMap(featureCollectionFO);
            }
        });
    } else {
        if ($('#checkPCR').is(':checked')) {
            var queryDataProySuPCR = L.esri.Tasks.query({
                url: dominio + urlHostDataFoSU + 'MapServer/' + '2'
            });
            queryDataProySuPCR.where(where + ' AND  D=' + CodDepto).returnGeometry(false).run(function (error, featureCollectionPCR, response) {
                featureCollectionPCR = addSitioUpme(featureCollectionPCR, 'PCR');
                addClusterMap(featureCollectionPCR);
            });
        } else {
            SuCluster.clearLayers();
            if (map.hasLayer(SuCluster)) {
                map.removeLayer(SuCluster);
            }
            if (map.hasLayer(lyrLimitMun)) {
                map.removeLayer(lyrLimitMun);
            }
            $("#IconoCargado").hide();
        }
    }

}

function addClusterMap(fc){
      lyrProyCluster = L.geoJson(fc, {
          pointToLayer: function (feature, latlng) {
                   
              var featureMarket;
              //.bindLabel(feature.properties.nOM, { noHide: false, offset: [20, -45] });
              if (feature.properties.ORI == 'FO') {
                  featureMarket = L.marker(latlng, geojsonMarkerProyectoFO);
                  var htmlpopup = ContPopUPFO(feature, latlng, "");
              }
              if (feature.properties.ORI == 'PCR') {
                  featureMarket = L.marker(latlng, geojsonMarkerProyectoPCR);
                  var htmlpopup = ContPopUPPCR(feature, latlng, "");
              }
                    
              featureMarket.bindPopup(htmlpopup);
              return featureMarket;
          }
      });

      if (map.hasLayer(SuCluster)) {
          SuCluster.clearLayers();
          SuCluster.addLayer(lyrProyCluster);
      } else {

          SuCluster.addLayer(lyrProyCluster);
          map.addLayer(SuCluster);
      }
      $("#IconoCargado").hide();
}


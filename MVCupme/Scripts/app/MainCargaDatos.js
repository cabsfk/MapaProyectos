
var featuresFondos;
var queryDataFondos = L.esri.Tasks.query({
    url: dominio + urlHostDataFO + 'MapServer/' + '2'
});

var LyrDeptoSim;
var LyrMunicipioSim;
var LyrSitioUpme;

var queryMunSimpli = L.esri.Tasks.query({
    url: dominio + urlHostDataFO + 'MapServer/' + '0'
});



var seleccMapa = {
    Escala: 'Departamento',
    Depto:'',
    NombreDepto:'',
    Mpio:'',
    NombreMpio:''
}

var queryDeptoSimpli = L.esri.Tasks.query({
    url: dominio + urlHostDataFO + 'MapServer/' + '1'
});

$("#btnDepto").hide();
$("#btnMpio").hide();
$("#btnFondos").click(function () {
    $("#checkFondos").prop('checked', false);
    $("#btnFondos").hide();
    MapearProyectosCluster(seleccMapa.Depto);
    
});
$("#btnPECOR").click(function () {
    $("#checkPCR").prop('checked', false);
    $("#btnPECOR").hide();
    MapearProyectosCluster(seleccMapa.Depto);
    
});

$("#btnDepto").click(function () {
    $("#btnDepto").hide();
    $("#btnMpio").hide();
    seleccMapa.Escala = 'Departamento';
    SuCluster.clearLayers();
    if (map.hasLayer(SuCluster)) {

        map.removeLayer(SuCluster);
    }
    if (map.hasLayer(lyrLimitMun)) {
        map.removeLayer(lyrLimitMun);
    }

    var featureGroupjson = L.geoJson(LyrDeptoSim);
    map.fitBounds(featureGroupjson.getBounds(), { padding: [100, 100] });
    agregarListaDepto(LyrDeptoSim);
    MapearProyectosTotal(LyrDeptoSim);
});
$("#btnMpio").click(function () {
    $("#btnMpio").hide();
    if (map.hasLayer(lyrLimitMun)) {
        map.removeLayer(lyrLimitMun);
    }
    getDpto(seleccMapa.Depto, seleccMapa.NombreDepto);
});


var lyrLimitMun;


function styleMun(feature) {
    return {
        fillColor: 'rgba(255,255,255,0.7)',
        weight: 2,
        opacity: 1,
        color: '#00FFFF',
        fillOpacity: 0.7
    };
}

function getMpio(CODIGO_MUN, NOMBRE) {
    seleccMapa.Escala = 'Municipio';
    var filtered = turf.filter(LyrMunicipioSim, 'MPIO_CCNCT', CODIGO_MUN);
    if (map.hasLayer(lyrLimitMun)) {
        map.removeLayer(lyrLimitMun);
        
    }
    lyrLimitMun = L.geoJson(filtered, { style: styleMun });
    map.addLayer(lyrLimitMun);
    
    //console.log(filtered);
    $("#btnMpio").show();
    $("#TextMpio").empty().append(NOMBRE);
    map.fitBounds(lyrLimitMun.getBounds());
    //MapearProyectosTotal(filtered);
}


function getDpto(CODIGO_DEP, NOMBRE) {
    seleccMapa.Escala = 'Municipio';
    seleccMapa.Depto = CODIGO_DEP;
    seleccMapa.NombreDepto = NOMBRE;
    console.log(seleccMapa);
    var filtered = turf.filter(LyrMunicipioSim, 'DPTO_CCDGO', CODIGO_DEP);
    var featureGroupjson = L.geoJson(filtered);
    map.fitBounds(featureGroupjson.getBounds(), { padding: [100, 100] });
    //console.log(filtered);
    $("#btnDepto").show();
     

    $("#TextDepto").empty().append(NOMBRE);
    $("#DeptoLista").empty().append('<div class="container" id="searchable_lista" style=" width:210px; max-height: 200px;overflow-y:auto"></div>');
    for (var i = 0; i < filtered.features.length; i++) {
        $("#searchable_lista").prepend('<div class="col-xs-12"><button type="button" onclick="getMpio(\''
            + filtered.features[i].properties.MPIO_CCNCT + '\',\'' + filtered.features[i].properties.MPIO_CNMBR + '\')" class="btn btn-default" style="width:150px">'
            + filtered.features[i].properties.MPIO_CNMBR + '</button></div>');
    }

    $("#container-input").val("").focus();
    $('#searchable_lista').searchable({
        searchField: '#container-input',
        selector: '.col-xs-12',
        childSelector: '.btn',
        show: function (elem) {
            elem.slideDown(100);
        },
        hide: function (elem) {
            elem.slideUp(100);
        }
    });
    MapearProyectosTotal(filtered);
    MapearProyectosCluster(seleccMapa.Depto);
}

function agregarListaDepto(feature) {

    $("#DeptoLista").empty().append('<div class="container" id="searchable_lista" style=" width:210px; max-height: 200px;overflow-y:auto"></div>');
    for (var i = 0; i < feature.features.length; i++) {
        $("#searchable_lista").prepend('<div class="col-xs-12"><button type="button" onclick="getDpto(\''
            + feature.features[i].properties.CODIGO_DEP + '\',\''+ feature.features[i].properties.NOMBRE+'\')" class="btn btn-default" style="width:150px">'
            + feature.features[i].properties.NOMBRE + '</button></div>');
    }
    $("#container-input").val("").focus();
    $('#searchable_lista').searchable({
        searchField: '#container-input',
        selector: '.col-xs-12',
        childSelector: '.btn',
        show: function (elem) {
            elem.slideDown(100);
        },
        hide: function (elem) {
            elem.slideUp(100);
        }
    });
    return feature;

}


function getMultiSelect(id) {
    var brands = $('#' + id + ' option:selected');
    var selection = [];
    $(brands).each(function (index, brand) {
        selection.push("'"+brand.value+"'");
    });
    return selection;
}

var whereParametros = "";
function getParametros() {
    var datemin = $('#date_ini').data("DateTimePicker").date().format('YYYY-MM-DD');
    var datemax = $('#date_fin').data("DateTimePicker").date().format('YYYY-MM-DD');
    /*var SelctFondo = getMultiSelect('SelctFondo');*/
    var params = "";
  /*  params = SelctFondo.length == 0 ? params : params + ' and  FO IN (' + SelctFondo.join(',') + ")";*/
    $("#TextFechaIni").empty().append(datemin);
    $("#TextFechaFin").empty().append(datemax);
    var where = "FE >= TO_DATE('" + datemin + "', 'YYYY-MM-DD') and FE<= TO_DATE('" + datemax + "', 'YYYY-MM-DD') ";// + params;
    return where;
}


function getData() {
    agregarListaDepto(LyrDeptoSim);
    MapearProyectosTotal(LyrDeptoSim);
    $("#panel_superDerecho").hide();
    $("#IconoCargado").hide();
}


function getDataSimp() {
    queryMunSimpli
       .fields(['DPTO_CCDGO', 'MPIO_CCDGO', 'MPIO_CCNCT', 'MPIO_CNMBR'])
       .orderBy(['MPIO_CCNCT']);
    queryMunSimpli.where("1=1").run(function (error, geojson, response) {
        LyrMunicipioSim = geojson;
        queryDeptoSimpli
           .fields(['CODIGO_DEP', 'NOMBRE'])
           .orderBy(['CODIGO_DEP']);
            queryDeptoSimpli.where("1=1").run(function (error, geojson, response) {
                LyrDeptoSim = geojson;
                getData();
            });
    });
    var querySitioUpme = L.esri.Tasks.query({
        url: dominio + urlHostDataFoSU + 'MapServer/' + '0'
    });
    querySitioUpme
      .fields(['ID_CENTRO_POBLADO', 'COD_DPTO', 'COD_MPIO', 'NOMBRE_SITIO'])
      .orderBy(['ID_CENTRO_POBLADO']);
    querySitioUpme.where("1=1").run(function (error, geojson, response) {
        LyrSitioUpme = geojson;       
    });

}


$("#checkFondos").change(function () {
    if ($('#checkFondos').is(':checked')) {
        $("#btnFondos").show();
        
    } else {
        $("#btnFondos").hide();
    }
});

$("#checkPCR").change(function () {
    if ($('#checkPCR').is(':checked')) {
        $("#btnPECOR").show();
        
    } else {
        $("#btnPECOR").hide();
    }
});
getDataSimp();

$("#BuscarMapa").click(function () {

    //legend.removeFrom(map);
    if (seleccMapa.Depto != "") {
        MapearProyectosCluster(seleccMapa.Depto)
    }

});


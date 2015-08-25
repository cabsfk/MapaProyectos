Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
    return {
        radialGradient: {
            cx: 0.5,
            cy: 0.3,
            r: 0.7
        },
        stops: [
            [0, color],
            [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
        ]
    };
});
function pie(arrayJsonFondos, idContainer, nombre) {
    if (arrayJsonFondos.length > 0) {
        $("#panel_superDerecho").show();
    } else {
        $("#panel_superDerecho").hide();
    }
    
    $('#' + idContainer).highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: nombre,
            style: { "color": "#333333", "fontSize": "16px" }
        },
		subtitle: {	
			text:   ''
		},
		credits: {
			text: '-',
			href: '#'
		},
		tooltip: {
            pointFormat: '<b>${point.y}</b><br><b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: false,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        series: [{
            colorByPoint: true,
            data: arrayJsonFondos
        }]
    });
}

function getFondos(cod_dept, cod_mpio,nombre) {
    
    var datemin = $('#date_ini').data("DateTimePicker").date().format('YYYY-MM-DD');
    var datemax = $('#date_fin').data("DateTimePicker").date().format('YYYY-MM-DD');
    var where = whereParametros;
    if (cod_mpio == '') {
        where = "D ='" + cod_dept + "' and  " + where;
    } else {
        where = "D ='" + cod_dept + "' and M='" + cod_mpio + "' and  "+where;
    }

    getFondoDataPie(where, 'FO', arrayFondos,nombre);
    getFondoDataPie(where, 'SEC', arraySectores,nombre);
    getFondoDataPie(where, 'ES', arrayEstado,nombre);
    getFondoDataPie(where, 'CON', arrayConcepto, nombre);
}

function getFondoDataPie(where, idGrupo, array, nombre) {
    var arrayJsonFondos = [];
    var queryDataPie = L.esri.Tasks.query({
        url: dominio + urlHostDataFO + 'MapServer/' + '2'
    });

    queryDataPie
       .fields(['VPU', idGrupo])
       .orderBy([idGrupo])
       .returnGeometry(false);
       queryDataPie.where(where).run(function (error, featureCollection, response) {
        var sum_VPU = 0;
        for (var i = 0; i < featureCollection.features.length; i++) {
            if (i != featureCollection.features.length - 1) {
                if (featureCollection.features[i].properties[idGrupo] == featureCollection.features[i + 1].properties[idGrupo]) {
                    sum_VPU = sum_VPU + featureCollection.features[i].properties.VPU;
                } else {
                    sum_VPU = sum_VPU + featureCollection.features[i].properties.VPU;
                    var row = {
                        name: array[featureCollection.features[i].properties[idGrupo]],
                        y: sum_VPU
                    };
                    arrayJsonFondos.push(row);
                    var sum_VPU = 0;
                }
            } else {
                sum_VPU = sum_VPU + featureCollection.features[i].properties.VPU;
                var row = {
                    name: array[featureCollection.features[i].properties[idGrupo]],
                    y: sum_VPU
                };
                arrayJsonFondos.push(row);
            }
        }
        if (idGrupo == 'FO') {
            pie(arrayJsonFondos, 'containerFondos', nombre);
        } else if (idGrupo == 'SEC') {
            pie(arrayJsonFondos, 'containerSectores', nombre);
        } else if (idGrupo == 'ES') {
            pie(arrayJsonFondos, 'containerEstado', nombre);
        } else if (idGrupo == 'CON') {
            pie(arrayJsonFondos, 'containerConcepto', nombre);
        }
    });
}
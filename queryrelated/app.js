var map = L.map('map').setView([34.307144, -106.018066], 7);

//basemap
L.esri.basemapLayer('DarkGray').addTo(map);

//search places

var arcgisOnline = L.esri.Geocoding.arcgisOnlineProvider();

var searchControl = L.esri.Geocoding.geosearch({
    providers: [
      arcgisOnline,
      L.esri.Geocoding.featureLayerProvider({
            url: 'https://services.arcgis.com/BvefdV6XvRo2Jt72/ArcGIS/rest/services/ParkServe_CPF_Dev/FeatureServer/0',
            searchFields: ['Place_StAbbrev'],
            label: 'search for city/town',
            bufferRadius: 5000,
            formatSuggestion: function (feature) {
                return feature.Place_StAbbrev;
            }
        })
    ]
}).addTo(map);



//load places geojson
var fl = L.esri.featureLayer({
    url: 'https://services.arcgis.com/BvefdV6XvRo2Jt72/ArcGIS/rest/services/ParkServe_CPF_Dev/FeatureServer/0',
    simplifyFactor: 0.5,
    precision: 5,
    style: function (feature) {
        if (feature.properties.TOTAL_POP >= 223942) {
            return {
                color: 'red',
                weight: 2
            };
        } else {
            return {
                color: 'blue',
                weight: 2
            };
        }
    }
}).addTo(map);

fl.bindPopup(function (layer) {
    console.log("This is ParkServe Data:", layer.feature.properties)
    return L.Util.template('<h4>This is sample data from ParkServe (exists for 13,900 places!)</h4><hr><p><b>City town name: </b>{Place_StAbbrev}<br><b>Total population within 10min walk: </b>{SUM_TOTPOPSVCA}<br></p>', layer.feature.properties);


});

// fire a query when users click on a feature
fl.on("click", queryRelated);

function queryRelated(evt) {
    L.esri.Related.query(fl).objectIds([evt.layer.feature.id]).relationshipId("0").run(function (error, response, raw) {
        //pull the attributes out of the geoJson response
        if (response.features.length > 0) {
            var results = [];
            for (i = 0; i < response.features.length; i++) {
                results.push(response.features[i].properties);
                console.log("This is CPF Data:", results[i])
            }

            $('#my-table').removeClass('hidden');
            //you can only call refresh() when loading from a url
            $('#my-table').bootstrapTable('destroy');
            $('#my-table').bootstrapTable({
                data: results,
                cache: false,
                striped: true,
                clickToSelect: true,
                columns: [{
                    field: 'Place_StAbbrev',
                    title: 'City/State',
                    sortable: false
          }, {
                    field: 'PS_Rank',
                    title: '2018 ParkScore Rank',
                    sortable: false
          }, {
                    field: 'CPF_ParkScore',
                    title: '2018 ParkScore',
                    sortable: false
          }]
            });
        }
    });
}

function dateFormatter(value, row) {
    //reformat to make the dates human readable
    var d = new Date(value);
    when = d.getMonth() + '/' + d.getDay() + '/' + d.getFullYear();
    return when;
}
map.on("click", function () {
    //hide the table when the map is clicked
    $('#my-table').bootstrapTable('destroy');
});

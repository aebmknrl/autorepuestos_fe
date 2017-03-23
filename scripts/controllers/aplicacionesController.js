angular
    .module('autorepuestosApp')
    .controller('aplicacionesController', ['$scope', '$state', '$http', 'storageService', 'endpointApiURL', 'ngToast', '$uibModal', '$log', '$confirm', '$rootScope', 'toastMsgService', '$document', '$log', 'countryService', '$window', '$httpParamSerializerJQLike', '$timeout', function ($scope, $state, $http, storageService, endpointApiURL, ngToast, $uibModal, $log, $confirm, $rootScope, toastMsgService, $document, $log, countryService, $window, $httpParamSerializerJQLike, $timeout) {
        // Set the username for the app
        $rootScope.username = storageService.getUserData('username');
        $rootScope.userrole = storageService.getUserData('role');
        // Initializing vars
        var aplicacionesc = this;

        aplicacionesc.allLoad = false;
        aplicacionesc.Aplicacionfilter = "";
        aplicacionesc.orderBy = "aplId";
        aplicacionesc.orderDirection = false; // False = Ascendent
        aplicacionesc.searchText = "";
        aplicacionesc.editing = false;
        aplicacionesc.loadingEditing = false;
        aplicacionesc.loadingData = false;


        aplicacionesc.parteSeleccionada = null;
        aplicacionesc.vehiculosSeleccionados = null;
        aplicacionesc.grupoSeleccionado = null;
        aplicacionesc.partesByGrupo = null;
        aplicacionesc.parteSeleccionadaParaAplicacion = null;
        aplicacionesc.vehiculoSeleccionadoParaAplicacion = null;

        //Vacío por ahora
        aplicacionesc.selectedItem = {};
        //

        aplicacionesc.newItem = {
            aplCantidad: '',
            partePar: '',
            vehiculoVeh: '',
            aplObservacion: '' //falta imagenes
        };

        aplicacionesc.filterEstatus = "";
        aplicacionesc.filterEstatusStrict = false;


        aplicacionesc.isAddNewAplicacion = false;
        // Obtain the items per page
        $scope.QtyPageTables = storageService.getQtyPageTables();

        //Toggles the filter strict on or off
        aplicacionesc.toggleFilterEstatusStrict = function (value) {
            aplicacionesc.filterEstatusStrict = value;
        };

        //Change the orderby 
        aplicacionesc.changeOrderByOrDirection = function (orderByItem) {
            aplicacionesc.orderBy = orderByItem;
            if (aplicacionesc.orderDirection == true) {
                aplicacionesc.orderDirection = false;
            } else {
                aplicacionesc.orderDirection = true;
            }
        };

        // Change the items per page
        aplicacionesc.ChangeQtyPagesTables = function (Qty, searchText) {
            storageService.setQtyPageTables(Qty);
            $scope.QtyPageTables = storageService.getQtyPageTables();
            aplicacionesc.getAplicaciones(Qty, 1, searchText);
        }

        aplicacionesc.selectParteGroup = function (item) {
            return item.parNombre.parGrupo.grupoNombre;
        };


        aplicacionesc.selectVehiculoGroup = function (item) {
            return item.modeloMod.marcaMar.marNombre;
        };

        aplicacionesc.getPartes = function () {
            var url = endpointApiURL.url + "/parte";
            return $http.get(url)
                .then(function (response) {
                    aplicacionesc.partes = response.data;
                    //console.log(aplicacionesc.modelos);
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        };

        aplicacionesc.getVehiculos = function () {
            var url = endpointApiURL.url + "/vehiculo";
            return $http.get(url)
                .then(function (response) {
                    aplicacionesc.vehiculos = response.data;
                    //console.log(aplicacionesc.modelos);
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        };

        aplicacionesc.getGrupos = function () {
            var url = endpointApiURL.url + "/grupo";
            return $http.get(url)
                .then(function (response) {
                    aplicacionesc.grupos = response.data;
                    //console.log(aplicacionesc.modelos);
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        };

        $scope.AplicacionesPromise = aplicacionesc.getPartes()
            .then(function (response) {
                $scope.AplicacionesPromise = aplicacionesc.getVehiculos()
                    .then(function (response) {
                        $scope.AplicacionesPromise = aplicacionesc.getGrupos()
                            .then(function (response) {
                                //console.log(aplicacionesc.vehiculos)
                                //finnished
                            })

                    });
            });

        aplicacionesc.addAplicacion = function (parId) {
            aplicacionesc.isAddNewAplicacion = true;
            vehiculos = {};
            for (i = 0; i < aplicacionesc.vehiculosSeleccionados.length; i++) {
                vehiculos['vehiculo' + i] = aplicacionesc.vehiculosSeleccionados[i].vehId;
            }
            url = endpointApiURL.url + "/aplicacion/add/" + parId;
            $scope.AplicacionesPromise = $http({
                url: url,
                method: 'POST',
                data: vehiculos
            }).then(function (response) {
                ngToast.create({
                    className: 'info',
                    content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Registro agregado: <strong>' + response.data.Aplicacion[0].ID + '</strong>'
                });
                aplicacionesc.isAddNewAplicacion = false;
            }).catch(function (error) {
                console.log(error);
            })
        }

        aplicacionesc.onSelectGrupo = function (item, model) {

            var url = endpointApiURL.url + "/parte/findPartsByGroup/" + item.id;
            $scope.AplicacionesPromise = $http.post(url)
                .then(function (response) {
                    aplicacionesc.partesByGrupo = response.data;
                    //console.log(aplicacionesc.partesByGrupo);
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        };

        aplicacionesc.onSelectParteAplicacion = function (item, model) {
            //console.log(item);
            var url = endpointApiURL.url + "/aplicacion/aplicationbypart/" + item.parId;
            $scope.AplicacionesPromise = $http.post(url)
                .then(function (response) {
                    aplicacionesc.vehiculosQueAplica = response.data;
                    //console.log(aplicacionesc.partesByGrupo);
                    console.log(aplicacionesc.vehiculosQueAplica);
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        };
    }]);
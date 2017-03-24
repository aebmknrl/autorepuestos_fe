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
        aplicacionesc.cantAplicaciones = 0;
        aplicacionesc.vehiculosQueAplica = null;

        aplicacionesc.progressBarValue = 0;
        aplicacionesc.progressBarMax = 0;


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

        aplicacionesc.iniNewApp = function () {
            aplicacionesc.parteSeleccionada = null;
            aplicacionesc.vehiculosSeleccionados = null;
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
                    // Add a Todos item to bring all items
                    aplicacionesc.grupos.push({
                        id: 'todos',
                        descripcion: 'todos',
                        grupoNombre: 'Todos los Grupos',
                        grupoPadre: null
                    })
                    //console.log(a);
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        };


        // First data to load
        $scope.AplicacionesPromise = aplicacionesc.getPartes()
            .then(function (response) {
                $scope.AplicacionesPromise = aplicacionesc.getGrupos()
                    .then(function (response) {})
                //Ready
            })

        aplicacionesc.onSelectParteForNewApp = function (item, model) {
            // Verify if the parte selected has applicaciones
            var url = endpointApiURL.url + "/aplicacion/aplicationbypart/" + item.parId;
            $scope.AplicacionesPromise = $http.post(url)
                .then(function (response) {
                    var cantAplicaciones = response.data.length;
                    aplicacionesc.aplicaciones = response.data;
                    // There have aplicaciones?
                    if (cantAplicaciones > 0) {
                        // Find all vehiculos 
                        var url = endpointApiURL.url + "/vehiculo";
                        $scope.AplicacionesPromise = $http.get(url)
                            .then(function (response) {
                                var vehiculos = response.data;
                                var vehiculosNewList = null;
                                var vehiculosNewList = [];
                                var aplicaciones = aplicacionesc.aplicaciones;
                                //Create new list of vehiculos

                                for (var index = 0; index < aplicaciones.length; index++) {
                                    var aplicacion = aplicaciones[index];
                                    for (var y = 0; y < vehiculos.length; y++) {
                                        var vehiculo = vehiculos[y];
                                        if (vehiculo.vehId === aplicacion.vehiculoVeh.vehId) {
                                            vehiculos.splice(y, 1);
                                        }
                                    }
                                }

                                //console.log(vehiculos);
                                aplicacionesc.vehiculos = vehiculos;

                            })
                    } else {
                        // If don't have aplicaciones
                        // Return all vehiculos
                        var url = endpointApiURL.url + "/vehiculo";
                        $scope.AplicacionesPromise = $http.get(url)
                            .then(function (response) {
                                aplicacionesc.vehiculos = response.data;
                            })
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }

        // First data to load

        /*

                $scope.AplicacionesPromise = aplicacionesc.getPartes()
                    .then(function (response) {

                        var url = endpointApiURL.url + "/vehiculo";
                        return $http.get(url)
                            .then(function (response) {
                               // aplicacionesc.vehiculos = response.data;
                               var vehiculosObtenidos = response.data;
                               vehiculohasappl

               
                                $scope.AplicacionesPromise = aplicacionesc.getGrupos()
                                    .then(function (response) {
                                        //console.log(aplicacionesc.vehiculos)
                                        //finnished
                                    })
                            })
                            .catch(function (error) {
                                console.log(error);
                                if (error.status == '412') {
                                    console.log('Error obteniendo datos: ' + error.data.error);
                                }
                            });
                    });
        */

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
                aplicacionesc.parteSeleccionada = null;
                aplicacionesc.vehiculosSeleccionados = null;
                aplicacionesc.isAddNewAplicacion = false;
                aplicacionesc.grupoSeleccionado = null;
                aplicacionesc.partesByGrupo = null;
                aplicacionesc.parteSeleccionadaParaAplicacion = null;
                aplicacionesc.vehiculoSeleccionadoParaAplicacion = null;
                aplicacionesc.cantAplicaciones = 0;
                aplicacionesc.vehiculosQueAplica = null;
                aplicacionesc.progressBarValue = 0;
                aplicacionesc.progressBarMax = 0;

            }).catch(function (error) {
                console.log(error);
            })
        }

        aplicacionesc.onSelectGrupo = function (item, model) {
            if (item.id == 'todos') {

                var url = endpointApiURL.url + "/parte";
                $scope.AplicacionesPromise = $http.get(url)
                    .then(function (response) {
                        aplicacionesc.partesByGrupo = response.data;

                        var cantPartes = aplicacionesc.partesByGrupo.length;
                        aplicacionesc.progressBarMax = cantPartes;
                        var count = 0;


                        var loop = function (count) {
                            aplicacionesc.progressBarValue = count + 1;
                            var element = aplicacionesc.partesByGrupo[count];
                            //console.log(element);
                            var url = endpointApiURL.url + "/aplicacion/getqtyappbypartaction/" + element.parId;
                            $scope.AplicacionesPromise = $http.post(url)
                                .then(function (response) {
                                    //console.log(element);
                                    element.cantAplicaciones = response.data;
                                    if (count === cantPartes - 1) {
                                        aplicacionesc.progressBarMax = 0;
                                        return true;
                                    } else {
                                        loop(++count);
                                    }
                                })
                            //console.log(aplicacionesc.partesByGrupo);
                        }
                        // start count
                        loop(count);
                        //console.log(aplicacionesc.partesByGrupo);
                    })
                    .catch(function (error) {
                        console.log(error);
                        if (error.status == '412') {
                            console.log('Error obteniendo datos: ' + error.data.error);
                        }
                    });
            } else {

                var url = endpointApiURL.url + "/parte/findPartsByGroup/" + item.id;
                $scope.AplicacionesPromise = $http.post(url)
                    .then(function (response) {
                       aplicacionesc.partesByGrupo = response.data;

                        var cantPartes = aplicacionesc.partesByGrupo.length;
                        aplicacionesc.progressBarMax = cantPartes;
                        var count = 0;


                        var loop = function (count) {
                            aplicacionesc.progressBarValue = count + 1;
                            var element = aplicacionesc.partesByGrupo[count];
                            //console.log(element);
                            var url = endpointApiURL.url + "/aplicacion/getqtyappbypartaction/" + element.parId;
                            $scope.AplicacionesPromise = $http.post(url)
                                .then(function (response) {
                                    //console.log(element);
                                    element.cantAplicaciones = response.data;
                                    if (count === cantPartes - 1) {
                                        aplicacionesc.progressBarMax = 0;
                                        return true;
                                    } else {
                                        loop(++count);
                                    }
                                })
                            //console.log(aplicacionesc.partesByGrupo);
                        }
                        // start count
                        loop(count);
                        //console.log(aplicacionesc.partesByGrupo);
                    })
                    .catch(function (error) {
                        console.log(error);
                        if (error.status == '412') {
                            console.log('Error obteniendo datos: ' + error.data.error);
                        }
                    });
            }

        };

        aplicacionesc.onSelectParteAplicacion = function (item, model) {
            //console.log(item);
            aplicacionesc.parteSeleccionadaParaAplicacion = item;
            aplicacionesc.cantAplicaciones = item.cantAplicaciones;
            var url = endpointApiURL.url + "/aplicacion/aplicationbypart/" + item.parId;
            $scope.AplicacionesPromise = $http.post(url)
                .then(function (response) {
                    aplicacionesc.vehiculosQueAplica = response.data;
                    aplicacionesc.cantAplicaciones = aplicacionesc.vehiculosQueAplica.length;
                    //console.log(aplicacionesc.partesByGrupo);
                    //console.log(aplicacionesc.vehiculosQueAplica);
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        };


        aplicacionesc.removeOneAplicacion = function (aplId) {
            $window.scrollTo(0, 0);
            //console.log(item);
            var url = endpointApiURL.url + "/aplicacion/delete/" + aplId;
            $scope.AplicacionesPromise = $http.delete(url)
                .then(function (response) {
                    aplicacionesc.onSelectParteAplicacion(aplicacionesc.parteSeleccionadaParaAplicacion)
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> El Registro ha sido eliminado: <strong>' + response.data.aplid + '</strong>'
                    });
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        };
    }]);
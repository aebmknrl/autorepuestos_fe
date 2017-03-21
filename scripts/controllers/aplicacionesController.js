angular
    .module('autorepuestosApp')
    .controller('aplicacionesController', ['$scope', '$state', '$http', 'storageService', 'endpointApiURL', 'ngToast', '$uibModal', '$log', '$confirm', '$rootScope', 'toastMsgService', '$document', '$log', 'countryService', '$window', '$httpParamSerializerJQLike', '$timeout', function ($scope, $state, $http, storageService, endpointApiURL, ngToast, $uibModal, $log, $confirm, $rootScope, toastMsgService, $document, $log, countryService, $window, $httpParamSerializerJQLike, $timeout) {
        // Set the username for the app
        $rootScope.username = storageService.getUserData('username');
        $rootScope.userrole = storageService.getUserData('role');
        // Initializing vars
        var aplicacionesc = this;

        aplicacionesc.allLoad = false;
        aplicacionesc.filter = "";
        aplicacionesc.orderBy = "aplId";
        aplicacionesc.orderDirection = false; // False = Ascendent
        aplicacionesc.searchText = "";
        aplicacionesc.editing = false;
        aplicacionesc.loadingEditing = false;
        aplicacionesc.loadingData = false;


        aplicacionesc.parteSeleccionada = null;
        aplicacionesc.vehiculosSeleccionados = null;

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
            aplicacionesc.getVehiculos(Qty, 1, searchText);
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

        $scope.AplicacionesPromise = aplicacionesc.getPartes()
            .then(function (response) {
                $scope.AplicacionesPromise = aplicacionesc.getVehiculos()
                    .then(function (response) {
                        //console.log(aplicacionesc.vehiculos)
                        //finnished
                    });
            });

        $scope.verAplicacion = function () {
            console.log(aplicacionesc.vehiculosSeleccionados);
        }
    }]);
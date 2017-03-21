angular
    .module('autorepuestosApp')
    .controller('vehiculosController', ['$scope', '$state', '$http', 'storageService', 'endpointApiURL', 'ngToast', '$uibModal', '$log', '$confirm', '$rootScope', 'toastMsgService', '$document', '$log', 'countryService', '$window', '$httpParamSerializerJQLike', '$timeout', function ($scope, $state, $http, storageService, endpointApiURL, ngToast, $uibModal, $log, $confirm, $rootScope, toastMsgService, $document, $log, countryService, $window, $httpParamSerializerJQLike, $timeout) {

        // Set the username for the app
        $rootScope.username = storageService.getUserData('username');
        $rootScope.userrole = storageService.getUserData('role');
        // Initializing vars
        var vehiculosc = this;

        vehiculosc.allLoad = false;
        vehiculosc.filter = "";
        vehiculosc.orderBy = "vehId";
        vehiculosc.orderDirection = false; // False = Ascendent
        vehiculosc.searchText = "";
        vehiculosc.editing = false;
        vehiculosc.loadingEditing = false;
        vehiculosc.loadingData = false;

        //Vacío por ahora
        vehiculosc.selectedItem = {};
        //

        vehiculosc.newItem = {
            anioAniId: '',
            vehVin: '',
            vehFabDesde: '',
            vehFabHasta: '',
            vehVariante: '',
            vehCilindros: '',
            vehLitros: '',
            vehValvulas: '',
            vehLevas: '',
            vehVersion: '',
            vehTipo: '',
            vehTraccion: '',
            vehCaja: '',
            vehObservacion: '' //falta imagenes
        };

        vehiculosc.filterEstatus = "";
        vehiculosc.filterEstatusStrict = false;


        vehiculosc.isAddNewVehiculo = false;
        // Obtain the items per page
        $scope.QtyPageTables = storageService.getQtyPageTables();

        //Toggles the filter strict on or off
        vehiculosc.toggleFilterEstatusStrict = function (value) {
            vehiculosc.filterEstatusStrict = value;
        };

        //Change the orderby 
        vehiculosc.changeOrderByOrDirection = function (orderByItem) {
            vehiculosc.orderBy = orderByItem;
            if (vehiculosc.orderDirection == true) {
                vehiculosc.orderDirection = false;
            } else {
                vehiculosc.orderDirection = true;
            }
        };

        // Change the items per page
        vehiculosc.ChangeQtyPagesTables = function (Qty, searchText) {
            storageService.setQtyPageTables(Qty);
            $scope.QtyPageTables = storageService.getQtyPageTables();
            vehiculosc.getVehiculos(Qty, 1, searchText);
        }

        // Copy temporally item data for edit
        vehiculosc.copyRowData = function (id) {
            vehiculosc.editing = true;
            vehiculosc.loadingEditing = true;
            vehiculosc.selectedItem.vehId = id;
            $scope.VehiculosPromise = vehiculosc.getVehiculo(id)
                .then(function (response) {
                    vehiculosc.selectedItem = vehiculosc.vehiculo;
                    vehiculosc.loadingEditing = false;
                });
        }

        // Get a specific Vehiculo
        vehiculosc.getVehiculo = function (id) {
            var url = endpointApiURL.url + "/vehiculo/" + id; //cambiar a vehiculos despues
            return $http.get(url)
                .then(function (response) {
                    vehiculosc.vehiculo = response.data;
                    return true;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }

        // Remove item
        vehiculosc.removeVehiculo = function (id) {
            url = endpointApiURL.url + "/vehiculo/delete/" + id;
            $scope.VehiculosPromise = $http.delete(url)
                .then(function (response) {
                    // console.log(response.data);
                    vehiculosc.getVehiculos($scope.QtyPagesSelected, vehiculosc.CurrentPage, vehiculosc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> El Registro ha sido eliminado: <strong>' + response.data.vehid + '</strong>'
                    });
                    vehiculosc.selectedItem.id = 0;
                })
                .catch(function (error) {
                    //console.log(error);
                    toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);

                });
        };

        // Add item
        vehiculosc.addVehiculo = function (anioAniId, vehCilindros, vehLitros, vehValvulas, vehLevas, vehVersion, vehTipo, vehTraccion, vehCaja, vehObservacion, vehFabDesde, vehFabHasta, modeloMod) {
            // Scroll to top of the page when save
            $window.scrollTo(0, 0);

            if (vehFabDesde == '') {
                vehFabDesde = null;
            }
            if (vehFabHasta == '') {
                vehFabHasta = null;
            }
            url = endpointApiURL.url + "/vehiculo/add";
            $scope.VehiculosPromise = $http.post(
                    url, {
                        vehCilindros: vehCilindros,
                        anioAniId: anioAniId,
                        vehLitros: vehLitros,
                        vehValvulas: vehValvulas,
                        vehLevas: vehLevas,
                        vehVersion: vehVersion,
                        vehTipo: vehTipo,
                        vehTraccion: vehTraccion,
                        vehCaja: vehCaja,
                        vehObservacion: vehObservacion,
                        vehFabDesde: vehFabDesde,
                        vehFabHasta: vehFabHasta,
                        modeloMod: modeloMod.modId //falta imagenes
                    }
                )
                .then(function (response) {
                    //console.log(response.data);
                    vehiculosc.getVehiculos($scope.QtyPagesSelected, vehiculosc.CurrentPage, vehiculosc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Registro agregado: <strong>' + response.data.vehiculo[0].vehiculoid + '</strong>'
                    });
                    vehiculosc.selectedItem.id = 0;
                    vehiculosc.newItem = {
                        vehCilindros: '',
                        anioAniId: '',
                        vehLitros: '',
                        vehValvulas: '',
                        vehLevas: '',
                        vehVersion: '',
                        vehTipo: '',
                        vehTraccion: '',
                        vehCaja: '',
                        vehObservacion: '',
                        vehFabDesde: '',
                        vehFabHasta: '',
                        modeloMod: '' //falta imagenes
                    };
                    $scope.newVehiculoForm.modeloMod.$touched = false;
                    vehiculosc.isAddNewVehiculo = false;

                })
                .catch(function (error) {
                    //console.log(error);
                    toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);
                });
        }

        vehiculosc.updateVehiculo = function (vehId, anioAniId, vehCilindros, vehLitros, vehValvulas, vehLevas, vehVersion, vehTipo, vehTraccion, vehCaja, vehObservacion, vehFabDesde, vehFabHasta, modeloMod) {
            // Scroll to top of the page when save
            $window.scrollTo(0, 0);

            if (!vehId || !modeloMod) {
                return false;
            }
            if (vehFabDesde == '') {
                vehFabDesde = null;
            }
            if (vehFabHasta == '') {
                vehFabHasta = null;
            }
            url = endpointApiURL.url + "/vehiculo/edit/" + vehId;
            $scope.VehiculosPromise = $http.post(
                    url, {
                        vehId: vehId,
                        vehCilindros: vehCilindros,
                        anioAniId: anioAniId,
                        vehLitros: vehLitros,
                        vehValvulas: vehValvulas,
                        vehLevas: vehLevas,
                        vehVersion: vehVersion,
                        vehTipo: vehTipo,
                        vehTraccion: vehTraccion,
                        vehCaja: vehCaja,
                        vehObservacion: vehObservacion,
                        vehFabDesde: vehFabDesde,
                        vehFabHasta: vehFabHasta,
                        modeloMod: modeloMod.modId //falta imagenes
                    }
                )
                .then(function (response) {
                    //console.log(response.data);
                    vehiculosc.getVehiculos($scope.QtyPagesSelected, vehiculosc.CurrentPage, vehiculosc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Cambios guardados'
                    });
                    vehiculosc.selectedItem.id = 0;
                    // Redirect once the edit ends
                    $state.go('vehiculos', {}, {
                        reload: true
                    });
                }).catch(function (error) {
                    //console.log(error);
                    toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);
                });

        }
        // Get items
        vehiculosc.getVehiculos = function (limit, page, searchText) {

            if (searchText !== undefined) {
                if (searchText !== "") {
                    var url = endpointApiURL.url + "/vehiculo/" + limit + "/" + page + "/" + searchText;
                } else {
                    var url = endpointApiURL.url + "/vehiculo/" + limit + "/" + page;
                }

            } else {
                var url = endpointApiURL.url + "/vehiculo/" + limit + "/" + page;
            }
            //console.log('The parameters send are: URL=' + url);
            $scope.VehiculosPromise = $http.get(url)
                .then(function (response) {
                    //console.log(response.data.vehiculos);
                    vehiculosc.allLoad = false;
                    vehiculosc.CurrentPage = page;
                    vehiculosc.vehiculos = response.data.vehiculos;
                    vehiculosc.totalVehiculos = response.data.totalVehiculos;
                    vehiculosc.totalVehiculosReturned = response.data.totalVehiculosReturned;
                    if ((limit == 'todos') || (limit == 'Todos')) {
                        vehiculosc.totalPages = 1;
                        vehiculosc.actualRange = "Mostrando todos los registros (" + vehiculosc.totalVehiculosReturned + ")";
                    } else {
                        vehiculosc.totalPages = Math.ceil(vehiculosc.totalVehiculos / limit);
                        vehiculosc.pageFrom = (limit * page) - (limit - 1);
                        vehiculosc.pageTo = (vehiculosc.pageFrom + vehiculosc.totalVehiculosReturned) - 1;
                        vehiculosc.actualRange = "Mostrando registros " + vehiculosc.pageFrom + " a " + vehiculosc.pageTo + " de " + vehiculosc.totalVehiculos
                    };
                    vehiculosc.getModelos();
                    vehiculosc.allLoad = true;
                })
                .catch(function (error) {
                    //console.log(error);
                    toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);
                });
        }

        // Set page
        vehiculosc.setPage = function (page) {
            vehiculosc.getVehiculos($scope.QtyPageTables, page);
        }

        // The default value on load controller:
        vehiculosc.getVehiculos($scope.QtyPageTables, 1);


        // This var lets to know if the user hits editar, eliminar or ver
        vehiculosc.selectedItemAction = '';

        vehiculosc.cancelAndBackFromEdit = function () {
            vehiculosc.editing = false;
            vehiculosc.loadingEditing = false;
            vehiculosc.selectedItem = {};

        }

        vehiculosc.getModelos = function () {
            var url = endpointApiURL.url + "/modelo";
            return $http.get(url)
                .then(function (response) {
                    vehiculosc.modelos = response.data;
                    //console.log(vehiculosc.modelos);
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        };

        vehiculosc.reloadDropDownData = function () {
            $scope.VehiculosPromise = vehiculosc.getModelos()
                .then(function (response) {})
        }

        // ----------- FOR MODAL OPERATIONS ----------------------------
        vehiculosc.animationsEnabled = true;
        vehiculosc.openModalView = function (id) {
            // Scroll to top of the page when save
            $window.scrollTo(0, 0);
            $scope.VehiculosPromise = vehiculosc.getVehiculo(id)
                .then(function () {
                    var modal = $uibModal.open({
                        animation: vehiculosc.animationsEnabled,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'vehiculosView.html',
                        controller: 'modalVehController',
                        controllerAs: '$ctrl',
                        appendTo: undefined,
                        resolve: {
                            items: function () {
                                return vehiculosc.vehiculo;
                            }
                        }
                    });
                    modal.result.then(function (selectedItem) {
                        // This part is used when user hits ok button
                        // Clear this variable to enable "Elmininar", "Nuevo" buttons again
                        vehiculosc.selectedItemAction = '';
                        //console.log(selectedItem);
                    }, function () {
                        // This part is used when user hits cancelar button
                        // Clear this variable to enable "Elmininar", "Nuevo" buttons again
                        vehiculosc.selectedItemAction = '';
                        //$log.info('Modal dismissed at: ' + new Date());
                    })
                });
        }


        //---- SELECT OF MODELOS ----
        // This select able to use filter and group

        vehiculosc.selectModeloGroup = function (item) {
            return item.marcaMar.marNombre;
            /*
            if (item.name[0] >= 'A' && item.name[0] <= 'M')
                    return 'From A - M';
        
            if (item.name[0] >= 'N' && item.name[0] <= 'Z')
                return 'From N - Z';           */
        };

    }])
angular
    .module('autorepuestosApp')
    .controller('fabricantesController', ['$scope', '$state', '$http', 'storageService', 'endpointApiURL', 'ngToast', '$uibModal', '$log', '$confirm', '$rootScope','countryService','toastMsgService', function ($scope, $state, $http, storageService, endpointApiURL, ngToast, $uibModal, $log, $confirm, $rootScope,countryService,toastMsgService) {
        // Set the username for the app
        $rootScope.username = storageService.getUserData('username');
        $rootScope.userrole = storageService.getUserData('role');
        // Initializing vars
        var fabricantesc = this;
        fabricantesc.allLoad = false;
        fabricantesc.filter = "";
        fabricantesc.orderBy = "fabId";
        fabricantesc.orderDirection = false; // False = Ascendent
        fabricantesc.searchText = "";
        fabricantesc.selectedItem = {
            id: '',
            nombre: '',
            descripcion: '',
            pais: '',
            tiempo: '',
        };
        fabricantesc.newItem = {
            nombre: '',
            descripcion: '',
            pais: '',
            tiempo: new Date(),
        };
        fabricantesc.filterEstatus = "";
        fabricantesc.filterEstatusStrict = false;
        fabricantesc.isAddNewFabricante = false;

        // Obtain the items per page
        $scope.QtyPageTables = storageService.getQtyPageTables();

        //Toggles the filter strict on or off
        fabricantesc.toggleFilterEstatusStrict = function (value) {
            fabricantesc.filterEstatusStrict = value;

        };

        //Change the orderby 
        fabricantesc.changeOrderByOrDirection = function (orderByItem) {
            fabricantesc.orderBy = orderByItem;
            if (fabricantesc.orderDirection == true) {
                fabricantesc.orderDirection = false;
            } else {
                fabricantesc.orderDirection = true;
            }
        };

        // Remove item
        fabricantesc.removeFabricante = function (id) {
            url = endpointApiURL.url + "/fabricante/delete/" + id;
            $scope.FabricantesPromise = $http.delete(url)
                .then(function (response) {
                    // console.log(response.data);
                    fabricantesc.getFabricantes($scope.QtyPagesSelected, fabricantesc.CurrentPage, fabricantesc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> El Registro ha sido eliminado: <strong>' + response.data.fabid + '</strong>'
                    });
                    fabricantesc.selectedItem.id = 0;
                })
                .catch(function (error) {
                    //console.log(error);
                   toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);

                });
        }

        // Change the items per page
        fabricantesc.ChangeQtyPagesTables = function (Qty, searchText) {
            storageService.setQtyPageTables(Qty);
            $scope.QtyPageTables = storageService.getQtyPageTables();
            fabricantesc.getFabricantes(Qty, 1, searchText);
        }

        // Copy temporally item data for edit
        fabricantesc.copyRowData = function (nombre, descripcion, pais, tiempo) {
            fabricantesc.selectedItem.nombre = nombre;
            fabricantesc.selectedItem.descripcion = descripcion;
            fabricantesc.selectedItem.pais = pais;
            fabricantesc.selectedItem.tiempo = tiempo;
        }


        // Add item
        fabricantesc.addFabricante = function (nombre, descripcion, pais, tiempo) {

            url = endpointApiURL.url + "/fabricante/add";
            $scope.FabricantesPromise = $http.post(
                    url, {
                        "nombre": nombre,
                        "descripcion": descripcion,
                        "pais": pais,
                        "tiempo": tiempo
                    }
                )
                .then(function (response) {
                    console.log(response.data.fabricantes);
                    fabricantesc.getFabricantes($scope.QtyPagesSelected, fabricantesc.CurrentPage, fabricantesc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Registro agregado: <strong>' + response.data.fabricantes[0].fabricante + '</strong>'
                    });
                    fabricantesc.selectedItem.id = 0;
                    fabricantesc.newItem = {
                        nombre: '',
                        descripcion: '',
                        pais: '',
                        tiempo: new Date(),
                    };
                    $scope.newFabricanteForm.nombre.$touched = false;
                    $scope.newFabricanteForm.descripcion.$touched = false;
                    $scope.newFabricanteForm.pais.$touched = false;
                    fabricantesc.isAddNewFabricante = false;
                })
                .catch(function (error) {
                    //console.log(error);
                   toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);
                });
        }

        // Update item
        fabricantesc.updateFabricante = function (id, nombre, descripcion, pais, tiempo) {
            if (!id || !nombre || !descripcion || !pais) {
                return false;
            }
            url = endpointApiURL.url + "/fabricante/edit/" + id;
            $scope.FabricantesPromise = $http.post(
                    url, {
                        "nombre": nombre,
                        "descripcion": descripcion,
                        "pais": pais,
                        "tiempo": tiempo
                    }
                )
                .then(function (response) {
                    //console.log(response.data);
                    fabricantesc.getFabricantes($scope.QtyPagesSelected, fabricantesc.CurrentPage, fabricantesc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Cambios guardados'
                    });
                    fabricantesc.selectedItem.id = 0;
                })
                .catch(function (error) {
                    //console.log(error);
                   toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);
                });
        }

        // Get items
        fabricantesc.getFabricantes = function (limit, page, searchText) {

            if (searchText !== undefined) {
                if (searchText !== "") {
                    var url = endpointApiURL.url + "/fabricante/" + limit + "/" + page + "/" + searchText;
                } else {
                    var url = endpointApiURL.url + "/fabricante/" + limit + "/" + page;
                }

            } else {
                var url = endpointApiURL.url + "/fabricante/" + limit + "/" + page;
            }
            //console.log('The parameters send are: URL=' + url);
            $scope.FabricantesPromise = $http.get(url)
                .then(function (response) {
                    //console.log(response.data.fabricantes);
                    fabricantesc.allLoad = false;
                    fabricantesc.CurrentPage = page;
                    fabricantesc.fabricantes = response.data.fabricantes;
                    fabricantesc.totalFabricantes = response.data.totalFabricantes;
                    fabricantesc.totalFabricantesReturned = response.data.totalFabricantesReturned;
                    if ((limit == 'todos') || (limit == 'Todos')) {
                        fabricantesc.totalPages = 1;
                        fabricantesc.actualRange = "Mostrando todos los registros (" + fabricantesc.totalFabricantesReturned + ")";
                    } else {
                        fabricantesc.totalPages = Math.ceil(fabricantesc.totalFabricantes / limit);
                        fabricantesc.pageFrom = (limit * page) - (limit - 1);
                        fabricantesc.pageTo = (fabricantesc.pageFrom + fabricantesc.totalFabricantesReturned) - 1;
                        fabricantesc.actualRange = "Mostrando registros " + fabricantesc.pageFrom + " a " + fabricantesc.pageTo + " de " + fabricantesc.totalFabricantes

                    };
                    fabricantesc.allLoad = true;

                })
                .catch(function (error) {
                    //console.log(error);
                   toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);
                });
        }

          // Set page
        fabricantesc.setPage = function (page) {
            fabricantesc.getFabricantes($scope.QtyPageTables, page);
        }

        // The default value on load controller:
        fabricantesc.getFabricantes($scope.QtyPageTables, 1);

        // Get the countrys 
        fabricantesc.paises = countryService.getCountrys();

        // Datepicket Options -----------------------------------------------------


    }])
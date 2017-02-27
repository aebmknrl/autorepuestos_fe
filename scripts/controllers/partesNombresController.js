angular
    .module('autorepuestosApp')
    .controller('partesNombresController', ['$scope', '$state', '$http', 'storageService', 'endpointApiURL', 'ngToast', '$confirm', '$rootScope', 'toastMsgService', function ($scope, $state, $http, storageService, endpointApiURL, ngToast, $confirm, $rootScope, toastMsgService) {
        // Set the username for the app
        $rootScope.username = storageService.getUserData('username');
        $rootScope.userrole = storageService.getUserData('role');
        // Initializing vars
        var pnombresc = this;

        pnombresc.allLoad = false;
        pnombresc.filter = "";
        pnombresc.orderBy = "parNombreId";
        pnombresc.orderDirection = false; // False = Ascendent
        pnombresc.searchText = "";
        pnombresc.selectedItem = {};
        pnombresc.newItem = {};
        pnombresc.listaNombrePartes = "";
        pnombresc.filterEstatus = "";
        pnombresc.filterEstatusStrict = false;
        pnombresc.selectedItemAction = '';

        pnombresc.isAddNewPartesNombre = false;
        // Obtain the items per page
        $scope.QtyPageTables = storageService.getQtyPageTables();

        //Toggles the filter strict on or off
        pnombresc.toggleFilterEstatusStrict = function (value) {
            pnombresc.filterEstatusStrict = value;

        };

        //Change the orderby 
        pnombresc.changeOrderByOrDirection = function (orderByItem) {
            pnombresc.orderBy = orderByItem;
            if (pnombresc.orderDirection == true) {
                pnombresc.orderDirection = false;
            } else {
                pnombresc.orderDirection = true;
            }
        };

        // Change the items per page
        pnombresc.ChangeQtyPagesTables = function (Qty, searchText) {
            storageService.setQtyPageTables(Qty);
            $scope.QtyPageTables = storageService.getQtyPageTables();
            pnombresc.getNombres(Qty, 1, searchText);
        }
        // Copy temporally item data for edit
        pnombresc.copyRowData = function (parNombre, parNombreIngles, parNombreOtros, parGrupoId) {
            pnombresc.selectedItem.parNombre = parNombre;
            pnombresc.selectedItem.parNombreIngles = parNombreIngles;
            pnombresc.selectedItem.parNombreOtros = parNombreOtros;
            pnombresc.selectedItem.parGrupoId = parGrupoId;
        }

        // Remove item
        pnombresc.removeNombre = function (parNombreId) {
            url = endpointApiURL.url + "/nombre_parte/delete/" + parNombreId;
            $scope.NombresPromise = $http.delete(url)
                .then(function (response) {
                    // console.log(response.data);
                    pnombresc.getNombres($scope.QtyPagesSelected, pnombresc.CurrentPage, pnombresc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> El Registro ha sido eliminado: <strong>' + response.data.parnombreid + '</strong>'
                    });
                    pnombresc.selectedItem.parNombreId = 0;
                })
                .catch(function (error) {
                    //console.log(error);
                    if (error.status == '500') {
                        toastMsgService.showMsg('Error: no se puede eliminar un registro asociado a otro elemento. Compruebe que no exista relación entre este elemento con otro e intente nuevamente.', 'danger');
                        //console.log('Error 500: ' + error.data.error);
                        return;
                    }
                    toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);

                });
        }

        // Add item
        pnombresc.addNombre = function (parNombre, parNombreIngles, parNombreOtros, parGrupoId) {
            if (!parNombre || !parGrupoId) {
                return false;
            }
            url = endpointApiURL.url + "/nombre_parte/add";
            $scope.NombresPromise = $http.post(
                    url, {
                        "parNombre": parNombre,
                        "parNombreIngles": parNombreIngles,
                        "parNombreOtros": parNombreOtros,
                        "parGrupo": parGrupoId.id
                    }
                )
                .then(function (response) {
                    //console.log(response.data.grupos);
                    pnombresc.getNombres($scope.QtyPagesSelected, pnombresc.CurrentPage, pnombresc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Registro agregado: <strong>' + response.data.nombrePartes[0].nombre + '</strong>'
                    });
                    pnombresc.selectedItem.parNombreId = 0;
                    pnombresc.newItem = {};
                    $scope.newPnombreForm.parNombre.$touched = false;
                    $scope.newPnombreForm.parGrupoId.$touched = false;
                    pnombresc.isAddNewPartesNombre = false;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                    if (error.status == '409') {
                        toastMsgService.showMsg('Error: El nombre que desea crear ya existe.', 'danger');
                        //console.log('Error 500: ' + error.data.error);
                        return;
                    }
                });
        }

        // Update item
        pnombresc.updateNombre = function (parNombreId, parNombre, parNombreIngles, parNombreOtros, parGrupoId) {
            if (!parNombreId || !parNombre || !parGrupoId) {
                return false;
            }
            url = endpointApiURL.url + "/nombre_parte/edit/" + parNombreId;
            $scope.NombresPromise = $http.post(
                    url, {
                        "parNombre": parNombre,
                        "parNombreIngles": parNombreIngles,
                        "parNombreOtros": parNombreOtros,
                        "parGrupo": parGrupoId.id
                    }
                )
                .then(function (response) {
                    //console.log(response.data);
                    pnombresc.getNombres($scope.QtyPagesSelected, pnombresc.CurrentPage, pnombresc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Cambios guardados'
                    });
                    pnombresc.selectedItem.parNombreId = 0;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }


        // Get items
        pnombresc.getNombres = function (limit, page, searchText) {
            if (searchText !== undefined) {
                if (searchText !== "") {
                    var url = endpointApiURL.url + "/nombre_parte/" + limit + "/" + page + "/" + searchText;
                } else {
                    var url = endpointApiURL.url + "/nombre_parte/" + limit + "/" + page;
                }
            } else {
                var url = endpointApiURL.url + "/nombre_parte/" + limit + "/" + page;
            }
            //console.log('The parameters send are: URL=' + url);
            $scope.NombresPromise = $http.get(url)
                .then(function (response) {
                    //console.log(response.data.nombrePartes);
                    pnombresc.allLoad = false;
                    pnombresc.CurrentPage = page;
                    pnombresc.nombrePartes = response.data.nombrePartes;
                    pnombresc.totalNombrePartes = response.data.totalNombrePartes;
                    pnombresc.totalNombrePartesReturned = response.data.totalNombrePartesReturned;
                    if ((limit == 'todos') || (limit == 'Todos')) {
                        pnombresc.totalPages = 1;
                        pnombresc.actualRange = "Mostrando todos los registros (" + pnombresc.totalNombrePartesReturned + ")";
                    } else {
                        pnombresc.totalPages = Math.ceil(pnombresc.nombrePartes / limit);
                        pnombresc.pageFrom = (limit * page) - (limit - 1);
                        pnombresc.pageTo = (pnombresc.pageFrom + pnombresc.totalNombrePartesReturned) - 1;
                        pnombresc.actualRange = "Mostrando registros " + pnombresc.pageFrom + " a " + pnombresc.pageTo + " de " + pnombresc.totalNombrePartes

                    };
                    pnombresc.allLoad = true;

                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }
        // Set page
        pnombresc.setPage = function (page) {
            pnombresc.getNombres($scope.QtyPageTables, page);
        }

        // The default value on load controller:
        pnombresc.getNombres($scope.QtyPageTables, 1);


        // Get the Marcas for Modelos entity
        pnombresc.getGrupos = function () {
                var url = endpointApiURL.url + "/grupo";
                $scope.NombresPromise = $http.get(url)
                    .then(function (response) {
                        pnombresc.grupos = response.data;
                        //console.log(response);
                    })
                    .catch(function (error) {
                        console.log(error);
                        if (error.status == '412') {
                            console.log('Error obteniendo datos: ' + error.data.error);
                        }
                    });
            }
        // Call get Marcas to populate the select
        pnombresc.getGrupos();



    }])
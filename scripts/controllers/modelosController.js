angular
    .module('autorepuestosApp')
    .controller('modelosController', ['$scope', '$state', '$http', 'storageService', 'endpointApiURL', 'ngToast', '$uibModal', '$log', '$confirm', '$rootScope','toastMsgService', function ($scope, $state, $http, storageService, endpointApiURL, ngToast, $uibModal, $log, $confirm, $rootScope,toastMsgService) {
        // Set the username for the app
        $rootScope.username = storageService.getUserData('username');
        $rootScope.userrole = storageService.getUserData('role');
        // Initializing vars
        var modelosc = this;

        modelosc.allLoad = false;
        modelosc.filter = "";
        modelosc.orderBy = "modId";
        modelosc.orderDirection = false; // False = Ascendent
        modelosc.searchText = "";
        modelosc.selectedItem = {
            id: '',
            nombre: '',
            marca: '',
            observacion: '',
        };
        modelosc.newItem = {
            nombre: '',
            marca: '',
            observacion: ''
        };

        modelosc.filterEstatus = "";
        modelosc.filterEstatusStrict = false;


        modelosc.isAddNewModelo = false;
        // Obtain the items per page
        $scope.QtyPageTables = storageService.getQtyPageTables();

        //Toggles the filter strict on or off
        modelosc.toggleFilterEstatusStrict = function (value) {
            modelosc.filterEstatusStrict = value;

        };

        //Change the orderby 
        modelosc.changeOrderByOrDirection = function (orderByItem) {
            modelosc.orderBy = orderByItem;
            if (modelosc.orderDirection == true) {
                modelosc.orderDirection = false;
            } else {
                modelosc.orderDirection = true;
            }
        };
        // Remove item
        modelosc.removeModelo = function (id) {
            url = endpointApiURL.url + "/modelo/delete/" + id;
            $scope.ModelosPromise = $http.delete(url)
                .then(function (response) {
                    // console.log(response.data);
                    modelosc.getModelos($scope.QtyPagesSelected, modelosc.CurrentPage, modelosc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> El Registro ha sido eliminado: <strong>' + response.data.modid + '</strong>'
                    });
                    modelosc.selectedItem.id = 0;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }

        // Change the items per page
        modelosc.ChangeQtyPagesTables = function (Qty, searchText) {
            storageService.setQtyPageTables(Qty);
            $scope.QtyPageTables = storageService.getQtyPageTables();
            modelosc.getModelos(Qty, 1, searchText);
        }

        // Copy temporally item data for edit
        modelosc.copyRowData = function (nombre, marca, observacion) {
            modelosc.selectedItem.nombre = nombre;
            modelosc.selectedItem.marca = marca;
            modelosc.selectedItem.observacion = observacion;
        }

        // Add item
        modelosc.addModelo = function (nombre, marca, observacion) {

            url = endpointApiURL.url + "/modelo/add";
            $scope.ModelosPromise = $http.post(
                    url, {
                        "nombre": nombre,
                        "marcaid": marca.marId,
                        "observacion": observacion
                    }
                )
                .then(function (response) {
                    console.log(response.data.modelos);
                    modelosc.getModelos($scope.QtyPagesSelected, modelosc.CurrentPage, modelosc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Registro agregado: <strong>' + response.data.modelos[0].modelo + '</strong>'
                    });
                    modelosc.selectedItem.id = 0;
                    modelosc.newItem = {
                        nombre: '',
                        marca: '',
                        observacion: ''
                    };
                    $scope.newModeloForm.nombre.$touched = false;
                    $scope.newModeloForm.marca.$touched = false;
                    modelosc.isAddNewModelo = false;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }


        // Update item
        modelosc.updateModelo = function (id, nombre, marca, observacion) {
            if (!id || !nombre || !marca) {
                return false;
            }
            url = endpointApiURL.url + "/modelo/edit/" + id;
            $scope.ProveedoresPromise = $http.post(
                    url, {
                        "nombre": nombre,
                        "marcaid": marca.marId,
                        "observacion": observacion
                    }
                )
                .then(function (response) {
                    //console.log(response.data);
                    modelosc.getModelos($scope.QtyPagesSelected, modelosc.CurrentPage, modelosc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Cambios guardados'
                    });
                    modelosc.selectedItem.id = 0;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }

        // Get items
        modelosc.getModelos = function (limit, page, searchText) {

            if (searchText !== undefined) {
                if (searchText !== "") {
                    var url = endpointApiURL.url + "/modelo/" + limit + "/" + page + "/" + searchText;
                } else {
                    var url = endpointApiURL.url + "/modelo/" + limit + "/" + page;
                }

            } else {
                var url = endpointApiURL.url + "/modelo/" + limit + "/" + page;
            }
            //console.log('The parameters send are: URL=' + url);
            $scope.ModelosPromise = $http.get(url)
                .then(function (response) {
                    //console.log(response.data.modelos);
                    modelosc.allLoad = false;
                    modelosc.CurrentPage = page;
                    modelosc.modelos = response.data.modelos;
                    modelosc.totalModelos = response.data.totalModelos;
                    modelosc.totalModelosReturned = response.data.totalModelosReturned;
                    if ((limit == 'todos') || (limit == 'Todos')) {
                        modelosc.totalPages = 1;
                        modelosc.actualRange = "Mostrando todos los registros (" + modelosc.totalModelosReturned + ")";
                    } else {
                        modelosc.totalPages = Math.ceil(modelosc.totalModelos / limit);
                        modelosc.pageFrom = (limit * page) - (limit - 1);
                        modelosc.pageTo = (modelosc.pageFrom + modelosc.totalModelosReturned) - 1;
                        modelosc.actualRange = "Mostrando registros " + modelosc.pageFrom + " a " + modelosc.pageTo + " de " + modelosc.totalModelos

                    };
                    modelosc.allLoad = true;

                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }



        // Get the Marcas for Modelos entity
        modelosc.getMarcas = function () {
                var url = endpointApiURL.url + "/marca";
                $scope.ModelosPromise = $http.get(url)
                    .then(function (response) {
                        modelosc.marcas = response.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                        if (error.status == '412') {
                            console.log('Error obteniendo datos: ' + error.data.error);
                        }
                    });
            }
            // Call get Marcas to populate the select
        modelosc.getMarcas();

        // Set page
        modelosc.setPage = function (page) {
            modelosc.getModelos($scope.QtyPageTables, page);
        }

        // The default value on load controller:
        modelosc.getModelos($scope.QtyPageTables, 1);


    }])
angular
    .module('autorepuestosApp')
    .controller('proveedoresController', ['$scope', '$state', '$http', 'storageService', 'endpointApiURL', 'ngToast', '$uibModal', '$log', '$confirm', '$rootScope', function ($scope, $state, $http, storageService, endpointApiURL, ngToast, $uibModal, $log, $confirm, $rootScope) {
        // Set the username for the app
        $rootScope.username = storageService.getUserData('username');
        $rootScope.userrole = storageService.getUserData('role');
        // Initializing vars
        var proveedoresc = this;
        proveedoresc.allLoad = false;
        proveedoresc.filter = "";
        proveedoresc.searchText = "";
        proveedoresc.selectedItem = {
            id: '',
            nombre: '',
            rif: '',
            direccion: '',
            estatus: '',
            observacion: '',
        };
        proveedoresc.newItem = {
            nombre: '',
            rif: '',
            direccion: '',
            estatus: true,
            observacion: ''
        };
        proveedoresc.isAddNewProveedor = false;
        // Obtain the items per page
        $scope.QtyPageTables = storageService.getQtyPageTables();

        // Remove item
        proveedoresc.removeProveedor = function (id) {
                url = endpointApiURL.url + "/proveedor/delete/" + id;
                $scope.ProveedoresPromise = $http.delete(url)
                    .then(function (response) {
                        proveedoresc.getProveedores($scope.QtyPagesSelected, proveedoresc.CurrentPage, proveedoresc.searchText);
                        ngToast.create({
                            className: 'info',
                            content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> El Registro ha sido eliminado: <strong>' + response.data.proveedorid + '</strong>'
                        });
                        proveedoresc.selectedItem.id = 0;
                    })
                    .catch(function (error) {
                        console.log(error);
                        if (error.status == '412') {
                            console.log('Error obteniendo datos: ' + error.data.error);
                        }
                    });
            }
            // Change the items per page
        proveedoresc.ChangeQtyPagesTables = function (Qty, searchText) {
                storageService.setQtyPageTables(Qty);
                $scope.QtyPageTables = storageService.getQtyPageTables();
                proveedoresc.getProveedores(Qty, 1, searchText);
            }
            // Copy temporally item data for edit
        proveedoresc.copyRowData = function (nombre, direccion, rif, estatus, observacion) {
                proveedoresc.selectedItem.nombre = nombre;
                proveedoresc.selectedItem.direccion = direccion;
                proveedoresc.selectedItem.rif = rif;
                if (estatus == 'ACTIVO') {
                    proveedoresc.selectedItem.estatus = true;
                } else {
                    proveedoresc.selectedItem.estatus = false;
                }
                proveedoresc.selectedItem.observacion = observacion;
            }
            // Add new item
        proveedoresc.addProveedor = function (nombre, direccion, rif, estatus, observacion) {

            if (estatus == true) {
                estatus = "ACTIVO";
            } else {
                estatus = "INACTIVO";
            }

            url = endpointApiURL.url + "/proveedor/add";
            $scope.ProveedoresPromise = $http.post(
                    url, {
                        "nombre": nombre,
                        "direccion": direccion,
                        "rif": rif,
                        "estatus": estatus,
                        "observacion": observacion
                    }
                )
                .then(function (response) {
                    //console.log(response.data.proveedor[0]);
                    proveedoresc.getProveedores($scope.QtyPagesSelected, proveedoresc.CurrentPage, proveedoresc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Registro agregado: <strong>' + response.data.proveedor[0].proveedor + '</strong>'
                    });
                    proveedoresc.selectedItem.id = 0;
                    proveedoresc.newItem = {
                        nombre: '',
                        rif: '',
                        direccion: '',
                        estatus: '',
                        observacion: ''
                    };
                    $scope.newProveedorForm.nombre.$touched = false;
                    $scope.newProveedorForm.rif.$touched = false;
                    proveedoresc.isAddNewProveedor = false;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }

        // Update item
        proveedoresc.updateProveedor = function (id, nombre, direccion, rif, estatus, observacion) {
            if (!id || !nombre || !rif) {
                return false;
            }

            if (estatus == true) {
                estatus = "ACTIVO";
            } else {
                estatus = "INACTIVO";
            }

            url = endpointApiURL.url + "/proveedor/edit/" + id;
            $scope.ProveedoresPromise = $http.post(
                    url, {
                        "nombre": nombre,
                        "direccion": direccion,
                        "rif": rif,
                        "estatus": estatus,
                        "observacion": observacion
                    }
                )
                .then(function (response) {
                    //console.log(response.data);
                    proveedoresc.getProveedores($scope.QtyPagesSelected, proveedoresc.CurrentPage, proveedoresc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Cambios guardados'
                    });
                    proveedoresc.selectedItem.id = 0;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }

        // Get items
        proveedoresc.getProveedores = function (limit, page, searchText) {

            if (searchText !== undefined) {
                if (searchText !== "") {
                    var url = endpointApiURL.url + "/proveedor/" + limit + "/" + page + "/" + searchText;
                } else {
                    var url = endpointApiURL.url + "/proveedor/" + limit + "/" + page;
                }

            } else {
                var url = endpointApiURL.url + "/proveedor/" + limit + "/" + page;
            }
            //console.log('The parameters send are: URL=' + url);
            $scope.ProveedoresPromise = $http.get(url)
                .then(function (response) {
                    //console.log(response.data.proveedores);
                    proveedoresc.allLoad = false;
                    proveedoresc.CurrentPage = page;
                    proveedoresc.proveedores = response.data.proveedores;
                    proveedoresc.totalProveedores = response.data.totalProveedores;
                    proveedoresc.totalProveedoresReturned = response.data.totalProveedoresReturned;
                    if ((limit == 'todos') || (limit == 'Todos')) {
                        proveedoresc.totalPages = 1;
                        proveedoresc.actualRange = "Mostrando todos los registros (" + proveedoresc.totalProveedoresReturned + ")";
                    } else {
                        proveedoresc.totalPages = Math.ceil(proveedoresc.totalProveedores / limit);
                        proveedoresc.pageFrom = (limit * page) - (limit - 1);
                        proveedoresc.pageTo = (proveedoresc.pageFrom + proveedoresc.totalProveedoresReturned) - 1;
                        proveedoresc.actualRange = "Mostrando registros " + proveedoresc.pageFrom + " a " + proveedoresc.pageTo + " de " + proveedoresc.totalProveedores

                    }
                    proveedoresc.allLoad = true;

                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }

        proveedoresc.setPage = function (page) {
            proveedoresc.getProveedores($scope.QtyPageTables, page);
        }


        // The default value on load controller:
        proveedoresc.getProveedores($scope.QtyPageTables, 1);

    }])
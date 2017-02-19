angular
    .module('autorepuestosApp')
    .controller('gruposController', ['$scope', '$state', '$http', 'storageService', 'endpointApiURL', 'ngToast', '$confirm', '$rootScope', 'toastMsgService', function ($scope, $state, $http, storageService, endpointApiURL, ngToast, $confirm, $rootScope, toastMsgService) {
        // Set the username for the app
        $rootScope.username = storageService.getUserData('username');
        $rootScope.userrole = storageService.getUserData('role');
        // Initializing vars
        var gruposc = this;

        gruposc.allLoad = false;
        gruposc.filter = "";
        gruposc.orderBy = "id";
        gruposc.orderDirection = false; // False = Ascendent
        gruposc.searchText = "";
        gruposc.selectedItem = {};
        gruposc.newItem = {};
        gruposc.listaGrupos = "";
        gruposc.filterEstatus = "";
        gruposc.filterEstatusStrict = false;
        gruposc.selectedItemAction = '';

        gruposc.isAddNewGrupo = false;
        // Obtain the items per page
        $scope.QtyPageTables = storageService.getQtyPageTables();

        //Toggles the filter strict on or off
        gruposc.toggleFilterEstatusStrict = function (value) {
            gruposc.filterEstatusStrict = value;

        };

        //Change the orderby 
        gruposc.changeOrderByOrDirection = function (orderByItem) {
            gruposc.orderBy = orderByItem;
            if (gruposc.orderDirection == true) {
                gruposc.orderDirection = false;
            } else {
                gruposc.orderDirection = true;
            }
        };

        // Remove item
        gruposc.removeGrupo = function (id) {
            url = endpointApiURL.url + "/grupo/delete/" + id;
            $scope.GrupoPromise = $http.delete(url)
                .then(function (response) {
                    // console.log(response.data);
                    gruposc.getGrupos($scope.QtyPagesSelected, gruposc.CurrentPage, gruposc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> El Registro ha sido eliminado: <strong>' + response.data.id + '</strong>'
                    });
                    gruposc.selectedItem.id = 0;
                })
                .catch(function (error) {
                    //console.log(error);
                    if (error.status == '500') {
                         toastMsgService.showMsg('Error: no se puede eliminar un registro asociado a otro elemento. Compruebe que no exista relación entre este elemento con otro e intente nuevamente.','danger');
                         //console.log('Error 500: ' + error.data.error);
                         return;
                     }
                    toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);

                });
        }

        // Change the items per page
        gruposc.ChangeQtyPagesTables = function (Qty, searchText) {
            storageService.setQtyPageTables(Qty);
            $scope.QtyPageTables = storageService.getQtyPageTables();
            gruposc.getGrupos(Qty, 1, searchText);
        }

        // Copy temporally item data for edit
        gruposc.copyRowData = function (grupoNombre, grupoPadre, descripcion) {
            gruposc.selectedItem.grupoNombre = grupoNombre;
            gruposc.selectedItem.grupoPadre = grupoPadre;
            gruposc.selectedItem.descripcion = descripcion;
        }

        // Add item
        gruposc.addGrupo = function (grupoNombre, grupoPadre, descripcion) {

            url = endpointApiURL.url + "/grupo/add";
            $scope.GruposPromise = $http.post(
                    url, {
                        "nombre": grupoNombre,
                        "grupoPadre": grupoPadre.id,
                        "descripcion": descripcion
                    }
                )
                .then(function (response) {
                    //console.log(response.data.grupos);
                    gruposc.getGrupos($scope.QtyPagesSelected, gruposc.CurrentPage, gruposc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Registro agregado: <strong>' + response.data.grupos[0].grupo + '</strong>'
                    });
                    gruposc.selectedItem.id = 0;
                    gruposc.newItem = {};
                    $scope.newGrupoForm.grupoNombre.$touched = false;
                    $scope.newGrupoForm.grupoPadre.$touched = false;
                    gruposc.isAddNewGrupo = false;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }

        // Update item
        gruposc.updateGrupo = function (id, grupoNombre, grupoPadre, descripcion) {
            if (!id || !grupoNombre) {
                return false;
            }
            if (typeof grupoPadre !== 'undefined') {
                grupoPadre = grupoPadre.id;
            } else {
                grupoPadre = null;
            }
            url = endpointApiURL.url + "/grupo/edit/" + id;
            $scope.GruposPromise = $http.post(
                    url, {
                        "nombre": grupoNombre,
                        "grupoPadre": grupoPadre,
                        "descripcion": descripcion
                    }
                )
                .then(function (response) {
                    //console.log(response.data);
                    gruposc.getGrupos($scope.QtyPagesSelected, gruposc.CurrentPage, gruposc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Cambios guardados'
                    });
                    gruposc.selectedItem.id = 0;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }


        // Get items
        gruposc.getGrupos = function (limit, page, searchText) {

            if (searchText !== undefined) {
                if (searchText !== "") {
                    var url = endpointApiURL.url + "/grupo/" + limit + "/" + page + "/" + searchText;
                } else {
                    var url = endpointApiURL.url + "/grupo/" + limit + "/" + page;
                }

            } else {
                var url = endpointApiURL.url + "/grupo/" + limit + "/" + page;
            }
            //console.log('The parameters send are: URL=' + url);
            $scope.GruposPromise = $http.get(url)
                .then(function (response) {
                    //console.log(response.data.grupos);
                    gruposc.allLoad = false;
                    gruposc.CurrentPage = page;
                    gruposc.grupos = response.data.grupos;
                    gruposc.totalGrupos = response.data.totalGrupos;
                    gruposc.totalGruposReturned = response.data.totalGruposReturned;
                    if ((limit == 'todos') || (limit == 'Todos')) {
                        gruposc.totalPages = 1;
                        gruposc.actualRange = "Mostrando todos los registros (" + gruposc.totalGrupoesReturned + ")";
                    } else {
                        gruposc.totalPages = Math.ceil(gruposc.totalGrupos / limit);
                        gruposc.pageFrom = (limit * page) - (limit - 1);
                        gruposc.pageTo = (gruposc.pageFrom + gruposc.totalGruposReturned) - 1;
                        gruposc.actualRange = "Mostrando registros " + gruposc.pageFrom + " a " + gruposc.pageTo + " de " + gruposc.totalGrupos

                    };
                    gruposc.allLoad = true;
                    // Refresh select Grupo Padre
                    gruposc.populateGrupoPadreSelect();


                    // To show Grupos by hierarchy
                    gruposc.gruposHierarchy = _.groupBy(gruposc.grupos, function (b) {
                        if (b.grupoPadre != null) {
                            return b.grupoPadre.grupoNombre
                        }
                    })


                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }


        // Get the Grupos for Grupo Padre select
        gruposc.getGruposPadre = function () {
            var url = endpointApiURL.url + "/grupo";
            $scope.GruposPromise = $http.get(url)
                .then(function (response) {
                    gruposc.gruposPadre = response.data;
                    //console.log(gruposc.gruposPadre);
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }
        // Call get Grupos to populate the select Grupo Padre
        gruposc.getGruposPadre();


        // Get all Grupos
        gruposc.getAllGrupos = function () {
            var url = endpointApiURL.url + "/grupo";
            return $http.get(url)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }


        // Function that populates Grupo select
        gruposc.populateGrupoPadreSelect = function (grupoAExcluir) {
            var list = [];
            var parteAExcluir = parteAExcluir;
            $scope.PartesPromise = gruposc.getAllGrupos()
                .then(function (response) {
                    grupos = response;
                    //console.log(grupos);
                    grupos.forEach(function (element) {
                        if (element.id != parteAExcluir) {
                            list.push({
                                id: element.id,
                                label: element.grupoNombre
                            })
                        }
                    }, this);

                    gruposc.listaGrupos = list;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }
        // Call populate select (only new item)
        gruposc.populateGrupoPadreSelect();

        // Method for populate Grupo Padre by the selected item
        gruposc.getGruposPadreForItem = function (id) {
            var selectItems = [];
            for (var i = 0; i < gruposc.listaGrupos.length; i++) {
                if (gruposc.listaGrupos[i].id != id) {
                    selectItems.push(gruposc.listaGrupos[i]);
                }
            }
            return selectItems;
        }

        // Set page
        gruposc.setPage = function (page) {
            gruposc.getGrupos($scope.QtyPageTables, page);
        }

        // The default value on load controller:
        gruposc.getGrupos($scope.QtyPageTables, 1);

    }])
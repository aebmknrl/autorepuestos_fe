angular
    .module('autorepuestosApp')
    .controller('partesController', ['$scope', '$state', '$http', 'storageService', 'endpointApiURL', 'ngToast', '$uibModal', '$log', '$confirm', '$rootScope', 'toastMsgService', '$document', '$log', function ($scope, $state, $http, storageService, endpointApiURL, ngToast, $uibModal, $log, $confirm, $rootScope, toastMsgService, $document, $log) {
        // Set the username for the app
        $rootScope.username = storageService.getUserData('username');
        $rootScope.userrole = storageService.getUserData('role');
        // Initializing vars
        var partesc = this;

        partesc.allLoad = false;
        partesc.filter = "";
        partesc.orderBy = "parId";
        partesc.orderDirection = false; // False = Ascendent
        partesc.searchText = "";
        partesc.selectedItem = {
            id: '',
            nombre: '',
            nombrepieza: '',
            nombreinventario: '',
            paramazon: '',
            codigo: '',
            codigoupc: '',
            grupo: '',
            subgrupo: '',
            largo: '',
            ancho: '',
            espesor: '',
            peso: '',
            caracteristicas: '',
            observacion: '',
            kit: '',
            equivalencia: '',
            conjunto: '',
            fabricanteid: ''
        };
        partesc.newItem = {
            nombre: '',
            nombrepieza: '',
            nombreinventario: '',
            paramazon: '',
            codigo: '',
            codigoupc: '',
            grupo: '',
            subgrupo: '',
            largo: '',
            ancho: '',
            espesor: '',
            peso: '',
            caracteristicas: '',
            observacion: '',
            kit: '',
            equivalencia: '',
            conjunto: '',
            fabricanteid: ''
        };

        partesc.filterEstatus = "";
        partesc.filterEstatusStrict = false;


        partesc.isAddNewParte = false;
        // Obtain the items per page
        $scope.QtyPageTables = storageService.getQtyPageTables();

        //Toggles the filter strict on or off
        partesc.toggleFilterEstatusStrict = function (value) {
            partesc.filterEstatusStrict = value;

        };

        //Change the orderby 
        partesc.changeOrderByOrDirection = function (orderByItem) {
            partesc.orderBy = orderByItem;
            if (partesc.orderDirection == true) {
                partesc.orderDirection = false;
            } else {
                partesc.orderDirection = true;
            }
        };

        // Remove item
        partesc.removeParte = function (id) {
            url = endpointApiURL.url + "/parte/delete/" + id;
            $scope.PartesPromise = $http.delete(url)
                .then(function (response) {
                    // console.log(response.data);
                    partesc.getModelos($scope.QtyPagesSelected, partesc.CurrentPage, partesc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> El Registro ha sido eliminado: <strong>' + response.data.modid + '</strong>'
                    });
                    partesc.selectedItem.id = 0;
                })
                .catch(function (error) {
                    //console.log(error);
                    toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);

                });
        }

        // Change the items per page
        partesc.ChangeQtyPagesTables = function (Qty, searchText) {
            storageService.setQtyPageTables(Qty);
            $scope.QtyPageTables = storageService.getQtyPageTables();
            partesc.getFabricantes(Qty, 1, searchText);
        }

        // Copy temporally item data for edit
        // This method appears not apply to Partes
        partesc.copyRowData = function (data) {
            // partesc.selectedItem.nombre = data;
        }

        // Add item
        partesc.addParte = function (nombre, nombrepieza, nombreinventario, paramazon, codigo, codigoupc, grupo, subgrupo, largo, ancho, espesor, peso, caracteristicas, observacion, kit, equivalencia, conjunto, fabricanteid) {

            url = endpointApiURL.url + "/parte/add";
            $scope.FabricantesPromise = $http.post(
                    url, {
                        "nombre": nombre,
                        "nombrepieza": nombrepieza,
                        "nombreinventario": nombreinventario,
                        "paramazon": paramazon,
                        "codigo": codigo,
                        "codigoupc": codigoupc,
                        "grupo": grupo,
                        "subgrupo": subgrupo,
                        "largo": largo,
                        "ancho": ancho,
                        "espesor": espesor,
                        "peso": peso,
                        "caracteristicas": caracteristicas,
                        "observacion": observacion,
                        "kit": kit,
                        "equivalencia": equivalencia,
                        "conjunto": conjunto,
                        "fabricanteid": fabricanteid
                    }
                )
                .then(function (response) {
                    //console.log(response.data.fabricantes);
                    partesc.getFabricantes($scope.QtyPagesSelected, partesc.CurrentPage, partesc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Registro agregado: <strong>' + response.data.parte[0].parte + '</strong>'
                    });
                    partesc.selectedItem.id = 0;
                    partesc.newItem = {
                        nombre: '',
                        nombrepieza: '',
                        nombreinventario: '',
                        paramazon: '',
                        codigo: '',
                        codigoupc: '',
                        grupo: '',
                        subgrupo: '',
                        largo: '',
                        ancho: '',
                        espesor: '',
                        peso: '',
                        caracteristicas: '',
                        observacion: '',
                        kit: '',
                        equivalencia: '',
                        conjunto: '',
                        fabricanteid: ''
                    };

                    $scope.newParteForm.nombre.$touched = false;
                    $scope.newParteForm.nombrepieza.$touched = false;
                    partesc.isAddNewParte = false;
                })
                .catch(function (error) {
                    //console.log(error);
                    toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);
                });
        }


        // Update item
        partesc.updateParte = function (nombre, nombrepieza, nombreinventario, paramazon, codigo, codigoupc, grupo, subgrupo, largo, ancho, espesor, peso, caracteristicas, observacion, kit, equivalencia, conjunto, fabricanteid) {
            if (!id || !nombre || !nombrepieza) {
                return false;
            }
            url = endpointApiURL.url + "/parte/edit/" + id;
            $scope.PartesPromise = $http.post(
                    url, {
                        "nombre": nombre,
                        "nombrepieza": nombrepieza,
                        "nombreinventario": nombreinventario,
                        "paramazon": paramazon,
                        "codigo": codigo,
                        "codigoupc": codigoupc,
                        "grupo": grupo,
                        "subgrupo": subgrupo,
                        "largo": largo,
                        "ancho": ancho,
                        "espesor": espesor,
                        "peso": peso,
                        "caracteristicas": caracteristicas,
                        "observacion": observacion,
                        "kit": kit,
                        "equivalencia": equivalencia,
                        "conjunto": conjunto,
                        "fabricanteid": fabricanteid
                    }
                )
                .then(function (response) {
                    //console.log(response.data);
                    partesc.getPartes($scope.QtyPagesSelected, partesc.CurrentPage, partesc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Cambios guardados'
                    });
                    partesc.selectedItem.id = 0;
                })
                .catch(function (error) {
                    //console.log(error);
                    toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);
                });
        }


        // Get items
        partesc.getPartes = function (limit, page, searchText) {
            // Dummy data to test
            partesc.partes = [{
                "parId": 1,
                "parNombre": 'nombre',
                "parNombret": 'nombrepieza',
                "parNombrein": 'nombreinventario',
                "parAsin": 'paramazon',
                "parCodigo": 'codigo',
                "parUpc": 'codigoupc',
                "parGrupo": 'grupo',
                "parSubgrupo": 'subgrupo',
                "parLargo": 'largo',
                "parAncho": 'ancho',
                "parEspesor": 'espesor',
                "parPeso": 'peso',
                "parCaract": 'caracteristicas',
                "parObservacion": 'observacion',
                "parKit": 'kit',
                "parEq": 'equivalencia',
                "kit": 'conjunto',
                "fabricanteFab": 'fabricanteid'
            }, ]
            partesc.totalPages = 1;
            partesc.pageFrom = 1;
            partesc.pageTo = 1;
            partesc.totalPartes = 1;
            partesc.actualRange = "Mostrando registros " + partesc.pageFrom + " a " + partesc.pageTo + " de " + partesc.totalPartes
            partesc.allLoad = true;
            // End of dummy data

            return true;

            if (searchText !== undefined) {
                if (searchText !== "") {
                    var url = endpointApiURL.url + "/parte/" + limit + "/" + page + "/" + searchText;
                } else {
                    var url = endpointApiURL.url + "/parte/" + limit + "/" + page;
                }

            } else {
                var url = endpointApiURL.url + "/parte/" + limit + "/" + page;
            }
            //console.log('The parameters send are: URL=' + url);
            $scope.PartesPromise = $http.get(url)
                .then(function (response) {
                    //console.log(response.data.fabricantes);
                    partesc.allLoad = false;
                    partesc.CurrentPage = page;
                    partesc.partes = response.data.partes;
                    partesc.totalPartes = response.data.totalPartes;
                    partesc.totalPartesReturned = response.data.totalPartesReturned;
                    if ((limit == 'todos') || (limit == 'Todos')) {
                        partesc.totalPages = 1;
                        partesc.actualRange = "Mostrando todos los registros (" + partesc.totalPartesReturned + ")";
                    } else {
                        partesc.totalPages = Math.ceil(partesc.totalPartes / limit);
                        partesc.pageFrom = (limit * page) - (limit - 1);
                        partesc.pageTo = (partesc.pageFrom + partesc.totalPartesReturned) - 1;
                        partesc.actualRange = "Mostrando registros " + partesc.pageFrom + " a " + partesc.pageTo + " de " + partesc.totalPartes

                    };
                    partesc.allLoad = true;

                })
                .catch(function (error) {
                    //console.log(error);
                    toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);
                });
        }
        // Set page
        partesc.setPage = function (page) {
            partesc.getPartes($scope.QtyPageTables, page);
        }

        // The default value on load controller:
        partesc.getPartes($scope.QtyPageTables, 1);


        // Get the Marcas for Modelos entity
        partesc.getFabricantes = function () {
            var url = endpointApiURL.url + "/fabricante";
            $scope.PartesPromise = $http.get(url)
                .then(function (response) {
                    partesc.fabricantes = response.data;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }

        // Call get Fabricantes to populate the select
        partesc.getFabricantes();


        // Get a specific Parte
        partesc.getParte = function (id) {
            var url = endpointApiURL.url + "/fabricante/" + id;
            return $http.get(url)
                .then(function (response) {
                    // Dummy data to test
                    var dummyPartes = [{
                        "parId": 1,
                        "parNombre": 'nombre',
                        "parNombret": 'nombrepieza',
                        "parNombrein": 'nombreinventario',
                        "parAsin": 'paramazon',
                        "parCodigo": 'codigo',
                        "parUpc": 'codigoupc',
                        "parGrupo": 'grupo',
                        "parSubgrupo": 'subgrupo',
                        "parLargo": 'largo',
                        "parAncho": 'ancho',
                        "parEspesor": 'espesor',
                        "parPeso": 'peso',
                        "parCaract": 'caracteristicas',
                        "parObservacion": 'observacion',
                        "parKit": 'kit',
                        "parEq": 'equivalencia',
                        "kit": 'conjunto',
                        "fabricanteFab": 'fabricanteid'
                    }, ]
                    partesc.parte = dummyPartes;
                    return true;
                    //end of dummy data

                    partesc.parte = response.data;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }


        // This var lets to know if the user hits editar, eliminar or ver
        partesc.selectedItemAction = '';

        // For Edit operations using modals
        partesc.openModalViewEdit = function (id,action) {
            $scope.PartesPromise = partesc.getParte(id)
                .then(function () {
                    //console.log(partesc.parte);
                    partesc.open(partesc.parte,action);
                });
        }

        // Modal
        partesc.animationsEnabled = true;

        partesc.open = function (parte,action) {
            var parte = parte;
            parte.push({
                action: action,
            });
            var modal = $uibModal.open({
                animation: partesc.animationsEnabled,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'partesView.html',
                controller: 'modalInstanceController',
                controllerAs: '$ctrl',
                appendTo: undefined,
                resolve: {
                    items: function () {
                        return parte;
                    }
                }
            });
            modal.result.then(function (selectedItem) {
                // This part is used when user hits ok button
                partesc.selected = selectedItem;
                // Clear this variable to enable "Elmininar", "Nuevo" buttons again
                partesc.selectedItemAction = '';
                //console.log( partesc.selected);
            }, function () {
                // This part is used when user hits cancelar button
                // Clear this variable to enable "Elmininar", "Nuevo" buttons again
                partesc.selectedItemAction = '';
                //$log.info('Modal dismissed at: ' + new Date());
            })
        }
    }])
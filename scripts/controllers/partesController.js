angular
    .module('autorepuestosApp')
    .controller('partesController', ['$scope', '$state', '$http', 'storageService', 'endpointApiURL', 'ngToast', '$uibModal', '$log', '$confirm', '$rootScope', 'toastMsgService', '$document', '$log', 'countryService', '$window', '$httpParamSerializerJQLike', function ($scope, $state, $http, storageService, endpointApiURL, ngToast, $uibModal, $log, $confirm, $rootScope, toastMsgService, $document, $log, countryService, $window, $httpParamSerializerJQLike) {
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
        partesc.editing = false;
        partesc.loadingEditing = false;
        partesc.multiselectData = []; // For edit kits
        partesc.multiselectDataNew = [] // For new items
        partesc.loadingData = false;
        partesc.EqPartsIsCollapsed = true;
        partesc.EqPartsIsCollapsedEdit = true;
        //Vacío por ahora
        partesc.selectedItem = {};
        //

        partesc.newItem = {
            parCodigo: '',
            fabricanteFab: '',
            parNombre: '',
            parGrupo: '',
            parUpc: '',
            parSku: '',
            parLargo: '',
            parAncho: '',
            parEspesor: '',
            parPeso: '',
            parOripar: '',
            parCaract: '',
            parObservacion: '',
            parKit: '' //falta imagenes
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
            //First, remove all references on conjuntos (removes the kit reference)
            url = endpointApiURL.url + "/conjunto/delete/allPartsOfKit/" + id;
            $scope.PartesPromise = $http({
                url: url,
                method: 'DELETE'
            }).then(function (response) {
                // Then, remove the part
                url = endpointApiURL.url + "/parte/delete/" + id;
                $scope.PartesPromise = $http.delete(url)
                    .then(function (response) {
                        // console.log(response.data);
                        partesc.getPartes($scope.QtyPagesSelected, partesc.CurrentPage, partesc.searchText);
                        ngToast.create({
                            className: 'info',
                            content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> El Registro ha sido eliminado: <strong>' + response.data.parnombreid + '</strong>'
                        });
                        partesc.selectedItem.id = 0;
                    })
                    .catch(function (error) {
                        //console.log(error);
                        toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);

                    });
            })
        }

        // Change the items per page
        partesc.ChangeQtyPagesTables = function (Qty, searchText) {
            storageService.setQtyPageTables(Qty);
            $scope.QtyPageTables = storageService.getQtyPageTables();
            partesc.getPartes(Qty, 1, searchText);
        }

        // Copy temporally item data for edit
        partesc.copyRowData = function (id) {
            partesc.editing = true;
            partesc.loadingEditing = true;
            partesc.selectedItem.parId = id;
            $scope.PartesPromise = partesc.getParte(id)
                .then(function (response) {
                    partesc.selectedItem = partesc.parte;
                    partesc.selectedItem.kitParts = response.data;
                    //console.log(partesc.selectedItem);
                    // Transform value for CheckBox "¿Es un Kit?"
                    if (partesc.selectedItem.parKit == 1) {
                        partesc.selectedItem.parKit = true;
                    } else {
                        partesc.selectedItem.parKit = false;
                    }
                    partesc.getEquivalentParts(partesc.selectedItem.parNombre.parNombreId,partesc.selectedItem.parNombre.parGrupo.id,partesc.selectedItem.parId);
                    partesc.loadingEditing = false;
                });
        }

        // Add item
        partesc.addParte = function (parCodigo, fabricanteFab, parNombre, parGrupo, parUpc, parSku, parLargo, parAncho, parEspesor, parPeso, parOripar, parCaract, parObservacion, parKit, kitParts) {
            // Scroll to top of the page when save
            $window.scrollTo(0, 0);

            if (parKit == "") {
                parKit = 0;
            } else {
                parKit = 1;
            }

            url = endpointApiURL.url + "/parte/add";
            $scope.PartesPromise = $http.post(
                    url, {
                        parCodigo: parCodigo,
                        fabricanteFab: fabricanteFab.fabId,
                        parNombre: parNombre.parNombreId,
                        parUpc: parUpc,
                        parSku: parSku,
                        parLargo: parLargo,
                        parAncho: parAncho,
                        parEspesor: parEspesor,
                        parPeso: parPeso,
                        parteOrigen: parOripar,
                        parCaract: parCaract,
                        parObservacion: parObservacion,
                        parKit: parKit //falta imagenes, parSubgrupo, parAsin, parEq
                    }
                )
                .then(function (response) {
                    //console.log(response.data.parte[0].id);
                    // Add kit if this new Parte has a kit:
                    // Add Conjunto if this new Parte has a kit:
                    var parId = response.data.parte[0].id;
                    var parteAgregada = response.data.parte[0].parte;

                    if (parKit == 1) {
                        //console.log(kitParts);
                        //Create a dynamic object to send to Conjuntos
                        partesDelKit = {};
                        for (i = 0; i < kitParts.length; i++) {
                            partesDelKit['parte' + i] = kitParts[i].id;
                        }

                        //console.log(partesDelKit);
                        url = endpointApiURL.url + "/conjunto/add/" + parId;
                        $scope.PartesPromise = $http({
                            url: url,
                            method: 'POST',
                            data: partesDelKit
                        }).then(function (response) {
                            //console.log(response.data);
                            partesc.getPartes($scope.QtyPagesSelected, partesc.CurrentPage, partesc.searchText);
                            ngToast.create({
                                className: 'info',
                                content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Registro agregado: <strong>' + parteAgregada + '</strong>'
                            });
                            partesc.selectedItem.id = 0;
                            partesc.newItem = {
                                parCodigo: '',
                                fabricanteFab: '',
                                parNombre: '',
                                parGrupo: '',
                                parUpc: '',
                                parSku: '',
                                parLargo: '',
                                parAncho: '',
                                parEspesor: '',
                                parPeso: '',
                                parOripar: '',
                                parCaract: '',
                                parObservacion: '',
                                parKit: '' //falta imagenes
                            };

                            $scope.newParteForm.parCodigo.$touched = false;
                            $scope.newParteForm.fabricanteFab.$touched = false;
                            $scope.newParteForm.parNombre.$touched = false;
                            partesc.isAddNewParte = false;
                        }).catch(function (error) {
                            //console.log(error);
                        })
                    } else {
                        //console.log(response.data);
                        partesc.getPartes($scope.QtyPagesSelected, partesc.CurrentPage, partesc.searchText);
                        ngToast.create({
                            className: 'info',
                            content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Registro agregado: <strong>' + parteAgregada + '</strong>'
                        });
                        partesc.selectedItem.id = 0;
                        partesc.newItem = {
                            parCodigo: '',
                            fabricanteFab: '',
                            parNombre: '',
                            parGrupo: '',
                            parUpc: '',
                            parSku: '',
                            parLargo: '',
                            parAncho: '',
                            parEspesor: '',
                            parPeso: '',
                            parOripar: '',
                            parCaract: '',
                            parObservacion: '',
                            parKit: '' //falta imagenes
                        };

                        $scope.newParteForm.parCodigo.$touched = false;
                        $scope.newParteForm.fabricanteFab.$touched = false;
                        $scope.newParteForm.parNombre.$touched = false;
                        partesc.isAddNewParte = false;
                    }


                })
                .catch(function (error) {
                    //console.log(error);
                    toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);
                });
        }


        // Update item
        partesc.updateParte = function (parId, parCodigo, fabricanteFab, parNombre, parGrupo, parUpc, parSku, parLargo, parAncho, parEspesor, parPeso, parOripar, parCaract, parObservacion, parKit, kitParts) {
            // Scroll to top of the page when save
            $window.scrollTo(0, 0);

            if (!parId || !parNombre || !parCodigo) {
                return false;
            }

            if (parKit == "") {
                parKit = 0;
            } else {
                parKit = 1;
            }

            url = endpointApiURL.url + "/parte/edit/" + parId;
            $scope.PartesPromise = $http.post(
                    url, {
                        parteid: parId,
                        parCodigo: parCodigo,
                        fabricanteFab: fabricanteFab.fabId,
                        parNombre: parNombre.parNombreId,
                        parUpc: parUpc,
                        parSku: parSku,
                        parLargo: parLargo,
                        parAncho: parAncho,
                        parEspesor: parEspesor,
                        parPeso: parPeso,
                        parteOrigen: parOripar,
                        parCaract: parCaract,
                        parObservacion: parObservacion,
                        parKit: parKit //falta imagenes, parSubgrupo, parAsin, parEq
                    }
                )
                .then(function (response) {
                    //console.log(parId);

                    // Add Conjunto if this new Parte has a kit:
                    // 1) Is checked 'Esta parte es un Kit'?
                    if (parKit == 1) {
                        // If yes, then delete if haves previous kits seted
                        url = endpointApiURL.url + "/conjunto/delete/allPartsOfKit/" + parId;
                        $scope.PartesPromise = $http({
                            url: url,
                            method: 'DELETE'
                        }).then(function (response) {
                            // Once that all previous parts has been deleted (if haves one)
                            // then add the new kit parts
                            //Create a dynamic object to send to Conjuntos
                            partesDelKit = {};
                            for (i = 0; i < kitParts.length; i++) {
                                partesDelKit['parte' + i] = kitParts[i].id;
                            }
                            // Add the parts of a kit
                            url = endpointApiURL.url + "/conjunto/add/" + parId;
                            $scope.PartesPromise = $http({
                                url: url,
                                method: 'POST',
                                data: partesDelKit
                            }).then(function (response) {
                                //console.log(response.data);
                                partesc.getPartes($scope.QtyPagesSelected, partesc.CurrentPage, partesc.searchText);
                                ngToast.create({
                                    className: 'info',
                                    content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Cambios guardados'
                                });
                                partesc.selectedItem.id = 0;
                                // Redirect once the edit ends
                                $state.go('partes', {}, {
                                    reload: true
                                });
                            }).catch(function (error) {
                                //console.log(error);
                            })

                        })
                    } else {
                        // If parKit = 0
                        // remove all the parts of a kit 
                        // if haves
                        url = endpointApiURL.url + "/conjunto/delete/allPartsOfKit/" + parId;
                        $scope.PartesPromise = $http({
                            url: url,
                            method: 'DELETE'
                        }).then(function (response) {
                            partesc.getPartes($scope.QtyPagesSelected, partesc.CurrentPage, partesc.searchText);
                            ngToast.create({
                                className: 'info',
                                content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Cambios guardados'
                            });
                            partesc.selectedItem.id = 0;
                            // Redirect once the edit ends
                            $state.go('partes', {}, {
                                reload: true
                            });
                        })
                    }
                })
                .catch(function (error) {
                    //console.log(error);
                    toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);
                });
        }


        // Get items
        partesc.getPartes = function (limit, page, searchText) {

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
                    //console.log(response.data.partes);
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
                    //console.log(partesc.fabricantes);
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

        // Get all partes
        partesc.getAllPartes = function () {
            var url = endpointApiURL.url + "/parte"; // cambiar a partes despues
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

        //Populate Multiselect 
        partesc.populateMultiselect = function (parteAExcluir) {
            var partes = [];
            var list = [];
            partesc.multiselectData = [];
            var parteAExcluir = parteAExcluir;
            $scope.PartesPromise = partesc.getAllPartes()
                .then(function (response) {
                    partes = response;
                    partes.forEach(function (element) {
                        if (element.parId != parteAExcluir) {
                            list.push({
                                id: element.parId,
                                label: element.parCodigo
                            })
                        }
                    }, this);

                    partesc.listaPartes = list;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
            var parte = parteAExcluir;
            if (parte != undefined) {
                // Code for mark the parts that haves a Kit
                $scope.PartesPromise = partesc.getParte(parte)
                    .then(function (response) {
                        url = endpointApiURL.url + "/conjunto/bypart/" + parte;
                        $scope.PartesPromise = $http.get(url)
                            .then(function (response) {
                                //console.log(response.data);
                                response.data.forEach(function (parte) {
                                    //console.log(parte.partePar.parId);
                                    partesc.multiselectData.push({
                                        'id': parte.partePar.parId
                                    })
                                }, this);
                            });
                    })
                    .catch(function (error) {
                        console.log(error);
                        if (error.status == '412') {
                            console.log('Error obteniendo datos: ' + error.data.error);
                        }
                    });
            }

        }


        // Get a specific Parte
        partesc.getParte = function (id) {
            var url = endpointApiURL.url + "/parte/" + id; //cambiar a partes despues
            return $http.get(url)
                .then(function (response) {
                    partesc.parte = response.data;
                    partesc.parte.kit = [];
                    return true;
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

        partesc.cancelAndBackFromEdit = function () {
            partesc.editing = false;
            partesc.loadingEditing = false;
            partesc.selectedItem = {};

        }

        // Get list of countrys
        var paises = countryService.getCountrys();
        paises.push("Multinación");
        partesc.paises = paises;

        // *************** MODAL OPERATIONS *********************************


        // For Edit operations using modals
        partesc.openModalViewEdit = function (id, action) {
            // Scroll to top of the page when save
            $window.scrollTo(0, 0);
            $scope.PartesPromise = partesc.getParte(id)
                .then(function () {
                    //console.log(partesc.parte);
                    url = endpointApiURL.url + "/conjunto/bypart/" + id;
                    $scope.PartesPromise = $http.get(url)
                        .then(function (response) {
                            partesc.parte.kitParts = response.data;
                            $scope.PartesPromise = partesc.getEquivalentParts(partesc.parte.parNombre.parNombreId,partesc.parte.parNombre.parGrupo.id,id)
                            .then(function(response){
                            partesc.parte.equivalentParts = partesc.equivalentParts;
                            partesc.open(partesc.parte, action);
                            });
                            //console.log(partesc.parte);
                        });
                });
        }

        // Modal
        partesc.animationsEnabled = true;

        partesc.open = function (parte, action) {
            // Setup the data that will be passed to modal
            var parte = parte;
            parte.action = action; // add the action that the modal will do
            parte.getFabricantes = function () {
                var prueba = partesc.getFabricantes();
                console.log('Llamaron a obtener fabricantes');
            }

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
                // Clear this variable to enable "Elmininar", "Nuevo" buttons again
                partesc.selectedItemAction = '';
                if(selectedItem != '' && selectedItem != undefined){
                   partesc.openModalViewEdit(selectedItem,'view');
                }
                //console.log(selectedItem);
            }, function () {
                // This part is used when user hits cancelar button
                // Clear this variable to enable "Elmininar", "Nuevo" buttons again
                partesc.selectedItemAction = '';
                //$log.info('Modal dismissed at: ' + new Date());
            })
        }


        //***************** MULTI SELECT  ********************/

        partesc.multiselectConfig = {
            enableSearch: true,
            scrollable: true,
            styleActive: true
        };
        partesc.translatedText = {
            buttonDefaultText: 'Seleccione Partes',
            searchPlaceholder: 'Buscar...',
            checkAll: 'Seleccionar todos',
            uncheckAll: 'Desmarcar todos',
            dynamicButtonTextSuffix: 'Parte(s) Seleccionada(s)'
        }

        partesc.getNombres = function () {
            var url = endpointApiURL.url + "/nombre_parte";
            $scope.PartesPromise = $http.get(url)
                .then(function (response) {
                    partesc.nombres = response.data;
                    //console.log(partesc.fabricantes);
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        };
        //Ask for partes nombres
        partesc.getNombres();

        //Update Grupo when Nombre is change
        partesc.updateAsociatedNameGroup = function (grupo) {
            if (grupo != undefined) {
                partesc.newItem.parGrupo = grupo.parGrupo;
            } else {
                partesc.newItem.parGrupo = "";
            }
            //when update the group then get equivalent parts
            //partesc.getEquivalentParts()
        };


        // Get Kit components for a Parte that is a Kit
        partesc.getKitParts = function (parteKitId) {
            var url = endpointApiURL.url + "/conjunto/bypart/" + parteKitId;
            return $http.get(url)
                .then(function (response) {
                    //console.log(response.data);
                    partesc.kitParts = response.data;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        };


        //Obtain equivalent parts
        partesc.getEquivalentParts = function(nombreid, grupoid, partid){
  
/*            console.log(nombreid);
            console.log(grupoid);
            console.log(partid);
            return false;*/

            partesc.loadingData = true;
            partesc.equivalentParts = [];
            if(!partid || partid == ''){
                // Obtain all equivalent parts for 1 specific group and name of part
                var url = endpointApiURL.url + "/parte/findEqualsParts/" + nombreid + "/" + grupoid;
                return $http.post(url)
                .then(function(response){
                    partesc.equivalentParts = response.data;
                    partesc.equivalentParts.qtyEqParts = partesc.equivalentParts.length;
                    partesc.loadingData = false;
                })
            } else {
                // Obtain all equivalent part for 1 specific group and name of part excluding a part from the return list
                var url = endpointApiURL.url + "/parte/findEqualsExcludePart/" + nombreid + "/" + grupoid + "/" + partid;
                return $http.post(url)
                .then(function(response){
                    partesc.equivalentParts = response.data;
                    partesc.equivalentParts.qtyEqParts = partesc.equivalentParts.length;
                    partesc.loadingData = false;
                });
            }
        }

    }])
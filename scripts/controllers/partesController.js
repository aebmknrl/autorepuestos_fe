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
        //Vacío por ahora
        partesc.selectedItem = {};
        //


        //*************DUMMY DATA*************/

        var dummyData = [{
            parId: '1',
            parCodigo: 'T312',
            fabricanteFab: {
                fabId: 34,
                fabNombre: 'GATES' //fabricante tiene otros campos que devuelve la API que obvié
            },
            parNombre: {
                nombreNom: 'CORREA A TIEMPO',
                nombreIng: 'TIMING BELT',
                nombreNomt: 'BANDA DE TIEMPO, CORREA DE TIEMPO, CORREA DENTADA, CORREA DE LOS TIEMPOS, BANDA DE LOS TIEMPOS',
                nombreGru: {
                    grupoNom: 'MOTOR',
                    grupoPad: '',
                    grupoDes: ''
                }
            },
            parGrupo: '',
            parUpc: '072053548969',
            parSku: 'GATES-T312',
            parLargo: '10.10',
            parAncho: '6.70',
            parEspesor: '1.60',
            parPeso: '0.40',
            parOripar: 'USA',
            parCaract: '7/8 pulgadas x 39 pulgadas(104 Dientes)',
            parObservacion: 'POWERGRIP PREMIUM Equipo Original',
            parKit: '0', //falta imagenes
            kit: []

        }, {
            parId: '2',
            parCodigo: 'T43175',
            fabricanteFab: {
                fabId: 34,
                fabNombre: 'GATES'
            },
            parNombre: {
                nombreNom: 'TENSOR TIEMPO',
                nombreIng: 'TIMING TENSOR',
                nombreNomt: 'TENSOR DE LOS TIEMPOS',
                nombreGru: {
                    grupoNom: 'MOTOR',
                    grupoPad: '',
                    grupoDes: ''
                }
            },
            parGrupo: '',
            parUpc: '0587878774',
            parSku: 'GATES-T43175',
            parLargo: '10.10',
            parAncho: '6.70',
            parEspesor: '1.60',
            parPeso: '0.40',
            parOripar: 'JAPON',
            parCaract: '7/8 pulgadas x 39 pulgadas(104 Dientes)',
            parObservacion: 'POWERGRIP PREMIUM Equipo Original',
            parKit: '0', //falta imagenes
            kit: []

        }, {
            parId: '3',
            parCodigo: 'TCK312',
            fabricanteFab: {
                fabId: 34,
                fabNombre: 'GATES'
            },
            parNombre: {
                nombreNom: 'KIT CORREA TIEMPO',
                nombreIng: 'TIMING BELT KIT',
                nombreNomt: 'KIT DE CORREA DE TIEMPOS',
                nombreGru: {
                    grupoNom: 'MOTOR',
                    grupoPad: '',
                    grupoDes: ''
                }
            },
            parGrupo: '',
            parUpc: '',
            parSku: 'GATES-TCK312',
            parLargo: '13.70',
            parAncho: '7.00',
            parEspesor: '2.80',
            parPeso: '1.50',
            parOripar: 'Multinación',
            parCaract: '2 COMPONENTES (1 BANDA, 1 TENSOR)',
            parObservacion: 'POWERGRIP PREMIUM Equipo Original juego de componentes de Correa de Tiempo. El tensor incluye resorte.',
            parKit: '1', //falta imagenes
            kit: [{
                id: 1,
                parKitId: 3, //TCK312
                parte: {
                    parId: 2,
                    parCodigo: 'T43175'
                }
            }, {
                id: 2,
                parKitId: 3, //TCK312
                parte: {
                    parId: 1,
                    parCodigo: 'T312'
                }
            }, ]
        }, {
            parId: '4',
            parCodigo: 'T444444',
            fabricanteFab: {
                fabId: 34,
                fabNombre: 'GATES'
            },
            parNombre: {
                nombreNom: 'TENSOR TIEMPO',
                nombreIng: 'TIMING TENSOR',
                nombreNomt: 'TENSOR DE LOS TIEMPOS',
                nombreGru: {
                    grupoNom: 'MOTOR',
                    grupoPad: '',
                    grupoDes: ''
                }
            },
            parGrupo: '',
            parUpc: '044444444',
            parSku: 'GATES-T444444',
            parLargo: '10.10',
            parAncho: '6.70',
            parEspesor: '1.60',
            parPeso: '0.40',
            parOripar: 'JAPON',
            parCaract: '7/8 pulgadas x 39 pulgadas(104 Dientes)',
            parObservacion: 'POWERGRIP PREMIUM Equipo Original',
            parKit: '0', //falta imagenes
            kit: []

        }];

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
        }

        // Change the items per page
        partesc.ChangeQtyPagesTables = function (Qty, searchText) {
            storageService.setQtyPageTables(Qty);
            $scope.QtyPageTables = storageService.getQtyPageTables();
            partesc.getFabricantes(Qty, 1, searchText);
        }

        // Copy temporally item data for edit
        partesc.copyRowData = function (id) {
            partesc.editing = true;
            partesc.loadingEditing = true;
            partesc.selectedItem.parId = id;
            $scope.PartesPromise = partesc.getParte(id)
                .then(function () {
                    partesc.selectedItem = partesc.parte;
                    //console.log(partesc.selectedItem);
                    // Transform value for CheckBox "¿Es un Kit?"
                    if (partesc.selectedItem.parKit == 1) {
                        partesc.selectedItem.parKit = true;
                    } else {
                        partesc.selectedItem.parKit = false;
                    }

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
            $scope.FabricantesPromise = $http.post(
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
                    }
                })
                .catch(function (error) {
                    //console.log(error);
                    toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);
                });
        }


        // Get items
        partesc.getPartes = function (limit, page, searchText) {

            /*
            // Dummy data to test
            partesc.partes = dummyData;
            partesc.totalPages = 1;
            partesc.pageFrom = 1;
            partesc.pageTo = 1;
            partesc.totalPartes = 1;
            partesc.actualRange = "Mostrando registros " + partesc.pageFrom + " a " + partesc.pageTo + " de " + partesc.totalPartes
            partesc.allLoad = true;
            // End of dummy data

            return true;
            */
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
                    // Dummy data to test
                    //var dummyPartes = dummyData;
                    //return dummyPartes;
                    //console.log("GET ALL PARTES--> " + response);
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
            if (parteAExcluir != undefined) {
                // Code for mark the parts that haves a Kit
                $scope.PartesPromise = partesc.getParte(parteAExcluir)
                    .then(function (response) {
                        partesc.parte.kit.forEach(function (parte) {
                            partesc.multiselectData.push({
                                id: String(parte.parte.parId)
                            })
                        }, this);
                        //console.log(partesc.multiselectData);
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
                    // Dummy data to test
                    //var dummyPartes = dummyData;
                    //partesc.parte = dummyPartes[id - 1];
                    //console.log("GET PARTE--> " + response);
                    partesc.parte = response.data;
                    partesc.parte.kit = [];
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
            $scope.PartesPromise = partesc.getParte(id)
                .then(function () {
                    //console.log(partesc.parte);
                    url = endpointApiURL.url + "/conjunto/bypart/" + id;
                            $scope.PartesPromise = $http.get(url)
                                .then(function(response){
                                    partesc.parte.kitParts = response.data;
                                    partesc.open(partesc.parte, action);
                                    console.log(partesc.parte);
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


        // Crear:

        // partesc.getNombres() para obtener nombres de nueva tabla nombre de partes
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
    }])
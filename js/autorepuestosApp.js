angular
    .module('autorepuestosApp', ['ui.router', 'cgBusy', 'LocalStorageModule', 'ui.bootstrap', 'ngMessages', 'ngAnimate', 'ngToast'])
    .filter('range', function () {
        return function (input, total) {
            total = parseInt(total);

            for (var i = 0; i < total; i++) {
                input.push(i);
            }

            return input;
        };
    })
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({
            horizontalPosition: 'right',
            timeout: 4000,
            dismissButton: true,
            animation: 'fade'
        });
    }])
    .config(function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('autorepuestos')
            .setStorageType('sessionStorage');
    })
    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('autorepuestos_fe', {
                url: '/autorepuestos_fe',
                templateUrl: 'index.html'
            })
            .state('marcas', {
                url: '/marcas',
                templateUrl: 'views/marcas.html'
            })
    })
    .constant("endpointApiURL", {
        "url": "http://127.0.0.1:8000/api"
    })
    .controller('loginController', ['$scope', '$window', function ($scope, $window) {
        var login_controller = this;
        login_controller.isloggedIn = 'No';

        // function to check if the user login is valid
        login_controller.login = function () {
            console.log('Logged in');
            // if user is valid, redirect
            $window.location.href = 'main.html';
            return true;
        };
    }])
    .controller('mainController', ['$scope', '$state', 'storageService', 'ngToast', function ($scope, $state, storageService) {
        $scope.QtyPageTables = storageService.getQtyPageTables();
        var main_controller = this;

        main_controller.marcas = function () {
            $state.go("marcas");
        };
    }])
    .controller('marcasController', ['$scope', '$state', '$http', 'storageService', 'endpointApiURL', 'ngToast', '$uibModal', '$log', '$document', function ($scope, $state, $http, storageService, endpointApiURL, ngToast, $uibModal, $log, $document) {
        var marcas_controller = this;
        var marcas_controller = this;
        marcas_controller.items = ['item1', 'item2', 'item3'];

        marcas_controller.animationsEnabled = true;

        marcas_controller.open = function (size, parentSelector) {
            var parentElem = parentSelector ?
                angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
            var modalInstance = $uibModal.open({
                animation: marcas_controller.animationsEnabled,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                controllerAs: '$ctrl',
                size: size,
                appendTo: parentElem,
                resolve: {
                    items: function () {
                        return marcas_controller.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                marcas_controller.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        marcas_controller.openComponentModal = function () {
            var modalInstance = $uibModal.open({
                animation: marcas_controller.animationsEnabled,
                component: 'modalComponent',
                resolve: {
                    items: function () {
                        return marcas_controller.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                marcas_controller.selected = selectedItem;
            }, function () {
                $log.info('modal-component dismissed at: ' + new Date());
            });
        };

        marcas_controller.openMultipleModals = function () {
            $uibModal.open({
                animation: marcas_controller.animationsEnabled,
                ariaLabelledBy: 'modal-title-bottom',
                ariaDescribedBy: 'modal-body-bottom',
                templateUrl: 'stackedModal.html',
                size: 'sm',
                controller: function ($scope) {
                    $scope.name = 'bottom';
                }
            });

            $uibModal.open({
                animation: marcas_controller.animationsEnabled,
                ariaLabelledBy: 'modal-title-top',
                ariaDescribedBy: 'modal-body-top',
                templateUrl: 'stackedModal.html',
                size: 'sm',
                controller: function ($scope) {
                    $scope.name = 'top';
                }
            });
        };

        marcas_controller.toggleAnimation = function () {
            marcas_controller.animationsEnabled = !marcas_controller.animationsEnabled;
        };


        var marcas_controller = this;
        marcas_controller.filter = "";
        marcas_controller.searchText = "";
        marcas_controller.selectedItem = {
            nombre: '',
            observacion: '',
            id: ''
        };
        marcas_controller.newItem = {
            nombre: '',
            observacion: ''
        };
        marcas_controller.isAddNewMarca = false;
        $scope.QtyPageTables = storageService.getQtyPageTables();

        marcas_controller.ChangeQtyPagesTables = function (Qty, searchText) {
            storageService.setQtyPageTables(Qty);
            $scope.QtyPageTables = storageService.getQtyPageTables();
            marcas_controller.getMarcas(Qty, 1, searchText);
        }

        marcas_controller.copyRowData = function (nombre, observacion) {
            marcas_controller.selectedItem.nombre = nombre;
            marcas_controller.selectedItem.observacion = observacion;
        }

        marcas_controller.addMarca = function (nombre, observacion) {
            url = endpointApiURL.url + "/marca/add";
            $scope.MarcasPromise = $http.post(
                    url, {
                        "nombre": nombre,
                        "observacion": observacion
                    }
                )
                .then(function (response) {
                    //console.log(response.data.marca[0]);
                    marcas_controller.getMarcas($scope.QtyPagesSelected, marcas_controller.CurrentPage, marcas_controller.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Registro agregado: <strong>' + response.data.marca[0].marca + '</strong>'
                    });
                    marcas_controller.selectedItem.id = 0;
                    marcas_controller.newItem = {
                        nombre: '',
                        observacion: ''
                    };
                    marcas_controller.isAddNewMarca = false;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }

        marcas_controller.updateMarcas = function (id, nombre, observacion) {
            if (!id || !nombre || !observacion) {
                return false;
            }
            url = endpointApiURL.url + "/marca/edit/" + id;
            $scope.MarcasPromise = $http.post(
                    url, {
                        "nombre": nombre,
                        "observacion": observacion
                    }
                )
                .then(function (response) {
                    //console.log(response.data);
                    marcas_controller.getMarcas($scope.QtyPagesSelected, marcas_controller.CurrentPage, marcas_controller.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Cambios guardados'
                    });
                    marcas_controller.selectedItem.id = 0;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }

        marcas_controller.getMarcas = function (limit, page, searchText) {
            if (searchText !== undefined) {
                if (searchText !== "") {
                    var url = endpointApiURL.url + "/marca/" + limit + "/" + page + "/" + searchText;
                } else {
                    var url = endpointApiURL.url + "/marca/" + limit + "/" + page;
                }

            } else {
                var url = endpointApiURL.url + "/marca/" + limit + "/" + page;
            }
            $scope.MarcasPromise = $http.get(url)
                .then(function (response) {
                    //console.log(response.data);
                    marcas_controller.allLoad = false;
                    marcas_controller.CurrentPage = page;
                    marcas_controller.marcas = response.data.marcas;
                    marcas_controller.totalMarcas = response.data.totalMarcas;
                    marcas_controller.totalMarcasReturned = response.data.totalMarcasReturned;
                    if ((limit == 'todos') || (limit == 'Todos')) {
                        marcas_controller.totalPages = 1;
                        marcas_controller.actualRange = "Mostrando todos los registros (" + marcas_controller.totalMarcasReturned + ")";
                    } else {
                        marcas_controller.totalPages = Math.ceil(marcas_controller.totalMarcas / limit);
                        marcas_controller.pageFrom = (limit * page) - (limit - 1);
                        marcas_controller.pageTo = (marcas_controller.pageFrom + marcas_controller.totalMarcasReturned) - 1;
                        marcas_controller.actualRange = "Mostrando registros " + marcas_controller.pageFrom + " a " + marcas_controller.pageTo + " de " + marcas_controller.totalMarcas

                    }
                    marcas_controller.allLoad = true;
                    // Only for tests
                    //console.log("Total paginas: " + marcas_controller.totalPages);
                    //console.log("Página actual: " + marcas_controller.CurrentPage);  
                    //console.log("Registro " + marcas_controller.pageFrom + " a " + marcas_controller.pageTo + " de " + marcas_controller.totalMarcas);               
                    // or just use "success", "info", "warning" or "danger" shortcut methods:

                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }

        marcas_controller.setPage = function (page) {
            marcas_controller.getMarcas($scope.QtyPageTables, page);
        }

        /*        marcas_controller.selectForAction = function(nombre, observaciones, id) {
                    marcas_controller.selectedItem = {
                        nombre: nombre,
                        observaciones: observaciones,
                        id: id
                    }
                }*/


        // The default value on load controller:
        marcas_controller.getMarcas($scope.QtyPageTables, 1);

    }])
    .controller('ModalInstanceCtrl', function ($uibModalInstance, items) {
        var $ctrl = this;
        $ctrl.items = items;
        $ctrl.selected = {
            item: $ctrl.items[0]
        };

        $ctrl.ok = function () {
            $uibModalInstance.close($ctrl.selected.item);
        };

        $ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })
    .component('modalComponent', {
        templateUrl: 'myModalContent.html',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&'
        },
        controller: function () {
            var $ctrl = this;

            $ctrl.$onInit = function () {
                $ctrl.items = $ctrl.resolve.items;
                $ctrl.selected = {
                    item: $ctrl.items[0]
                };
            };

            $ctrl.ok = function () {
                $ctrl.close({
                    $value: $ctrl.selected.item
                });
            };

            $ctrl.cancel = function () {
                $ctrl.dismiss({
                    $value: 'cancel'
                });
            };
        }
    })
    .service('storageService', ['localStorageService', function (localStorageService) {
        this.setQtyPageTables = function (qty = '10') {
            localStorageService.set('QtyPageTables', qty);
        }

        this.getQtyPageTables = function () {
            var actualValue = localStorageService.get('QtyPageTables');
            if (actualValue != undefined) {
                return actualValue;
            } else {
                this.setQtyPageTables('10');
                actualValue = localStorageService.get('QtyPageTables');
                return actualValue;
            }
        }
    }])
    .directive('onEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.onEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    })
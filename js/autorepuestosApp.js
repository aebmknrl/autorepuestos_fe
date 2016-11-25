angular
    .module('autorepuestosApp', ['ui.router', 'cgBusy', 'LocalStorageModule', 'ui.bootstrap', 'ngMessages', 'ngAnimate', 'ngToast', 'angular-confirm', 'angular-jwt'])
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
            .state('main', {
                url: '/main',
                templateUrl: 'main.html'
            })
            .state('marcas', {
                url: '/marcas',
                templateUrl: 'views/marcas.html'
            })
    })
    .config(function Config($httpProvider, jwtOptionsProvider) {
        // Interceptor for token push on every $http request
        jwtOptionsProvider.config({
            tokenGetter: ['storageService', function (storageService) {
                return storageService.getToken();
            }],
            whiteListedDomains: ['127.0.0.1', 'localhost']
        });

        $httpProvider.interceptors.push('jwtInterceptor');
    })
    .constant("endpointApiURL", {
        "url": "http://127.0.0.1:8000/api"
    })
    .controller('loginController', ['$scope', '$window', '$http', 'endpointApiURL', 'storageService', '$state', 'jwtHelper', function ($scope, $window, $http, endpointApiURL, storageService, $state, jwtHelper) {

        var login_controller = this;
        login_controller.isloggedIn = 'No';
        login_controller._username = '';
        login_controller._password = '';
        login_controller.isCheckingLogin = false;
        login_controller.errorOnLogin = "";

        login_controller.clearErrorLogin = function () {
            login_controller.errorOnLogin = "";
        };

        // function to check if the user login is valid
        login_controller.login = function () {
            login_controller.isCheckingLogin = true;

            url = endpointApiURL.url + "/login_check";
            $scope.LoginPromise = $http({
                    url: url,
                    method: 'POST',
                    transformRequest: function (obj) {
                        var str = [];
                        for (var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    },
                    data: {
                        "_username": login_controller._username,
                        "_password": login_controller._password
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    ignoreAuthModule: true
                }).then(function (response) {
                    //console.log(response.data);
                    var token = response.data.token;
                    var tokenPayload = jwtHelper.decodeToken(token);
                    //console.log(tokenPayload);
                    storageService.setToken(token);
                    $scope.tokenInfo = jwtHelper.decodeToken(token);
                    //The user is valid, redirect
                    $window.location.href = 'main.html';
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '401') {
                        login_controller.errorOnLogin = "Usuario o Contraseña incorrectos";
                    }
                    if (error.status == -1) {
                        login_controller.errorOnLogin = "Error de conexión al servidor de datos";
                    }
                });

            login_controller.isCheckingLogin = false;
        };
    }])
    .controller('mainController', ['$scope', '$state', 'storageService', 'ngToast', function ($scope, $state, storageService, ngToast) {
        $scope.QtyPageTables = storageService.getQtyPageTables();
        var main_controller = this;

        main_controller.marcas = function () {
            $state.go("marcas");
        };
    }])
    .controller('marcasController', ['$scope', '$state', '$http', 'storageService', 'endpointApiURL', 'ngToast', '$uibModal', '$log', '$confirm', function ($scope, $state, $http, storageService, endpointApiURL, ngToast, $uibModal, $log, $confirm) {

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

        marcas_controller.removeMarca = function (id) {
            url = endpointApiURL.url + "/marca/delete/" + id;
            $scope.MarcasPromise = $http.delete(url)
                .then(function (response) {
                    marcas_controller.getMarcas($scope.QtyPagesSelected, marcas_controller.CurrentPage, marcas_controller.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> El Registro ha sido eliminado: <strong>' + response.data.marcaid + '</strong>'
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

        this.setToken = function (token) {
            localStorageService.set('token', token);
        }


        this.getToken = function () {
            return localStorageService.get('token');
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
angular
    .module('autorepuestosApp', ['ui.router', 'cgBusy', 'LocalStorageModule', 'ui.bootstrap', 'ngMessages', 'ngAnimate', 'ngToast', 'angular-confirm', 'angular-jwt', 'ngOrderObjectBy', 'angular.filter'])
    .run(function (authManager, $location, $rootScope, $state, storageService) {
        //Work with auhtentication:
        authManager.checkAuthOnRefresh();
        authManager.redirectWhenUnauthenticated();
        // if token has removed, set isAuthenticated var on false
        $rootScope.$on('$locationChangeStart', function () {
            var existToken = storageService.getToken();
            if (existToken == '' || existToken == null) {
                $rootScope.isAuthenticated = false;
            }
        });

        // To know the current route:
        $rootScope.$state = $state;

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
                url: '/',
                templateUrl: 'views/login.html'
            })
            .state('main', {
                url: '/main',
                templateUrl: 'views/main.html',
                data: {
                    requiresLogin: true
                }
            })
            .state('marcas', {
                url: '/marcas',
                templateUrl: 'views/marcas.html',
                data: {
                    requiresLogin: true
                }
            })
            .state('proveedores', {
                url: '/proveedores',
                templateUrl: 'views/proveedores.html',
                data: {
                    requiresLogin: true
                }
            })
            .state('modelos', {
                url: '/modelos',
                templateUrl: 'views/modelos.html',
                data: {
                    requiresLogin: true
                }
            })
            .state('fabricantes', {
                url: '/fabricantes',
                templateUrl: 'views/fabricantes.html',
                data: {
                    requiresLogin: true
                }
            })
            .state('logout', {
                url: '/logout',
                templateUrl: 'views/logout.html',
                data: {
                    requiresLogin: true
                }
            })
    })
    .config(function Config($httpProvider, jwtOptionsProvider) {
        // Interceptor for token push on every $http request
        jwtOptionsProvider.config({
            tokenGetter: ['storageService', function (storageService) {
                return storageService.getToken();
            }],
            whiteListedDomains: ['127.0.0.1', 'localhost'],
            unauthenticatedRedirector: ['$state', 'authManager', 'storageService', 'jwtHelper', function ($state, authManager, storageService, jwtHelper) {
                if (storageService.getToken() != null) {
                    if (jwtHelper.isTokenExpired(storageService.getToken())) {
                        alert('Su sessión ha caducado.');
                    }
                }

                storageService.removeToken();
                storageService.clearAll();
                authManager.unauthenticate();
                $state.go('autorepuestos_fe');
            }],
            unauthenticatedRedirectPath: '/login'
        });

        $httpProvider.interceptors.push('jwtInterceptor');
    })
    .constant("endpointApiURL", {
        "url": "http://127.0.0.1/autorepuestos/web/app_dev.php/api"
    })
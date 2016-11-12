angular
    .module('autorepuestosApp', ['ui.router','datatables'])
    .config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('autorepuestos_fe', {
                url: '/autorepuestos_fe',
                templateUrl: 'index.html'
            })
            .state('marcas', {
                url: '/marcas',
                templateUrl: 'views/marcas.html',
                css: '../bower_components/angular-datatables/dist/css/angular-datatables.min.css'
            })
    })
    .controller('loginController', ['$scope', '$window', function($scope, $window) {
        var login_controller = this;
        login_controller.isloggedIn = 'No';

        // function to check if the user login is valid
        login_controller.login = function() {
            console.log('Logged in');
            // if user is valid, redirect
            $window.location.href = 'main.html';
            return true;
        };
    }])
    .controller('mainController', ['$scope', '$state', function($scope, $state) {

        var main_controller = this;

        main_controller.marcas = function() {
            $state.go("marcas");
        };
    }])
    .controller('marcasController', ['$scope', '$state', '$http', function($scope, $state, $http) {

        var marcas_controller = this;
        marcas_controller.getMarcas =  $http.get("http://localhost:8000/api/marca/10/1")
                            .then(function(response){
                                console.log(response.data[0]);
                                /*mc.nombre_empresa = response.data[0].nombre;
                                mc.correo_empresa = response.data[0].correo;
                                mc.rif_empresa = response.data[0].rif;
                                mc.telefono_empresa = response.data[0].telefono;
                                mc.direccion_empresa = response.data[0].direccion;*/
                            })
                            .catch(function(error){
                                console.log(error);
                                if (error.status == '412') {
                                    console.log('Error obteniendo datos: ' + error.data.error);
                                }
                            });

    }])
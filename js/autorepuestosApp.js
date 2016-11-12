angular
    .module('autorepuestosApp', ['ui.router'])
    .filter('range', function() {
      return function(input, total) {
        total = parseInt(total);

        for (var i=0; i<total; i++) {
          input.push(i);
        }

        return input;
      };
    })
    .config(function($stateProvider, $urlRouterProvider) {
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
        marcas_controller.filter = "";

        marcas_controller.getMarcas =  function(limit,page){
            var url = "http://localhost:8000/api/marca/" + limit + "/" + page;
            $http.get(url)
                .then(function(response){
                    //console.log(response.data);
                    marcas_controller.allLoad = false;
                    marcas_controller.CurrentPage = page;
                    marcas_controller.marcas = response.data.marcas;
                    marcas_controller.totalMarcas = response.data.totalMarcas;
                    marcas_controller.totalMarcasReturned = response.data.totalMarcasReturned;
                    marcas_controller.totalPages = Math.ceil(marcas_controller.totalMarcas / limit);

                    console.log("Total paginas: " + marcas_controller.totalPages);
                    console.log("Página actual: " + marcas_controller.CurrentPage);
                    marcas_controller.allLoad = true;
                })
                .catch(function(error){
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }

        marcas_controller.getMarcas(10,1);

    }])
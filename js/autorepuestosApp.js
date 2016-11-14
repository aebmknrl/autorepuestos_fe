angular
    .module('autorepuestosApp', ['ui.router','cgBusy','LocalStorageModule','ui.bootstrap'])
    .filter('range', function() {
      return function(input, total) {
        total = parseInt(total);

        for (var i=0; i<total; i++) {
          input.push(i);
        }

        return input;
      };
    })
    .config(function (localStorageServiceProvider) {
      localStorageServiceProvider
        .setPrefix('autorepuestos')
        .setStorageType('sessionStorage');
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
    .constant("endpointApiURL", {
        "url": "http://127.0.0.1:8000/api"
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
    .controller('mainController', ['$scope', '$state', 'storageService', function($scope, $state, storageService) {
        $scope.QtyPageTables = storageService.getQtyPageTables();
        var main_controller = this;

        main_controller.marcas = function() {
            $state.go("marcas");
        };
    }])
    .controller('marcasController', ['$scope', '$state', '$http' ,'storageService','endpointApiURL', function($scope, $state, $http,storageService,endpointApiURL) {

        var marcas_controller = this;
        marcas_controller.filter = "";
        marcas_controller.searchText = "";
        $scope.QtyPageTables = storageService.getQtyPageTables();


        marcas_controller.ChangeQtyPagesTables = function(Qty,searchText){
            storageService.setQtyPageTables(Qty);
            $scope.QtyPageTables = storageService.getQtyPageTables();
            marcas_controller.getMarcas(Qty,1,searchText);
        }

        marcas_controller.getMarcas =  function(limit,page,searchText){

             if (searchText !== undefined){
                if (searchText !== "") {
                    var url = endpointApiURL.url + "/marca/" + limit + "/" + page + "/" + searchText;
                } else {
                    var url = endpointApiURL.url + "/marca/" + limit + "/" + page;
                }
                    
                } else {
                    var url = endpointApiURL.url + "/marca/" + limit + "/" + page;
                }
            
            $scope.getMarcasPromise = $http.get(url)
                .then(function(response){
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
                    
                })
                .catch(function(error){
                    console.log(error);
                    if (error.status == '412') {
                        console.log('Error obteniendo datos: ' + error.data.error);
                    }
                });
        }

        marcas_controller.setPage = function(page){
            marcas_controller.getMarcas($scope.QtyPageTables,page);
        }

        // The default value on load controller:
        marcas_controller.getMarcas($scope.QtyPageTables,1);

    }])
    .service('storageService', ['localStorageService',function(localStorageService){
        this.setQtyPageTables = function(qty = '10'){
            localStorageService.set('QtyPageTables', qty); 
        }

        this.getQtyPageTables = function(){
            var actualValue = localStorageService.get('QtyPageTables');
            if (actualValue != undefined) {
                return actualValue;
            }
            else {
                this.setQtyPageTables('10'); 
                actualValue = localStorageService.get('QtyPageTables');
                return actualValue;
            }
        }
    }])
    .directive('onEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.onEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    })
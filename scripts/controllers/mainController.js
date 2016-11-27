 angular
    .module('autorepuestosApp')
    .controller('mainController', ['$scope', '$state', 'storageService', 'ngToast', 'userInfoService', '$rootScope', function ($scope, $state, storageService, ngToast, userInfoService, $rootScope) {
        $scope.QtyPageTables = storageService.getQtyPageTables();
        var main_controller = this;
        $rootScope.username = storageService.getUserData('username');
        $rootScope.userrole = storageService.getUserData('role');
        main_controller.marcas = function () {
            $state.go("marcas");
        };
    }])

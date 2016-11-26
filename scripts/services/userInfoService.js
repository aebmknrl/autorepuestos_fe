angular
    .module('autorepuestosApp')
    .service('userInfoService', ['$rootScope', function ($rootScope) {
        this.checkIfIsLoggedOn = function () {
            $timeout(function () {
                console.log('Checked by service user auth: ' + $rootScope.isAuthenticated);
                return $rootScope.isAuthenticated;
            });
        }
    }])
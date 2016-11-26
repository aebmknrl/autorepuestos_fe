 angular
     .module('autorepuestosApp')
     .service('logout', ['storageService', '$state', 'authManager', function (storageService, $state, authManager) {
         this.do = function () {
             storageService.removeToken();
             storageService.clearAll();
             authManager.unauthenticate();
             $state.go('autorepuestos_fe');
         }
     }])
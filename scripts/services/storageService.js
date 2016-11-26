 angular
     .module('autorepuestosApp')
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

         this.removeToken = function () {
             localStorageService.remove('token');
             return;
         }

         this.setUserData = function (username, role) {
             localStorageService.set('username', username);
             localStorageService.set('user_role', role);
         }

         this.getUserData = function (data) {
             if (data == 'role') {
                 return localStorageService.get('token');
             }
             if (data == 'username') {
                 return localStorageService.get('username');
             }
         }
         this.clearAll = function () {
             return localStorageService.clearAll();
         }

     }])
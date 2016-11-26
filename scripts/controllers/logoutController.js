 angular
    .module('autorepuestosApp')
 .controller('logoutController', ['logout', function (logout) {
        logout.do();
    }])
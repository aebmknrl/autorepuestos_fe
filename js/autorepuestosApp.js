angular
    .module('autorepuestosApp', [])
    .controller('loginController', ['$scope', '$window', function($scope, $window) {
        var login_controller = this;
        login_controller.isloggedIn = 'No';

        // function to check if the user login is valid
        login_controller.login = function() {
            console.log('Logged in');
            // if user is valid, redirect
            $window.location.href = 'main.html';
        };
    }]);
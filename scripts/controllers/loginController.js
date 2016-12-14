angular
    .module('autorepuestosApp')
    .controller('loginController', ['$scope', '$window', '$http', 'endpointApiURL', 'storageService', '$state', 'jwtHelper', '$rootScope', '$timeout', 'userInfoService', 'authManager', function ($scope, $window, $http, endpointApiURL, storageService, $state, jwtHelper, $rootScope, $timeout, userInfoService, authManager) {


        $timeout(function () {
            //console.log($rootScope.isAuthenticated); // But would be true here
        });
        if ($rootScope.isAuthenticated) {
            $state.go("main");
        }

        var login_controller = this;
        login_controller.isloggedIn = 'No';
        login_controller._username = '';
        login_controller._password = '';
        login_controller.isCheckingLogin = false;
        login_controller.errorOnLogin = "";



        login_controller.clearErrorLogin = function () {
            login_controller.errorOnLogin = "";
        };


        // function to check if the user login is valid
        login_controller.login = function () {
            login_controller.isCheckingLogin = true;

            // If the loginForm is not valid, set dirty the fields and stop submit.
            if (!$scope.loginForm.$valid) {
                login_controller.isCheckingLogin = false;
                $scope.loginForm.username.$touched = true;
                $scope.loginForm.password.$touched = true;
                return false;
            }

            url = endpointApiURL.url + "/login_check";
            $scope.LoginPromise = $http({
                    url: url,
                    method: 'POST',
                    transformRequest: function (obj) {
                        var str = [];
                        for (var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    },
                    data: {
                        "_username": login_controller._username,
                        "_password": login_controller._password
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    ignoreAuthModule: true
                }).then(function (response) {
                    //console.log(response.data);
                    var token = response.data.token;
                    var tokenPayload = jwtHelper.decodeToken(token);
                    storageService.setToken(token);
                    var tokenInfo = jwtHelper.decodeToken(token);
                    storageService.setUserData(tokenInfo.username, tokenInfo.roles[0])
                    $rootScope.username = storageService.getUserData('username');
                    $rootScope.userrole = storageService.getUserData('role');
                    //The user is valid, redirect
                    $state.go("main");
                })
                .catch(function (error) {
                    console.log(error);
                    if (error.status == '401') {
                        login_controller.errorOnLogin = "Usuario o Contraseña incorrectos";
                    }
                    if (error.status == -1) {
                        login_controller.errorOnLogin = "Error de conexión al servidor de datos";
                    }
                });

            login_controller.isCheckingLogin = false;
        };
    }])
   
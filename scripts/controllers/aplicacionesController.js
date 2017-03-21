angular
    .module('autorepuestosApp')
    .controller('aplicacionesController', ['$scope', '$state', '$http', 'storageService', 'endpointApiURL', 'ngToast', '$uibModal', '$log', '$confirm', '$rootScope', 'toastMsgService', '$document', '$log', 'countryService', '$window', '$httpParamSerializerJQLike', '$timeout', function ($scope, $state, $http, storageService, endpointApiURL, ngToast, $uibModal, $log, $confirm, $rootScope, toastMsgService, $document, $log, countryService, $window, $httpParamSerializerJQLike, $timeout) {
        // Set the username for the app
        $rootScope.username = storageService.getUserData('username');
        $rootScope.userrole = storageService.getUserData('role');
        // Initializing vars
        var aplicacionesc = this;

        aplicacionesc.allLoad = false;
        aplicacionesc.filter = "";
        aplicacionesc.orderBy = "aplId";
        aplicacionesc.orderDirection = false; // False = Ascendent
        aplicacionesc.searchText = "";
        aplicacionesc.editing = false;
        aplicacionesc.loadingEditing = false;
        aplicacionesc.loadingData = false;

        //Vacío por ahora
        aplicacionesc.selectedItem = {};
        //

        aplicacionesc.newItem = {
            aplCantidad: '',
            partePar: '',
            vehiculoVeh: '',
            aplObservacion: '' //falta imagenes
        };

        aplicacionesc.filterEstatus = "";
        aplicacionesc.filterEstatusStrict = false;


        aplicacionesc.isAddNewAplicacion = false;
        // Obtain the items per page
        $scope.QtyPageTables = storageService.getQtyPageTables();

        //Toggles the filter strict on or off
        aplicacionesc.toggleFilterEstatusStrict = function (value) {
            aplicacionesc.filterEstatusStrict = value;
        };

        //Change the orderby 
        aplicacionesc.changeOrderByOrDirection = function (orderByItem) {
            aplicacionesc.orderBy = orderByItem;
            if (aplicacionesc.orderDirection == true) {
                aplicacionesc.orderDirection = false;
            } else {
                aplicacionesc.orderDirection = true;
            }
        };

        // Change the items per page
        aplicacionesc.ChangeQtyPagesTables = function (Qty, searchText) {
            storageService.setQtyPageTables(Qty);
            $scope.QtyPageTables = storageService.getQtyPageTables();
            aplicacionesc.getVehiculos(Qty, 1, searchText);
        }
    
    }]);
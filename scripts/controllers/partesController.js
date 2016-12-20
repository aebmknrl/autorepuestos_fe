angular
    .module('autorepuestosApp')
    .controller('partesController', ['$scope', '$state', '$http', 'storageService', 'endpointApiURL', 'ngToast', '$uibModal', '$log', '$confirm', '$rootScope','toastMsgService', function ($scope, $state, $http, storageService, endpointApiURL, ngToast, $uibModal, $log, $confirm, $rootScope,toastMsgService) {
        // Set the username for the app
        $rootScope.username = storageService.getUserData('username');
        $rootScope.userrole = storageService.getUserData('role');
        // Initializing vars
        var partesc = this;

        partesc.allLoad = false;
        partesc.filter = "";
        partesc.orderBy = "parId";
        partesc.orderDirection = false; // False = Ascendent
        partesc.searchText = "";
        partesc.selectedItem = {
            id: '',
            nombre: '',
            nombrepieza: '',
            nombreinventario: '',
            paramazon: '',
            codigo: '',
            codigoupc: '',
            grupo: '',
            subgrupo: '',
            largo: '',
            ancho: '',
            espesor: '',
            peso: '',
            caracteristicas: '',
            observacion: '',
            kit: '',
            equivalencia: '',
            conjunto: '',
            fabricanteid: ''
        };
        partesc.newItem = {
            nombre: '',
            nombrepieza: '',
            nombreinventario: '',
            paramazon: '',
            codigo: '',
            codigoupc: '',
            grupo: '',
            subgrupo: '',
            largo: '',
            ancho: '',
            espesor: '',
            peso: '',
            caracteristicas: '',
            observacion: '',
            kit: '',
            equivalencia: '',
            conjunto: '',
            fabricanteid: ''
        };

        partesc.filterEstatus = "";
        partesc.filterEstatusStrict = false;


        partesc.isAddNewParte = false;
        // Obtain the items per page
        $scope.QtyPageTables = storageService.getQtyPageTables();

        //Toggles the filter strict on or off
        partesc.toggleFilterEstatusStrict = function (value) {
            partesc.filterEstatusStrict = value;

        };

        //Change the orderby 
        partesc.changeOrderByOrDirection = function (orderByItem) {
            partesc.orderBy = orderByItem;
            if (partesc.orderDirection == true) {
                partesc.orderDirection = false;
            } else {
                partesc.orderDirection = true;
            }
        };

        // Remove item
        partesc.removeParte = function (id) {
            url = endpointApiURL.url + "/parte/delete/" + id;
            $scope.PartesPromise = $http.delete(url)
                .then(function (response) {
                    // console.log(response.data);
                    partesc.getModelos($scope.QtyPagesSelected, partesc.CurrentPage, partesc.searchText);
                    ngToast.create({
                        className: 'info',
                        content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> El Registro ha sido eliminado: <strong>' + response.data.modid + '</strong>'
                    });
                    partesc.selectedItem.id = 0;
                })
                .catch(function (error) {
                    //console.log(error);
                    toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);

                });
        }


    }])
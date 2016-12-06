 angular
     .module('autorepuestosApp')
     .controller('marcasController', ['$scope', '$state', '$http', 'storageService', 'endpointApiURL', 'ngToast', '$uibModal', '$log', '$confirm', '$rootScope', 'toastMsgService', function ($scope, $state, $http, storageService, endpointApiURL, ngToast, $uibModal, $log, $confirm, $rootScope, toastMsgService) {
         // Set the username for the app
         $rootScope.username = storageService.getUserData('username');
         $rootScope.userrole = storageService.getUserData('role');
         var marcas_controller = this;
         marcas_controller.filter = "";
         marcas_controller.searchText = "";
         marcas_controller.selectedItem = {
             nombre: '',
             observacion: '',
             id: ''
         };
         marcas_controller.newItem = {
             nombre: '',
             observacion: ''
         };
         marcas_controller.isAddNewMarca = false;
         $scope.QtyPageTables = storageService.getQtyPageTables();

         marcas_controller.removeMarca = function (id) {
             url = endpointApiURL.url + "/marca/delete/" + id;
             $scope.MarcasPromise = $http.delete(url)
                 .then(function (response) {
                     marcas_controller.getMarcas($scope.QtyPagesSelected, marcas_controller.CurrentPage, marcas_controller.searchText);
                     ngToast.create({
                         className: 'info',
                         content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> El Registro ha sido eliminado: <strong>' + response.data.marcaid + '</strong>'
                     });
                     marcas_controller.selectedItem.id = 0;
                 })
                 .catch(function (error) {
                     console.log(error);
                     if (error.status == '412') {
                         console.log('Error obteniendo datos: ' + error.data.error);
                         return;
                     }
                     if (error.status == '500') {
                         toastMsgService.showMsg('Error: no se puede eliminar un registro asociado a otro elemento. Compruebe que no exista relación entre este elemento con otro e intente nuevamente.','danger');
                         console.log('Error 500: ' + error.data.error);
                         return;
                     }
                     toastMsgService.showMsg('Error cód.: ' + error.data.error.code + ' Mensaje: ' + error.data.error.message + ': ' + error.data.error.exception[0].message, 'danger', 10000);

                 });
         }

         marcas_controller.ChangeQtyPagesTables = function (Qty, searchText) {
             storageService.setQtyPageTables(Qty);
             $scope.QtyPageTables = storageService.getQtyPageTables();
             marcas_controller.getMarcas(Qty, 1, searchText);
         }

         marcas_controller.copyRowData = function (nombre, observacion) {
             marcas_controller.selectedItem.nombre = nombre;
             marcas_controller.selectedItem.observacion = observacion;
         }

         marcas_controller.addMarca = function (nombre, observacion) {
             url = endpointApiURL.url + "/marca/add";
             $scope.MarcasPromise = $http.post(
                     url, {
                         "nombre": nombre,
                         "observacion": observacion
                     }
                 )
                 .then(function (response) {
                     //console.log(response.data.marca[0]);
                     marcas_controller.getMarcas($scope.QtyPagesSelected, marcas_controller.CurrentPage, marcas_controller.searchText);
                     ngToast.create({
                         className: 'info',
                         content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Registro agregado: <strong>' + response.data.marca[0].marca + '</strong>'
                     });
                     marcas_controller.selectedItem.id = 0;
                     marcas_controller.newItem = {
                         nombre: '',
                         observacion: ''
                     };
                     $scope.newMarcaForm.nombre = false;
                     $scope.newMarcaForm.observaciones = false;

                     marcas_controller.isAddNewMarca = false;
                 })
                 .catch(function (error) {
                     
                     console.log(error);
                     if (error.status == '412') {
                         console.log('Error obteniendo datos: ' + error.data.error);
                     }
                 });
         }

         marcas_controller.updateMarcas = function (id, nombre, observacion) {
             if (!id || !nombre || !observacion) {
                 return false;
             }
             url = endpointApiURL.url + "/marca/edit/" + id;
             $scope.MarcasPromise = $http.post(
                     url, {
                         "nombre": nombre,
                         "observacion": observacion
                     }
                 )
                 .then(function (response) {
                     //console.log(response.data);
                     marcas_controller.getMarcas($scope.QtyPagesSelected, marcas_controller.CurrentPage, marcas_controller.searchText);
                     ngToast.create({
                         className: 'info',
                         content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> Cambios guardados'
                     });
                     marcas_controller.selectedItem.id = 0;
                 })
                 .catch(function (error) {
                     console.log(error);
                     if (error.status == '412') {
                         console.log('Error obteniendo datos: ' + error.data.error);
                     }
                 });
         }

         marcas_controller.getMarcas = function (limit, page, searchText) {
             if (searchText !== undefined) {
                 if (searchText !== "") {
                     var url = endpointApiURL.url + "/marca/" + limit + "/" + page + "/" + searchText;
                 } else {
                     var url = endpointApiURL.url + "/marca/" + limit + "/" + page;
                 }

             } else {
                 var url = endpointApiURL.url + "/marca/" + limit + "/" + page;
             }
             $scope.MarcasPromise = $http.get(url)
                 .then(function (response) {
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
                     // or just use "success", "info", "warning" or "danger" shortcut methods:

                 })
                 .catch(function (error) {
                     console.log(error);
                     if (error.status == '412') {
                         console.log('Error obteniendo datos: ' + error.data.error);
                     }
                 });
         }

         marcas_controller.setPage = function (page) {
             marcas_controller.getMarcas($scope.QtyPageTables, page);
         }


         // The default value on load controller:
         marcas_controller.getMarcas($scope.QtyPageTables, 1);

     }])
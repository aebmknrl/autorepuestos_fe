angular.module('autorepuestosApp').controller('modalInstanceController', function ($uibModalInstance, items) {
  var $ctrl = this;
  $ctrl.items = items;
  //console.log($ctrl.items);

  //  $ctrl.data = items[1];
  //console.log();
  //  $ctrl.selected = {
  //    item: $ctrl.items[0]
  //  };

  $ctrl.ok = function () {
    $uibModalInstance.close('okey');
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancelar');
  };
});
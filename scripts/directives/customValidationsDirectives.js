angular
    .module('autorepuestosApp')
    .directive('ngCustomdir', function () {
        return {
            require: 'ngModel',
            link: function ($scope, $element, $attrs, ngModel) {
                $attrs.$observe('ngCustomdir', function (val) {
var cantPartsonKitSelected = $attrs.ngCustomdir;
                //do some validation
                if (cantPartsonKitSelected <= 0) {
                    ngModel.$setValidity('customdir', false);
                    console.log("No hay selecionados");
                    return false;
                } else {
                    ngModel.$setValidity('customdir', true);
                    console.log("Hay selecionados");
                    return true;
                }
                })
                
                //return validation; //<--true or false based on validation
            }
        };
    })
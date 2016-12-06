 angular
     .module('autorepuestosApp')
     .service('toastMsgService', ['ngToast', function (ngToast) {
         this.showMsg = function (message, type = 'info',timeout = 4000) {
             if (type == 'info') {
                 ngToast.create({
                     className: 'info',
                     content: '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> ' + message,
                     timeout : timeout
                 });
                 return;
             }
            if (type=='danger') {
                ngToast.create({
                    className: 'danger',
                    content: '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> ' + message,
                    timeout : timeout
                });                
            }

         }
     }])
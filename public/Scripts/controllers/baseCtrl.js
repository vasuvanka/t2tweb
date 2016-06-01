
angular.module("t2tApp").controller('baseController', [ '$rootScope','cartService' ,'$modal','storageService', 'authService' ,'$scope', 'ttService', function ($rootScope,cartService,$modal,storageService,authService ,$scope, ttService) {
    $scope.count = cartService.count() || 0 ;
    $scope.username = authService.name;
    $rootScope.$on("changeCount",function(obj){
        $scope.count = cartService.count();
    });
    $rootScope.$on("bannnerRelitive",function(obj){
        $scope.isHome = true;
    });
    $rootScope.$on("bannnerNonRelitive",function(obj){
        $scope.isHome = false;
    });
    var node = storageService.get("userNode");
    if (node) {
            authService.id = node.id;
            authService.name = node.firstname+" "+node.lastname;
            authService.token = node.token;
            authService.address = node.address;
            $rootScope.$broadcast("userLoginName",{});
            $rootScope.$broadcast("addressChange",{});
    }
    $rootScope.$on("userLoginName",function(obj){
        $scope.username = authService.name;
    });

    $rootScope.$on("ngLoader",function(obj){
        var data = storageService.get("ngLoader")
        $scope.message = data.message;
        $scope.isWorking = data.isWorking; 
    });

    $scope.openLogin = function () {
        var modalInstance = $modal.open({
         templateUrl: 'loginpopup.html',
         controller: 'loginModalCtrl',
         size:'sm',
         resolve: {
             entity: function () {
                 return $scope.entity;
             }
         }
        });
        modalInstance.result.then(function (selectedItem) {             

        });
    };
    $scope.openRegistration = function () {
        var modalInstance = $modal.open({
         templateUrl: 'regpopup.html',
         controller: 'regModalCtrl',
         size:'sm',
         resolve: {
             entity: function () {
                 return $scope.entity;
             }
         }
        });
        modalInstance.result.then(function (selectedItem) {             

        });
    };
    $scope.logout = function(){
        ttService.logout(authService.id,authService.token,function(obj){
            if (obj.status == "success") {
                storageService.clearAll();
                authService.name = '';
                authService.status = false;
                authService.token = '';
                authService.id = '';
                authService.address = [];
                $rootScope.$broadcast("changeCount",{});
                $rootScope.$broadcast("addressChange",{});
                $rootScope.$broadcast("logoutActivity",{});
                $scope.username = authService.name;
            }else{
                if (obj.error[0] == "106") {
                    storageService.clearAll();
                }
                $scope.error = "try again !!";
            }
            $scope.$apply();
        })
    }

}]);
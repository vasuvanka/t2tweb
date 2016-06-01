angular.module("t2tApp").controller('menuCtrl', ['$rootScope','cartService','authService','$scope', 'ttService', '$state', '$stateParams', 'storageService', function ($rootScope,cartService,authService,$scope, ttService, $state, $stateParams, storageService) {
    $scope.cities = storageService.get('cities'); // get all cities from storage
    $scope.city = storageService.get('city');
    // $scope.isHome = true;
    $rootScope.$broadcast("bannnerRelitive",{});
    var loc = storageService.get('loc');
    if (loc == null) {
        cartService.clearAll();
        $state.go("home");
    }
    $scope.location = loc.location;
    $scope.categories = [];$scope.menuList = [];
    $rootScope.$broadcast("userLoginName",{});
    $rootScope.$broadcast("changeCount",{});
    $rootScope.$broadcast("addressChange",{});
    getCat(loc._id);
    function getCat(locId){
        ttService.getCategories(locId, function (data) {
        if (data.status == "success") {
            $scope.categories = data.data;
        } else {
            alert("oops something went wrong!! refresh the page");
        }
        storageService.set("ngLoader",{"isWorking":false,"message":"Categories ..."})
        $rootScope.$emit("ngLoader",{});
        $scope.$apply();
    });
    }
    $scope.getMenu = function(cat){
        authService.location = loc;
        // $scope.$apply();
        storageService.set("ngLoader",{"isWorking":true,"message":"Menu ..."})
        $rootScope.$emit("ngLoader",{});
        if (authService.location != undefined || authService.location != "") {
            ttService.getMenu(authService.location._id,cat,function(data){
                if (data.status == "success") {
                    $scope.menuList = data.data;
                    storageService.set('menuList', data.data);
                } else {
                    alert("oops something went wrong!! refresh the page");
                }
                storageService.set("ngLoader",{"isWorking":false,"message":"Menu ..."})
                $rootScope.$emit("ngLoader",{});
                $scope.$apply();
            });
        }else{
            $state.go("home");
        }
    }
    $scope.countFunc=function(isIncr,item){
        if (isIncr) {
            item.product_id[0].qty = ++item.product_id[0].qty;
            cartService.add(item.product_id[0]);
        }else{
            item.product_id[0].qty > 0 ? --item.product_id[0].qty : item.product_id[0].qty = 0;
            cartService.remove(item.product_id[0]); 
        }
        $rootScope.$broadcast("changeCount",{});
    }

}]);


angular.module("t2tApp").controller('mainCtrl', [ '$modal','$rootScope','cartService','authService','$scope', 'ttService', '$state', 'storageService', function ($modal,$rootScope,cartService,authService,$scope, ttService, $state, storageService) {
    $rootScope.$broadcast("userLoginName",{});
    $rootScope.$broadcast("changeCount",{});
    $rootScope.$broadcast("bannnerNonRelitive",{});
    getLoc("Hyderabad");
    function getLoc(city) {
        storageService.set('city', city);
        authService.city = city;
        ttService.getLocations(city, function (data) {
            if (data.status == "success") {
                storageService.set('locs', data.data);
                $scope.locs = data.data;
            } else {
                alert("oops something went wrong!! refresh the page");
            }
        })
    }
    $scope.subscribe = function(email){
        var modalInstance = $modal.open({
         templateUrl: 'subpopup.html',
         controller: 'forgetModalCtrl',
         size:'sm',
         resolve: {
             entity: function () {
                 return $scope.entity;
             }
         }
        });
        modalInstance.result.then(function (selectedItem) {             

        });
        $scope.email = "";
    }
    $scope.onSelect = function (item, model, label) {
        cartService.clearAll();
        storageService.set("ngLoader",{"isWorking":true,"message":"Categories ..."})
        $rootScope.$emit("ngLoader",{});
        authService.location = item;
        storageService.set('loc', item);
        $state.go('menu');
    };
}]);
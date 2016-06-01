angular.module("t2tApp").controller('profileCtrl', ['cartService','$modal','$rootScope','authService','$scope', 'ttService', '$state', 'storageService', function (cartService,$modal,$rootScope,authService,$scope, ttService, $state, storageService) {
    var node = storageService.get("userNode");
    $scope.changeFlag = false;
    $rootScope.$broadcast("addressChange",{});
    $rootScope.$broadcast("bannnerRelitive",{});
    $scope.username = authService.name;
    ttService.getProfile(authService.id,authService.token,function(obj){
        if (obj.status == "success") {
              $scope.user = obj.data;
        }else{
            if (obj.error[0] == "106") {
                storageService.clearAll();
                authService.status = false;
                $state.go("home");
            }
        }
        $scope.$apply();
    })
    
    ttService.getOrders(authService.id,authService.token,function(res){
        if (res.status == "success") {
            $scope.bookings = convertDateToLocal(res.data);
        }else{
            alert("Ooops something went wrong ..!")
        }
        $scope.$apply();
    })


    $scope.updateName = function(first,last){
        ttService.updateProfile(authService.id,authService.token,{firstname:first,lastname:last},function(obj){
            if (obj.status == "success") {
                $scope.changeFlag = false;
                node.firstname = first;
                node.lastname = last;
                storageService.set("userNode",node);
                $scope.user = node;
                $scope.$apply();
            }else{
                alert("Oops..")
            }
            
        });
    }
    $scope.removeAddress = function(i){
        node.address.splice(i,1);
        storageService.set("userNode",node);
        $scope.user = node;
        ttService.updateProfile(authService.id,authService.token,{address:node.address},function(obj){
            console.log("removed");
        });
    }
    $scope.openAddress = function () {
        var modalInstance = $modal.open({
         templateUrl: 'addresspopup.html',
         controller: 'addressModalCtrl',
         resolve: {
             entity: function () {
                 return $scope.entity;
             }
         }
        });
        modalInstance.result.then(function (selectedItem) {             

        });
    };
    $scope.reorder = function(booking){
        cartService.clearAll();
        var cart = booking.items;
        for (var i = 0; i < cart.length; i++) {
            cartService.add(cart[i]);
        }
        console.log(cart.length);
        $rootScope.$broadcast("changeCount",{});
        $state.go("cart");
    }
    $scope.bookings = [];
    function convertDateToLocal(list){
        var rlist = list.map(function(obj){
            var currentTime = new Date(obj.createdAt);
            var currentOffset = currentTime.getTimezoneOffset();
            var ISTOffset = 330;   // IST offset UTC +5:30 
            var dte = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
            obj.createdAt = dte.toLocaleString();
            return obj;
        });
        return rlist;
    }

}]);
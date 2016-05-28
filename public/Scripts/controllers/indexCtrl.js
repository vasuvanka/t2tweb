"use strict";
angular.module("t2tApp").controller('regModalCtrl', ['$rootScope','ttService','$scope', '$modalInstance', 'entity', function ($rootScope,ttService,$scope, $modalInstance, entity) {
    $scope.entity = entity;
    $scope.showDiv = false;
    $scope.register = function(data){
        ttService.register(data,function(obj){
        console.log(obj);
        $scope.regStatus = obj.status == 'success';
        $scope.showDiv = true;
        $scope.regStatusMsg = $scope.regStatus ? 'Registration Success' : 'Email or Mobile Number already Registered';
        $scope.reg={};
        $scope.$apply();
      });
    }
     $scope.ok = function () {
         $modalInstance.close($scope.entity);
     };

     $scope.cancel = function () {
         $modalInstance.dismiss('cancel');
     };    
 }]);

angular.module("t2tApp").controller('loginModalCtrl', ['$modal','$rootScope','ttService','storageService','authService','$scope', '$modalInstance', 'entity', function ($modal,$rootScope,ttService,storageService,authService,$scope, $modalInstance, entity) {
     $scope.entity = entity;
     $scope.openSignUp = function(){
        $modalInstance.dismiss('cancel');
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
     }
     $scope.login = function (creditials){
      ttService.login(creditials.username,creditials.password,function(obj){
        authService.status = obj.status == 'success';
        $scope.isError = false;
        if (authService.status) {
            $scope.isError = false;
            $scope.error = null;
            storageService.set("userNode",obj.data);
            authService.id = obj.data.id;
            authService.name = obj.data.firstname+" "+obj.data.lastname;
            authService.token = obj.data.token;
            authService.address = obj.address;
            $scope.creditials = {};
            $rootScope.$broadcast("userLoginName",{});
            $rootScope.$broadcast("addressChange",{});
            $modalInstance.dismiss('cancel');
        }else{
            $scope.isError = true;
            $scope.creditials.password = '';
            $scope.error = "Invalid Creditials";
        }
        $scope.$apply();
      });
    }
     $scope.ok = function () {
         $modalInstance.close($scope.entity);
     };

     $scope.cancel = function () {
         $modalInstance.dismiss('cancel');
     }; 
     $scope.openForget = function(){
        $modalInstance.dismiss('cancel');
        var modalInstance = $modal.open({
         templateUrl: 'forgetpopup.html',
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
     }  
 }]);
angular.module("t2tApp").controller('addressModalCtrl', ['$state','$rootScope','ttService','storageService','authService','$scope', '$modalInstance', 'entity', function ($state,$rootScope,ttService,storageService,authService,$scope, $modalInstance, entity) {
     $scope.entity = entity;
     $scope.checked = false ;
     $scope.adStatus = false;
     $scope.showDiv = false;
     $scope.address = {};
     var loc = storageService.get("loc");
     var city = storageService.get("city");
     var node = storageService.get("userNode");
     $scope.address.phone = node.phone;
     $scope.address.lane2 = loc.location || "";
     $scope.address.city = city || "";
     $scope.save = function (address){

        node.address.push(address);
        ttService.updateProfile(authService.id,authService.token,{address:node.address},function(obj){
                $scope.adStatus = obj.status == 'success';
                $scope.showDiv = true;
                $scope.addressMsg = $scope.adStatus ? 'Address Added' : 'Invalid Details';
                $scope.checked = $scope.adStatus ? true : false ;
                if ($scope.adStatus) {
                    var node = storageService.get("userNode");
                    node.address = obj.data.address;
                    storageService.set("userNode",node);
                    $rootScope.$broadcast("addressChange",{});
                }
                $scope.$apply();
        });
     }
     $scope.cancel = function () {
         $modalInstance.dismiss('cancel');
     };    
 }]);

angular.module("t2tApp").controller('forgetModalCtrl', ['$state','$rootScope','ttService','storageService','authService','$scope', '$modalInstance', 'entity', function ($state,$rootScope,ttService,storageService,authService,$scope, $modalInstance, entity) {
     $scope.entity = entity;
     $scope.isError = false ;
     function validateEmail(email) 
		{
		    var re = /\S+@\S+\.\S+/;
		    return re.test(email);
		}
     $scope.retrive = function (email){
        if (validateEmail(email)) {
        	ttService.forgetPassword(email,function(resp){
        		if (resp.status == "error") {
        			$scope.success = "";
        			$scope.isError = true ;
        			$scope.error = "invalid email";
        		}else{
        			$scope.error = "";
        			$scope.isError = true ;
        			$scope.success = "email sent";
        		}
        		$scope.$apply();
        	});
        }else{
        	$scope.isError = true ;
        	$scope.error = "invalid email";
        }
     }
     $scope.cancel = function () {
         $modalInstance.dismiss('cancel');
     };    
 }]);

angular.module("t2tApp").controller('errorModalCtrl', ['$state','$rootScope','ttService','storageService','authService','$scope', '$modalInstance', 'entity', function ($state,$rootScope,ttService,storageService,authService,$scope, $modalInstance, entity) {
     $scope.entity = entity;
     $scope.isError = false ;
     $scope.cancel = function () {
         $modalInstance.dismiss('cancel');
     };    
 }]);

angular.module("t2tApp").controller('codModalCtrl', ['$state','$rootScope','ttService','storageService','authService','$scope', '$modalInstance', 'entity', function ($state,$rootScope,ttService,storageService,authService,$scope, $modalInstance, entity) {
     $scope.entity = entity;
     $scope.cancel = function () {
         $modalInstance.dismiss('cancel');
     };
     $scope.msg = "";
     $scope.updateOrder = function(){
        var order = storageService.get("order_summary");
        if (order) {
            ttService.updateOrder(authService.id,authService.token,order._id,{txn_type:"cod"},function(obj){
                if (obj.status == "success") {
                    $scope.msg = "order placed";
                }else{
                    $scope.msg = "Ooops Place Order Again";
                }
                $scope.$apply();
            })
        }
     }    
 }]);
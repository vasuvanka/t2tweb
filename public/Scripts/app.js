/// <reference path="vendor/angular.min.js" />


var app;

app = angular.module('t2tApp', ['ui.router', 'ui.bootstrap', 'LocalStorageModule','ngLoader']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'localStorageServiceProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, localStorageServiceProvider) {
    $urlRouterProvider.otherwise('/home');

    $stateProvider.state('home', { url: '/home', templateUrl: '/main.html', controller: 'mainCtrl' })
    .state('menu', { url: '/menu', templateUrl: '/menu.html', controller: 'menuCtrl' })
    .state('cart', { url: '/cart', templateUrl: '/cart.html',controller: 'cartCtrl' })
    .state('track', { url: '/track', templateUrl: '/track.html',controller: 'trackCtrl' })
    .state('faq', { url: '/faqandhelpline', templateUrl: '/faq.html' })
    .state('cs', { url: '/customercare', templateUrl: '/cs.html' })
    .state('policy', { url: '/policy', templateUrl: '/policy.html' })
    .state('aboutus', { url: '/aboutus', templateUrl: '/aboutus.html' })
    .state('jobs', { url: '/careers', templateUrl: '/jobs.html' })
    .state('confirm', { url: '/confirm', templateUrl: '/cart-success.html',controller: 'confirmCtrl' ,isLoginRequired:true })
    .state('profile', { url: '/profile', templateUrl: '/profile.html',controller: 'profileCtrl',isLoginRequired:true })
    .state('tandc', { url: '/terms', templateUrl: '/tandc.html' })
    .state('txn_post', { url: '/txn_post', templateUrl: '/post-trans.html',controller: 'txnCtrl',isLoginRequired:true });

    localStorageServiceProvider
    .setStorageType('sessionStorage');
}]);

app.controller('trackCtrl', ['cartService','$rootScope','authService','$scope', 'ttService', '$state', 'storageService', function (cartService,$rootScope,authService,$scope, ttService, $state, storageService) {
    $scope.isTracking = false;
    $scope.trackInfo;
    $scope.isError = false;
    // $scope.isHome = true;
    $rootScope.$broadcast("bannnerNonRelitive",{});
    $scope.getTrackingData = function(trackId){
        if (trackId == undefined || trackId == null || trackId == "") {
            $scope.isError = true;
        }else{
            ttService.track(trackId,function(data){
                if (data.status == "success") {
                    $scope.isTracking = true;
                    $scope.isError = false;
                    $scope.trackInfo = data.data.track;
                    console.log(data.data.track)
                }else{
                    $scope.isError = true;
                    $scope.isTracking = false;
                }
                $scope.$apply();
            })
        }
    }
    var trackId = storageService.get("order_num")
    if (trackId) {
        $scope.trackId = trackId;
        $scope.isError = true;
            ttService.track(trackId,function(data){
                if (data.status == "success") {
                    $scope.isTracking = true;
                    $scope.isError = false;
                    $scope.trackInfo = data.data.track;
                    console.log(data.data.track)
                }else{
                    $scope.isError = true;
                    $scope.isTracking = false;
                }
                $scope.$apply();
            })
    }
}]);

app.controller('profileCtrl', ['cartService','$modal','$rootScope','authService','$scope', 'ttService', '$state', 'storageService', function (cartService,$modal,$rootScope,authService,$scope, ttService, $state, storageService) {
    var node = storageService.get("userNode");
    $scope.changeFlag = false;
    // $scope.isHome = true;
    $scope.couponMsg = "";
    $rootScope.$broadcast("addressChange",{});
    $rootScope.$broadcast("bannnerRelitive",{});
    $scope.isCouponError = false;
    if (node) {
        $scope.username = authService.name;
        $scope.user = node;
    }else{
        $state.go("home");
    }
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
    $rootScope.$on("logoutActivity",function(obj){
        storageService.clearAll();
        authService.status = false;
        $state.go("home");
    });
    $rootScope.$on('addressChange',function(obj){
        var node = storageService.get("userNode");
        if (node) {
            $scope.addresses = node.address;
        }else{
            $scope.addresses = [];
        }
        $scope.$apply();
    });
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
    ttService.getOrders(authService.id,authService.token,function(res){
        if (res.status == "success") {
            $scope.bookings = convertDateToLocal(res.data);
            $scope.$apply();
        }else{
            alert("Ooops something went wrong ..!")
        }
    });
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




app.controller('baseController', [ '$rootScope','cartService' ,'$modal','storageService', 'authService' ,'$scope', 'ttService', function ($rootScope,cartService,$modal,storageService,authService ,$scope, ttService) {
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
    // ttService.status(function (data) {
    //     if(data.status == "success"){
    //         $scope.status = data.data.isOpen;
    //     }else{
    //         alert("oops something went wrong!! refresh the page");
    //     }
    // });

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


app.factory('authService',['storageService', function (storageService) {
    var obj = storageService.get("userNode");
    var auth = { name: '', status: false ,'id':0,'token':'','address':[],'city':'',location:''};
    if (obj) {
        auth.name = obj.firstname +" "+obj.lastname;
        auth.status = true;
        auth.id = obj.id;
        auth.address = obj.address || [];
        auth.token = obj.token;
        auth.location = storageService.get("loc") || "";
    }
    return auth;
}]);

app.factory('storageService',['localStorageService', function (localStorageService) {
    var obj = localStorageService.get("userNode");
    var storeServ = {
        set:function(key,value){
            value = JSON.stringify(value);
            localStorageService.set(key,value);
        },
        get:function(key){
            var obj = localStorageService.get(key);
            obj = JSON.parse(obj);
            return obj || null;
        },
        clearAll:function(){
            localStorageService.clearAll();
        },
        remove:function(key){
            localStorageService.remove(key);
        }

    };
    return storeServ;
}]);

app.factory('cartService',['storageService', function (storageService) {
    var cartService = {
        totalCost:function(){
            var cost = 0;
            var obj = storageService.get('cart');
            if (obj != null) {
                if (obj.length > 0) {
                    for (var i = 0; i < obj.length; i++) {
                        cost = (obj[i].qty*obj[i].cost) + cost;
                    }
                }
            }
            return cost;
        },
        count:function(){
            var count = 0;
            var obj = storageService.get('cart');
            if (obj != null) {
                if (obj.length > 0) {
                    for (var i = 0; i < obj.length; i++) {
                        count = obj[i].qty+count;
                    }
                }
            }
            return count;
        },
        clearAll:function(){
            storageService.remove('cart');
        },
        add:function(item){
            var cart = storageService.get('cart');
            if (cart != null) {
                if (cart) {
                    var flag = false;
                    for (var i = 0; i < cart.length; i++) {
                        if (item._id == cart[i]._id) {
                            flag = true;
                            cart[i].qty = cart[i].qty + 1;
                            break;
                        }
                    }
                    if (!flag) {
                     cart.push(item);   
                    }
                    storageService.set('cart',cart);
                }
            }else{
                var cartList = [];
                cartList.push(item);
                storageService.set('cart',cartList);
            }
        },
        remove:function(item){
            var cart = storageService.get('cart');
            if (cart != null) {
                if (cart) {
                    for (var i = 0; i < cart.length; i++) {
                        if (item._id == cart[i]._id) {
                            flag = true;
                            cart[i].qty = cart[i].qty - 1;
                            if (cart[i].qty == 0) {
                                cart.splice(i,1);
                            }
                            break;
                        }
                    }
                    storageService.set('cart',cart);
                }
            }
        },
        getCart:function(){
            var cart = storageService.get('cart');
            if (cart != null) {
                return cart;
            }else{
                return [];
            }
        }
    };
    return cartService;
}]);

app.run(['authService','$rootScope', '$state', '$stateParams', '$location',
    function (authService, $rootScope, $state, $stateParams, $location) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            if (toState.isLoginRequired === true) {
                if (!authService.status) {
                    $rootScope.returnToState = toState.url;
                    $rootScope.returnToStateParams = toParams.Id;
                    console.log("redirect to login page");
                    $state.go('home');
                    event.preventDefault();
                }
            }

        });

    }]);



/// <reference path="vendor/angular.min.js" />


var app;

app = angular.module('t2tApp', ['ui.router', 'ui.bootstrap', 'LocalStorageModule','720kb.datepicker']);

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
}]);
app.controller('txnCtrl', ['cartService','$rootScope','authService','$scope', 'ttService', '$state', 'storageService', function (cartService,$rootScope,authService,$scope, ttService, $state, storageService) {
    var node = storageService.get("userNode");
    var order = storageService.get("order_summary");
    if (node && order) {
        $scope.order = order;
        $scope.user = node;
    }else{
        $state.go("home");
    }
    if (order._id) {
        ttService.getOrderById(authService.id,authService.token,order._id,function(obj){
            console.log(obj);
            debugger;
        });
    }else{
        $state.go("profile");
    }

}]);
app.controller('confirmCtrl', ['cartService','$rootScope','authService','$scope', 'ttService', '$state', 'storageService', function (cartService,$rootScope,authService,$scope, ttService, $state, storageService) {
    var node = storageService.get("userNode");
    cartService.clearAll();
    $rootScope.$broadcast("changeCount",{});
    var order = storageService.get("order_summary");
    if (node && order) {
        $scope.order = order;
        $scope.user = node;
        if (order.slot.startHrs == 99) {
            $scope.slot = "Immediate";
            $scope.deliveryFee = 20 ;
        }else{
            $scope.deliveryFee = 0;
            $scope.slot = order.slot.startHrs+':'+order.slot.startMins+' AM - '+order.slot.stopHrs+':'+order.slot.stopMins+" AM";
        }
    }else{
        $state.go("home");
    }
    $rootScope.$broadcast("logoutActivity",{});
    var od_date = new Date(order.createdAt);
    $scope.od_date = od_date.getDate()+'-'+(od_date.getMonth()+1)+'-'+od_date.getFullYear();
    var dl_date = new Date(order.deliveryDate);
    $scope.dl_date = dl_date.getDate()+'-'+(dl_date.getMonth()+1)+'-'+dl_date.getFullYear();
    console.log(order);
    $scope.items = order.items;
}]);
app.controller('profileCtrl', ['cartService','$modal','$rootScope','authService','$scope', 'ttService', '$state', 'storageService', function (cartService,$modal,$rootScope,authService,$scope, ttService, $state, storageService) {
    var node = storageService.get("userNode");
    $scope.changeFlag = false;
    $scope.couponMsg = "";
    $rootScope.$broadcast("addressChange",{});
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
            $scope.bookings = res.data;
            console.log()
            $scope.$apply(res.data);
        }else{
            alert("Ooops something went wrong ..!")
        }
    });
}]);
app.controller('cartCtrl', ['$modal','$rootScope','cartService','authService','$scope', 'ttService', '$state', 'storageService', function ($modal,$rootScope,cartService,authService,$scope, ttService, $state, storageService) {
    $scope.slots = [];
    var slots = [];
    $scope.order = {
        'paymentMode':'cod'
    };
    $rootScope.$broadcast("addressChange",{});
    $scope.paymentModeList = ['cod','paytm'];
    $rootScope.$broadcast("userLoginName",{});
    var node = storageService.get("userNode");
    $scope.cartList = cartService.getCart();
    $rootScope.$on('addressChange',function(obj){
        var node = storageService.get("userNode");
        if (node) {
            $scope.addresses = node.address;
        }else{
            $scope.addresses = [];
        }
        console.log($scope.addresses);
        $scope.$apply();
    });
    $scope.addresses = authService.address;
    $scope.isValidCoupon = false;
    var openErrorDialog = function () {
        var modalInstance = $modal.open({
         templateUrl: 'errorpopup.html',
         controller: 'errorModalCtrl',
         size:"sm",
         resolve: {
             entity: function () {
                 return $scope.entity;
             }
         }
        });
        modalInstance.result.then(function (selectedItem) {             

        });
    }
    $scope.minDate = new Date().getFullYear()+"-"+new Date().getMonth()+"-"+new Date().getDate();
    $scope.getSlots = function(){
        var date = new Date($scope.order.deliveryDate).getDate();
        var month = new Date($scope.order.deliveryDate).getMonth();
        var year = new Date($scope.order.deliveryDate).getFullYear();
        var d = new Date();
        if (year == d.getFullYear()) {
            if (month >= d.getMonth()) {
                if (date>= d.getDate()) {
                    if (date == d.getDate()) {
                            ttService.slots(function(data){
                                if (data.status == "success") {
                                    if (data.data.length > 0) {
                                        var slotList = [{text:"Immediate",value:{
                                        startHrs:99,
                                        startMins:99,
                                        duration:0,
                                        stopMins:99,
                                        stopHrs:99
                                    }}];
                                    slots = data.data;
                                    data.data.forEach(function(slot){
                                        slots.push(slot);
                                        var s_hrs = slot.startHrs < 10 ? '0'+slot.startHrs : slot.startHrs;
                                        var s_mins = slot.startMins < 10 ? '0' + slot.startMins : slot.startMins ;
                                        var e_hrs = slot.stopHrs < 10 ? '0'+slot.stopHrs : slot.stopHrs;
                                        var e_mins = slot.stopMins < 10 ? '0'+slot.stopMins : slot.stopMins;
                                        var slotText = s_hrs+" : "+s_mins +" AM - "+e_hrs+" : "+e_mins+" AM";
                                        slotList.push({text:slotText,value:slot});
                                    });
                                    $scope.slots = slotList;
                                    }else{
                                        $scope.slots = [];
                                    }
                                    $scope.$digest();
                                }else{
                                    alert("Oops something went wrong...!")
                                }
                            });
                    }else{
                        ttService.allSlots(function(data){
                            if (data.status == "success") {
                                var slotList = [];
                                slots = data.data;
                                data.data.forEach(function(slot){
                                    var s_hrs = slot.startHrs < 10 ? '0'+slot.startHrs : slot.startHrs;
                                    var s_mins = slot.startMins < 10 ? '0' + slot.startMins : slot.startMins ;
                                    var e_hrs = slot.stopHrs < 10 ? '0'+slot.stopHrs : slot.stopHrs;
                                    var e_mins = slot.stopMins < 10 ? '0'+slot.stopMins : slot.stopMins;
                                    var slotText = s_hrs+" : "+s_mins +" AM - "+e_hrs+" : "+e_mins+" AM";
                                    slotList.push({text:slotText,value:slot});
                                });
                                $scope.slots = slotList;
                                $scope.$digest();
                            }else{
                                alert("Oops something went wrong...!")
                            }
                        })
                    }
                }else{
                    openErrorDialog();
                    // alert("invalid date selection")
                }
            }else{
                openErrorDialog();
                // alert("invalid month selection")
            }
        }else{
            openErrorDialog();
            // alert("invalid year selection")
        }
    }
    var dfeeApplied = false;
    var totalCost = cartService.totalCost();
    $scope.deliveryFee = 0;
    if (totalCost < 50) {
        dfeeApplied = true;
       $scope.deliveryFee = 15; 
    }
    if (totalCost == 0) {
       $scope.deliveryFee = 0; 
    }
    $scope.totalCost = cartService.totalCost()+$scope.deliveryFee;
    $scope.countFunc=function(isIncr,item){
        if (isIncr) {
            item.qty = ++item.qty;
            cartService.add(item);
        }else{
            item.qty > 0 ? --item.qty : item.qty = 0;
            cartService.remove(item); 
        }
        if ($scope.totalCost < 50) {
            $scope.deliveryFee = 15;
            $scope.totalCost = cartService.totalCost()+$scope.deliveryFee;
        }
        if ($scope.totalCost == 0) {
            $scope.deliveryFee = 0;
            $scope.totalCost = cartService.totalCost();
        }
        $rootScope.$broadcast("changeCount",{});
    };
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
    $scope.updatePaymentType = function(ptype){
        $scope.$digest();
    } 
    $scope.couponEntered = false;
    $scope.validateCoupon = function(coupon){
        if(coupon.toString().length >= 6){
            if (authService.status) {
               ttService.verifyCoupon(authService.id,authService.token,coupon,function(obj){
                $scope.couponEntered = true;
                if (obj.status == "error") {
                        $scope.isValidCoupon = false; 
                        $scope.couponMsg = "Invalid Coupon";
                    }else{
                        $scope.isValidCoupon = true;
                        $scope.couponMsg = "Coupon Applied"; 
                    }
                $scope.$apply();
               })
            }else{
                showloginpopup();
            }
        }
    }
    $scope.continueShop = function(){
        $state.go("menu");
    }    
    $scope.coupon ;
    $scope.couponValue = 0;
    var dfee = false;
    $scope.validateImmediate = function(slot){
        slot = JSON.parse(slot);
        if (slot.startHrs == 99) {
                dfee = true;
                if (dfeeApplied) {
                    $scope.deliveryFee = $scope.deliveryFee + 20;
                    $scope.totalCost =$scope.totalCost+20;
                }else{
                    $scope.deliveryFee = 20;
                    $scope.totalCost =$scope.totalCost+20;
                }
            }else{
                if (dfee) {
                    dfee = false;
                    $scope.totalCost =$scope.totalCost-20;
                    if (dfeeApplied) {
                        $scope.deliveryFee = 15;
                    }else{
                        $scope.deliveryFee = 0;
                    }
                }
            }
    }
    $scope.placeOrder = function(order){
        if (authService.status) {
            console.log(JSON.stringify($scope.cartList));
            console.log(JSON.stringify(order));
            var cartList = $scope.cartList;
            var cList = cartList.map(function(obj){
                delete obj.$$hashKey;
                return obj;
            });
            
            ttService.postOrder(authService.id,authService.token,JSON.stringify(cList),order.address,$scope.coupon,$scope.couponValue,$scope.totalCost,$scope.totalCost,order.deliveryDate,order.slot,order.msg,order.paymentMode,function(obj){
                if (obj.status == "success") {
                    storageService.set("order_summary",obj.data);
                    if (obj.data.txn_type == "cod") {
                        $state.go("confirm");
                    }else{
                        $state.go("txn_post");
                    }
                }else{
                    alert("oops something went wrong..!")
                }
            });
        }else{
            showloginpopup();
        }
    };
    function showloginpopup(){
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
    }

}]);
app.controller('menuCtrl', ['$rootScope','cartService','authService','$scope', 'ttService', '$state', '$stateParams', 'storageService', function ($rootScope,cartService,authService,$scope, ttService, $state, $stateParams, storageService) {
    $scope.cities = storageService.get('cities'); // get all cities from storage
    $scope.city = storageService.get('city');
    var loc = storageService.get('loc');
    if (loc == null) {
        cartService.clearAll();
        $state.go("home");
    }
    $scope.location = loc.location;
    $scope.categories = [];$scope.menuList = [];
    $rootScope.$broadcast("userLoginName",{});
    $rootScope.$broadcast("changeCount",{});
    getCat(loc._id);
    function getCat(locId){
        ttService.getCategories(locId, function (data) {
        if (data.status == "success") {
            $scope.categories = data.data;
        } else {
            alert("oops something went wrong!! refresh the page");
        }
        $scope.$apply();
    });
    }
    $scope.getMenu = function(cat){
        authService.location = loc;
        if (authService.location != undefined || authService.location != "") {
            ttService.getMenu(authService.location._id,cat,function(data){
                if (data.status == "success") {
                    $scope.menuList = data.data;
                    storageService.set('menuList', data.data);
                } else {
                    alert("oops something went wrong!! refresh the page");
                }
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

app.controller('mainCtrl', [ '$rootScope','cartService','authService','$scope', 'ttService', '$state', 'storageService', function ($rootScope,cartService,authService,$scope, ttService, $state, storageService) {
    $rootScope.$broadcast("userLoginName",{});
    $rootScope.$broadcast("changeCount",{});
    ttService.getCities(function (data) {
        if(data.status == "success"){
            storageService.set('cities', data.data);
            $scope.cities = data.data;
        }else{
            alert("oops something went wrong!! refresh the page");
        }
        $scope.$digest();
    })
    $scope.getLoc = function (city) {
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

    $scope.onSelect = function (item, model, label) {
        cartService.clearAll();
        authService.location = item;
        storageService.set('loc', item);
        $state.go('menu');
    };
}]);


app.controller('baseController', [ '$rootScope','cartService' ,'$modal','storageService', 'authService' ,'$scope', 'ttService', function ($rootScope,cartService,$modal,storageService,authService ,$scope, ttService) {
    $scope.count = cartService.count() || 0 ;
    $scope.username = authService.name;
    $rootScope.$on("changeCount",function(obj){
        $scope.count = cartService.count();
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
    ttService.status(function (data) {
        if(data.status == "success"){
            $scope.status = data.data.isOpen;
        }else{
            alert("oops something went wrong!! refresh the page");
        }
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



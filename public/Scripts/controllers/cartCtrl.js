angular.module("t2tApp").controller('txnCtrl', ['cartService','$rootScope','authService','$scope', 'ttService', '$state', 'storageService', function (cartService,$rootScope,authService,$scope, ttService, $state, storageService) {
    var node = storageService.get("userNode");
    $scope.isHome = false;
    $rootScope.$broadcast("userLoginName",{});
    var order = storageService.get("order_summary");
    if (node && order) {
        $scope.order = order;
        $scope.user = node;
    }else{
        $state.go("home");
    }
    $rootScope.$broadcast("bannnerRelitive",{});

}]);
angular.module("t2tApp").controller('confirmCtrl', ['$modal','cartService','$rootScope','authService','$scope', 'ttService', '$state', 'storageService', function ($modal,cartService,$rootScope,authService,$scope, ttService, $state, storageService) {
    var node = storageService.get("userNode");
    $scope.isHome = false;
    cartService.clearAll();
    $scope.msg = "";
    $rootScope.$broadcast("changeCount",{});
    $rootScope.$broadcast("userLoginName",{});
    $rootScope.$broadcast("bannnerRelitive",{});
    $scope.trackOrder = function(order_num){
        storageService.set("order_num",order_num);
        $state.go("track");
    }
    $rootScope.$on("changeOrder",function(obj){
        var order = storageService.get("order_summary");
        ttService.getOrderById(authService.id,authService.token,order._id,function(obj){
            if (obj.status == "success") {
                $scope.order = obj.data;
                var flag = true;
                if (obj.data.txn_type == "cod") {
                    $scope.msg = "Order Placed Successfully ...!";
                    flag = false;
                }
                if (obj.data.txn_type == "paytm" && obj.data.status == "success") {
                    $scope.msg = "Order Placed Successfully ...!";
                    flag = false;
                }
                if (flag) {
                    $scope.msg = "Order Failed Please Try Again ...!";
                }
                $scope.$apply();
            }
        });
    });
    var order = storageService.get("order_summary");
    if (node && order) {
        $scope.order = order;
        $scope.user = node;
        if (order.slot.startHrs == 99) {
            $scope.slot = "Immediate";
            $scope.deliveryFee = 20 ;
        }else{
            $scope.deliveryFee = 0;
            var s_hours = order.slot.startHrs < 10 ? '0'+order.slot.startHrs:order.slot.startHrs;
            var s_mins = order.slot.startMins < 10 ? '0'+order.slot.startMins:order.slot.startMins;
            var e_hours = order.slot.stopHrs < 10 ? '0'+order.slot.stopHrs:order.slot.stopHrs;
            var e_mins = order.slot.stopMins < 10 ? '0'+order.slot.stopMins:order.slot.stopMins;
            $scope.slot = s_hours+':'+s_mins+' AM - '+e_hours+':'+e_mins+" AM";
        }
        ttService.getOrderById(authService.id,authService.token,order._id,function(obj){
            // console.log(obj);
            if(obj.status == "success"){
                $scope.order = obj.data;
                $scope.finalObj = obj.data;
                var flag = true;
                if (obj.data.txn_type == "cod") {
                    $scope.msg = "Order Placed Successfully ...!";
                    flag = false;
                }
                if (obj.data.txn_type == "paytm" && obj.data.status == "success") {
                    $scope.msg = "Order Placed Successfully ...!";
                    flag = false;
                }
                if (flag) {
                    $scope.msg = "Order Failed Please Try Again ...!";
                }
                if (obj.data.status == "cancelled") {
                    var modalInstance = $modal.open({
                     templateUrl: 'codpopup.html',
                     controller: 'codModalCtrl',
                     resolve: {
                         entity: function () {
                             return $scope.entity;
                         }
                     }
                    });
                    modalInstance.result.then(function (selectedItem) {             

                    });
                }
            }else{
                if (obj.data.status == "success") {
                    $scope.$apply();
                }else{
                    $state.go("profile");
                }
            }
           $scope.$apply(); 
        });

    }else{
        $state.go("profile");
    }
    $rootScope.$broadcast("logoutActivity",{});
    var od_date = new Date(order.createdAt);
    $scope.od_date = od_date.getDate()+'-'+(od_date.getMonth()+1)+'-'+od_date.getFullYear();
    var dl_date = new Date(order.deliveryDate);
    $scope.dl_date = dl_date.getDate()+'-'+(dl_date.getMonth()+1)+'-'+dl_date.getFullYear();
    console.log(order);
    $scope.items = order.items;
}]);


angular.module("t2tApp").controller('cartCtrl', ['$modal','$rootScope','cartService','authService','$scope', 'ttService', '$state', 'storageService', function ($modal,$rootScope,cartService,authService,$scope, ttService, $state, storageService) {
    $scope.slots = [];
    $scope.isHome = false;
    var slots = [];
    $scope.order = {
        'paymentMode':'cod'
    };
    $rootScope.$broadcast("bannnerRelitive",{});
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
        storageService.set("ngLoader",{"isWorking":true,"message":"Slots ..."})
        $rootScope.$emit("ngLoader",{});
        var date = new Date($scope.order.deliveryDate).getDate();
        var month = new Date($scope.order.deliveryDate).getMonth();
        var year = new Date($scope.order.deliveryDate).getFullYear();
        var d = new Date();
        if (year >= d.getFullYear()) {
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
                                    storageService.set("ngLoader",{"isWorking":false,"message":"Slots ..."});
                                    $rootScope.$emit("ngLoader",{});
                                    }else{
                                        $scope.slots = [];
                                        storageService.set("ngLoader",{"isWorking":false,"message":"Slots ..."});
                                        $rootScope.$emit("ngLoader",{});
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
                            storageService.set("ngLoader",{"isWorking":false,"message":"Slots ..."})
                            $rootScope.$emit("ngLoader",{});
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
    // date picker
 $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();


  $scope.inlineOptions = {
    customClass: getDayClass,
    minDate: new Date(),
    showWeeks: true
  };

  $scope.dateOptions = {
    dateDisabled: disabled,
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };

  // Disable weekend selection
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && ( date.getDay() === 0);
  }

  $scope.toggleMin = function() {
    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
  };

  $scope.toggleMin();

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };


  // $scope.setDate = function(year, month, day) {
  //   $scope.dt = new Date(year, month, day);
  // };


  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
    opened: false
  };



  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [
    {
      date: tomorrow,
      status: 'full'
    },
    {
      date: afterTomorrow,
      status: 'partially'
    }
  ];

  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  }

}]);
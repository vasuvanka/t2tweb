'use strict';

/**
 * @ngdoc service
 * @name time2tiffinApp.ttService
 * @description
 * # ttService
 * Service in the time2tiffinApp.
 */
angular.module('t2tApp')
  .factory('ttService', function () {
    var t2tService = {};

    var user = new User();

    t2tService.login = function (username,password, callback) {
        user.login(username,password, callback);
    };

    t2tService.slots = function (callback) {
        user.slots(callback);
    };
    t2tService.allSlots = function (callback) {
        user.allSlots(callback);
    };
    
    t2tService.status = function (callback) {
        user.status(callback);
    }

    t2tService.logout = function (id,token,callback) {
        user.logout(id,token,callback);
    }

    t2tService.getCities = function ( callback) {
        user.getCities( callback);
    }

    t2tService.getLocations = function (city,callback) {
        user.getLocations(city, callback);
    }

    t2tService.getCategories = function (area_id,callback) {
        user.getCategories(area_id,callback);
    }

    t2tService.getMenu = function (area_id,category,callback) {
        user.getMenu(area_id,category,callback);
    }

    t2tService.register = function (data,callback) {
        user.register(data, callback);
    }

    t2tService.forgetPassword = function (email, callback) 
    {
        user.forgetPassword(email, callback);
    }

    t2tService.getProfile = function (id,token,callback) {
        user.getProfile(id,token,callback);
    }

    t2tService.passwordChange = function (id,token,password,callback) {
        user.passwordChange(id,token,password,callback);
    }

    t2tService.updateProfile = function (id,token,data,callback) {
        user.updateProfile(id,token,data,callback);
    }

    t2tService.verifyCoupon = function (id,token,coupon,callback) {
        user.verifyCoupon(id,token,coupon,callback);
    }
    t2tService.getOrders = function(id,token,callback){
        user.getOrders(id,token,callback);
    }
    t2tService.postOrder = function (id,token,items,address,coupon,couponValue,totalPrice,finalPrice,deliveryDate,slot,msg,txn_type,callback) {
        if (items.length <= 0) {
            return {'status':'error','data':[],'error':['no items in the cart']};
        }
        var obj = {
            items:items,
            address:address,
            coupon:coupon || "",
            couponValue:couponValue || 0,
            totalPrice:totalPrice,
            finalPrice:finalPrice,
            msg:msg || "",
            deliveryDate:deliveryDate,
            deliverySlot:slot,
            txn_type:txn_type,
            txn_from:"w"
        };
        user.postOrder(id,token,obj,callback);
    }
    t2tService.updateOrder = function (id,token,od_id,txn_id,txn_type,status,callback) {
        user.updateOrder(id,token,od_id,{'txn_id':txn_id,'txn_type':txn_type,'status':status},callback);
    }
    t2tService.deleteAccount = function (id,token,callback) {
        user.deleteAccount(id,token,callback);
    }

    return t2tService;
  });


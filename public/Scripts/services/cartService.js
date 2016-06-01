

angular.module("t2tApp").factory('cartService',['storageService', function (storageService) {
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

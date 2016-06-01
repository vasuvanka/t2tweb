angular.module("t2tApp").factory('storageService',['localStorageService', function (localStorageService) {
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

angular.module("t2tApp").factory('authService',['storageService', function (storageService) {
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
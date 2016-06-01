angular.module("t2tApp").controller('trackCtrl', ['cartService','$rootScope','authService','$scope', 'ttService', '$state', 'storageService', function (cartService,$rootScope,authService,$scope, ttService, $state, storageService) {
    $scope.isTracking = false;
    $scope.trackInfo;
    $scope.isError = false;
    // $scope.isHome = true;
    $rootScope.$broadcast("bannnerRelitive",{});
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
/// <reference path="vendor/angular.min.js" />
"use strict";
(function(){
angular.module('t2tApp', ['ui.router', 'ui.bootstrap', 'LocalStorageModule','ngLoader'])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'localStorageServiceProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, localStorageServiceProvider) {
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
}])
.run(['authService','$rootScope', '$state', '$stateParams', '$location',
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
})()














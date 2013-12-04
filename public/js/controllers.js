'use strict';

angular.module('myApp.controllers', []).controller('mainController', function ($scope, $http, $location, $window, socket) {
}).controller('homeController',function ($scope, $location, $window, socket) {
    var c = angular.element('#canvas-game')[0];
    var game = new Game(c);
});

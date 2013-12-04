'use strict';

angular.module('myApp', [
        'myApp.controllers',
        'myApp.directives',
        'myApp.filters',
        'myApp.services'
    ]).
    config(function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'partials/home',
                controller: 'homeController'
            }).
            otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode(true);
    }
);

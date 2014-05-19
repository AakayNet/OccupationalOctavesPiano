'use strict';

angular.module('myApp.controllers', [])
  .controller('homeCtrl', homeCtrl);

function homeCtrl() {
  var c = angular.element('#canvas-game')[0];
  var game = new Game(c);
}

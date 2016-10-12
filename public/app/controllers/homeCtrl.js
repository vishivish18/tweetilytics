angular.module('app')
    .controller('homeCtrl', function($scope, $http) {
        $scope.setup = function() {
           // use data mutator to act upon data
           $http.get('/tweets').then(function(res){
           	console.log(res)
           })
        };
        $scope.setup();
    });

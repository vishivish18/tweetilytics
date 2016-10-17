angular.module('app')
    .controller('homeCtrl', function($scope, $http) {
        $scope.setup = function() {
            // use data mutator to act upon data
            $http.get('api/tweets/stats')
                .then(function(res) {
                    console.log(res);
                }, function(err) {
                    console.log(err);
                })

        };
        $scope.setup();
    });

angular.module('app')
    .controller('searchCtrl', function($scope, $http) {
        $scope.setup = function() {
            $http.get('api/tweets/search')
                .then(function(res) {
                    console.log(res);
                    $scope.tweets = res.data;
                }, function(err) {
                    console.log(err);
                })
        };
        $scope.setup();
    });

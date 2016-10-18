angular.module('app')
    .controller('crawlerCtrl', function($scope, $http) {
        console.log("Crawler Controller")
        $scope.running = false
        $scope.setup = function() {
            $http.get('crawl/tweets')
                .then(function(res) {
                    console.log(res.data);
                    if (res.data == "running") {
                        console.log('here')
                        $scope.running = true;
                        console.log($scope.running);
                    }
                }, function(err) {
                    console.log(err);
                })

        };
        $scope.setup();
    });

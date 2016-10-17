angular.module('app')
    .controller('searchCtrl', function($scope, $http, $location) {

        $scope.performSearch = function(term) {
            $location.search('term', term);
        }

        $scope.$watch(function() {
            return $location.search().term;
        }, function(newVal, oldVal) {

            if (newVal && newVal != '') {
                $scope.getData(newVal)
            }
        })


        $scope.getData = function(val) {
            $http.get('api/tweets/search/' + val)
                .then(function(res) {
                    console.log(res);
                    $scope.tweets = res.data;
                }, function(err) {
                    console.log(err);
                })
        };
    });

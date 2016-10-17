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
            $scope.loading = true;
            $http.get('api/tweets/search/' + val)
                .then(function(res) {
                    console.log(res);
                    $scope.tweets = res.data;
                    $scope.loading = false;
                }, function(err) {
                    console.log(err);
                })
        };
    })
    .filter('highlight', function($sce) {
        return function(text, phrase) {
            if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
                '<span class="highlighted">$1</span>')

            return $sce.trustAsHtml(text)
        }
    });

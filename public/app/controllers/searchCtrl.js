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
            $scope.term = val;
            $http.get('api/tweets/search/' + val, {
                    headers: {
                        page: 1
                    }
                })
                .then(function(res) {
                    console.log(res);
                    console.log(typeof(res.data.metadata.current_page))
                    $scope.tweets = res.data.tweets;
                    $scope.metadata = res.data.metadata;
                    $scope.page = res.data.metadata.current_page;
                    $scope.loading = false;
                }, function(err) {
                    console.log(err);
                })
        };

        $scope.loadMore = function() {
            console.log("loading more");
            $scope.loading = true;
            $http.get('api/tweets/search/' + $scope.term, {
                    headers: {
                        page: $scope.page + 1
                    }
                })
                .then(function(res) {
                    console.log(res);
                    $scope.tweets = _.union($scope.tweets, res.data.tweets)
                    $scope.metadata = res.data.metadata;
                    $scope.page = res.data.metadata.current_page;
                    $scope.loading = false;
                }, function(err) {
                    console.log(err);
                })
        }

    })
    .filter('highlight', function($sce) {
        return function(text, phrase) {
            if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
                '<span class="highlighted">$1</span>')

            return $sce.trustAsHtml(text)
        }
    });

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
                    var time = res.config.responseTimestamp - res.config.requestTimestamp;
                    $scope.tweets = res.data.tweets;
                    res.data.tweets.map(function(value) {
                        console.log(moment(value.created_at).format("D MMM, dddd"));
                    })
                    $scope.metadata = res.data.metadata;
                    $scope.metadata.time_taken = (time / 1000) + ' seconds.';
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

        $scope.loadNext = function() {
            console.log("loading next");
            $scope.loading = true;
            $http.get('api/tweets/search/' + $scope.term, {
                    headers: {
                        page: $scope.page + 1
                    }
                })
                .then(function(res) {
                    console.log(res);
                    var time = res.config.responseTimestamp - res.config.requestTimestamp;
                    $scope.tweets = res.data.tweets;
                    $scope.metadata = res.data.metadata;
                    $scope.metadata.time_taken = (time / 1000) + ' seconds.';
                    $scope.page = res.data.metadata.current_page;
                    $scope.loading = false;
                }, function(err) {
                    console.log(err);
                })
        }
        $scope.loadPrevious = function() {
            console.log("loading previous");
            $scope.loading = true;
            $http.get('api/tweets/search/' + $scope.term, {
                    headers: {
                        page: $scope.page - 1
                    }
                })
                .then(function(res) {
                    console.log(res);
                    var time = res.config.responseTimestamp - res.config.requestTimestamp;
                    $scope.tweets = res.data.tweets;
                    $scope.metadata = res.data.metadata;
                    $scope.metadata.time_taken = (time / 1000) + ' seconds.';
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

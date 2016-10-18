angular.module('app', [
    'ngRoute', 'ui.router', 'tc.chartjs'
]);

angular.module('app')
    .config(["$stateProvider", "$urlRouterProvider", "$locationProvider", function($stateProvider, $urlRouterProvider, $locationProvider) {

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('app', {
                url: '/',
                views: {
                    'header': {
                        templateUrl: '/nav.html',
                    },
                    'content': {
                        templateUrl: '/home.html',
                        controller: 'homeCtrl'
                    }
                }
            })

        .state('app.crawler', {
            url: 'crawler',
            views: {
                'content@': {
                    templateUrl: '/crawler.html',
                    controller: 'crawlerCtrl'
                }
            }

        })
        .state('app.search', {
            url: 'search',
            views: {
                'content@': {
                    templateUrl: '/search.html',
                    controller: 'searchCtrl'
                }
            }

        })

        $locationProvider.html5Mode(true);

    }]);

angular.module('app')
    .controller('crawlerCtrl', ["$scope", "$http", function($scope, $http) {
        console.log("Crawler Controller")
        $scope.setup = function() {
            $http.get('crawl/tweets')
                .then(function(res) {
                    console.log(res);
                }, function(err) {
                    console.log(err);
                })

        };
        $scope.setup();
    }]);

angular.module('app')
    .controller('homeCtrl', ["$scope", "$http", "dataMutator", function($scope, $http, dataMutator) {
        $scope.setup = function() {
            // dataMutator.getData()
            //     .then(function(response) {
            //         console.log(response);

            //     }, function(err) {
            //         console.error(err);
            //     });


        };
        $scope.setup();
    }]);

angular.module('app')
    .controller('masterCtrl', function() {
        // main controller binded to body of the app, actions required at global level can be done here
        console.info("App Loaded");
    });

angular.module('app')
    .controller('searchCtrl', ["$scope", "$http", "$location", function($scope, $http, $location) {

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
                    $scope.tweets = res.data.tweets;
                    $scope.metadata = res.data.metadata;
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
                    $scope.tweets = res.data.tweets;
                    $scope.metadata = res.data.metadata;
                    $scope.page = res.data.metadata.current_page;
                    $scope.loading = false;
                }, function(err) {
                    console.log(err);
                })
        }

    }])
    .filter('highlight', ["$sce", function($sce) {
        return function(text, phrase) {
            if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
                '<span class="highlighted">$1</span>')

            return $sce.trustAsHtml(text)
        }
    }]);

// dataMutator Service
angular.module('app')
    .service('dataMutator', ["$http", "$q", function($http, $q) {
        return {
            getData: getData,
            getDailyStats: getDailyStats,
            getWeeklyStats: getWeeklyStats
        };


        function getData() {
            return $http.get('api/tweets/frequency_stats')
        }

        function getDailyStats() {
            var deferred = $q.defer();
            getData().then(function(res) {
                console.log(res);
                var days = []
                var counts = []
                angular.forEach(res.data, function(value, key) {
                    days[key] = moment(value.date).format("D MMM, dddd")
                    counts[key] = value.count;
                })
                var response = {
                    days: days,
                    counts: counts
                }
                deferred.resolve(response)

            }, function(err) {
                console.log(err);
                deferred.reject("There was some problem", err)
            })
            return deferred.promise;
        }

        function getWeeklyStats() {

        }
    }]);

angular.module('app')
    .directive('dailyStats', function() {
        return {
            restrict: 'E',
            scope: {
                stats: '=item',
            },
            templateUrl: 'partials/dailyStats.html',
            controller: 'dailyStatsCtrl'
        };
    });

angular.module('app')
    .directive('loader', function() {
        return {
            restrict: 'E',
            templateUrl: 'partials/loader.html'
        };
    });

angular.module('app')
    .directive('locationStats', function() {
        return {
            restrict: 'E',
            scope: {
                stats: '=item',
            },
            templateUrl: 'partials/locationStats.html',
            controller: 'locationStatsCtrl'
        };
    });

angular.module('app')
    .directive('paginator', function() {
        return {
            restrict: 'E',
            scope: {
                metadata: '=item',
            },
            templateUrl: 'partials/paginator.html'
        };
    });

angular.module('app')
    .directive('weeklyStats', function() {
        return {
            restrict: 'E',
            scope: {
                stats: '=item',
            },
            templateUrl: 'partials/weeklyStats.html',
            //controller: 'weeklyStatsCtrl'
        };
    });

angular.module('app')
    .controller('dailyStatsCtrl', ["$scope", "$http", "dataMutator", function($scope, $http, dataMutator) {
        $scope.loading = true;
        $scope.setup = function() {
            dataMutator.getDailyStats().then(function(res) {
                $scope.prepareDailyChart(res.days, res.counts);
                $scope.loading = false;
            }, function(err) {
                console.err(err);
            });

        };
        $scope.setup();
        // Chart.js Data

        $scope.prepareDailyChart = function(days, counts) {

            $scope.data = {
                labels: days,
                datasets: [{
                    label: 'My First dataset',
                    fillColor: 'rgba(220,220,220,0.2)',
                    strokeColor: 'rgba(220,220,220,1)',
                    pointColor: 'rgba(220,220,220,1)',
                    pointStrokeColor: '#fff',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(220,220,220,1)',
                    data: counts
                }]
            };

            // Chart.js Options
            $scope.options = {

                // Sets the chart to be responsive
                responsive: true,

                ///Boolean - Whether grid lines are shown across the chart
                scaleShowGridLines: true,

                //String - Colour of the grid lines
                scaleGridLineColor: "rgba(0,0,0,.05)",

                //Number - Width of the grid lines
                scaleGridLineWidth: 1,

                //Boolean - Whether the line is curved between points
                bezierCurve: true,

                //Number - Tension of the bezier curve between points
                bezierCurveTension: 0.4,

                //Boolean - Whether to show a dot for each point
                pointDot: true,

                //Number - Radius of each point dot in pixels
                pointDotRadius: 4,

                //Number - Pixel width of point dot stroke
                pointDotStrokeWidth: 1,

                //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
                pointHitDetectionRadius: 20,

                //Boolean - Whether to show a stroke for datasets
                datasetStroke: true,

                //Number - Pixel width of dataset stroke
                datasetStrokeWidth: 2,

                //Boolean - Whether to fill the dataset with a colour
                datasetFill: true,

                // Function - on animation progress
                onAnimationProgress: function() {},

                // Function - on animation complete
                onAnimationComplete: function() {},


            };
        }

    }]);

angular.module('app')
    .controller('locationStatsCtrl', ["$scope", "$http", function($scope, $http) {
        $scope.loading = true;
        $scope.setup = function() {
            $http.get('api/tweets/location_stats')
                .then(function(res) {
                    console.log(res);
                    $scope.loading = false;
                    $scope.data = _.filter(res.data, function(tweet) {
                        return tweet.country !== "N/A";
                    });
                    $scope.$watch(function() {
                        return $scope.data;
                    }, function(n) {
                        if (!n) return;
                        // If it has received data then start working on analyzing
                        //$scope.prepareLocationChart($scope.data);
                        $scope.calculatePercentage($scope.data);
                    });
                }, function(err) {
                    console.log(err);
                })

        };
        $scope.setup();

        $scope.calculatePercentage = function(data) {
            var total = 0;
            angular.forEach(data, function(value, key) {
                total += value.count;
            })
            angular.forEach(data, function(value, key) {
                value.percentage = ((value.count / total) * 100).toFixed(2);
            })
            $scope.prepareLocationChart(data);

        }
        $scope.prepareLocationChart = function(data) {
            console.log(data);
            var locationData = [];
            angular.forEach(data, function(value, key) {
                var randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16)
                    var obj = {
                        value: value.count,
                        color: randomColor,
                        highlight: randomColor,
                        label: value.country
                    }
                locationData.push(obj);
            })

            $scope.locationData = locationData;

            // Chart.js Options
            $scope.locationOptions = {

                // Sets the chart to be responsive
                responsive: true,

                //Boolean - Whether we should show a stroke on each segment
                segmentShowStroke: true,

                //String - The colour of each segment stroke
                segmentStrokeColor: '#fff',

                //Number - The width of each segment stroke
                segmentStrokeWidth: 2,

                //Number - The percentage of the chart that we cut out of the middle
                percentageInnerCutout: 0, // This is 0 for Pie charts

                //Number - Amount of animation steps
                animationSteps: 100,

                //String - Animation easing effect
                animationEasing: 'easeOutBounce',

                //Boolean - Whether we animate the rotation of the Doughnut
                animateRotate: true,

                //Boolean - Whether we animate scaling the Doughnut from the centre
                animateScale: false

            };
        };
    }]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInJvdXRlcy5qcyIsImNvbnRyb2xsZXJzL2NyYXdsZXJDdHJsLmpzIiwiY29udHJvbGxlcnMvaG9tZUN0cmwuanMiLCJjb250cm9sbGVycy9tYXN0ZXJDdHJsLmpzIiwiY29udHJvbGxlcnMvc2VhcmNoQ3RybC5qcyIsInNlcnZpY2VzL2RhdGFNdXRhdG9yLmpzIiwiZGlyZWN0aXZlcy9kYWlseVN0YXRzLmpzIiwiZGlyZWN0aXZlcy9sb2FkZXIuanMiLCJkaXJlY3RpdmVzL2xvY2F0aW9uU3RhdHMuanMiLCJkaXJlY3RpdmVzL3BhZ2luYXRvci5qcyIsImRpcmVjdGl2ZXMvd2Vla2x5U3RhdHMuanMiLCJjb250cm9sbGVycy9wYXJ0aWFscy9kYWlseVN0YXRzQ3RybC5qcyIsImNvbnRyb2xsZXJzL3BhcnRpYWxzL2xvY2F0aW9uU3RhdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFFBQUEsT0FBQSxPQUFBO0lBQ0EsV0FBQSxhQUFBOzs7QUNEQSxRQUFBLE9BQUE7S0FDQSxxRUFBQSxTQUFBLGdCQUFBLG9CQUFBLG1CQUFBOztRQUVBLG1CQUFBLFVBQUE7O1FBRUE7YUFDQSxNQUFBLE9BQUE7Z0JBQ0EsS0FBQTtnQkFDQSxPQUFBO29CQUNBLFVBQUE7d0JBQ0EsYUFBQTs7b0JBRUEsV0FBQTt3QkFDQSxhQUFBO3dCQUNBLFlBQUE7Ozs7O1NBS0EsTUFBQSxlQUFBO1lBQ0EsS0FBQTtZQUNBLE9BQUE7Z0JBQ0EsWUFBQTtvQkFDQSxhQUFBO29CQUNBLFlBQUE7Ozs7O1NBS0EsTUFBQSxjQUFBO1lBQ0EsS0FBQTtZQUNBLE9BQUE7Z0JBQ0EsWUFBQTtvQkFDQSxhQUFBO29CQUNBLFlBQUE7Ozs7OztRQU1BLGtCQUFBLFVBQUE7Ozs7QUN4Q0EsUUFBQSxPQUFBO0tBQ0EsV0FBQSxtQ0FBQSxTQUFBLFFBQUEsT0FBQTtRQUNBLFFBQUEsSUFBQTtRQUNBLE9BQUEsUUFBQSxXQUFBO1lBQ0EsTUFBQSxJQUFBO2lCQUNBLEtBQUEsU0FBQSxLQUFBO29CQUNBLFFBQUEsSUFBQTttQkFDQSxTQUFBLEtBQUE7b0JBQ0EsUUFBQSxJQUFBOzs7O1FBSUEsT0FBQTs7O0FDWkEsUUFBQSxPQUFBO0tBQ0EsV0FBQSwrQ0FBQSxTQUFBLFFBQUEsT0FBQSxhQUFBO1FBQ0EsT0FBQSxRQUFBLFdBQUE7Ozs7Ozs7Ozs7O1FBV0EsT0FBQTs7O0FDYkEsUUFBQSxPQUFBO0tBQ0EsV0FBQSxjQUFBLFdBQUE7O1FBRUEsUUFBQSxLQUFBOzs7QUNIQSxRQUFBLE9BQUE7S0FDQSxXQUFBLCtDQUFBLFNBQUEsUUFBQSxPQUFBLFdBQUE7O1FBRUEsT0FBQSxnQkFBQSxTQUFBLE1BQUE7WUFDQSxVQUFBLE9BQUEsUUFBQTs7O1FBR0EsT0FBQSxPQUFBLFdBQUE7WUFDQSxPQUFBLFVBQUEsU0FBQTtXQUNBLFNBQUEsUUFBQSxRQUFBOztZQUVBLElBQUEsVUFBQSxVQUFBLElBQUE7Z0JBQ0EsT0FBQSxRQUFBOzs7OztRQUtBLE9BQUEsVUFBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLFVBQUE7WUFDQSxPQUFBLE9BQUE7WUFDQSxNQUFBLElBQUEsdUJBQUEsS0FBQTtvQkFDQSxTQUFBO3dCQUNBLE1BQUE7OztpQkFHQSxLQUFBLFNBQUEsS0FBQTtvQkFDQSxRQUFBLElBQUE7b0JBQ0EsUUFBQSxJQUFBLE9BQUEsSUFBQSxLQUFBLFNBQUE7b0JBQ0EsT0FBQSxTQUFBLElBQUEsS0FBQTtvQkFDQSxPQUFBLFdBQUEsSUFBQSxLQUFBO29CQUNBLE9BQUEsT0FBQSxJQUFBLEtBQUEsU0FBQTtvQkFDQSxPQUFBLFVBQUE7bUJBQ0EsU0FBQSxLQUFBO29CQUNBLFFBQUEsSUFBQTs7OztRQUlBLE9BQUEsV0FBQSxXQUFBO1lBQ0EsUUFBQSxJQUFBO1lBQ0EsT0FBQSxVQUFBO1lBQ0EsTUFBQSxJQUFBLHVCQUFBLE9BQUEsTUFBQTtvQkFDQSxTQUFBO3dCQUNBLE1BQUEsT0FBQSxPQUFBOzs7aUJBR0EsS0FBQSxTQUFBLEtBQUE7b0JBQ0EsUUFBQSxJQUFBO29CQUNBLE9BQUEsU0FBQSxFQUFBLE1BQUEsT0FBQSxRQUFBLElBQUEsS0FBQTtvQkFDQSxPQUFBLFdBQUEsSUFBQSxLQUFBO29CQUNBLE9BQUEsT0FBQSxJQUFBLEtBQUEsU0FBQTtvQkFDQSxPQUFBLFVBQUE7bUJBQ0EsU0FBQSxLQUFBO29CQUNBLFFBQUEsSUFBQTs7OztRQUlBLE9BQUEsV0FBQSxXQUFBO1lBQ0EsUUFBQSxJQUFBO1lBQ0EsT0FBQSxVQUFBO1lBQ0EsTUFBQSxJQUFBLHVCQUFBLE9BQUEsTUFBQTtvQkFDQSxTQUFBO3dCQUNBLE1BQUEsT0FBQSxPQUFBOzs7aUJBR0EsS0FBQSxTQUFBLEtBQUE7b0JBQ0EsUUFBQSxJQUFBO29CQUNBLE9BQUEsU0FBQSxJQUFBLEtBQUE7b0JBQ0EsT0FBQSxXQUFBLElBQUEsS0FBQTtvQkFDQSxPQUFBLE9BQUEsSUFBQSxLQUFBLFNBQUE7b0JBQ0EsT0FBQSxVQUFBO21CQUNBLFNBQUEsS0FBQTtvQkFDQSxRQUFBLElBQUE7OztRQUdBLE9BQUEsZUFBQSxXQUFBO1lBQ0EsUUFBQSxJQUFBO1lBQ0EsT0FBQSxVQUFBO1lBQ0EsTUFBQSxJQUFBLHVCQUFBLE9BQUEsTUFBQTtvQkFDQSxTQUFBO3dCQUNBLE1BQUEsT0FBQSxPQUFBOzs7aUJBR0EsS0FBQSxTQUFBLEtBQUE7b0JBQ0EsUUFBQSxJQUFBO29CQUNBLE9BQUEsU0FBQSxJQUFBLEtBQUE7b0JBQ0EsT0FBQSxXQUFBLElBQUEsS0FBQTtvQkFDQSxPQUFBLE9BQUEsSUFBQSxLQUFBLFNBQUE7b0JBQ0EsT0FBQSxVQUFBO21CQUNBLFNBQUEsS0FBQTtvQkFDQSxRQUFBLElBQUE7Ozs7O0tBS0EsT0FBQSxzQkFBQSxTQUFBLE1BQUE7UUFDQSxPQUFBLFNBQUEsTUFBQSxRQUFBO1lBQ0EsSUFBQSxRQUFBLE9BQUEsS0FBQSxRQUFBLElBQUEsT0FBQSxNQUFBLFNBQUEsS0FBQTtnQkFDQTs7WUFFQSxPQUFBLEtBQUEsWUFBQTs7Ozs7QUNsR0EsUUFBQSxPQUFBO0tBQ0EsUUFBQSwrQkFBQSxTQUFBLE9BQUEs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Ozs7d0JBR0EsT0FBQSxvQkFBQSxPQUFBOzttQkFFQSxTQUFBLEtBQUE7b0JBQ0EsUUFBQSxJQUFBOzs7O1FBSUEsT0FBQTs7UUFFQSxPQUFBLHNCQUFBLFNBQUEsTUFBQTtZQUNBLElBQUEsUUFBQTtZQUNBLFFBQUEsUUFBQSxNQUFBLFNBQUEsT0FBQSxLQUFBO2dCQUNBLFNBQUEsTUFBQTs7WUFFQSxRQUFBLFFBQUEsTUFBQSxTQUFBLE9BQUEsS0FBQTtnQkFDQSxNQUFBLGFBQUEsQ0FBQSxDQUFBLE1BQUEsUUFBQSxTQUFBLEtBQUEsUUFBQTs7WUFFQSxPQUFBLHFCQUFBOzs7UUFHQSxPQUFBLHVCQUFBLFNBQUEsTUFBQTtZQUNBLFFBQUEsSUFBQTtZQUNBLElBQUEsZUFBQTtZQUNBLFFBQUEsUUFBQSxNQUFBLFNBQUEsT0FBQSxLQUFBO2dCQUNBLElBQUEsY0FBQSxNQUFBLEtBQUEsTUFBQSxLQUFBLFdBQUEsVUFBQSxTQUFBO29CQUNBLElBQUEsTUFBQTt3QkFDQSxPQUFBLE1BQUE7d0JBQ0EsT0FBQTt3QkFDQSxXQUFBO3dCQUNBLE9BQUEsTUFBQTs7Z0JBRUEsYUFBQSxLQUFBOzs7WUFHQSxPQUFBLGVBQUE7OztZQUdBLE9BQUEsa0JBQUE7OztnQkFHQSxZQUFBOzs7Z0JBR0EsbUJBQUE7OztnQkFHQSxvQkFBQTs7O2dCQUdBLG9CQUFBOzs7Z0JBR0EsdUJBQUE7OztnQkFHQSxnQkFBQTs7O2dCQUdBLGlCQUFBOzs7Z0JBR0EsZUFBQTs7O2dCQUdBLGNBQUE7Ozs7O0FBS0EiLCJmaWxlIjoiYXBwLmJ1aWx0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFtcbiAgICAnbmdSb3V0ZScsICd1aS5yb3V0ZXInLCAndGMuY2hhcnRqcydcbl0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuXG4gICAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblxuICAgICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAgICAgLnN0YXRlKCdhcHAnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnLycsXG4gICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2hlYWRlcic6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL25hdi5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgJ2NvbnRlbnQnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9ob21lLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2hvbWVDdHJsJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAuc3RhdGUoJ2FwcC5jcmF3bGVyJywge1xuICAgICAgICAgICAgdXJsOiAnY3Jhd2xlcicsXG4gICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICdjb250ZW50QCc6IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3Jhd2xlci5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2NyYXdsZXJDdHJsJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FwcC5zZWFyY2gnLCB7XG4gICAgICAgICAgICB1cmw6ICdzZWFyY2gnLFxuICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAnY29udGVudEAnOiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL3NlYXJjaC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ3NlYXJjaEN0cmwnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pXG5cbiAgICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuXG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignY3Jhd2xlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ3Jhd2xlciBDb250cm9sbGVyXCIpXG4gICAgICAgICRzY29wZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGh0dHAuZ2V0KCdjcmF3bC90d2VldHMnKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLnNldHVwKCk7XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignaG9tZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCBkYXRhTXV0YXRvcikge1xuICAgICAgICAkc2NvcGUuc2V0dXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGRhdGFNdXRhdG9yLmdldERhdGEoKVxuICAgICAgICAgICAgLy8gICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblxuICAgICAgICAgICAgLy8gICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgLy8gICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAvLyAgICAgfSk7XG5cblxuICAgICAgICB9O1xuICAgICAgICAkc2NvcGUuc2V0dXAoKTtcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdtYXN0ZXJDdHJsJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIG1haW4gY29udHJvbGxlciBiaW5kZWQgdG8gYm9keSBvZiB0aGUgYXBwLCBhY3Rpb25zIHJlcXVpcmVkIGF0IGdsb2JhbCBsZXZlbCBjYW4gYmUgZG9uZSBoZXJlXG4gICAgICAgIGNvbnNvbGUuaW5mbyhcIkFwcCBMb2FkZWRcIik7XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignc2VhcmNoQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRsb2NhdGlvbikge1xuXG4gICAgICAgICRzY29wZS5wZXJmb3JtU2VhcmNoID0gZnVuY3Rpb24odGVybSkge1xuICAgICAgICAgICAgJGxvY2F0aW9uLnNlYXJjaCgndGVybScsIHRlcm0pO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAkbG9jYXRpb24uc2VhcmNoKCkudGVybTtcbiAgICAgICAgfSwgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcblxuICAgICAgICAgICAgaWYgKG5ld1ZhbCAmJiBuZXdWYWwgIT0gJycpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZ2V0RGF0YShuZXdWYWwpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cblxuICAgICAgICAkc2NvcGUuZ2V0RGF0YSA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgJHNjb3BlLnRlcm0gPSB2YWw7XG4gICAgICAgICAgICAkaHR0cC5nZXQoJ2FwaS90d2VldHMvc2VhcmNoLycgKyB2YWwsIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZTogMVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codHlwZW9mKHJlcy5kYXRhLm1ldGFkYXRhLmN1cnJlbnRfcGFnZSkpXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS50d2VldHMgPSByZXMuZGF0YS50d2VldHM7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5tZXRhZGF0YSA9IHJlcy5kYXRhLm1ldGFkYXRhO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGFnZSA9IHJlcy5kYXRhLm1ldGFkYXRhLmN1cnJlbnRfcGFnZTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5sb2FkTW9yZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJsb2FkaW5nIG1vcmVcIik7XG4gICAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICAkaHR0cC5nZXQoJ2FwaS90d2VldHMvc2VhcmNoLycgKyAkc2NvcGUudGVybSwge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlOiAkc2NvcGUucGFnZSArIDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS50d2VldHMgPSBfLnVuaW9uKCRzY29wZS50d2VldHMsIHJlcy5kYXRhLnR3ZWV0cylcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1ldGFkYXRhID0gcmVzLmRhdGEubWV0YWRhdGE7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5wYWdlID0gcmVzLmRhdGEubWV0YWRhdGEuY3VycmVudF9wYWdlO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUubG9hZE5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibG9hZGluZyBuZXh0XCIpO1xuICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgJGh0dHAuZ2V0KCdhcGkvdHdlZXRzL3NlYXJjaC8nICsgJHNjb3BlLnRlcm0sIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZTogJHNjb3BlLnBhZ2UgKyAxXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudHdlZXRzID0gcmVzLmRhdGEudHdlZXRzO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubWV0YWRhdGEgPSByZXMuZGF0YS5tZXRhZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBhZ2UgPSByZXMuZGF0YS5tZXRhZGF0YS5jdXJyZW50X3BhZ2U7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUubG9hZFByZXZpb3VzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImxvYWRpbmcgcHJldmlvdXNcIik7XG4gICAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICAkaHR0cC5nZXQoJ2FwaS90d2VldHMvc2VhcmNoLycgKyAkc2NvcGUudGVybSwge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlOiAkc2NvcGUucGFnZSAtIDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS50d2VldHMgPSByZXMuZGF0YS50d2VldHM7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5tZXRhZGF0YSA9IHJlcy5kYXRhLm1ldGFkYXRhO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGFnZSA9IHJlcy5kYXRhLm1ldGFkYXRhLmN1cnJlbnRfcGFnZTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICB9KVxuICAgIC5maWx0ZXIoJ2hpZ2hsaWdodCcsIGZ1bmN0aW9uKCRzY2UpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHRleHQsIHBocmFzZSkge1xuICAgICAgICAgICAgaWYgKHBocmFzZSkgdGV4dCA9IHRleHQucmVwbGFjZShuZXcgUmVnRXhwKCcoJyArIHBocmFzZSArICcpJywgJ2dpJyksXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaGlnaGxpZ2h0ZWRcIj4kMTwvc3Bhbj4nKVxuXG4gICAgICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbCh0ZXh0KVxuICAgICAgICB9XG4gICAgfSk7XG4iLCIvLyBkYXRhTXV0YXRvciBTZXJ2aWNlXG5hbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuc2VydmljZSgnZGF0YU11dGF0b3InLCBmdW5jdGlvbigkaHR0cCwgJHEpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdldERhdGE6IGdldERhdGEsXG4gICAgICAgICAgICBnZXREYWlseVN0YXRzOiBnZXREYWlseVN0YXRzLFxuICAgICAgICAgICAgZ2V0V2Vla2x5U3RhdHM6IGdldFdlZWtseVN0YXRzXG4gICAgICAgIH07XG5cblxuICAgICAgICBmdW5jdGlvbiBnZXREYXRhKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnYXBpL3R3ZWV0cy9mcmVxdWVuY3lfc3RhdHMnKVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0RGFpbHlTdGF0cygpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICBnZXREYXRhKCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICAgIHZhciBkYXlzID0gW11cbiAgICAgICAgICAgICAgICB2YXIgY291bnRzID0gW11cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gocmVzLmRhdGEsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF5c1trZXldID0gbW9tZW50KHZhbHVlLmRhdGUpLmZvcm1hdChcIkQgTU1NLCBkZGRkXCIpXG4gICAgICAgICAgICAgICAgICAgIGNvdW50c1trZXldID0gdmFsdWUuY291bnQ7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRheXM6IGRheXMsXG4gICAgICAgICAgICAgICAgICAgIGNvdW50czogY291bnRzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2UpXG5cbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KFwiVGhlcmUgd2FzIHNvbWUgcHJvYmxlbVwiLCBlcnIpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRXZWVrbHlTdGF0cygpIHtcblxuICAgICAgICB9XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuZGlyZWN0aXZlKCdkYWlseVN0YXRzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBzdGF0czogJz1pdGVtJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL2RhaWx5U3RhdHMuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnZGFpbHlTdGF0c0N0cmwnXG4gICAgICAgIH07XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuZGlyZWN0aXZlKCdsb2FkZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL2xvYWRlci5odG1sJ1xuICAgICAgICB9O1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmRpcmVjdGl2ZSgnbG9jYXRpb25TdGF0cycsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgc3RhdHM6ICc9aXRlbScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9sb2NhdGlvblN0YXRzLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ2xvY2F0aW9uU3RhdHNDdHJsJ1xuICAgICAgICB9O1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmRpcmVjdGl2ZSgncGFnaW5hdG9yJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBtZXRhZGF0YTogJz1pdGVtJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL3BhZ2luYXRvci5odG1sJ1xuICAgICAgICB9O1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmRpcmVjdGl2ZSgnd2Vla2x5U3RhdHMnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIHN0YXRzOiAnPWl0ZW0nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvd2Vla2x5U3RhdHMuaHRtbCcsXG4gICAgICAgICAgICAvL2NvbnRyb2xsZXI6ICd3ZWVrbHlTdGF0c0N0cmwnXG4gICAgICAgIH07XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignZGFpbHlTdGF0c0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCBkYXRhTXV0YXRvcikge1xuICAgICAgICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICAgICAgICRzY29wZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZGF0YU11dGF0b3IuZ2V0RGFpbHlTdGF0cygpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnByZXBhcmVEYWlseUNoYXJ0KHJlcy5kYXlzLCByZXMuY291bnRzKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnIoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS5zZXR1cCgpO1xuICAgICAgICAvLyBDaGFydC5qcyBEYXRhXG5cbiAgICAgICAgJHNjb3BlLnByZXBhcmVEYWlseUNoYXJ0ID0gZnVuY3Rpb24oZGF5cywgY291bnRzKSB7XG5cbiAgICAgICAgICAgICRzY29wZS5kYXRhID0ge1xuICAgICAgICAgICAgICAgIGxhYmVsczogZGF5cyxcbiAgICAgICAgICAgICAgICBkYXRhc2V0czogW3tcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdNeSBGaXJzdCBkYXRhc2V0JyxcbiAgICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAncmdiYSgyMjAsMjIwLDIyMCwwLjIpJyxcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICdyZ2JhKDIyMCwyMjAsMjIwLDEpJyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRDb2xvcjogJ3JnYmEoMjIwLDIyMCwyMjAsMSknLFxuICAgICAgICAgICAgICAgICAgICBwb2ludFN0cm9rZUNvbG9yOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0RmlsbDogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodFN0cm9rZTogJ3JnYmEoMjIwLDIyMCwyMjAsMSknLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjb3VudHNcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gQ2hhcnQuanMgT3B0aW9uc1xuICAgICAgICAgICAgJHNjb3BlLm9wdGlvbnMgPSB7XG5cbiAgICAgICAgICAgICAgICAvLyBTZXRzIHRoZSBjaGFydCB0byBiZSByZXNwb25zaXZlXG4gICAgICAgICAgICAgICAgcmVzcG9uc2l2ZTogdHJ1ZSxcblxuICAgICAgICAgICAgICAgIC8vL0Jvb2xlYW4gLSBXaGV0aGVyIGdyaWQgbGluZXMgYXJlIHNob3duIGFjcm9zcyB0aGUgY2hhcnRcbiAgICAgICAgICAgICAgICBzY2FsZVNob3dHcmlkTGluZXM6IHRydWUsXG5cbiAgICAgICAgICAgICAgICAvL1N0cmluZyAtIENvbG91ciBvZiB0aGUgZ3JpZCBsaW5lc1xuICAgICAgICAgICAgICAgIHNjYWxlR3JpZExpbmVDb2xvcjogXCJyZ2JhKDAsMCwwLC4wNSlcIixcblxuICAgICAgICAgICAgICAgIC8vTnVtYmVyIC0gV2lkdGggb2YgdGhlIGdyaWQgbGluZXNcbiAgICAgICAgICAgICAgICBzY2FsZUdyaWRMaW5lV2lkdGg6IDEsXG5cbiAgICAgICAgICAgICAgICAvL0Jvb2xlYW4gLSBXaGV0aGVyIHRoZSBsaW5lIGlzIGN1cnZlZCBiZXR3ZWVuIHBvaW50c1xuICAgICAgICAgICAgICAgIGJlemllckN1cnZlOiB0cnVlLFxuXG4gICAgICAgICAgICAgICAgLy9OdW1iZXIgLSBUZW5zaW9uIG9mIHRoZSBiZXppZXIgY3VydmUgYmV0d2VlbiBwb2ludHNcbiAgICAgICAgICAgICAgICBiZXppZXJDdXJ2ZVRlbnNpb246IDAuNCxcblxuICAgICAgICAgICAgICAgIC8vQm9vbGVhbiAtIFdoZXRoZXIgdG8gc2hvdyBhIGRvdCBmb3IgZWFjaCBwb2ludFxuICAgICAgICAgICAgICAgIHBvaW50RG90OiB0cnVlLFxuXG4gICAgICAgICAgICAgICAgLy9OdW1iZXIgLSBSYWRpdXMgb2YgZWFjaCBwb2ludCBkb3QgaW4gcGl4ZWxzXG4gICAgICAgICAgICAgICAgcG9pbnREb3RSYWRpdXM6IDQsXG5cbiAgICAgICAgICAgICAgICAvL051bWJlciAtIFBpeGVsIHdpZHRoIG9mIHBvaW50IGRvdCBzdHJva2VcbiAgICAgICAgICAgICAgICBwb2ludERvdFN0cm9rZVdpZHRoOiAxLFxuXG4gICAgICAgICAgICAgICAgLy9OdW1iZXIgLSBhbW91bnQgZXh0cmEgdG8gYWRkIHRvIHRoZSByYWRpdXMgdG8gY2F0ZXIgZm9yIGhpdCBkZXRlY3Rpb24gb3V0c2lkZSB0aGUgZHJhd24gcG9pbnRcbiAgICAgICAgICAgICAgICBwb2ludEhpdERldGVjdGlvblJhZGl1czogMjAsXG5cbiAgICAgICAgICAgICAgICAvL0Jvb2xlYW4gLSBXaGV0aGVyIHRvIHNob3cgYSBzdHJva2UgZm9yIGRhdGFzZXRzXG4gICAgICAgICAgICAgICAgZGF0YXNldFN0cm9rZTogdHJ1ZSxcblxuICAgICAgICAgICAgICAgIC8vTnVtYmVyIC0gUGl4ZWwgd2lkdGggb2YgZGF0YXNldCBzdHJva2VcbiAgICAgICAgICAgICAgICBkYXRhc2V0U3Ryb2tlV2lkdGg6IDIsXG5cbiAgICAgICAgICAgICAgICAvL0Jvb2xlYW4gLSBXaGV0aGVyIHRvIGZpbGwgdGhlIGRhdGFzZXQgd2l0aCBhIGNvbG91clxuICAgICAgICAgICAgICAgIGRhdGFzZXRGaWxsOiB0cnVlLFxuXG4gICAgICAgICAgICAgICAgLy8gRnVuY3Rpb24gLSBvbiBhbmltYXRpb24gcHJvZ3Jlc3NcbiAgICAgICAgICAgICAgICBvbkFuaW1hdGlvblByb2dyZXNzOiBmdW5jdGlvbigpIHt9LFxuXG4gICAgICAgICAgICAgICAgLy8gRnVuY3Rpb24gLSBvbiBhbmltYXRpb24gY29tcGxldGVcbiAgICAgICAgICAgICAgICBvbkFuaW1hdGlvbkNvbXBsZXRlOiBmdW5jdGlvbigpIHt9LFxuXG5cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmNvbnRyb2xsZXIoJ2xvY2F0aW9uU3RhdHNDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCkge1xuICAgICAgICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICAgICAgICRzY29wZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGh0dHAuZ2V0KCdhcGkvdHdlZXRzL2xvY2F0aW9uX3N0YXRzJylcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEgPSBfLmZpbHRlcihyZXMuZGF0YSwgZnVuY3Rpb24odHdlZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0d2VldC5jb3VudHJ5ICE9PSBcIk4vQVwiO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24obikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFuKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBpdCBoYXMgcmVjZWl2ZWQgZGF0YSB0aGVuIHN0YXJ0IHdvcmtpbmcgb24gYW5hbHl6aW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyRzY29wZS5wcmVwYXJlTG9jYXRpb25DaGFydCgkc2NvcGUuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY2FsY3VsYXRlUGVyY2VudGFnZSgkc2NvcGUuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLnNldHVwKCk7XG5cbiAgICAgICAgJHNjb3BlLmNhbGN1bGF0ZVBlcmNlbnRhZ2UgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgdG90YWwgPSAwO1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICB0b3RhbCArPSB2YWx1ZS5jb3VudDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgICAgICAgIHZhbHVlLnBlcmNlbnRhZ2UgPSAoKHZhbHVlLmNvdW50IC8gdG90YWwpICogMTAwKS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICRzY29wZS5wcmVwYXJlTG9jYXRpb25DaGFydChkYXRhKTtcblxuICAgICAgICB9XG4gICAgICAgICRzY29wZS5wcmVwYXJlTG9jYXRpb25DaGFydCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICAgICAgdmFyIGxvY2F0aW9uRGF0YSA9IFtdO1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmFuZG9tQ29sb3IgPSAnIycgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNjc3NzIxNSkudG9TdHJpbmcoMTYpXG4gICAgICAgICAgICAgICAgICAgIHZhciBvYmogPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUuY291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogcmFuZG9tQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHJhbmRvbUNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHZhbHVlLmNvdW50cnlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxvY2F0aW9uRGF0YS5wdXNoKG9iaik7XG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAkc2NvcGUubG9jYXRpb25EYXRhID0gbG9jYXRpb25EYXRhO1xuXG4gICAgICAgICAgICAvLyBDaGFydC5qcyBPcHRpb25zXG4gICAgICAgICAgICAkc2NvcGUubG9jYXRpb25PcHRpb25zID0ge1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0cyB0aGUgY2hhcnQgdG8gYmUgcmVzcG9uc2l2ZVxuICAgICAgICAgICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXG5cbiAgICAgICAgICAgICAgICAvL0Jvb2xlYW4gLSBXaGV0aGVyIHdlIHNob3VsZCBzaG93IGEgc3Ryb2tlIG9uIGVhY2ggc2VnbWVudFxuICAgICAgICAgICAgICAgIHNlZ21lbnRTaG93U3Ryb2tlOiB0cnVlLFxuXG4gICAgICAgICAgICAgICAgLy9TdHJpbmcgLSBUaGUgY29sb3VyIG9mIGVhY2ggc2VnbWVudCBzdHJva2VcbiAgICAgICAgICAgICAgICBzZWdtZW50U3Ryb2tlQ29sb3I6ICcjZmZmJyxcblxuICAgICAgICAgICAgICAgIC8vTnVtYmVyIC0gVGhlIHdpZHRoIG9mIGVhY2ggc2VnbWVudCBzdHJva2VcbiAgICAgICAgICAgICAgICBzZWdtZW50U3Ryb2tlV2lkdGg6IDIsXG5cbiAgICAgICAgICAgICAgICAvL051bWJlciAtIFRoZSBwZXJjZW50YWdlIG9mIHRoZSBjaGFydCB0aGF0IHdlIGN1dCBvdXQgb2YgdGhlIG1pZGRsZVxuICAgICAgICAgICAgICAgIHBlcmNlbnRhZ2VJbm5lckN1dG91dDogMCwgLy8gVGhpcyBpcyAwIGZvciBQaWUgY2hhcnRzXG5cbiAgICAgICAgICAgICAgICAvL051bWJlciAtIEFtb3VudCBvZiBhbmltYXRpb24gc3RlcHNcbiAgICAgICAgICAgICAgICBhbmltYXRpb25TdGVwczogMTAwLFxuXG4gICAgICAgICAgICAgICAgLy9TdHJpbmcgLSBBbmltYXRpb24gZWFzaW5nIGVmZmVjdFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbkVhc2luZzogJ2Vhc2VPdXRCb3VuY2UnLFxuXG4gICAgICAgICAgICAgICAgLy9Cb29sZWFuIC0gV2hldGhlciB3ZSBhbmltYXRlIHRoZSByb3RhdGlvbiBvZiB0aGUgRG91Z2hudXRcbiAgICAgICAgICAgICAgICBhbmltYXRlUm90YXRlOiB0cnVlLFxuXG4gICAgICAgICAgICAgICAgLy9Cb29sZWFuIC0gV2hldGhlciB3ZSBhbmltYXRlIHNjYWxpbmcgdGhlIERvdWdobnV0IGZyb20gdGhlIGNlbnRyZVxuICAgICAgICAgICAgICAgIGFuaW1hdGVTY2FsZTogZmFsc2VcblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICB9KTtcbiJdfQ==

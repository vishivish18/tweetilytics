angular.module('app', [
    'ngRoute', 'ui.router', 'tc.chartjs'
]);

angular.module('app')
    .config(["$stateProvider", "$urlRouterProvider", "$locationProvider", "$httpProvider", function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

        $urlRouterProvider.otherwise('/');
        $httpProvider.interceptors.push('logTimeTaken');

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
    .factory('logTimeTaken', [function() {
        var logTimeTaken = {
            request: function(config) {
                config.requestTimestamp = new Date().getTime();
                return config;
            },
            response: function(response) {
                response.config.responseTimestamp = new Date().getTime();
                return response;
            }
        };
        return logTimeTaken;
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
                        value: value.percentage,
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInJvdXRlcy5qcyIsImNvbnRyb2xsZXJzL2NyYXdsZXJDdHJsLmpzIiwiY29udHJvbGxlcnMvaG9tZUN0cmwuanMiLCJjb250cm9sbGVycy9tYXN0ZXJDdHJsLmpzIiwiY29udHJvbGxlcnMvc2VhcmNoQ3RybC5qcyIsInNlcnZpY2VzL2RhdGFNdXRhdG9yLmpzIiwic2VydmljZXMvbG9nVGltZVRha2UuanMiLCJkaXJlY3RpdmVzL2RhaWx5U3RhdHMuanMiLCJkaXJlY3RpdmVzL2xvYWRlci5qcyIsImRpcmVjdGl2ZXMvbG9jYXRpb25TdGF0cy5qcyIsImRpcmVjdGl2ZXMvcGFnaW5hdG9yLmpzIiwiZGlyZWN0aXZlcy93ZWVrbHlTdGF0cy5qcyIsImNvbnRyb2xsZXJzL3BhcnRpYWxzL2RhaWx5U3RhdHNDdHJsLmpzIiwiY29udHJvbGxlcnMvcGFydGlhbHMvbG9jYXRpb25TdGF0c0N0cmwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsUUFBQSxPQUFBLE9BQUE7SUFDQSxXQUFBLGFBQUE7OztBQ0RBLFFBQUEsT0FBQTtLQUNBLHNGQUFBLFNBQUEsZ0JBQUEsb0JBQUEsbUJBQUEsZUFBQTs7UUFFQSxtQkFBQSxVQUFBO1FBQ0EsY0FBQSxhQUFBLEtBQUE7O1FBRUE7YUFDQSxNQUFBLE9BQUE7Z0JBQ0EsS0FBQTtnQkFDQSxPQUFBO29CQUNBLFVBQUE7d0JBQ0EsYUFBQTs7b0JBRUEsV0FBQTt3QkFDQSxhQUFBO3dCQUNBLFlBQUE7Ozs7O1NBS0EsTUFBQSxlQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsT0FBQTtvQkFDQSxZQUFBO3dCQUNBLGFBQUE7d0JBQ0EsWUFBQTs7Ozs7YUFLQSxNQUFBLGNBQUE7Z0JBQ0EsS0FBQTtnQkFDQSxPQUFBO29CQUNBLFlBQUE7d0JBQ0EsYUFBQTt3QkFDQSxZQUFBOzs7Ozs7UUFNQSxrQkFBQSxVQUFBOzs7O0FDekNBLFFBQUEsT0FBQTtLQUNBLFdBQUEsbUNBQUEsU0FBQSxRQUFBLE9BQUE7UUFDQSxRQUFBLElBQUE7UUFDQSxPQUFBLFFBQUEsV0FBQTtZQUNBLE1BQUEsSUFBQTtpQkFDQSxLQUFBLFNBQUEsS0FBQTtvQkFDQSxRQUFBLElBQUE7bUJBQ0EsU0FBQSxLQUFBO29CQUNBLFFBQUEsSUFBQTs7OztRQUlBLE9BQUE7OztBQ1pBLFFBQUEsT0FBQTtLQUNBLFdBQUEsK0NBQUEsU0FBQSxRQUFBLE9BQUEsYUFBQTtRQUNBLE9BQUEsUUFBQSxXQUFBOzs7Ozs7Ozs7OztRQVdBLE9BQUE7OztBQ2JBLFFBQUEsT0FBQTtLQUNBLFdBQUEsY0FBQSxXQUFBOztRQUVBLFFBQUEsS0FBQTs7O0FDSEEsUUFBQSxPQUFBO0tBQ0EsV0FBQSwrQ0FBQSxTQUFBLFFBQUEsT0FBQSxXQUFBOztRQUVBLE9BQUEsZ0JBQUEsU0FBQSxNQUFBO1lBQ0EsVUFBQSxPQUFBLFFBQUE7OztRQUdBLE9BQUEsT0FBQSxXQUFBO1lBQ0EsT0FBQSxVQUFBLFNBQUE7V0FDQSxTQUFBLFFBQUEsUUFBQTs7WUFFQSxJQUFBLFVBQUEsVUFBQSxJQUFBO2dCQUNBLE9BQUEsUUFBQTs7Ozs7UUFLQSxPQUFBLFVBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxVQUFBO1lBQ0EsT0FBQSxPQUFBOztZQUVBLE1BQUEsSUFBQSx1QkFBQSxLQUFBO29CQUNBLFNBQUE7d0JBQ0EsTUFBQTs7O2lCQUdBLEtBQUEsU0FBQSxLQUFBO29CQUNBLElBQUEsT0FBQSxJQUFBLE9BQUEsb0JBQUEsSUFBQSxPQUFBO29CQUNBLE9BQUEsU0FBQSxJQUFBLEtBQUE7b0JBQ0EsSUFBQSxLQUFBLE9BQUEsSUFBQSxTQUFBLE9BQUE7d0JBQ0EsUUFBQSxJQUFBLE9BQUEsTUFBQSxZQUFBLE9BQUE7O29CQUVBLE9BQUEsV0FBQSxJQUFBLEtBQUE7b0JBQ0EsT0FBQSxTQUFBLGFBQUEsQ0FBQSxPQUFBLFFBQUE7b0JBQ0EsT0FBQSxPQUFBLElBQUEsS0FBQSxTQUFBO29CQUNBLE9BQUEsVUFBQTttQkFDQSxTQUFBLEtBQUE7b0JBQ0EsUUFBQSxJQUFBOzs7O1FBSUEsT0FBQSxXQUFBLFdBQUE7WUFDQSxRQUFBLElBQUE7WUFDQSxPQUFBLFVBQUE7WUFDQSxNQUFBLElBQUEsdUJBQUEsT0FBQSxNQUFBO29CQUNBLFNBQUE7d0JBQ0EsTUFBQSxPQUFBLE9BQUE7OztpQkFHQSxLQUFBLFNBQUEsS0FBQTtvQkFDQSxRQUFBLElBQUE7b0JBQ0EsT0FBQSxTQUFBLEVBQUEsTUFBQSxPQUFBLFFBQUEsSUFBQSxLQUFBO29CQUNBLE9BQUEsV0FBQSxJQUFBLEtBQUE7b0JBQ0EsT0FBQSxPQUFBLElBQUEsS0FBQSxTQUFBO29CQUNBLE9BQUEsVUFBQTttQkFDQSxTQUFBLEtBQUE7b0JBQ0EsUUFBQSxJQUFBOzs7O1FBSUEsT0FBQSxXQUFBLFdBQUE7WUFDQSxRQUFBLElBQUE7WUFDQSxPQUFBLFVBQUE7WUFDQSxNQUFBLElBQUEsdUJBQUEsT0FBQSxNQUFBO29CQUNBLFNBQUE7d0JBQ0EsTUFBQSxPQUFBLE9BQUE7OztpQkFHQSxLQUFBLFNBQUEsS0FBQTtvQkFDQSxRQUFBLElBQUE7b0JBQ0EsSUFBQSxPQUFBLElBQUEsT0FBQSxvQkFBQSxJQUFBLE9BQUE7b0JBQ0EsT0FBQSxTQUFBLElBQUEsS0FBQTtvQkFDQSxPQUFBLFdBQUEsSUFBQSxLQUFBO29CQUNBLE9BQUEsU0FBQSxhQUFBLENBQUEsT0FBQSxRQUFBO29CQUNBLE9BQUEsT0FBQSxJQUFBLEtBQUEsU0FBQTtvQkFDQSxPQUFBLFVBQUE7bUJBQ0EsU0FBQSxLQUFBO29CQUNBLFFBQUEsSUFBQTs7O1FBR0EsT0FBQSxlQUFBLFdBQUE7WUFDQSxRQUFBLElBQUE7WUFDQSxPQUFBLFVBQUE7WUFDQSxNQUFBLElBQUEsdUJBQUEsT0FBQSxNQUFBO29CQUNBLFNBQUE7d0JBQ0EsTUFBQSxPQUFBLE9BQUE7OztpQkFHQSxLQUFBLFNBQUEsS0FBQTtvQkFDQSxRQUFBLElBQUE7b0JBQ0EsSUFBQSxPQUFBLElBQUEsT0FBQSxvQkFBQSxJQUFBLE9BQUE7b0JBQ0EsT0FBQSxTQUFBLElBQUEsS0FBQTtvQkFDQSxPQUFBLFdBQUEsSUFBQSxLQUFBO29CQUNBLE9BQUEsU0FBQSxhQUFBLENBQUEsT0FBQSxRQUFBO29CQUNBLE9BQUEsT0FBQSxJQUFBLEtBQUEsU0FBQTtvQkFDQSxPQUFBLFVBQUE7bUJBQ0EsU0FBQSxLQUFBO29CQUNBLFFBQUEsSUFBQTs7Ozs7S0FLQSxPQUFBLHNCQUFBLFNBQUEsTUFBQTtRQUNBLE9BQUEsU0FBQSxNQUFBLFFBQUE7WUFDQSxJQUFBLFFBQUEsT0FBQSxLQUFBLFFBQUEsSUFBQSxPQUFBLE1BQUEsU0FBQSxLQUFBO2dCQUNBOztZQUVBLE9BQUEsS0FBQSxZQUFBOzs7OztBQzFHQSxRQUFBLE9BQUE7S0FDQSxRQUFBLCtCQUFBLFNBQUEsT0FBQSxJQUFBO1FBQ0EsT0FBQTtZQUNBLFNBQUE7WUFDQSxlQUFBO1lBQ0EsZ0JBQUE7Ozs7UUFJQSxTQUFBLFVBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQTs7O1FBR0EsU0FBQSxnQkFBQTtZQUNBLElBQUEsV0FBQSxHQUFBO1lBQ0EsVUFBQSxLQUFBLFNBQUEsS0FBQTtnQkFDQSxRQUFBLElBQUE7Z0JBQ0EsSUFBQSxPQUFBO2dCQUNBLElBQUEsU0FBQTtnQkFDQSxRQUFBLFFBQUEsSUFBQSxNQUFBLFNBQUEsT0FBQSxLQUFBO29CQUNBLEtBQUEsT0FBQSxPQUFBLE1BQUEsTUFBQSxPQUFBO29CQUNBLE9BQUEsT0FBQSxNQUFBOztnQkFFQSxJQUFBLFdBQUE7b0JBQ0EsTUFBQTtvQkFDQSxRQUFBOztnQkFFQSxTQUFBLFFBQUE7O2VBRUEsU0FBQSxLQUFBO2dCQUNBLFFBQUEsSUFBQTtnQkFDQSxTQUFBLE9BQUEsMEJBQUE7O1lBRUEsT0FBQSxTQUFBOzs7UUFHQSxTQUFBLGlCQUFBOzs7OztBQ3JDQSxRQUFBLE9BQUE7S0FDQSxRQUFBLGdCQUFBLENBQUEsV0FBQTtRQUNBLElBQUEsZUFBQTtZQUNBLFNBQUEsU0FBQSxRQUFBO2dCQUNBLE9BQUEsbUJBQUEsSUFBQSxPQUFBO2dCQUNBLE9BQUE7O1lBRUEsVUFBQSxTQUFBLFVBQUE7Z0JBQ0EsU0FBQSxP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V0FBQSxVQUFBLFNBQUE7b0JBQ0EsSUFBQSxNQUFBO3dCQUNBLE9BQUEsTUFBQTt3QkFDQSxPQUFBO3dCQUNBLFdBQUE7d0JBQ0EsT0FBQSxNQUFBOztnQkFFQSxhQUFBLEtBQUE7OztZQUdBLE9BQUEsZUFBQTs7O1lBR0EsT0FBQSxrQkFBQTs7O2dCQUdBLFlBQUE7OztnQkFHQSxtQkFBQTs7O2dCQUdBLG9CQUFBOzs7Z0JBR0Esb0JBQUE7OztnQkFHQSx1QkFBQTs7O2dCQUdBLGdCQUFBOzs7Z0JBR0EsaUJBQUE7OztnQkFHQSxlQUFBOzs7Z0JBR0EsY0FBQTs7Ozs7QUFLQSIsImZpbGUiOiJhcHAuYnVpbHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnYXBwJywgW1xuICAgICduZ1JvdXRlJywgJ3VpLnJvdXRlcicsICd0Yy5jaGFydGpzJ1xuXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCAkaHR0cFByb3ZpZGVyKSB7XG5cbiAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCdsb2dUaW1lVGFrZW4nKTtcblxuICAgICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAgICAgLnN0YXRlKCdhcHAnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnLycsXG4gICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2hlYWRlcic6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL25hdi5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgJ2NvbnRlbnQnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9ob21lLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2hvbWVDdHJsJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAuc3RhdGUoJ2FwcC5jcmF3bGVyJywge1xuICAgICAgICAgICAgICAgIHVybDogJ2NyYXdsZXInLFxuICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICdjb250ZW50QCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2NyYXdsZXIuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnY3Jhd2xlckN0cmwnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3RhdGUoJ2FwcC5zZWFyY2gnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnc2VhcmNoJyxcbiAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAnY29udGVudEAnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9zZWFyY2guaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnc2VhcmNoQ3RybCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSlcblxuICAgICAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG5cbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdjcmF3bGVyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDcmF3bGVyIENvbnRyb2xsZXJcIilcbiAgICAgICAgJHNjb3BlLnNldHVwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkaHR0cC5nZXQoJ2NyYXdsL3R3ZWV0cycpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICB9O1xuICAgICAgICAkc2NvcGUuc2V0dXAoKTtcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdob21lQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsIGRhdGFNdXRhdG9yKSB7XG4gICAgICAgICRzY29wZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gZGF0YU11dGF0b3IuZ2V0RGF0YSgpXG4gICAgICAgICAgICAvLyAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAvLyAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIC8vICAgICB9KTtcblxuXG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS5zZXR1cCgpO1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmNvbnRyb2xsZXIoJ21hc3RlckN0cmwnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gbWFpbiBjb250cm9sbGVyIGJpbmRlZCB0byBib2R5IG9mIHRoZSBhcHAsIGFjdGlvbnMgcmVxdWlyZWQgYXQgZ2xvYmFsIGxldmVsIGNhbiBiZSBkb25lIGhlcmVcbiAgICAgICAgY29uc29sZS5pbmZvKFwiQXBwIExvYWRlZFwiKTtcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdzZWFyY2hDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uKSB7XG5cbiAgICAgICAgJHNjb3BlLnBlcmZvcm1TZWFyY2ggPSBmdW5jdGlvbih0ZXJtKSB7XG4gICAgICAgICAgICAkbG9jYXRpb24uc2VhcmNoKCd0ZXJtJywgdGVybSk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRsb2NhdGlvbi5zZWFyY2goKS50ZXJtO1xuICAgICAgICB9LCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuXG4gICAgICAgICAgICBpZiAobmV3VmFsICYmIG5ld1ZhbCAhPSAnJykge1xuICAgICAgICAgICAgICAgICRzY29wZS5nZXREYXRhKG5ld1ZhbClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuXG4gICAgICAgICRzY29wZS5nZXREYXRhID0gZnVuY3Rpb24odmFsKSB7XG4gICAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICAkc2NvcGUudGVybSA9IHZhbDtcblxuICAgICAgICAgICAgJGh0dHAuZ2V0KCdhcGkvdHdlZXRzL3NlYXJjaC8nICsgdmFsLCB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2U6IDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lID0gcmVzLmNvbmZpZy5yZXNwb25zZVRpbWVzdGFtcCAtIHJlcy5jb25maWcucmVxdWVzdFRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnR3ZWV0cyA9IHJlcy5kYXRhLnR3ZWV0cztcbiAgICAgICAgICAgICAgICAgICAgcmVzLmRhdGEudHdlZXRzLm1hcChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobW9tZW50KHZhbHVlLmNyZWF0ZWRfYXQpLmZvcm1hdChcIkQgTU1NLCBkZGRkXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1ldGFkYXRhID0gcmVzLmRhdGEubWV0YWRhdGE7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5tZXRhZGF0YS50aW1lX3Rha2VuID0gKHRpbWUgLyAxMDAwKSArICcgc2Vjb25kcy4nO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGFnZSA9IHJlcy5kYXRhLm1ldGFkYXRhLmN1cnJlbnRfcGFnZTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5sb2FkTW9yZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJsb2FkaW5nIG1vcmVcIik7XG4gICAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICAkaHR0cC5nZXQoJ2FwaS90d2VldHMvc2VhcmNoLycgKyAkc2NvcGUudGVybSwge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlOiAkc2NvcGUucGFnZSArIDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS50d2VldHMgPSBfLnVuaW9uKCRzY29wZS50d2VldHMsIHJlcy5kYXRhLnR3ZWV0cylcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1ldGFkYXRhID0gcmVzLmRhdGEubWV0YWRhdGE7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5wYWdlID0gcmVzLmRhdGEubWV0YWRhdGEuY3VycmVudF9wYWdlO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUubG9hZE5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibG9hZGluZyBuZXh0XCIpO1xuICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgJGh0dHAuZ2V0KCdhcGkvdHdlZXRzL3NlYXJjaC8nICsgJHNjb3BlLnRlcm0sIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZTogJHNjb3BlLnBhZ2UgKyAxXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZSA9IHJlcy5jb25maWcucmVzcG9uc2VUaW1lc3RhbXAgLSByZXMuY29uZmlnLnJlcXVlc3RUaW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS50d2VldHMgPSByZXMuZGF0YS50d2VldHM7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5tZXRhZGF0YSA9IHJlcy5kYXRhLm1ldGFkYXRhO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubWV0YWRhdGEudGltZV90YWtlbiA9ICh0aW1lIC8gMTAwMCkgKyAnIHNlY29uZHMuJztcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnBhZ2UgPSByZXMuZGF0YS5tZXRhZGF0YS5jdXJyZW50X3BhZ2U7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUubG9hZFByZXZpb3VzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImxvYWRpbmcgcHJldmlvdXNcIik7XG4gICAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICAkaHR0cC5nZXQoJ2FwaS90d2VldHMvc2VhcmNoLycgKyAkc2NvcGUudGVybSwge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlOiAkc2NvcGUucGFnZSAtIDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lID0gcmVzLmNvbmZpZy5yZXNwb25zZVRpbWVzdGFtcCAtIHJlcy5jb25maWcucmVxdWVzdFRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnR3ZWV0cyA9IHJlcy5kYXRhLnR3ZWV0cztcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1ldGFkYXRhID0gcmVzLmRhdGEubWV0YWRhdGE7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5tZXRhZGF0YS50aW1lX3Rha2VuID0gKHRpbWUgLyAxMDAwKSArICcgc2Vjb25kcy4nO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucGFnZSA9IHJlcy5kYXRhLm1ldGFkYXRhLmN1cnJlbnRfcGFnZTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICB9KVxuICAgIC5maWx0ZXIoJ2hpZ2hsaWdodCcsIGZ1bmN0aW9uKCRzY2UpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHRleHQsIHBocmFzZSkge1xuICAgICAgICAgICAgaWYgKHBocmFzZSkgdGV4dCA9IHRleHQucmVwbGFjZShuZXcgUmVnRXhwKCcoJyArIHBocmFzZSArICcpJywgJ2dpJyksXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaGlnaGxpZ2h0ZWRcIj4kMTwvc3Bhbj4nKVxuXG4gICAgICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbCh0ZXh0KVxuICAgICAgICB9XG4gICAgfSk7XG4iLCIvLyBkYXRhTXV0YXRvciBTZXJ2aWNlXG5hbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuc2VydmljZSgnZGF0YU11dGF0b3InLCBmdW5jdGlvbigkaHR0cCwgJHEpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdldERhdGE6IGdldERhdGEsXG4gICAgICAgICAgICBnZXREYWlseVN0YXRzOiBnZXREYWlseVN0YXRzLFxuICAgICAgICAgICAgZ2V0V2Vla2x5U3RhdHM6IGdldFdlZWtseVN0YXRzXG4gICAgICAgIH07XG5cblxuICAgICAgICBmdW5jdGlvbiBnZXREYXRhKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnYXBpL3R3ZWV0cy9mcmVxdWVuY3lfc3RhdHMnKVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0RGFpbHlTdGF0cygpIHtcbiAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICBnZXREYXRhKCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICAgIHZhciBkYXlzID0gW11cbiAgICAgICAgICAgICAgICB2YXIgY291bnRzID0gW11cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gocmVzLmRhdGEsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF5c1trZXldID0gbW9tZW50KHZhbHVlLmRhdGUpLmZvcm1hdChcIkQgTU1NLCBkZGRkXCIpXG4gICAgICAgICAgICAgICAgICAgIGNvdW50c1trZXldID0gdmFsdWUuY291bnQ7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgICAgICAgICAgICAgIGRheXM6IGRheXMsXG4gICAgICAgICAgICAgICAgICAgIGNvdW50czogY291bnRzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzcG9uc2UpXG5cbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KFwiVGhlcmUgd2FzIHNvbWUgcHJvYmxlbVwiLCBlcnIpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRXZWVrbHlTdGF0cygpIHtcblxuICAgICAgICB9XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuZmFjdG9yeSgnbG9nVGltZVRha2VuJywgW2Z1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbG9nVGltZVRha2VuID0ge1xuICAgICAgICAgICAgcmVxdWVzdDogZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLnJlcXVlc3RUaW1lc3RhbXAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3BvbnNlOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmNvbmZpZy5yZXNwb25zZVRpbWVzdGFtcCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGxvZ1RpbWVUYWtlbjtcbiAgICB9XSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuZGlyZWN0aXZlKCdkYWlseVN0YXRzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBzdGF0czogJz1pdGVtJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL2RhaWx5U3RhdHMuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnZGFpbHlTdGF0c0N0cmwnXG4gICAgICAgIH07XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuZGlyZWN0aXZlKCdsb2FkZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL2xvYWRlci5odG1sJ1xuICAgICAgICB9O1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmRpcmVjdGl2ZSgnbG9jYXRpb25TdGF0cycsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgc3RhdHM6ICc9aXRlbScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9sb2NhdGlvblN0YXRzLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ2xvY2F0aW9uU3RhdHNDdHJsJ1xuICAgICAgICB9O1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmRpcmVjdGl2ZSgncGFnaW5hdG9yJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBtZXRhZGF0YTogJz1pdGVtJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL3BhZ2luYXRvci5odG1sJ1xuICAgICAgICB9O1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmRpcmVjdGl2ZSgnd2Vla2x5U3RhdHMnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIHN0YXRzOiAnPWl0ZW0nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvd2Vla2x5U3RhdHMuaHRtbCcsXG4gICAgICAgICAgICAvL2NvbnRyb2xsZXI6ICd3ZWVrbHlTdGF0c0N0cmwnXG4gICAgICAgIH07XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignZGFpbHlTdGF0c0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCBkYXRhTXV0YXRvcikge1xuICAgICAgICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICAgICAgICRzY29wZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZGF0YU11dGF0b3IuZ2V0RGFpbHlTdGF0cygpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnByZXBhcmVEYWlseUNoYXJ0KHJlcy5kYXlzLCByZXMuY291bnRzKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnIoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS5zZXR1cCgpO1xuICAgICAgICAvLyBDaGFydC5qcyBEYXRhXG5cbiAgICAgICAgJHNjb3BlLnByZXBhcmVEYWlseUNoYXJ0ID0gZnVuY3Rpb24oZGF5cywgY291bnRzKSB7XG5cbiAgICAgICAgICAgICRzY29wZS5kYXRhID0ge1xuICAgICAgICAgICAgICAgIGxhYmVsczogZGF5cyxcbiAgICAgICAgICAgICAgICBkYXRhc2V0czogW3tcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdNeSBGaXJzdCBkYXRhc2V0JyxcbiAgICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAncmdiYSgyMjAsMjIwLDIyMCwwLjIpJyxcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICdyZ2JhKDIyMCwyMjAsMjIwLDEpJyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRDb2xvcjogJ3JnYmEoMjIwLDIyMCwyMjAsMSknLFxuICAgICAgICAgICAgICAgICAgICBwb2ludFN0cm9rZUNvbG9yOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0RmlsbDogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodFN0cm9rZTogJ3JnYmEoMjIwLDIyMCwyMjAsMSknLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjb3VudHNcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gQ2hhcnQuanMgT3B0aW9uc1xuICAgICAgICAgICAgJHNjb3BlLm9wdGlvbnMgPSB7XG5cbiAgICAgICAgICAgICAgICAvLyBTZXRzIHRoZSBjaGFydCB0byBiZSByZXNwb25zaXZlXG4gICAgICAgICAgICAgICAgcmVzcG9uc2l2ZTogdHJ1ZSxcblxuICAgICAgICAgICAgICAgIC8vL0Jvb2xlYW4gLSBXaGV0aGVyIGdyaWQgbGluZXMgYXJlIHNob3duIGFjcm9zcyB0aGUgY2hhcnRcbiAgICAgICAgICAgICAgICBzY2FsZVNob3dHcmlkTGluZXM6IHRydWUsXG5cbiAgICAgICAgICAgICAgICAvL1N0cmluZyAtIENvbG91ciBvZiB0aGUgZ3JpZCBsaW5lc1xuICAgICAgICAgICAgICAgIHNjYWxlR3JpZExpbmVDb2xvcjogXCJyZ2JhKDAsMCwwLC4wNSlcIixcblxuICAgICAgICAgICAgICAgIC8vTnVtYmVyIC0gV2lkdGggb2YgdGhlIGdyaWQgbGluZXNcbiAgICAgICAgICAgICAgICBzY2FsZUdyaWRMaW5lV2lkdGg6IDEsXG5cbiAgICAgICAgICAgICAgICAvL0Jvb2xlYW4gLSBXaGV0aGVyIHRoZSBsaW5lIGlzIGN1cnZlZCBiZXR3ZWVuIHBvaW50c1xuICAgICAgICAgICAgICAgIGJlemllckN1cnZlOiB0cnVlLFxuXG4gICAgICAgICAgICAgICAgLy9OdW1iZXIgLSBUZW5zaW9uIG9mIHRoZSBiZXppZXIgY3VydmUgYmV0d2VlbiBwb2ludHNcbiAgICAgICAgICAgICAgICBiZXppZXJDdXJ2ZVRlbnNpb246IDAuNCxcblxuICAgICAgICAgICAgICAgIC8vQm9vbGVhbiAtIFdoZXRoZXIgdG8gc2hvdyBhIGRvdCBmb3IgZWFjaCBwb2ludFxuICAgICAgICAgICAgICAgIHBvaW50RG90OiB0cnVlLFxuXG4gICAgICAgICAgICAgICAgLy9OdW1iZXIgLSBSYWRpdXMgb2YgZWFjaCBwb2ludCBkb3QgaW4gcGl4ZWxzXG4gICAgICAgICAgICAgICAgcG9pbnREb3RSYWRpdXM6IDQsXG5cbiAgICAgICAgICAgICAgICAvL051bWJlciAtIFBpeGVsIHdpZHRoIG9mIHBvaW50IGRvdCBzdHJva2VcbiAgICAgICAgICAgICAgICBwb2ludERvdFN0cm9rZVdpZHRoOiAxLFxuXG4gICAgICAgICAgICAgICAgLy9OdW1iZXIgLSBhbW91bnQgZXh0cmEgdG8gYWRkIHRvIHRoZSByYWRpdXMgdG8gY2F0ZXIgZm9yIGhpdCBkZXRlY3Rpb24gb3V0c2lkZSB0aGUgZHJhd24gcG9pbnRcbiAgICAgICAgICAgICAgICBwb2ludEhpdERldGVjdGlvblJhZGl1czogMjAsXG5cbiAgICAgICAgICAgICAgICAvL0Jvb2xlYW4gLSBXaGV0aGVyIHRvIHNob3cgYSBzdHJva2UgZm9yIGRhdGFzZXRzXG4gICAgICAgICAgICAgICAgZGF0YXNldFN0cm9rZTogdHJ1ZSxcblxuICAgICAgICAgICAgICAgIC8vTnVtYmVyIC0gUGl4ZWwgd2lkdGggb2YgZGF0YXNldCBzdHJva2VcbiAgICAgICAgICAgICAgICBkYXRhc2V0U3Ryb2tlV2lkdGg6IDIsXG5cbiAgICAgICAgICAgICAgICAvL0Jvb2xlYW4gLSBXaGV0aGVyIHRvIGZpbGwgdGhlIGRhdGFzZXQgd2l0aCBhIGNvbG91clxuICAgICAgICAgICAgICAgIGRhdGFzZXRGaWxsOiB0cnVlLFxuXG4gICAgICAgICAgICAgICAgLy8gRnVuY3Rpb24gLSBvbiBhbmltYXRpb24gcHJvZ3Jlc3NcbiAgICAgICAgICAgICAgICBvbkFuaW1hdGlvblByb2dyZXNzOiBmdW5jdGlvbigpIHt9LFxuXG4gICAgICAgICAgICAgICAgLy8gRnVuY3Rpb24gLSBvbiBhbmltYXRpb24gY29tcGxldGVcbiAgICAgICAgICAgICAgICBvbkFuaW1hdGlvbkNvbXBsZXRlOiBmdW5jdGlvbigpIHt9LFxuXG5cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmNvbnRyb2xsZXIoJ2xvY2F0aW9uU3RhdHNDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCkge1xuICAgICAgICAkc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICAgICAgICRzY29wZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGh0dHAuZ2V0KCdhcGkvdHdlZXRzL2xvY2F0aW9uX3N0YXRzJylcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEgPSBfLmZpbHRlcihyZXMuZGF0YSwgZnVuY3Rpb24odHdlZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0d2VldC5jb3VudHJ5ICE9PSBcIk4vQVwiO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24obikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFuKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBpdCBoYXMgcmVjZWl2ZWQgZGF0YSB0aGVuIHN0YXJ0IHdvcmtpbmcgb24gYW5hbHl6aW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyRzY29wZS5wcmVwYXJlTG9jYXRpb25DaGFydCgkc2NvcGUuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuY2FsY3VsYXRlUGVyY2VudGFnZSgkc2NvcGUuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLnNldHVwKCk7XG5cbiAgICAgICAgJHNjb3BlLmNhbGN1bGF0ZVBlcmNlbnRhZ2UgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgdG90YWwgPSAwO1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICB0b3RhbCArPSB2YWx1ZS5jb3VudDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgICAgICAgIHZhbHVlLnBlcmNlbnRhZ2UgPSAoKHZhbHVlLmNvdW50IC8gdG90YWwpICogMTAwKS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICRzY29wZS5wcmVwYXJlTG9jYXRpb25DaGFydChkYXRhKTtcblxuICAgICAgICB9XG4gICAgICAgICRzY29wZS5wcmVwYXJlTG9jYXRpb25DaGFydCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICAgICAgdmFyIGxvY2F0aW9uRGF0YSA9IFtdO1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmFuZG9tQ29sb3IgPSAnIycgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNjc3NzIxNSkudG9TdHJpbmcoMTYpXG4gICAgICAgICAgICAgICAgICAgIHZhciBvYmogPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUucGVyY2VudGFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiByYW5kb21Db2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodDogcmFuZG9tQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogdmFsdWUuY291bnRyeVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9jYXRpb25EYXRhLnB1c2gob2JqKTtcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICRzY29wZS5sb2NhdGlvbkRhdGEgPSBsb2NhdGlvbkRhdGE7XG5cbiAgICAgICAgICAgIC8vIENoYXJ0LmpzIE9wdGlvbnNcbiAgICAgICAgICAgICRzY29wZS5sb2NhdGlvbk9wdGlvbnMgPSB7XG5cbiAgICAgICAgICAgICAgICAvLyBTZXRzIHRoZSBjaGFydCB0byBiZSByZXNwb25zaXZlXG4gICAgICAgICAgICAgICAgcmVzcG9uc2l2ZTogdHJ1ZSxcblxuICAgICAgICAgICAgICAgIC8vQm9vbGVhbiAtIFdoZXRoZXIgd2Ugc2hvdWxkIHNob3cgYSBzdHJva2Ugb24gZWFjaCBzZWdtZW50XG4gICAgICAgICAgICAgICAgc2VnbWVudFNob3dTdHJva2U6IHRydWUsXG5cbiAgICAgICAgICAgICAgICAvL1N0cmluZyAtIFRoZSBjb2xvdXIgb2YgZWFjaCBzZWdtZW50IHN0cm9rZVxuICAgICAgICAgICAgICAgIHNlZ21lbnRTdHJva2VDb2xvcjogJyNmZmYnLFxuXG4gICAgICAgICAgICAgICAgLy9OdW1iZXIgLSBUaGUgd2lkdGggb2YgZWFjaCBzZWdtZW50IHN0cm9rZVxuICAgICAgICAgICAgICAgIHNlZ21lbnRTdHJva2VXaWR0aDogMixcblxuICAgICAgICAgICAgICAgIC8vTnVtYmVyIC0gVGhlIHBlcmNlbnRhZ2Ugb2YgdGhlIGNoYXJ0IHRoYXQgd2UgY3V0IG91dCBvZiB0aGUgbWlkZGxlXG4gICAgICAgICAgICAgICAgcGVyY2VudGFnZUlubmVyQ3V0b3V0OiAwLCAvLyBUaGlzIGlzIDAgZm9yIFBpZSBjaGFydHNcblxuICAgICAgICAgICAgICAgIC8vTnVtYmVyIC0gQW1vdW50IG9mIGFuaW1hdGlvbiBzdGVwc1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvblN0ZXBzOiAxMDAsXG5cbiAgICAgICAgICAgICAgICAvL1N0cmluZyAtIEFuaW1hdGlvbiBlYXNpbmcgZWZmZWN0XG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uRWFzaW5nOiAnZWFzZU91dEJvdW5jZScsXG5cbiAgICAgICAgICAgICAgICAvL0Jvb2xlYW4gLSBXaGV0aGVyIHdlIGFuaW1hdGUgdGhlIHJvdGF0aW9uIG9mIHRoZSBEb3VnaG51dFxuICAgICAgICAgICAgICAgIGFuaW1hdGVSb3RhdGU6IHRydWUsXG5cbiAgICAgICAgICAgICAgICAvL0Jvb2xlYW4gLSBXaGV0aGVyIHdlIGFuaW1hdGUgc2NhbGluZyB0aGUgRG91Z2hudXQgZnJvbSB0aGUgY2VudHJlXG4gICAgICAgICAgICAgICAgYW5pbWF0ZVNjYWxlOiBmYWxzZVxuXG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgIH0pO1xuIl19

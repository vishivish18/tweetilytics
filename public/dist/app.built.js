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
            $http.get('api/tweets/search/' + val)
                .then(function(res) {
                    console.log(res);
                    $scope.tweets = res.data;
                    $scope.loading = false;
                }, function(err) {
                    console.log(err);
                })
        };
    }])
    .filter('highlight', ["$sce", function($sce) {
        return function(text, phrase) {
            if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
                '<span class="highlighted">$1</span>')

            return $sce.trustAsHtml(text)
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInJvdXRlcy5qcyIsImNvbnRyb2xsZXJzL2NyYXdsZXJDdHJsLmpzIiwiY29udHJvbGxlcnMvaG9tZUN0cmwuanMiLCJjb250cm9sbGVycy9tYXN0ZXJDdHJsLmpzIiwiY29udHJvbGxlcnMvc2VhcmNoQ3RybC5qcyIsImRpcmVjdGl2ZXMvZGFpbHlTdGF0cy5qcyIsImRpcmVjdGl2ZXMvbG9hZGVyLmpzIiwiZGlyZWN0aXZlcy9sb2NhdGlvblN0YXRzLmpzIiwiZGlyZWN0aXZlcy93ZWVrbHlTdGF0cy5qcyIsInNlcnZpY2VzL2RhdGFNdXRhdG9yLmpzIiwiY29udHJvbGxlcnMvcGFydGlhbHMvZGFpbHlTdGF0c0N0cmwuanMiLCJjb250cm9sbGVycy9wYXJ0aWFscy9sb2NhdGlvblN0YXRzQ3RybC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxRQUFBLE9BQUEsT0FBQTtJQUNBLFdBQUEsYUFBQTs7O0FDREEsUUFBQSxPQUFBO0tBQ0EscUVBQUEsU0FBQSxnQkFBQSxvQkFBQSxtQkFBQTs7UUFFQSxtQkFBQSxVQUFBOztRQUVBO2FBQ0EsTUFBQSxPQUFBO2dCQUNBLEtBQUE7Z0JBQ0EsT0FBQTtvQkFDQSxVQUFBO3dCQUNBLGFBQUE7O29CQUVBLFdBQUE7d0JBQ0EsYUFBQTt3QkFDQSxZQUFBOzs7OztTQUtBLE1BQUEsZUFBQTtZQUNBLEtBQUE7WUFDQSxPQUFBO2dCQUNBLFlBQUE7b0JBQ0EsYUFBQTtvQkFDQSxZQUFBOzs7OztTQUtBLE1BQUEsY0FBQTtZQUNBLEtBQUE7WUFDQSxPQUFBO2dCQUNBLFlBQUE7b0JBQ0EsYUFBQTtvQkFDQSxZQUFBOzs7Ozs7UUFNQSxrQkFBQSxVQUFBOzs7O0FDeENBLFFBQUEsT0FBQTtLQUNBLFdBQUEsbUNBQUEsU0FBQSxRQUFBLE9BQUE7UUFDQSxRQUFBLElBQUE7UUFDQSxPQUFBLFFBQUEsV0FBQTtZQUNBLE1BQUEsSUFBQTtpQkFDQSxLQUFBLFNBQUEsS0FBQTtvQkFDQSxRQUFB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U0FBQSxLQUFBLFFBQUE7O1lBRUEsT0FBQSxxQkFBQTs7O1FBR0EsT0FBQSx1QkFBQSxTQUFBLE1BQUE7WUFDQSxRQUFBLElBQUE7WUFDQSxJQUFBLGVBQUE7WUFDQSxRQUFBLFFBQUEsTUFBQSxTQUFBLE9BQUEsS0FBQTtnQkFDQSxJQUFBLGNBQUEsTUFBQSxLQUFBLE1BQUEsS0FBQSxXQUFBLFVBQUEsU0FBQTtvQkFDQSxJQUFBLE1BQUE7d0JBQ0EsT0FBQSxNQUFBO3dCQUNBLE9BQUE7d0JBQ0EsV0FBQTt3QkFDQSxPQUFBLE1BQUE7O2dCQUVBLGFBQUEsS0FBQTs7O1lBR0EsT0FBQSxlQUFBOzs7WUFHQSxPQUFBLGtCQUFBOzs7Z0JBR0EsWUFBQTs7O2dCQUdBLG1CQUFBOzs7Z0JBR0Esb0JBQUE7OztnQkFHQSxvQkFBQTs7O2dCQUdBLHVCQUFBOzs7Z0JBR0EsZ0JBQUE7OztnQkFHQSxpQkFBQTs7O2dCQUdBLGVBQUE7OztnQkFHQSxjQUFBOzs7OztBQUtBIiwiZmlsZSI6ImFwcC5idWlsdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbXG4gICAgJ25nUm91dGUnLCAndWkucm91dGVyJywgJ3RjLmNoYXJ0anMnXG5dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcblxuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cbiAgICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgICAgIC5zdGF0ZSgnYXBwJywge1xuICAgICAgICAgICAgICAgIHVybDogJy8nLFxuICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICdoZWFkZXInOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9uYXYuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdjb250ZW50Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvaG9tZS5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdob21lQ3RybCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgLnN0YXRlKCdhcHAuY3Jhd2xlcicsIHtcbiAgICAgICAgICAgIHVybDogJ2NyYXdsZXInLFxuICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAnY29udGVudEAnOiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2NyYXdsZXIuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdjcmF3bGVyQ3RybCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhcHAuc2VhcmNoJywge1xuICAgICAgICAgICAgdXJsOiAnc2VhcmNoJyxcbiAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgJ2NvbnRlbnRAJzoge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9zZWFyY2guaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdzZWFyY2hDdHJsJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KVxuXG4gICAgICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcblxuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmNvbnRyb2xsZXIoJ2NyYXdsZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNyYXdsZXIgQ29udHJvbGxlclwiKVxuICAgICAgICAkc2NvcGUuc2V0dXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRodHRwLmdldCgnY3Jhd2wvdHdlZXRzJylcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS5zZXR1cCgpO1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmNvbnRyb2xsZXIoJ2hvbWVDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgZGF0YU11dGF0b3IpIHtcbiAgICAgICAgJHNjb3BlLnNldHVwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBkYXRhTXV0YXRvci5nZXREYXRhKClcbiAgICAgICAgICAgIC8vICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG5cbiAgICAgICAgICAgIC8vICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgLy8gICAgIH0pO1xuXG5cbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLnNldHVwKCk7XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignbWFzdGVyQ3RybCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBtYWluIGNvbnRyb2xsZXIgYmluZGVkIHRvIGJvZHkgb2YgdGhlIGFwcCwgYWN0aW9ucyByZXF1aXJlZCBhdCBnbG9iYWwgbGV2ZWwgY2FuIGJlIGRvbmUgaGVyZVxuICAgICAgICBjb25zb2xlLmluZm8oXCJBcHAgTG9hZGVkXCIpO1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmNvbnRyb2xsZXIoJ3NlYXJjaEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkbG9jYXRpb24pIHtcblxuICAgICAgICAkc2NvcGUucGVyZm9ybVNlYXJjaCA9IGZ1bmN0aW9uKHRlcm0pIHtcbiAgICAgICAgICAgICRsb2NhdGlvbi5zZWFyY2goJ3Rlcm0nLCB0ZXJtKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJGxvY2F0aW9uLnNlYXJjaCgpLnRlcm07XG4gICAgICAgIH0sIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cbiAgICAgICAgICAgIGlmIChuZXdWYWwgJiYgbmV3VmFsICE9ICcnKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmdldERhdGEobmV3VmFsKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG5cbiAgICAgICAgJHNjb3BlLmdldERhdGEgPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICRzY29wZS5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICRodHRwLmdldCgnYXBpL3R3ZWV0cy9zZWFyY2gvJyArIHZhbClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnR3ZWV0cyA9IHJlcy5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgfSlcbiAgICAuZmlsdGVyKCdoaWdobGlnaHQnLCBmdW5jdGlvbigkc2NlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih0ZXh0LCBwaHJhc2UpIHtcbiAgICAgICAgICAgIGlmIChwaHJhc2UpIHRleHQgPSB0ZXh0LnJlcGxhY2UobmV3IFJlZ0V4cCgnKCcgKyBwaHJhc2UgKyAnKScsICdnaScpLFxuICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImhpZ2hsaWdodGVkXCI+JDE8L3NwYW4+JylcblxuICAgICAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwodGV4dClcbiAgICAgICAgfVxuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmRpcmVjdGl2ZSgnZGFpbHlTdGF0cycsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgc3RhdHM6ICc9aXRlbScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9kYWlseVN0YXRzLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ2RhaWx5U3RhdHNDdHJsJ1xuICAgICAgICB9O1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmRpcmVjdGl2ZSgnbG9hZGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwYXJ0aWFscy9sb2FkZXIuaHRtbCdcbiAgICAgICAgfTtcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5kaXJlY3RpdmUoJ2xvY2F0aW9uU3RhdHMnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIHN0YXRzOiAnPWl0ZW0nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvbG9jYXRpb25TdGF0cy5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdsb2NhdGlvblN0YXRzQ3RybCdcbiAgICAgICAgfTtcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5kaXJlY3RpdmUoJ3dlZWtseVN0YXRzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBzdGF0czogJz1pdGVtJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL3dlZWtseVN0YXRzLmh0bWwnLFxuICAgICAgICAgICAgLy9jb250cm9sbGVyOiAnd2Vla2x5U3RhdHNDdHJsJ1xuICAgICAgICB9O1xuICAgIH0pO1xuIiwiLy8gZGF0YU11dGF0b3IgU2VydmljZVxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLnNlcnZpY2UoJ2RhdGFNdXRhdG9yJywgZnVuY3Rpb24oJGh0dHAsICRxKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBnZXREYXRhOiBnZXREYXRhLFxuICAgICAgICAgICAgZ2V0RGFpbHlTdGF0czogZ2V0RGFpbHlTdGF0cyxcbiAgICAgICAgICAgIGdldFdlZWtseVN0YXRzOiBnZXRXZWVrbHlTdGF0c1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0RGF0YSgpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJ2FwaS90d2VldHMvZnJlcXVlbmN5X3N0YXRzJylcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldERhaWx5U3RhdHMoKSB7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgZ2V0RGF0YSgpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICAgICAgICB2YXIgZGF5cyA9IFtdXG4gICAgICAgICAgICAgICAgdmFyIGNvdW50cyA9IFtdXG4gICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHJlcy5kYXRhLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGRheXNba2V5XSA9IG1vbWVudCh2YWx1ZS5kYXRlKS5mb3JtYXQoXCJEIE1NTSwgZGRkZFwiKVxuICAgICAgICAgICAgICAgICAgICBjb3VudHNba2V5XSA9IHZhbHVlLmNvdW50O1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXlzOiBkYXlzLFxuICAgICAgICAgICAgICAgICAgICBjb3VudHM6IGNvdW50c1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3BvbnNlKVxuXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChcIlRoZXJlIHdhcyBzb21lIHByb2JsZW1cIiwgZXJyKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0V2Vla2x5U3RhdHMoKSB7XG5cbiAgICAgICAgfVxuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmNvbnRyb2xsZXIoJ2RhaWx5U3RhdHNDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgZGF0YU11dGF0b3IpIHtcbiAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAkc2NvcGUuc2V0dXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRhdGFNdXRhdG9yLmdldERhaWx5U3RhdHMoKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICRzY29wZS5wcmVwYXJlRGFpbHlDaGFydChyZXMuZGF5cywgcmVzLmNvdW50cyk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyKGVycik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9O1xuICAgICAgICAkc2NvcGUuc2V0dXAoKTtcbiAgICAgICAgLy8gQ2hhcnQuanMgRGF0YVxuXG4gICAgICAgICRzY29wZS5wcmVwYXJlRGFpbHlDaGFydCA9IGZ1bmN0aW9uKGRheXMsIGNvdW50cykge1xuXG4gICAgICAgICAgICAkc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBsYWJlbHM6IGRheXMsXG4gICAgICAgICAgICAgICAgZGF0YXNldHM6IFt7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnTXkgRmlyc3QgZGF0YXNldCcsXG4gICAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJ3JnYmEoMjIwLDIyMCwyMjAsMC4yKScsXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgyMjAsMjIwLDIyMCwxKScsXG4gICAgICAgICAgICAgICAgICAgIHBvaW50Q29sb3I6ICdyZ2JhKDIyMCwyMjAsMjIwLDEpJyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRTdHJva2VDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodEZpbGw6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRTdHJva2U6ICdyZ2JhKDIyMCwyMjAsMjIwLDEpJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY291bnRzXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIENoYXJ0LmpzIE9wdGlvbnNcbiAgICAgICAgICAgICRzY29wZS5vcHRpb25zID0ge1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0cyB0aGUgY2hhcnQgdG8gYmUgcmVzcG9uc2l2ZVxuICAgICAgICAgICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXG5cbiAgICAgICAgICAgICAgICAvLy9Cb29sZWFuIC0gV2hldGhlciBncmlkIGxpbmVzIGFyZSBzaG93biBhY3Jvc3MgdGhlIGNoYXJ0XG4gICAgICAgICAgICAgICAgc2NhbGVTaG93R3JpZExpbmVzOiB0cnVlLFxuXG4gICAgICAgICAgICAgICAgLy9TdHJpbmcgLSBDb2xvdXIgb2YgdGhlIGdyaWQgbGluZXNcbiAgICAgICAgICAgICAgICBzY2FsZUdyaWRMaW5lQ29sb3I6IFwicmdiYSgwLDAsMCwuMDUpXCIsXG5cbiAgICAgICAgICAgICAgICAvL051bWJlciAtIFdpZHRoIG9mIHRoZSBncmlkIGxpbmVzXG4gICAgICAgICAgICAgICAgc2NhbGVHcmlkTGluZVdpZHRoOiAxLFxuXG4gICAgICAgICAgICAgICAgLy9Cb29sZWFuIC0gV2hldGhlciB0aGUgbGluZSBpcyBjdXJ2ZWQgYmV0d2VlbiBwb2ludHNcbiAgICAgICAgICAgICAgICBiZXppZXJDdXJ2ZTogdHJ1ZSxcblxuICAgICAgICAgICAgICAgIC8vTnVtYmVyIC0gVGVuc2lvbiBvZiB0aGUgYmV6aWVyIGN1cnZlIGJldHdlZW4gcG9pbnRzXG4gICAgICAgICAgICAgICAgYmV6aWVyQ3VydmVUZW5zaW9uOiAwLjQsXG5cbiAgICAgICAgICAgICAgICAvL0Jvb2xlYW4gLSBXaGV0aGVyIHRvIHNob3cgYSBkb3QgZm9yIGVhY2ggcG9pbnRcbiAgICAgICAgICAgICAgICBwb2ludERvdDogdHJ1ZSxcblxuICAgICAgICAgICAgICAgIC8vTnVtYmVyIC0gUmFkaXVzIG9mIGVhY2ggcG9pbnQgZG90IGluIHBpeGVsc1xuICAgICAgICAgICAgICAgIHBvaW50RG90UmFkaXVzOiA0LFxuXG4gICAgICAgICAgICAgICAgLy9OdW1iZXIgLSBQaXhlbCB3aWR0aCBvZiBwb2ludCBkb3Qgc3Ryb2tlXG4gICAgICAgICAgICAgICAgcG9pbnREb3RTdHJva2VXaWR0aDogMSxcblxuICAgICAgICAgICAgICAgIC8vTnVtYmVyIC0gYW1vdW50IGV4dHJhIHRvIGFkZCB0byB0aGUgcmFkaXVzIHRvIGNhdGVyIGZvciBoaXQgZGV0ZWN0aW9uIG91dHNpZGUgdGhlIGRyYXduIHBvaW50XG4gICAgICAgICAgICAgICAgcG9pbnRIaXREZXRlY3Rpb25SYWRpdXM6IDIwLFxuXG4gICAgICAgICAgICAgICAgLy9Cb29sZWFuIC0gV2hldGhlciB0byBzaG93IGEgc3Ryb2tlIGZvciBkYXRhc2V0c1xuICAgICAgICAgICAgICAgIGRhdGFzZXRTdHJva2U6IHRydWUsXG5cbiAgICAgICAgICAgICAgICAvL051bWJlciAtIFBpeGVsIHdpZHRoIG9mIGRhdGFzZXQgc3Ryb2tlXG4gICAgICAgICAgICAgICAgZGF0YXNldFN0cm9rZVdpZHRoOiAyLFxuXG4gICAgICAgICAgICAgICAgLy9Cb29sZWFuIC0gV2hldGhlciB0byBmaWxsIHRoZSBkYXRhc2V0IHdpdGggYSBjb2xvdXJcbiAgICAgICAgICAgICAgICBkYXRhc2V0RmlsbDogdHJ1ZSxcblxuICAgICAgICAgICAgICAgIC8vIEZ1bmN0aW9uIC0gb24gYW5pbWF0aW9uIHByb2dyZXNzXG4gICAgICAgICAgICAgICAgb25BbmltYXRpb25Qcm9ncmVzczogZnVuY3Rpb24oKSB7fSxcblxuICAgICAgICAgICAgICAgIC8vIEZ1bmN0aW9uIC0gb24gYW5pbWF0aW9uIGNvbXBsZXRlXG4gICAgICAgICAgICAgICAgb25BbmltYXRpb25Db21wbGV0ZTogZnVuY3Rpb24oKSB7fSxcblxuXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdsb2NhdGlvblN0YXRzQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHApIHtcbiAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAkc2NvcGUuc2V0dXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRodHRwLmdldCgnYXBpL3R3ZWV0cy9sb2NhdGlvbl9zdGF0cycpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhID0gXy5maWx0ZXIocmVzLmRhdGEsIGZ1bmN0aW9uKHR3ZWV0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHdlZXQuY291bnRyeSAhPT0gXCJOL0FcIjtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbikgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgaXQgaGFzIHJlY2VpdmVkIGRhdGEgdGhlbiBzdGFydCB3b3JraW5nIG9uIGFuYWx5emluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8kc2NvcGUucHJlcGFyZUxvY2F0aW9uQ2hhcnQoJHNjb3BlLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNhbGN1bGF0ZVBlcmNlbnRhZ2UoJHNjb3BlLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgIH07XG4gICAgICAgICRzY29wZS5zZXR1cCgpO1xuXG4gICAgICAgICRzY29wZS5jYWxjdWxhdGVQZXJjZW50YWdlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdmFyIHRvdGFsID0gMDtcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICAgICAgdG90YWwgKz0gdmFsdWUuY291bnQ7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZS5wZXJjZW50YWdlID0gKCh2YWx1ZS5jb3VudCAvIHRvdGFsKSAqIDEwMCkudG9GaXhlZCgyKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAkc2NvcGUucHJlcGFyZUxvY2F0aW9uQ2hhcnQoZGF0YSk7XG5cbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUucHJlcGFyZUxvY2F0aW9uQ2hhcnQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgICAgIHZhciBsb2NhdGlvbkRhdGEgPSBbXTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIHJhbmRvbUNvbG9yID0gJyMnICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTY3NzcyMTUpLnRvU3RyaW5nKDE2KVxuICAgICAgICAgICAgICAgICAgICB2YXIgb2JqID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLmNvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHJhbmRvbUNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0OiByYW5kb21Db2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiB2YWx1ZS5jb3VudHJ5XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsb2NhdGlvbkRhdGEucHVzaChvYmopO1xuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uRGF0YSA9IGxvY2F0aW9uRGF0YTtcblxuICAgICAgICAgICAgLy8gQ2hhcnQuanMgT3B0aW9uc1xuICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uT3B0aW9ucyA9IHtcblxuICAgICAgICAgICAgICAgIC8vIFNldHMgdGhlIGNoYXJ0IHRvIGJlIHJlc3BvbnNpdmVcbiAgICAgICAgICAgICAgICByZXNwb25zaXZlOiB0cnVlLFxuXG4gICAgICAgICAgICAgICAgLy9Cb29sZWFuIC0gV2hldGhlciB3ZSBzaG91bGQgc2hvdyBhIHN0cm9rZSBvbiBlYWNoIHNlZ21lbnRcbiAgICAgICAgICAgICAgICBzZWdtZW50U2hvd1N0cm9rZTogdHJ1ZSxcblxuICAgICAgICAgICAgICAgIC8vU3RyaW5nIC0gVGhlIGNvbG91ciBvZiBlYWNoIHNlZ21lbnQgc3Ryb2tlXG4gICAgICAgICAgICAgICAgc2VnbWVudFN0cm9rZUNvbG9yOiAnI2ZmZicsXG5cbiAgICAgICAgICAgICAgICAvL051bWJlciAtIFRoZSB3aWR0aCBvZiBlYWNoIHNlZ21lbnQgc3Ryb2tlXG4gICAgICAgICAgICAgICAgc2VnbWVudFN0cm9rZVdpZHRoOiAyLFxuXG4gICAgICAgICAgICAgICAgLy9OdW1iZXIgLSBUaGUgcGVyY2VudGFnZSBvZiB0aGUgY2hhcnQgdGhhdCB3ZSBjdXQgb3V0IG9mIHRoZSBtaWRkbGVcbiAgICAgICAgICAgICAgICBwZXJjZW50YWdlSW5uZXJDdXRvdXQ6IDAsIC8vIFRoaXMgaXMgMCBmb3IgUGllIGNoYXJ0c1xuXG4gICAgICAgICAgICAgICAgLy9OdW1iZXIgLSBBbW91bnQgb2YgYW5pbWF0aW9uIHN0ZXBzXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uU3RlcHM6IDEwMCxcblxuICAgICAgICAgICAgICAgIC8vU3RyaW5nIC0gQW5pbWF0aW9uIGVhc2luZyBlZmZlY3RcbiAgICAgICAgICAgICAgICBhbmltYXRpb25FYXNpbmc6ICdlYXNlT3V0Qm91bmNlJyxcblxuICAgICAgICAgICAgICAgIC8vQm9vbGVhbiAtIFdoZXRoZXIgd2UgYW5pbWF0ZSB0aGUgcm90YXRpb24gb2YgdGhlIERvdWdobnV0XG4gICAgICAgICAgICAgICAgYW5pbWF0ZVJvdGF0ZTogdHJ1ZSxcblxuICAgICAgICAgICAgICAgIC8vQm9vbGVhbiAtIFdoZXRoZXIgd2UgYW5pbWF0ZSBzY2FsaW5nIHRoZSBEb3VnaG51dCBmcm9tIHRoZSBjZW50cmVcbiAgICAgICAgICAgICAgICBhbmltYXRlU2NhbGU6IGZhbHNlXG5cbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgfSk7XG4iXX0=

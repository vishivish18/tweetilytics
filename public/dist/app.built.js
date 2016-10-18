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
    .directive('locationStats', function() {
        return {
            restrict: 'E',
            scope: {
                stats: '=item',
            },
            templateUrl: 'partials/locationStats.html'
            //controller: 'locationStatsCtrl'
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
    .service('dataMutator', ["$http", function($http) {
        return {
            getData: getData,
            getDailyStats: getDailyStats,
            getWeeklyStats: getWeeklyStats
        };


        function getData() {
            return $http.get('api/tweets/daily_stats')
        }

        function getDailyStats() {
            getData().then(function(res) {
                console.log(res.data);
            }, function(err) {
                console.log(err);
            })
        }

        function getWeeklyStats() {

        }
    }]);

angular.module('app')
    .controller('dailyStatsCtrl', ["$scope", "$http", "dataMutator", function($scope, $http, dataMutator) {
        $scope.setup = function() {
            dataMutator.getDailyStats();


        };
        $scope.setup();
        // Chart.js Data
        $scope.data = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
                label: 'My First dataset',
                fillColor: 'rgba(220,220,220,0.2)',
                strokeColor: 'rgba(220,220,220,1)',
                pointColor: 'rgba(220,220,220,1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(220,220,220,1)',
                data: [65, 59, 80, 81, 56, 55, 40]
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
    }]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInJvdXRlcy5qcyIsImNvbnRyb2xsZXJzL2NyYXdsZXJDdHJsLmpzIiwiY29udHJvbGxlcnMvaG9tZUN0cmwuanMiLCJjb250cm9sbGVycy9tYXN0ZXJDdHJsLmpzIiwiY29udHJvbGxlcnMvc2VhcmNoQ3RybC5qcyIsImRpcmVjdGl2ZXMvZGFpbHlTdGF0cy5qcyIsImRpcmVjdGl2ZXMvbG9jYXRpb25TdGF0cy5qcyIsImRpcmVjdGl2ZXMvd2Vla2x5U3RhdHMuanMiLCJzZXJ2aWNlcy9kYXRhTXV0YXRvci5qcyIsImNvbnRyb2xsZXJzL3BhcnRpYWxzL2RhaWx5U3RhdHNDdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFFBQUEsT0FBQSxPQUFBO0lBQ0EsV0FBQSxhQUFBOzs7QUNEQSxRQUFBLE9BQUE7S0FDQSxxRUFBQSxTQUFBLGdCQUFBLG9CQUFBLG1CQUFBOztRQUVBLG1CQUFBLFVBQUE7O1FBRUE7YUFDQSxNQUFBLE9BQUE7Z0JBQ0EsS0FBQTtnQkFDQSxPQUFBO29CQUNBLFVBQUE7d0JBQ0EsYUFBQTs7b0JBRUEsV0FBQTt3QkFDQSxhQUFBO3dCQUNBLFlBQUE7Ozs7O1NBS0EsTUFBQSxlQUFBO1lBQ0EsS0FBQTtZQUNBLE9BQUE7Z0JBQ0EsWUFBQTtvQkFDQSxhQUFBO29CQUNBLFlBQUE7Ozs7O1NBS0EsTUFBQSxjQUFBO1lBQ0EsS0FBQTtZQUNBLE9BQUE7Z0JBQ0EsWUFBQTtvQkFDQSxhQUFBO29CQUNBLFlBQUE7Ozs7OztRQU1BLGtCQUFBLFVBQUE7Ozs7QUN4Q0EsUUFBQSxPQUFBO0tBQ0EsV0FBQSxtQ0FBQSxTQUFBLFFBQUEsT0FBQTtRQUNBLFFBQUEsSUFBQTtRQUNBLE9BQUEsUUFBQSxXQUFBO1lBQ0EsTUFBQSxJQUFBO2lCQUNBLEtBQUEsU0FBQSxLQUFBO29CQUNBLFFBQUEsSUFBQTttQkFDQSxTQUFBLEtBQUE7b0JBQ0EsUUFBQSxJQUFBOzs7O1FBSUEsT0FBQTs7O0FDWkEsUUFBQSxPQUFBO0tBQ0EsV0FBQSwrQ0FBQSxTQUFBLFFBQUEsT0FBQSxhQUFBO1FBQ0EsT0FBQSxRQUFBLFdBQUE7Ozs7Ozs7Ozs7O1FBV0EsT0FBQTs7O0FDYkEsUUFBQSxPQUFBO0tBQ0EsV0FBQSxjQUFBLFdBQUE7O1FBRUEsUUFBQSxLQUFBOzs7QUNIQSxRQUFBLE9BQUE7S0FDQSxXQUFBLCtDQUFBLFNBQUEsUUFBQSxPQUFBLFdBQUE7O1FBRUEsT0FBQSxnQkFBQSxTQUFBLE1BQUE7WUFDQSxVQUFBLE9BQUEsUUFBQTs7O1FBR0EsT0FBQSxPQUFBLFdBQUE7WUFDQSxPQUFBLFVBQUEsU0FBQTtXQUNBLFNBQUEsUUFBQSxRQUFBOztZQUVBLElBQUEsVUFBQSxVQUFBLElBQUE7Z0JBQ0EsT0FBQSxRQUFBOzs7OztRQUtBLE9BQUEsVUFBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLFVBQUE7WUFDQSxNQUFBLElBQUEsdUJBQUE7aUJBQ0EsS0FBQSxTQUFBLEtBQUE7b0JBQ0EsUUFBQSxJQUFBO29CQUNBLE9BQUEsU0FBQSxJQUFBO29CQUNBLE9BQUEsVUFBQTttQkFDQSxTQUFBLEtBQUE7b0JBQ0EsUUFBQSxJQUFBOzs7O0tBSUEsT0FBQSxzQkFBQSxTQUFBLE1BQUE7UUFDQSxPQUFBLFNBQUEsTUFBQSxRQUFBO1lBQ0EsSUFBQSxRQUFBLE9BQUEsS0FBQSxRQUFBLElBQUEsT0FBQSxNQUFBLFNBQUEsS0FBQTtnQkFDQTs7WUFFQSxPQUFBLEtBQUEsWUFBQTs7OztBQ2xDQSxRQUFBLE9BQUE7S0FDQSxVQUFBLGNBQUEsV0FBQTtRQUNBLE9BQUE7WUFDQSxVQUFBO1lBQ0EsT0FBQTtnQkFDQSxPQUFBOztZQUVBLGFBQUE7WUFDQSxZQUFBOzs7O0FDUkEsUUFBQSxPQUFBO0tBQ0EsVUFBQSxpQkFBQSxXQUFBO1FBQ0EsT0FBQTtZQUNBLFVBQUE7WUFDQSxPQUFBO2dCQUNBLE9BQUE7O1lBRUEsYUFBQTs7Ozs7QUNQQSxRQUFBLE9BQUE7S0FDQSxVQUFBLGVBQUEsV0FBQTtRQUNBLE9BQUE7WUFDQSxVQUFBO1lBQ0EsT0FBQTtnQkFDQSxPQUFBOztZQUVBLGFBQUE7Ozs7OztBQ05BLFFBQUEsT0FBQTtLQUNBLFFBQUEseUJBQUEsU0FBQSxPQUFBO1FBQ0EsT0FBQTtZQUNBLFNBQUE7WUFDQSxlQUFBO1lBQ0EsZ0JBQUE7Ozs7UUFJQSxTQUFBLFVBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQTs7O1FBR0EsU0FBQSxnQkFBQTtZQUNBLFVBQUEsS0FBQSxTQUFBLEtBQUE7Z0JBQ0EsUUFBQSxJQUFBLElBQUE7ZUFDQSxTQUFBLEtBQUE7Z0JBQ0EsUUFBQSxJQUFBOzs7O1FBSUEsU0FBQSxpQkFBQTs7Ozs7QUN0QkEsUUFBQSxPQUFBO0tBQ0EsV0FBQSxxREFBQSxTQUFBLFFBQUEsT0FBQSxhQUFBO1FBQ0EsT0FBQSxRQUFBLFdBQUE7WUFDQSxZQUFBOzs7O1FBSUEsT0FBQTs7UUFFQSxPQUFBLE9BQUE7WUFDQSxRQUFBLENBQUEsV0FBQSxZQUFBLFNBQUEsU0FBQSxPQUFBLFFBQUE7WUFDQSxVQUFBLENBQUE7Z0JBQ0EsT0FBQTtnQkFDQSxXQUFBO2dCQUNBLGFBQUE7Z0JBQ0EsWUFBQTtnQkFDQSxrQkFBQTtnQkFDQSxvQkFBQTtnQkFDQSxzQkFBQTtnQkFDQSxNQUFBLENBQUEsSUFBQSxJQUFBLElBQUEsSUFBQSxJQUFBLElBQUE7Ozs7O1FBS0EsT0FBQSxVQUFBOzs7WUFHQSxZQUFBOzs7WUFHQSxvQkFBQTs7O1lBR0Esb0JBQUE7OztZQUdBLG9CQUFBOzs7WUFHQSxhQUFBOzs7WUFHQSxvQkFBQTs7O1lBR0EsVUFBQTs7O1lBR0EsZ0JBQUE7OztZQUdBLHFCQUFBOzs7WUFHQSx5QkFBQTs7O1lBR0EsZUFBQTs7O1lBR0Esb0JBQUE7OztZQUdBLGFBQUE7OztZQUdBLHFCQUFBLFdBQUE7OztZQUdBLHFCQUFBLFdBQUE7Ozs7O0FBS0EiLCJmaWxlIjoiYXBwLmJ1aWx0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFtcbiAgICAnbmdSb3V0ZScsICd1aS5yb3V0ZXInLCAndGMuY2hhcnRqcydcbl0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuXG4gICAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblxuICAgICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAgICAgLnN0YXRlKCdhcHAnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnLycsXG4gICAgICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2hlYWRlcic6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL25hdi5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgJ2NvbnRlbnQnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9ob21lLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2hvbWVDdHJsJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAuc3RhdGUoJ2FwcC5jcmF3bGVyJywge1xuICAgICAgICAgICAgdXJsOiAnY3Jhd2xlcicsXG4gICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICdjb250ZW50QCc6IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvY3Jhd2xlci5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2NyYXdsZXJDdHJsJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FwcC5zZWFyY2gnLCB7XG4gICAgICAgICAgICB1cmw6ICdzZWFyY2gnLFxuICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAnY29udGVudEAnOiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL3NlYXJjaC5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ3NlYXJjaEN0cmwnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pXG5cbiAgICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuXG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignY3Jhd2xlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ3Jhd2xlciBDb250cm9sbGVyXCIpXG4gICAgICAgICRzY29wZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGh0dHAuZ2V0KCdjcmF3bC90d2VldHMnKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLnNldHVwKCk7XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignaG9tZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCBkYXRhTXV0YXRvcikge1xuICAgICAgICAkc2NvcGUuc2V0dXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGRhdGFNdXRhdG9yLmdldERhdGEoKVxuICAgICAgICAgICAgLy8gICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblxuICAgICAgICAgICAgLy8gICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgLy8gICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAvLyAgICAgfSk7XG5cblxuICAgICAgICB9O1xuICAgICAgICAkc2NvcGUuc2V0dXAoKTtcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdtYXN0ZXJDdHJsJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIG1haW4gY29udHJvbGxlciBiaW5kZWQgdG8gYm9keSBvZiB0aGUgYXBwLCBhY3Rpb25zIHJlcXVpcmVkIGF0IGdsb2JhbCBsZXZlbCBjYW4gYmUgZG9uZSBoZXJlXG4gICAgICAgIGNvbnNvbGUuaW5mbyhcIkFwcCBMb2FkZWRcIik7XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignc2VhcmNoQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRsb2NhdGlvbikge1xuXG4gICAgICAgICRzY29wZS5wZXJmb3JtU2VhcmNoID0gZnVuY3Rpb24odGVybSkge1xuICAgICAgICAgICAgJGxvY2F0aW9uLnNlYXJjaCgndGVybScsIHRlcm0pO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAkbG9jYXRpb24uc2VhcmNoKCkudGVybTtcbiAgICAgICAgfSwgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcblxuICAgICAgICAgICAgaWYgKG5ld1ZhbCAmJiBuZXdWYWwgIT0gJycpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZ2V0RGF0YShuZXdWYWwpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cblxuICAgICAgICAkc2NvcGUuZ2V0RGF0YSA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgJGh0dHAuZ2V0KCdhcGkvdHdlZXRzL3NlYXJjaC8nICsgdmFsKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudHdlZXRzID0gcmVzLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICB9KVxuICAgIC5maWx0ZXIoJ2hpZ2hsaWdodCcsIGZ1bmN0aW9uKCRzY2UpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHRleHQsIHBocmFzZSkge1xuICAgICAgICAgICAgaWYgKHBocmFzZSkgdGV4dCA9IHRleHQucmVwbGFjZShuZXcgUmVnRXhwKCcoJyArIHBocmFzZSArICcpJywgJ2dpJyksXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiaGlnaGxpZ2h0ZWRcIj4kMTwvc3Bhbj4nKVxuXG4gICAgICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbCh0ZXh0KVxuICAgICAgICB9XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuZGlyZWN0aXZlKCdkYWlseVN0YXRzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBzdGF0czogJz1pdGVtJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL2RhaWx5U3RhdHMuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnZGFpbHlTdGF0c0N0cmwnXG4gICAgICAgIH07XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuZGlyZWN0aXZlKCdsb2NhdGlvblN0YXRzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBzdGF0czogJz1pdGVtJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3BhcnRpYWxzL2xvY2F0aW9uU3RhdHMuaHRtbCdcbiAgICAgICAgICAgIC8vY29udHJvbGxlcjogJ2xvY2F0aW9uU3RhdHNDdHJsJ1xuICAgICAgICB9O1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmRpcmVjdGl2ZSgnd2Vla2x5U3RhdHMnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIHN0YXRzOiAnPWl0ZW0nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncGFydGlhbHMvd2Vla2x5U3RhdHMuaHRtbCcsXG4gICAgICAgICAgICAvL2NvbnRyb2xsZXI6ICd3ZWVrbHlTdGF0c0N0cmwnXG4gICAgICAgIH07XG4gICAgfSk7XG4iLCIvLyBkYXRhTXV0YXRvciBTZXJ2aWNlXG5hbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuc2VydmljZSgnZGF0YU11dGF0b3InLCBmdW5jdGlvbigkaHR0cCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ2V0RGF0YTogZ2V0RGF0YSxcbiAgICAgICAgICAgIGdldERhaWx5U3RhdHM6IGdldERhaWx5U3RhdHMsXG4gICAgICAgICAgICBnZXRXZWVrbHlTdGF0czogZ2V0V2Vla2x5U3RhdHNcbiAgICAgICAgfTtcblxuXG4gICAgICAgIGZ1bmN0aW9uIGdldERhdGEoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCdhcGkvdHdlZXRzL2RhaWx5X3N0YXRzJylcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldERhaWx5U3RhdHMoKSB7XG4gICAgICAgICAgICBnZXREYXRhKCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldFdlZWtseVN0YXRzKCkge1xuXG4gICAgICAgIH1cbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdkYWlseVN0YXRzQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsIGRhdGFNdXRhdG9yKSB7XG4gICAgICAgICRzY29wZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZGF0YU11dGF0b3IuZ2V0RGFpbHlTdGF0cygpO1xuXG5cbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLnNldHVwKCk7XG4gICAgICAgIC8vIENoYXJ0LmpzIERhdGFcbiAgICAgICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgICAgICBsYWJlbHM6IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5J10sXG4gICAgICAgICAgICBkYXRhc2V0czogW3tcbiAgICAgICAgICAgICAgICBsYWJlbDogJ015IEZpcnN0IGRhdGFzZXQnLFxuICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJ3JnYmEoMjIwLDIyMCwyMjAsMC4yKScsXG4gICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICdyZ2JhKDIyMCwyMjAsMjIwLDEpJyxcbiAgICAgICAgICAgICAgICBwb2ludENvbG9yOiAncmdiYSgyMjAsMjIwLDIyMCwxKScsXG4gICAgICAgICAgICAgICAgcG9pbnRTdHJva2VDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0RmlsbDogJyNmZmYnLFxuICAgICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0U3Ryb2tlOiAncmdiYSgyMjAsMjIwLDIyMCwxKScsXG4gICAgICAgICAgICAgICAgZGF0YTogWzY1LCA1OSwgODAsIDgxLCA1NiwgNTUsIDQwXVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDaGFydC5qcyBPcHRpb25zXG4gICAgICAgICRzY29wZS5vcHRpb25zID0ge1xuXG4gICAgICAgICAgICAvLyBTZXRzIHRoZSBjaGFydCB0byBiZSByZXNwb25zaXZlXG4gICAgICAgICAgICByZXNwb25zaXZlOiB0cnVlLFxuXG4gICAgICAgICAgICAvLy9Cb29sZWFuIC0gV2hldGhlciBncmlkIGxpbmVzIGFyZSBzaG93biBhY3Jvc3MgdGhlIGNoYXJ0XG4gICAgICAgICAgICBzY2FsZVNob3dHcmlkTGluZXM6IHRydWUsXG5cbiAgICAgICAgICAgIC8vU3RyaW5nIC0gQ29sb3VyIG9mIHRoZSBncmlkIGxpbmVzXG4gICAgICAgICAgICBzY2FsZUdyaWRMaW5lQ29sb3I6IFwicmdiYSgwLDAsMCwuMDUpXCIsXG5cbiAgICAgICAgICAgIC8vTnVtYmVyIC0gV2lkdGggb2YgdGhlIGdyaWQgbGluZXNcbiAgICAgICAgICAgIHNjYWxlR3JpZExpbmVXaWR0aDogMSxcblxuICAgICAgICAgICAgLy9Cb29sZWFuIC0gV2hldGhlciB0aGUgbGluZSBpcyBjdXJ2ZWQgYmV0d2VlbiBwb2ludHNcbiAgICAgICAgICAgIGJlemllckN1cnZlOiB0cnVlLFxuXG4gICAgICAgICAgICAvL051bWJlciAtIFRlbnNpb24gb2YgdGhlIGJlemllciBjdXJ2ZSBiZXR3ZWVuIHBvaW50c1xuICAgICAgICAgICAgYmV6aWVyQ3VydmVUZW5zaW9uOiAwLjQsXG5cbiAgICAgICAgICAgIC8vQm9vbGVhbiAtIFdoZXRoZXIgdG8gc2hvdyBhIGRvdCBmb3IgZWFjaCBwb2ludFxuICAgICAgICAgICAgcG9pbnREb3Q6IHRydWUsXG5cbiAgICAgICAgICAgIC8vTnVtYmVyIC0gUmFkaXVzIG9mIGVhY2ggcG9pbnQgZG90IGluIHBpeGVsc1xuICAgICAgICAgICAgcG9pbnREb3RSYWRpdXM6IDQsXG5cbiAgICAgICAgICAgIC8vTnVtYmVyIC0gUGl4ZWwgd2lkdGggb2YgcG9pbnQgZG90IHN0cm9rZVxuICAgICAgICAgICAgcG9pbnREb3RTdHJva2VXaWR0aDogMSxcblxuICAgICAgICAgICAgLy9OdW1iZXIgLSBhbW91bnQgZXh0cmEgdG8gYWRkIHRvIHRoZSByYWRpdXMgdG8gY2F0ZXIgZm9yIGhpdCBkZXRlY3Rpb24gb3V0c2lkZSB0aGUgZHJhd24gcG9pbnRcbiAgICAgICAgICAgIHBvaW50SGl0RGV0ZWN0aW9uUmFkaXVzOiAyMCxcblxuICAgICAgICAgICAgLy9Cb29sZWFuIC0gV2hldGhlciB0byBzaG93IGEgc3Ryb2tlIGZvciBkYXRhc2V0c1xuICAgICAgICAgICAgZGF0YXNldFN0cm9rZTogdHJ1ZSxcblxuICAgICAgICAgICAgLy9OdW1iZXIgLSBQaXhlbCB3aWR0aCBvZiBkYXRhc2V0IHN0cm9rZVxuICAgICAgICAgICAgZGF0YXNldFN0cm9rZVdpZHRoOiAyLFxuXG4gICAgICAgICAgICAvL0Jvb2xlYW4gLSBXaGV0aGVyIHRvIGZpbGwgdGhlIGRhdGFzZXQgd2l0aCBhIGNvbG91clxuICAgICAgICAgICAgZGF0YXNldEZpbGw6IHRydWUsXG5cbiAgICAgICAgICAgIC8vIEZ1bmN0aW9uIC0gb24gYW5pbWF0aW9uIHByb2dyZXNzXG4gICAgICAgICAgICBvbkFuaW1hdGlvblByb2dyZXNzOiBmdW5jdGlvbigpIHt9LFxuXG4gICAgICAgICAgICAvLyBGdW5jdGlvbiAtIG9uIGFuaW1hdGlvbiBjb21wbGV0ZVxuICAgICAgICAgICAgb25BbmltYXRpb25Db21wbGV0ZTogZnVuY3Rpb24oKSB7fSxcblxuXG4gICAgICAgIH07XG4gICAgfSk7XG4iXX0=

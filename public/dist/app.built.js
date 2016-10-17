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

        });

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
    .controller('homeCtrl', ["$scope", "$http", function($scope, $http) {
        $scope.setup = function() {
            // use data mutator to act upon data
            $http.get('api/tweets/stats')
                .then(function(res) {
                    console.log(res);
                }, function(err) {
                    console.log(err);
                })

        };
        $scope.setup();
    }]);

angular.module('app')
    .controller('masterCtrl', function() {
        // main controller binded to body of the app, actions required at global level can be done here
        console.info("App Loaded");
    });

// dataMutator Service
angular.module('app')
    .service('dataMutator', ["$http", function($http) {
        
    }]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInJvdXRlcy5qcyIsImNvbnRyb2xsZXJzL2NyYXdsZXJDdHJsLmpzIiwiY29udHJvbGxlcnMvaG9tZUN0cmwuanMiLCJjb250cm9sbGVycy9tYXN0ZXJDdHJsLmpzIiwic2VydmljZXMvZGF0YU11dGF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsUUFBQSxPQUFBLE9BQUE7SUFDQSxXQUFBLGFBQUE7OztBQ0RBLFFBQUEsT0FBQTtLQUNBLHFFQUFBLFNBQUEsZ0JBQUEsb0JBQUEsbUJBQUE7O1FBRUEsbUJBQUEsVUFBQTs7UUFFQTthQUNBLE1BQUEsT0FBQTtnQkFDQSxLQUFBO2dCQUNBLE9BQUE7b0JBQ0EsVUFBQTt3QkFDQSxhQUFBOztvQkFFQSxXQUFBO3dCQUNBLGFBQUE7d0JBQ0EsWUFBQTs7Ozs7U0FLQSxNQUFBLGVBQUE7WUFDQSxLQUFBO1lBQ0EsT0FBQTtnQkFDQSxZQUFBO29CQUNBLGFBQUE7b0JBQ0EsWUFBQTs7Ozs7O1FBTUEsa0JBQUEsVUFBQTs7OztBQzlCQSxRQUFBLE9BQUE7S0FDQSxXQUFBLG1DQUFBLFNBQUEsUUFBQSxPQUFBO1FBQ0EsUUFBQSxJQUFBO1FBQ0EsT0FBQSxRQUFBLFdBQUE7WUFDQSxNQUFBLElBQUE7aUJBQ0EsS0FBQSxTQUFBLEtBQUE7b0JBQ0EsUUFBQSxJQUFBO21CQUNBLFNBQUEsS0FBQTtvQkFDQSxRQUFBLElBQUE7Ozs7UUFJQSxPQUFBOzs7QUNaQSxRQUFBLE9BQUE7S0FDQSxXQUFBLGdDQUFBLFNBQUEsUUFBQSxPQUFBO1FBQ0EsT0FBQSxRQUFBLFdBQUE7O1lBRUEsTUFBQSxJQUFBO2lCQUNBLEtBQUEsU0FBQSxLQUFBO29CQUNBLFFBQUEsSUFBQTttQkFDQSxTQUFBLEtBQUE7b0JBQ0EsUUFBQSxJQUFBOzs7O1FBSUEsT0FBQTs7O0FDWkEsUUFBQSxPQUFBO0tBQ0EsV0FBQSxjQUFBLFdBQUE7O1FBRUEsUUFBQSxLQUFBOzs7O0FDRkEsUUFBQSxPQUFBO0tBQ0EsUUFBQSx5QkFBQSxTQUFBLE9BQUE7OztBQUdBIiwiZmlsZSI6ImFwcC5idWlsdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbXG4gICAgJ25nUm91dGUnLCAndWkucm91dGVyJywgJ3RjLmNoYXJ0anMnXG5dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcblxuICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cbiAgICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgICAgIC5zdGF0ZSgnYXBwJywge1xuICAgICAgICAgICAgICAgIHVybDogJy8nLFxuICAgICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgICAgICdoZWFkZXInOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9uYXYuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdjb250ZW50Jzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvaG9tZS5odG1sJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdob21lQ3RybCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgLnN0YXRlKCdhcHAuY3Jhd2xlcicsIHtcbiAgICAgICAgICAgIHVybDogJ2NyYXdsZXInLFxuICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAnY29udGVudEAnOiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2NyYXdsZXIuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdjcmF3bGVyQ3RybCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuXG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignY3Jhd2xlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ3Jhd2xlciBDb250cm9sbGVyXCIpXG4gICAgICAgICRzY29wZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGh0dHAuZ2V0KCdjcmF3bC90d2VldHMnKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLnNldHVwKCk7XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignaG9tZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwKSB7XG4gICAgICAgICRzY29wZS5zZXR1cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gdXNlIGRhdGEgbXV0YXRvciB0byBhY3QgdXBvbiBkYXRhXG4gICAgICAgICAgICAkaHR0cC5nZXQoJ2FwaS90d2VldHMvc3RhdHMnKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLnNldHVwKCk7XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignbWFzdGVyQ3RybCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBtYWluIGNvbnRyb2xsZXIgYmluZGVkIHRvIGJvZHkgb2YgdGhlIGFwcCwgYWN0aW9ucyByZXF1aXJlZCBhdCBnbG9iYWwgbGV2ZWwgY2FuIGJlIGRvbmUgaGVyZVxuICAgICAgICBjb25zb2xlLmluZm8oXCJBcHAgTG9hZGVkXCIpO1xuICAgIH0pO1xuIiwiLy8gZGF0YU11dGF0b3IgU2VydmljZVxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLnNlcnZpY2UoJ2RhdGFNdXRhdG9yJywgZnVuY3Rpb24oJGh0dHApIHtcbiAgICAgICAgXG4gICAgfSk7XG4iXX0=

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
    .controller('homeCtrl', ["$scope", "$http", function($scope, $http) {
        $scope.setup = function() {
            // use data mutator to act upon data
            // $http.get('api/tweets/daily_stats')
            $http.get('api/tweets/location_stats')
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
            $http.get('api/tweets/search/'+val)
                .then(function(res) {
                    console.log(res);
                    $scope.tweets = res.data;
                }, function(err) {
                    console.log(err);
                })
        };
    }]);

// dataMutator Service
angular.module('app')
    .service('dataMutator', ["$http", function($http) {
        
    }]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInJvdXRlcy5qcyIsImNvbnRyb2xsZXJzL2NyYXdsZXJDdHJsLmpzIiwiY29udHJvbGxlcnMvaG9tZUN0cmwuanMiLCJjb250cm9sbGVycy9tYXN0ZXJDdHJsLmpzIiwiY29udHJvbGxlcnMvc2VhcmNoQ3RybC5qcyIsInNlcnZpY2VzL2RhdGFNdXRhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFFBQUEsT0FBQSxPQUFBO0lBQ0EsV0FBQSxhQUFBOzs7QUNEQSxRQUFBLE9BQUE7S0FDQSxxRUFBQSxTQUFBLGdCQUFBLG9CQUFBLG1CQUFBOztRQUVBLG1CQUFBLFVBQUE7O1FBRUE7YUFDQSxNQUFBLE9BQUE7Z0JBQ0EsS0FBQTtnQkFDQSxPQUFBO29CQUNBLFVBQUE7d0JBQ0EsYUFBQTs7b0JBRUEsV0FBQTt3QkFDQSxhQUFBO3dCQUNBLFlBQUE7Ozs7O1NBS0EsTUFBQSxlQUFBO1lBQ0EsS0FBQTtZQUNBLE9BQUE7Z0JBQ0EsWUFBQTtvQkFDQSxhQUFBO29CQUNBLFlBQUE7Ozs7O1NBS0EsTUFBQSxjQUFBO1lBQ0EsS0FBQTtZQUNBLE9BQUE7Z0JBQ0EsWUFBQTtvQkFDQSxhQUFBO29CQUNBLFlBQUE7Ozs7OztRQU1BLGtCQUFBLFVBQUE7Ozs7QUN4Q0EsUUFBQSxPQUFBO0tBQ0EsV0FBQSxtQ0FBQSxTQUFBLFFBQUEsT0FBQTtRQUNBLFFBQUEsSUFBQTtRQUNBLE9BQUEsUUFBQSxXQUFBO1lBQ0EsTUFBQSxJQUFBO2lCQUNBLEtBQUEsU0FBQSxLQUFBO29CQUNBLFFBQUEsSUFBQTttQkFDQSxTQUFBLEtBQUE7b0JBQ0EsUUFBQSxJQUFBOzs7O1FBSUEsT0FBQTs7O0FDWkEsUUFBQSxPQUFBO0tBQ0EsV0FBQSxnQ0FBQSxTQUFBLFFBQUEsT0FBQTtRQUNBLE9BQUEsUUFBQSxXQUFBOzs7WUFHQSxNQUFBLElBQUE7aUJBQ0EsS0FBQSxTQUFBLEtBQUE7b0JBQ0EsUUFBQSxJQUFBO21CQUNBLFNBQUEsS0FBQTtvQkFDQSxRQUFBLElBQUE7Ozs7UUFJQSxPQUFBOzs7QUNiQSxRQUFBLE9BQUE7S0FDQSxXQUFBLGNBQUEsV0FBQTs7UUFFQSxRQUFBLEtBQUE7OztBQ0hBLFFBQUEsT0FBQTtLQUNBLFdBQUEsK0NBQUEsU0FBQSxRQUFBLE9BQUEsV0FBQTs7UUFFQSxPQUFBLGdCQUFBLFNBQUEsTUFBQTtZQUNBLFVBQUEsT0FBQSxRQUFBOzs7UUFHQSxPQUFBLE9BQUEsV0FBQTtZQUNBLE9BQUEsVUFBQSxTQUFBO1dBQ0EsU0FBQSxRQUFBLFFBQUE7O1lBRUEsSUFBQSxVQUFBLFVBQUEsSUFBQTtnQkFDQSxPQUFBLFFBQUE7Ozs7O1FBS0EsT0FBQSxVQUFBLFNBQUEsS0FBQTtZQUNBLE1BQUEsSUFBQSxxQkFBQTtpQkFDQSxLQUFBLFNBQUEsS0FBQTtvQkFDQSxRQUFBLElBQUE7b0JBQ0EsT0FBQSxTQUFBLElBQUE7bUJBQ0EsU0FBQSxLQUFBO29CQUNBLFFBQUEsSUFBQTs7Ozs7O0FDdEJBLFFBQUEsT0FBQTtLQUNBLFFBQUEseUJBQUEsU0FBQSxPQUFBOzs7QUFHQSIsImZpbGUiOiJhcHAuYnVpbHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnYXBwJywgW1xuICAgICduZ1JvdXRlJywgJ3VpLnJvdXRlcicsICd0Yy5jaGFydGpzJ1xuXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG5cbiAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG4gICAgICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgICAgICAuc3RhdGUoJ2FwcCcsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICAgICAnaGVhZGVyJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbmF2Lmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAnY29udGVudCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2hvbWUuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnaG9tZUN0cmwnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuXG4gICAgICAgIC5zdGF0ZSgnYXBwLmNyYXdsZXInLCB7XG4gICAgICAgICAgICB1cmw6ICdjcmF3bGVyJyxcbiAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgJ2NvbnRlbnRAJzoge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9jcmF3bGVyLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnY3Jhd2xlckN0cmwnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYXBwLnNlYXJjaCcsIHtcbiAgICAgICAgICAgIHVybDogJ3NlYXJjaCcsXG4gICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICdjb250ZW50QCc6IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvc2VhcmNoLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnc2VhcmNoQ3RybCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSlcblxuICAgICAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG5cbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdjcmF3bGVyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDcmF3bGVyIENvbnRyb2xsZXJcIilcbiAgICAgICAgJHNjb3BlLnNldHVwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkaHR0cC5nZXQoJ2NyYXdsL3R3ZWV0cycpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICB9O1xuICAgICAgICAkc2NvcGUuc2V0dXAoKTtcbiAgICB9KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKVxuICAgIC5jb250cm9sbGVyKCdob21lQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHApIHtcbiAgICAgICAgJHNjb3BlLnNldHVwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyB1c2UgZGF0YSBtdXRhdG9yIHRvIGFjdCB1cG9uIGRhdGFcbiAgICAgICAgICAgIC8vICRodHRwLmdldCgnYXBpL3R3ZWV0cy9kYWlseV9zdGF0cycpXG4gICAgICAgICAgICAkaHR0cC5nZXQoJ2FwaS90d2VldHMvbG9jYXRpb25fc3RhdHMnKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLnNldHVwKCk7XG4gICAgfSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJylcbiAgICAuY29udHJvbGxlcignbWFzdGVyQ3RybCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBtYWluIGNvbnRyb2xsZXIgYmluZGVkIHRvIGJvZHkgb2YgdGhlIGFwcCwgYWN0aW9ucyByZXF1aXJlZCBhdCBnbG9iYWwgbGV2ZWwgY2FuIGJlIGRvbmUgaGVyZVxuICAgICAgICBjb25zb2xlLmluZm8oXCJBcHAgTG9hZGVkXCIpO1xuICAgIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLmNvbnRyb2xsZXIoJ3NlYXJjaEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkbG9jYXRpb24pIHtcblxuICAgICAgICAkc2NvcGUucGVyZm9ybVNlYXJjaCA9IGZ1bmN0aW9uKHRlcm0pIHtcbiAgICAgICAgICAgICRsb2NhdGlvbi5zZWFyY2goJ3Rlcm0nLCB0ZXJtKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJGxvY2F0aW9uLnNlYXJjaCgpLnRlcm07XG4gICAgICAgIH0sIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG5cbiAgICAgICAgICAgIGlmIChuZXdWYWwgJiYgbmV3VmFsICE9ICcnKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmdldERhdGEobmV3VmFsKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG5cbiAgICAgICAgJHNjb3BlLmdldERhdGEgPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICRodHRwLmdldCgnYXBpL3R3ZWV0cy9zZWFyY2gvJyt2YWwpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS50d2VldHMgPSByZXMuZGF0YTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICB9O1xuICAgIH0pO1xuIiwiLy8gZGF0YU11dGF0b3IgU2VydmljZVxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpXG4gICAgLnNlcnZpY2UoJ2RhdGFNdXRhdG9yJywgZnVuY3Rpb24oJGh0dHApIHtcbiAgICAgICAgXG4gICAgfSk7XG4iXX0=

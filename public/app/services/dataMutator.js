// dataMutator Service
angular.module('app')
    .service('dataMutator', function($http) {
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
    });

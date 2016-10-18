// dataMutator Service
angular.module('app')
    .service('dataMutator', function($http, $q) {
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
    });

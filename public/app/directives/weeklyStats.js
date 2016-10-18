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

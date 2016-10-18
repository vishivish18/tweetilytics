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

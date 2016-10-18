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

angular.module('app')
    .directive('loader', function() {
        return {
            restrict: 'E',
            templateUrl: 'partials/loader.html'
        };
    });

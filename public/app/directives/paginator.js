angular.module('app')
    .directive('paginator', function() {
        return {
            restrict: 'E',
            scope: {
                metadata: '=item',
            },
            templateUrl: 'partials/paginator.html'
        };
    });

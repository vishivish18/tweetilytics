angular.module('app')
    .controller('homeCtrl', function($scope, $http, dataMutator) {
        $scope.setup = function() {
            // dataMutator.getData()
            //     .then(function(response) {
            //         console.log(response);

            //     }, function(err) {
            //         console.error(err);
            //     });


        };
        $scope.setup();
    });

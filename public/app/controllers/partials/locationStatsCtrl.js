angular.module('app')
    .controller('locationStatsCtrl', function($scope, $http) {
        $scope.loading = true;
        $scope.setup = function() {
            $http.get('api/tweets/location_stats')
                .then(function(res) {
                    console.log(res);
                    $scope.loading = false;
                    $scope.data = _.filter(res.data, function(tweet) {
                        return tweet.country !== "N/A";
                    });
                    $scope.$watch(function() {
                        return $scope.data;
                    }, function(n) {
                        if (!n) return;
                        // If it has received data then start working on analyzing
                        //$scope.prepareLocationChart($scope.data);
                        $scope.calculatePercentage($scope.data);
                    });
                }, function(err) {
                    console.log(err);
                })

        };
        $scope.setup();

        $scope.calculatePercentage = function(data) {
            var total = 0;
            angular.forEach(data, function(value, key) {
                total += value.count;
            })
            angular.forEach(data, function(value, key) {
                value.percentage = ((value.count / total) * 100).toFixed(2);
            })
            $scope.prepareLocationChart(data);

        }
        $scope.prepareLocationChart = function(data) {
            console.log(data);
            var locationData = [];
            angular.forEach(data, function(value, key) {
                var randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16)
                    var obj = {
                        value: value.count,
                        color: randomColor,
                        highlight: randomColor,
                        label: value.country
                    }
                locationData.push(obj);
            })

            $scope.locationData = locationData;

            // Chart.js Options
            $scope.locationOptions = {

                // Sets the chart to be responsive
                responsive: true,

                //Boolean - Whether we should show a stroke on each segment
                segmentShowStroke: true,

                //String - The colour of each segment stroke
                segmentStrokeColor: '#fff',

                //Number - The width of each segment stroke
                segmentStrokeWidth: 2,

                //Number - The percentage of the chart that we cut out of the middle
                percentageInnerCutout: 0, // This is 0 for Pie charts

                //Number - Amount of animation steps
                animationSteps: 100,

                //String - Animation easing effect
                animationEasing: 'easeOutBounce',

                //Boolean - Whether we animate the rotation of the Doughnut
                animateRotate: true,

                //Boolean - Whether we animate scaling the Doughnut from the centre
                animateScale: false

            };
        };
    });

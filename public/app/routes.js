angular.module('app')
    .config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

        $urlRouterProvider.otherwise('/');
        $httpProvider.interceptors.push('logTimeTaken');

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

    });

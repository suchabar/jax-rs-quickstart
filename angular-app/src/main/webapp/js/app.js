var module = angular.module('mainApp', ['ngResource']);

var auth = {};
var logout = function(){
    console.log('*** LOGOUT');
    auth.loggedIn = false;
    auth.authz = null;
    window.location = auth.logoutUrl;
};


angular.element(document).ready(function ($http) {
    var keycloakAuth = new Keycloak('keycloak.json');
    auth.loggedIn = false;

    keycloakAuth.init({ onLoad: 'login-required' }).success(function () {
        auth.loggedIn = true;
        auth.authz = keycloakAuth;
        auth.logoutUrl = keycloakAuth.authServerUrl + "/realms/quickstart/tokens/logout?redirect_uri=/angular-app/index.html";
        module.factory('Auth', function() {
            return auth;
        });
        angular.bootstrap(document, ["mainApp"]);
    }).error(function () {
            window.location.reload();
        });

});

module.factory('Messages', function($resource)
{
    return $resource('service/messages/:id');
    // ^^ MEANS that for GET(all messages), it would call "http://localhost:8080/service/messages" ?
});


module.controller('GlobalCtrl', function($scope, Messages) {
    $scope.id = 2;
    $scope.value = Messages.get({ id: $scope.id }, function()
    {
        console.log("public GET" + $scope.id);
    });

    $scope.values = Messages.get(function()
    {
        console.log("public GET ALL");
    });

    //CREATE - POST
    $scope.newMsg = new Messages();
    $scope.newMsg.id = 4;
    $scope.newMsg.message = "new message";

    Messages.save($scope.newMsg, function()
    {
        console.log("newMsg saved");
    });



    $scope.logout = logout;
});


module.factory('authInterceptor', function($q, Auth) {
    return {
        request: function (config) {
            var deferred = $q.defer();
            if (Auth.authz.token) {
                Auth.authz.updateToken(5).success(function() {
                    config.headers = config.headers || {};
                    config.headers.Authorization = 'Bearer ' + Auth.authz.token;

                    deferred.resolve(config);
                }).error(function() {
                        deferred.reject('Failed to refresh token');
                    });
            }
            return deferred.promise;
        }
    };
});


module.config(function($httpProvider) {
    $httpProvider.responseInterceptors.push('errorInterceptor');
    $httpProvider.interceptors.push('authInterceptor');

});

module.factory('errorInterceptor', function($q) {
    return function(promise) {
        return promise.then(function(response) {
            return response;
        }, function(response) {
            if (response.status == 401) {
                console.log('session timeout?');
                logout();
            } else if (response.status == 403) {
                alert("Forbidden");
            } else if (response.status == 404) {
                alert("Not found");
            } else if (response.status) {
                if (response.data && response.data.errorMessage) {
                    alert(response.data.errorMessage);
                } else {
                    alert("An unexpected server error has occurred");
                }
            }
            return $q.reject(response);
        });
    };
});

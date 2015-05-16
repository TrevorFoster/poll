var app = angular.module("PollApp", ["ui.router", "ngMaterial", "ngResource"]);

var localIp = "ip",
    port = "64738",
    apiUrl = "http://" + localIp + ":" + port + "/api";

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state("create", {
        url: "/create",
        templateUrl: "views/create-view.html",
        controller: "CreateCtrl"
    }).state("pollVote", {
        url: "/:PollId",
        templateUrl: "views/pollvote-view.html",
        controller: "PollCtrl"
    }).state("pollResults", {
        url: "/:PollId/results",
        templateUrl: "views/pollresults-view.html",
        controller: "PollResultCtrl"
    });

    $urlRouterProvider.when("", "/create");


    // From ui router wiki
    $urlRouterProvider.rule(function($injector, $location) {
        var path = $location.url();

        // check to see if the path already has a slash where it should be
        if (path[path.length - 1] === '/' || path.indexOf('/?') > -1) {
            return;
        }

        if (path.indexOf('?') > -1) {
            return path.replace('?', '/?');
        }

        return path + '/';
    });
});

app.controller("CreateCtrl", ["$scope", "$http", "$timeout", "$resource", "$state", function($scope, $http, $timeout, $resource, $state) {
    $scope.pollOptions = [{
        description: "",
        votes: 0
    }, {
        description: "",
        votes: 0
    }];
    $scope.focusIndex = -1;

    $scope.focused = function(index) {
        $scope.focusIndex = index;
    }

    $scope.blurred = function($event) {
        if (!$event.relatedTarget || $event.relatedTarget && $event.relatedTarget.localName !== "button")
            $scope.focusIndex = -1;
    }

    $scope.addOption = function(index) {
        $scope.pollOptions.splice(index + 1, 0, {
            description: "",
            votes: 0
        });

        for (var i = index + 1; i < $scope.pollOptions.length - 1; i++) {
            var option = document.getElementById("option" + i);
            option.id = "option" + i;
        }

        $timeout(function() {
            document.getElementById("option" + (index + 1)).focus();
        }, 0);
    }

    $scope.removeOption = function(index) {
        console.log($scope.focusIndex);
        $scope.pollOptions.splice(index, 1);
        for (var i = index + 1; i < $scope.pollOptions.length - 1; i++) {
            var option = document.getElementById("option" + i);
            option.id = "option" + i;
        }

        var nextFocus = $scope.focusIndex;
        if (nextFocus == -1) return;

        if ($scope.focusIndex >= index) {
            nextFocus = $scope.focusIndex > 0 ? $scope.focusIndex - 1 : 0;
        }

        document.getElementById("option" + nextFocus).focus();
    }

    $scope.navigateOptions = function(event, index) {
        if (event.which == 38 && index - 1 >= 0) { // Up
            document.getElementById("option" + (index - 1)).focus();

        } else if (event.which == 40 && index + 1 < $scope.pollOptions.length) { // Down
            document.getElementById("option" + (index + 1)).focus();

        }
    }

    $scope.createPoll = function() {
        $http.post(apiUrl + "/polls", {
            question: $scope.poll.question,
            pollOptions: $scope.pollOptions,
            created: new Date()
        }).success(function(data) {
            $state.go("pollVote", {
                PollId: data._id
            });
        });
    }
}]);


app.controller("PollCtrl", ["$scope", "$http", "$timeout", "$resource", "$state", "$stateParams", function($scope, $http, $timeout, $resource, $state, $stateParams) {
    $scope.poll = null;

    $http.get(apiUrl + "/polls/" + $stateParams.PollId).success(function(data) {
        $scope.poll = data;
    });

    $scope.vote = function() {
        if (!$scope.poll.answer) return;

        $http.get(apiUrl + "/polls/" + $scope.poll._id + "/option/" + $scope.poll.pollOptions[$scope.poll.answer]._id).success(function(data) {
            $state.go("pollResults", {
                PollId: $scope.poll._id
            });
        });
    }

    $scope.viewResults = function() {
        $state.go("pollResults", {
            PollId: $scope.poll._id
        });
    }
}]);

app.controller("PollResultCtrl", ["$scope", "$http", "$timeout", "$resource", "$stateParams", function($scope, $http, $timeout, $resource, $stateParams) {
    $scope.poll = null;

    function loadVotes() {
        console.log("reloaded");
        $http.get(apiUrl + "/polls/" + $stateParams.PollId).success(function(data) {
            for (var i = 0; i < $scope.poll.pollOptions.length; i++) {
                $scope.poll.pollOptions[i].votes = data.pollOptions[i].votes;
            }
        });
        $timeout(loadVotes, 1000);
    }

    $http.get(apiUrl + "/polls/" + $stateParams.PollId).success(function(data) {
        $scope.poll = data;
        loadVotes();
    });

}]);

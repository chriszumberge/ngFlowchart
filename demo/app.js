angular.module('app', ['ngFlowchart', 'ngAnimate', 'ngAria', 'ngMaterial'
]).config(['ngFlowchartServiceProvider', function (ngFlowchartServiceProvider) {
    ngFlowchartServiceProvider
        .setMultipleLinksOnOutput(true)
        .setData(data)
        .setAllowPanZoom(false);
}]).controller('main', ['$scope', 'ngFlowchartService', 'ngFlowchartOperatorFactory', function ($scope, ngFlowchartService, ngFlowchartOperatorFactory) {
    $scope.deleteSelected = function () {
        ngFlowchartService.deleteSelected();
    };

    $scope.logSelectedId = function () {
        var id = ngFlowchartService.getSelectedOperatorId();
        console.log(id);
    };

    $scope.addOperator = function () {
        var operator = ngFlowchartOperatorFactory.getNew();

        operator.title = "New Operator";
        operator.addInput({ label: 'Input 1' });
        operator.addOutput({ label: 'Output 1' });

        ngFlowchartService.addOperator(operator);
    };

    $scope.operatorMoved = function (operatorId, position) {
        console.log('Operator moved. Operator ID: "' + operatorId + ', position: ' + JSON.stringify(position) + '.');
    };

    function propertiesReplacer(key, value) {
        // Filtering out properties
        if (key === "properties")
        {
            return {
                inputs: value.inputs,
                outputs: value.outputs,
                title: value.title
            }
        }
        return value;
    }

    $scope.logData = function () {
        var data = ngFlowchartService.getData();
        console.log(JSON.stringify(data, propertiesReplacer, 2));
    };
}]);
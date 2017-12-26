// Define the angular module
angular.module("ngFlowchart", [])
    // Define the ngFlowchartServiceProvider- the provider is used to define and configure the Flowchart canvas
    .provider("ngFlowchartService", [function () {
        // Set the default options that are passed to the flowchart initializer
        this.options = {
            //canUserEditLinks: true, // can the user add links by clickin gon connectors
            //canUserMoveOperators: true, // can the user move operators using drap and drop
            //data: {}, // todo, turn into factory or something?
            //distanceFromArrows: 3, // distance between the output connector and the link
            //defaultLinkColor: '#3366ff', // default color of links
            //defaultSelectedLinkColor: 'black', // default color of links when selected
            //defaultOperatorClass: 'flowchart-default-operator', // default class of the operator DOM element
            //linkWidth: 11, // width of the links
            //grid: 20, // snap grid size for the operators when moved, if set to 0 it's disabled
            //multipleLinksOnInput: false, // allows multiple links on the same input connector
            //multipleLinksOnOutput: false, // allows multiple links on the same output connector
            //linkVerticalDecal: 0, // allows to vertical decal the links (in case overridden CSS no longer aligns)
            defaultNewTop: 60,
            defaultNewLeft: 60,
        };

        // Create public provider configuration methods
        this.setOptions = function (options) {
            this.options = options; return this;
        };
        // returning 'this' will make it a fluent api
        this.setCanUserEditLinks = function (canEdit) {
            this.options.canUserEditLinks = canEdit; return this;
        };
        this.setCanUserMoveOperators = function (canMove) {
            this.options.canUserMoveOperators = canMove; return this;
        };
        this.setData = function (newData) {
            this.options.data = newData; return this;
        };
        this.setDistanceFromArrows = function (distance) {
            this.options.distanceFromArrows = distance; return this;
        };
        this.setDefaultLinkColor = function (color) {
            this.options.defaultLinkColor = color; return this;
        };
        this.setDefaultSelectedLinkColor = function (color) {
            this.options.defaultSelectedLinkColor = color; return this;
        };
        this.setDefaultOperatorClass = function (opClass) {
            this.options.defaultOperatorClass = opClass; return this;
        };
        this.setLinkWidth = function (width) {
            this.options.linkWidth = width; return this;
        };
        this.setGridSize = function (size) {
            this.options.grid = size; return this;
        };
        this.setMultipleLinksOnInput = function (canSet) {
            this.options.multipleLinksOnInput = canSet; return this;
        };
        this.setMultipleLinksOnOutput = function (canSet) {
            this.options.multipleLinksOnOutput = canSet; return this;
        };
        this.setLinkVerticalDecal = function (vertical) {
            this.options.linkVerticalDecal = vertical; return this;
        };
        this.setDefaultNewTop = function (top) {
            this.options.defaultNewTop = top; return this;
        };
        this.setDefaultNewLeft = function (left) {
            this.options.defaultNewLeft = left; return this;
        };

        // Additional configuration options
        var allowPanZoom = false;
        var zoomLevels = [0.5, .075, 1, 1.5, 2];
        var initialZoom = 2;

        this.setAllowPanZoom = function (allow) {
            allowPanZoom = allow; return this;
        };
        this.setZoomLevels = function (newZoomLevels) {
            zoomLevels = newZoomLevels; return this;
        };
        this.setInitialZoom = function (newInitialZoom) {
            initialZoom = newInitialZoom; return this;
        };

        // Define the configured service that gets injected
        // The service is used to actively interact with the Flowcharts, and handle/triggert some events
        this.$get = ['$rootScope', function ($rootScope) {
            var self = this;
            // private local reference to the options
            var localOptions = self.options;

            var $flowchart = undefined;
            var $container = undefined;

            // define the public methods and properties for the service (interface)
            var ngFlowchartService = {};
            ngFlowchartService.setFlowchartReference = function (reference) {
                $flowchart = reference;
                $container = $flowchart.parent();
            };
            ngFlowchartService.getFlowchartReference = function () {
                return $flowchart;
            };
            ngFlowchartService.getOptions = function () {
                return localOptions;
            };
            ngFlowchartService.getConfigurationOptions = function () {
                return {
                    allowPanZoom: allowPanZoom,
                    zoomLevels: zoomLevels,
                    initialZoom: initialZoom
                };
            };

            var currentZoomIndex = initialZoom;
            // CONFIGURATION FUNCTIONS
            ngFlowchartService.enablePanZoom = function () {
                if ($flowchart === undefined) return;
                if ($container === undefined) $container = $flowchart.parent();
                // Panzoom initializion
                $flowchart.panzoom();
                // Get flowchart center
                var cx = $flowchart.width() / 2;
                var cy = $flowchart.height() / 2;
                // Center the panzoom
                $flowchart.panzoom('pan', -cx + $container.width() / 2, -cy + $container.height() / 2);

                $container.on('mousewheel.focal', function (e) {
                    e.preventDefault();
                    var delta = (e.delta || e.originalEvent.wheelData) || e.originalEvent.detail;
                    var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
                    currentZoomIndex = Math.max(0, Math.min(zoomLevels.length - 1, (currentZoomIndex + (!zoomOut * 2 - 1))));
                    $flowchart.flowchart('setPositionRatio', zoomLevels[currentZoomIndex]);
                    $flowchart.panzoom('zoom', zoomLevels[currentZoomIndex], {
                        animate: false,
                        focal: e
                    });
                    $rootScope.$broadcast('zoomChanged', { currentZoom: zoomLevels[currentZoomIndex] })
                });
            };

            // OPERATOR FUNCTIONS
            // Adds the operator to the flowchart at the designed top/left values or default if not provided
            ngFlowchartService.addOperator = function (operator, top, left) {
                if (operator === undefined) return;
                if (top === undefined) top = localOptions.defaultNewTop;
                if (left === undefined) left = localOptions.defaultNewLeft;

                var operatorData = {
                    top: top,
                    left: left,
                    properties: operator
                };

                $flowchart.flowchart('createOperator', operator.id, operatorData);
            };
            // Deletes the operator with the given id
            ngFlowchartService.deleteOperator = function (operatorId) {
                $flowchart.flowchart('deleteOperator', operatorId);
            };
            // Selects the operator with the given id
            ngFlowchartService.selectOperator = function (operatorId) {
                $flowchart.flowchart('selectOperator', operatorId);
            };
            // Adds a class to an operator
            ngFlowchartService.addClassToOperator = function (operatorId, className) {
                $flowchart.flowchart('addClassOperator', operatorId, className);
            };
            // Removes a class from an operator
            ngFlowchartService.removeClassFromOperator = function (operatorId, className) {
                $flowchart.flowchart('removeClassOperator', operatorId, className);
            };
            // Removes a class form all operators
            ngFlowchartService.removeClassFromOperators = function (className) {
                $flowchart.flowchart('removeClassOperators', className);
            };
            // Gets the title of an operator
            ngFlowchartService.getOperatorTitle = function (operatorId) {
                return $flowchart.flowchart('getOperatorTitle', operatorId);
            };
            // Changes the title on an operator
            ngFlowchartService.setOperatorTitle = function (operatorId, title) {
                $flowchart.flowchart('setOperatorTitle', operatorId, title);
            };
            // Returns if an operator with the given id exists or not
            ngFlowchartService.doesOperatorExist = function (operatorId) {
                $flowchart.flowchart('doesOperatorExists', operatorId);
            };
            // getOperatorData
            // getConnectorPosition
            // getOperatorCompleteData

            // Gets the operator's DOM element.. does not add to container, can be used for preivews or drag & drop
            //ngFlowchartService.getOperatorElement = function ()

            // getOperatorFullProperties


            // SELECTED OPERATOR FUNCTIONS
            // Returns the id of the selected operator, else null
            ngFlowchartService.getSelectedOperatorId = function () {
                return $flowchart.flowchart('getSelectedOperatorId');
            };
            // Deletes the selected operator
            ngFlowchartService.deleteSelected = function () {
                $flowchart.flowchart('deleteSelected')
            };
            // Deselects an operator if selected
            ngFlowchartService.unselectOperator = function () {
                $flowchart.flowchart('unselectOperator');
            };


            // LINK FUNCTIONS

            // SELECTED LINK FUNCTIONS

            // MISC DATA FUNCTIONS

            ngFlowchartService.getData = function () {
                return $flowchart.flowchart('getData');
            };

            ngFlowchartService.setData = function (data) {
                $flowchart.flowchart('setData', data);
            };

            // Return the service to be injected
            return ngFlowchartService;
        }];
    }])
    // Optionally providing a factory for creating operators
    .factory('ngFlowchartOperatorFactory', [function () {
        var operatorFactory = {};

        var operatorTemplateFn = function () {
            var self = this;
            // public properties
            self.id = guid();
            self.title = "";
            self.inputs = {};
            self.outputs = {};

            // private properties and methods
            var inputs = [];
            var getInputs = function () {
                var inputObject = {};

                for (var i = 0; i < inputs.length; i++) {
                    inputObject["input_" + i + 1] = inputs[i];
                }

                return inputObject;
            };
            var outputs = [];
            var getOutputs = function () {
                var outputObject = {};

                for (var i = 0; i < outputs.length; i++) {
                    outputObject["output_" + i + 1] = outputs[i];
                }

                return outputObject;
            };

            // public methods
            self.addInput = function (newInput) {
                inputs.push(newInput);
                self.inputs = getInputs();
            };
            self.addOutput = function (newOutput) {
                outputs.push(newOutput);
                self.outputs = getOutputs();
            };

            return self;
        };

        operatorFactory.getNew = function () {
            return operatorTemplateFn();
        };

        return operatorFactory;
    }])
    // Define the ng-flowchart Directive which will place the flowchart in the html.. TODO attribute restricted version?
    .directive("ngFlowchart", ['ngFlowchartService', function (ngFlowchartService) {
        return {
            // Only use as an html element
            restrict: 'E',
            // Isolate scope
            scope: {
                onOperatorSelect: '=?', // return true to allow or false to cancel, parameter of operatorId
                onOperatorUnselect: '=?', // return true to allow or false to cancel (prevent unselect)
                onOperatorMouseOver: '=?', // return true to allow or false to cancel, parameter of operatorId
                onLinkSelect: '=?', // return true to allow or false to cancel, parameter of linkId
                onLinkUnselect: '=?', // return true to allow or false to cancel (prevent unselect)
                onOperatorCreate: '=?', //return true to allow or false to cancel creation, parameter of operatorId, operatorData, fullElement
                // where fullElement has operator (DOM element of operator), title (DOM element of opeartor title), connectorArros, connectorSmallArrows
                onOperatorDelete: '=?', // return true to allow or false to cancel deletion, parameter of operatorId
                onLinkCreate: '=?', // return true to allow or false to cancel the creation, parameter of linkId, linkData
                onLinkDelete: '=?', // return true to allow or false to cancel the deletion, paramters of linkId, forced (if forced cannot be cancelled.. means operator was deleted)
                onOperatorMoved: '=?', // called when operator is moved, parameters of operatorId, position
                onAfterChanged: '=?' // called after chagnes have been done, parameter of changeType
                // where changeType is, 'operator_create', 'link_create', 'operator_delete', 'link_delete', 'operator_moved', 'operator_title_change',
                // 'operator_data_change', 'link_change_main_color'
            },
            transclude: false,
            replace: true,
            template: '<div class="ng-flowchart"></div>',
            link: function ($scope, element, attrs) {
                if ($scope.onOperatorSelect === undefined) $scope.onOperatorSelect = function () { return true; };
                if ($scope.onOperatorUnselect === undefined) $scope.onOperatorUnselect = function () { return true; };
                if ($scope.onOperatorMouseOver === undefined) $scope.onOperatorMouseOver = function () { return true; };
                if ($scope.onLinkSelect === undefined) $scope.onLinkSelect = function () { return true; };
                if ($scope.onLinkUnselect === undefined) $scope.onLinkUnselect = function () { return true; };
                if ($scope.onOperatorCreate === undefined) $scope.onOperatorCreate = function () { return true; };
                if ($scope.onOperatorDelete === undefined) $scope.onOperatorDelete = function () { return true; };
                if ($scope.onLinkCreate === undefined) $scope.onLinkCreate = function () { return true; };
                if ($scope.onLinkDelete === undefined) $scope.onLinkDelete = function () { return true; };
                if ($scope.onOperatorMoved === undefined) $scope.onOperatorMoved = function () { };
                if ($scope.onAfterChanged === undefined) $scope.onAfterChanged = function () { };

                $(element).flowchart({
                    data: ngFlowchartService.getOptions().data,
                    onOperatorSelect: $scope.onOperatorSelect,
                    onOperatorUnselect: $scope.onOperatorUnselect,
                    onOperatorMouseOver: $scope.onOperatorMouseOver,
                    onLinkSelect: $scope.onLinkSelect,
                    onLinkUnselect: $scope.onLinkUnselect,
                    onOperatorCreate: $scope.onOperatorCreate,
                    onOperatorDelete: $scope.onOperatorDelete,
                    onLinkCreate: $scope.onLinkCreate,
                    onLinkDelete: $scope.onLinkDelete,
                    onOperatorMoved: $scope.onOperatorMoved,
                    onAfterChanged: $scope.onAfterChanged
                });

                ngFlowchartService.setFlowchartReference($(element));

                if (ngFlowchartService.getConfigurationOptions().allowPanZoom) {
                    ngFlowchartService.enablePanZoom();
                }
            },
            controller: function ($scope, $timeout) {

            }
        };
    }]);
//.directive("ngFlowchartWorskspace", ['ngFlowchartService', function (ngFlowchartService) {
//    return {
//        // Only use as an html element
//        restrict: 'E',
//        // Isolate scope
//        scope: {
//        },
//        // TODO, possibly include transclusion
//        transclude: false,
//        replace: true,
//        template: [''
//        ].join('\n'),
//        link: function ($scope, element, attrs) {

//        },
//        controller: function ($scope, $timeout) {

//        }
//    };
//}]);

// TODO guid factory?
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}
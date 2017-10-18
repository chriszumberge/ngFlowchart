// Define the angular module
angular.module("ngFlowchart", [])
    // Define the ngFlowchartServiceProvider- the provider is used to define and configure the Flowchart canvas
    .provider("ngFlowchartService", [function () {
        // Set the default options
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
            defaultNewLeft: 60
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

        // Define the configured service that gets injected
        // The service is used to actively interact with the Flowcharts, and handle/triggert some events
        this.$get = ['$rootScope', function ($rootScope) {
            var self = this;
            // private local reference to the options
            var localOptions = self.options;

            var $flowchart = undefined;

            // define the public methods and properties for the service (interface)
            var ngFlowchartService = {};
            ngFlowchartService.setFlowchartReference = function (reference) {
                $flowchart = reference;
            };
            ngFlowchartService.getFlowchartReference = function () {
                return $flowchart;
            };
            ngFlowchartService.getOptions = function () {
                return localOptions;
            };
            ngFlowchartService.getData = function () {
                return localOptions.data;
            };

            ngFlowchartService.createOperator = function (operator, top, left) {
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

            ngFlowchartService.deleteSelected = function () {
                $flowchart.flowchart('deleteSelected')
            }

            // Return the service to be injected
            return ngFlowchartService;
        }];
    }])
    // Optionally providing a factory for creating operators
    .factory('ngFlowchartOperatorFactory', [function () {
        //ngFlowchartService.createOperator = function (operatorId, operatorInputs, operatorOutputs) {
        //    flowchartReference.flowchart('createOperator', {
        //        id: operatorId,
        //        data: {
        //            top: localOptions.defaultNewTop,
        //            left: localOptions.defaultNewLeft,

        //        }
        //    })
        //};
    }])
    // Define the ng-flowchart Directive which will place the flowchart in the html
    .directive("ngFlowchart", ['ngFlowchartService', function (ngFlowchartService) {
        return {
            // Only use as an html element
            restrict: 'E',
            // Isolate scope
            scope: {
            },
            transclude: false,
            // Don't replace because then the developer can apply styles to the element
            replace: true,
            template: '<div class="ng-flowchart"></div>',
            link: function ($scope, element, attrs) {
                $(element).flowchart({ data: ngFlowchartService.getData() });

                ngFlowchartService.setFlowchartReference($(element));
            },
            controller: function ($scope, $timeout) {

            }
        };
    }]);
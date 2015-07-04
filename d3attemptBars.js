(function() {
	var chartdata = [40, 60, 80, 100, 70, 120, 100, 60, 70, 150, 120, 140];

	var height = 200;
	var width = 610;
	var barWidth = 40;
	var barOffset = 10;
	var graph;
	var plot;

	function buildGraph() {
		buildBase();
		bindData();
		buildBars();
	}

	function buildBase() {
		graph = d3.select('#bars-magic-here').append('svg')
			.attr('width', width)
			.attr('height', height)
			.style('background', 'lightblue');
	}

	function bindData() {
		plot = graph.selectAll('rect').data(chartdata);
	}

	function buildBars() {
		plot.enter().append('rect')
			.style({
				'fill': 'darkgreen',
				'stroke': 'black'
			})
			.attr('width', barWidth)
			.attr('height', function(data) {
				return data;
			})
			.attr('x', function(data, i) {
				return (i * (barWidth + barOffset)) + 10;
			})
			.attr('y', function(data) {
				return height - data;
			});
	}

	buildGraph();
}());
(function() {
	var dataset = [{
		label: 'Abulia',
		count: 10
	}, {
		label: 'Betelgeuse',
		count: 20
	}, {
		label: 'Cantaloupe',
		count: 30
	}, {
		label: 'Dijkstra',
		count: 40
	}];

	var width = 360;
	var height = 360;
	var radius = Math.min(width, height) / 2;
	var donutWidth = 75;
	var color = d3.scale.category20c();

	var graph;
	var plot;
	var arc;
	var pie;

	function buildGraph() {
		buildBase();
		buildArc();
		buildPie();
		bindData();
		buildSlices();
	}

	function buildBase() {
		graph = d3.select('#donut-magic-here')
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', 'translate(' + (width / 2) +
				',' + (height / 2) + ')');
	}

	function buildArc() {
		arc = d3.svg.arc()
			.innerRadius(radius - donutWidth)
			.outerRadius(radius);
	}

	function buildPie() {
		pie = d3.layout.pie()
			.value(function(d) {
				return d.count;
			}).sort(null);

	}

	function bindData() {
		plot = graph.selectAll('path').data(pie(dataset));
	}

	function buildSlices() {
		plot.enter()
			.append('path')
			.attr('d', arc)
			.attr('fill', function(d, i) {
				return color(d.data.label);
			});
	}

	buildGraph();
}());
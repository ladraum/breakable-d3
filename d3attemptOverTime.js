(function() {
	var areaWidth = 940;
	var areaHeight = 500;
	var margins = {
		top: 30,
		right: 40,
		bottom: 150,
		left: 60
	};
	var width = areaWidth - margins.left - margins.right;
	var height = areaHeight - margins.top - margins.bottom;
	var contextHeight = 50;
	var contextWidth = width * 0.5;

	var color = d3.scale.category10();
	var usedColor = 0;

	var svg = d3.select("#overtime-magic-here").append("svg")
		.attr("width", width + margins.left + margins.right)
		.attr("height", (height + margins.top + margins.bottom));

	d3.csv('categories.csv', createChart);

	function createChart(data) {
		var categories = [];
		var charts = [];
		var maxDataPoint = 0;
		var categoriesCount;
		var chartHeight;
		var contextXScale;
		var contextAxis;
		var contextArea;
		var brush;
		var context;

		function initialize() {
			extractCategoriesDataFromCSV();

			categoriesCount = categories.length;
			chartHeight = height * (1 / categoriesCount);

			fixCSVData();
			createIndividualChats();
			setupContextXScale();
			setupContextAxis();
			setupContextArea();
			setupBrush();
			setupContext();
			setupTopAxis();
			setupContextBrush();
			buildCaptionLabel();
		}

		function extractCategoriesDataFromCSV() {
			for (var prop in data[0]) {
				if (data[0].hasOwnProperty(prop)) {
					if (prop != 'Year' && prop != 'Month')
						categories.push(prop);
				}
			};
		}

		function fixCSVData() {
			data.forEach(function(d) {
				for (var prop in d) {
					if (d.hasOwnProperty(prop)) {
						d[prop] = parseFloat(d[prop]);

						if (d[prop] > maxDataPoint)
							maxDataPoint = d[prop];
					}
				}

				d.date = new Date(d.Year, (d.Month - 1), 1);
			});
		}

		function createIndividualChats() {
			for (var i = 0; i < categoriesCount; i++)
				charts.push(createIndividualChat(i));
		}

		function createIndividualChat(index) {
			return new Chart({
				data: data.slice(),
				id: index,
				name: categories[index],
				width: width,
				height: height * (1 / categoriesCount),
				maxDataPoint: maxDataPoint,
				svg: svg,
				margins: margins,
				showBottomAxis: (index == categories.length - 1)
			});
		}

		function setupContextXScale() {
			contextXScale = d3.time.scale().range([0, contextWidth])
				.domain(charts[0].xScale.domain());
		}

		function setupContextAxis() {
			contextAxis = d3.svg.axis()
				.scale(contextXScale)
				.tickSize(contextHeight)
				.tickPadding(-10)
				.orient("bottom");
		}

		function setupContextArea() {
			contextArea = d3.svg.area()
				.interpolate("monotone")
				.x(function(d) {
					return contextXScale(d.date);
				})
				.y0(contextHeight)
				.y1(0);
		}

		function setupBrush() {
			brush = d3.svg.brush()
				.x(contextXScale)
				.on("brush", filterBySelection);
		}

		function filterBySelection() {
			var currentSelection = brush.empty() ? contextXScale.domain() : brush.extent();
			for (var i = 0; i < categoriesCount; i++)
				charts[i].showOnly(currentSelection);
		}

		function setupContext() {
			context = svg.append("g")
				.attr("class", "context")
				.attr("transform", buildContextPosition());
		}

		function buildContextPosition() {
			return "translate(" + (margins.left + (width * 0.25)) + "," + (height + margins.top + chartHeight) + ")";
		}

		function setupTopAxis() {
			context.append("g")
				.attr("class", "x axis top")
				.attr("transform", "translate(0,0)")
				.call(contextAxis)
		}

		function setupContextBrush() {
			context.append("g")
				.attr("class", "x brush")
				.call(brush)
				.selectAll("rect")
				.attr("y", 0)
				.attr("height", contextHeight);
		}

		function buildCaptionLabel() {
			context.append("text")
				.attr("class", "instructions")
				.attr("transform", "translate(100," + (contextHeight + 20) + ")")
				.text('Click and drag for zoom/pan');
		}

		initialize();
	}

	function Chart(options) {
		this.chartData = options.data;
		this.width = options.width;
		this.height = options.height;
		this.maxDataPoint = options.maxDataPoint;
		this.svg = options.svg;
		this.id = options.id;
		this.name = options.name;
		this.margins = options.margins;
		this.showBottomAxis = options.showBottomAxis;

		var localName = this.name;

		this.xScale = d3.time.scale()
			.range([0, this.width])
			.domain(d3.extent(this.chartData.map(function(d) {
				return d.date;
			})));

		this.yScale = d3.scale.linear()
			.range([this.height, 0])
			.domain([0, this.maxDataPoint]);
		var xS = this.xScale;
		var yS = this.yScale;

		this.area = d3.svg.area()
			.interpolate("basis")
			.x(function(d) {
				return xS(d.date);
			})
			.y0(this.height)
			.y1(function(d) {
				return yS(d[localName]);
			});

		this.svg.append("defs").append("clipPath")
			.attr("id", "clip-" + this.id)
			.append("rect").attr("width", this.width).attr("height", this.height);

		this.chartContainer = svg.append("g")
			.attr('fill', function() {
				return color(++usedColor);
			})
			.attr("transform", this.buildChartContainerPosition());

		this.chartContainer.append("path")
			.data([this.chartData])
			.attr("class", "chart")
			.attr("clip-path", "url(#clip-" + this.id + ")")
			.attr("d", this.area);

		this.xAxisTop = d3.svg.axis().scale(this.xScale).orient("bottom");
		this.xAxisBottom = d3.svg.axis().scale(this.xScale).orient("top");

		if (this.id == 0)
			this.chartContainer.append("g")
			.attr("class", "x axis top")
			.attr("transform", "translate(0,-20)")
			.call(this.xAxisTop);

		if (this.showBottomAxis)
			this.chartContainer.append("g")
			.attr("class", "x axis bottom")
			.attr("transform", "translate(0," + (this.height + 20) + ")")
			.call(this.xAxisBottom);

		this.yAxis = d3.svg.axis().scale(this.yScale).orient("left").ticks(5);

		this.chartContainer.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(-15,0)")
			.call(this.yAxis);

		this.chartContainer.append("text")
			.attr("class", "category-title")
			.attr("transform", "translate(15,40)")
			.text(this.name);

	}

	Chart.prototype.showOnly = function(b) {
		this.xScale.domain(b);
		this.chartContainer.select("path").data([this.chartData]).attr("d", this.area);
		this.chartContainer.select(".x.axis.top").call(this.xAxisTop);
		this.chartContainer.select(".x.axis.bottom").call(this.xAxisBottom);
	}

	Chart.prototype.buildChartContainerPosition = function() {
		return "translate(" + this.margins.left + "," + (this.margins.top + (this.height * this.id) + (10 * this.id)) + ")";
	}

}());
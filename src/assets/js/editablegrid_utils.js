// Some utils for EditableGrib built with Jquery

// Paginator

EditableGrid.prototype.updatePaginator = function(grid) {

	var paginator = $('#' + this.currentContainerid + '-paginator').empty();
	var navigator = paginator.parent().hide();
	var pageCount = this.getPageCount();

	var interval = this.getSlidingPageInterval(9);
	if (interval == null) {
		return;
	};
	navigator.show();

	var pages = this.getPagesInInterval(interval, function(pageIndex, isCurrent) {
		var pageLink = $('<li>').html('<a href="#">' + (pageIndex + 1) + '</a>');
		if (isCurrent) {
			return pageLink.addClass('active');
		};
		return pageLink.click(function(e) {
			e.stopPropagation();
			grid.setPageIndex(parseInt(e.currentTarget.innerText) - 1);
			e.preventDefault();
		});
	});

	var firstLink = $('<li>').html('<a href="#" aria-label="First page"><span class="glyphicon glyphicon-fast-backward" aria-hidden="true"></span></a>');
	if (!this.canGoBack()) {
		firstLink.addClass('disabled');
	} else {
		firstLink.click(function(e) {
			e.stopPropagation();
			grid.firstPage();
			e.preventDefault();
		});
	};
	paginator.append(firstLink);

	var prevLink = $('<li>').html('<a href="#" aria-label="Previous page"><span class="glyphicon glyphicon-backward" aria-hidden="true"></span></a>');
	if (!this.canGoBack()) {
		prevLink.addClass('disabled');
	} else {
		prevLink.click(function(e) {
			e.stopPropagation();
			grid.prevPage();
			e.preventDefault();
		});
	};
	paginator.append(prevLink);

	for (p = 0; p < pages.length; p++) {
		paginator.append(pages[p]);
	};

	var nextLink = $('<li>').html('<a href="#" aria-label="Next page"><span class="glyphicon glyphicon-forward" aria-hidden="true"></span></a>');
	if (!this.canGoForward()) {
		nextLink.addClass('disabled');
	} else {
		nextLink.click(function(e) {
			e.stopPropagation();
			grid.nextPage();
			e.preventDefault();
		});
	};
	paginator.append(nextLink);

	var lastLink = $('<li>').html('<a href="#" aria-label="Last page"><span class="glyphicon glyphicon-fast-forward aria-hidden="true"></span></a>');
	if (!this.canGoForward()) {
		lastLink.addClass('disabled');
	} else {
		lastLink.click(function(e) {
			e.stopPropagation();
			grid.lastPage();
			e.preventDefault();
		});
	};
	paginator.append(lastLink);
};

// Table builder

var Table = function(containerId, containerName, metadata, buttons, options) {
	
	var that = this;

	this.options = options || {};

	this.metadata = metadata;
	
	this.containerId = containerId;

	this.events = {
		onRowSelected: function(row) {},
		onRowUnselected: function(row) {},
	};

	this.method = {};

	this.buttons = {
		before: {}, 
		after: {}
	};

	for (const name in buttons) {
		this.method[name] = buttons[name].method;
		this.buttons[buttons[name].position][name] = $(buttons[name].html);
	};

	this.grid = new EditableGrid(containerName, {pageSize: this.options.pageSize || 10});

	this.grid.initializeGrid = function() {

		this.tableRendered = function() {
			this.updatePaginator(this);
		};

		for (const column of this.columns) {
			if (column.datatype == 'boolean') {
				this.setCellRenderer(column.name, new CellRenderer({
					render: function(cell, value) {
						cell.style.textAlign = 'center';
						// cell.style.width = '32px';
						cell.innerHTML = (value == true) ? '<span class="glyphicon glyphicon-ok"></span>' : '<span class="glyphicon glyphicon-minus"></span>';
					}
				}));
			}
			if (column.datatype == 'url') {
				this.setCellRenderer(column.name, new CellRenderer({
					render: function(cell, value) {
						cell.innerHTML = value + ' <a href="' + value + '"><span class="glyphicon glyphicon-link"></span></a>';
					}
				}));
			}
		};

		this.rowSelected = function(pRowIdx, nRowIdx) {
			const active = 'active';
			const pRow = this.getRow(pRowIdx);
			const nRow = this.getRow(nRowIdx);
			$(pRow).removeClass(active);
			if (pRowIdx != nRowIdx) {
				$(nRow).addClass(active);
				for (const button in that.buttons.after) {
					const $button = $(that.buttons.after[button]);
					$button && $button.removeClass('disabled').prop('disabled', false);
				};
				if (typeof that.events.onRowUnselected === 'function') {
					that.events.onRowUnselected.apply(this, arguments);
				};
			} else {
				for (const button in that.buttons.after) {
					const $button = $(that.buttons.after[button]);
					$button && $button.addClass('disabled').prop('disabled', true);
				};
				if (typeof that.events.onRowUnselected === 'function') {
					that.events.onRowSelected.apply(this, arguments);
				};
			};
		}.bind(this);

	};
};

Table.prototype.constructor = Table;

Table.prototype.update = function(data) {
	
	const $container = $(document.getElementById(this.containerId));
	
	for (const position in this.buttons) {
		for (const name in this.buttons[position]) {
			$(this.buttons[position][name]).click(function(e) {
				e.preventDefault();
				this.method[name].apply(this, arguments);
			}.bind(this));
		};
	};

	if (data.length < 1) {
		
		// Début de code moche
		const $buttonGroup = $('<div class="buttons-on-the-right-side"/>');
		for (const name in this.buttons.before) {
			$buttonGroup.append(this.buttons.before[name]);
		};
		$container.before($buttonGroup);
		// Fin de code moche

		$container.html('<div class="alert alert-warning" role="alert">Vide</div>')
		$container.show();
	} else {
		this.grid.load({
			metadata: this.metadata,
			data: data
		});
		this.grid.renderGrid(this.containerId, 'table table-bordered table-hover table-condensed');
		this.grid.initializeGrid();
		this.grid.refreshGrid();

		// Début de code moche
		$buttonGroup = $('<div class="buttons-on-the-right-side"/>');
		for (const name in this.buttons.before) {
			const $button = this.buttons.before[name];
			$buttonGroup.append($button);
		};
		$container.before($buttonGroup);

		$buttonGroup = $('<div class="buttons-on-the-right-side"/>');
		for (const name in this.buttons.after) {
			const $button = this.buttons.after[name].addClass('disabled').prop('disabled', true);
			$buttonGroup.append($button);
		};
		$container.after($buttonGroup);
		// Fin de code moche
	};
};

Table.prototype.empty = function() {
	this.update([]);
};

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

function Table(containerId, containerName, metadata, buttons, options) {
	var that = this;

	this.options = options || {};

	this.metadata = metadata;
	
	this.containerId = containerId;

	this.events = {
		onRowSelected: function(row) {},
		onRowUnselected: function(row) {},
	};

	this.buttons = {before: {}, after: {}};
	for (const name in buttons) {
		this.buttons[buttons[name].position][name] = $(buttons[name].html).click(function(e) {
			e.preventDefault();
			buttons[name].method.apply(that, arguments);
		});
	};
	
	this.grid = new EditableGrid(containerName, {pageSize: this.options.pageSize || 10});

	this.grid.initializeGrid = function() {

		this.tableRendered = function() {
			this.updatePaginator(this);
		};

		for (const column of this.columns) {
			if (column.datatype == 'boolean') {
				setCellRenderer(column.name, new CellRenderer({
					render: function(cell, value) {
						cell.style.textAlign = 'center';
						// cell.style.width = '32px';
						cell.innerHTML = (value == true) ? '<span class="glyphicon glyphicon-ok"></span>' : '';
					}
				}));
			}
		};

		this.rowSelected = function(pRowIdx, nRowIdx) {
			const pRow = this.getRow(pRowIdx);
			const nRow = this.getRow(nRowIdx);
			$(pRow).removeClass('selected');
			if (pRowIdx != nRowIdx) {
				$(nRow).addClass('selected');
				that.buttons.$open && that.buttons.$open.removeClass('disabled').prop('disabled', false);
				that.buttons.$remove && that.buttons.$remove.removeClass('disabled').prop('disabled', false);
				if (typeof that.events.onRowUnselected === 'function') {
					that.events.onRowUnselected.apply(this, arguments);
				};
			} else {
				that.buttons.$open && that.buttons.$open.addClass('disabled').prop('disabled', true);
				that.buttons.$remove && that.buttons.$remove.addClass('disabled').prop('disabled', true);
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
		this.grid.renderGrid(this.container.id, 'table table-striped table-bordered table-hover table-condensed');
		this.grid.initializeGrid();
		this.grid.refreshGrid();

		// Début de code moche
		$buttonGroup = $('<div class="buttons-on-the-right-side"/>');
		for (const name in this.buttons.before) {
			$buttonGroup.append(this.buttons.before[name]);
		};
		$container.before($buttonGroup);
		$buttonGroup = $('<div class="buttons-on-the-right-side"/>');
		for (const name in this.buttons.after) {
			$buttonGroup.append(this.buttons.after[name]);
		};
		$container.after($buttonGroup);
		// Fin de code moche

	};
};

Table.prototype.empty = function() {
	this.update([]);
};

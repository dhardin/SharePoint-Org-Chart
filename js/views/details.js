var app = app || {};

app.DetailsView = Backbone.View.extend({
	template: _.template($('#details-item-template').html()),

	events: {
		'change': 'render',
	},

	initialize: function (options) {
		 this.model.on('change', this.render, this);
	},


	render: function () {
		this.$el.html(this.template(this.model.toJSON()));

		return this;
	}
});

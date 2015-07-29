var app = app || {};

app.DetailsView = Backbone.View.extend({
	template: _.template($('#details-item-template').html()),

	events: {
		'click .save': 'save'
	},

	initialize: function (options) {
	},

	save: function(){
		var save_fields = {};	
		this.$('input').each(function(){
			save_fields[this.className] = this.value;
		});

		this.model.set(save_fields);
		this.$('.close-reveal-modal').click();
	},
	render: function () {
		this.$el.html(this.template(this.model.toJSON()));

		return this;
	}
});

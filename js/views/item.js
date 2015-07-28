var app = app || {};

app.ItemView = Backbone.View.extend({
    template: _.template($('#item-template').html()),

    events: {

        'change': 'render',
        'click a[data-reveal-id="myModal"]': 'select',
        'click .node': 'select'
    },

    initialize: function(options) {
        this.model.on('change', this.render, this);
    },

    select: function(e) {
        Backbone.pubSub.trigger('showModal', this.model);
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));

        return this;
    }
});

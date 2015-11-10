var app = app || {};

app.DetailsView = Backbone.View.extend({
    template: _.template($('#details-item-template').html()),

    events: {
        'click .save': 'save',
        'click .close-reveal-modal': 'cancel'
    },

    initialize: function(options) {
        this.parent = options.parent;
    },

    save: function() {
        var save_fields = {};
        this.$('input').each(function() {
            save_fields[this.className] = this.value;
        });
        this.model.set(save_fields);
        this.$('.close-reveal-modal').click();
        this.model.save(this.model.get('id') ? 'update' : 'new');
        Backbone.pubSub.trigger('save', this.model);
    },
    cancel: function() {
        if(this.model.get('parent') == ''){
             this.model.destroy();
        }
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));

        return this;
    }
});

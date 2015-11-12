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
            if (this.className != this.get(this.className)) {
                save_fields[this.className] = this.value;
            }
        });

        this.model.set(save_fields);
        
        //if model's name changed, update children's parent
        if(save_fields.firstName || save_fields.lastName) {
            var saveArr = [];
            this.setName();
            this.updateChildrensParent();
            this.get('children').each(function(model){
                saveArr.push(model.toJSON());
            });
            saveArr.push(this.model.toJSON());
            this.model.save(this.model.get('id') ? 'update' : 'new', saveArr);
        } else {
            this.model.save(this.model.get('id') ? 'update' : 'new');
        }
        
        Backbone.pubSub.trigger('save', this.model);
        this.$('.close-reveal-modal').click();
    },

    cancel: function() {
        if (this.model.get('parent') == '') {
            this.model.destroy();
        }
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));

        return this;
    }
});

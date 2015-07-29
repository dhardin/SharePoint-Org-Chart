var app = app || {};

app.ItemView = Backbone.View.extend({
    template: _.template($('#item-template').html()),

    events: {

        'change': 'render',
        'click .node': 'select',
        'click .add': 'add',
        'click .delete' :'delete',
        contextmenu: 'contextmenu'
    },

    initialize: function(options) {
        this.model.on('change', this.render, this);
         Backbone.pubSub.on('context', this.showContext, this);
    },

    contextmenu: function(e) {
        var posX = this.$el.offset().left,
            posY = this.$el.offset().top;
        e.preventDefault();
        this.$context.show().css({
            left: e.offsetX,
            top: e.offsetY
        });

        //Backbone.pubSub.trigger('context', this.$context);
    },

    showContext: function($target){
    },

    select: function(e) {
        if (e.target.className.indexOf('add') == -1 && e.target.className.indexOf('delete') == -1) {

            Backbone.pubSub.trigger('showModal', this.model);
        }
    },

    add: function(e) {
        Backbone.pubSub.trigger('add', this.model);
        this.$context.hide();
    },


    delete: function(e) {
        if(e.target.className.indexOf('disabled') > -1){
            return;
        }
        Backbone.pubSub.trigger('delete', this.model);
        this.$context.hide();
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$context = this.$('.context');
        return this;
    }
});

var app = app || {};

app.ItemView = Backbone.View.extend({
    template: _.template($('#item-template').html()),

    events: {

        'change': 'render',
        'click .node': 'select',
        'click .add': 'add',
        'click .delete': 'delete',
        'click .move': 'move',
        contextmenu: 'contextmenu'
    },

    initialize: function(options) {
        this.model.on('change', this.render, this);

    },

    contextmenu: function(e) {
        var posX = this.$el.offset().left,
            posY = this.$el.offset().top;
        e.preventDefault();
        this.$context.show().css({
            left: e.offsetX,
            top: e.offsetY
        });

    },

    selectParent: function(model) {
        if (this.dragging) {
            this.model.set('parent', model.get('id'));
            this.dragging = false;
            this.$draggable.remove();
        }
    },

    select: function(e) {
        if (e.target.className.indexOf('add') == -1 && e.target.className.indexOf('delete') == -1 && e.target.className.indexOf('move') == -1) {
            if (!this.listening) {
                Backbone.pubSub.trigger('showModal', this.model);
            } else {
                Backbone.pubSub.trigger('select', this.model);
                this.listening = false;
            }
        }

    },

    add: function(e) {
        Backbone.pubSub.trigger('add', this.model);
        this.$context.hide();
    },


    delete: function(e) {
        if (e.target.className.indexOf('disabled') > -1) {
            return;
        }
        Backbone.pubSub.trigger('delete', this.model);
        this.$context.hide();
    },

    listen: function(model) {
        if (model != this.model) {
            this.listening = true;
        }
    },

    move: function(e) {
        var $draggable, that = this;

        this.$context.hide();
        this.$draggable = $('<div class="draggable">' + this.$el.html() + '</div>');
        $('body').append(this.$draggable);
        this.dragging = true;
        Backbone.pubSub.trigger('move', this.model);



        $('body').on('mousemove', function(e) {
            that.$draggable.css({
                left: e.pageX + 2,
                top: e.pageY + 2
            }).on('click', function(e) {
                $('body').off('mousemove, click');
            });
        });
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$context = this.$('.context');
        this.dragging = false;
        Backbone.pubSub.on('context', this.showContext, this);
        Backbone.pubSub.on('select', this.selectParent, this);
        Backbone.pubSub.on('move', this.listen, this);
        return this;
    }
});

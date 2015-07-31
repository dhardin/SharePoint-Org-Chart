var app = app || {};

app.ItemView = Backbone.View.extend({
    template: _.template($('#item-template').html()),

    events: {

        'change': 'render',
        'click .node': 'select',
        'click .add': 'add',
        'click .delete': 'delete',
        'click .move': 'move',
        'click .edit': 'edit',
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
            if (this.model.get('parent') != 0) {
                this.model.set('parent', model.get('id'));
                this.$node.removeClass('moving');
            }
            this.dragging = false;
            this.$draggable.remove();
               $('body').off('mousemove, click').css({'cursor': 'auto'});
        }
    },

    select: function(e) {
        e.preventDefault();
        if (!e || $(e.target).parent('.context').length == 0) {
            if (!this.listening) {
                this.closeContext();
                Backbone.pubSub.trigger('showModal', this.model);
            } else {
                Backbone.pubSub.trigger('select', this.model);
                this.listening = false;
                this.$node.removeClass('listen');
            }
        } 

    },

    closeContext: function(e) {
        this.$context.hide();
        $('.context-bg').remove();
    },
    edit: function(e) {
        this.select();
        this.closeContext();
    },

    add: function(e) {
        Backbone.pubSub.trigger('add', this.model);
        this.closeContext();
    },


    delete: function(e) {
        if (e.target.className.indexOf('disabled') > -1) {
            return;
        }
        Backbone.pubSub.trigger('delete', this.model);
        this.closeContext();
    },

    listen: function(model) {
        if (model != this.model) {
            this.listening = true;
            this.$node.addClass('listen');
        } else {
            this.$node.addClass('moving');
        }
    },

    move: function(e) {
        var $draggable, that = this;

        this.closeContext();
        this.$draggable = $('<div class="draggable">' + this.$el.html() + '</div>');
        $('body').append(this.$draggable);
        this.dragging = true;
        Backbone.pubSub.trigger('move', this.model);



        $('body').on('mousemove', function(e) {
            that.$draggable.css({
                left: e.pageX + 2,
                top: e.pageY + 2
            });
        }).css({
            'cursor': '-webkit-grabbing'
        });
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$context = this.$('.context');
        this.$node = this.$('.node');
        this.dragging = false;
        Backbone.pubSub.on('context', this.showContext, this);
        Backbone.pubSub.on('select', this.selectParent, this);
        Backbone.pubSub.on('move', this.listen, this);
        return this;
    }
});

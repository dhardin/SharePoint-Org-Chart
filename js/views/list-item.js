var app = app || {};

app.ListItemView = Backbone.View.extend({
    template: _.template($('#item-list-template').html()),
    className: 'item',

    events: {
        'change': 'render',
        'click': 'select',
        'click .add': 'add',
        'click .delete': 'delete',
        'click .move': 'move',
        'click .edit': 'edit',
        contextmenu: 'contextmenu'
    },

    initialize: function(options) {
        this.model.on('change', this.render, this);
        Backbone.pubSub.on('context', this.showContext, this);
        Backbone.pubSub.on('select', this.selectParent, this);
        Backbone.pubSub.on('move', this.listen, this);
        Backbone.pubSub.on('done', this.doneMoving, this);
        this.pendingDelete = false;
    },

    route: function(e) {
        if (this.listening) {
            e.preventDefault();
        }
    },

    contextmenu: function(e) {
        var posX,
            posY;

        if (!app.config.editing) {
            return;
        }
        posX = this.$el.offset().left;
        posY = this.$el.offset().top;
        e.preventDefault();
        this.$context.show().css({
            left: e.offsetX,
            top: e.offsetY
        });
        Backbone.pubSub.trigger('context', this);
        app.state_map.itemViewContext = this;
    },

    selectParent: function(model) {
        if (this.dragging) {
            if (this.model.get('parent') != 0) {
                //this.setChildrensParent(this.model.get('parent'));
                this.model.set('parent', model.get(app.config.parent_id_field));
                this.model.save('update');
            }
            Backbone.pubSub.trigger('done');
        }
    },
    setChildrensParent: function(parent) {
        Backbone.pubSub.trigger('setParent', this.model.get(app.config.parent_id_field), parent);
    },

    select: function(e) {
        if(this.pendingDelete){
            return;
        }
        if (!e || $(e.target).parent('.context').length == 0) {
            if (!this.listening && !this.dragging) {
                this.closeContext();
                Backbone.pubSub.trigger('showModal', this.model);
            } else if (this.dragging) {
                Backbone.pubSub.trigger('done');
            } else {
                Backbone.pubSub.trigger('select', this.model);
            }
        }

    },

    closeContext: function(e) {
        this.$context.hide();
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
        this.pendingDelete = true;
        this.model.save('delete');
        Backbone.pubSub.trigger('delete', this.model);
        this.closeContext();
    },

    listen: function(model) {
        if (model != this.model) {
            this.listening = true;
            this.$el.addClass('listen');
        } else {
            this.$el.addClass('moving');
        }
    },
    onClose: function() {
        this.model.off('change');
        Backbone.pubSub.on('context');
        Backbone.pubSub.off('select');
        Backbone.pubSub.off('move');
        Backbone.pubSub.off('done');
        Backbone.pubSub.off('setParent');
    },
    childOf: function(model) {
        var parents = this.model.get('parents');
        return parents.indexOf(model) > -1;
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
        $(document).on('keyup', function(e) {
            if (e.which == 27) {
                Backbone.pubSub.trigger('done');
            }
        });
    },

    doneMoving: function() {
        this.$el.removeClass('moving listen child');
        this.listening = false;
        this.dragging = false;
        if (this.$draggable) {
            this.$draggable.remove();
            this.$draggable = false;
        }
        $('body').off('mousemove').css({
            'cursor': 'auto'
        });
        $(document).off('keyup');
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$context = this.$('.context');
        this.$draggable = this.$draggable || false;
        this.dragging = false;

        return this;
    }
});

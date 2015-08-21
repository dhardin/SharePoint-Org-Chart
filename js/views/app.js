var app = app || {};


app.AppView = Backbone.View.extend({
    initialize: function() {
        Backbone.pubSub.on('context', this.closeContext);
    },
    showView: function(view) {
        if (this.currentView) {
            this.currentView.close();
        }

        this.currentView = view;
        this.currentView.render();

        $('#main').html(this.currentView.el);

        //rebind foundation events by re-calling foundation
        setTimeout(function() {
            $(document).foundation();
        }, 100);
    },
    closeContext: function(view) {
        if (app.state_map.itemViewContext !== null && view !== app.state_map.itemViewContext) {
            app.state_map.itemViewContext.closeContext();
        }
    }
});
Backbone.pubSub = _.extend({}, Backbone.Events);
Backbone.View.prototype.close = function() {
    this.remove();
    this.unbind();
    if (this.onClose) {
        this.onClose();
    }
}

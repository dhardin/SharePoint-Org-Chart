var app = app || {};

app.InstructionsView = Backbone.View.extend({
    template: _.template($('#instructionsTemplate').html()),
    initialize: function() {
        var that = this;
        $(document).foundation({})
            .on('keydown', function(e) {

                if (e.which === 69 && e.ctrlKey) {
                    e.preventDefault();
                    that.toggleEditMode();

                }
            });
    },

    render: function() {
        this.$el.html(this.template());
        if (app.config.editing) {
            this.$el.show();
        } else {
            this.$el.hide();
        }
        return this;
    },
    toggleEditMode: function() {
        app.config.editing = !app.config.editing;
        if (app.config.editing) {
            this.$el.show();
        } else {
            this.$el.hide();
        }
    }
});

var app = app || {};

app.Item = Backbone.Model.extend({
    defaults: {
        firstName: 'N/A',
        lastName: 'N/A',
        email: 'N/A',
        id: 'N/A',
        title: 'N/A',
        parent: '',
        phone: 'N/A',
        department: 'N/A',
        children: []
    },
    initialize: function(){
    
    },
    save: function(){
        app.data.saveData({
            data: [this.toJSON()],
            url: app.config.url,
            guid: app.config.guid,
            method: this.get('id') ? 'update' : 'new',
            callback: function(results){
                console.log('save complete!');
            }
        });
    }
});

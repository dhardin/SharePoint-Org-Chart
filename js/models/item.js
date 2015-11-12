var app = app || {};

app.Item = Backbone.Model.extend({
    defaults: {
        firstName: 'N/A',
        lastName: 'N/A',
        email: 'N/A',
        id: 'N/A',
        title: 'N/A',
        name: 'N/A',
        parent: '',
        phone: 'N/A',
        department: 'N/A',
        children: []
    },
    initialize: function(){
      this.setName();  
    },
    setName: function () {
        this.set('name', this.get('firstName') + ' ' + this.get('lastName'));
    },
    updateChildrensParent: function(){
        var parentName = this.get('name');
        this.get('children').each(function(model){
            model.set('parent', parentName);
        });
    },
    save: function(method, data){
        app.data.saveData({
            data: data || [this.toJSON()],
            url: app.config.url,
            guid: app.config.guid,
            method: method,
            callback: function(results){
                console.log('save complete!');
                if(results.error != "" || method != 'new'){
                    return;
                }
                results = app.processResults(results.data);
                this.attr('id', results[0].id);
            }
        });
    }
});

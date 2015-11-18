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
        isBlankNode: false,
        children: []
    },
    initialize: function(){
      //check to see if it is a blank node
      if(!this.get('isBlankNode')){
        this.setName();
      }
    },
    setName: function () {
        this.set('name', this.get('firstName') + ' ' + this.get('lastName'));
    },
    updateChildrensParent: function(){
        var parentName = this.get('name'),
            removeIndex = false;
        this.get('children').forEach(function(model, index){
            if(model.get('name') != parentName){
                model.set('parent', parentName);
            } else {
                removeIndex = index;
            }
        });
        if(!removeIndex){
            return;
        }
        
        this.set('children', this.get('children').splice(removeIndex, 1));
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

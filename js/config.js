var app = app || {};


app.config = {
	url: '',
	guid: '',
	tryCount: 3,
	testing: true,
	editing: false,
	property_map: {
			ows_title: 'lastName',
			ows_name: 'name',
	    	ows_unit: 'department',
	    	ows_supervisor: 'parent',
	    	ows_workphone: 'phone',
	    	ows_email: 'email',
	    	ows_jobtitle: 'title'
	}
};

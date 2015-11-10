var app = app || {};


app.config = {
	url: '',
	guid: '',
	parent_id_field: 'id',
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
	    	ows_jobtitle: 'title',
	    	ows_id: 'id'
	},
	static_names: {
		lastName: 'Title',
		name: 'Name',
		department: 'Unit',
		parent: 'Supervisor',
		phone: 'WorkPhone',
		email: 'Email',
		title: 'JobTitle',
		id: 'ID'
	}
};

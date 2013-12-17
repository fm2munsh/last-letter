var http		= require('http'),
	mongoose	= require('mongoose'),
	countries	= require('./categories/countries.json');
   
var uristring = process.env.MONGOLAB_URI ||  process.env.MONGOHQ_URL ||  'mongodb://localhost/last-letter';

mongoose.connect(uristring, function (err, res) {
	if (err) {
		console.log ('Error connecting to: ' + uristring + '. ' + err);
	} else {
		console.log ('Successfully connected to: ' + uristring);
	}
});


var UserSchema = new mongoose.Schema({
	username  :   {
		type      : String,
		required  : true,
		unique    : true
	}
});

var ActiveGameSchema = new mongoose.Schema({
	users			: [],
	turn_num		: Number,
	turn_user		: String,
	category		: String,
	current_word	: String,
	past_words		: []
});

var User		= mongoose.model('User', UserSchema);
var ActiveGame	= mongoose.model('ActiveGame', ActiveGameSchema);

exports.createGame = function(data, callback) {
	console.log(data.user);
	console.log(data.opponent);
	console.log({
			users			:  [data.user.username, data.opponent.username]	,
			turn_num		: 1												,
			turn_user		: data.user.username										,
			category		: data.category									,
			current_word	: ""											,
			past_words		: []
    });
	var newGame = new ActiveGame({
			users			:  [data.user.username, data.opponent.username]	,
			turn_num		: 1												,
			turn_user		: data.user.username										,
			category		: data.category									,
			current_word	: ""											,
			past_words		: []
    });

    newGame.save(function(err){
      if(err) throw err;
      else {
        callback(newGame);
      }
    });
};

exports.countries = function(country) {
	console.log(!!countries[country]);
};

exports.getActiveGames = function(user, callback) {
	ActiveGame
        .find()
        .where('users').in([user.username])
        .exec(callback);
};

exports.allgames = function() {
	ActiveGame.find().exec(function(err, resp){
		resp.forEach(function(r){
			r.remove();
		});
		console.log(resp);
	});
};

exports.clearAll = function() {
	User.collection.remove( function (err) {
		if (err) throw err;
	});
	ActiveGame.collection.remove( function (err) {
		if (err) throw err;
	});
};
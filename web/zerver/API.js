var http		= require('http'),
	mongoose	= require('mongoose'),
	countries	= require('./categories/countries.json');

var dictionary = { "countries" : countries };
   
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
	non_turn_user	: String,
	category		: String,
	current_word	: String,
	past_words		: []
});

var User		= mongoose.model('User', UserSchema);
var ActiveGame	= mongoose.model('ActiveGame', ActiveGameSchema);

exports.createGame = function(data, callback) {
	var newGame = new ActiveGame({
			users			:  [data.user.username, data.opponent.username]	,
			turn_num		: 1												,
			turn_user		: data.user.username							,
			non_turn_user	: data.opponent.username						,
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
exports.checkWord = function(activeGame, word, callback) {
	// If its the first turn then no need to check stuff
	if (activeGame.turn_num === 1){
		if (!!dictionary[activeGame.category.split(' ').join('').toLowerCase()][word.toLowerCase()]) {
			ActiveGame.findOne({ _id : activeGame._id }, function(err, a) {
				a.current_word	= word;
				a.turn_user		= activeGame.non_turn_user;
				a.non_turn_user = activeGame.turn_user;
				a.past_words.push(word);
				a.turn_num		= 2;
				a.save();
				callback(a);
			});
		} else {
			callback("error");
		}
	} else {
		// Check if first letter of this word is the same as the last letter from last word
		if (activeGame.current_word[activeGame.current_word.length-1] === word[0]) {
			// Check if word is in dictionary for this category
			if (!!dictionary[activeGame.category.split(' ').join('').toLowerCase()][word.toLowerCase()]) {
				ActiveGame.findOne({ _id : activeGame._id }, function(err, a) {
					a.current_word	= word;
					a.turn_user		= activeGame.non_turn_user;
					a.non_turn_user = activeGame.turn_user;
					a.past_words.push(word);
					a.turn_num		+= 1;
					a.save();
					callback(a);
				});
			} else {
				callback("error");
			}
		} else {
			callback("error");
		}
	}

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

exports.allgames = function(callback) {
	ActiveGame.find().exec(function(err, resp){
		console.log(resp);
		if (callback) callback(resp);
	});
};

exports.clearAll = function() {
	User.find().exec(function(err, resp){
		resp.forEach(function(r){
			r.remove();
		});
		console.log(resp);
	});

	ActiveGame.find().exec(function(err, resp){
		resp.forEach(function(r){
			r.remove();
		});
		console.log(resp);
	});
};


exports.log = function(log){
	console.log("SERVER LOG");
	console.log(log);
};
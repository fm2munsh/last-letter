window.cache = {};

(function (App, cards) {

	cards.ready(function(){
		if (cards.browser.linkData){
			API.log(cards.browser.linkData);
			var activeGame = cards.browser.linkData.activeGame;
			if (!!activeGame) {
				App.load('game', activeGame);
			}
		}
	});


	App.populator('home', function (page) {
		cards.kik.getUser(function (user) {
			if ( !user ) {
				// action was cancelled by user
				return;
			}
			API.getActiveGames(user, function(err, actives){
				console.log(actives);
				actives.forEach(function(game){
					var el = '';
					if (game.turn_user === user.username){
						el = '<li class="app-button" id = ' + game._id + '>' + game.category + '</li>';
					} else {
						el = '<li class="app-button" id = ' + game._id + '>' + game.category + '</li>';
					}
					$(page).find('#active_list').append(el);
				});
				if (actives.length > 0) $(page).find('#active_games').removeClass('hidden');
				else					$(page).find('#no_active').removeClass('hidden');
			});

			$(page)
				.find('#start')
				.on('click', function(event){
					cards.kik.pickUsers({ "maxResults" : 1, "minResults" : 1 }, function (users) {
							// Load the create game page while passing the current user and the opponent name
							console.log(users);
							console.log(users[0]);
							App.load('create_game', { "user" : user, "opponent": users[0] });
					});
				});
		});
	});

	App.populator('game', function (page, activeGame) {
		console.log(activeGame);
		cards.kik.getUser(function (user) {
			if ( activeGame.turn_user === user.username ) {
				$(page).find('#your_turn').removeClass('hidden');
				if ( activeGame.turn_num === 1 ) {
					var instructions = 'Send any word from the category ' + activeGame.category + ' to get started';
					$(page).find('#instructions').append(instructions);
				}

				$(page).find('#send').click(function(event){
					var word = $(page).find('#word').val();
					API.checkWord(activeGame, word, function(response){
						if (response === "error") {
							console.log("wrong word ~~~~~~~~~~~");
						} else {
							cards.kik.send(response.turn_user, {
								"title"		: "Your turn in Last Letter"	,
								"text"		: word							,
								"linkData"	: { "activeGame" : response }	,
							});
						}
					});
				});
			} else {
				$(page).find('#their_turn').removeClass('hidden');
			}
		});
	});

	App.populator('create_game', function(page, data) {
		var opponent	= data.opponent,
			user		= data.user;
		console.log(opponent);
		$(page)
			.find('#title')
			.html('Creating game with ' + opponent.username);

		$(page)
			.find('#category li')
			.on('click', function(event){
				var category = $(event.target).attr('id');
					console.log({ "user": user.username, "opponent" : opponent.username, "category" : category });
				API.createGame({ "user": user, "opponent" : opponent, "category" : category }, function(activeGame) {
					App.load('game', activeGame);
				});
			});
	});

	try {
		App.restore();
	} catch (err) {
		App.load('home');
	}
})(App, cards);
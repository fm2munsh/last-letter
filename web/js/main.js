window.cache = {};

(function (App) {
	App.populator('home', function (page) {
		cards.kik.getUser(function (user) {
			if ( !user ) {
				// action was cancelled by user
				return;
			}
			window.cache.user = user;

			API.getActiveGames(user, function(err, actives){
				console.log("ACTIVES");
				console.log(actives);
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
})(App);

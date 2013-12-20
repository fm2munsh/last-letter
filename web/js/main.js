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
						el = '<li class="app-button active_game" id = ' + game._id + '> <img src="cdn.kik.com/user/pic/' + game.non_turn_user + '" class = "user_icon"> <span class = "turn_info"> Your turn against ' + game.non_turn_user + '</span></li>';
					} else {
						el = '<li class="app-button active_game" id = ' + game._id + '> <img src="http://cdn.kik.com/user/pic/' + game.turn_user + '" class = "user_icon"> <span class = "turn_info"> ' + game.turn_user + "'s turn</span></li>";
					}
					$(page).find('#active_list').append(el);
				});
				if (actives.length > 0) $(page).find('#active_games').removeClass('hidden');
				else					$(page).find('#no_active').removeClass('2');

				$(page)
					.find('#active_list li')
					.on('click', function(event){
						var id = $(this).attr('id');
						console.log(id);
						API.getActiveGame(id, function(activeGame) {
							console.log("Get active Game ~~~~~~");
							App.load('game', activeGame);
						});
					});
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
				var instructions;
				if ( activeGame.turn_num === 1 ) {
					instructions = 'Send any word from the category ' + activeGame.category + ' to get started';
				} else {
					instructions = activeGame.non_turn_user + ' has sent the word ' + activeGame.current_word + ' Send a word starting with the letter "' + activeGame.current_word[activeGame.current_word.length-1] + '" from the category ' + activeGame.category;
				}
				$(page).find('#instructions').append(instructions);

				$(page).find('#send').click(function(event){
					var word = $(page).find('#word').val();
					API.checkWord(activeGame, word, function(response){
						if (response === "error") {
							var text = '';

							API.log(JSON.stringify(activeGame));
							API.log(response);

							if (activeGame.turn_num > 0) {
								if (activeGame.turn_user_lives === 1) {
									API.endGame(activeGame, function(response){
										activeGame = response;
										text = 'You have ran out of lives, you lose';
									});
								} else {
									activeGame.turn_user_lives -= 1;
									API.updateActive(activeGame, function(response){
										activeGame = response;
										text = 'You entered an invalid word, you have lost 1 life, try again';
										$(page).find('#turn_user_lives').html(activeGame.turn_user_lives + ' Lives');
									});
								}
							}
							
							API.log(text);

							App.dialog({
								title   : "Invalid word"	,
								text    : text				,
								success : 'Ok'				,
							}, function (status) {
								if (activeGame.complete) {
									App.load('home');
								}
							});
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

			$(page).find('#turn_user').attr("src", "http://cdn.kik.com/user/pic/"+activeGame.turn_user);
			$(page).find('#non_turn_user').attr("src", "http://cdn.kik.com/user/pic/"+activeGame.non_turn_user);
			$(page).find('#turn_num').html("Turn "+activeGame.turn_num);
			$(page).find('#turn_user_lives').html(activeGame.turn_user_lives + ' Lives');
			$(page).find('#non_turn_user_lives').html(activeGame.non_turn_user_lives + ' Lives');
			activeGame.past_words.forEach(function(word){
				$(page).find('#used').append('<li> '+ word + ' </li>');
			});

			$(page).find('#show_used').on('click', function(event){
				$(page).find('#used').toggle();
			});
		});
	});

	App.populator('create_game', function(page, data) {
		var opponent	= data.opponent,
			user		= data.user;
		console.log(opponent);
		$(page)
			.find('#title')
			.html('Creating game');

		$(page)
			.find('#category li')
			.on('click', function(event){
				var category = $(this).attr('id');
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
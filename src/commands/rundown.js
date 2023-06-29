const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');

const { getRundown } = require('../handlers/datahandler.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rundown')
		.setDescription('Shows the score rundown for an event.')
		.addStringOption(option =>
			option.setName('event')
				.setDescription('The event to show the rundown for.')
				.setRequired(true)),
	async execute(interaction) {
		// Retrieving the rundown data for the specified event
		const rundownData = await getRundown(interaction.options.getString('event'));

		// Arrays containing team information
		const teams = ['RED', 'ORANGE', 'YELLOW', 'LIME', 'GREEN', 'CYAN', 'AQUA', 'BLUE', 'PURPLE', 'PINK'];
		const teamDisplayNames = ['Red Rabbits', 'Orange Ocelots', 'Yellow Yaks', 'Lime Llamas', 'Green Geckos', 'Cyan Coyotes', 'Aqua Axolotls', 'Blue Bats', 'Purple Pandas', 'Pink Parrots'];
		const teamIcons = ['team_red', 'team_orange', 'team_yellow', 'team_lime', 'team_green', 'team_cyan', 'team_aqua', 'team_blue', 'team_purple', 'team_pink'];

		// If the rundown data is null, reply with an error message
		if (rundownData == null) {
			return interaction.reply({ content : 'That event does not exist! Examples of valid event values are: \'14\', \'30\', \'P23\'.', ephemeral: true });
		}

		// Object containing the reply message
		const reply = {
			embeds: [{
				title: `MCC ${interaction.options.getString('event')} Event Score Rundown`,
				description: '',
				color: 0xff0000,
				thumbnail: {
					url: 'https://mcc.live/favicon.png',
				},
				fields: [],
				footer: {
					text: 'Data provided by the official MCC Event API - Bot not affiliated with Noxcrew or MCC.',
					icon_url: 'https://noxcrew.com/favicon.ico',
				},
			}],
		};
		await interaction.deferReply();

		// Extracting data from the rundownData object
		const eventPlacements = rundownData['eventPlacements'];
		const individualScores = rundownData['individualScores'];
		const history = rundownData['history'];
		const creators = rundownData['creators'];
		const teamScores = rundownData['eventScores'];
		const dodgeboltData = rundownData['dodgeboltData'];
		const dodgeboltWinner = Object.keys(dodgeboltData).reduce((a, b) => dodgeboltData[a] > dodgeboltData[b] ? a : b);

		// Finding the crown emoji in the client's cache
		const crownEmote = interaction.client.emojis.cache.find(emoji => emoji.name === '_crown');

		// Array to store team placements
		const teamsByPlacement = [];

		// Looping through the eventPlacements object to create the team placements string
		for (const team in eventPlacements) {
			teamsByPlacement[eventPlacements[team]] = team;
		}
		let teamPlacementsString = '';
		for (const placement in teamsByPlacement) {
			const teamName = teamsByPlacement[placement];
			const teamEmote = interaction.client.emojis.cache.find(emoji => emoji.name === teamIcons[teams.indexOf(teamName)]);
			teamPlacementsString += dodgeboltWinner === teamName ? `${placement}. ${teamEmote} ${teamDisplayNames[teams.indexOf(teamName)]} - ${teamScores[teamName]} coins (${crownEmote})\n` : `${placement}. ${teamEmote} ${teamDisplayNames[teams.indexOf(teamName)]} - ${teamScores[teamName]} coins\n`;
		}

		// Adding the team placements field to the reply object
		reply.embeds[0].fields.push({
			name: 'Event Placements',
			value: teamPlacementsString,
			inline: true,
		});
		const teamPlacementsField = reply.embeds[0].fields[0];

		// Creating the individual scores string
		let individualScoresString = '';
		const top10Players = Object.keys(individualScores).sort((a, b) => individualScores[b] - individualScores[a]).slice(0, 10);
		for (const player of top10Players) {
			const playerTeam = Object.keys(creators).find(team => creators[team].includes(player));
			const playerTeamEmote = interaction.client.emojis.cache.find(emoji => emoji.name === teamIcons[teams.indexOf(playerTeam)]);
			individualScoresString += dodgeboltWinner === playerTeam ? `${top10Players.indexOf(player) + 1}. ${playerTeamEmote} ${player} - ${individualScores[player]} coins (${crownEmote})\n` : `${top10Players.indexOf(player) + 1}. ${playerTeamEmote} ${player} - ${individualScores[player]} coins\n`;
		}

		// Adding the individual scores field to the reply object
		reply.embeds[0].fields.push({
			name: 'Individual Scores',
			value: individualScoresString,
			inline: false,
		});
		const individualScoresField = reply.embeds[0].fields[1];

		// Add button to return to the main embed
		const eventButton = new ButtonBuilder()
			.setCustomId('event')
			.setLabel('Return to Event Rundown')
			.setStyle('Primary');


		// Loop through the history object to create the game buttons and add them to the gameButtons array
		const gameButtons = [];
		for (const index in history) {
			const gameName = history[index].game.replace('MG_', '').replace(/_/g, ' ');
			const gameButton = new ButtonBuilder()
				.setCustomId('game-' + index)
				.setLabel('Game ' + (parseInt(index) + 1) + ': ' + gameName)
				.setStyle('Secondary');
			gameButtons.push(gameButton);
		}

		// There are 8 games, so we need to split the buttons into 2 rows
		const gameButtons1 = gameButtons.slice(0, 4);
		const gameButtons2 = gameButtons.slice(4, 8);

		// Add the buttons to the reply object
		reply.components = [new ActionRowBuilder().addComponents(gameButtons1)];
		reply.components.push(new ActionRowBuilder().addComponents(gameButtons2));

		// when a event or game button is pressed, update the embed
		const filter = i => i.user.id === interaction.user.id && (i.customId === 'event' || i.customId.startsWith('game-')) && i.message.interaction.id === interaction.id;
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
		collector.on('collect', async i => {
			// If the button was not pressed by the user who created the embed, send an ephemeral message
			if (i.user.id !== interaction.user.id) {
				i.reply({ content: 'You cannot use this button. This embed was not created by you.', ephemeral: true });
				return;
			}
			// If the event button is pressed, update the embed to show the event rundown
			if (i.customId === 'event') {
				reply.embeds[0].fields[0] = teamPlacementsField;
				reply.embeds[0].fields[1] = individualScoresField;
				reply.embeds[0].fields.splice(2, 1);
				reply.embeds[0].title = `MCC ${interaction.options.getString('event')} Event Score Rundown`;
				reply.embeds[0].description = '';
				reply.components = [new ActionRowBuilder().addComponents(gameButtons1), new ActionRowBuilder().addComponents(gameButtons2)];
				try {
					await i.update({ embeds: [reply.embeds[0]], components: reply.components });
				}
				catch (error) {
					console.error(error);
				}
				return;
			}
			// If a game button is pressed, update the embed to show the game history
			if (!i.customId.startsWith('game-')) return;
			const index = parseInt(i.customId.replace('game-', ''));
			const gameName = history[index].game.replace('MG_', '').replace(/_/g, ' ');
			const gameScores = history[index].gameScores;
			const eventScores = history[index].eventScores;
			const individualScoresAfterGame = history[index].individualScores;

			// If gameScores is undefined, the game has not been recorded
			if (gameScores === undefined) {
				reply.embeds[0].title = `MCC ${interaction.options.getString('event')} Event Score Rundown (Game ${parseInt(index) + 1} - ${gameName})`;
				reply.embeds[0].description = 'This game has not been recorded yet.';
				reply.embeds[0].fields = [];
				reply.components = [new ActionRowBuilder().addComponents(eventButton), new ActionRowBuilder().addComponents(gameButtons1), new ActionRowBuilder().addComponents(gameButtons2)];
				try {
					await i.update({ embeds: [reply.embeds[0]], components: reply.components });
				}
				catch (error) {
					console.error(error);
				}
				return;
			}

			// Create the team game placements string
			let teamGamePlacementsString = '';
			let orderedTeams = [];
			for (const team in gameScores) {
				orderedTeams.push(team);
			}
			orderedTeams = orderedTeams.sort((a, b) => gameScores[b] - gameScores[a]);

			// Loop through the teams and add them to the team game placements string
			for (const team of orderedTeams) {
				const teamEmote = interaction.client.emojis.cache.find(emoji => emoji.name === teamIcons[teams.indexOf(team)]);
				teamGamePlacementsString += `${orderedTeams.indexOf(team) + 1}. ${teamEmote} ${teamDisplayNames[teams.indexOf(team)]} - ${gameScores[team]} coins\n`;
			}

			// Create the team event placements string
			let teamEventPlacementsString = '';
			orderedTeams = [];
			for (const team in eventScores) {
				orderedTeams.push(team);
			}
			orderedTeams = orderedTeams.sort((a, b) => eventScores[b] - eventScores[a]);

			// Loop through the teams and add them to the team event placements string
			for (const team of orderedTeams) {
				const teamEmote = interaction.client.emojis.cache.find(emoji => emoji.name === teamIcons[teams.indexOf(team)]);
				teamEventPlacementsString += `${orderedTeams.indexOf(team) + 1}. ${teamEmote} ${teamDisplayNames[teams.indexOf(team)]} - ${eventScores[team]} coins\n`;
			}

			// Get top 10 individual scores
			const top10IndividualScoresAfterGame = Object.keys(individualScoresAfterGame).sort((a, b) => individualScoresAfterGame[b] - individualScoresAfterGame[a]).slice(0, 10);
			// Create the individual scores string
			let individualScoresAfterGameString = '';
			for (const player of top10IndividualScoresAfterGame) {
				const playerTeam = Object.keys(creators).find(team => creators[team].includes(player));
				const playerEmote = interaction.client.emojis.cache.find(emoji => emoji.name === teamIcons[teams.indexOf(playerTeam)]);
				individualScoresAfterGameString += `${top10IndividualScoresAfterGame.indexOf(player) + 1}. ${playerEmote} ${player} - ${individualScoresAfterGame[player]} coins\n`;
			}

			// replace the embed fields with the game history
			reply.embeds[0].title = `MCC ${interaction.options.getString('event')} Event Score Rundown (Game ${parseInt(index) + 1} - ${gameName})`;
			reply.embeds[0].description = '';
			reply.embeds[0].fields = [{
				name: 'Team Placements (Game)',
				value: teamGamePlacementsString,
				inline: false,
			},
			{
				name: 'Team Placements (Event)',
				value: teamEventPlacementsString,
				inline: false,
			},
			{
				name: 'Individual Scores (After Game)',
				value: individualScoresAfterGameString,
				inline: false,
			}];
			reply.components = [new ActionRowBuilder().addComponents(eventButton), new ActionRowBuilder().addComponents(gameButtons1), new ActionRowBuilder().addComponents(gameButtons2)];
			try {
				await i.update({ embeds: [reply.embeds[0]], components: reply.components });
			}
			catch (error) {
				console.error(error);
			}
			return;
		});
		collector.on('end', async () => {
			// If the collector ends, remove the buttons
			reply.components = [];
			try {
				await interaction.editReply({ embeds: [reply.embeds[0]], components: reply.components });
			}
			catch (error) {
				console.error(error);
			}
		});

		// Send the embed
		await interaction.editReply(reply);
	},
};
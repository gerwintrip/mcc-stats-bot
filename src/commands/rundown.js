const { SlashCommandBuilder } = require('discord.js');

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
				title: `MCC ${interaction.options.getString('event')} Score Rundown`,
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

		// Extracting data from the rundownData object
		const eventPlacements = rundownData['eventPlacements'];
		const individualScores = rundownData['individualScores'];
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

		// Sending the reply message
		return interaction.reply(reply);
	},
};
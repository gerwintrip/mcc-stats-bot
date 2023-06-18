const { SlashCommandBuilder } = require('discord.js');

const { getRundown, getEvent } = require('../handlers/datahandler.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rundown')
		.setDescription('Shows the score rundown for an event.')
		.addStringOption(option =>
			option.setName('event')
				.setDescription('The event to show the rundown for.')
				.setRequired(false)),
	async execute(interaction) {
		const rundownData = interaction.options.getString('event') !== null ? await getRundown(interaction.options.getString('event')) : await getRundown('');
		const teams = ['RED', 'ORANGE', 'YELLOW', 'LIME', 'GREEN', 'CYAN', 'AQUA', 'BLUE', 'PURPLE', 'PINK'];
		const teamDisplayNames = ['Red Rabbits', 'Orange Ocelots', 'Yellow Yaks	', 'Lime Llamas', 'Green Geckos', 'Cyan Coyotes', 'Aqua Axolotls', 'Blue Bats', 'Purple Pandas', 'Pink Parrots'];
		const teamIcons = ['team_red', 'team_orange', 'team_yellow', 'team_lime', 'team_green', 'team_cyan', 'team_aqua', 'team_blue', 'team_purple', 'team_pink'];
		let reply;
		if (interaction.options.getString('event') == null) {
			const eventData = await getEvent();
			const eventDate = new Date(eventData['date']);
			reply = {
				embeds: [{
					title: `MCC ${eventData['event']} Score Rundown`,
					color: 0xff0000,
					thumbnail: {
						url: 'https://mcc.live/favicon.png',
					},
					description: Date.now() < eventDate ? `MCC ${eventData['event']} will happen on <t:${Math.floor(eventDate.getTime() / 1000)}:f>.\n` : `MCC ${eventData['event']} happened on <t:${Math.floor(eventDate.getTime() / 1000)}:f>.\n`,
					fields: [],
					footer: {
						text: 'Data provided by the official MCC Event API - Bot not affiliated with Noxcrew or MCC.',
						icon_url: 'https://noxcrew.com/favicon.ico',
					},
				}],
			};
		}
		else {
			if (rundownData == null) {
				return interaction.reply({ content : 'That event does not exist! Examples of valid event values are: \'14\', \'30\', \'P23\'.', ephemeral: true });
			}
			reply = {
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
		}
		const eventPlacements = rundownData['eventPlacements'];
		const teamScores = rundownData['eventScores'];
		const dodgeboltData = rundownData['dodgeboltData'];
		const dodgeboltWinner = Object.keys(dodgeboltData).reduce((a, b) => dodgeboltData[a] > dodgeboltData[b] ? a : b);
		const crownEmote = interaction.client.emojis.cache.find(emoji => emoji.name === '_crown');
		const teamsByPlacement = [];
		for (const team in eventPlacements) {
			teamsByPlacement[eventPlacements[team]] = team;
		}
		let teamPlacementsString = '';
		for (const placement in teamsByPlacement) {
			const teamName = teamsByPlacement[placement];
			const teamEmote = interaction.client.emojis.cache.find(emoji => emoji.name === teamIcons[teams.indexOf(teamName)]);
			teamPlacementsString += dodgeboltWinner === teamName ? `${placement}. ${teamEmote} ${teamDisplayNames[teams.indexOf(teamName)]} - ${teamScores[teamName]} coins (${crownEmote})\n` : `${placement}. ${teamEmote} ${teamDisplayNames[teams.indexOf(teamName)]} - ${teamScores[teamName]} coins\n`;
		}
		reply.embeds[0].fields.push({
			name: 'Event Placements',
			value: teamPlacementsString,
			inline: true,
		});
		return interaction.reply(reply);
	},
};
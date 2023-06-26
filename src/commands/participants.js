const { SlashCommandBuilder } = require('discord.js');

const { getParticipants, getEvent } = require('../handlers/datahandler.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('participants')
		.setDescription('Shows the participants of the current event cycle.'),
	async execute(interaction) {
		const eventData = await getEvent();
		const participantsData = await getParticipants('');
		const teams = ['RED', 'ORANGE', 'YELLOW', 'LIME', 'GREEN', 'CYAN', 'AQUA', 'BLUE', 'PURPLE', 'PINK'];
		const teamDisplayNames = ['Red Rabbits', 'Orange Ocelots', 'Yellow Yaks', 'Lime Llamas', 'Green Geckos', 'Cyan Coyotes', 'Aqua Axolotls', 'Blue Bats', 'Purple Pandas', 'Pink Parrots'];
		const teamIcons = ['team_red', 'team_orange', 'team_yellow', 'team_lime', 'team_green', 'team_cyan', 'team_aqua', 'team_blue', 'team_purple', 'team_pink'];
		const eventDate = new Date(eventData['date']);
		const reply = {
			embeds: [{
				title: `MCC ${eventData['event']} Participants`,
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
		for (const team in teams) {
			const teamName = teams[team];
			const teamData = participantsData[teamName];
			let teamString = '';
			for (const participant in teamData) {
				const participantData = teamData[participant];
				participantData.username = participantData.username.replace(/_/g, '\\_');
				teamString += `${participantData.username} ([↗](${participantData.stream}))\n`;
			}
			const teamEmote = interaction.client.emojis.cache.find(emoji => emoji.name === teamIcons[team]);
			reply.embeds[0].fields.push({
				name: '<:' + teamEmote.name + ':' + teamEmote.id + '> ' + teamDisplayNames[team],
				value: teamString,
				inline: true,
			});
		}
		return interaction.reply(reply);
	},
};
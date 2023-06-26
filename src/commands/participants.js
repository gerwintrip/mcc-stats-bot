const { SlashCommandBuilder } = require('discord.js');

const { getParticipants, getEvent } = require('../handlers/datahandler.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('participants')
		.setDescription('Shows the participants of the current event cycle.'),

	async execute(interaction) {
		// Retrieving the current event data and participants data
		const eventData = await getEvent();
		const participantsData = await getParticipants('');

		// Arrays containing team names, display names, and icons
		const teams = ['RED', 'ORANGE', 'YELLOW', 'LIME', 'GREEN', 'CYAN', 'AQUA', 'BLUE', 'PURPLE', 'PINK'];
		const teamDisplayNames = ['Red Rabbits', 'Orange Ocelots', 'Yellow Yaks', 'Lime Llamas', 'Green Geckos', 'Cyan Coyotes', 'Aqua Axolotls', 'Blue Bats', 'Purple Pandas', 'Pink Parrots'];
		const teamIcons = ['team_red', 'team_orange', 'team_yellow', 'team_lime', 'team_green', 'team_cyan', 'team_aqua', 'team_blue', 'team_purple', 'team_pink'];

		// Creating a date object from the event date string
		const eventDate = new Date(eventData['date']);

		// Creating an object containing the reply message
		const reply = {
			embeds: [{
				title: `MCC ${eventData['event']} Participants`,
				color: 0xff0000,
				thumbnail: {
					url: 'https://mcc.live/favicon.png',
				},
				// Embed description based on whether the event has happened or not
				description: Date.now() < eventDate ? `MCC ${eventData['event']} will happen on <t:${Math.floor(eventDate.getTime() / 1000)}:f>.\n` : `MCC ${eventData['event']} happened on <t:${Math.floor(eventDate.getTime() / 1000)}:f>.\n`,
				fields: [],
				footer: {
					text: 'Data provided by the official MCC Event API - Bot not affiliated with Noxcrew or MCC.',
					icon_url: 'https://noxcrew.com/favicon.ico',
				},
			}],
		};

		// Looping through each team and adding their participants to the embed fields array
		for (const team in teams) {
			const teamName = teams[team];
			const teamData = participantsData[teamName];
			let teamString = '';
			for (const participant in teamData) {
				const participantData = teamData[participant];
				// Escaping underscores in participant usernames
				participantData.username = participantData.username.replace(/_/g, '\\_');
				teamString += `${participantData.username} ([↗](${participantData.stream}))\n`;
			}
			// Finding the team icon emoji and adding the team field to the embed fields array
			const teamEmote = interaction.client.emojis.cache.find(emoji => emoji.name === teamIcons[team]);
			reply.embeds[0].fields.push({
				name: '<:' + teamEmote.name + ':' + teamEmote.id + '> ' + teamDisplayNames[team],
				value: teamString,
				inline: true,
			});
		}

		// Sending the reply message
		return interaction.reply(reply);
	},
};
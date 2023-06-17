const { SlashCommandBuilder } = require('discord.js');
const { inviteUrl } = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Replies with info about the bot.'),
	async execute(interaction) {
		const reply = {
			embeds: [{
				title: 'MCC Stats Bot',
				color: 0xff0000,
				thumbnail: {
					url: 'https://mcc.live/favicon.png',
				},
				description: 'This bot is a bot that displays information and statisctics about the current and previous MCC event cycle. It is not affiliated with Noxcrew or MCC.',
				fields: [
					{
						name: 'Developer',
						value: 'This bot was developed by GerwinT',
					},
					{
						name: 'Invite',
						value: `[Invite the bot to your server](${inviteUrl})`,
						inline: false,
					},
				],
				footer: {
					text: 'Data provided by the official MCC Event API - Bot not affiliated with Noxcrew or MCC.',
					icon_url: 'https://noxcrew.com/favicon.ico',
				},
			}],
		};
		return interaction.reply(reply);
	},
};
# MCC Stats Discord Bot
This is a Discord bot designed to provide statistics from the Minecraft event [Minecraft Championships](https://mcchampionship.com/) made by [Noxcrew](https://noxcrew.com). It is built using [Discord.js](https://discord.js.org/) and [Node.js](https://nodejs.org/).

## Installation

This project is made using Node.js and requires Node.js to be installed on your system. You can download Node.js from the [official website](https://nodejs.org/). You will also need to have a Discord bot token and client id. See the [Discord](#discord) section for more information. This project was built with Node.js version 20.3.1 and Discord.js version 14.11.0. It is recommended to use these versions or newer.
To install the bot, clone this repository and run `npm install` to install the required dependencies. You will also need to create a `.env` file with your Discord bot token and client id. There is an `.env.example` file available to easily fill in that information. You will also need to have Redis installed and running on your system to run the bot. See the [Redis](#redis) section for more information. 

### Discord

To use this bot, you will need to create a Discord bot and add it to your server. You can create a Discord bot by following the [official guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot). You will also need to add the bot to your server. You can do this by following the [official guide](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links). Once you have created your bot and added it to your server, you will need to copy the bot token and client id. You can then configure the Discord connection settings in the `.env` file.

### Redis

This project also includes integration with Redis cache to improve performance and reduce the number of API requests made to the Minecraft Championships website. To use Redis cache, you will need to have Redis installed and running on your system. You can then configure the Redis connection settings in the `.env` file.

## Usage

To start the bot, run `npm start` in your terminal. The bot will automatically connect to your Discord server and begin listening for commands.

## Commands

The following commands are currently available:

- `/info`: Displays info about the bot
- `/participants`: Displays the participants of the most recent or upcoming event
- `/rundown <event>`: Displays the score rundown of the specified event

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request. All contributions are welcome!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

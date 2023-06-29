const axios = require('axios');
const Redis = require('ioredis');
const { apiUrl } = require('../config.json');

const eventEndpoint = `${apiUrl}/event`;
const participantsEndpoint = (team) => team == '' ? `${apiUrl}/participants` : `${apiUrl}/participants/${team}`;
const rundownEndpoint = (event) => event == '' ? `${apiUrl}/rundown` : `${apiUrl}/rundown/${event}`;

const redis = new Redis(
	{
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
		password: process.env.REDIS_PASSWORD,
	},
);


/*
 * Gets the event data of the current event cycle from the API.
 * @returns {Object} The event data.
 * @returns {null} If the API request failed.
*/
async function getEvent() {
	let cachedEvent = await redis.get('event');

	if (cachedEvent) {
		cachedEvent = JSON.parse(cachedEvent);
		return { ...cachedEvent, 'source': 'cache' };
	}

	const apiResponse = await axios.get(eventEndpoint);
	if (apiResponse.status != 200) {
		console.error(`Error getting event: ${apiResponse.status} ${apiResponse.statusText}`);
		return null;
	}
	redis.set('event', JSON.stringify(apiResponse.data['data']), 'EX', 300);
	const eventData = apiResponse.data['data'];
	return { ...eventData, 'source': 'API' };
}

/*
 * Gets the participants data of the current event cycle from the API.
 * @param {string} team The team to get the participants of.
 * @returns {Object} The participants data.
 * @returns {null} If the API request failed.
*/
async function getParticipants(team) {
	let cachedParticipants;
	if (team == '') {
		cachedParticipants = await redis.get('participants');
	}
	else {
		cachedParticipants = await redis.get(`participants:${team}`);
	}

	if (cachedParticipants) {
		cachedParticipants = JSON.parse(cachedParticipants);
		return { ...cachedParticipants, 'source': 'cache' };
	}

	const apiResponse = await axios.get(participantsEndpoint(team));
	if (apiResponse.status != 200) {
		console.error(`Error getting participants: ${apiResponse.status} ${apiResponse.statusText}`);
		return null;
	}
	if (team == '') {
		redis.set('participants', JSON.stringify(apiResponse.data['data']), 'EX', 300);
	}
	else {
		redis.set(`participants:${team}`, JSON.stringify(apiResponse.data['data']), 'EX', 300);
	}
	const participantsData = apiResponse.data['data'];
	return { ...participantsData, 'source': 'API' };
}

/*
	* Gets the rundown data of a specified event cycle from the API.
	* @param {string} event The event to get the rundown of.
	* @returns {Object} The rundown data.
	* @returns {null} If the API request failed.
	* @returns {null} If the event is not found.
*/
async function getRundown(event) {
	let cachedRundown;
	if (event == '') {
		cachedRundown = await redis.get('rundown');
	}
	else {
		cachedRundown = await redis.get(`rundown:${event}`);
	}

	if (cachedRundown) {
		cachedRundown = JSON.parse(cachedRundown);
		return { ...cachedRundown, 'source': 'cache' };
	}

	const apiResponse = await axios.get(rundownEndpoint(event));
	if (apiResponse.status != 200) {
		console.error(`Error getting rundown: ${apiResponse.status} ${apiResponse.statusText}`);
		return null;
	}
	if (event == '') {
		redis.set('rundown', JSON.stringify(apiResponse.data['data']), 'EX', 300);
	}
	else {
		redis.set(`rundown:${event}`, JSON.stringify(apiResponse.data['data']), 'EX', 300);
	}
	const rundownData = apiResponse.data['data'];
	return { ...rundownData, 'source': 'API' };
}


module.exports = {
	getEvent,
	getParticipants,
	getRundown,
};

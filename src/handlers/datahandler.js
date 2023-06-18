const axios = require('axios');
const { apiUrl } = require('../config.json');

const eventEndpoint = `${apiUrl}/event`;
const participantsEndpoint = (team) => team == '' ? `${apiUrl}/participants` : `${apiUrl}/participants/${team}`;
const rundownEndpoint = (event) => event == '' ? `${apiUrl}/rundown` : `${apiUrl}/rundown/${event}`;

/*
 * Gets the event data of the current event cycle from the API.
 * @returns {Object} The event data.
 * @returns {null} If the API request failed.
*/
async function getEvent() {
	const apiResponse = await axios.get(eventEndpoint);
	if (apiResponse.status != 200) {
		console.error(`Error getting event: ${apiResponse.status} ${apiResponse.statusText}`);
		return null;
	}
	const eventData = apiResponse.data['data'];
	return eventData;
}

/*
 * Gets the participants data of the current event cycle from the API.
 * @param {string} team The team to get the participants of.
 * @returns {Object} The participants data.
 * @returns {null} If the API request failed.
*/
async function getParticipants(team) {
	const apiResponse = await axios.get(participantsEndpoint(team));
	if (apiResponse.status != 200) {
		console.error(`Error getting participants: ${apiResponse.status} ${apiResponse.statusText}`);
		return null;
	}
	const participantsData = apiResponse.data['data'];
	return participantsData;
}

async function getRundown(event) {
	const apiResponse = await axios.get(rundownEndpoint(event));
	if (apiResponse.status != 200) {
		console.error(`Error getting rundown: ${apiResponse.status} ${apiResponse.statusText}`);
		return null;
	}
	const rundownData = apiResponse.data['data'];
	return rundownData;
}


module.exports = {
	getEvent,
	getParticipants,
	getRundown,
};

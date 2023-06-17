const axios = require('axios');
const { apiUrl } = require('../config.json');

const eventEndpoint = `${apiUrl}/event`;
const participantsEndpoint = (team) => team == '' ? `${apiUrl}/participants` : `${apiUrl}/participants/${team}`;

async function getEvent() {
	const apiResponse = await axios.get(eventEndpoint);
	if (apiResponse.status != 200) {
		console.error(`Error getting event: ${apiResponse.status} ${apiResponse.statusText}`);
		return null;
	}
	const eventData = apiResponse.data['data'];
	return eventData;
}

async function getParticipants(team) {
	const apiResponse = await axios.get(participantsEndpoint(team));
	if (apiResponse.status != 200) {
		console.error(`Error getting participants: ${apiResponse.status} ${apiResponse.statusText}`);
		return null;
	}
	const participantsData = apiResponse.data['data'];
	return participantsData;
}


module.exports = {
	getEvent,
	getParticipants,
};

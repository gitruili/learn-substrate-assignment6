import '@polkadot/api-augment';
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";

const WEB_SOCKET = 'ws://localhost:9944';

// connect to substrate chain
const connectSubstrate = async () => {
	const wsProvider = new WsProvider(WEB_SOCKET);
	const api = await ApiPromise.create({ provider: wsProvider, types: {} });
	await api.isReady;
	console.log('connection to substrate is OK');
	return api;
}

const main = async () => {
	const api  = await connectSubstrate();

	// Subscribe to system events via storage
	api.query.system.events((events) => {
	console.log(`\nReceived ${events.length} events:`);

	// Loop through the Vec<EventRecord>
	events.forEach((record) => {
		// Extract the phase, event and the event types
		const { event, phase } = record;
		const types = event.typeDef;

		// Show what we are busy with
		console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
		console.log(`\t\t${event.meta.docs.toString()}`);

		// Loop through each of the parameters, displaying the type and data
		event.data.forEach((data, index) => {
			console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
			});
		});
	});

	console.log('game over');
}

// always listen , until kill the process
main()
	// .then(() => {
	// 	console.log('successfully exited');
	// 	process.exit(0);
	// })
	.catch(err => {
		console.log('error occour', err);
		process.exit(1);
	})


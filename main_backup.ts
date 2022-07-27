import '@polkadot/api-augment';
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { KeyringPair } from '@polkadot/keyring/types';
import { metadata } from "@polkadot/types/interfaces/essentials";

const WEB_SOCKET = 'ws://localhost:9944';
const sleep = (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms));

// connect to substrate chain
const connectSubstrate = async () => {
	const wsProvider = new WsProvider(WEB_SOCKET);
	const api = await ApiPromise.create({ provider: wsProvider, types: {} });
	await api.isReady;
	console.log('connection to substrate is OK');
	return api;
}

// get const value
const getConst = async (api: ApiPromise) => {
	const existentialDeposit = await api.consts.balances.existentialDeposit.toHuman();
	return existentialDeposit;
}

// get free balance variable
const getFreeBalance = async (api: ApiPromise, address: string) => {
	const aliceAccount = await api.query.system.account(address);
	return aliceAccount["data"]["free"].toHuman();
}

const printAliceBobBalance = async (api: ApiPromise) => {
	const keyring = new Keyring({ type: 'sr25519' });
	const alice = keyring.addFromUri('//Alice');
	const bob = keyring.addFromUri('//Bob');
	console.log('alice balance is:', await getFreeBalance(api, alice.address))
	console.log('bob balance is:', await getFreeBalance(api, bob.address))
}

// submit a transfer transaction
const transferFromAliceToBob = async (api: ApiPromise, amount: number) => {
	const keyring = new Keyring({ type: 'sr25519'});
	const alice = keyring.addFromUri('//Alice');
	const bob = keyring.addFromUri('//Bob');
	await api.tx.balances.transfer(bob.address, amount)
		.signAndSend(alice, res => {
			console.log(`Tx statu: ${res.status}`);
		});
}

const main = async () => {
	const api  = await connectSubstrate();
	// console.log("const value existentialDeposit is:", await getConst(api))

	// await printAliceBobBalance(api);
	// await transferFromAliceToBob(api, 10 ** 12);
	// await sleep(6000);

	// await printAliceBobBalance(api);

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
		//   console.log(`\t\t${event.meta.documentation.toString()}`);
	
		  // Loop through each of the parameters, displaying the type and data
		  event.data.forEach((data, index) => {
			console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
		  });
		});
	  });

	console.log('game over');
}

main()
	// .then(() => {
	// 	console.log('successfully exited');
	// 	process.exit(0);
	// })
	.catch(err => {
		console.log('error occour', err);
		process.exit(1);
	})


import "reflect-metadata";
import { Intents, Interaction, Message, User } from "discord.js";
import { Client } from "discordx";
import { dirname, importx } from "@discordx/importer";
import dotenv from "dotenv"
import mysql from "mysql"

const connection = mysql.createPool({
	host     :  process.env.MYSQL_HOST,
	user     : 'root',
	password : 'secret',
	database : 'botdb'
});

const client = new Client({
  simpleCommand: {
    prefix: "!",
  },
  intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES ],
  // If you only want to use global commands only, comment this line
  botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
  silent: true,
});

client.once("ready", async () => {
	// make sure all guilds are in cache
	await client.guilds.fetch();

	// init all application commands
	await client.initApplicationCommands({
		guild: { log: true },
		global: { log: true },
	});

	// init permissions; enabled log to see changes
	await client.initApplicationPermissions(true);

	// uncomment this line to clear all guild commands,
	// useful when moving to global commands from guild commands
	//  await client.clearApplicationCommands(
	//    ...client.guilds.cache.map((g) => g.id)
	//  );

	// connection.connect(() => {
	try {
		connection.query(`
			CREATE TABLE IF NOT EXISTS users (
				id        bigint,
				username  text NOT NULL,
				money     int,
				xp        float(18),
				level     int
			)
		`, function (error) {
			if (error) return error;
		});
	} catch (error) {
		console.log("ERR AT (ONCE READY):: ", error);
	}	
	// });	

	console.log("🎉 Bot started");
});

client.on("interactionCreate", (interaction: Interaction) => {
  client.executeInteraction(interaction);
});

client.on("messageCreate", (message: Message) => {
  client.executeCommand(message);
});

client.on("messageCreate", (message: Message) => {
	// console.log(`NEW MESSAGE FROM ${message.author.username}:: ${message.content}`);

	// Run a query to check if the user exists currently.
	connection.query(`SELECT * FROM users WHERE id = ${message.author.id}`, (err, res) => {
		if(err) { console.log(`ERR AT (SEL USR):: ${err}`); return; }

		// If they don't exist, create the user and initialize with a default value of 0.
		if(res == [] || !res || Object.entries(res).length === 0) {
			console.log("User does not exist!");
			connection.query(`INSERT INTO users (id, username, money, xp, level) VALUES (${message.author.id}, '${message.author.username}', 0, 0, 0)`, (e, r) => {
				if(e) { console.log(`ERR AT (ALT USR):: ${e}`); return; }
				console.log(`User ${message.author.username} Created!`);

				// Give them the XP worth the amount of which they sent. 
				handoutXP(message.cleanContent.length, message.author, res);
			});
		}

		// If they DO exist, we increment their xp by x*k amount, determined by the length of their message and a modifier
		else {
			handoutXP(message.cleanContent.length, message.author, res);
		}
	});
});

const handoutXP = (message_length: number, author: User, res: any) => {
	const xp_gained = message_length * 0.01;
	const level = determineLevel(res, xp_gained);

	connection.query(`UPDATE users SET xp = xp + ${xp_gained}, level = ${level ? level : 0} WHERE id = ${author.id}`, (e, r) => {
		if(e) { console.log(`ERR AT (UPD USR):: ${e}`); return; }
		console.log(`User ${author.username} Updated!`, r);
	});
}

const determineLevel = (data: any, xp_gained: number) => {
	console.log(data[0], data);
	const xp = xp_gained;
	const level = Math.floor(Math.pow(xp, 0.5));
	return level;
}

dotenv.config();

async function run() {
  await importx(dirname(import.meta.url) + "/{events,commands}/**/*.{ts,js}");

  client.login(process.env.BOT_TOKEN ?? "");
}

run();
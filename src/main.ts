import "reflect-metadata";
import { Intents, Interaction, Message } from "discord.js";
import { Client } from "discordx";
import { dirname, importx } from "@discordx/importer";
import dotenv from "dotenv"
import mysql from "mysql"

const connection = mysql.createConnection({
	host     :  process.env.MYSQL_HOST,
	user     : 'root',
	password : 'secret',
	database : 'bot-db'
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

	connection.connect();

	connection.query(`CREATE TABLE users (
		id        uuid,
		username  varchar(255),
		money     int,
		xp        int,
		level     int
	)`, function (error, results, fields) {
		if (error) throw error;
		console.log('The solution is: ', results[0].solution);
	});
	
	console.log("Bot started");
});

client.on("interactionCreate", (interaction: Interaction) => {
  client.executeInteraction(interaction);
});

client.on("messageCreate", (message: Message) => {
  client.executeCommand(message);
});

client.on("messageCreate", (message: Message) => {
	// Run a query to check if the user exists currently.
	connection.query(`SELECT * FROM users WHERE id ==${message.author.id}`, (err, res) => {
		if(err) { console.log(`ERR: ${err}`); return; }
		else console.log(res);

		// If they don't exist, create the user and initialize with a default value of 0.
		if(!res) {
			console.log("User does not exist!");
			connection.query(`ALTER TABLE users; ADD ${message.author.id} ${message.author.username} 0 0 0`, (e,r) => {
				if(e) { console.log(e); return; }
				console.log(`User ${message.author.username} Created!`);
			});
		}
		// If they DO exist, we increment their xp by x amount, determined by the length of their message.
		else {
			
		}
	});
	

});

dotenv.config();

async function run() {
  await importx(dirname(import.meta.url) + "/{events,commands}/**/*.{ts,js}");

  client.login(process.env.BOT_TOKEN ?? "");
}

run();
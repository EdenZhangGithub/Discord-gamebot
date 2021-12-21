import { Client, Collection, Message, TextChannel, Intents, GuildManager, GuildMember } from "discord.js";
import dotenv from "dotenv";
import {readdir} from "fs";
import config from "./config";

export interface runEvent {
    message: Message,
    client: Client,
    args: string[],
    dev: boolean,
    author: GuildMember | undefined
}

dotenv.config();

// Determine if the environment is a development environment, assign the client and the commands collection.
const dev = process.env.NODE_ENV === "dev",
    client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES ] }),
    commands: Collection<string[], (event: runEvent) => any> = new Collection();

// Search and read the commands directory for all program files within (.js/.ts)
readdir('./commands/', (err, allFiles) => {
    if (err) console.log(err);

    // Create an array of all files in the folder that are .js or .ts
    const files = allFiles.filter(f => f.split('.').pop() === (dev ? 'ts' : 'js'));

    // If there are no commands, exit - otherwise enter them all into the commands collection. 
    if (files.length <= 0) console.log('No commands found!');
    else for(let file of files) {
        const props = require(`./commands/${file}`) as {names: string[], run: (event: runEvent) => any};
        commands.set(props.names, props.run);
    }
});

client.once("ready", () => {
   console.log(`Logged in as ${client?.user?.tag}`);
});

if(dev) 
    client.on('debug', (e) => {
        console.log(e);
    });

client.on("message", async message => {
    // If message not in server, or bot send message, or is a message to ignore - ignore it.
    if(message.channel.type === "DM" || message.author.bot || !message.content.startsWith(config.prefix)) return;

    // Determine the message's author
    const author = await message?.guild?.members.fetch(message.author);

    // Split command arguments
    const args = message.content.split(/ +/);
    if(args.length < 1) return;

    // Get the command as a string
    const command = args.shift()!.toLowerCase().slice(config.prefix.length);
    const commandFile = commands.find((r, n) => n.includes(command));

    // Run the command file passing in the message, arguments, client and dev environment boolean.
    if(!commandFile) return;
    else commandFile({
        message,
        args,
        client,
        dev,
        author
    });
});

// client.on('raw', (packet: { t: string; d: { channel_id: string; message_id: string; emoji: { id: string; name: string; }; user_id: string; }; }) => {
//     // 
//     if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;

//     // Get the client channel of the packet
//     const channel = client.channels.get(packet.d.channel_id) as TextChannel;

//     // 
//     if (channel.messages.has(packet.d.message_id)) return;
//     channel.fetchMessage(packet.d.message_id).then(message => {
//         const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
//         const reaction = message.reactions.get(emoji);
//         if (reaction) reaction.users.set(packet.d.user_id, client.users.get(packet.d.user_id)!);
//         if (packet.t === 'MESSAGE_REACTION_ADD') {
//             client.emit('messageReactionAdd', reaction, client.users.get(packet.d.user_id));
//         }
//         if (packet.t === 'MESSAGE_REACTION_REMOVE') {
//             client.emit('messageReactionRemove', reaction, client.users.get(packet.d.user_id));
//         }
//     });
// });

// client.on('interactionCreate', async (interaction: any) => {
// 	if (!interaction.isCommand()) return;

//     interaction.commandName += "-int";

// 	const command = commands.get(interaction.commandName);

// 	if (!command) return;

// 	try {
// 		await command(interaction);
// 	} catch (error) {
// 		console.error(error);
// 		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
// 	}
// });


if(process.env.TOKEN) client.login(process.env.TOKEN);
else { console.error("Create a file called .env and put your bot's token in there."); process.exit(1); }

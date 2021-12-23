import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, MetadataStorage, Slash } from "discordx";
import { Pagination } from "@discordx/utilities";
import connection from "../db.js"

@Discord()
export abstract class UserProfile {
	@Slash("profile", { description: "Displays your profile" })
	async pages(interaction: CommandInteraction): Promise<void> {
		connection.query(`SELECT * FROM users WHERE id = ${interaction.user.id}`, (err, res) => {
			if(err) { console.log("ERR AT (SEL USR FROM PROF)::", err); return; }
			
			const data = res[0];
			const embed = new MessageEmbed()
				.setFooter(`PROFILE FOR ${data.id}`)
				.setTitle(`**${data.username}'s Profile**`)
				.addFields(
					{ name: "XP", 		value: `${data.xp}` 		?? "\u200B", inline: true },
					{ name: "Money", 	value: `${data.money}` 		?? "\u200B", inline: true },
					{ name: "Level", 	value: `${data.level}` 		?? "\u200B", inline: true },
				);

			interaction.reply({
				embeds: [ embed ]
			});
		});
	}
}
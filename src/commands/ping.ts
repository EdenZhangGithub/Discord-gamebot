import {runEvent} from "../main";
import { SlashCommandBuilder } from "@discordjs/builders"

export function run(e: runEvent) {
    e.message.reply(`Pong! Current ping is ${Date.now() - e.message.createdTimestamp}`);
}

export const names = ["ping"];
export const data = new SlashCommandBuilder()
                        .setName('ping')
                        .setDescription('Replies with the Ping Delay!')
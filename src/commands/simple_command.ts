// import {
//   Discord,
//   SimpleCommand,
//   SimpleCommandMessage,
//   SimpleCommandOption,
// } from "discordx";

// @Discord()
// class simpleCommandExample {
//   /*
//     A 'SimpleCommand' is one that exists purely in a textual form - one that does not appear as a slash command.
//     Predicated by the 'bang' (!) prefix, the first variable being the command after the bang, i.e. here !hello (or the alias !hi).
//     After, calls the hello() function which replies to the commands message with a wave and a ping.
//   */
//   @SimpleCommand("hello", { aliases: ["hi"] })
//   hello(command: SimpleCommandMessage) {
//     command.message.reply(`👋 ${command.message.member}`);
//   }

//   @SimpleCommand("sum", { argSplitter: "+" })
//   sum(
//     @SimpleCommandOption("num1", { type: "NUMBER" }) num1: number | undefined,
//     @SimpleCommandOption("num2", { type: "NUMBER" }) num2: number | undefined,
//     command: SimpleCommandMessage
//   ) {
//     if (!num1 || !num2) {
//       return command.sendUsageSyntax();
//     }
//     command.message.reply(`total = ${num1 + num2}`);
//   }
// }

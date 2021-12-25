const { MessageEmbed, MessageButton } = require("discord.js");
module.exports = {
  name: "setpointer",
  category: "Settings",
  aliases: ["pointer", "newpointer"],
  usage: "setpointer <newPointer>",
  cooldown: 1,
  description: "Change the default embed pointer of the bot",
  memberpermissions: ["MANAGE_GUILD"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]

  run: async (client, message, args) => {
    try {
    const { member } = message;
    const { guild } = member;
    let color = client.settings.get(message.guild.id, `color`);
	let emoji = client.settings.get(message.guild.id, `emoji`);
	let react = client.settings.get(message.guild.id, `react`);
    let prefix = client.settings.get(message.guild.id, `prefix`);
      if (!args[0]) {
        return message.reply({
          embeds: [
            new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} PLEASE ADD A SERVER EMOJI`)
            .setDescription(`**Usage:** - \`${client.settings.get(guild.id, "prefix")}setpointer <newPointer>\``)
          ],
        })
      }
      let newPointer = args[0];
      client.settings.ensure(guild.id, {
        pointer: "<:bluepointer:897839647034601492>"
      });
      message.react(react);
      client.settings.set(guild.id, newPointer, "pointer");
      let BnewPointer = client.settings.get(guild.id, `pointer`);
      return message.reply({
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} NEW EMBED EMOJI`)
          .setDescription(`Successfully set the embed pointer to ${BnewPointer}\nCheck it out with \`${prefix}play LeXxìv Stay With Me\``)
        ],
      });
    } catch (e) {
    console.log(e)
		message.reply({
		embeds: [
		new MessageEmbed()
		.setColor("#e63064")
		.setTitle("<:errorcode:868245243357712384> AN ERROR OCCURED!")
		.setDescription(`\`\`\`${e.stack.toString().substr(0, 800)}\`\`\``)
		.setFooter("Error in code: Report this error to kotlin0427 or _destroyer_#1574")
		],
		});
    }
  }
}

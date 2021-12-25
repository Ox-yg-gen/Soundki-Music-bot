const { MessageEmbed, MessageButton } = require("discord.js");
module.exports = {
  name: "setemoji",
  category: "Settings",
  aliases: ["emoji", "newemoji"],
  usage: "setemoji <newEmoji>",
  cooldown: 1,
  description: "This changes the default emoji of the bot",
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
      if (!args[0]) {
        return message.reply({
          embeds: [
            new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} PLEASE ADD A SERVER EMOJI`)
            .setDescription(`**Usage:** - \`${client.settings.get(guild.id, "prefix")}setemoji <newEmoji>\``)
          ],
        })
      }
      let newEmoji = args[0];
      client.settings.ensure(guild.id, {
        emoji: "<:bluewaves:891379368037859409>"
      });
      message.react(react);
      client.settings.set(guild.id, newEmoji, "emoji");
      let BnewEmoji = client.settings.get(guild.id, `emoji`);
      return message.reply({
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${BnewEmoji} NEW EMBED EMOJI`)
          .setDescription(`Successfully set the emoji to ${BnewEmoji}`)
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

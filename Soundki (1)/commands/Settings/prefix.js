const { MessageEmbed, MessageButton } = require("discord.js");
const config = require("../../botconfig/config.json");
module.exports = {
  name: "prefix",
  category: "Settings",
  aliases: ["setprefix"],
  usage: "prefix <newPrefix>",
  cooldown: 1,
  description: "Changes the Prefix of the Bot!",
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
            .setTitle(`${emoji} PLEASE ADD A PREFIX`)
            .setDescription(`**Usage:** - \`${client.settings.get(guild.id, "prefix")}prefix <newPrefix>\``)
          ],
        })
      }
      let newPrefix = args[0];
      client.settings.ensure(guild.id, {
        prefix: config.prefix
      });
      message.react(react);
      client.settings.set(guild.id, newPrefix, "prefix");
      return message.reply({
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} NEW PREFIX`)
          .setDescription(`The new Prefix is now \`${newPrefix}\``)
        ],
      })
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

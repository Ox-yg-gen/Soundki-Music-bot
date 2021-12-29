const { MessageEmbed, MessageButton } = require("discord.js");
const config = require(`../../botconfig/config.json`);
module.exports = {
  name: "reset",
  category: "Settings",
  aliases: [],
  usage: "reset",
  cooldown: 10,
  description: "Reset all settings of the bot",
  memberpermissions: ["MANAGE_GUILD"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]

  run: async (client, message, args) => {
    try {
    const { member } = message;
    const { guild } = member;
      client.settings.ensure(guild.id, {
        prefix: config.prefix,
        defaultvolume: 50,
        defaultautoplay: false,
        defaultfilters: [`bassboost6`, `clear`],
        djroles: [],
        color: "#00bfff",
        emoji: "<:bluewaves:891379368037859409>",
        react: "<:bluewaves:891379368037859409>",
        pointer: "<:bluepointer:897839647034601492>"
      });
      let Prefix = config.prefix;
      client.settings.set(guild.id, Prefix, "prefix");
      client.settings.set(guild.id, 50, "defaultvolume");
      client.settings.set(guild.id, false, "defaultautoplay");
      client.settings.set(guild.id, [`bassboost6`, `clear`], "defaultfilters");
      client.settings.set(guild.id, [], "djroles");
      client.settings.set(guild.id, "#00bfff", "color");
      client.settings.set(guild.id, "<:bluewaves:891379368037859409>", "emoji");
      client.settings.set(guild.id, "<:bluewaves:891379368037859409>", "react");
      client.settings.set(guild.id, "<:bluepointer:897839647034601492>", "pointer");
      let emoji = client.settings.get(guild.id, `emoji`);
      let color = client.settings.get(guild.id, `color`);
      return message.reply({
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} RESET COMPLETE`)
          .setDescription(`Successfully reseted all bot settings for this guild`)
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

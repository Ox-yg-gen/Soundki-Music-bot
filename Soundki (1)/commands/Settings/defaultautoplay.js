const { MessageEmbed, MessageButton } = require("discord.js");
module.exports = {
  name: "defaultautoplay",
  category: "Settings",
  aliases: ["dautoplay"],
  usage: "defaultautoplay",
  cooldown: 10,
  description: "Defines if Autoplay should be enabled on default or not!",
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
      client.settings.ensure(guild.id, {
        defaultvolume: 50,
        defaultautoplay: false,
        defaultfilters: [`bassboost6`, `clear`]
      });
      client.settings.set(guild.id, !client.settings.get(guild.id, "defaultautoplay"), "defaultautoplay");
      message.react(react);
      return message.reply({
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} DEFAULT AUTOPLAY`)
          .setDescription(`
          The Default Autoplay got **\`${client.settings.get(guild.id, "defaultautoplay") ? "Enabled" : "Disabled"}\`**
          `)
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
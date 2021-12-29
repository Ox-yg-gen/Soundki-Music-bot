const { MessageEmbed, MessageButton } = require("discord.js");
module.exports = {
  name: "defaultvolume",
  category: "Settings",
  aliases: ["dvolume"],
  usage: "defaultvolume <Percentage>",
  cooldown: 1,
  description: "Defines the Default Volume of the Bot!",
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
            .setTitle(`${emoji} PLEASE ADD A VOLUME`)
            .setDescription(`
            **Usage:** - \`${client.settings.get(guild.id, "prefix")}defaultvolume <percentage>\`
            `)
          ],
        })
      }
      let volume = Number(args[0]);
      client.settings.ensure(guild.id, {
        defaultvolume: 50
      });

      if (!volume || (volume > 150 || volume < 1)) {
        return message.reply({
          embeds: [
            new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} INVALID VOLUME ARGS`)
            .setDescription(`The Volume must be between \`1\` and \`150\`!`)
          ],
        })
      }
      message.react(react);
      client.settings.set(guild.id, volume, "defaultvolume");
      return message.reply({
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} DEFAULT VOLUME SUCCESS`)
          .setDescription(`The Default Volume has been set to: \`${volume}\`!`)
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
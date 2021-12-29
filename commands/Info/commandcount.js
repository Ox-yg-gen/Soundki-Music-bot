const { MessageEmbed } = require("discord.js");
module.exports = {
  name: "commandcount",
  category: "Info",
  usage: "commandcount",
  aliases: ["cmds", "commandc", "cmdcount"],
  cooldown: 1,
  description: "Shows the Amount of Commands an Categories",
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
      let color = client.settings.get(message.guild.id, `color`);
      let emoji = client.settings.get(message.guild.id, `emoji`);
      let react = client.settings.get(message.guild.id, `react`);
      let pointer = client.settings.get(message.guild.id, `pointer`);
      message.react(react);
      message.reply({
        embeds: [new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} COMMANDS LIST!`)
          .setDescription(`
          ${pointer} **COMMANDS** \`${client.commands.size}\`
          ${pointer} **SLASH COMMANDS** \`${client.slashCommands.size + client.slashCommands.map(d => d.options).flat().length}\`
          ${pointer} **COMMANDS CATEGORIES** \`${client.categories.length}\`
          `)
        ]
      });
    } catch (e) {
      console.log(e);
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
const { MessageEmbed, MessageButton } = require("discord.js");
module.exports = {
  name: "setcolor",
  category: "Settings",
  aliases: ["color", "newcolor"],
  usage: "setcolor <newColor>",
  cooldown: 1,
  description: "Change color of the bot embed!",
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
            .setTitle(`${emoji} PLEASE ADD A COLOR`)
            .setDescription(`**Usage:** - \`${client.settings.get(guild.id, "prefix")}setcolor <newColor>\``)
          ],
        })
      }
      let newColor = args[0];
      client.settings.ensure(guild.id, {
        color: "#00bfff"
      });
      message.react(react);
      if(!newColor.startsWith("#")){
       message.reply({ content: `${emoji} **Wrong color code! color code must start with \`#\`**` });
      } else if (newColor.length !== 7){
      message.reply({ content: `${emoji} **Wrong color number! EG: \`#00bfff\`**` });
      } else {
      client.settings.set(guild.id, newColor, "color");
      let BnewColor = client.settings.get(guild.id, `color`);
      return message.reply({
        embeds: [
          new MessageEmbed()
          .setColor(BnewColor)
          .setTitle(`${emoji} NEW EMBED COLOR`)
          .setDescription(`Successfully set the color to \`${newColor}\``)
        ],
      });
       }
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

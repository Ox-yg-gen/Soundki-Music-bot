const { MessageButton, MessageActionRow, MessageEmbed } = require(`discord.js`);
module.exports = {
  name: "invite",
  category: "Info",
  usage: "invite",
  aliases: ["inviteme", "addme"],
  cooldown: 5,
  description: "Sends you an invite link",
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
      let color = client.settings.get(message.guild.id, `color`);
      let react = client.settings.get(message.guild.id, `react`);
      let inviteme = new MessageButton().setStyle("url").setLabel(`Invite Me`).setURL("https://discord.com/api/oauth2")
      let support = new MessageButton().setStyle("url").setLabel(`Support Server`).setURL("https://discord.com/api/oauth2")
      var buttonarray = [inviteme, support]  
      message.react(react);
      message.reply({
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setDescription(`
          Invite me to with **Slash commands** to server using [Link](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=287561346801&scope=bot%20applications.commands)
          You can invite me without the **Slash commands** with [Link](https://discord.com/oauth2/authorize?client_id=796800241109565490&permissions=287561346801&scope=bot)
          `)
        ],
        buttons: buttonarray
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
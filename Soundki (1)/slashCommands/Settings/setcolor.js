const { MessageEmbed, Message } = require("discord.js");
module.exports = {
  name: "setcolor",
  cooldown: 10,
  description: "Change color of the bot embed!",
  memberpermissions: ["MANAGE_GUILD"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      "String": {
        name: "color",
        description: "What should be the new color?",
        required: true
      }
    },
  ],
  run: async (client, interaction) => {
    try {
      const { member, options } = interaction;
      const { guild } = member;
      let emoji = client.settings.get(guild.id, `emoji`);
      let newColor = options.getString("color");
      client.settings.ensure(guild.id, {
        color: "#00bfff"
      });
      if(!newColor.startsWith("#")){
      interaction.reply({ content: `${emoji} **Wrong color code. color code must start with \`#\`**`, ephemeral: true });
      } else if (newColor.length !== 7){
      interaction.reply({ content: `${emoji} **Wrong color number! EG: \`#00bfff\`**`, ephemeral: true });
      } else {
      client.settings.set(guild.id, newColor, "color");
      let BnewColor = client.settings.get(guild.id, `color`);
      return interaction.reply({
        embeds: [
          new MessageEmbed()
          .setColor(BnewColor)
          .setTitle(`${emoji} NEW EMBED COLOR`)
          .setDescription(`Successfully set the color to \`${BnewColor}\``)
        ],
      });
       }
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}
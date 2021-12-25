const { MessageEmbed, Message } = require("discord.js");
module.exports = {
  name: "setpointer",
  cooldown: 10,
  description: "Change the default embed pointer of the bot",
  memberpermissions: ["MANAGE_GUILD"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      "String": {
        name: "pointer",
        description: "What should be the new pointer?",
        required: true
      }
    },
  ],
  run: async (client, interaction) => {
    try {
      const { member, options } = interaction;
      const { guild } = member;
      let emoji = client.settings.get(guild.id, `emoji`);
      let color = client.settings.get(guild.id, `color`);
      let newPointer = options.getString("pointer");
      client.settings.ensure(guild.id, {
        pointer: "<:bluepointer:897839647034601492>"
      });
      client.settings.set(guild.id, newPointer, "pointer");
      let BnewPointer = client.settings.get(guild.id, `pointer`);
      return interaction.reply({
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} NEW EMBED POINTER`)
          .setDescription(`Successfully set the embed pointer to ${BnewPointer}\nCheck it out with \`/music play LeXxìv Stay With Me\``)
        ],
      });
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}
const { MessageEmbed, Message } = require("discord.js");
module.exports = {
  name: "defaultvolume",
  cooldown: 1,
  description: "Defines the default volume for the bot!",
  memberpermissions: ["MANAGE_GUILD"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      "Integer": {
        name: "volume",
        description: "Volume amount must be between 1 & 150!",
        required: true
      }
    },
  ],
  run: async (client, interaction) => {
    try {
      const { member, options } = interaction;
      const { guild } = member;
      let color = client.settings.get(guild.id, `color`);
      let emoji = client.settings.get(guild.id, `emoji`);
      let volume = options.getInteger("volume");
      client.settings.ensure(guild.id, {
        defaultvolume: 50
      });

      if (!volume || (volume > 150 || volume < 1)) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} INVALID VOLUME ARGS`)
            .setDescription(`The Volume must be between \`1\` and \`150\`!`)
          ],
        })
      }
      client.settings.set(guild.id, volume, "defaultvolume");
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} DEFAULT VOLUME SUCCESS`)
          .setDescription(`The Default Volume has been set to: \`${volume}\`!`)
        ],
      })
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}
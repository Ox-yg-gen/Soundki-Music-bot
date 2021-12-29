const { MessageEmbed, Message } = require("discord.js");
module.exports = {
  name: "setimage",
  cooldown: 5,
  description: "Change the background image of the music setup",
  memberpermissions: ["MANAGE_GUILD"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      "String": {
        name: "image",
        description: "What should be the new image?",
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
      let newImage = options.getString("image");
      if (newImage.includes("https") || newImage.includes("http")) {
      client.settings.ensure(guild.id, { thumbnail: "https://media.discordapp.net/attachments/711910361133219903/920633797836410940/banner3.jpg?width=851&height=613" });
      client.settings.set(guild.id, thumbnail, "thumbnail");
      let newImage = client.settings.get(guild.id, `thumbnail`);
      return interaction.reply({
      embeds: [
      new MessageEmbed()
      .setTitle(`${emoji} NEW IMAGE SUCCESS`)
      .setColor(color)
      .setDescription(`You can use one of this \`banners\`. [Banner 1](https://media.discordapp.net/attachments/711910361133219903/920452405215264768/banner.jpg?width=851&height=613) | [Banner 2](https://media.discordapp.net/attachments/711910361133219903/920633797328924682/banner2.jpg?width=851&height=613) | [Banner 3](https://media.discordapp.net/attachments/711910361133219903/920633797836410940/banner3.jpg?width=851&height=613) | [Banner 4](https://media.discordapp.net/attachments/711910361133219903/920633796603285504/banner4.jpg?width=851&height=613)`)
      .setImage(newImage)
      ],
      });
      } else {
      return interaction.reply({
      embeds: [new MessageEmbed()
      .setColor(color)
      .setTitle(`${emoji} INVALID IMAGE`)
      .setDescription(`You can use one of this \`banners\`. [Banner 1](https://media.discordapp.net/attachments/711910361133219903/920452405215264768/banner.jpg?width=851&height=613) | [Banner 2](https://media.discordapp.net/attachments/711910361133219903/920633797328924682/banner2.jpg?width=851&height=613) | [Banner 3](https://media.discordapp.net/attachments/711910361133219903/920633797836410940/banner3.jpg?width=851&height=613) | [Banner 4](https://media.discordapp.net/attachments/711910361133219903/920633796603285504/banner4.jpg?width=851&height=613)`)
      ],
      }) 
      }
      } catch (e) {
      console.log(String(e.stack))
    }
  }
}
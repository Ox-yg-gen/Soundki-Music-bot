const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require(`discord.js`);
module.exports = {
  name: `setupmusic`,
  category: `Settings`,
  usage: `setupmusic`,
  aliases: [],
  cooldown: 10,
  description: `Setup endless music streaming in a channel`,
  memberpermissions: [`MANAGE_GUILD`], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
      const { member } = message;
      const { guild } = member;
      let color = client.settings.get(message.guild.id, `color`);
			let emoji = client.settings.get(message.guild.id, `emoji`);
      let thumbnail = client.settings.get(message.guild.id, `thumbnail`);
      var embeds = [
      new MessageEmbed()
      .setColor(color)
      .setTitle(`${emoji} ${guild.name.toUpperCase()} MUSIC QUEUE`)
      .setDescription(`There are currently \`0 songs\` in the queue\nadd music to the queue by typing the \`song name\``)
      .setThumbnail(guild.iconURL({ dynamic: true, format: "png", size: 2048 })),
      new MessageEmbed()
      .setColor(color)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true, format: "png", size: 2048 }))
      .setFooter(guild.name, guild.iconURL({ dynamic: true, format: "png", size: 2048 }))
      .setImage(guild.banner ? guild.bannerURL({ size: 4096 }) : thumbnail)
      .setTitle(`${emoji} START LISTENING TO MUSIC`)
      .setDescription(`> **\`${client.user.username}\`** is ready to start streaming music\n> you can start listening to your favourite songs\n> by connecting to a \`voice channel\` and sending\n> the \`song link\` or \`song name\` in this channel!`)
      ]
      var Emojis = [
        `0️⃣`,
        `1️⃣`,
        `2️⃣`,
        `3️⃣`,
        `4️⃣`,
        `5️⃣`,
        `6️⃣`,
        `7️⃣`,
        `8️⃣`,
        `9️⃣`,
        `🔟`,
        `🟥`,
        `🟧`,
        `🟨`,
        `🟩`,
        `🟦`,
        `🟪`,
        `🟫`,
      ]
      //now we add the components!
      var components = [
        new MessageActionRow()
        .addComponents([
          new MessageSelectMenu()
          .setCustomId(`MessageSelectMenu`)
          .addOptions([
            `Pop`, `Strange-Fruits`, `Gaming`, `Chill`, `Rock`, `Jazz`, `Blues`, `Metal`, `Magic-Release`, `NCS | No Copyright Music`, `Default`].map((t, index) => {
            return {
              label: t.substr(0, 25),
              value: t.substr(0, 25),
              description: `Load a Music-Playlist: '${t}'`.substr(0, 50),
              emoji: Emojis[index]
            }
          }))
        ]),
        new MessageActionRow().addComponents([
          new MessageButton().setStyle('PRIMARY').setCustomId('Skip').setLabel(`⏩ Skip`).setDisabled(),
          new MessageButton().setStyle('DANGER').setCustomId('Stop').setLabel(`⏹ Stop`).setDisabled(),
          new MessageButton().setStyle('SECONDARY').setCustomId('Pause').setLabel(`⏸ Pause`).setDisabled(),
          new MessageButton().setStyle('SUCCESS').setCustomId('Autoplay').setLabel(`🔁 Autoplay`).setDisabled(),
          new MessageButton().setStyle('PRIMARY').setCustomId('Shuffle').setLabel(`🔀 Shuffle`).setDisabled(),
        ]),
        new MessageActionRow().addComponents([
          new MessageButton().setStyle('PRIMARY').setCustomId('Song').setLabel(`🔂 Repeat Song`).setDisabled(),
          new MessageButton().setStyle('PRIMARY').setCustomId('Queue').setLabel(`🔁 Repeat Queue`).setDisabled(),
          new MessageButton().setStyle('PRIMARY').setCustomId('Forward').setLabel(`Forward +10s`).setDisabled(),
          new MessageButton().setStyle('PRIMARY').setCustomId('Rewind').setLabel(`Rewind -10s`).setDisabled(),
        ]),
      ]
      let channel = message.mentions.channels.first();
      if (!channel){
        return message.reply({
          embeds: [new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} ADD A CHANNEL`)
            .setDescription(`Please ping the \`text\` channel you want to setup music`)
          ],
        });
      }
      //send the data in the channel
      channel.send({ embeds, components }).then(msg => {
      client.settings.set(message.guild.id, channel.id, `music.channel`);
      client.settings.set(message.guild.id, msg.id, `music.message`);
      return message.reply({
        embeds: [new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} MUSIC SETUP COMPLETE`)
          .setDescription(`Successfully setupped the music system in: <#${channel.id}>`)
        ],
      });
      });
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}
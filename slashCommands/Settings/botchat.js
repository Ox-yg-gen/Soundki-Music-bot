const { MessageEmbed, Message } = require("discord.js");
module.exports = {
  name: "botchat",
  cooldown: 1,
  description: "Manage and configure the bot chat channel!",
  memberpermissions: ["MANAGE_GUILD"],
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      "StringChoices": {
        name: "choose",
        description: "What do you want to do?",
        required: true,
        choices: [
          ["Add"],
          ["Remove"],
        ]
      }
    },
    {
      "Channel": {
        name: "channel",
        description: "Which channel do you want to add or remove",
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
      let add_remove = options.getString("choose");
      let Channel = options.getChannel("channel");
      client.settings.ensure(guild.id, {
        botchannel: []
      });
      if (add_remove == "add") {
        if (client.settings.get(guild.id, "botchannel").includes(Channel.id)) {
          return interaction.reply({
            ephemeral: true,
            embeds: [
              new MessageEmbed()
              .setColor(color)
              .setTitle(`${emoji} CHANNEL IS ALREADY WHITELISTED`)
              .setDescription(`This channel is already a whitelisted bot channel`)
            ],
          })
        }
        client.settings.push(guild.id, Channel.id, "botchannel");
        var schannel = client.settings.get(guild.id, `botchannel`).map(r => `<#${r}>`);
        if (schannel.length == 0) schannel = "`not setup`";
        else schannel.join(", ");
        return interaction.reply({
          ephemeral: true,
          embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} CHANNEL ADDED SUCCESS`)
          .setDescription(`
          The Channel \`${Channel.name}\` got added to the whitelisted Bot Channels!
          **Bot-Channel**${client.settings.get(guild.id, "botchannel").length > 1 ? "**s**": ""} - ${schannel}
          `)
          ],
        })
      } else {
        if (!client.settings.get(guild.id, "botchannel").includes(Channel.id)) {
          return interaction.reply({
            ephemeral: true,
            embeds: [
              new MessageEmbed()
              .setColor(color)
              .setTitle(`${emoji} CHANNEL IS NOT WHITELISTED`)
              .setDescription(`
              This Channel is not a whitelisted Bot Channel yet!
              You can add it to the whitelisted channels anytime
              `)
            ],
          })
        }
        client.settings.remove(guild.id, Channel.id, "botchannel");
        var schannel = client.settings.get(guild.id, `botchannel`).map(r => `<#${r}>`);
        if (schannel.length == 0) schannel = "`not setup`";
        else schannel.join(", ");
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} CHANNEL REMOVE SUCCESS`)
            .setDescription(`
            The Channel \`${Channel.name}\` got removed from the whitelisted Bot Channels!
            **Bot-Channel**${client.settings.get(guild.id, "botchannel").length > 1 ? "**s**": ""} - ${schannel}
            `)
          ],
        })
      }

    } catch (e) {
      console.log(String(e.stack))
    }
  }
}

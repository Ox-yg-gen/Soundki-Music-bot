const { MessageEmbed, MessageButton } = require("discord.js");
module.exports = {
  name: "botchat",
  category: "Settings",
  aliases: ["botch"],
  usage: "botchat <add/remove> <#Channel>",
  cooldown: 1,
  description: "Manages the bot chats!",
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
          embeds: [new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} ADD A METHOD+CHANNEL`)
            .setDescription(`
            **Usage:** - \`${client.settings.get(message.guild.id, "prefix")}botchat <add/remove> <#channel>\`
            `)
          ],
        });
      }
      let add_remove = args[0].toLowerCase();
      if (!["add", "remove"].includes(add_remove)) {
        return message.reply({
          embeds: [new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} ADD A METHOD AND CHANNEL`)
            .setDescription(`
            **Usage:** - \`${client.settings.get(message.guild.id, "prefix")}botchat <add/remove> <#channel>\`
            `)
          ],
        });
      }
      let Channel = message.mentions.channels.first();
      if (!Channel) {
        return message.reply({
          embeds: [new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} ADD A METHOD AND CHANNEL`)
            .setDescription(`
            **Usage:** - \`${client.settings.get(message.guild.id, "prefix")}botchat <add/remove> <#channel>\`
            `)
          ],
        });
      }
      client.settings.ensure(guild.id, {
        botchannel: []
      });

      if (add_remove == "add") {
        if (client.settings.get(guild.id, "botchannel").includes(Channel.id)) {
          return message.reply({
            embeds: [
              new MessageEmbed()
              .setColor(color)
              .setTitle(`${emoji} CHANNEL IS ALREADY WHITELISTED`)
              .setDescription(`
              This Channel is already a whitelisted Bot-Channel
              `)
            ],
          })
        }
        message.react(react);
        client.settings.push(guild.id, Channel.id, "botchannel");
        var schannel = client.settings.get(guild.id, `botchannel`).map(r => `<#${r}>`);
        if (schannel.length == 0) schannel = "not setup";
        else schannel.join(", ");
        return message.reply({
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
          return message.reply({
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
        message.react(react);
        client.settings.remove(guild.id, Channel.id, "botchannel");
        var schannel = client.settings.get(guild.id, `botchannel`).map(r => `<#${r}>`);
        if (schannel.length == 0) schannel = "not setup";
        else schannel.join(", ");
        return message.reply({
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
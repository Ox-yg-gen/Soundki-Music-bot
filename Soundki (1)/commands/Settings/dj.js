const { MessageEmbed, MessageButton } = require("discord.js");
module.exports = {
  name: "dj",
  category: "Settings",
  aliases: ["djrole", "role", "drole", "dj-role"],
  usage: "dj <add/remove> <@Role>",
  cooldown: 1,
  description: "Manages the Dj Roles!",
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
            .setTitle(`${emoji} PLEASE ADD A ROLE METHOD`)
            .setDescription(`**Usage:** - \`${client.settings.get(message.guild.id, "prefix")}botchat <add/remove> <@Role>\``)
          ],
        });
      }
      let add_remove = args[0].toLowerCase();
      if (!["add", "remove"].includes(add_remove)) {
        return message.reply({
          embeds: [new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} PLEASE ADD A ROLE METHOD`)
            .setDescription(`**Usage:** - \`${client.settings.get(message.guild.id, "prefix")}botchat <add/remove> <@Role>\``)
          ],
        });
      }
      let Role = message.mentions.roles.first();
      if (!Role) {
        return message.reply({
          embeds: [new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} PLEASE ADD A ROLE METHOD`)
            .setDescription(`**Usage:** - \`${client.settings.get(message.guild.id, "prefix")}botchat <add/remove> <@Role>\``)
          ],
        });
      }
      client.settings.ensure(message.guild.id, {
        djroles: []
      });
      if (add_remove == "add") {
        if (client.settings.get(message.guild.id, "djroles").includes(Role.id)) {
          return message.reply({
            embeds: [
              new MessageEmbed()
              .setColor(color)
              .setTitle(`${emoji} ROLE ALREADY A DJ`)
              .setDescription(`This Role is already a dj-role!`)
            ],
          })
        }
        message.react(react);
        client.settings.push(message.guild.id, Role.id, "djroles");
        var djs = client.settings.get(message.guild.id, `djroles`).map(r => `<@&${r}>`);
        if (djs.length == 0) djs = "not setup";
        else djs.join(", ");
        return message.reply({
          embeds: [
            new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} ROLE ADDED TO DJ`)
            .setDescription(`
            The Role \`${Role.name}\` got added to the \`${client.settings.get(message.guild.id, "djroles").length - 1}\` dj-roles!
            DJ-Role${client.settings.get(message.guild.id, "djroles").length > 1 ? "s": ""}: ${djs}
            `)
          ],
        })
      } else {
        if (!client.settings.get(message.guild.id, "djroles").includes(Role.id)) {
          return message.reply({
            embeds: [
              new MessageEmbed()
              .setColor(color)
              .setTitle(`${emoji} ROLE NOT A DJ`)
              .setDescription(`This Role is not a dj-role yet!`)
            ],
          })
        }
        client.settings.remove(message.guild.id, Role.id, "djroles");
        var djs = client.settings.get(message.guild.id, `djroles`).map(r => `<@&${r}>`);
        if (djs.length == 0) djs = "not setup";
        else djs.join(", ");
        return message.reply({
          embeds: [
            new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} ROLE REMOVED FROM DJ`)
            .setDescription(`
            The Role \`${Role.name}\` got removed from the \`${client.settings.get(message.guild.id, "djroles").length}\` dj-roles!
            DJ-Role${client.settings.get(message.guild.id, "djroles").length > 1 ? "s": ""}: ${djs}
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
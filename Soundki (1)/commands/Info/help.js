const { MessageEmbed } = require("discord.js");
const settings = require("../../botconfig/settings.json");
const websiteSettings = require("../../dashboard/settings.json");
module.exports = {
  name: "help",
  category: "Info",
  usage: "help [cmdname]",
  aliases: [],
  cooldown: 1,
  description: "Return all commmands, or one specific command",
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
      let prefix = client.settings.get(message.guild.id, "prefix");
      let color = client.settings.get(message.guild.id, `color`);
      let emoji = client.settings.get(message.guild.id, `emoji`);
      let react = client.settings.get(message.guild.id, `react`);
      let pointer = client.settings.get(message.guild.id, `pointer`);
      if (args[0] && args[0].length > 0) {
        function capitalizeFirstLetter(string) { return string.charAt(0).toUpperCase() + string.slice(1); }
        const embed = new MessageEmbed();
        const cmd = client.commands.get(args[0].toLowerCase()) || client.commands.get(client.aliases.get(args.toLowerCase()));
        if (!cmd) {
          return message.reply(`${emoji} No Information found for command \`${args.toLowerCase()}\``);
        } else {
          embed.setTitle(`${cmd.name.toUpperCase()} INFORMATION`)
          embed.setColor(color)
          embed.setThumbnail(client.user.displayAvatarURL({dynamic: true, size: 2048}))
          embed.setDescription(`
          ${pointer} **Name: ** \`${cmd.name}\`
          ${pointer} **Category: ** \`${capitalizeFirstLetter(cmd.category)}\`
          ${pointer} **Example: ** \`${prefix}${cmd.usage}\`
          ${pointer} **Cooldown: ** \`${cmd.cooldown} Seconds\`
          ${pointer} **Aliases: ** \`${cmd.aliases.map((a) => `${a}`).join("`, `") || "None"}\`
          ${pointer} **Description: ** \`Read below\`\n> ${cmd.description}
          `)
          return message.reply({ embeds: [embed] });
        }
      } else {
        message.react(react);
        const embed = new MessageEmbed()
          .setColor(color)
          .setThumbnail(client.user.displayAvatarURL())
          .setTitle(`${emoji} HELP MENU COMMANDS`)
          .setDescription(`Invite me with [__Slash Commands__](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=287561346801&scope=bot%20applications.commands) Permissions, cause all of my Commands are available as Slash Commands too!`)
          .setFooter(`Type: ${prefix}help [cmd name] to see command description`, client.user.displayAvatarURL());
        const commands = (category) => {
          return client.commands.filter((cmd) => cmd.category === category).map((cmd) => `\`${cmd.name}\``);
        };
        try {
          for (let i = 0; i < client.categories.length; i += 1) {
            const current = client.categories[i];
            const items = commands(current);
            embed.addField(`**${current.toUpperCase()} [${items.length}]**`, `> ${items.join(", ")}`);
          }
        } catch (e) {
          console.log(String(e.stack));
        }
        message.reply({
          embeds: [embed]
        });
      }
    } catch (e) {
      console.log(String(e.stack))
      return message.reply({
        embeds: [new MessageEmbed()
          .setTimestamp()
          .setColor("#e63064")
          .setFooter("Error in code: Report this error to kotlin0427 or _destroyer_#1574")
          .setTitle("<:errorcode:868245243357712384> AN ERROR OCCURED!")
          .setDescription(`\`\`\`${e.message ? String(e.message).substr(0, 2000) : String(e).substr(0, 2000)}\`\`\``)
        ]
      });
    }
  }
}

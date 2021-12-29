const { MessageEmbed } = require("discord.js");
const settings = require("../../botconfig/settings.json");
const websiteSettings = require("../../dashboard/settings.json");
module.exports = {
  name: "help",
  cooldown: 1,
  description: "Returns all commmands, or one specific command",
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      "String": {
        name: "command",
        description: "Displays details of a specific command",
        required: false
      }
    },
  ],
  run: async (client, interaction) => {
    try {
      const { member, options, } = interaction;
      const { guild } = member;
      let prefix = client.settings.get(guild.id, "prefix");
      let color = client.settings.get(guild.id, `color`);
      let emoji = client.settings.get(guild.id, `emoji`);
      let pointer = client.settings.get(guild.id, `pointer`);
      let args = options.getString("command");
      if (args && args.length > 0) {
        function capitalizeFirstLetter(string) { return string.charAt(0).toUpperCase() + string.slice(1); }
        const embed = new MessageEmbed();
        const cmd = client.commands.get(args.toLowerCase()) || client.commands.get(client.aliases.get(args.toLowerCase()));
        if (!cmd) {
        return interaction.reply({
        content: `${emoji} **There was no Information found for the command \`${args.toLowerCase()}\`**`,
        });
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
        return interaction.reply({ embeds: [embed] });
        }
      } else {
        const embed = new MessageEmbed()
        .setColor(color)
        .setThumbnail(client.user.displayAvatarURL())
        .setTitle(`${emoji} HELP MENU COMMANDS`)
        .setDescription(`Invite me with [__Slash Commands__](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands) Permissions, cause all of my Commands are available as Slash Commands too!`)
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
        interaction.reply({
          ephemeral: true,
          embeds: [embed]
        });
      }
    } catch (e) {
			console.log(e.stack ? e.stack : e)
			interaction.editReply({
			embeds: [
			new MessageEmbed()
			.setColor("#e63064")
			.setTitle("<:errorcode:868245243357712384> AN ERROR OCCURED!")
			.setDescription(`\`\`\`${e.stack.toString().substr(0, 800)}\`\`\``)
			.setFooter("Error in code: Report this error to kotlin0427")
			],
			ephemeral: true
			});
    }
  }
}
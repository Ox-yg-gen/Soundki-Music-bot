const { MessageEmbed, Message } = require("discord.js");
module.exports = {
  name: "dj",
  cooldown: 1,
  description: "Manage the server music dj!",
  memberpermissions: ["MANAGE_GUILD"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      "StringChoices": {
        name: "choose",
        description: "What do you want to do?",
        required: true,
        choices: [
          ["add"],
          ["remove"],
        ]
      }
    },
    {
      "Role": {
        name: "role",
        description: "Which role do you want to add or remove",
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
      let Role = options.getRole("role");
      client.settings.ensure(guild.id, {
        djroles: []
      });
      if (add_remove == "add") {
        if (client.settings.get(guild.id, "djroles").includes(Role.id)) {
          return interaction.reply({
            ephemeral: true,
            embeds: [
              new MessageEmbed()
              .setColor(color)
              .setTitle(`${emoji} ROLE ALREADY A DJ`)
              .setDescription(`This Role is already a dj-role!`)
            ],
          })
        }
        client.settings.push(guild.id, Role.id, "djroles");
        var djs = client.settings.get(guild.id, `djroles`).map(r => `<@&${r}>`);
        if (djs.length == 0) djs = "`not setup`";
        else djs.join(", ");
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} ROLE ADDED TO DJ`)
            .setDescription(`
            The Role \`${Role.name}\` got added to the \`${client.settings.get(guild.id, "djroles").length - 1}\` dj-roles!
            DJ-Role${client.settings.get(guild.id, "djroles").length > 1 ? "s": ""}: ${djs}
            `)
          ],
        })
      } else {
        if (!client.settings.get(guild.id, "djroles").includes(Role.id)) {
          return interaction.reply({
            ephemeral: true,
            embeds: [
              new MessageEmbed()
              .setColor(color)
              .setTitle(`${emoji} ROLE NOT A DJ`)
              .setDescription(`This Role is not a dj-role yet!`)
            ],
          })
        }
        client.settings.remove(guild.id, Role.id, "djroles");
        var djs = client.settings.get(guild.id, `djroles`).map(r => `<@&${r}>`);
        if (djs.length == 0) djs = "`not setup`";
        else djs.join(", ");
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} ROLE REMOVED FROM DJ`)
            .setDescription(`
            The Role \`${Role.name}\` got removed from the \`${client.settings.get(guild.id, "djroles").length}\` dj-roles!
            DJ-Role${client.settings.get(guild.id, "djroles").length > 1 ? "s": ""}: ${djs}
            `)
          ],
        })
      }

    } catch (e) {
      console.log(String(e.stack))
    }
  }
}
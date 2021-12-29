//Import Modules
const config = require(`../../botconfig/config.json`);
const settings = require(`../../botconfig/settings.json`);
const { onCoolDown, replacemsg } = require("../../handlers/functions");
const Discord = require("discord.js");
module.exports = (client, interaction) => {
	const CategoryName = interaction.commandName;
  client.settings.ensure(interaction.guildId, {
    prefix: config.prefix,
    autoresume: true,
    defaultvolume: 50,
    defaultautoplay: false,
    defaultfilters: [`bassboost6`, `clear`],
    djroles: [],
    color: "#2F3136",
    emoji: "<:soundki:920739390484021308>",
    pointer: ">",
    music: { channel: ``, message: `` },
    thumbnail: "https://media.discordapp.net/attachments/711910361133219903/920633797836410940/banner3.jpg?width=851&height=613"
  });
  let prefix = client.settings.get(interaction.guildId)
  let emoji = client.settings.get(interaction.guildId, `emoji`);
  let color = client.settings.get(interaction.guildId, `color`);
	let command = false;
	try{
    if (client.slashCommands.has(CategoryName + interaction.options.getSubcommand())) {
    command = client.slashCommands.get(CategoryName + interaction.options.getSubcommand());
    }
  	}catch{
    if (client.slashCommands.has("normal" + CategoryName)) {
    command = client.slashCommands.get("normal" + CategoryName);
   	}
	}
	if(command) {
    let botchannels = client.settings.get(interaction.guildId, `botchannel`);
    if(!botchannels || !Array.isArray(botchannels)) botchannels = [];
    if (botchannels.length > 0) {
        if (!botchannels.includes(interaction.channelId) && !interaction.member.permissions.has("ADMINISTRATOR")) {
           return interaction.reply({ ephemeral: true,
             embeds: [new Discord.MessageEmbed()
              .setColor(color)
              .setTitle(`${emoji} COMMANDS NOT ALLOWED HERE`)
              .setDescription(`
              Hey you are not allowed to use this command here
              Please do it in one of this channels: ${botchannels.map(c=>`<#${c}>`).join(", ")}
              `)
            ]
           })
        }
    }
		if (onCoolDown(interaction, command)) {
			  return interaction.reply({ephemeral: true,
				embeds: [new Discord.MessageEmbed()
          .setColor(color)
				  .setDescription(replacemsg(settings.messages.cooldown, {
					prefix: prefix,
					command: command,
					timeLeft: onCoolDown(interaction, command)
				  }))]
			  });
			}
		//if Command has specific permission return error
        if (command.memberpermissions && command.memberpermissions.length > 0 && !interaction.member.permissions.has(command.memberpermissions)) {
          return interaction.reply({ ephemeral: true, embeds: [new Discord.MessageEmbed()
              .setColor(color)
              .setTitle(replacemsg(settings.messages.notallowed_to_exec_cmd.title))
              .setDescription(replacemsg(settings.messages.notallowed_to_exec_cmd.description.memberpermissions, {
                command: command,
                prefix: prefix
              }))]
          });
        }
        //if Command has specific needed roles return error
        if (command.requiredroles && command.requiredroles.length > 0 && interaction.member.roles.cache.size > 0 && !interaction.member.roles.cache.some(r => command.requiredroles.includes(r.id))) {
          return interaction.reply({ ephemeral: true, embeds: [new Discord.MessageEmbed()
            .setColor(color)
            .setTitle(replacemsg(settings.messages.notallowed_to_exec_cmd.title))
            .setDescription(replacemsg(settings.messages.notallowed_to_exec_cmd.description.requiredroles, {
              command: command,
              prefix: prefix
			}))]
          })
        }
        //if Command has specific users return error
        if (command.alloweduserids && command.alloweduserids.length > 0 && !command.alloweduserids.includes(interaction.member.id)) {
          return message.channel.send({ ephemeral: true, embeds: [new Discord.MessageEmbed()
            .setColor(color)
            .setTitle(replacemsg(settings.messages.notallowed_to_exec_cmd.title))
            .setDescription(replacemsg(settings.messages.notallowed_to_exec_cmd.description.alloweduserids, {
              command: command,
              prefix: prefix
            }))]
          });
        }
		//execute the Command
		command.run(client, interaction)
	}
}

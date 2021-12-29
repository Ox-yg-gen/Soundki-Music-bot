const { MessageEmbed, Message } = require("discord.js");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
	name: "play",
	description: "Play any music from youtube or spotify",
	cooldown: 2,
	requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
	alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
	options: [
		{
			"String": {
				name: "song",
				description: "Which song do you want to play?",
				required: true
			}
		},
	],
	run: async (client, interaction) => {
		try {
			const { member, channelId, guildId, options } = interaction;
			const { guild } = member;
			const { channel } = member.voice;
			let color = client.settings.get(guild.id, `color`);
			let emoji = client.settings.get(guild.id, `emoji`);
			if (!channel) {
			return interaction.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`You have to be in a voice channel to use this command!`)
			.setTitle(`${emoji} NOT IN A VOICE CHANNEL!`)
			],
			ephemeral: true
			});
			}
			if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id) {
			return interaction.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`You must be in the same voice channel as me - <#${guild.me.voice.channel.id}>`)
			.setTitle(`${emoji} NOT IN SAME VOICE!`)
			],
			ephemeral: true
			});
			}
			if (channel.userLimit != 0 && channel.full)
			return interaction.reply({
			embeds: [new MessageEmbed()
		    .setColor(color)
			.setTitle(`${emoji} VOICE CHANNEL LIMIT!`)
			.setDescription(`Your Voice Channel is full and I'm unable to join!`)
			],
			ephemeral: true
			});
			if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id) {
			return interaction.reply({
		    embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} ALREADY IN A VOICE CHANNEL!`)
			.setDescription(`Oops it seems I'm already connected to another channel`)
			],
			ephemeral: true
			});
			}
			const Text = options.getString("song"); //same as in StringChoices //RETURNS STRING 
			await interaction.reply({ content: `${emoji} **Searching...** \`${Text}\``, ephemeral: true });
			try {
			let queue = client.distube.getQueue(guildId)
			let options = { member: member }
			if (!queue) options.textChannel = guild.channels.cache.get(channelId)
			await client.distube.playVoiceChannel(channel, Text, options)
			//Edit the reply
			interaction.editReply({ content: `${queue?.songs?.length > 0 ? " " + emoji + "  **Added:**" : " " + emoji + " **Now Playing:**"} \`${Text}\``, ephemeral: true });
			} catch (e) {
			console.log(e.stack ? e.stack : e);
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
		} catch (e) {
			console.log(String(e.stack));
		}
	}
}
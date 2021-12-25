const { MessageEmbed, Message } = require("discord.js");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
	name: "addrelated",
	description: "Add a similar/related song to the current Song!",
	cooldown: 2,
	requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
	alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL
	run: async (client, interaction) => {
		try {
			const { member, guildId } = interaction;
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
			try {
			let newQueue = client.distube.getQueue(guildId);
			if (!newQueue || !newQueue.songs || newQueue.songs.length == 0) {
			return interaction.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`There's currently nothing playing right now`)
			.setTitle(`${emoji} NOTHING PLAYING!`)
			],
			ephemeral: true
			});
			}
			//update it without a response!
			await interaction.reply({ content: `${emoji} **Searching related song for... \`${newQueue.songs[0].name}\`**`, ephemeral: true });
			await newQueue.addRelatedSong();
			await interaction.editReply({ content: `${emoji} **Added:** \`${newQueue.songs[newQueue.songs.length - 1].name}\``, ephemeral: true });
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
		} catch (e) {
			console.log(String(e.stack))
		}
	}
}
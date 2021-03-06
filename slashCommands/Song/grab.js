const { MessageEmbed, Message } = require("discord.js");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
	name: "grab",
	description: "Saves the current playing song in your DM",
	cooldown: 10,
	requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
	alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
	run: async (client, interaction) => {
		try {
			const { member, channelId, guildId, options } = interaction;
			const { guild } = member;
			const { channel } = member.voice;
			let color = client.settings.get(guild.id, `color`);
			let emoji = client.settings.get(guild.id, `emoji`);
			let pointer = client.settings.get(guild.id, `pointer`);
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
			let newTrack = newQueue.songs[0];
			let songtitle = newTrack.name;
			let songName
			if (songtitle.length > 20) songName = songtitle.substr(0, 35) + "...";
			member.send({
			content: `**${client.settings.get(guild.id, "prefix")}play ${newTrack.url}**`,
			embeds: [
			new MessageEmbed()
			.setAuthor(newTrack.user.tag.toUpperCase(), newTrack.user.displayAvatarURL({ dynamic: true}))
			.setThumbnail(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`)
			.setColor(color)
			.setURL(newTrack.url)
			.setDescription(`
			${pointer} **SONG SAVED**
			${pointer} **Song** - \`${songName}\`
			${pointer} **Duration** - \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\`
			${pointer} **Volume** - \`${newQueue.volume}%\`
			${pointer} **Requested by** -  ${newTrack.user}
			${pointer} **Download Song** - [\`Click here\`](${newTrack.streamURL})
			${pointer} **Watch Music Video** - [\`Watch here\`](${newTrack.url})
			`)
			.setFooter(`${client.user.username} Playing in: ${guild.name}`, guild.iconURL({ dynamic: true}))
			.setTimestamp()
			]
			}).then(() => {
			interaction.reply({ content: `${emoji} **Song Saved in your DM**`, ephemeral: true })
			}).catch(() => {
			interaction.reply({ content: `${emoji} **Oops I can't DM you!**`, ephemeral: true })
			});
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
			console.log(String(e.stack))
		}
	}
}
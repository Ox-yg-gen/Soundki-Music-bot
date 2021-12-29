const { MessageEmbed, MessageButton } = require("discord.js");
module.exports = {
  name: "setimage",
  category: "Settings",
  aliases: [],
  usage: "setimage <NewImage>",
  cooldown: 5,
  description: "Change the background image of the music setup",
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
    embeds: [
    new MessageEmbed()
    .setColor(color)
    .setTitle(`${emoji} ADD AN IMAGE`)
    .setDescription(`Background image must include \`https\` or \`http\`\nYou can use one of this \`banners\`. [Banner 1](https://media.discordapp.net/attachments/711910361133219903/920452405215264768/banner.jpg?width=851&height=613) | [Banner 2](https://media.discordapp.net/attachments/711910361133219903/920633797328924682/banner2.jpg?width=851&height=613) | [Banner 3](https://media.discordapp.net/attachments/711910361133219903/920633797836410940/banner3.jpg?width=851&height=613) | [Banner 4](https://media.discordapp.net/attachments/711910361133219903/920633796603285504/banner4.jpg?width=851&height=613)`)
    ],
    })
    }
    let thumbnail = args[0];
    if (thumbnail.includes("https") || thumbnail.includes("http")) {
    client.settings.ensure(guild.id, { thumbnail: "https://media.discordapp.net/attachments/711910361133219903/920633797836410940/banner3.jpg?width=851&height=613" });
    message.react(react);
    client.settings.set(guild.id, thumbnail, "thumbnail");
    let newImage = client.settings.get(guild.id, `thumbnail`);
    return message.reply({
    embeds: [
    new MessageEmbed()
    .setTitle(`${emoji} NEW IMAGE SUCCESS`)
    .setColor(color)
    .setDescription(`You can use one of this banners. [Banner 1](https://media.discordapp.net/attachments/711910361133219903/920452405215264768/banner.jpg?width=851&height=613) | [Banner 2](https://media.discordapp.net/attachments/711910361133219903/920633797328924682/banner2.jpg?width=851&height=613) | [Banner 3](https://media.discordapp.net/attachments/711910361133219903/920633797836410940/banner3.jpg?width=851&height=613) | [Banner 4](https://media.discordapp.net/attachments/711910361133219903/920633796603285504/banner4.jpg?width=851&height=613)`)
    .setImage(newImage)
    ],
    });
    } else {
    return message.reply({
    embeds: [new MessageEmbed()
    .setColor(color)
    .setTitle(`${emoji} INVALID IMAGE`)
    .setDescription(`Background image must include \`https\` or \`http\`\nYou can use one of this \`banners\`. [Banner 1](https://media.discordapp.net/attachments/711910361133219903/920452405215264768/banner.jpg?width=851&height=613) | [Banner 2](https://media.discordapp.net/attachments/711910361133219903/920633797328924682/banner2.jpg?width=851&height=613) | [Banner 3](https://media.discordapp.net/attachments/711910361133219903/920633797836410940/banner3.jpg?width=851&height=613) | [Banner 4](https://media.discordapp.net/attachments/711910361133219903/920633796603285504/banner4.jpg?width=851&height=613)`)
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

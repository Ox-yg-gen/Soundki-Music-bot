const { readdirSync } = require("fs");
const chalk = require("chalk");
module.exports = (client) => {
    try {
        let amount = 0;
        readdirSync("./commands/").forEach((dir) => {
            const commands = readdirSync(`./commands/${dir}/`).filter((file) => file.endsWith(".js"));
            for (let file of commands) {
                let pull = require(`../commands/${dir}/${file}`);
                if (pull.name) {
                    client.commands.set(pull.name, pull);
                    amount++;
                } else {
                    console.log(chalk.bold(chalk.blue.bold(`[Soundki]`)) + chalk.cyan.bold(" missing a help.name, or help.name is not a string."));
                    continue;
                }
                if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach((alias) => client.aliases.set(alias, pull.name));
            }
        });
        console.log(chalk.bold(chalk.blue.bold(`[Soundki]`)) + chalk.cyan.bold(`Successfully Loaded ${amount} Commands`));
    } catch (e) {
        console.log(e);
    }
};
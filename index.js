const { Client } = require('discord.js-selfbot-v13');
const keep_alive = require('./keep_alive');
const client = new Client();

let isBugcatchButtonClicked = false;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    const threadId = '1315905582678540339';
    const mainMessageId = '1314873153205440583';
    const myUserId = '936474701000224768';

    if (message.channel.id === threadId && message.embeds.length > 0) {
        const embed = message.embeds[0];
        const embedDescription = embed.description || "";

        if (embedDescription.includes("mallu dank is ready to be watered again!")) {

            try {
                const channel = await client.channels.fetch('1314490585654100029');
                if (!channel) {
                    console.error("Main channel not found!");
                    return;
                }

                const mainMessage = await channel.messages.fetch(mainMessageId);
                if (!mainMessage) {
                    console.error("Main message not found!");
                    return;
                }

                if (mainMessage.embeds.length > 0) {
                    const mainEmbed = mainMessage.embeds[0];

                    let lastWateredBy = mainEmbed.description?.match(/Last watered by: <@(\d+)>/)?.[1];

                    if (!lastWateredBy) {
                        lastWateredBy = mainEmbed.description?.match(/Thanks <@(\d+)> for watering the tree!/)?.[1];
                    }

                    if (lastWateredBy === myUserId) {
                        return;
                    }

                    if (mainMessage.components.length > 0) {
                        for (const row of mainMessage.components) {
                            const growButton = row.components.find(button => button.customId === 'grow');
                            if (growButton) {

                                await mainMessage.clickButton(growButton.customId)
                                    .then(() => console.log("Successfully clicked 'grow' button!"))
                                    .catch(err => console.error("Failed to click 'grow' button:", err));
                                return;
                            }
                        }
                    } else {
                        console.log("No buttons found in the main message.");
                    }
                } else {
                    console.log("No embeds found in the main message.");
                }
            } catch (error) {
                console.error("An error occurred:", error);
            }
        }
    }
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    const trackedChannelId = '1314490585654100029';
    const trackedMessageId = '1314873153205440583';

    if (newMessage.channel.id === trackedChannelId && newMessage.id === trackedMessageId) {

        try {
            const updatedMessage = await newMessage.channel.messages.fetch(newMessage.id);

            if (isBugcatchButtonClicked) {
                setTimeout(() => {
                    isBugcatchButtonClicked = false; 
                }, 5000);
                return;
            }

            if (updatedMessage.components.length > 0) {
                for (const row of updatedMessage.components) {
                    const bugcatchButton = row.components.find(button => button.customId === 'bugcatch');

                    if (bugcatchButton) {
                        console.log("Bugcatch button found! Clicking...");

                        try {
                            isBugcatchButtonClicked = true;

                            await updatedMessage.clickButton(bugcatchButton.customId);
                            console.log("Bugcatch button clicked successfully!");
                            return;
                        } catch (error) {
                            console.error("Error clicking Bugcatch button:", error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching the updated message:", error);
        }
    }
});


client.login(process.env.TOKEN);

const Discord = require('discord.js')
require('dotenv').config()

const discordClient = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] })

const archiveData = {
    archiveChannel: "Archive",
    archiveWatch: "Game Chats",
    notificationChannel: "😎anything😎",
    archiveLimit: "62"
}

discordClient.on('ready', () => {
    console.log(`Logged in as ${discordClient.user.tag}!`)
})

discordClient.on('channels', () => {
   
})

discordClient.on("messageCreate", (message) => {
    //--------------------Commands-----------------------//

    //List of commands
    if (message.content.startsWith("!help")) {
        message.channel.send(`*!setNotify - sets the channel that will display a notification when a channel is archived
*!setActive - sets the category that ArchiveBot will check and move channels out of if they exceed the archive limit
*!setArchive - sets the category that channels will be sent to when they exceed the archive limit
*!setLimit - change the limit for how many days since the last message was sent in a channel for it to be archived
        \nArchiveBot will automatically move channels from the Archive category back into the Active category if a message is sent in the channel`);
    }

    //Set the notification channel
    if (message.content.startsWith("!setNotify")) {
        //Take off the beginning command in the message to store everything after it
        let newNotify = message.toString().split("!setNotify ");

        archiveData.notificationChannel = newNotify[1].toLowerCase()
        message.channel.send('The notification channel has been set to: "' + archiveData.notificationChannel + '"');
    }

    //Set the active channel
    if (message.content.startsWith("!setActive")) {
        let newActive = message.toString().split("!setActive ");
 
        archiveData.archiveWatch = newActive[1].toLowerCase()
        message.channel.send('The active chat has been set to: "' + archiveData.archiveWatch + '"');
    }

    //Set the archive location
    if (message.content.startsWith("!setArchive")) {
        //Split the string by spaces
        let newArchive = message.toString().split("!setArchive ");

        archiveData.archiveChannel = newArchive[1].toLowerCase()
        message.channel.send('The channel archive has been set to: "' + archiveData.archiveChannel + '"');
    }

    //Set the archive limit
    if (message.content.startsWith("!setLimit")) {
        let newLimit = message.toString().split("!setLimit ");

        archiveData.archiveLimit = parseInt(newLimit[1])
        message.channel.send('The archive limit has been set to: "' + archiveData.archiveLimit + '"');
    }
    //---------------------------------------------------//


    //Bring a channel out of the archive category if someone uses it
    /*if (message.channel.parent != null && (message.channel.parent.name.toLowerCase() == archiveData.archiveChannel.toLowerCase())) {
        let activeChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === archiveData.archiveWatch.toLowerCase())
        message.channel.setParent(activeChannel)
    }*/

    //Loop through the archived category and if any channel has a message that is less than the archive limit
    //return it to the active channels category
    const archivedList = message.guild.channels.cache.filter(channels => channels.type === 'GUILD_TEXT' && channels.parent != null)
    archivedList.each(channel => {
        if (channel.parent.name.toLowerCase() === archiveData.archiveChannel.toLowerCase()) {
            //Get the most recent message from each channel
            channel.messages.fetch({ limit: 1 }).then(messages => {
                let latestMessage = messages.first();
                let latestMessageDay = new Date(latestMessage.createdTimestamp)

                //Calculate the difference between the current date and the last message in the channel
                let currentDay = new Date();
                let diffTime = Math.abs(currentDay - latestMessageDay)
                let diffDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                //Spit out to the console the difference in days. Debugging reasons
                console.log("Channel " + channel.name + " difference in days: " + diffDay)

                if (diffDay <= archiveData.archiveLimit) {
                    let notificationChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === archiveData.notificationChannel.toLowerCase())
                    let activeChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === archiveData.archiveWatch.toLowerCase())
                    console.log(notificationChannel.name)
                    //Move the channel to the active category and notify the chat
                    channel.setParent(activeChannel);
                    discordClient.channels.cache.get(notificationChannel.id).send(channel.name + " is back baby")
                }
            })
        }
    });

    //Loop through all of the channels inside the category that is designated to be watched by Archive Bot
    //TODO: Need to set up Archive Bot to have an array of 'archiveWatch' in case there are multiple categories that users
    // want to monitor
    const channelList = message.guild.channels.cache.filter(channels => channels.type === 'GUILD_TEXT' && channels.parent != null)
    channelList.each(channel => {
        if (channel.parent.name.toLowerCase() === archiveData.archiveWatch.toLowerCase()) {
            //Get the most recent message from each channel
            channel.messages.fetch({ limit: 1 }).then(messages => {
                let latestMessage = messages.first();
                let latestMessageDay = new Date(latestMessage.createdTimestamp)

                //Calculate the difference between the current date and the last message in the channel
                let currentDay = new Date();
                let diffTime = Math.abs(currentDay - latestMessageDay)
                let diffDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                //Spit out to the console the difference in days. Debugging reasons
                console.log("Channel " + channel.name + " difference in days: " + diffDay)

                if (diffDay > archiveData.archiveLimit) {
                    let notificationChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === archiveData.notificationChannel.toLowerCase())
                    let archiveChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === archiveData.archiveChannel.toLowerCase())
                    console.log(notificationChannel.name)
                    //Move the channel to the archive category and notify the chat
                    channel.setParent(archiveChannel);
                    discordClient.channels.cache.get(notificationChannel.id).send(channel.name + " has been moved to " + archiveChannel.name)
                }
            })
        }
    });
    console.log("\n")
});

const fs = require('fs')

fs.writeFile("archiveData.json", JSON.stringify(archiveData), function (err) {
    if (err) throw err;
    console.log()
});

discordClient.login(process.env.TOKEN);
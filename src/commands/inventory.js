const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, prisma } = require('../data/database');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'economy',
    .setName('inventory')
    .setDescription('Afișează inventarul tău sau al altui utilizator')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Utilizatorul al cărui inventar vrei să îl vezi')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser('user') || interaction.user;
      const guildId = interaction.guild.id;

      // Obține utilizatorul
      const user = await getOrCreateUser(targetUser.id, guildId, targetUser.username);

      // Obține itemele din inventar
      const inventoryItems = await prisma.inventoryItem.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });

      if (inventoryItems.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#ffa500')
          .setTitle(`🎒 Inventarul lui ${targetUser.username}`)
          .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
          .setDescription('Inventarul este gol! Folosește `/shop` pentru a cumpăra iteme.')
          .setFooter({ text: `ID: ${targetUser.id}` })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        return;
      }

      // Grupează itemele după nume și calculează totalul
      const itemCounts = {};
      inventoryItems.forEach(item => {
        if (itemCounts[item.itemName]) {
          itemCounts[item.itemName] += item.quantity;
        } else {
          itemCounts[item.itemName] = item.quantity;
        }
      });

      // Creează câmpurile pentru embed
      const fields = [];
      let totalItems = 0;
      
      for (const [itemName, quantity] of Object.entries(itemCounts)) {
        fields.push({
          name: `📦 ${itemName}`,
          value: `Cantitate: **${quantity}**`,
          inline: true
        });
        totalItems += quantity;
      }

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`🎒 Inventarul lui ${targetUser.username}`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '📊 Total iteme', value: `${totalItems}`, inline: true },
          { name: '🔢 Tipuri de iteme', value: `${Object.keys(itemCounts).length}`, inline: true },
          { name: '\u200b', value: '\u200b', inline: true },
          ...fields
        )
        .setFooter({ text: `ID: ${targetUser.id}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in inventory command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la afișarea inventarului.', 
        ephemeral: true 
      });
    }
  },
};

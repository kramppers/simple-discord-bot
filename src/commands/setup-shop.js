const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { prisma } = require('../data/database');

// Iteme implicite pentru magazin
const DEFAULT_ITEMS = [
  {
    name: 'VIP Role',
    description: 'Rol special VIP cu permisiuni extra',
    price: 1000,
    category: 'roles',
    roleId: null // Va fi setat manual de admin
  },
  {
    name: 'Custom Emoji',
    description: 'Emoji personalizat pentru server',
    price: 500,
    category: 'cosmetics'
  },
  {
    name: 'Profile Badge',
    description: 'Insignă specială în profil',
    price: 300,
    category: 'cosmetics'
  },
  {
    name: 'Server Boost',
    description: 'Boost pentru server (30 zile)',
    price: 2000,
    category: 'server'
  },
  {
    name: 'Custom Channel',
    description: 'Canal personalizat pentru 24 ore',
    price: 1500,
    category: 'server'
  },
  {
    name: 'Mute Immunity',
    description: 'Imunitate la mute pentru 7 zile',
    price: 800,
    category: 'permissions'
  },
  {
    name: 'Nickname Change',
    description: 'Schimbare de nickname gratuită',
    price: 200,
    category: 'cosmetics'
  },
  {
    name: 'Color Role',
    description: 'Rol colorat personalizat',
    price: 600,
    category: 'roles'
  }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-shop')
    .setDescription('Configurează magazinul cu iteme implicite (Admin)'),

  async execute(interaction) {
    try {
      // Verifică dacă utilizatorul are permisiuni de administrator
      if (!interaction.member.permissions.has('Administrator')) {
        await interaction.reply({ 
          content: 'Nu ai permisiuni pentru a configura magazinul!', 
          ephemeral: true 
        });
        return;
      }

      const guildId = interaction.guild.id;

      // Verifică dacă magazinul este deja configurat
      const existingItems = await prisma.shopItem.count({
        where: { guildId }
      });

      if (existingItems > 0) {
        const embed = new EmbedBuilder()
          .setColor('#ffa500')
          .setTitle('⚠️ Magazinul este deja configurat!')
          .setDescription(`Există deja **${existingItems}** iteme în magazin.\nFolosește \`/shop add\` pentru a adăuga iteme noi.`)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      // Adaugă itemele implicite
      const createdItems = [];
      for (const item of DEFAULT_ITEMS) {
        const createdItem = await prisma.shopItem.create({
          data: {
            guildId,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            roleId: item.roleId,
            isActive: true
          }
        });
        createdItems.push(createdItem);
      }

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Magazin configurat cu succes!')
        .setDescription(`Au fost adăugate **${createdItems.length}** iteme implicite în magazin.`)
        .addFields(
          { name: '🛍️ Iteme adăugate', value: `${createdItems.length}`, inline: true },
          { name: '📁 Categorii', value: 'roles, cosmetics, server, permissions', inline: true },
          { name: '💰 Prețuri', value: '200-2000 coins', inline: true }
        )
        .addFields(
          { name: '📝 Comandă magazin', value: '`/shop view`', inline: true },
          { name: '🛒 Cumpărare', value: '`/shop buy <item>`', inline: true },
          { name: '➕ Adăugare', value: '`/shop add`', inline: true }
        )
        .setFooter({ text: 'Magazinul este gata de utilizare!' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in setup-shop command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la configurarea magazinului.', 
        ephemeral: true 
      });
    }
  },
};

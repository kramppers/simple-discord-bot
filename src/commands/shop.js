const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { prisma, getOrCreateUser } = require('../data/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Afișează magazinul cu iteme disponibile')
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('Vezi magazinul')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('buy')
        .setDescription('Cumpără un item din magazin')
        .addStringOption(option =>
          option
            .setName('item')
            .setDescription('Numele item-ului de cumpărat')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Adaugă un item în magazin (Admin)')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Numele item-ului')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('price')
            .setDescription('Prețul în coins')
            .setRequired(true)
            .setMinValue(1)
        )
        .addStringOption(option =>
          option
            .setName('description')
            .setDescription('Descrierea item-ului')
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName('category')
            .setDescription('Categoria item-ului')
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;

      if (subcommand === 'view') {
        await this.viewShop(interaction, guildId);
      } else if (subcommand === 'buy') {
        await this.buyItem(interaction, guildId);
      } else if (subcommand === 'add') {
        await this.addItem(interaction, guildId);
      }
    } catch (error) {
      console.error('Error in shop command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la executarea comenzii shop.', 
        ephemeral: true 
      });
    }
  },

  async viewShop(interaction, guildId) {
    // Obține itemele din magazin
    const items = await prisma.shopItem.findMany({
      where: { 
        guildId,
        isActive: true
      },
      orderBy: { category: 'asc' }
    });

    if (items.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🏪 Magazinul este gol!')
        .setDescription('Nu există iteme disponibile în magazin.')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      return;
    }

    // Grupează itemele pe categorii
    const categories = {};
    items.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🏪 Magazinul Serverului')
      .setDescription(`Bun venit în magazinul **${interaction.guild.name}**!`)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setTimestamp();

    // Adaugă itemele grupate pe categorii
    Object.entries(categories).forEach(([category, categoryItems]) => {
      let categoryText = '';
      categoryItems.forEach(item => {
        categoryText += `**${item.name}** - ${item.price} coins`;
        if (item.description) {
          categoryText += `\n└ ${item.description}`;
        }
        categoryText += '\n';
      });
      
      embed.addFields({
        name: `📦 ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        value: categoryText,
        inline: false
      });
    });

    embed.addFields({
      name: '💡 Cum să cumperi',
      value: 'Folosește `/shop buy item:numele_itemului` pentru a cumpăra un item.',
      inline: false
    });

    await interaction.reply({ embeds: [embed] });
  },

  async buyItem(interaction, guildId) {
    const itemName = interaction.options.getString('item');
    
    // Caută item-ul în magazin
    const item = await prisma.shopItem.findFirst({
      where: {
        guildId,
        name: { contains: itemName, mode: 'insensitive' },
        isActive: true
      }
    });

    if (!item) {
      await interaction.reply({ 
        content: `Item-ul **${itemName}** nu a fost găsit în magazin.`, 
        ephemeral: true 
      });
      return;
    }

    // Obține utilizatorul
    const user = await getOrCreateUser(interaction.user.id, guildId, interaction.user.username);

    // Verifică dacă are suficienți coins
    if (user.coins < item.price) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Fonduri insuficiente!')
        .setDescription(`Ai doar **${user.coins} coins**, dar item-ul costă **${item.price} coins**.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Efectuează cumpărarea
    await prisma.user.update({
      where: { id: user.id },
      data: { coins: { decrement: item.price } }
    });

    // Adaugă item-ul în inventarul utilizatorului
    await prisma.inventoryItem.upsert({
      where: {
        userId_itemName: {
          userId: user.id,
          itemName: item.name
        }
      },
      update: {
        quantity: { increment: 1 }
      },
      create: {
        userId: user.id,
        itemName: item.name,
        quantity: 1
      }
    });

    // Adaugă tranzacția
    await addTransaction(user.id, 'SHOP_PURCHASE', -item.price, `Bought ${item.name}`);

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Cumpărare reușită!')
      .setDescription(`Ai cumpărat **${item.name}** pentru **${item.price} coins**!`)
      .addFields(
        { name: '🛍️ Item', value: item.name, inline: true },
        { name: '💰 Preț', value: `${item.price} coins`, inline: true },
        { name: '🏦 Soldul nou', value: `${user.coins - item.price} coins`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async addItem(interaction, guildId) {
    // Verifică dacă utilizatorul are permisiuni de administrator
    if (!interaction.member.permissions.has('Administrator')) {
      await interaction.reply({ 
        content: 'Nu ai permisiuni pentru a adăuga iteme în magazin!', 
        ephemeral: true 
      });
      return;
    }

    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description') || 'Fără descriere';
    const price = interaction.options.getInteger('price');
    const category = interaction.options.getString('category') || 'general';

    // Verifică dacă item-ul există deja
    const existingItem = await prisma.shopItem.findFirst({
      where: {
        guildId,
        name: { contains: name, mode: 'insensitive' }
      }
    });

    if (existingItem) {
      await interaction.reply({ 
        content: `Item-ul **${name}** există deja în magazin!`, 
        ephemeral: true 
      });
      return;
    }

    // Adaugă item-ul în magazin
    const newItem = await prisma.shopItem.create({
      data: {
        guildId,
        name,
        description,
        price,
        category
      }
    });

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Item adăugat cu succes!')
      .setDescription(`Item-ul **${name}** a fost adăugat în magazin.`)
      .addFields(
        { name: '🛍️ Nume', value: name, inline: true },
        { name: '💰 Preț', value: `${price} coins`, inline: true },
        { name: '📦 Categorie', value: category, inline: true },
        { name: '📝 Descriere', value: description, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};

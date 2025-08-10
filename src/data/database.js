const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Funcție pentru a obține sau crea un utilizator
async function getOrCreateUser(discordId, guildId, username) {
  try {
    let user = await prisma.user.findUnique({
      where: {
        discordId_guildId: {
          discordId,
          guildId
        }
      }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          discordId,
          guildId,
          username
        }
      });
    }

    return user;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw error;
  }
}

// Funcție pentru a obține setările guild-ului
async function getGuildSettings(guildId) {
  try {
    let settings = await prisma.guildSettings.findUnique({
      where: { guildId }
    });

    if (!settings) {
      settings = await prisma.guildSettings.create({
        data: { guildId }
      });
    }

    return settings;
  } catch (error) {
    console.error('Error in getGuildSettings:', error);
    throw error;
  }
}

// Funcție pentru a adăuga o tranzacție
async function addTransaction(userId, type, amount, reason = null) {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        amount,
        reason
      }
    });

    return transaction;
  } catch (error) {
    console.error('Error in addTransaction:', error);
    throw error;
  }
}

// Funcție pentru a actualiza coins-urile unui utilizator
async function updateUserCoins(discordId, guildId, amount, operation = 'add') {
  try {
    const user = await getOrCreateUser(discordId, guildId, 'Unknown');
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        coins: {
          [operation === 'add' ? 'increment' : 'decrement']: Math.abs(amount)
        }
      }
    });

    return updatedUser;
  } catch (error) {
    console.error('Error in updateUserCoins:', error);
    throw error;
  }
}

// Funcție pentru a obține top utilizatori după coins
async function getTopUsers(guildId, limit = 10) {
  try {
    const users = await prisma.user.findMany({
      where: { guildId },
      orderBy: { coins: 'desc' },
      take: limit
    });

    return users;
  } catch (error) {
    console.error('Error in getTopUsers:', error);
    throw error;
  }
}

module.exports = {
  prisma,
  getOrCreateUser,
  getGuildSettings,
  addTransaction,
  updateUserCoins,
  getTopUsers
};

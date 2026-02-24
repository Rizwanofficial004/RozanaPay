import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createClient = async (clientData, businessId) => {
  const existingClient = await prisma.client.findFirst({
    where: {
      email: clientData.email,
      businessId
    }
  });

  if (existingClient) {
    throw new Error('Client with this email already exists in your business');
  }

  const hashedPassword = await bcrypt.hash(clientData.password, 10);

  const client = await prisma.client.create({
    data: {
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      shopName: clientData.shopName,
      address: clientData.address,
      password: hashedPassword,
      businessId
    }
  });

  // Create coin wallet for the client
  await prisma.coinWallet.create({
    data: {
      clientId: client.id,
      balance: 0
    }
  });

  const { password, ...clientWithoutPassword } = client;
  return clientWithoutPassword;
};

export const getClients = async (businessId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where: { businessId },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        shopName: true,
        address: true,
        createdAt: true,
        coinWallet: {
          select: {
            balance: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.client.count({ where: { businessId } })
  ]);

  return {
    clients,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getClientById = async (clientId, businessId) => {
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      businessId
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      shopName: true,
      address: true,
      createdAt: true,
      coinWallet: {
        select: {
          balance: true
        }
      }
    }
  });

  if (!client) {
    throw new Error('Client not found');
  }

  return client;
};

export const updateClient = async (clientId, clientData, businessId) => {
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      businessId
    }
  });

  if (!client) {
    throw new Error('Client not found');
  }

  const updateData = {
    name: clientData.name,
    email: clientData.email,
    phone: clientData.phone,
    shopName: clientData.shopName,
    address: clientData.address
  };

  if (clientData.password) {
    updateData.password = await bcrypt.hash(clientData.password, 10);
  }

  const updatedClient = await prisma.client.update({
    where: { id: clientId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      shopName: true,
      address: true,
      createdAt: true
    }
  });

  return updatedClient;
};

export const deleteClient = async (clientId, businessId) => {
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      businessId
    }
  });

  if (!client) {
    throw new Error('Client not found');
  }

  await prisma.client.delete({
    where: { id: clientId }
  });

  return { message: 'Client deleted successfully' };
};

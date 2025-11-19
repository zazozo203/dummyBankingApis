
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const { send } = require('process');
const prisma = new PrismaClient();


exports.checkAccountDetails = async (req, res) => {
  authenticatedUser = req.user;
 try {
 let accountDeatails= await prisma.user.findUnique({ where: { id: authenticatedUser.id }, include: { accounts: true } });
  return res.status(200).json({ success: true, data: accountDeatails.accounts[0] });
 }
 catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, error: 'Internal server error' });
}
};


exports.transferFunds = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'failed', errors: errors.array() });
  }

  authenticatedUser = req.user;
 
  if (!authenticatedUser) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  authenticatedSender = await prisma.user.findUnique({ where: { id: authenticatedUser.id }, include: { accounts: true } });


 const senderAccountId = authenticatedSender.accounts[0].accountNumber;
  
  const idempotencyKey = req.headers['idempotency-key'] || null;

  const {  receiverAccountId, amount } = req.body;
  if(senderAccountId === receiverAccountId){
    return res.status(400).json({ success: false, error: 'senderAccountId and receiverAccountId cannot be the same' });
  }
  const amountNum = Number(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return res.status(403).json({ success: false, error: 'Invalid amount' });
  }

  if (idempotencyKey) {
        const existing = await prisma.transfer.findUnique({ where: { idempotencyKey } });
        if (existing) return res.json({ success: true, data: existing });
      }
      console.log( idempotencyKey );
    
    
  try {

    const senderAccount = await prisma.account.findUnique({ where: { accountNumber: senderAccountId }, include: { user: true } });
    if (!senderAccount) {
      return res.status(404).json({ success: false, error: 'Sender account not found'});
    }
    
    const receiverAccount = await prisma.account.findUnique({ where: { accountNumber: receiverAccountId }, include: { user: true } });
    if (!receiverAccount) {
      return res.status(404).json({ success: false, error: 'Receiver account not found' });
    }


    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
       seindingAccountId = authenticatedSender.accounts[0].id;
       const withinLastMinute = await prisma.transfer.findFirst({
         where: {
           senderAccountId: seindingAccountId,
           createdAt: { gte: oneMinuteAgo },
           receiverAccountId: receiverAccount.id,
           amount: String(amountNum),
         },
       });
      if (withinLastMinute) return res.status(401).json({ success: false, error: 'Duplicate transfer detected. Please wait before retrying.' });

    if (parseFloat(senderAccount.balance) < amountNum) {
      return res.status(400).json({ success: false, error: 'Insufficient funds in sender account' });
    }

    
    const transferResult = await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { accountNumber: senderAccountId },
        data: { balance: { decrement: String(amountNum) } },
      });

      await tx.account.update({
        where: { accountNumber: receiverAccountId },
        data: { balance: { increment: String(amountNum) } },
      });

      const updatedSender = await tx.account.findUnique({ where: { accountNumber: senderAccountId } });
      const updatedReceiver = await tx.account.findUnique({ where: { accountNumber: receiverAccountId } });

      await tx.transaction.create({
        data: {
          accountId: senderAccount.id,
          type: 'debit',
          amount: String(amountNum),
          balanceBefore: String((Number(updatedSender.balance) + amountNum).toFixed(2)),
          balanceAfter: String(updatedSender.balance),
          description: `Transfer to account ${receiverAccountId}`,
          meta: { to: receiverAccountId },
        },
      });

      await tx.transaction.create({
        data: {
          accountId: receiverAccount.id,
          type: 'credit',
          amount: String(amountNum),
          balanceBefore: String((Number(updatedReceiver.balance) - amountNum).toFixed(2)),
          balanceAfter: String(updatedReceiver.balance),
          description: `Received from account ${senderAccountId}`,
          meta: { from: senderAccountId },
        },
      });

      const transfer = await tx.transfer.create({
        data: {
          senderAccountId: senderAccount.id,
          receiverAccountId: receiverAccount.id,
          amount: String(amountNum),
          idempotencyKey: idempotencyKey,
          currency: 'NGN',
          status: 'completed',
        },
      });

      return transfer;
    });

    return res.status(201).json({ success: true, data: transferResult, message: 'Transfer completed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
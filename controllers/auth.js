require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const prisma = new PrismaClient();

function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000)
}


exports.register = async (req, res) => {
    const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'failed', errors: errors.array() })
  }

    const { fullName, email, password } = req.body
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email already in use' })
      }
    const hashedPassword = await bcrypt.hash(password, 12);

      const { user, account }  = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
      },
    });

    let accountNumber;
      let exists = true;

      while (exists) {
        accountNumber = generateAccountNumber().toString();
        const check = await tx.account.findUnique({ where: { accountNumber } });
        if (!check) exists = false;
      }
    const account = await tx.account.create({
       data: {
        user: {
          connect: { id: user.id }
        },
         accountNumber,
        balance: "1000.00",
        currency: "NGN",
      }
    })
    return { user, account };
})

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
        status: 'sucesss',
        message: ' User has been successfully created',
        user:{
            id: user.id, 
            fullName: user.fullName,
            email: user.email
        },
        token: token
        

    })
     }
     catch (err) {
      console.error(err);
      return res.status(500).json({ status: 'failed', error: err.message });
    }
};





exports.login = async(req,res) =>{

    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'failed', errors: errors.array() });
  }

    try{

        const {email,password} = req.body
    
    const isValidEmail = await prisma.user.findUnique({where:{email}})
    if (!isValidEmail){
        return res.status(400).json({
            status:'failed',
            message:"email not found"
        })
    }

    const IsPassword = bcrypt.compare(password,isValidEmail.password)
    if(!IsPassword){
        return res.status(401).json({
            status:'failed',
            message:"incorrect password"
        })
    }
        const token = jwt.sign({ sub: isValidEmail.id, email: isValidEmail.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(201).json({
            status:'success',
            message:'login successful',
            token: token
        })

    }
    catch(err){
      return res.status(400).json({
        status:'failed',
        message: err.message
       })
    }


}
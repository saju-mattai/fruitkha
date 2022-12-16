const { resolveInclude } = require('ejs');
var express = require('express');
const { response } = require('../../app');
var router = express.Router();
var userhelper = require('../../helpers/user-helper')
var productview = require('../../helpers/user-shopcardview');
var objectId = require('mongodb').ObjectId
const { ObjectID } = require('bson')
const config = require('../../config/otp')
const collection = require('../../config/collection')
const db = require('../../config/connection')
const bcrypt = require('bcrypt')
const client = require("twilio")(config.accountSID, config.authToken)
let otpvalidstatus = false;


let phonenumber;
exports.forgotpassowordget = async (req, res) => {
  try {
    if (req.session.user) {
      res.redirect("/")
    } else {
      res.render("forgotpassword")
    }
  } catch (error) {
    res.redirect('/404')
  }

}

exports.forgotpassowordpost = async (req, res) => {
  try {
    number = req.body.Mobile
    userdetails = await db.get().collection(collection.USER_COLLECTION).findOne({ Mobile: req.body.Mobile })
    userhelper.registredUser(req.body).then((details) => {

      if (details) {

        phonenumber = req.body.Mobile
        client
          .verify
          .services(config.serviceID)
          .verifications
          .create({
            to: `+91${phonenumber}`,
            channel: "sms"
          })
          .then((data) => {
            // res.status(200).send(data)
            res.redirect('/verify-otp-forgotpassword');
          }).catch((err) => {
            console.log(err);
          })
      } else {
        userexist = true
        res.redirect('/forgot-passoword')
      }
    })
  } catch (error) {
    res.redirect('/404')
  }
}


exports.renderotpverify = (req, res) => {
  res.render("forgotpasswordotpverify")
}
exports.verifyOTPfppost = (req, res) => {
  try {
    client
      .verify
      .services(config.serviceID)
      .verificationChecks
      .create({
        to: `+91${phonenumber}`,
        code: req.body.otp
      })
      .then((data) => {
        if (data.status == 'approved') {
          console.log(userdetails);
          otpvalidstatus = true;
          res.redirect("/forgot-password-change")
        } else {
          res.redirect('/verify-otp')
        }
      })
  } catch (error) {
    res.redirect('/404')
  }
}
exports.renderchangepassword = (req, res) => {
  try {
    if (otpvalidstatus) {
      res.render("change-passoword")
    } else {
      res.redirect("/login")
    }
  } catch (error) {
    res.redirect('/404')
  }

}

exports.changepassowrdpost = async (req, res) => {
  try {
    if (otpvalidstatus) {
      let newpassword = req.body.newpassword;
      newpassword = await bcrypt.hash(newpassword, 10)
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: 'msaju682@gmail.com' })
      db.get().collection(collection.USER_COLLECTION).updateOne({ Email: 'msaju682@gmail.com' }, { $set: { Password: newpassword} })
      res.redirect("/login")
    } else {
      res.redirect("/login")
    }
  } catch (error) {
    res.redirect('/404')
  }
}
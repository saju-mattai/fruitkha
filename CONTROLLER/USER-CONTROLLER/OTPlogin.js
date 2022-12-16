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
const client = require("twilio")(config.accountSID, config.authToken)
let Logerr = false
let blockerr = false
let userexist = false
let mailerr = false
let mobilerr = false
let userdetails;
let number;
let verifyotp = false


exports.OTPlogin = (req, res) => {
  res.render('otplogin', { userexist });
  userexist = false
}
exports.OTPloginPost = async (req, res) => {
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
            res.redirect('/verify-otp');
          }).catch((err) => {
            console.log(err);
          })
      } else {
        userexist = true
        res.redirect('/otplogin')
      }
    })
  } catch (error) {
    res.redirect('/404')
  }

}
exports.VerifyOTP = (req, res) => {
  res.render('verify-otp', { verifyotp });
  verifyotp = false
}
exports.VerifyOTPPost = (req, res) => {
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
          req.session.user = userdetails;
          req.session.LoggedIn = true
          res.redirect('/')
        } else {
          verifyotp = true
          res.redirect('/verify-otp')
        }
      })
  } catch (error) {
    res.redirect('/404')
  }
}


exports.OTPloginresendPost = async (req, res) => {
  try {
    userdetails = await db.get().collection(collection.USER_COLLECTION).findOne({ Mobile: number })
    userhelper.registredUser(req.body).then((details) => {
      client
        .verify
        .services(config.serviceID)
        .verifications
        .create({
          to: `+91${number}`,
          channel: "sms"
        })
        .then((data) => {
          res.redirect('/verify-otp');
        }).catch((err) => {
          console.log(err);
        })
    })
  } catch (error) {
    res.redirect('/404')
  }
 
}

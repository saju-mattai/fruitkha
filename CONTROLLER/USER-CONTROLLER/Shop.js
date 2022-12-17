const { resolveInclude } = require('ejs');
var express = require('express');
const { response } = require('../../app');
var router = express.Router();
var userhelper = require('../../helpers/user-helper')
var productview = require('../../helpers/user-shopcardview');
var db = require('../../config/connection')
var collection = require('../../config/collection')
var objectId = require('mongodb').ObjectId
const { ObjectID } = require('bson')
const config = require('../../config/otp')
const client = require("twilio")(config.accountSID, config.authToken)
let Logerr = false
let blockerr = false
let userexist = false
let mailerr = false
let mobilerr = false

exports.Shop = async (req, res) => {
  try {
    if (req.session.user) {
      let user = req.session.user
      let validuser = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: user.Email })
      if (validuser.loginstatus) {
        productview.getProductDetails().then((product) => {

          res.render('shop', { product, user });
        })
      } else {
        res.redirect('/')
      }
    } else {
      res.redirect("/logout")

    }
  } catch (error) { 
    res.redirect('/404')
  }

}
exports.SingleProduct = (req, res) => {
  try {
    if (req.session.user) {
      let user = req.session.user
      productview.singleProductView(req.params.id).then((product) => {
        res.render('single-product', { product, user })
      })
    } else {
      res.redirect('/')
    }
  } catch (error) {
    res.redirect('/404')
  }
}
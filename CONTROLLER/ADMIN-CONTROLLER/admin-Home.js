var express = require('express');
// const { response } = require('../app');
var router = express.Router();
var Adminhelper = require('../../helpers/admin-helper')
var Producthelper = require('../../helpers/product-helpers')
var categoryhelper = require('../../helpers/category-helpers');
const productHelpers = require('../../helpers/product-helpers');
const { ObjectID } = require('bson');
const carthelper = require('../../helpers/carthelper');
var objectId = require('mongodb').ObjectId
let moment = require('moment')
// var AdminSideGetUser = require('../helpers/adminSide-view-All-user');
var Emailerr = false




exports.AdminHome = async (req, res) => {
try {
  let admin = req.session.admin
  if (req.session.admin) {
    let COD = await carthelper.findPaymentMethodCod()
    let Paypal = await carthelper.findPaymentMethodPaypal()
    let Razorpay = await carthelper.findPaymentMethodRazorpay()
    let NonActiveUser = await carthelper.NonActiveUser()
    let ActiveUser = await carthelper.ActiveUser()
    let allorder = await carthelper.getAllorderCount()
    let DeliverderOrder = await carthelper.Deliverdorderdetails()
    let allusercount = await carthelper.allUserCount()

    res.render('admin', { admin, COD, Paypal, Razorpay, NonActiveUser, ActiveUser, allorder, DeliverderOrder, allusercount });
  } else {
    res.redirect('/admin-login')
  }
} catch (error) {
  res.redirect('/404')
}
}



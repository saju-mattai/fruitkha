var express = require('express');
// const { response } = require('../app');
var router = express.Router();
var Adminhelper = require('../../helpers/admin-helper')
var Producthelper = require('../../helpers/product-helpers')
var categoryhelper = require('../../helpers/category-helpers');
const productHelpers = require('../../helpers/product-helpers');
const { ObjectID } = require('bson')
var objectId = require('mongodb').ObjectId
// var AdminSideGetUser = require('../helpers/adminSide-view-All-user');
var Emailerr = false


exports.AdminLogin = (req, res) => {
  try {
    if (req.session.admin) {
      res.redirect('/admin')
    } else {
      res.render('admin-login', { Emailerr });
      Emailerr = false
    }
  } catch (error) {
    res.redirect('/404')
  }
}
exports.AdminLoginPost = async (req, res) => {
  try {
    let Email = await Adminhelper.validAdmin(req.body)
    Adminhelper.doLogin(req.body).then((response) => {
      if (Email) {
        req.session.loggedin = true
        req.session.admin = response.admin

        res.redirect('/admin')
      } else if (response.status) {
        res.redirect('/admin')
      } else {
        Emailerr = true
        res.redirect('/admin-login')
      }
    })
  } catch (error) {
    res.redirect('/404')
  }

}
exports.AdminLogOut = (req, res) => {
  try {
    req.session.admin = false
    res.redirect('/admin-login')
  } catch (error) {
    res.redirect('/404')
  }
}
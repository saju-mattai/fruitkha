var express = require('express');
// const { response } = require('../app');
var router = express.Router();
var Adminhelper = require('../../helpers/admin-helper')
var Producthelper = require('../../helpers/product-helpers')
var categoryhelper = require('../../helpers/category-helpers');
const productHelpers = require('../../helpers/product-helpers');
const { ObjectID } = require('bson')
var objectId = require('mongodb').ObjectId
var AdminSideGetUser = require('../../helpers/adminSide-view-All-user');
var Emailerr = false

exports.viewUser = (req, res) => {
  try {
    if (req.session.admin) {
      AdminSideGetUser.getAllUser().then((product) => {
        res.render('view-user', { product })
      })
    } else {
      res.redirect('/admin-login')

    }
  } catch (error) {
    res.redirect('/404')
  }
}
exports.BlockUser = (req, res) => {
  try {
    AdminSideGetUser.blockuser(req.params.id)
    res.redirect('/view-user')
  } catch (error) {
    res.redirect('/404')
  }
}
exports.UnBlockUser = (req, res) => {
  try {
    AdminSideGetUser.unblock(req.params.id)
    res.redirect('/view-user')
  } catch (error) {
    res.redirect('/404')
  }
}
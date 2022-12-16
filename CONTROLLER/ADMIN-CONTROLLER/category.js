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


exports.AddCategory = (req, res) => {
  try {
    if (req.session.admin) {
      res.render('add-category')
    } else {
      res.redirect('/admin-login')
    }
  } catch (error) {
    res.redirect('/404')
  }
}
exports.AddCategoryPost = (req, res) => {
  categoryhelper.AddCategory(req.body)
  res.redirect('/view-category')
}
exports.ViewCategory = (req, res) => {
  try {
    if (req.session.admin) {
      categoryhelper.getCategory().then((category) => {
        res.render('view-category', { category })
      })
    } else {
      res.redirect('/admin-login')
    }
  } catch (error) {
    res.redirect('/404')
  }
}
exports.DeleteCategory = (req, res) => {
  try {
    proId = req.query.id
    categoryhelper.deleteCategory(proId).then((response) => {
      res.redirect('/view-category')
    })
  } catch (error) {
    res.redirect('/404')
  }
}
exports.EditCategory = async (req, res) => {
  try {

    let product = await categoryhelper.getCategoryDetails(req.params.id)
    res.render('edit-category', { product })
  } catch (error) {
    res.redirect('/404')
  }
}
exports.EditCategoryPost = (req, res) => {
  try {
    categoryhelper.updateCategory(req.params.id, req.body).then(() => {
      res.redirect('/view-category')
    })
  } catch (error) {
    res.redirect('/404')
  }
}
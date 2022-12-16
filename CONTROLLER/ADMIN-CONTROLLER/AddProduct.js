var express = require('express');
// const { response } = require('../app');
var router = express.Router();
var Adminhelper = require('../../helpers/admin-helper')
var Producthelper = require('../../helpers/product-helpers')
var categoryhelper = require('../../helpers/category-helpers');
const productHelpers = require('../../helpers/product-helpers');
const Offerhelper = require('../../helpers/OfferHelper')
const { ObjectID } = require('bson')
var objectId = require('mongodb').ObjectId
const cloudinary = require("../../cloudinary")
const fs = require('fs')

const multer = require("../../multer")

// var AdminSideGetUser = require('../helpers/adminSide-view-All-user');
var Emailerr = false
//AddProduct
exports.AddProduct = async (req, res) => {
  try {
    if (req.session.admin) {
      let CategoryData = await Offerhelper.findCategory()
      res.render('add-product', { CategoryData })
    } else {
      res.redirect('/admin-login')
    }
  } catch (error) {
    res.redirect('/404')
  }
}
exports.AddProductPost = async (req, res) => {
  try {
    let image1url;
    let image2url;
    let image3url;
    const uploader = async (path) => await cloudinary.uploads(path, 'Images');
    if (req.method === 'POST') {
      const urls = []
      const files = req.files;
      for (const file of files) {
        const { path } = file;
        const newPath = await uploader(path)
        urls.push(newPath)
        fs.unlinkSync(path)
      }

      image1url = urls[0].url
      image2url = urls[1].url
      image3url = urls[2].url

    }

    const product = {
      Name: req.body.Name,
      Category: req.body.Category_name,
      Quatity: req.body.Quantity,
      Price: req.body.Price,
      CategoryOffer: req.body.Price,
      ProductOffer: req.body.Price,
      Description: req.body.Description,
      Image1: image1url,
      Image2: image2url,
      Image3: image3url
    }
    Producthelper.addProduct(product, (Id) => { })
    res.redirect('/view-product')
  } catch (error) {
    res.redirect('/404')
  }
}


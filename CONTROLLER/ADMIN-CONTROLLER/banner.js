var express = require('express');
// const { response } = require('../app');
var router = express.Router();
var Adminhelper = require('../../helpers/admin-helper')
var Producthelper = require('../../helpers/product-helpers')
var categoryhelper = require('../../helpers/category-helpers');
const productHelpers = require('../../helpers/product-helpers');
const Offerhelper = require('../../helpers/OfferHelper')
const couponhelper = require('../../helpers/couponhelpers')
var carthelper = require('../../helpers/carthelper')
const { ObjectID } = require('bson')
var objectId = require('mongodb').ObjectId
let moment = require('moment')
const cloudinary = require("../../cloudinary")
const fs = require('fs');
const { log } = require('console');
const { Db } = require('mongodb');


exports.banner = async (req, res) => {
 try {
  let banner = await Producthelper.findBanner()
  res.render('add-banner', { banner })
 } catch (error) {
  res.redirect('/404')
 }
}

exports.bannerpost = async (req, res) => {
 try {
  let image1url;
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
  }

  const product = {
    Name: req.body.Banner_Name,
    Image1: image1url,

  }
  Producthelper.addbanner(product)
  res.redirect('/add-banner')


 } catch (error) {
  res.redirect('/404')
 }
}
exports.deletebanner = (req, res) => {
  productHelpers.deleteBanner(req.query)
  res.redirect('/add-banner')


}

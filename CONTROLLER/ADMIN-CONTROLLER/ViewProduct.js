var express = require('express');
// const { response } = require('../app');
var router = express.Router();
var Adminhelper = require('../../helpers/admin-helper')
var Producthelper = require('../../helpers/product-helpers')
var categoryhelper = require('../../helpers/category-helpers');
const productHelpers = require('../../helpers/product-helpers');
const { ObjectID } = require('bson')
var objectId = require('mongodb').ObjectId
const cloudinary = require("../../cloudinary")
const newcloudinary = require("../../newcloudinary")
const fs = require('fs')
var db = require('../../config/connection')
var collection = require('../../config/collection')

const multer = require("../../multer")
var Emailerr = false
let images1, images2, images3;


exports.ViewProduct = (req, res) => {
  try {
    if (req.session.admin) {
      Producthelper.getAllProduct().then((product) => {
        res.render('view-product', { product })
      })
    } else {
      res.redirect('/admin-login')
    }
  } catch (error) {
    res.redirect('/404')
  }
}
exports.DeleteProduct = (req, res) => {
  try {
    let proId = (req.query.id)
    console.log(proId);
    productHelpers.deleteProduct(proId).then((response) => {
      res.redirect('/view-product')
    })
  } catch (error) {
    res.redirect('/404')
  }
}
exports.EditProduct = async (req, res) => {
  try {
    product = await productHelpers.GetProductDetails(req.params.id)
    images1 = product.Image1
    images2 = product.Image2
    images3 = product.Image3
    res.render('edit-product', { product })
  } catch (error) {
    res.redirect('/404')
  }
}
exports.EditProductPost = async (req, res) => {
  try {
    const cloudinaryImageUploadMethod = (file) => {
      return new Promise((resolve) => {
        newcloudinary.uploader.upload(file, (err, res) => {
          if (err) return res.status(500).send('upload image error')
          resolve(res.secure_url)
        })
      })
    }
    const files = req.files
    let arr1 = Object.values(files)
    let arr2 = arr1.flat()

    const urls = await Promise.all(
      arr2.map(async (file) => {
        const { path } = file;
        const result = await cloudinaryImageUploadMethod(path)
        return result
      })

    )
    let url1
    let url2
    let url3
    if (req.files.image1 == undefined && req.files.image2 != undefined && req.files.image3 != undefined) {
      url1 = images1,
        url2 = urls[0],
        url3 = urls[1]
    } else if (req.files.image1 != undefined && req.files.image2 == undefined && req.files.image3 != undefined) {
      url1 = urls[0],
        url2 = images2,
        url3 = urls[1]
    } else if (req.files.image1 != undefined && req.files.image2 != undefined && req.files.image3 == undefined) {
      url1 = urls[0],
        url2 = urls[1],
        url3 = images3
    } else if (req.files.image1 == undefined && req.files.image2 == undefined && req.files.image3 != undefined) {
      url1 = images1,
        url2 = images2,
        url3 = urls[0]
    } else if (req.files.image1 != undefined && req.files.image2 == undefined && req.files.image3 == undefined) {
      url1 = urls[0],
        url2 = images2,
        url3 = images3
    } else if (req.files.image1 == undefined && req.files.image2 != undefined && req.files.image3 == undefined) {
      url1 = images1,
        url2 = urls[0],
        url3 = images3
    } else if (req.files.image1 == undefined && req.files.image2 == undefined && req.files.image3 == undefined) {
      url1 = images1,
        url2 = images2,
        url3 = images3
    } else if (req.files.image1 != undefined && req.files.image2 != undefined && req.files.image3 != undefined) {
      url1 = urls[0],
        url2 = urls[1],
        url3 = urls[2]
    }


    if (urls.length) {
      image1url = url1
      image2url = url2
      image3url = url3
      product = {
        Name: req.body.Name,
        Category: req.body.Category,
        Quatity: req.body.Quatity,
        Price: req.body.Price,
        Offer: req.body.Offer,
        Description: req.body.Description,
        Image1: image1url,
        Image2: image2url,
        Image3: image3url
      }
    } else {
      let prodcutimgs = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectID(req.params.id) })

      product = {
        Name: req.body.Name,
        Category: req.body.Category,
        Quatity: req.body.Quatity,
        Price: req.body.Price,
        Offer: req.body.Offer,
        Description: req.body.Description,
        Image1: prodcutimgs.Image1,
        Image2: prodcutimgs.Image2,
        Image3: prodcutimgs.Image3
      }
    }



    productHelpers.updateProduct(req.params.id, product).then(() => {
      let Id = req.params.id
      res.redirect('/view-product')
      // if (req.files.Image) {
      //   let image = req.files.Image
      //   image.mv('./public/adminassets/asset/product-images' + Id + '.jpg')
      // }
    })
  } catch (error) {
    res.redirect('/404')
  }
} 
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
// var AdminSideGetUser = require('../helpers/adminSide-view-All-user');
var Emailerr = false
var db = require('../../config/connection')
var collection = require('../../config/collection')


exports.Categoryoffer = async (req, res) => {
    try {
        let CategoryData = await Offerhelper.findCategory()
        let offerCategory = await Offerhelper.findOfferCategory()
        res.render('Category-offer', { CategoryData, offerCategory })
    } catch (error) {
        res.redirect('/404')
    }
}
exports.Productoffer = async (req, res) => {
    try {
        let product = await Offerhelper.findProduct()
        let productoffer = await Offerhelper.findproductoffer()
        res.render('Product-offer', { product, productoffer })
    } catch (error) {
        res.redirect('/404')
    }
}
exports.CategoryofferPost = (req, res) => {
    try {
        Offerhelper.InCategory(req.body)
        Offerhelper.findSpecificCategory(req.body)
        res.redirect('/Category-offer')
    } catch (error) {
        res.redirect('/404')
    }
}
exports.ProductofferPost = (req, res) => {
    try {
        Offerhelper.InProduct(req.body)
        Offerhelper.findindividualProduct(req.body)
        res.redirect('/Product-offer')
    } catch (error) {
        res.redirect('/404')
    }
}
exports.editCategory = async (req, res) => {
    try {
        let data = await Offerhelper.findEditCategory(req.query.id)
        res.render('editoffercategory', { data })
    } catch (error) {
        res.redirect('/404')
    }
}
exports.editCategorypost = (req, res) => {
    try {
        Offerhelper.editCategory(req.body).then((data) => {
            res.redirect('/Category-offer')
        })
    } catch (error) {
        res.redirect('/404')
    }
}
exports.editProductoffer = async (req, res) => {
    try {
        let productoffer = await Offerhelper.findSpecificProduct(req.query.id)
        res.render('editproductoffer', { productoffer })
    } catch (error) {
        res.redirect('/404')
    }
}
exports.editProductofferPost = (req, res) => {
    try {
        Offerhelper.editProductoffer(req.body)
        res.redirect('/Product-offer')
    } catch (error) {
        res.redirect('/404')
    }

}
exports.DeleteProductoffer = async (req, res) => {
    try {
        let productoffer = await Offerhelper.findSpecificProduct(req.query.id)
        let productdetails = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Name: productoffer.product_name })
        Offerhelper.DeleteProductoffer(req.query.id)
        Offerhelper.updateProductoffer(productdetails)
        res.redirect('/Product-offer')
    } catch (error) {
        res.redirect('/404')
    }
}
exports.DeleteCategoryoffer = (req, res) => {
    try {
        let category = req.query.id
        Offerhelper.DeleteCategoryoffer(category)
        res.redirect("/Category-offer")
    } catch (error) {
        res.redirect('/404')
    }
}
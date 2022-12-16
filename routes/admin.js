var express = require('express');
const { response } = require('../app');
var router = express.Router();
var Adminhelper = require('../helpers/admin-helper')
var Producthelper = require('../helpers/product-helpers')
var categoryhelper = require('../helpers/category-helpers');
const productHelpers = require('../helpers/product-helpers');
const { ObjectID } = require('bson')
var objectId = require('mongodb').ObjectId
var AdminSideGetUser = require('../helpers/adminSide-view-All-user');
const upload = require("../multer")
var Emailerr=false




const AdminHome=require('../CONTROLLER/ADMIN-CONTROLLER/admin-Home')
const AdminLogin=require('../CONTROLLER/ADMIN-CONTROLLER/AdminLogin')
const AddProduct=require('../CONTROLLER/ADMIN-CONTROLLER/AddProduct')
const ViewProduct=require('../CONTROLLER/ADMIN-CONTROLLER/ViewProduct')
const category=require('../CONTROLLER/ADMIN-CONTROLLER/category')
const User=require('../CONTROLLER/ADMIN-CONTROLLER/User')
const Order=require('../CONTROLLER/ADMIN-CONTROLLER/ordermanagement')
const Offer = require('../CONTROLLER/ADMIN-CONTROLLER/offer')
const coupon = require('../CONTROLLER/ADMIN-CONTROLLER/coupon')
const Banner = require('../CONTROLLER/ADMIN-CONTROLLER/banner')

/* GET home page. */
router.get('/admin',AdminHome.AdminHome)
//admin-login
router.get('/admin-login',AdminLogin.AdminLogin)
router.post('/admin-login',AdminLogin.AdminLoginPost) 
//admin-logout
router.get('/admin-logout',AdminLogin.AdminLogOut)
//AddProduct
router.get('/add-product',AddProduct.AddProduct) 
router.post('/add-product',upload.array('Image'), AddProduct.AddProductPost)
//view-product
router.get('/view-product',ViewProduct.ViewProduct)
//delete-product
router.get('/delete-product',ViewProduct.DeleteProduct)
//edit-product
router.get('/edit-product/:id',ViewProduct.EditProduct)
router.post('/edit-product/:id',upload.fields([
    { name: "image2", maxCount: 1 },{ name: "image3", maxCount: 1 },{ name: "image1", maxCount: 1 }]),ViewProduct.EditProductPost)
//add-category
router.get('/add-category',category.AddCategory)
router.post('/add-category',category.AddCategoryPost)
//view-catogary
router.get('/view-category',category.ViewCategory)
//delete-category
router.get('/delete-category', category.DeleteCategory)
//get-category-details/
router.get('/edit-category/:id', category.EditCategory)
//edit-category
router.post('/edit-category/:id', category.EditCategoryPost)
//View User
router.get('/view-user',User.viewUser)
//block-user
router.get('/block-user/:id', User.BlockUser)  
//unbloack 
router.get('/unblock-user/:id', User.UnBlockUser)
//orderManagment
router.get('/view-order',Order.vieworder)
//viewsingleorder
router.get('/view-singleorder/:id',Order.viewsingleorder)
//user cancel-order
router.post('/cncel-order',Order.cancelorder)
//user return-order
router.post('/user-return',Order.ReturnOrder)
//admin-cancel-order
router.put('/admin-cancel-order',Order.admincancelorder)

//admin-shipped 
router.put('/admin-shipped',Order.shippedorder) 
//DeliverderOrder
router.put('/deliver-order',Order.DeliverderOrder)
//reports
router.get('/reports',Order.salesreport)
router.get('/reports-weekly',Order.weeklyreport)
router.get('/reports-monthly',Order.monthlyreport)


//offer
router.get('/Category-offer',Offer.Categoryoffer)
router.get('/Product-Offer',Offer.Productoffer)
router.post('/Categoryoffer',Offer.CategoryofferPost)
router.post('/Product-Offer',Offer.ProductofferPost)

//coupon 
router.get('/add-coupon',coupon.addcoupon)
router.post('/add-coupon',coupon.addcouponpost)
router.get('/view-coupon',coupon.viewcoupon)
router.post('/apply-coupon',coupon.applycoupon)
router.delete('/delete-coupon',coupon.deletecoupon)

// edit offer
router.get('/editCategoryoffer',Offer.editCategory)
router.post('/editCategoryoffer',Offer.editCategorypost)
router.get('/edit-Product-Offer',Offer.editProductoffer)
router.post('/edit-Product-Offer',Offer.editProductofferPost)
//GetProductDetails


///delete-product-offer

router.get('/delete-product-offer',Offer.DeleteProductoffer)
router.get('/delete-category-offer',Offer.DeleteCategoryoffer)


 
                                  ///BAnners

router.get('/add-banner',Banner.banner)
router.post('/add-banner',upload.array('Image'),Banner.bannerpost)
router.get('/delete-banner',Banner.deletebanner)


//crop







//view-user



//admin-signup
// router.get('/admin-signup', function(req, res, next) {
//   res.render('admin-signup');
// });

// router.post('/admin-signup',function(req, res, next) {
//  userhelper.doSignup(req.body).then((response)=>{
//   console.log(response);
//  })

//  res.redirect('/admin-login')
// });



module.exports = router;

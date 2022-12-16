const { resolveInclude } = require('ejs');
var express = require('express');
const { response } = require('../app');
var router = express.Router();
var userhelper = require('../helpers/user-helper')
var productview = require('../helpers/user-shopcardview');
var objectId = require('mongodb').ObjectId
const { ObjectID } = require('bson')
const config = require('../config/otp')
const client = require("twilio")(config.accountSID, config.authToken)
let Logerr = false
let blockerr = false
let userexist = false
let mailerr = false
let mobilerr = false



const UserHome = require('../CONTROLLER/USER-CONTROLLER/UserContro;')
const OTP = require('../CONTROLLER/USER-CONTROLLER/OTPlogin')
const Cart = require('../CONTROLLER/USER-CONTROLLER/Cart')
const Shop = require('../CONTROLLER/USER-CONTROLLER/Shop')
const Contact = require('../CONTROLLER/USER-CONTROLLER/Contact')
const Address = require('../CONTROLLER/USER-CONTROLLER/addressmanagement')
const forgotpassword = require("../CONTROLLER/USER-CONTROLLER/forgotpasscontroller")




/* GET users listing. */
router.get('/', UserHome.UserHome)
//user Sign Up
router.get('/signup', UserHome.UserSignup)
router.post('/signup', UserHome.UserSignupPost)
//login
router.get('/login', UserHome.UserLogin)  
router.post('/login', UserHome.UserLoginPost)
//otp login
router.get('/otplogin', OTP.OTPlogin) 
router.post('/otplogin', OTP.OTPloginPost)
//verify-otp
router.get('/verify-otp', OTP.VerifyOTP)
router.post('/verify-otp', OTP.VerifyOTPPost)
//LogOut
router.get('/logout', UserHome.LogOut)
//view user side admin added item 
router.get('/shop', Shop.Shop)
//single view user side
router.get('/single-product/:id', Shop.SingleProduct)
//contact
router.get('/contact', Contact.Contact)
//cart
router.get('/cart', Cart.Cart)
//AAd ToCart
router.get('/add-to-cart', Cart.addTocart)
//change-product-quantity
router.post('/change-product-quantity', Cart.changeproductquantitypost)
//cancelorder 
router.post('/cancel-order', Cart.cancelorder)
//totalamount  
router.get('/place-order', Cart.placeorder)
router.post('/place-order', Cart.placeorderPost)
//ordered details
// router.get('/ordered-details', Cart.orderedDetails)
router.get('/order-details', Cart.orderDetails)
router.get('/view-single-order-user/:id', Cart.viewsingleorderuser)

// router.get('view-singleorder-user',Cart.viewsingleorderuser)

//address-management
router.get('/address-management', Address.AddressManagement)
router.post('/address-management', Address.AddressManagementpost)
//edit-address
router.get('/edit-address/:id', Address.editaddress)
router.post('/edit-address/:id', Address.editaddressPost)
//delete-address
router.delete('/delete-address', Address.deleteaddress)
//add-new-address
router.get('/add-new-address', Address.addnewAddress)
router.get('/404',Address.errorpage)
//Resend OTP
router.get("/resend-otp", OTP.OTPloginresendPost)

// forgot password 
router.get("/forgot-passoword", forgotpassword.forgotpassowordget)
router.post("/forgot-passoword", forgotpassword.forgotpassowordpost)

// verify the otp
router.get("/verify-otp-forgotpassword", forgotpassword.renderotpverify)
router.post('/otp-verify-fp', forgotpassword.verifyOTPfppost)

// chane password 

router.get("/forgot-password-change", forgotpassword.renderchangepassword)
router.post("/change-passoword-post", forgotpassword.changepassowrdpost)

///paypaaaaaaaaaaaaal
router.get('/paypal', UserHome.paypal)
router.get('/pay', UserHome.paypost)

router.get('/success', UserHome.success)
router.get('/cancel', UserHome.cancel) 

//razorpay
router.post('/verify-payment', UserHome.razorpayPost)
//Profile
router.get('/profile',UserHome.profile)
///change-password
router.post('/change-password',UserHome.changepasswordpost)

module.exports = router;

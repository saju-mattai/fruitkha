const { resolveInclude } = require('ejs');
var express = require('express');
// const { response } = require('../../app');
var router = express.Router();
var userhelper = require('../../helpers/user-helper')
var productview = require('../../helpers/user-shopcardview');
var carthelper = require('../../helpers/carthelper')
var addresshelper = require('../../helpers/Address-helper')
var db = require('../../config/connection')
var collection = require('../../config/collection')
let newvalue = require('../../CONTROLLER/ADMIN-CONTROLLER/coupon')
var objectId = require('mongodb').ObjectId
const { ObjectID } = require('bson')
const config = require('../../config/otp');
const { Db } = require('mongodb');
const { response } = require('../../app');
const { order } = require('paypal-rest-sdk');
const client = require("twilio")(config.accountSID, config.authToken)
let Logerr = false
let blockerr = false
let userexist = false
let mailerr = false
let mobilerr = false
let total;
let orgTotal;
let wallet

exports.Cart = async (req, res) => {
    try {
        if (req.session.user) {
            let user = req.session.user
            let validuser = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: user.Email })
            if (validuser.loginstatus) {
                let product = await userhelper.GetCartProducts(req.session.user._id)

                let allproduct = await carthelper.getallproduct(req.session.user._id)



                total = await carthelper.getTotalAmount(req.session.user._id)
                orgTotal = total
                if (newvalue.newstatus) {

                    total = parseInt(total) - parseInt(newvalue.newtotal)
                    exports.totalprice = total
                    newvalue.newtotal = 0
                } else {

                    exports.totalprice = total
                }

                res.render('cart', { product, user: req.session.user._id, total, user });

            } else {
                res.redirect('/')
            }
        } else {
            res.redirect("/logout")
        }
    } catch (error) {
        res.send(error)
    }


}
exports.addTocart = (req, res) => {
    try {
        if (req.session.user) {
            userhelper.AddToCart(req.query.id, req.session.user._id).then(() => {
                res.json({ status: true })
            })
        } else {
            res.json({ status: false })
        }
    } catch (error) {
        res.redirect('/404')
    }


}
exports.changeproductquantitypost = (req, res, next) => {
    try {
        userhelper.changeProductQuantity(req.body,).then((data) => {


            res.json({ status: true })
        })
    } catch (error) {
        res.redirect('/404')
    }

}

exports.cancelorder = (req, res) => {
    try {
        carthelper.CancelOrder(req.body).then((response) => {
            res.json(response)
        })
    } catch (error) {
        res.redirect('/404')
    }

},
    exports.placeorder = async (req, res) => {
        try {
            if (req.session.user) {
                let orderid = req.query.id;
                let productdetails = await carthelper.getProductName(req.session.user._id)
                wallet = await userhelper.findwallet(req.session.user._id)
                let couponAmount
                if (newvalue.newcoupon) {
                    couponAmount = newvalue.newcoupon.Amount
                } else {
                    couponAmount = 0;
                }
                console.log("qwertyuiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
                console.log(newvalue.newstatus);
                let total = await carthelper.getTotalAmount(req.session.user._id)
                if (newvalue.newstatus == true) {
                    console.log(couponAmount);
                    console.log("couponAmount");
                    total = parseInt(total) - parseInt(couponAmount);
                } else {
                    couponAmount = 0;
                }

                let validuser = await carthelper.finduser(req.query.id, req.session.user._id)
                let user = req.session.user

                if (wallet == null) {
                    wallet = { 
                        amount: 0
                    }
                    wallet;
                }

                res.render('checkout', { total, user, productdetails, validuser, wallet, orderid, orgTotal, couponAmount })
                newvalue.newstatus = false
            }
        } catch (error) {
            res.redirect('/404')
        }

    }
exports.placeorderPost = async (req, res) => {
    try {
        if (req.session.user) {
            let product = await carthelper.getProductList(req.session.user._id)

            if (req.body.paymentMethod === 'Paypal') {
                let placeorder = await carthelper.placeOrder(req.body, product, total, newvalue.newcoupon, req.session.user._id, wallet).then((orderId) => {
                    req.session.orderid = orderId.insertedId;
                })
                req.session.totalprice = total
                res.json({ paypalstatus: true, method: 'paypal', total })
            }
            else if (req.body.paymentMethod === 'COD') {
                let placeorder = await carthelper.placeOrder(req.body, product, total, newvalue.newcoupon, req.session.user._id, wallet).then((orderId) => {
                    req.session.orderid = orderId.insertedId;
                })
                res.json({ CODstatus: true, method: 'COD' })
            } else if (req.body.paymentMethod === 'Razorpay') {
                let placeorder = await carthelper.placeOrder(req.body, product, total, newvalue.newcoupon, req.session.user._id, wallet).then((orderId) => {
                    req.session.orderid = orderId.insertedId;
                    carthelper.generateRazorpay(orderId, total).then((order) => {
                        res.json({ Razorpaystatus: true, order, method: 'Razorpay' })
                    })
                })

            } else if (req.body.paymentMethod === 'wallet') {
                if (wallet.amount < total) {
                    

                } else {
                    console.log(wallet.amount);
                    console.log('total');
                    console.log(total);
                    let placeorder = await carthelper.placeOrder(req.body, product, total, newvalue.newcoupon, req.session.user._id, wallet).then((orderId) => {
                        req.session.orderid = orderId.insertedId;
                    })
                }


                res.json({ walletstatus: true, method: 'wallet' })
            }

        }
    } catch (error) {
        res.redirect('/404')
    }

},
    exports.orderDetails = async (req, res) => {
        try {
            if (req.session.user) {
                let user = req.session.user
                let order = await carthelper.orderlistuser(req.session.user._id)
                res.render('oorderdetails', { order, user })
            } else {
                res.redirect('/')
            }
        } catch (error) {
            res.redirect('/404')
        }
    }
exports.viewsingleorderuser = async (req, res) => {
    try {
        if (req.session.user) {
            let user = req.session.user
            product = await carthelper.getSingleProductList(req.params.id)
            console.log(product[0].products.status);
            res.render('view-singleorder-user', { product, total, user })
        } else {
            res.redirect('/')
        }
    } catch (error) {
        res.redirect('/404')
    }
}   

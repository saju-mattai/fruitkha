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
// var AdminSideGetUser = require('../helpers/adminSide-view-All-user');
var Emailerr = false
var db = require('../../config/connection')
var collection = require('../../config/collection')

let existcoupon

exports.addcoupon = (req, res) => {
    try {
        if (req.session.admin) {
            res.render('add-coupon')
        } else {
            res.redirect('/admin')
        }
    } catch (error) {
        res.redirect('/404')
    }
}
exports.addcouponpost = (req, res) => {
    try {
        const details = {
            CouponCode: req.body.CouponCode,
            MinPrice: parseInt(req.body.MinPrice),
            Amount: parseInt(req.body.Amount),
            StartingDate: new Date(req.body.StartingDate),
            EndingDate: new Date(req.body.EndingDate),
            Date: moment().format('MMMM Do YYYY, h:mm:ss a')
        }
        couponhelper.addCoupon(details).then((response) => {
            res.redirect('/add-coupon')
        })

    } catch (error) {
        res.redirect('/404')
    }

}
exports.viewcoupon = async (req, res) => {
    let coupon = await couponhelper.findCoupon()
    res.render('view-coupon', { coupon })

}
exports.deletecoupon = (req, res) => {
    couponhelper.deleteCoupon(req.query.id)
}
exports.applycoupon = async (req, res) => {
    try {
        let total = await carthelper.getTotalAmount(req.session.user._id)
        let coupon = await couponhelper.findCouponApply(req.body)
        if (coupon != null) {
            existcoupon = await couponhelper.existFindcoupon(req.session.user._id, coupon)
        } else { }
        if (coupon == null) {
            exports.newstatus = false
            res.json({ result1: true })

        } else if (existcoupon != null) {
            exports.newstatus = false
            res.json({ result5: true })
        }
        else if (new Date() < coupon.StartingDate) {
            exports.newstatus = false
            res.json({ result2: true })
        } else if (new Date() > coupon.EndingDate) {
            exports.newstatus = false
            res.json({ result3: true })

        } else if (total < coupon.MinPrice) {
            exports.newstatus = false
            res.json({ result4: true })

        } else if(coupon === null) {
            exports.newstatus = false
        }
        else {
            exports.newtotal = coupon.Amount
            exports.newstatus = true
            exports.newcoupon = coupon
            res.json({ status: true })
        } 
    } catch (error) {
        res.redirect('/404')
    }


}
// exports.crop = (req, res) => {
//     res.render('crop')
// }
var express = require('express');
// const { response } = require('../app');
var router = express.Router();
var Adminhelper = require('../../helpers/admin-helper')
var Producthelper = require('../../helpers/product-helpers')
var categoryhelper = require('../../helpers/category-helpers');
const productHelpers = require('../../helpers/product-helpers');
const carthelper = require('../../helpers/carthelper')
const { ObjectID } = require('bson');
const { response } = require('../../app');
var objectId = require('mongodb').ObjectId
let moment = require('moment')
// var AdminSideGetUser = require('../helpers/adminSide-view-All-user');
var Emailerr = false
let week = moment().subtract(7, 'days').calendar()
let month = moment().subtract(30, 'days').calendar()
let year = moment().subtract(365, 'days').calendar()


exports.vieworder = (req, res) => {
    try {
        carthelper.orderlist().then((response) => {
            res.render('view-order-details', { response })
        })
    } catch (error) {
        res.redirect('/404')
    }
}

exports.viewsingleorder = async (req, res) => {
    try {
        product = await carthelper.getSingleProductList(req.params.id)
        res.render('view-single-order', { product })
    } catch (error) {
        res.redirect('/404')
    }
}
exports.cancelorder = async (req, res) => {
    try {
        let user = req.session.user._id
        let order = await carthelper.findOrder(user)
        carthelper.OrderStatus(req.query, "cancelled", req.session.user._id, order).then((data) => {
            if (data) {
                res.json({ status: true })
            }
        })
    } catch (error) {
        res.redirect('/404')
    }

}
exports.ReturnOrder = (req, res) => {
    try {
        carthelper.OrderStatus(req.query, "return", req.session.user._id).then((data) => {
            if (data) {
                console.log(data);
                res.json({ status: true })
            }
        })
    } catch (error) {
        res.redirect('/404')
    }

}

exports.admincancelorder = (req, res) => {
    try {
        carthelper.OrderStatus(req.query, "cancelled")
        res.json({ status: true })
    } catch (error) {
        res.redirect('/404')
    }
}

exports.shippedorder = (req, res) => {
    try {
        carthelper.OrderStatus(req.query, 'Shipped').then((response) => {
            res.json(response)
        })
    } catch (error) {
        res.redirect('/404')
    }
}
exports.DeliverderOrder = (req, res) => {
    try {
        carthelper.OrderStatus(req.query, 'Delivered')
        res.json({ status: true })
    } catch (error) {
        res.redirect('/404')
    }
}
exports.salesreport = (req, res) => {
    try {
        carthelper.getAllorder().then((data) => {
            console.log(data[0].products);
            res.render('reports', { data })
        })
    } catch (error) {
        res.redirect('/404')
    }

}
exports.weeklyreport = async (req, res) => {
    try {
        let weeklyorder = await carthelper.OrderDate(week)
        res.render('reports-weekly', { weeklyorder })
    } catch (error) {
        res.redirect('/404')
    }
}
exports.monthlyreport = async (req, res) => {
    try {
        let monthlyorder = await carthelper.OrderDate(month)
        res.render('reports-monthly', { monthlyorder })
    } catch (error) {
        res.redirect('/404')
    }
}
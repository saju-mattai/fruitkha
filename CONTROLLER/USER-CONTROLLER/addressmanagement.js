const { resolveInclude } = require('ejs');
var express = require('express');
const { response } = require('../../app');
var router = express.Router();
var userhelper = require('../../helpers/user-helper')
var productview = require('../../helpers/user-shopcardview');
var addresshelper = require('../../helpers/Address-helper')
var objectId = require('mongodb').ObjectId
const { ObjectID } = require('bson')
const config = require('../../config/otp');
const { Db } = require('mongodb');
const client = require("twilio")(config.accountSID, config.authToken)
let Logerr = false
let blockerr = false
let userexist = false
let mailerr = false
let mobilerr = false


exports.AddressManagement = async (req, res) => {
    try {
        if (req.session.user) {
            let user = req.session.user
            let validuser = await addresshelper.finduser(req.session.user._id)
            res.render('Addressmanagement', { validuser,user })
        }
    } catch (error) {
        res.redirect('/404')
    }
    

}
exports.AddressManagementpost = (req, res) => {
    try {
        if (req.session.user) {
            addresshelper.Inaddress(req.body, req.session.user._id).then((response))
            res.redirect('/address-management')
    
        }
    } catch (error) {
        res.redirect('/404')
    }
  
}
exports.editaddress = (req, res) => {
    try {
        let user = req.session.user
        addresshelper.findAddress(req.params.id).then((data) => {
            res.render('edit-address', { data ,user})
        })
    } catch (error) {
        res.redirect('/404')
    }
   

}
exports.editaddressPost = (req, res) => {
    try {
        addresshelper.updateAddress(req.params.id, req.body).then((data) => {
            res.redirect('/address-management')
        })
    } catch (error) {
        res.redirect('/404')
    }
    
}
                                            //deleteeeeeeeeeeeeeeeeee
exports.deleteaddress = (req, res) => {
    try {
        addresshelper.deleteAddress(req.query.id).then((response) => {
            res.redirect('/address-management')
        })
    } catch (error) {
        res.redirect('/404')
    }
  
}
exports.addnewAddress = (req, res) => {
    let user = req.session.user
       res.render('add-new-address',{user})
}
exports.errorpage = (req, res) => {
    res.render('404')
}
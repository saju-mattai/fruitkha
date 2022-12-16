const { resolveInclude } = require('ejs');
var express = require('express');
 const { response } = require('../../app');
var router = express.Router();
var userhelper = require('../../helpers/user-helper')
var productview = require('../../helpers/user-shopcardview');
var objectId = require('mongodb').ObjectId
const { ObjectID } = require('bson')
const config = require('../../config/otp')
const client = require("twilio")(config.accountSID,config.authToken)
let Logerr = false
let blockerr=false
let userexist=false
let mailerr=false
let mobilerr=false


exports.Contact=(req,res)=>{
    res.render('contact');
}
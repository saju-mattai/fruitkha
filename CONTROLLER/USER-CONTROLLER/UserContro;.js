const { resolveInclude } = require('ejs');
var express = require('express');
const { response } = require('../../app');
var router = express.Router();
var userhelper = require('../../helpers/user-helper')
var productview = require('../../helpers/user-shopcardview');
var carthelper = require('../../helpers/carthelper')
var db = require('../../config/connection')
var collection = require('../../config/collection')
var objectId = require('mongodb').ObjectId
const { ObjectID } = require('bson')
const config = require('../../config/otp');
const { SyncListPermissionPage } = require('twilio/lib/rest/sync/v1/service/syncList/syncListPermission');
const client = require("twilio")(config.accountSID, config.authToken)
const orderid = require("../../helpers/carthelper")
let Logerr = false
let blockerr = false
let userexist = false
let mailerr = false
let mobilerr = false
let passErr = false
const paypal = require('paypal-rest-sdk');
const { Db } = require('mongodb');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AWyoUzhrqZyH5sRbpc4OVSKhOy2d4ZcETJNvuhiZLP5eTIDjVPlg3fxL_NF-qK-kI3R-nNhRJOSkVThz',
  'client_secret': 'EHmbTWWonoupsmAJZ-NsiIrboClzqb9goWvC_PG96y8RCYHraTRk5XeRBuHb8OlROrJWFMRfvZZCfdfz'
});



exports.UserHome = async (req, res) => {
  try {
    let user = req.session.user
    let banner = await db.get().collection(collection.banner).find().toArray()
   
    if (req.session.user) {
      let validuser = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: user.Email })

      if (validuser.loginstatus) {
        productview.getProductDetails().then((product) => {      
          res.render('index_2', { user, product ,banner});
        })
      } else {

        res.redirect("/logout")
      }
    } 
    else {
      productview.getProductDetails().then((product) => {
        res.render('index_2', { user, product,banner });
      })
    }
  } catch (error) {
    res.redirect('/404')
  }


}
exports.UserSignup = (req, res) => {
  res.render('signup', { mailerr, mobilerr });
  mailerr = false
  mobilerr = false
}
exports.UserSignupPost = (req, res) => {
  try {
    userhelper.doSignup(req.body)
    userhelper.validMail(req.body).then((mail) => {
      userhelper.validMobile(req.body).then((phone) => {
        if (mail) {
          mailerr = true
          res.redirect('/signup')
        } else if (phone) {
          mobilerr = true
          res.redirect('/signup')
        } else {
          res.redirect('/login')
        }
      })
    })

  } catch (error) {
    res.redirect('/404')
  }
}
exports.UserLogin = (req, res) => {
  try {
    if (req.session.LoggedIn) {
      res.redirect('/')
    } else {
      console.log(req.session.Logerr);
      res.render('login', { Logerr, blockerr });
      Logerr = false
      blockerr = false
      console.log(req.session.Loger);
    }
  } catch (error) {
    res.send("SORRY SOMETHING WENT WRONG")
  }
}
exports.UserLoginPost = (req, res) => {
  userhelper.doLogin(req.body).then((response) => {
    try {
      if (response.status) {
        if (response.user.loginstatus == true) {
          req.session.LoggedIn = true
          req.session.user = response.user
          res.redirect('/')
        } else {
          blockerr = true
          res.redirect('/login')
        }
      } else {
        Logerr = true
        res.redirect('/login')
      }

    } catch (error) {
      res.redirect('/404')
    }
  })
}
exports.LogOut = (req, res) => {
  req.session.destroy()
  res.redirect('/')
}
exports.paypal = async (req, res) => {
  let totalprice = req.session.totalprice
  res.render('paypal', { totalprice, user: req.session.user })
}
exports.paypost = (req, res) => {
  try {
    let totalprice = req.session.totalprice
    const create_payment_json = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
      },
      "transactions": [{
  
        "amount": {
          "currency": "USD",
          "total": totalprice
        },
        "description": "Hat for the best team ever"
      }]
    };
  
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            res.redirect(payment.links[i].href);
          }
        }
      }
    });
  } catch (error) {
    res.redirect('/404')
  }
 

};

exports.success = async (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;


  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": req.session.totalprice
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log((payment));
      db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(req.session.orderid) })
        .then((data) => {

        })

      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(req.session.orderid) },
        {
          $set: { status: 'placed' }
        }).then((data) => {

        })
      res.redirect("/order-details")
    }
  });
};

exports.cancel = (req, res) => res.send('Cancelled');


exports.razorpayPost = (req, res) => {
  try {
    carthelper.verifyPayment(req.body).then(() => {
      carthelper.changePaymentStatus(req.body['order[order][receipt]']).then(() => {
        res.json({ status: true })
      })
  
    }).catch((err) => {
     
      res.json({ status: false })
    })
  } catch (error) {
    res.redirect('/404')
  }
 
}
exports.profile = async (req, res) => {
  try {
    if (req.session.user) {
      let user = await userhelper.findUser(req.session.user._id)
      let wallet = await userhelper.findwallet(req.session.user._id)
      res.render('profile', { user, passErr, wallet })
      passErr = false
    } else {
      res.redirect('/')
    }
  } catch (error) {
    res.redirect('/404')
  }
  
}
exports.changepasswordpost = (req, res) => {
  try {
    userhelper.changePassword(req.body, req.session.user._id).then((response) => {
      if (response === true) {
        passErr = false  
      } else {
        passErr = true 
      }
      res.redirect('/profile')
    })
  } catch (error) {
    res.redirect('/404')
  }
 
}
var db = require('../config/connection')
var collection = require('../config/collection')
const { ObjectID } = require('bson')
const { response } = require('../app')
var objectId = require('mongodb').ObjectId

module.exports = {

    addCoupon: (details) => {
        return new Promise(async (resolve, reject) => {
            let CouponExist = await db.get().collection(collection.COUPON_COLLECTION).findOne(

                { CouponCode: { $regex: '.*' + details.CouponCode + '.*', $options: 'i' } }
            )
            if (CouponExist) {
                resolve(CouponExist)
            } else {
                let coupon = await db.get().collection(collection.COUPON_COLLECTION).insertOne(details)
                resolve(coupon)
            }
        })
    },
    findCoupon: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).find().sort({ _id: -1 }).toArray().then((data) => {
                resolve(data)
            })

        })
    },
    deleteCoupon: (proId) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: objectId(proId) }).then((data) => {
                resolve(data)

            })
        })
    },
    findCouponApply: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).findOne({ CouponCode: details.Coupon }).then((response) => {
                resolve(response)
                console.log(response);
            })
        })
    },
    existFindcoupon: (userId, coupon) => {

        return new Promise(async (resolve, reject) => {

            let couponFind = await db.get().collection(collection.COUPON_COLLECTION).findOne({ CouponCode: coupon.CouponCode, 'user.user': objectId(userId) })
            resolve(couponFind)
        })
    }

}
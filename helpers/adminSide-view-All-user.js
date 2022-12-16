var db = require('../config/connection')
var collection = require('../config/collection')
const { ObjectId } = require('mongodb')

module.exports={
    getAllUser:()=>{
        return new Promise((resolve, reject) => {
            let  user= db.get().collection(collection.USER_COLLECTION).find().sort({_id:-1}).toArray()
            resolve(user)
            })
    },
    blockuser:(details)=>{
        return  new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).update({_id:ObjectId(details)},
            {
                $set:{
                    loginstatus:false
                }
            })
        })
    },
    unblock:(details)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).update({_id:ObjectId(details)},
            {
                $set:{
                    loginstatus:true
                }
            })
        })
    }

}
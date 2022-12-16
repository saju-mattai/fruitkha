var db = require('../config/connection')
var collection = require('../config/collection')
const { ObjectId } = require('mongodb')
const { response } = require('../app')


module.exports={
    
    Inaddress:(details,userId)=>{
        // console.log('ADDRESS DETAILS');
        // console.log(details.Name);
        let obj={
            id:ObjectId(),
            name:details.Name,
            email:details.Email,
            mobile: details.Phone,
            address: details.Address,
            pincode: details.Pin,
        }
       
       
        // address=[obj]
        return new Promise(async(resolve, reject) => {
            let address=await db.get().collection(collection.ADDRESS_COLLECTION).findOne({userId:ObjectId(userId)})
            if(address){
                db.get().collection(collection.ADDRESS_COLLECTION)
                .updateOne({userId:ObjectId(userId)},
                {
                    $push:{Address:obj}
                }).then((response)=>{
                    resolve()
                
                })
                

            }else
            {
                let userObj={
                    userId:ObjectId(userId),
                    Address:[obj]
                }
                db.get().collection(collection.ADDRESS_COLLECTION).insertOne(userObj).then((response)=>{
                    resolve(response)
                })
            }



            
        })
    },
    finduser:(userId)=>{
        // console.log(userId);
        // console.log('kkkkkkkkk');
        return new Promise(async(resolve, reject) => {
         let result=await   db.get().collection(collection.ADDRESS_COLLECTION).aggregate([
            {
                $match:
                {
                    userId:ObjectId(userId)
                }
            },
            {
                $unwind:'$Address'
            },
            // {
            //     $project:
            //         {Address:1}
                
            // }
         ]).toArray()
         console.log(';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;');
         console.log(result)
                resolve(result)
            })
    
    },
    findAddress:(Id)=>{
        // console.log(Id);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).aggregate([
               
                {
                    $unwind:'$Address'
                },
                {
                    $match:{
                        "Address.id": ObjectId(Id)
                    }
                },
                
            ]).toArray().then((response)=>{
                // console.log(response);
               resolve(response)
            })
       
    })
},
updateAddress:(addressId,details)=>{
    
    return new Promise((resolve, reject) => {
        db.get().collection(collection.ADDRESS_COLLECTION).updateOne({'Address.id':ObjectId(addressId)},
        {
            $set:{
               'Address.$.name':details.Name,
                'Address.$.email':details.Email,
                'Address.$.mobile':details.Phone,
                'Address.$.address':details.Address,
                'Address.$.pincode':details.Pin
            }
        }).then((response)=>{
           
            resolve(response)
    })
    
    })
},
deleteAddress:(addressId)=>{
    return new Promise((resolve, reject) => {
        db.get().collection(collection.ADDRESS_COLLECTION).updateOne({'Address.id':ObjectId(addressId)},
        {
            $pull:{Address:{id:ObjectId(addressId)}}
        }
        ).then((response)=>{
            console.log(response);
            console.log('llllllllllllllllllllllllloo');
            resolve(response)
        })
           
        })
}
}
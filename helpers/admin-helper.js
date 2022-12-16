var db=require('../config/connection')
var bcrypt=require('bcrypt')
const collection = require('../config/collection')

module.exports={
    doSignup:((userdata)=>{
        return new Promise(async(resolve, reject) => {
            userdata.Password=await bcrypt.hash(userdata.Password,10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(userdata).then((response)=>{
                resolve(response)
            })
        })

    }),
    doLogin:((userdata)=>{
        
        return new  Promise (async(resolve,reject)=>{
            let response={}
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:userdata.Email})
            if(admin){
                bcrypt.compare(userdata.Password,admin.Password).then((status)=>{
                    if(status){
                        console.log('login succuses');
                    response.admin=admin
                    response.status=true
                    resolve(response)
                    }else{
                        console.log('login failed');
                        resolve({status:false})
                    }
                })
            }else{
                console.log('login failedgggggggggggg');
                resolve({status:false})
            }
        })
    }),
    validAdmin:(data)=>{
        return new Promise(async (resolve, reject) => {
            let Email=true
             let mail=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:data.Email})
             if(mail){
                Email=true
                resolve(Email)
             }else{
                Email=false
                resolve(Email)
             }
        })
    }

}
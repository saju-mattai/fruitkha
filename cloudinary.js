const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'dejujijss', 
  api_key: '684286445686639',  
  api_secret: 'i2OaM0GfcOrNwhS-ykQGy8Cq6OY'
})

exports.uploads = (file, folder) => {
    return new Promise(resolve => {
        cloudinary.uploader.upload(file, (result) => {
            resolve({
                url: result.url,
                id: result.public_id
            })
        }, {
            resource_type: "auto",
            folder: folder
        })
    })
}
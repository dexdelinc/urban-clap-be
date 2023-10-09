require("dotenv").config();
require("../../db/connection");
const express = require("express");
const cors = require('cors');
const ShopProduct = require("../../model/shopProduct");
const ShopUser = require("../../model/shopUser");
const app = express();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors())

// Create a shopProduct

const createShopProduct = async (req, res) => {
    try {
        let token = req.headers['x-access-token']
       
        let decoded = await jwt.verify(token, process.env.TOKEN_KEY);
        const id = decoded.id

         const storage = multer.diskStorage({
           destination: ("./ShopProductImage" + "/" + id),
           filename: (req, file, cb) => {
             cb(
               null,
               Date.now() +
                 path.extname(
                   file.originalname + "." + file.mimetype.split("/")[1]
                 )
             );
           },
         });

         const upload = multer({ storage: storage }).single("file");
        // Get user input
         upload(req, res, async (err) => {
           const fileName = req.file.path;
           const filetype = req.file.mimetype.split("/");

           const { name, price, quantity, description } = req.body;
           if (!(name, quantity, price)) {
             return res.status(400).send("All input is required");
           }
           // check if user already exist
           // Validate if user exist in our database
           const getUser = await ShopUser.findOne({ _id: { $eq: id } });

           const shop = getUser.shop;
           //Encrypt user password
           var img = fs.readFileSync(req.file.path);
           var encode_img = img.toString("base64");
           const image = {
             data: new Buffer.from(encode_img, "base64"),
             contentType: req.file.mimetype,
           };
           // Create user in our database
           const shopProduct = await ShopProduct.create({
             name: name,
             price: price,
             basePrice: price,
             quantity: quantity,
             description: description,
            //  image: image,
             shop: shop,
             user: getUser,
             imagePath: fileName,
           });
           if (shopProduct) {
             return res
               .status(201)
               .json({ message: "Product add Successfully", shopProduct });
           } else {
             return res.status(409).send({ message: "something went wrong" });
           }
         });
 } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something Went Wrong" })

    }
}
//get Shop product details
const getShopProduct = async (req, res) => {
    try {
        let token = req.headers['x-access-token']
        let decoded = jwt.verify(token, process.env.TOKEN_KEY);
        let id = decoded.id
        const getUser = await ShopUser.find({ _id: { $eq: id } })
        if (getUser !== null) {
            const getShopProduct = await ShopProduct.find({ user: { $eq: id } })
            return res.status(200).json({getShopProduct})
        }
        if (!getUser) {
            return res.status(400).json({ message: "Product not Exist" })
        }
    } catch (error) {
        return res.status(500).json({ message: "Something Went Wrong" })
    }
}
//  get shop product by shop id
const getShopProductById=async (req,res)=>{
    try{
        const {shopUser_id,shop_id}=req.body
const getProduct=await ShopProduct.find({$and:[
    {user:shopUser_id},{shop:shop_id}
]})
if(getProduct!==null){
    res.status(200).json(getProduct)
}

    }catch(err){
        console.log(err);
    }
}








//update Shop product

const updateShopProduct = async (req, res) => {
    try {
        const { name, description,image, quantity, price } = req.body;

        let token = req.headers['x-access-token']
        let decoded = jwt.verify(token, process.env.TOKEN_KEY);
        let id = decoded.id
        const getUser = await ShopUser.findOne({ _id: { $eq: id } })
        const getShopProduct = await ShopProduct.findOne({ _id: { $eq: getUser._id } })
        const updateShopProduct = await ShopProduct.updateOne({ _id: { $eq: getShopProduct._id } }, {
            $set: {
                name: name,
                price: price,
                quantity: quantity,
                description:description
            }
        }, { new: true })
        if (updateShopProduct.modifiedCount) {
            res.status(200).json({ message: "Your ShopProduct has been updated successfully",updateShopProduct });
        }
        else {
            res.status(400).send("User Update Failed");
        }

    } catch (error) {
        return res.status(500).json({ message: "Something Went Wrong" })
    }
}

const updateShopProductStatus = async (req, res) => {
    try {
        const { status, p_id} = req.body;

        let token = req.headers['x-access-token']
        let decoded = jwt.verify(token, process.env.TOKEN_KEY);
        let id = decoded.id
        const getUser = await ShopUser.findOne({ _id: { $eq: id } })
        const updateShopProduct = await ShopProduct.updateOne({ _id:  p_id }, {
            $set: {
                status: status,                
            }
        }, { new: true })
        if (updateShopProduct.modifiedCount) {
            res.status(200).json({ message: "Your ShopProductStatus has been updated successfully" });
        }
        else {
            res.status(400).json({message:"ShopProductStatus Update Failed"});
        }

    } catch (error) {
        return res.status(500).json({ message: "Something Went Wrong" })
    }
}


const deleteShopProduct = async (req, res) => {
    try {
        const {p_id}=req.body

        let token = req.headers['x-access-token']
        let decoded = jwt.verify(token, process.env.TOKEN_KEY);
        let id = decoded.id
        const getUser = await ShopUser.findOne({ _id: { $eq: id } })
        const getShopProduct = await ShopProduct.find({ phone: { $eq: getUser.phone} })

        const deleteShopProduct = await ShopProduct.deleteOne({ _id: p_id})

        if (deleteShopProduct) {
            res.status(200).json({ message: "ShopProduct deleted successfully" })
        }
        else {
            res.status(400).send("ShopProduct delete failed")

        }
    } catch (error) {
        return res.status(500).json({ message: "Something Went Wrong" })
    }
}

module.exports = { createShopProduct, getShopProduct, updateShopProduct, deleteShopProduct, updateShopProductStatus ,getShopProductById}


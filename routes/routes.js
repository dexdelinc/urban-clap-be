const express = require("express");
const router = express.Router();
const createUser = require("../controllers/signup");
const login = require("../controllers/login");
const userData = require("../controllers/user");
const auth = require("../middleware/auth");
const service = require("../controllers/service");
const shop = require("../controllers/shop");
const getserviceUser = require("../controllers/getserviceUser");
const createShopUSer = require("../controllers/shopUser/shopSignup");
const ShopUSerLogin = require("../controllers/shopUser/shopLogin");
const shopUserData = require("../controllers/shopUser/shopUser");
const MakePayment = require("../controllers/payment/razorpay");
const PaymentRecord = require("../controllers/payment/createPayHistory");
const ShopProduct = require("../controllers/shopProduct/shopProduct");
const Order = require("../controllers/order/order");
const Common = require("../controllers/common/common");
const Fcm=require("../controllers/fcm/fcm")
// For Customer
const Customer = require("../controllers/customer/customer");
const Employee = require("../controllers/employee/employee");
// for payouts
const Payout = require("../controllers/payout");



const app = express();

app.use(express.json({ limit: "50mb" }));

router.use("/serviceImage", express.static("./serviceImage"));
router.post("/signup", createUser);

// *****************************Route for document upload (serviceUser)
router.use("/serviceDoc", express.static("./serviceDoc"));
router.post("/uploadServiceDoc", auth, userData.uploadServiceDoc);
router.get("/getServiceDoc", auth, userData.getServiceDoc);

router.post("/login", login);
router.get("/profile", auth, userData.getUserData);
router.post("/service-provider-user", userData.serviceProviderUser);
router.get("/profileS", userData.getServiceData);
router.patch("/profile", auth, userData.updateUserData);
router.patch("/profileP", auth, userData.updatePassword);
router.patch("/changeServiceAvalStatus", auth, userData.updateAvalStatus);
router.delete("/profile", auth, userData.deleteUser);
// updateTempLocation for delevery boy
router.patch("/updateTempLocation", auth, userData.updateTempLocation);


//for service status

router.post("/services", service.getServiceData);

// For Shop status or get shop
router.post("/shops", shop.getShopData);

// For user, who take the service
router.post("/getserviceUser", getserviceUser.creategetserviceUser);

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@?

// shop user all routes

// *****************************Route for document upload (serviceUser)
router.use("/shopDoc", express.static("./shopDoc"));
router.post("/uploadShopDoc", auth, shopUserData.uploadShopDoc);
router.get("/getShopDoc", auth, shopUserData.getShopDoc);

router.use("/shopImage", express.static("./shopImage"));
router.post("/shop-user-signup", createShopUSer);
router.post("/shop-user-login", ShopUSerLogin);
router.post("/shop-provider-user", shopUserData.shopProviderUser);
router.get("/shop-user-profile", auth, shopUserData.getShopUserData);
router.patch("/changeShopAvalStatus", auth, shopUserData.updateAvalStatus);
//for adding bank
router.post("/addBank", auth, shopUserData.addBank);
router.post("/shopWithdrawl",auth,shopUserData.shopWithdrawl)

// for making a payment Routes
router.get("/payment", MakePayment.createOrder);
router.post("/orderPayment", MakePayment.createOrderPay);
router.post("/payment-sheet", MakePayment.paymentSheet);
// router.post("/payment/cancel", MakePayment.paymentCancel);
// router.post("/payment/success", MakePayment.paymentSuccess);

// payout request >>>>>>>>>>>>>>>>>>
router.get("/getpayoutRequest", auth,Payout.getpayoutRequest);
router.post("/payoutRequest",auth, Payout.payoutRequest);




router.post("/payment-record", auth, PaymentRecord.createPaymentUser);
router.get("/get-user-payment-record", auth, PaymentRecord.getPaymentData);

// For making  Product Routes
router.use("/ShopProductImage", express.static("./ShopProductImage"));
router.post("/create-shopProduct",auth,ShopProduct.createShopProduct);
router.get("/get-shopProduct", auth, ShopProduct.getShopProduct);
router.patch("/update-shopProduct", auth, ShopProduct.updateShopProduct);
router.post("/delete-shopProduct", auth, ShopProduct.deleteShopProduct);
router.patch(
  "/update-shop-product-status",
  auth,
  ShopProduct.updateShopProductStatus
);
router.post("/get-shopProductById", ShopProduct.getShopProductById);

// routes for Order
router.post("/create-order", Order.createOrder);
router.post("/get-orderByPhone", Order.getOrderByPhone);
router.post("/get-orderById", Order.getOrderById);
router.get("/get-orderauthById", auth, Order.getAuthOrderById);
router.post("/update-order-status", auth, Order.updateShopOrderStatus);
router.post("/get-orderProduct", auth, Order.getOrderProduct);
router.post("/update-orderProduct", auth, Order.updateShopOrder);
// #orderpayment
router.post("/orderPaymentRecord",auth,Order.createPaymentOrder)
// Get nearest delivery provider User
router.post("/deliveryProviderUser", auth, Order.deliveryProviderUser);
router.get("/getOrderForCustomer", auth, Order.getOrderForCustomer);
//update delivery status

router.post("/updateDeliveryStatus", auth, Order.updateDeliveryStatus);
//FCM
router.post("/fcm", Fcm.fcm);
// add delivry boy to order
router.patch("/addDeliveryBoy", auth, Order.addDeliveryBoy);
// get order request by delivery boy
router.get("/getOrderForDeliveryBoy", auth, Order.getOrderForDeliveryBoy);
// accept order by delivery boy
router.patch("/acceptOrderByDeliveryBoy", auth, Order.acceptOrderByDeliveryBoy);
// get delivery boy by id for order tracking
router.post("/getDeliveryBoyById",auth,userData.getDeliveryBoyById)







// routes for customer
router.post("/create-customer", Customer.createCustomer);
router.post("/customer-login", Customer.Customerlogin);
router.get("/get-customer", Customer.getCustomer);

// routes for employee employeeImage
router.use("/employeeImage", express.static("./employeeImage"));
router.post("/employee-register", Employee.createEmployee);
router.post("/employee-login", Employee.Employeelogin);
router.get("/get-employee", Employee.getEmployee);

// upload employee doc   
router.use("/employeeDoc", express.static("./employeeDoc"));
router.post("/uploadEmployeeDoc", auth, Employee.uploadEmployeeDoc);
router.get("/getEmployeeDoc", auth, Employee.getEmployeeDoc);
//route for common
// aegtAd93178490535029
router.get("/getChargesInformation",Common.getCharges)
router.post("/cashFree",auth,MakePayment.cashFree)
router.get("/paytm",MakePayment.paytm)
module.exports = router;

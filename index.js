const http = require("http");
const app = require("./app");
const server = http.createServer(app);
const bodyParser=require("body-parser")
const router= require("./routes/routes")
const adminRoutes=require('./routes/adminRoutes')

app.use(bodyParser.json())

// route
app.use(router)
console.log("hello!!!!!!!!!!!!!!");
app.use(adminRoutes)
const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  module.exports = app;
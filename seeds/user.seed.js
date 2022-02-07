let userSchema = require("../models/user.model");

const { connection } = require('../connection');
const { ADMIN } = require("../constants/roles.constant");

connection.once("open", async () => {
  console.log("*** SEED INIT ***");

  const privateadmin1 = await userSchema.findOne({ type: ADMIN, username: "privateadmin" })
  if (!privateadmin1) {
    const admin1 = new userSchema({
      "username": "privateadmin",
      "password": "privateadmin",
      "email": "privateadmin@gmail.com",
      "type": ADMIN,
      "profile": {
        "fullName": "Mohamed Ali",
      }
    });
    await admin1.save()
    await userSchema.findOneAndDelete({ type: ADMIN, username: "admin" })
  }
})


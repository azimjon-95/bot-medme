const { Schema, model } = require("mongoose");

const clientSchema = new Schema({
  idNumber: { type: String },
  clinicId: { type: String },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    region: { type: String, required: true, default: "Namangan viloyati" },
    district: { type: String, required: true, default: "online" },
    quarter: { type: String, required: true, default: "online" },
  },
  year: { type: String, required: true },
  treating: { type: Boolean, default: false },
  debtor: { type: Boolean, default: false },
  totalPrice: { type: Number, default: 0 },
  totalAmountPaid: { type: Number, default: 0 },
  gender: { type: String },

});

const ClientModel = model("client", clientSchema);
module.exports = ClientModel;

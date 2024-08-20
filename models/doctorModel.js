const mongoose = require("mongoose");


const priceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    newClient: { type: Number, default: 0 },
    treatingPatent: { type: Number, default: 0 },
  },
  { _id: true }
);

const doctorSchema = new mongoose.Schema(
  {
    idNumber: { type: String },
    clinicId: { type: String },
    firstName: { type: String, required: [true, "first name is required"] },
    lastName: { type: String, required: [true, "last name is required"] },
    phone: { type: String, required: [true, "phone no is required"] },
    roomNumber: { type: String, required: [true, "email is required"] },
    address: {
      region: { type: String, required: true, default: "Namangan viloyati" },
      district: { type: String, required: true },
      quarter: { type: String, required: true },
    },
    specialization: { type: String },
    experience: { type: String },
    feesPerCunsaltation: { type: Number, default: 0 },
    secondPrice: { type: Number, default: 0 },

    extraTreatment: [
      {
        key: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        extraPrice: { type: Number, required: true }
      }
    ],

    type: { type: String },
    getSalary: { type: Boolean, default: false },
    login: { type: String, required: [true, "login is required"] },
    password: { type: String, required: [true, "password is require"] },
    docORrecep: { type: String, required: [true, " or reception is require"] },
    dateOfBirth: { type: String },
    roomPercent: { type: Number },
    percent: { type: Number },
    workTime: { type: Object },
    checkList: { type: String },
    workSchedule: { type: String },
    salary: { type: Number },
    lifeType: { type: Boolean },
    admission: { type: Boolean, default: false }, // Bemor qabul qilishni to'xtatish
    userType: { type: String, default: "doctor" },
  },
  { timestamps: true }
);

const doctorModel = mongoose.model("doctors", doctorSchema);
module.exports = doctorModel;


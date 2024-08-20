const { Schema, model } = require("mongoose");

const schema = new Schema({
  clinicId: { type: String },
  clientID: { type: String },
  clientFullname: { type: String },
  clientPhone: { type: String },
  address: {
    region: { type: String, required: true, default: "Namangan viloyati" },
    district: { type: String, required: true, default: "online" },
    quarter: { type: String, required: true, default: "online" },
  },
  doctorPhone: { type: String },
  debtor: { type: Boolean, default: false },
  dispatchCheck: { type: String },
  payState: { type: Boolean },
  secondary: { type: Boolean },
  online: { type: Boolean, default: false },
  paySumm: { type: Number },
  doctorIdNumber: { type: String },
  birthday: { type: String },
  doctorFullname: { type: String },
  doctorType: { type: String },
  temperature: { type: String },
  weight: { type: Number },
  height: { type: Number },
  analysis: { type: String },
  urgentCheck: { type: String },
  sickname: { type: String },
  view: { type: Boolean, default: false },
  day: { type: String },
  month: { type: String },
  queueNumber: { type: Number },
  writed_at: { type: String },
  writed_doctor: { type: String },
  patientStatus: { type: String },
  retseptList: { type: String },
  gender: { type: String },
  step: { type: String, default: '' },
  chat_id: { type: Number, default: null }
});

const StoriesDB = model("stories", schema);

module.exports = StoriesDB;

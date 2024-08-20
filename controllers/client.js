const ClientModel = require("../models/clientModel");
const StoriesDB = require("../models/storiesModel");

const moment = require("moment");

// CREATE CLIENT || NEW CLIENT
let time = new Date();
let todaysTime =
  time.getDate() + "." + (time.getMonth() + 1) + "." + time.getFullYear();

let today = moment(todaysTime, "DD.MM.YYYY").format("DD.MM.YYYY");

const newClient = async (req) => {
  try {
    const client = req?.body;
    const phone = client?.phone;

    const { stories, orderDoctorID, ...data } = client;
    const todaysClients = await StoriesDB.find({
      day: stories[0]?.day || today,
      doctorIdNumber: orderDoctorID,
    });

    let exactClient = await ClientModel.findOne({ phone: phone });
    if (exactClient) {
      const arr = stories?.map((story) => ({
        ...story,
        clientID: exactClient._id,
        queueNumber:
          story.doctorIdNumber === orderDoctorID
            ? todaysClients?.length + 1
            : 0,
      }));

      for (const item of arr) {
        await StoriesDB.create(item);
      }
      return {
        status: "existing",
        client: exactClient,
        stories: arr,
        queueLength: todaysClients?.length
      };
    }

    const newClient = await ClientModel.create(data);
    const arr = stories?.map((story) => ({
      ...story,
      queueNumber:
        story.doctorIdNumber === orderDoctorID ? todaysClients?.length + 1 : 0,
      clientID: newClient._id,
    }));

    for (const item of arr) {
      await StoriesDB.create(item);
    }
    return {
      status: "new",
      client: newClient,
      stories: arr,
      queueLength: todaysClients?.length
    };
  } catch (error) {
    console.log(error);
    throw new Error('Failed to create new client');
  }
};

module.exports = {
  newClient,
};







// const ClientModel = require("../models/clientModel");
// const StoriesDB = require("../models/storiesModel");

// const moment = require("moment");


// // CRATE CLIENT || NEW CLIENT
// let time = new Date();
// let todaysTime =
//   time.getDate() + "." + (time.getMonth() + 1) + "." + time.getFullYear();

// let today = moment(todaysTime, "DD.MM.YYYY").format("DD.MM.YYYY");

// const newClient = async (req) => {
//   try {
//     const client = req?.body;
//     const phone = client?.phone;

//     const { stories, orderDoctorID, ...data } = client;
//     const todaysClients = await StoriesDB.find({
//       day: stories[0]?.day || today,
//       doctorIdNumber: orderDoctorID,
//     });

//     let exactClient = await ClientModel.findOne({ phone: phone });
//     if (exactClient) {
//       const arr = stories?.map((story) => ({
//         ...story,
//         clientID: exactClient._id,
//         queueNumber:
//           story.doctorIdNumber === orderDoctorID
//             ? todaysClients?.length + 1
//             : 0,
//       }));

//       for (const item of arr) {
//         await StoriesDB.create(item);
//       }
//       return todaysClients;
//     }

//     const newClient = await ClientModel.create(data);
//     const arr = stories?.map((story) => ({
//       ...story,
//       queueNumber:
//         story.doctorIdNumber === orderDoctorID ? todaysClients?.length + 1 : 0,
//       clientID: newClient._id,
//     }));

//     for (const item of arr) {
//       await StoriesDB.create(item);
//     }
//     console.log(todaysClients);
//     return "Salom";
//   }
//   catch (error) { console.log(error); }
// };

// module.exports = {
//   newClient,
// };

const TelegramBot = require("node-telegram-bot-api");
const doctorModel = require("../models/doctorModel");
const ClinicBot = require("../models/botModel"); // Import the config model
const { newClient } = require("./client");

// Function to start the bot
const startBot = async () => {
  // MongoDB dan konfiguratsiyani olish
  const config = await ClinicBot.findOne();
  if (!config?.botToken) {
    console.error("Ma'lumotlar bazasida bot konfiguratsiyasi topilmadi.");
    return;
  }
  const clinicAddress = config.address;
  console.log(config?.botToken);
  // Botni yaratish
  const bot = new TelegramBot(config?.botToken, { polling: true });
  const userData = {};


  // Inline keyboard for main options
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🏥 Klinika haqida", callback_data: "info" },
          { text: "📅 Online qabul", callback_data: "doctors" },
        ],
      ],
    },
  };

  // Start command handler
  bot.onText(/\/start/, async (msg) => {
    const firstName = msg.chat.first_name;

    // Welcome message
    const welcomeMessage =
      `Salom, ${firstName}.\nBizning klinikamizga xush kelibsiz!\n\nQuyidagi tugmalar orqali klinika haqida ma'lumot va doktorlar qabuliga online navbat oling.`;

    // Check if clinicImageUrl exists
    if (config.clinicImageUrl) {
      try {
        // Send welcome message with photo
        await bot.sendPhoto(msg.chat.id, config.clinicImageUrl, {
          caption: welcomeMessage,
          reply_markup: inlineKeyboard.reply_markup,
        });
      } catch (error) {
        console.error("Error sending photo:", error.message);
      }
    } else {
      // Send welcome message without photo
      await bot.sendMessage(msg.chat.id, welcomeMessage, {
        reply_markup: inlineKeyboard.reply_markup,
      });
    }
  });

  // Callback query uchun funksiya
  bot.on("callback_query", async (callbackQuery) => {
    const action = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const Id = callbackQuery.id;

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      clinicAddress
    )}`;

    const Doctors = await doctorModel.find();
    const Data = Doctors.filter((item) => item.docORrecep === "doctor" && item.clinicId === config.clinicId);
    if (action === "info") {
      const infoMessage = "Bizning klinikamiz haqida ma'lumotlar\n...";
      await bot.sendChatAction(chatId, 'typing')
      await bot.sendMessage(chatId, infoMessage);
      return bot.answerCallbackQuery(Id)
    } else if (action === "doctors") {
      const doctorKeyboard = {
        reply_markup: {
          inline_keyboard: Data.map((doctor, index) => [
            {
              text: `${doctor.specialization}: ${doctor.firstName}  ${doctor.lastName}`,
              callback_data: `doctor_${index}`,
            },
          ]),
        },
      };
      await bot.sendChatAction(chatId, 'typing')
      await bot.sendMessage(chatId, "👉🏻 Mutaxassislikni tanlang", doctorKeyboard);
      return bot.answerCallbackQuery(Id)

    } else if (action.startsWith("doctor_")) {
      const doctorIndex = parseInt(action.split("_")[1]);

      const doctor = Doctors[doctorIndex];
      const formattedFees = new Intl.NumberFormat('en-US').format(parseInt(doctor.feesPerCunsaltation));
      const doctorMessage = `${doctor.firstName} ${doctor.lastName}\n${doctor.specialization}\n\n1. ${config.name} | 📍Xaritada\n🗓️ Qabul qilish vaqti:\n${sortDays(config.weeks)} | ${config.workStartTime}-${config.workEndTime}\nYa | Dam olish kuni\n🏷️ Dastlabki tashrif uchun narx:\n${formattedFees == 0 ? "Ko'rigdan so'ng malum bo'ladi." : formattedFees != 0 ? formattedFees + " soʻm" : ""}`;

      function sortDays(days) {
        const order = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
        return days.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      }

      const receptionButton = {
        text: "✍🏻 Qabulga yozilish",
        callback_data: `reception_${doctorIndex}`,
      };
      const xaritadaButton = { text: "📍Xarita", url: googleMapsUrl };

      // Combine both buttons into a single inline keyboard
      const inlineKeyboard = {
        reply_markup: {
          inline_keyboard: [[xaritadaButton, receptionButton]],
        },
      };

      // Send the message with the combined inline keyboard
      await bot.sendChatAction(chatId, 'typing')
      bot.sendMessage(chatId, doctorMessage, inlineKeyboard);
      return bot.answerCallbackQuery(Id)
    } else if (action === "back") {
      const updatedDoctorKeyboard = generateDoctorKeyboard();
      await bot.sendChatAction(chatId, 'typing')
      bot.sendMessage(chatId, "👉🏻 Mutaxassislikni tanlang", {
        reply_markup: updatedDoctorKeyboard,
      });
      return bot.answerCallbackQuery(Id)
    }
  });

  // Reception tugmasi uchun callback
  bot.on("callback_query", async (callbackQuery) => {
    const Doctors = await doctorModel.find();
    const action = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const doctorIndex = parseInt(action.split("_")[1]); // Tanlangan doktorni aniqlash
    const selectedDoctor = Doctors[doctorIndex]; // Tanlangan doktorni olish

    if (action.startsWith("reception_")) {
      // Bemorni ma'lumotlarini qabul qilish funktsiyasini chaqirish
      startPatientRegistration(bot, callbackQuery.message, selectedDoctor);
    }
  });

  async function sendMyComponent(chatId, text, options = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        bot.sendMessage(chatId, text, options).then(resolve);
      }, 300);
    });
  }

  function startPatientRegistration(bot, msg, selectedDoctor) {
    const chatId = msg.chat.id;
    userData[chatId] = {
      currentStep: 0,
      data: {},
      selectedDoctor: selectedDoctor,
    };

    const steps = [
      askForPhoneNumber,
      askForName,
      askForSurname,
      askForGender,
      askForBirthday,
      askForAppointmentDate,
      askForConfirmation
    ];

    function nextStep() {
      const user = userData[chatId];
      user.currentStep++;
      if (user.currentStep < steps.length) {
        steps[user.currentStep]();
      }
    }

    function askForPhoneNumber() {
      sendMyComponent(chatId, "👉🏻 Telefon raqamingizni kiriting").then(() => {
        bot.once("message", (msg) => {
          const phoneNumber = msg.text.match(/^(?:\+998)?[0-9]{9}$/);
          if (phoneNumber) {
            userData[chatId].data.phoneNumber = phoneNumber[0].startsWith('9') ? `+998${phoneNumber[0]}` : phoneNumber[0];
            nextStep();
          } else {
            sendMyComponent(chatId, "Telefon raqamni to'g'ri kiriting");
            askForPhoneNumber();
          }
        });
      });
    }

    function askForName() {

      sendMyComponent(chatId, "✍🏻 Ismingizni yozing:").then(() => {
        bot.once("message", (msg) => {
          userData[chatId].data.name = msg.text;
          nextStep();
        });
      });
    }

    function askForSurname() {
      sendMyComponent(chatId, "✍🏻 Familyangizni yozing:").then(() => {
        bot.once("message", (msg) => {
          userData[chatId].data.surname = msg.text;
          nextStep();
        });
      });
    }

    function askForGender() {
      const genderKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Erkak", callback_data: "gender_Erkak" }, { text: "Ayol", callback_data: "gender_Ayol" }]
          ]
        }
      };
      sendMyComponent(chatId, "👫 Jinsingizni tanlang:", genderKeyboard).then(() => {
        bot.once("callback_query", (callbackQuery) => {
          const selectedGender = callbackQuery.data.split("_")[1];
          userData[chatId].data.gender = selectedGender;
          nextStep();
        });
      });
    }

    function askForBirthday() {
      sendMyComponent(chatId, "📅 👉 Bemorning tug'ilgan sanasini kiriting \n\n Masalan, 12.12.2002").then(() => {
        bot.once("message", (msg) => {
          userData[chatId].data.birthday = msg.text;
          nextStep();
        });
      });
    }

    function askForAppointmentDate() {
      const today = new Date();
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const day = date.getDay();
        if (day !== 0) {
          const formattedDate = date.toLocaleDateString("en-GB").split("/").join(".");
          dates.push([{ text: formattedDate, callback_data: `date_${formattedDate}` }]);
        }
      }

      const splitDates = [];
      for (let i = 0; i < dates.length; i += 2) {
        splitDates.push(dates.slice(i, i + 2));
      }

      const inlineButtons = splitDates.map((row) => {
        return row.map((button) => {
          return { text: button[0].text, callback_data: button[0].callback_data };
        });
      });

      const inlineKeyboard = {
        reply_markup: {
          inline_keyboard: inlineButtons,
        },
      };

      sendMyComponent(chatId, "Bemor qabul kunini tanlang", inlineKeyboard).then(() => {
        bot.once("callback_query", (callbackQuery) => {
          const selectedDate = callbackQuery.data.split("_")[1];
          userData[chatId].data.date = selectedDate;
          nextStep();
        });
      });
    }

    function askForConfirmation() {
      const confirmationKeyboard = {
        reply_markup: {
          keyboard: [[{ text: "✅ Ha" }, { text: "❌ Yo'q" }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      };
      sendMyComponent(chatId, "Tasdiqlaysizmi?", confirmationKeyboard).then(() => {
        bot.once("message", (msg) => {
          const confirmation = msg.text.toLowerCase();
          if (confirmation === "✅ ha" || confirmation === "yes") {
            savePatientData();
          } else if (confirmation === "❌ yo'q" || confirmation === "no") {
            sendMyComponent(chatId, "Ro'yxatga olish bekor qilindi.");
          } else {
            sendMyComponent(chatId, "Noto'g'ri javob. Iltimos, qaytadan urinib ko'ring.");
            askForConfirmation();
          }
        });
      });
    }

    function savePatientData() {
      const time = new Date();
      const user = userData[chatId];
      const AllInfo = {
        clinicId: config?.clinicId,
        firstname: user.data.name,
        lastname: user.data.surname,
        phone: user.data.phoneNumber,
        year: user.data.birthday,
        gender: user.data.gender,
        orderDoctorID: user.selectedDoctor.idNumber,
        debtor: user.selectedDoctor.type === "analis" || user.selectedDoctor.type === "fizioterapiya",
        stories: [
          {
            clinicId: config?.clinicId,
            debtor: user.selectedDoctor.type === "fizioterapiya",
            doctorIdNumber: user.selectedDoctor.idNumber,
            birthday: user.data.birthday,
            gender: user.data.gender,
            doctorPhone: user.selectedDoctor.phone,
            day: user.data.date,
            online: true,
            month: time.toLocaleString("en-US", { month: "long" }),
            clientFullname: `${user.data.name} ${user.data.surname}`,
            clientPhone: user.data.phoneNumber.replace("+998", ""),
            doctorFullname: `${user.selectedDoctor.firstName} ${user.selectedDoctor.lastName}`,
            doctorType: user.selectedDoctor.specialization
          }
        ]
      };

      if (user.selectedDoctor.type !== "fizioterapiya") {
        AllInfo.stories[0].paySumm = user.selectedDoctor.feesPerCunsaltation;
        AllInfo.stories[0].doctorPrice = user.selectedDoctor.feesPerCunsaltation;
      }
      newClient({ body: AllInfo }).then((ress) => {

        const formatDate = (dateString) => {
          const [day, month, year] = dateString.split('.');
          const date = new Date(year, month - 1, day);
          const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
          const monthName = monthNames[date.getMonth()];
          return `${day}-${monthName} kuni sizni kutamiz`;
        };

        const finalMessage = `**Ma'lumotlar saqlandi!**\n\n **${user.data.name} ${user.data.surname}**\n **Sizning navbar raqamingiz: ${ress.stories[0].queueNumber}**\n\n **${formatDate(user.data.date)}**.`;
        sendMyComponent(chatId, finalMessage, { parse_mode: 'Markdown' });

      }).catch((error) => console.log(error));
    }

    // Initial call to start the first step
    steps[userData[chatId].currentStep]();
  }

  module.exports = { startBot };
};

startBot(); // Call the function to start the bot


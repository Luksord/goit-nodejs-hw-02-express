// const Contact = require("../models/model");

// const fetchContacts = () => {
//   return Contact.getAll();
// };

// const fetchContact = (id) => {
//   return Contact.findById({ _id: id });
// };

// const insertContact = ({ title, text }) => {
//   return Contact.create({ title, text });
// };

// // const updateContact = async ({ id, toUpdate }) => {
// //     const Contact = await Contact.findById({ _id: id });
// //     if(!contact) return null;
// //
// //     Object.keys(toUpdate).forEach((value) => {
// //         contact[value] = toUpdate[value];
// //     });
// //
// //     await contact.save();
// //
// //     return contact;
// // }

// const updateContact = async ({ id, toUpdate, upsert = false }) => {
//   return Contact.findByIdAndUpdate(
//     { _id: id },
//     { $set: toUpdate },
//     { new: true, runValidators: true, strict: "throw", upsert }
//   );
// };

// const removeContact = (id) => Contact.deleteOne({ _id: id });

// module.exports = {
//   fetchContacts,
//   fetchContact,
//   insertContact,
//   updateContact,
//   removeContact,
// };

const Contact = require("./models/model");

const fetchContacts = async () => {
  return Contact.find();
};

const fetchContact = (id) => {
  return Contact.findById({ _id: id });
};

const createContact = ({ name, email, phone }) => {
  return Contact.create({ name, email, phone });
};

const deleteContact = (id) => {
  return Contact.findByIdAndRemove({ _id: id });
};

const patchContact = (id, fields) => {
  return Contact.findByIdAndUpdate(
    { _id: id },
    { $set: fields },
    { new: true }
  );
};

module.exports = {
  fetchContacts,
  fetchContact,
  createContact,
  deleteContact,
  patchContact,
};

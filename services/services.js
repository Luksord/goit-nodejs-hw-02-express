const Contact = require("./models/contactModel");

const listContacts = async () => {
  return Contact.find();
};

const getContactById = (id) => {
  return Contact.findById({ _id: id });
};

const addContact = ({ name, email, phone }) => {
  return Contact.create({ name, email, phone });
};

const removeContact = (id) => {
  return Contact.findByIdAndRemove({ _id: id });
};

const updateContact = (id, fields) => {
  return Contact.findByIdAndUpdate(
    { _id: id },
    { $set: fields },
    { new: true }
  );
};

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
};

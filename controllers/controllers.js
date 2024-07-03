const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
} = require("../services/services");
const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  phone: Joi.number().integer().positive().required(),
  favorite: Joi.bool(),
});

const getContacts = async (req, res, next) => {
  try {
    const results = await listContacts();
    res.json({
      status: 200,
      data: { contacts: results },
    });
  } catch (err) {
    console.error("Error getting contacts list:", err);
    next(err);
  }
};

const getContact = async (req, res, next) => {
  const id = req.params.contactId;
  try {
    const result = await getContactById(id);
    if (result) {
      return res.json({
        status: 200,
        data: { contact: result },
      });
    }
    res.status(404).json({
      status: 404,
      message: "Not found",
    });
  } catch (err) {
    console.error("Error getting contact:", err);
    next(err);
  }
};

const createContact = async (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
  try {
    const result = await addContact(req.body);
    res.status(201).json({
      status: 201,
      data: { newContact: result },
    });
  } catch (err) {
    console.error("Error creating contact:", err);
    next(err);
  }
};

const deleteContact = async (req, res, next) => {
  const id = req.params.contactId;
  try {
    const result = await removeContact(id);
    if (result) {
      return res.json({
        status: 200,
        message: "Contact deleted",
      });
    }
    res.status(404).json({
      status: 404,
      message: "Not found",
    });
  } catch (err) {
    console.error("Error removing contact:", err);
    next(err);
  }
};

const update = async (req, res, next) => {
  const id = req.params.contactId;
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
  try {
    const result = await updateContact(id, req.body);
    if (result) {
      return res.json({
        status: 200,
        data: { newContact: result },
      });
    }
    res.status(404).json({
      status: 404,
      message: "Not found",
    });
  } catch (err) {
    console.error("Error updating contact:", err);
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  const id = req.params.contactId;
  const { error } = req.body;
  if (error) {
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
  try {
    const result = await updateContact(id, req.body);
    if (result) {
      return res.json({
        status: 200,
        data: { updatedContact: result },
      });
    }
    res.status(404).json({
      status: 404,
      message: "Not found",
    });
  } catch (err) {
    console.error("Error updating favorite status in contact:", err);
    next(err);
  }
};

module.exports = {
  getContacts,
  getContact,
  createContact,
  deleteContact,
  updated,
  updateStatus,
};

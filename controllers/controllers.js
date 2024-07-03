// const {
//   fetchContact,
//   fetchContact,
//   insertContact,
//   updateContact,
//   removeContact,
// } = require("../services/services");

// const getAllContacts = async (req, res, next) => {
//   try {
//     const contacts = await fetchContact();
//     res.json(tasks);
//   } catch (error) {
//     next(error);
//   }
// };

// const getContact = async (req, res, next) => {
//   try {
//     const contact = await fetchContact(req.params.id);
//     if (task) {
//       res.json({
//         ...task.toObject(),
//         html: task.htmlify(),
//       });
//     } else {
//       next();
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// const createContact = async (req, res, next) => {
//   const { title, text } = req.body;
//   try {
//     const result = await insertContact({ title, text });
//     res.status(201).json(result);
//   } catch (error) {
//     next(error);
//   }
// };

// const putContact = async (req, res, next) => {
//   const { id } = req.params;
//   try {
//     const result = await updateContact({
//       id,
//       toUpdate: req.body,
//       upsert: true,
//     });
//     res.json(result);
//   } catch (error) {
//     next(error);
//   }
// };
// const patchContact = async (req, res, next) => {
//   const { id } = req.params;
//   try {
//     const result = await updateContact({ id, toUpdate: req.body });
//     if (!result) {
//       next();
//     } else {
//       res.json(result);
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// const deleteContact = async (req, res, next) => {
//   const { id } = req.params;
//   try {
//     await removeContact(id);
//     res.status(204).send({ message: "Contact deleted" });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   getAllContacts,
//   getContact,
//   createContact,
//   patchContact,
//   putContact,
//   deleteContact,
// };

const {
  fetchContacts,
  fetchContact,
  createContact,
  deleteContact,
  patchContact,
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

const getAllContacts = async (req, res, next) => {
  try {
    const results = await fetchContacts();
    res.json({
      status: 200,
      data: { contacts: results },
    });
  } catch (err) {
    console.error("Error getting contacts list:", err);
    next(err);
  }
};

const getContactById = async (req, res, next) => {
  const id = req.params.contactId;
  try {
    const result = await fetchContact(id);
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

const addContact = async (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
  try {
    const result = await createContact(req.body);
    res.status(201).json({
      status: 201,
      data: { newContact: result },
    });
  } catch (err) {
    console.error("Error creating contact:", err);
    next(err);
  }
};

const removeContact = async (req, res, next) => {
  const id = req.params.contactId;
  try {
    const result = await deleteContact(id);
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

const updateContact = async (req, res, next) => {
  const id = req.params.contactId;
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
  try {
    const result = await patchContact(id, req.body);
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
    const result = await patchContact(id, req.body);
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
  getAllContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatus,
};

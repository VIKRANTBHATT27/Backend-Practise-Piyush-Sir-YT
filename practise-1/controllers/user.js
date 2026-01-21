const mongoose = require("mongoose");
const User = require('../models/user.js');

const { ObjectId } = mongoose.Types;

const getAllDBUsers = async (req, res) => {
     const allDbUsers = await Users.find({});
     return res.json(allDbUsers);
};

const getUserById = async (req, res) => {
     const Id = req.params.id;
     const user = await User.findOne({ _id: Id });

     if (!user) return res.status(404).send({ error: `no user found with id: ${Id}` });

     return res.json(user);
};

const updateUserById = async (req, res) => {
     try {
          const Id = req.params.id;

          if (!ObjectId.isValid(Id)) {
               return res.status(400).send({ msg: "Invalid request, invalid Id" });
          }

          const existingUser = await User.findOne({ _id: Id });
          if (existingUser !== null) {

               if (!req.body) return res.status(400).send({ error: 'No update data provided' });

               const updatedData = await User.findByIdAndUpdate(
                    Id,
                    { $set: req.body },
                    { new: true }
               );

               return res.status(200).send({ msg: "succesfully updated the user", id: Id, lastUpdated: updatedData.updatedAt.toLocaleString() });
          }
          else {
               return res.status(404).send({ msg: "no user found in DB", id: Id });
          }

     } catch (err) {
          console.error('Error Occurred: ', err);
          res.status(500).json({ error: 'Internal server error' });
     }
};

const deleteUserById = async (req, res) => {
     try {
          const Id = req.params.id;

          if (!ObjectId.isValid(Id)) {
               return res.status(400).send({ msg: "invalid user id" });
          }

          const deletedUser = await User.findByIdAndDelete(Id);

          if (!deletedUser) return res.status(404).send({ message: 'User not found, check the Id again' });

          return res.status(200).send({ status: "successfully deleted the user" });

     } catch (err) {
          return res.status(500).send({ status: "Internal Server Error", err });
     }

     res.json({ status: "successfully deleted the user" });
};

const createNewUser = async (req, res) => {
     const user = req.body;

     console.log(user);

     if (!user || !user.first_name || !user.gender || !user.email) {
          return res.status(400).send({ msg: 'all fields are required' });
     }

     const existingUser = await User.findOne({ email: user.email.trim().toLowerCase() });
     if (existingUser) {
          return res.status(409).send({ msg: "email Id is not unique" });
     }

     const result = await User.create({
          first_name: user.first_name.trim(),
          last_name: user.last_name.trim(),
          gender: user.gender.trim(),
          email: user.email.trim().toLowerCase(),
          job_title: user.job_title.trim()
     });

     res.status(201).send({ msg: "successfully created user", id: result._id });
};

module.exports = {
     getAllDBUsers,
     getUserById,
     updateUserById,
     deleteUserById,
     createNewUser
};
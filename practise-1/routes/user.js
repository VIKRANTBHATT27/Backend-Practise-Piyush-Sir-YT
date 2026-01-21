const express = require('express');
const router = express.Router();

const {
     getAllDBUsers,
     getUserById,
     updateUserById,
     deleteUserById,
     createNewUser
} = require('../controllers/user.js');

//RESTAPI
router.route('/')
     .get(getAllDBUsers)
     .post(createNewUser)

router.route('/:id')
     .get(getUserById)
     .patch(updateUserById)
     .delete(deleteUserById)

module.exports = router;
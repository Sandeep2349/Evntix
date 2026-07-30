const express = require("express");
const router = express.Router();
const {protect,admin} = require('../middleware/auth')
const {getAllEvents, getEventById, createEvent, updateEvent, deleteEvent} = require('../controllers/eventController')

//Get all Events
router.get('/',getAllEvents)

//Get EventById
router.get('/:id',getEventById);

//Create Element(Admin Only)
router.post('/',protect,admin,createEvent);

//Update Event (Admin only)
router.put('/:id',protect,admin,updateEvent);

//Delete Event(Admin Only)
router.delete('/:id',protect,admin,deleteEvent);

module.exports = router;
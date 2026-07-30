const Event = require('../models/Event');

// Controller functions for handling event-related requests
exports.getAllEvents = async (req, res) => {
    try {
        // 1. Check if a search query exists in the URL
        const keyword = req.query.search 
            ? {
                title: {
                    $regex: req.query.search,
                    $options: 'i', // 'i' makes it case-insensitive
                },
              }
            : {}; // If no search query, return an empty filter (fetch all)

        // 2. Fetch events matching the keyword
        // You can also add sorting here, e.g., .sort({ date: 1 })
        const events = await Event.find({ ...keyword }).sort({ date: 1 });
        
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Server error fetching events" });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createEvent = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      location, 
      category, 
      totalSeats, 
      ticketPrice, 
      imageurl, 
      image 
    } = req.body;

    // 1. Basic Validation
    if (!title || !date || !totalSeats) {
      return res.status(400).json({ message: "Please provide title, date, and totalSeats" });
    }

    // 2. Create Event
    const event = await Event.create({
      title,
      description,
      date,
      location,
      category,
      totalSeats,
      ticketPrice: ticketPrice || 0,
      
      // AUTO-SET: Defaults availableSeats to totalSeats when creating a new event
      availableSeats: req.body.availableSeats ?? totalSeats,
      
      imageurl: imageurl || image || '',
      
      // AUTO-SET: Gets admin ID directly from the protect middleware token
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event
    });

  } catch (error) {
    console.error("Create Event Error:", error.message);
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateEvent = async (req, res) => {
    const { title, description, date, location, category, totalSeats, availableSeats, ticketPrice, imageurl } = req.body;
    try{
        const event = await Event.findByIdAndUpdate(req.params.id, { title, description, date, location, category, totalSeats, availableSeats, ticketPrice, imageurl }, { new: true });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
